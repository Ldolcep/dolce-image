export interface Image {
  sourceUrl: string
  altText: string
}

export interface Service {
  name: string
  slug: string
}

export interface ProjectDetails {
  galerie: Image[]
  clientSociete: string
  dateDuProjet: string
  description: string
  couleurDeFond: string
  lienExterne: string
}

export interface Project {
  slug: string
  title: string
  date: string
  featuredImage: Image
  services: Service[]
  detailsprojet: ProjectDetails
}

export interface Pagination {
  total: number
  perPage: number
  offset: number
  hasMore: boolean
}

export interface ProjectsResponse {
  projets: {
    nodes: Project[]
  }
  pagination: Pagination
}

export interface ProjectBySlugResponse {
  projet: Project
}

