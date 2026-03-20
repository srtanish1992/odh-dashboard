package repositories

import (
	"log/slog"

	"github.com/opendatahub-io/autorag-library/bff/internal/config"
)

// Repositories struct is a single convenient container to hold and represent all our repositories.
type Repositories struct {
	HealthCheck  *HealthCheckRepository
	User         *UserRepository
	Namespace    *NamespaceRepository
	LSDModels    *LSDModelsRepository
	Secret       *SecretRepository
	S3           *S3Repository
	Pipeline     *PipelineRepository
	PipelineRuns *PipelineRunsRepository
}

func NewRepositories(logger *slog.Logger, cfg config.EnvConfig) *Repositories {
	_ = logger

	var s3Repo *S3Repository
	if cfg.S3EndpointOverride != "" {
		logger.Info("Using S3 endpoint override", "endpoint", cfg.S3EndpointOverride)
		s3Repo = NewS3RepositoryWithOverride(cfg.S3EndpointOverride)
	} else {
		s3Repo = NewS3Repository()
	}

	return &Repositories{
		HealthCheck:  NewHealthCheckRepository(),
		User:         NewUserRepository(),
		Namespace:    NewNamespaceRepository(),
		LSDModels:    NewLSDModelsRepository(),
		Secret:       NewSecretRepository(),
		S3:           s3Repo,
		Pipeline:     NewPipelineRepository(),
		PipelineRuns: NewPipelineRunsRepository(),
	}
}
