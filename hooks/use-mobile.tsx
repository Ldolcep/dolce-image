// hooks/use-mobile.tsx - CORRIGÉ POUR SSR/HYDRATATION
import * as React from "react" // ou import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 1024 // Vous pouvez ajuster ce breakpoint si nécessaire

export function useIsMobile(): boolean {
  // Commencer par une valeur par défaut (par exemple, false pour desktop-first).
  // Cette valeur sera utilisée pour le rendu serveur ET le premier rendu client.
  const [isMobile, setIsMobile] = React.useState(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    // Cet effet s'exécute une seule fois après le montage initial côté client.
    setHasMounted(true);
  }, []) // Tableau de dépendances vide


  React.useEffect(() => {
    // Ne pas exécuter cette logique avant que le composant ne soit monté côté client.
    if (!hasMounted) {
      return;
    }

    // 'window' est maintenant accessible en toute sécurité.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => {
      setIsMobile(mql.matches) // Utiliser mql.matches est plus direct et réactif.
    }

    // Définir la valeur initiale après le montage en appelant onChange une fois.
    onChange();

    // Ajouter l'écouteur pour les changements de taille de la fenêtre.
    mql.addEventListener("change", onChange)

    // Nettoyer l'écouteur lorsque le composant est démonté.
    return () => mql.removeEventListener("change", onChange)

  }, [hasMounted]) // Se ré-exécute seulement quand hasMounted change (c'est-à-dire une fois après le montage).

  // Pendant le SSR et le premier rendu client (avant que hasMounted ne soit true
  // et que le second useEffect ne s'exécute), isMobile aura sa valeur par défaut (false).
  // Seulement après le montage, isMobile sera mis à jour à sa valeur réelle.
  return isMobile
}