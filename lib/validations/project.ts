// lib/validations/project.ts
import { z } from 'zod'
import DOMPurify from 'dompurify'

// Configuration DOMPurify sécurisée
const ALLOWED_TAGS = ['strong', 'em', 'br', 'p', 'span', 'a']
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class']

// Fonction de sanitisation personnalisée
const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Côté serveur - validation basique
    const hasScript = /<script|javascript:|on\w+=/i.test(html)
    if (hasScript) {
      throw new Error('Contenu HTML non autorisé détecté')
    }
    return html
  }
  
  // Côté client - sanitisation complète
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror']
  })
}

// Schema pour une description (string ou array de strings avec HTML)
const descriptionSchema = z.union([
  z.string().min(1).max(2000),
  z.array(z.string().min(1).max(1000)).min(1).max(10)
]).transform((desc) => {
  if (Array.isArray(desc)) {
    return desc.map(sanitizeHtml)
  }
  return sanitizeHtml(desc)
})

// Schema pour un projet individuel
export const projectSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'ID doit être alphanumérique'),
  title: z.string().min(1).max(100),
  mainVisual: z.string().url().or(z.string().startsWith('/')),
  additionalVisuals: z.array(
    z.string().url().or(z.string().startsWith('/'))
  ).max(20),
  description: descriptionSchema,
  link: z.string().url().optional().or(z.literal(""))
})

// Schema pour le fichier complet
export const projectsDataSchema = z.object({
  projects: z.array(projectSchema).min(1).max(50)
})

// Types TypeScript générés
export type Project = z.infer<typeof projectSchema>
export type ProjectsData = z.infer<typeof projectsDataSchema>

// Fonction de validation avec gestion d'erreurs
export const validateProjectsData = (data: unknown): ProjectsData => {
  try {
    return projectsDataSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')
      
      throw new Error(`Validation échouée:\n${formattedErrors}`)
    }
    throw error
  }
}

// Hook personnalisé pour charger et valider les projets
export const useValidatedProjects = () => {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        
        // Charger les données (remplacez par votre méthode)
        const response = await fetch('/api/projects') // ou import direct
        const rawData = await response.json()
        
        // Valider et sanitiser
        const validatedData = validateProjectsData(rawData)
        setProjects(validatedData.projects)
        setError(null)
        
      } catch (err) {
        console.error('Erreur validation projets:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  return { projects, loading, error }
}