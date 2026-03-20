package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"

	"github.com/julienschmidt/httprouter"
	"github.com/opendatahub-io/autorag-library/bff/internal/constants"
	helper "github.com/opendatahub-io/autorag-library/bff/internal/helpers"
	"github.com/opendatahub-io/autorag-library/bff/internal/integrations/kubernetes"
	ps "github.com/opendatahub-io/autorag-library/bff/internal/integrations/pipelineserver"
	"github.com/opendatahub-io/autorag-library/bff/internal/models"
	"github.com/opendatahub-io/autorag-library/bff/internal/repositories"
)

type PatternsEnvelope Envelope[*models.PatternsData, None]

// PatternsHandler handles GET /api/v1/pipeline-runs/:runId/patterns
//
// Fetches the RAG pattern artifacts for a pipeline run by:
// 1. Listing artifacts from the pipeline server filtered by run ID
// 2. Finding the rag_patterns artifact URI
// 3. Listing pattern subfolders in S3
// 4. Fetching pattern.json and evaluation_results.json for each pattern
func (app *App) PatternsHandler(w http.ResponseWriter, r *http.Request, params httprouter.Params) {
	ctx := r.Context()
	logger := helper.GetContextLoggerFromReq(r)

	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	namespace, ok := ctx.Value(constants.NamespaceHeaderParameterKey).(string)
	if !ok || namespace == "" {
		app.badRequestResponse(w, r, fmt.Errorf("missing namespace in context"))
		return
	}

	client, ok := ctx.Value(constants.PipelineServerClientKey).(ps.PipelineServerClientInterface)
	if !ok {
		app.serverErrorResponse(w, r, fmt.Errorf("pipeline server client not found in context"))
		return
	}

	runID := params.ByName("runId")
	if runID == "" {
		app.badRequestResponse(w, r, fmt.Errorf("missing runId parameter"))
		return
	}

	// Get the run to extract the S3 secret name from runtime config
	run, err := app.repositories.PipelineRuns.GetPipelineRun(client, ctx, runID)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get pipeline run: %w", err))
		return
	}

	secretName := ""
	if run.RuntimeConfig != nil && run.RuntimeConfig.Parameters != nil {
		if v, ok := run.RuntimeConfig.Parameters["input_data_secret_name"]; ok {
			secretName, _ = v.(string)
		}
	}
	if secretName == "" {
		app.badRequestResponse(w, r, fmt.Errorf("pipeline run missing input_data_secret_name in runtime config"))
		return
	}

	// List artifacts from the pipeline server
	artifactsResp, err := client.ListArtifacts(ctx, namespace, 200)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to list artifacts: %w", err))
		return
	}

	// Find the rag_patterns artifact for this run.
	// We match on display_name (the pipeline component's output artifact name)
	// and verify the URI contains the run ID to scope it to this specific run.
	var ragPatternsURI string
	for _, artifact := range artifactsResp.Artifacts {
		isRagPatterns := artifact.DisplayName == "rag_patterns" ||
			strings.HasSuffix(artifact.URI, "/rag_patterns")
		if isRagPatterns && strings.Contains(artifact.URI, runID) {
			ragPatternsURI = artifact.URI
			break
		}
	}

	if ragPatternsURI == "" {
		// No rag_patterns artifact found — return empty
		response := PatternsEnvelope{Data: &models.PatternsData{Patterns: []models.PatternWithEvaluation{}}}
		if err := app.WriteJSON(w, http.StatusOK, response, nil); err != nil {
			app.serverErrorResponse(w, r, err)
		}
		return
	}

	// Parse S3 URI: s3://bucket/prefix
	bucket, prefix, err := parseS3URI(ragPatternsURI)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("invalid rag_patterns artifact URI %q: %w", ragPatternsURI, err))
		return
	}

	// Get S3 credentials
	k8sClient, err := app.kubernetesClientFactory.GetClient(ctx)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	creds, err := app.repositories.S3.GetS3Credentials(k8sClient, ctx, namespace, secretName, identity)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get S3 credentials: %w", err))
		return
	}

	// Override bucket from secret if not in URI
	if bucket == "" && creds.Bucket != "" {
		bucket = creds.Bucket
	}

	// List objects under the rag_patterns prefix to discover pattern folders
	objectPrefix := prefix + "/"
	keys, err := app.repositories.S3.ListS3Objects(ctx, creds, bucket, objectPrefix)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to list pattern objects in S3: %w", err))
		return
	}

	// Extract unique pattern folder names (e.g. "pattern0", "pattern1")
	patternFolders := discoverPatternFolders(keys, objectPrefix)

	logger.Info("discovered pattern folders",
		"runId", runID,
		"count", len(patternFolders),
		"prefix", objectPrefix,
	)

	// Fetch pattern.json and evaluation_results.json for each pattern
	patterns := make([]models.PatternWithEvaluation, 0, len(patternFolders))
	for _, folder := range patternFolders {
		patternKey := objectPrefix + folder + "/pattern.json"
		evalKey := objectPrefix + folder + "/evaluation_results.json"

		patternData, err := fetchJSONFromS3(ctx, app, creds, bucket, patternKey)
		if err != nil {
			logger.Warn("failed to fetch pattern.json, skipping",
				"folder", folder, "error", err)
			continue
		}

		evalData, err := fetchJSONFromS3(ctx, app, creds, bucket, evalKey)
		if err != nil {
			logger.Warn("failed to fetch evaluation_results.json, skipping",
				"folder", folder, "error", err)
			evalData = nil
		}

		patterns = append(patterns, models.PatternWithEvaluation{
			Pattern:           patternData,
			EvaluationResults: evalData,
		})
	}

	response := PatternsEnvelope{Data: &models.PatternsData{Patterns: patterns}}
	if err := app.WriteJSON(w, http.StatusOK, response, nil); err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

// parseS3URI extracts bucket and key from an S3 URI like s3://bucket/key/path
func parseS3URI(uri string) (bucket, key string, err error) {
	if !strings.HasPrefix(uri, "s3://") {
		return "", "", fmt.Errorf("URI does not start with s3://")
	}
	rest := strings.TrimPrefix(uri, "s3://")
	parts := strings.SplitN(rest, "/", 2)
	if len(parts) < 2 {
		return parts[0], "", nil
	}
	return parts[0], parts[1], nil
}

// discoverPatternFolders extracts unique pattern subfolder names from S3 object keys.
// Given keys like "prefix/pattern0/pattern.json" and "prefix/pattern1/evaluation_results.json",
// returns sorted unique folder names ["pattern0", "pattern1"].
func discoverPatternFolders(keys []string, prefix string) []string {
	seen := make(map[string]struct{})
	for _, key := range keys {
		relative := strings.TrimPrefix(key, prefix)
		parts := strings.SplitN(relative, "/", 2)
		if len(parts) >= 2 && parts[0] != "" {
			seen[parts[0]] = struct{}{}
		}
	}

	folders := make([]string, 0, len(seen))
	for f := range seen {
		folders = append(folders, f)
	}
	sort.Strings(folders)
	return folders
}

// fetchJSONFromS3 retrieves an object from S3 and returns its content as raw JSON.
func fetchJSONFromS3(
	ctx context.Context,
	app *App,
	creds *repositories.S3Credentials,
	bucket, key string,
) (json.RawMessage, error) {
	reader, _, err := app.repositories.S3.GetS3Object(ctx, creds, bucket, key)
	if err != nil {
		return nil, err
	}
	if closer, ok := reader.(io.Closer); ok {
		defer closer.Close()
	}

	data, err := io.ReadAll(io.LimitReader(reader, 10<<20)) // 10 MB limit
	if err != nil {
		return nil, fmt.Errorf("failed to read S3 object %q: %w", key, err)
	}

	// Validate it's valid JSON
	if !json.Valid(data) {
		return nil, fmt.Errorf("S3 object %q is not valid JSON", key)
	}

	return json.RawMessage(data), nil
}
