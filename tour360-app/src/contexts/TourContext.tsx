import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tour, PanoramaImage, HotSpot } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TourContextProps {
  tour: Tour;
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (isOpen: boolean) => void;
  addScene: (scene: Omit<PanoramaImage, 'id'>) => void;
  removeScene: (sceneId: string) => void;
  updateScene: (scene: PanoramaImage) => void;
  setCurrentScene: (sceneId: string) => void;
  addHotSpot: (sceneId: string, hotSpot: Omit<HotSpot, 'id'>) => void;
  removeHotSpot: (sceneId: string, hotSpotId: string) => void;
  saveTour: () => string;
  loadTour: (tourData: string) => void;
}

const TourContext = createContext<TourContextProps | undefined>(undefined);

export const TourProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tour, setTour] = useState<Tour>({
    id: uuidv4(),
    name: 'Mi Tour 360',
    scenes: [],
    currentSceneId: '',
  });
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  const addScene = (scene: Omit<PanoramaImage, 'id'>) => {
    const newScene = {
      ...scene,
      id: uuidv4(),
      hotSpots: [],
    };
    
    setTour(prevTour => {
      const updatedScenes = [...prevTour.scenes, newScene];
      const currentSceneId = prevTour.currentSceneId || newScene.id;
      
      return {
        ...prevTour,
        scenes: updatedScenes,
        currentSceneId,
      };
    });
  };

  const removeScene = (sceneId: string) => {
    setTour(prevTour => {
      const updatedScenes = prevTour.scenes.filter(scene => scene.id !== sceneId);
      let currentSceneId = prevTour.currentSceneId;
      
      // Si eliminamos la escena actual, seleccionamos otra si existe
      if (currentSceneId === sceneId && updatedScenes.length > 0) {
        currentSceneId = updatedScenes[0].id;
      } else if (updatedScenes.length === 0) {
        currentSceneId = '';
      }
      
      return {
        ...prevTour,
        scenes: updatedScenes,
        currentSceneId,
      };
    });
  };

  const updateScene = (updatedScene: PanoramaImage) => {
    setTour(prevTour => {
      const updatedScenes = prevTour.scenes.map(scene => 
        scene.id === updatedScene.id ? updatedScene : scene
      );
      
      return {
        ...prevTour,
        scenes: updatedScenes,
      };
    });
  };

  const setCurrentScene = (sceneId: string) => {
    setTour(prevTour => ({
      ...prevTour,
      currentSceneId: sceneId,
    }));
  };

  const addHotSpot = (sceneId: string, hotSpot: Omit<HotSpot, 'id'>) => {
    const newHotSpot = {
      ...hotSpot,
      id: uuidv4(),
    };

    setTour(prevTour => {
      const updatedScenes = prevTour.scenes.map(scene => {
        if (scene.id === sceneId) {
          return {
            ...scene,
            hotSpots: [...(scene.hotSpots || []), newHotSpot],
          };
        }
        return scene;
      });
      
      return {
        ...prevTour,
        scenes: updatedScenes,
      };
    });
  };

  const removeHotSpot = (sceneId: string, hotSpotId: string) => {
    setTour(prevTour => {
      const updatedScenes = prevTour.scenes.map(scene => {
        if (scene.id === sceneId && scene.hotSpots) {
          return {
            ...scene,
            hotSpots: scene.hotSpots.filter(hs => hs.id !== hotSpotId),
          };
        }
        return scene;
      });
      
      return {
        ...prevTour,
        scenes: updatedScenes,
      };
    });
  };

  const saveTour = (): string => {
    const tourData = JSON.stringify(tour);
    localStorage.setItem('tour360_data', tourData);
    return tourData;
  };

  const loadTour = (tourData: string) => {
    try {
      const parsedTour = JSON.parse(tourData) as Tour;
      setTour(parsedTour);
    } catch (error) {
      console.error('Error al cargar el tour:', error);
    }
  };

  return (
    <TourContext.Provider
      value={{
        tour,
        isSidePanelOpen,
        setIsSidePanelOpen,
        addScene,
        removeScene,
        updateScene,
        setCurrentScene,
        addHotSpot,
        removeHotSpot,
        saveTour,
        loadTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour debe ser usado dentro de un TourProvider');
  }
  return context;
}; 