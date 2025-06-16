import { useState, useEffect } from "react";
import { Project } from "@/types/project";

// Ces types sont nécessaires pour la logique interne du hook
export interface FillerItem {
  id: string;
  backgroundImage: string;
  textImage: string;
  aspectRatio?: string;
  isFiller: boolean;
}

interface ProjectsData {
  projects: Project[];
  fillers?: FillerItem[];
}

// Les données de secours sont maintenant isolées dans le hook
const hardcodedProjectsData: ProjectsData = {
  projects: [
    // ... (ici, vous pouvez remettre vos données de projet en dur si vous le souhaitez,
    // ou les laisser vides si vous faites entièrement confiance au fetch)
    // Exemple :
    {
      id: "1",
      title: "Le Boudoir Miadana",
      mainVisual: "/images/projects/Le Boudoir de Miadana/le-boudoir-miadana-main.jpg",
      additionalVisuals: ["/path/to/image1.jpg"],
      description: ["Description..."],
      link: "https://example.com",
    },
  ],
  fillers: [
    { id: "filler_1", backgroundImage: "/images/fillers/filler_1_bg.jpg", textImage: "/images/fillers/filler_1_text.png", aspectRatio: "4/3", isFiller: true },
  ]
};

// Fonctions utilitaires internes au hook
function interleaveItems(
  projects: Project[],
  fillers: FillerItem[],
  interval: number = 3 // Insère un filler toutes les 3 cartes de projet
): (Project | FillerItem)[] {
  if (fillers.length === 0) return projects;

  const result: (Project | FillerItem)[] = [];
  let fillerIndex = 0;

  for (let i = 0; i < projects.length; i++) {
    result.push(projects[i]);
    // Après chaque `interval` projets, insérer un filler s'il en reste
    if ((i + 1) % interval === 0 && fillerIndex < fillers.length) {
      result.push(fillers[fillerIndex]);
      fillerIndex++;
    }
  }

  // Si des fillers restent, les ajouter à la fin
  while (fillerIndex < fillers.length) {
    result.push(fillers[fillerIndex]);
    fillerIndex++;
  }

  return result;
}

// Le hook principal
export function useProjects() {
  const [allItems, setAllItems] = useState<(Project | FillerItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/data/projects.json');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        const fetchedProjectsData: ProjectsData = await response.json();
        if (!fetchedProjectsData.projects) throw new Error('Format de données invalide');

        const interleaved = interleaveItems(fetchedProjectsData.projects, fetchedProjectsData.fillers || []);
        setAllItems(interleaved);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(errorMessage);
        console.warn("Utilisation des données de secours car le chargement du JSON a échoué:", errorMessage);
        const fallbackInterleaved = interleaveItems(hardcodedProjectsData.projects, hardcodedProjectsData.fillers || []);
        setAllItems(fallbackInterleaved);
      } finally {
        setLoading(false);
      }
    };

    loadProjectsData();
  }, []);

  return { allItems, loading, error };
}