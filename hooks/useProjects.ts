import { useState, useEffect } from "react";
import { Project } from "@/types/project";

// Ces types sont nécessaires pour la logique interne du hook
export  interface FillerItem {
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
function interleaveItems(projects: Project[], fillers: FillerItem[]): (Project | FillerItem)[] {
    const total = projects.length + fillers.length;
    const result: (Project | FillerItem)[] = [];
    const fillerPositions = calculateFillerPositions(projects.length, fillers.length);
    let fillerIndex = 0;
    let projectIndex = 0;
    for (let i = 0; i < total; i++) {
        if (fillerPositions.includes(i) && fillerIndex < fillers.length) {
            result.push(fillers[fillerIndex++]);
        } else if (projectIndex < projects.length) {
            result.push(projects[projectIndex++]);
        }
    }
    while (projectIndex < projects.length) result.push(projects[projectIndex++]);
    while (fillerIndex < fillers.length) result.push(fillers[fillerIndex++]);
    return result;
}

function calculateFillerPositions(projectCount: number, fillerCount: number): number[] {
    const positions: number[] = [];
    if (fillerCount <= 0) return positions;
    const spacing = Math.ceil(projectCount / (fillerCount + 1));
    for (let i = 0; i < fillerCount; i++) {
        const position = (i + 1) * spacing;
        if (position <= projectCount + fillerCount) positions.push(position);
    }
    return positions;
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