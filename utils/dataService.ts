import type { Project, ProjectsResponse, ProjectBySlugResponse } from "@/types/project"
import projectsData from "@/data/projects.json"

export async function getProjects({ limit = 9, offset = 0 }): Promise<ProjectsResponse> {
  // Simuler un délai de réseau
  await new Promise((resolve) => setTimeout(resolve, 800))

  const projectsSlice = projectsData.slice(offset, offset + limit)
  const hasMore = offset + limit < projectsData.length

  return {
    projets: {
      nodes: projectsSlice as Project[],
    },
    pagination: {
      total: projectsData.length,
      perPage: limit,
      offset,
      hasMore,
    },
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectBySlugResponse> {
  // Simuler un délai de réseau
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const project = projectsData.find((p) => p.slug === slug)

  if (!project) {
    throw new Error("Projet non trouvé")
  }

  return {
    projet: project as Project,
  }
}

