import 'pannellum/build/pannellum.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTour } from '../../contexts/TourContext';
import { HotSpot } from '../../types';
import { ViewerContainer } from './styles';
import { PannellumViewerProps } from './types';
import {
  useImageOptimization,
  useViewPosition,
  useHotspotManagement,
  usePannellumInitializer,
  useEventHandlers
} from './hooks';
import {
  ConnectionModal,
  HelpTooltip,
  ViewerControls,
  LoadingOverlay,
  NoSceneMessage
} from './components';

const PannellumViewer: React.FC<PannellumViewerProps> = ({
  width = '100%',
  height = '100vh'
}) => {
  const { tour, addHotSpot, removeHotSpot, setCurrentScene } = useTour();
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumRef = useRef<any>(null);
  
  // Estados básicos
  const [isTinyPlanet, setIsTinyPlanet] = useState(false);
  const [isHotspotCreationMode, setIsHotspotCreationMode] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [clickedOnHotspot, setClickedOnHotspot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para el modal de conexión
  const [showSceneSelectionModal, setShowSceneSelectionModal] = useState(false);
  const [createHotspotCallback, setCreateHotspotCallback] = useState<((targetSceneId: string) => void) | null>(null);
  
  // Obtener la escena actual
  const currentScene = tour.scenes.find(scene => scene.id === tour.currentSceneId);
  
  // Inicializar hooks personalizados
  const { optimizeImage } = useImageOptimization();
  
  const { 
    saveCurrentViewPosition, 
    restoreViewPosition,
    centerViewOnHotspot,
    applyTinyPlanetEffect 
  } = useViewPosition(pannellumRef);
  
  const { 
    convertHotspotsToPannellum,
    updateHotspotsInViewer,
    createClickIndicator,
    showConfirmationMessage
  } = useHotspotManagement(pannellumRef);
  
  const { initPannellumViewer, addPannellumStyles } = usePannellumInitializer();
  
  // Función segura para navegar entre escenas
  const navigateToScene = useCallback((sceneId: string | undefined) => {
    if (!sceneId || !pannellumRef.current) return;

    const targetScene = tour.scenes.find(scene => scene.id === sceneId);
    if (!targetScene) {
      console.error("La escena destino no existe:", sceneId);
      return;
    }

    try {
      setCurrentScene(sceneId);
      pannellumRef.current.loadScene(sceneId);
    } catch (error) {
      console.error("Error al navegar a la escena:", error);
    }
  }, [pannellumRef, tour.scenes, setCurrentScene]);
  
  // Procesar clic en el panorama para crear hotspot
  const handlePanoramaClick = useCallback((e: MouseEvent) => {
    if (!pannellumRef.current || !currentScene || clickedOnHotspot || showSceneSelectionModal) {
      return;
    }

    try {
      // Mostrar indicador visual del clic
      createClickIndicator(e.clientX, e.clientY);

      e.preventDefault();
      e.stopPropagation();
      
      // Obtener las coordenadas del visor en grados
      const coords = pannellumRef.current.mouseEventToCoords(e);
      
      if (!coords || coords.length !== 2) {
        console.error("No se pudieron obtener coordenadas válidas:", coords);
        return;
      }
      
      // Guardar las coordenadas para usar al crear el hotspot
      const pitch = coords[0];
      const yaw = coords[1];
      
      // Mostrar el modal para seleccionar una escena
      setShowSceneSelectionModal(true);
      
      // Crear una función para crear el hotspot con estas coordenadas
      const createHotspotHere = (targetSceneId: string) => {
        if (!currentScene) return;
        
        const targetSceneTitle = tour.scenes.find(s => s.id === targetSceneId)?.title || 'Otra escena';
        
        const newHotspot: Omit<HotSpot, 'id'> = {
          pitch: pitch,
          yaw: yaw,
          type: 'scene',
          sceneId: targetSceneId,
          text: `Ir a ${targetSceneTitle}`
        };
        
        // Agregar el hotspot
        addHotSpot(currentScene.id, newHotspot);
        
        // Limpiar estados
        setShowSceneSelectionModal(false);
        
        // Mostrar mensaje de confirmación
        showConfirmationMessage('Punto de acceso creado exitosamente');
      };
      
      // Establecer la función de callback
      setCreateHotspotCallback(() => createHotspotHere);
      
    } catch (error) {
      console.error("Error al procesar las coordenadas del hotspot:", error);
      setShowSceneSelectionModal(false);
    }
  }, [pannellumRef, currentScene, showSceneSelectionModal, tour.scenes, addHotSpot, clickedOnHotspot, createClickIndicator, showConfirmationMessage]);
  
  // Hook para manejar eventos
  const { setupEventHandlers } = useEventHandlers(
    pannellumRef,
    isHotspotCreationMode,
    setClickedOnHotspot,
    setSelectedHotspotId,
    handlePanoramaClick
  );
  
  // Activar/desactivar el efecto tiny planet
  const toggleTinyPlanet = useCallback(() => {
    setIsTinyPlanet(!isTinyPlanet);
  }, [isTinyPlanet]);

  // Activar/desactivar el modo de creación de hotspots
  const toggleHotspotCreationMode = useCallback(() => {
    // Guardar la posición actual antes de cambiar de modo
    if (!isHotspotCreationMode) {
      saveCurrentViewPosition();
    }
    
    setIsHotspotCreationMode(!isHotspotCreationMode);
    setSelectedHotspotId(null);
    setShowSceneSelectionModal(false);
    
    // Restaurar la posición guardada al activar el modo de creación
    if (!isHotspotCreationMode) {
      setTimeout(restoreViewPosition, 100);
    }
  }, [isHotspotCreationMode, saveCurrentViewPosition, restoreViewPosition]);

  // Eliminar un hotspot seleccionado
  const handleDeleteSelectedHotspot = useCallback(() => {
    if (selectedHotspotId && currentScene) {
      removeHotSpot(currentScene.id, selectedHotspotId);
      setSelectedHotspotId(null);
    }
  }, [selectedHotspotId, currentScene, removeHotSpot]);

  // Efecto para la visualización tiny planet
  useEffect(() => {
    if (!pannellumRef.current) return;
    
    if (isTinyPlanet) {
      applyTinyPlanetEffect();
    } else {
      pannellumRef.current.setHfov(100);
      pannellumRef.current.setPitch(0);
    }
  }, [isTinyPlanet, applyTinyPlanetEffect]);

  // Efecto para agregar estilos CSS para los hotspots
  useEffect(() => {
    const cleanup = addPannellumStyles();
    return cleanup;
  }, [addPannellumStyles]);

  // Centrar la vista cuando se selecciona un hotspot
  useEffect(() => {
    if (selectedHotspotId && currentScene?.hotSpots) {
      centerViewOnHotspot(selectedHotspotId, currentScene.hotSpots);
    }
  }, [selectedHotspotId, currentScene?.hotSpots, centerViewOnHotspot]);

  // Efecto para manejar el evento de conexión cuando se selecciona una escena en el modal
  useEffect(() => {
    if (showSceneSelectionModal && createHotspotCallback && currentScene) {
      // El callback se llamará cuando se confirme la selección en el modal
    }
  }, [showSceneSelectionModal, createHotspotCallback, currentScene]);

  // Inicializar el visor Pannellum
  useEffect(() => {
    if (!currentScene || typeof window === 'undefined' || !window.pannellum) {
      return;
    }
    
    setIsLoading(true);
    
    const handleLoad = () => {
      setIsLoading(false);
      
      // Actualizar los hotspots
      if (currentScene.hotSpots) {
        updateHotspotsInViewer(
          currentScene.hotSpots,
          selectedHotspotId,
          navigateToScene
        );
      }
      
      // Aplicar efecto tiny planet si está activo
      if (isTinyPlanet) {
        applyTinyPlanetEffect();
      }
    };
    
    // Optimizar la imagen primero
    optimizeImage(currentScene.imageUrl).then(optimizedUrl => {
      // Inicializar el visor con la imagen optimizada
      const viewer = initPannellumViewer(
        viewerRef, 
        optimizedUrl, 
        pannellumRef,
        handleLoad
      );
      
      if (viewer) {
        pannellumRef.current = viewer;
        
        // Configurar manejadores de eventos
        setupEventHandlers();
      } else {
        setIsLoading(false);
      }
    });
    
    return () => {
      if (pannellumRef.current) {
        try {
          pannellumRef.current.destroy();
        } catch (error) {
          console.warn('Error al destruir el visor de Pannellum:', error);
        }
        pannellumRef.current = null;
      }
    };
  }, [currentScene, initPannellumViewer, optimizeImage, setupEventHandlers, applyTinyPlanetEffect, updateHotspotsInViewer, navigateToScene, selectedHotspotId, isTinyPlanet]);

  // Actualizar hotspots en el visor cuando se crea uno nuevo o se elimina
  useEffect(() => {
    if (pannellumRef.current && currentScene && currentScene.hotSpots) {
      updateHotspotsInViewer(
        currentScene.hotSpots,
        selectedHotspotId,
        navigateToScene
      );
    }
  }, [currentScene?.hotSpots, updateHotspotsInViewer, navigateToScene, selectedHotspotId, currentScene]);

  return (
    <ViewerContainer style={{ width, height }}>
      <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
      
      {isLoading && <LoadingOverlay />}
      
      {!currentScene && <NoSceneMessage />}
      
      {currentScene && (
        <>
          <ViewerControls 
            isTinyPlanet={isTinyPlanet}
            isHotspotCreationMode={isHotspotCreationMode}
            selectedHotspotId={selectedHotspotId}
            onToggleTinyPlanet={toggleTinyPlanet}
            onToggleHotspotCreationMode={toggleHotspotCreationMode}
            onDeleteSelectedHotspot={handleDeleteSelectedHotspot}
          />
          
          {isHotspotCreationMode && !showSceneSelectionModal && (
            <HelpTooltip 
              text="Haz <strong>doble clic</strong> en cualquier parte para crear un punto de acceso"
            />
          )}
          
          {!isHotspotCreationMode && !showSceneSelectionModal && (
            <HelpTooltip 
              text="Doble clic para crear punto de acceso"
              position="bottom-right"
              style={{ opacity: 0.7 }}
            />
          )}
          
          {/* Modal para seleccionar escena de destino */}
          {showSceneSelectionModal && createHotspotCallback && (
            <ConnectionModal 
              scenes={tour.scenes}
              currentSceneId={currentScene.id}
              onClose={() => {
                setShowSceneSelectionModal(false);
                setCreateHotspotCallback(null);
              }}
              onConfirm={(sceneId) => {
                if (createHotspotCallback) {
                  createHotspotCallback(sceneId);
                  setCreateHotspotCallback(null);
                }
              }}
            />
          )}
        </>
      )}
    </ViewerContainer>
  );
};

export default PannellumViewer; 