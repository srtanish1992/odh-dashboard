import React from 'react';
import { Alert, FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { getDisplayNameFromK8sResource } from '~/concepts/k8s/utils';
import { byName, ProjectsContext } from '~/concepts/projects/ProjectsContext';
import { KnownLabels, ProjectKind } from '~/k8sTypes';
import { ProjectSectionID } from '~/pages/projects/screens/detail/types';
import SimpleSelect from '~/components/SimpleSelect';

type ProjectSelectorProps = {
  selectedProject: ProjectKind | null;
  setSelectedProject: (project: ProjectKind | null) => void;
  error?: Error;
  projectLinkExtraUrlParams?: Record<string, string | undefined>;
  isOciModel?: boolean;
};

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProject,
  setSelectedProject,
  error,
  projectLinkExtraUrlParams,
  isOciModel,
}) => {
  const { projects } = React.useContext(ProjectsContext);
  const kserveProjects = projects.filter(
    (project) =>
      !project.metadata.labels?.[KnownLabels.MODEL_SERVING_PROJECT] ||
      project.metadata.labels[KnownLabels.MODEL_SERVING_PROJECT] === 'false',
  );

  const projectLinkUrlParams = new URLSearchParams();
  projectLinkUrlParams.set('section', ProjectSectionID.MODEL_SERVER);
  if (projectLinkExtraUrlParams) {
    Object.entries(projectLinkExtraUrlParams).forEach(([key, value]) => {
      if (value) {
        projectLinkUrlParams.set(key, value);
      }
    });
  }

  return (
    <FormGroup label="Project" fieldId="deploy-model-project-selector" isRequired>
      <Stack hasGutter>
        <StackItem>
          <SimpleSelect
            isFullWidth
            isScrollable
            onChange={(selection) => {
              const foundProject = projects.find(byName(selection));
              if (foundProject) {
                setSelectedProject(foundProject);
              } else {
                setSelectedProject(null);
              }
            }}
            value={selectedProject?.metadata.name}
            options={(isOciModel ? kserveProjects : projects).map((project) => ({
              key: project.metadata.name,
              value: project.metadata.name,
              label: getDisplayNameFromK8sResource(project),
            }))}
            dataTestId="deploy-model-project-selector"
            toggleLabel={
              selectedProject
                ? getDisplayNameFromK8sResource(selectedProject)
                : 'Select target project'
            }
            toggleProps={{ id: 'deploy-model-project-selector' }}
          />
        </StackItem>
        {error && selectedProject && (
          <StackItem>
            <Alert isInline variant="danger" title="Configuration required">
              {error.message}
              <div>
                <Link
                  to={`/projects/${
                    selectedProject.metadata.name
                  }?${projectLinkUrlParams.toString()}`}
                >
                  Go to <b>{getDisplayNameFromK8sResource(selectedProject)}</b> project page
                </Link>
              </div>
            </Alert>
          </StackItem>
        )}
      </Stack>
    </FormGroup>
  );
};

export default ProjectSelector;
