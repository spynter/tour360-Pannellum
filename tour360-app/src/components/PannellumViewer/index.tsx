import 'pannellum/build/pannellum.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useTour } from '../../contexts/TourContext';
import { IconContext } from 'react-icons';
import { FaPlus, FaTrash, FaLink, FaTimes, FaLightbulb } from 'react-icons/fa';
import { HotSpot, ViewPosition } from '../../types';
import { throttle } from 'lodash';

// Asegurarnos que Pannellum esté disponible globalmente
declare global {
  interface Window {
    pannellum: any;
  }
}

// Interfaz para los hotspots específicos de Pannellum que incluye propiedades adicionales
interface PannellumHotSpot extends HotSpot {
  cssClass?: string;
  createTooltipFunc?: (hotSpotDiv: HTMLElement) => HTMLElement | { div: HTMLElement };
}

interface PannellumViewerProps {
  width?: string;
  height?: string;
}

const PannellumViewer: React.FC<PannellumViewerProps> = ({ 
  width = '100%',
  height = '100vh'
}) => {
  const { tour, addHotSpot, removeHotSpot, setCurrentScene } = useTour();
  const viewerRef = useRef<HTMLDivElement>(null);
  const pannellumRef = useRef<any>(null);
  const [isTinyPlanet, setIsTinyPlanet] = useState(false);
  const [isHotspotCreationMode, setIsHotspotCreationMode] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [clickedOnHotspot, setClickedOnHotspot] = useState(false);
  
  // Estados para el nuevo flujo de creación de hotspots
  const [showSceneSelectionModal, setShowSceneSelectionModal] = useState(false);
  const [selectedSceneConnection, setSelectedSceneConnection] = useState<string | null>(null);
  
  // Estado para detección de eventos y movimientos
  const [isMouseDown, setIsMouseDown] = useState(false);
  // Esta variable se usa en el manejador de eventos de movimiento
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasMoved, setHasMoved] = useState(false);
  
  // Estado para guardar la posición actual de la vista
  const [savedViewPosition, setSavedViewPosition] = useState<ViewPosition | null>(null);
  
  // Estado para el cache de imágenes optimizadas
  const [optimizedImageCache, setOptimizedImageCache] = useState<{[key: string]: string}>({});
  
  // Estado para indicar carga de imágenes
  const [isLoading, setIsLoading] = useState(false);

  // Estado para guardar la función de creación de hotspot
  const [createHotspotCallback, setCreateHotspotCallback] = useState<((targetSceneId: string) => void) | null>(null);

  const currentScene = tour.scenes.find(scene => scene.id === tour.currentSceneId);

  // Función para optimizar imágenes usando canvas para reducir tamaño - modificada para rendimiento
  const optimizeImage = useCallback((imageUrl: string, maxWidth = 4096): Promise<string> => {
    // Verificar si la imagen ya está en caché
    if (optimizedImageCache[imageUrl]) {
      return Promise.resolve(optimizedImageCache[imageUrl]);
    }
    
    // Comprobar si la URL de la imagen es una URL de datos
    if (imageUrl.startsWith('data:')) {
      return Promise.resolve(imageUrl);
    }
    
    return new Promise((resolve) => {
      // Nunca establecer isLoading=true durante optimización en segundo plano
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      img.onload = () => {
        // Solo optimizar si la imagen es muy grande
        if (img.width <= maxWidth) {
          resolve(imageUrl);
          return;
        }
        
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(imageUrl);
            return;
          }
          
          // Calcular proporciones
          const ratio = maxWidth / img.width;
          const targetWidth = maxWidth;
          const targetHeight = img.height * ratio;
          
          // Configurar canvas
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // Obtener data URL con calidad reducida (0.85 = 85% de calidad)
          const optimizedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Actualizar la caché de forma segura
          const updatedCache = {...optimizedImageCache};
          updatedCache[imageUrl] = optimizedImageUrl;
          setOptimizedImageCache(updatedCache);
          
          resolve(optimizedImageUrl);
        } catch (error) {
          console.error("Error al generar la imagen optimizada:", error);
          resolve(imageUrl); // En caso de error, usar la imagen original
        }
      };
      
      img.onerror = () => {
        resolve(imageUrl); // Si hay error, usar la original
      };
      
      img.src = imageUrl;
    });
  }, [optimizedImageCache]);
  
  // Función para precargar escenas conectadas - se mantiene para uso futuro
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const preloadConnectedScenes = useCallback(() => {
    if (!currentScene || !currentScene.hotSpots) return;
    
    // Obtener todas las escenas conectadas a la actual
    const connectedSceneIds = currentScene.hotSpots
      .filter(hotspot => hotspot.type === 'scene' && hotspot.sceneId)
      .map(hotspot => hotspot.sceneId as string);
    
    // Precargar cada escena conectada solo si no están ya en caché
    connectedSceneIds.forEach(sceneId => {
      const sceneToPreload = tour.scenes.find(scene => scene.id === sceneId);
      if (sceneToPreload && !optimizedImageCache[sceneToPreload.imageUrl]) {
        // Optimizar y precargar en segundo plano sin mostrar indicador de carga
        const img = new Image();
        img.src = sceneToPreload.imageUrl;
        img.onload = () => {
          optimizeImage(sceneToPreload.imageUrl).then(() => {
            console.log(`Escena ${sceneToPreload.title} precargada`);
          });
        };
      }
    });
  }, [currentScene, tour.scenes, optimizeImage, optimizedImageCache]);

  // Función para guardar la posición actual de la vista
  const saveCurrentViewPosition = useCallback(() => {
    if (!pannellumRef.current) return;
    
    const position: ViewPosition = {
      pitch: pannellumRef.current.getPitch(),
      yaw: pannellumRef.current.getYaw(),
      hfov: pannellumRef.current.getHfov()
    };
    
    setSavedViewPosition(position);
  }, [pannellumRef]);
  
  // Función para restaurar la posición guardada de la vista
  const restoreViewPosition = useCallback(() => {
    if (!pannellumRef.current || !savedViewPosition) return;
    
    pannellumRef.current.lookAt(
      savedViewPosition.pitch,
      savedViewPosition.yaw,
      savedViewPosition.hfov,
      false // Sin animación
    );
  }, [pannellumRef, savedViewPosition]);

  // Función para centrar la vista en el hotspot seleccionado
  const centerViewOnHotspot = useCallback((hotspotId: string) => {
    if (!pannellumRef.current || !currentScene) return;
    
    const hotspot = currentScene.hotSpots?.find(h => h.id === hotspotId);
    
    if (hotspot) {
      // Centrar la vista en las coordenadas del hotspot
      pannellumRef.current.lookAt(
        hotspot.pitch, // pitch
        hotspot.yaw,   // yaw
        pannellumRef.current.getHfov() // mantener el mismo nivel de zoom
      );
    }
  }, [pannellumRef, currentScene]);

  // Centrar la vista cuando se selecciona un hotspot
  useEffect(() => {
    if (selectedHotspotId) {
      centerViewOnHotspot(selectedHotspotId);
    }
  }, [selectedHotspotId, centerViewOnHotspot]);

  // Estilos CSS para los hotspots
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-hotspot {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: rgba(100, 100, 255, 0.7);
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      }
      .custom-hotspot:hover {
        background-color: rgba(150, 150, 255, 0.9);
        transform: scale(1.2);
      }
      .selected-hotspot {
        background-color: rgba(100, 255, 100, 0.9) !important;
        border: 3px solid white;
        transform: scale(1.2);
        animation: pulse 1.5s infinite;
      }
      .scene-hotspot {
        background-color: rgba(0, 100, 255, 0.7);
      }
      .info-hotspot {
        background-color: rgba(255, 100, 100, 0.7);
      }
      .hotspot-tooltip {
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 10px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .custom-hotspot:hover .hotspot-tooltip {
        opacity: 1;
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(100, 255, 100, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(100, 255, 100, 0); }
        100% { box-shadow: 0 0 0 0 rgba(100, 255, 100, 0); }
      }
      
      /* Estilos para la barra de carga de Pannellum */
      .pnlm-load-box {
        background-color: rgba(0, 0, 0, 0.7) !important;
        border-radius: 8px !important;
        color: white !important;
      }
      .pnlm-load-box p {
        color: white !important;
      }
      .pannellum-loading {
        color: white;
        font-family: Arial, sans-serif;
        font-size: 16px;
        margin-top: 10px;
      }
      .pnlm-load-button {
        display: none !important; /* Ocultar botón de carga */
      }
      
      /* Mejorar rendimiento de transiciones */
      .pnlm-fade-img {
        transition: opacity 0.75s ease-in-out !important;
      }
      .pnlm-render-container {
        will-change: transform;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Efecto para la visualización tiny planet
  useEffect(() => {
    if (!viewerRef.current || !pannellumRef.current) return;
    
    if (isTinyPlanet) {
      // Cambiar a vista tiny planet
      pannellumRef.current.setHfov(120); // Amplio campo de visión
      pannellumRef.current.setPitch(-90); // Mirar hacia abajo
      // Personalizar el modo de proyección para tiny planet
      if (pannellumRef.current.setProjection) {
        pannellumRef.current.setProjection('equirectangular');
      }
    } else {
      // Restaurar vista normal
      pannellumRef.current.setHfov(100);
      pannellumRef.current.setPitch(0);
      if (pannellumRef.current.setProjection) {
        pannellumRef.current.setProjection('equirectangular');
      }
    }
  }, [isTinyPlanet]);

  // Función para activar/desactivar el efecto tiny planet
  const toggleTinyPlanet = () => {
    setIsTinyPlanet(!isTinyPlanet);
  };

  // Activar/desactivar el modo de creación de hotspots
  const toggleHotspotCreationMode = () => {
    // Guardar la posición actual antes de cambiar de modo
    if (!isHotspotCreationMode) {
      saveCurrentViewPosition();
    }
    
    setIsHotspotCreationMode(!isHotspotCreationMode);
    // Desactivar la selección de hotspot al cambiar de modo
    setSelectedHotspotId(null);
    // Cerrar el modal de selección de escena si está abierto
    setShowSceneSelectionModal(false);
    setSelectedSceneConnection(null);
    
    // Restaurar la posición guardada al activar el modo de creación
    if (!isHotspotCreationMode && savedViewPosition) {
      setTimeout(() => {
        restoreViewPosition();
      }, 100);
    }
  };

  // Eliminar un hotspot seleccionado
  const handleDeleteSelectedHotspot = () => {
    if (selectedHotspotId && currentScene) {
      removeHotSpot(currentScene.id, selectedHotspotId);
      setSelectedHotspotId(null);
    }
  };

  // Función para capturar la posición del clic y mostrar modal de selección de escena
  const handlePanoramaClick = useCallback((e: MouseEvent) => {
    // Evitar procesamiento si hay problemas con las referencias o estados
    if (!pannellumRef.current || !pannellumRef.current.getViewer) {
      console.log("El visor de Pannellum no está inicializado correctamente");
      return;
    }
    
    if (!currentScene) {
      console.log("No hay escena actual");
      return;
    }
    
    if (clickedOnHotspot) {
      setClickedOnHotspot(false);
      console.log("Se hizo clic en un hotspot existente");
      return;
    }
    
    if (showSceneSelectionModal) {
      console.log("El modal de selección ya está abierto");
      return;
    }

    try {
      // Mostrar un indicador de clic visual temporal
      const clickIndicator = document.createElement('div');
      clickIndicator.style.cssText = `
        position: absolute;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.8);
        background-color: rgba(74, 144, 226, 0.5);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        animation: pulse-indicator 1s forwards;
      `;
      document.body.appendChild(clickIndicator);
      
      // Posicionar el indicador donde ocurrió el clic
      clickIndicator.style.left = `${e.clientX}px`;
      clickIndicator.style.top = `${e.clientY}px`;
      
      // Agregar regla de animación si no existe
      if (!document.getElementById('pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'pulse-animation';
        style.innerHTML = `
          @keyframes pulse-indicator {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            70% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Eliminar el indicador después de la animación
      setTimeout(() => {
        if (document.body.contains(clickIndicator)) {
          document.body.removeChild(clickIndicator);
        }
      }, 1000);

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
      
      console.log(`Creando hotspot en: pitch=${pitch}, yaw=${yaw}`);
      
      // Mostrar el modal para seleccionar una escena
      setShowSceneSelectionModal(true);
      
      // Crear una función para crear el hotspot con estas coordenadas
      const createHotspotHere = (targetSceneId: string) => {
        if (!currentScene) {
          console.error("La escena actual no está definida");
          return;
        }
        
        console.log(`Conectando con escena: ${targetSceneId}`);
        
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
        setSelectedSceneConnection(null);
        
        // Mantener el modo de creación activo para permitir crear más hotspots fácilmente
        // setIsHotspotCreationMode(false); - Comentamos esta línea para mantener el modo activo
        
        // Actualizar el visor para mostrar el nuevo hotspot inmediatamente
        if (pannellumRef.current && currentScene.hotSpots) {
          try {
            // Asegurar que los hotspots se actualicen en el visor
            const updatedHotspots = [...currentScene.hotSpots].map(hotspot => {
              const isSelected = selectedHotspotId === hotspot.id;
              
              return {
                ...hotspot,
                cssClass: hotspot.type === 'scene' 
                  ? `custom-hotspot scene-hotspot ${isSelected ? 'selected-hotspot' : ''}`
                  : `custom-hotspot info-hotspot ${isSelected ? 'selected-hotspot' : ''}`,
              };
            });
            
            // Agregar el nuevo hotspot si aún no está en la lista
            const newHotspotId = currentScene.hotSpots[currentScene.hotSpots.length - 1]?.id;
            const newHotspotWithId = currentScene.hotSpots.find(h => h.id === newHotspotId);
            
            if (newHotspotWithId) {
              // Esto asegura que estamos utilizando datos actualizados
              pannellumRef.current.setHotSpots([]); // Eliminar todos los hotspots primero
              pannellumRef.current.setHotSpots(updatedHotspots); // Luego agregar todos de nuevo
              
              // Mostrar mensaje de confirmación
              const confirmMsg = document.createElement('div');
              confirmMsg.style.cssText = `
                position: fixed;
                bottom: 70px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 150, 0, 0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 30px;
                font-size: 14px;
                z-index: 2000;
                animation: fadeInOut 2.5s forwards;
              `;
              confirmMsg.innerHTML = `<span style="margin-right: 8px;">✓</span> Punto de acceso creado exitosamente`;
              document.body.appendChild(confirmMsg);
              
              if (!document.getElementById('fadeInOut-animation')) {
                const style = document.createElement('style');
                style.id = 'fadeInOut-animation';
                style.innerHTML = `
                  @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, 20px); }
                    15% { opacity: 1; transform: translate(-50%, 0); }
                    85% { opacity: 1; transform: translate(-50%, 0); }
                    100% { opacity: 0; transform: translate(-50%, -20px); }
                  }
                `;
                document.head.appendChild(style);
              }
              
              setTimeout(() => {
                if (document.body.contains(confirmMsg)) {
                  document.body.removeChild(confirmMsg);
                }
              }, 2500);
            }
          } catch (error) {
            console.error("Error al actualizar hotspots en el visor:", error);
          }
        }
      };
      
      // Establecer la función de callback
      setCreateHotspotCallback(() => createHotspotHere);
      
    } catch (error) {
      console.error("Error al procesar las coordenadas del hotspot:", error);
      setShowSceneSelectionModal(false);
    }
  // Removemos clickedOnHotspot de las dependencias y usamos un comentario para ESLint
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pannellumRef, currentScene, showSceneSelectionModal, tour.scenes, addHotSpot, selectedHotspotId]);

  // Función segura de navegación entre escenas
  const navigateToScene = useCallback((sceneId: string | undefined) => {
    if (!sceneId || !pannellumRef.current) return;

    // Verificar que la escena destino existe
    const targetScene = tour.scenes.find(scene => scene.id === sceneId);
    if (!targetScene) {
      console.error("La escena destino no existe:", sceneId);
      return;
    }

    try {
      // Establecer la escena actual en el contexto antes de intentar cargarla en Pannellum
      setCurrentScene(sceneId);

      // Cargar la escena en Pannellum
      pannellumRef.current.loadScene(sceneId);
    } catch (error) {
      console.error("Error al navegar a la escena:", error);
    }
  }, [pannellumRef, tour.scenes, setCurrentScene]);

  // Convertir los hotspots para mostrarlos en Pannellum
  const convertHotspotsToPannellum = useCallback(() => {
    if (!currentScene || !currentScene.hotSpots) return [];
    
    return currentScene.hotSpots.map(hotspot => {
      const isSelected = selectedHotspotId === hotspot.id;
      
      const pannellumHotspot: PannellumHotSpot = {
        ...hotspot,
        cssClass: hotspot.type === 'scene' 
          ? `custom-hotspot scene-hotspot ${isSelected ? 'selected-hotspot' : ''}`
          : `custom-hotspot info-hotspot ${isSelected ? 'selected-hotspot' : ''}`,
        createTooltipFunc: (hotSpotDiv: HTMLElement) => {
          // Hacer que los hotspots sean seleccionables
          hotSpotDiv.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Si el hotspot tiene una escena asociada, navegar a ella
            if (hotspot.sceneId && hotspot.type === 'scene') {
              // Usar la función segura de navegación
              navigateToScene(hotspot.sceneId);
              return;
            }
            
            // Seleccionar el hotspot
            setClickedOnHotspot(true);
            setSelectedHotspotId(hotspot.id);
          });
          
          // Crear tooltip
          const tooltip = document.createElement('div');
          tooltip.classList.add('hotspot-tooltip');
          tooltip.innerText = hotspot.text || (hotspot.type === 'scene' ? 'Ir a otra escena' : 'Información');
          hotSpotDiv.appendChild(tooltip);
          
          return tooltip;
        }
      };
      
      return pannellumHotspot;
    });
  }, [currentScene, selectedHotspotId, navigateToScene]);

  // Manejadores de eventos optimizados
  const setupEventHandlers = useCallback(() => {
    const currentViewerRef = document.querySelector('.pnlm-render-container');
    if (!currentViewerRef || !pannellumRef.current) return undefined;

    // Limpiar los manejadores antiguos si existen
    const cleanupEvents = () => {
      if (currentViewerRef) {
        try {
          currentViewerRef.removeEventListener('mousedown', mouseDownHandler as unknown as EventListener);
          currentViewerRef.removeEventListener('mousemove', mouseMoveHandler as unknown as EventListener);
          currentViewerRef.removeEventListener('mouseup', mouseUpHandler as unknown as EventListener);
          currentViewerRef.removeEventListener('click', clickHandler as unknown as EventListener);
          currentViewerRef.removeEventListener('dblclick', dblClickHandler as unknown as EventListener);
        } catch (error) {
          console.warn('Error al limpiar eventos:', error);
        }
      }
    };

    // Limpiamos primero para evitar duplicados
    cleanupEvents();

    // Manejador de mousedown optimizado
    const mouseDownHandler = (e: Event) => {
      try {
        const mouseEvent = e as MouseEvent;
        // No interferir con los controles de Pannellum
        const target = mouseEvent.target as HTMLElement;
        if (target.closest('.pnlm-controls') || 
            target.closest('.pnlm-ui')) {
          return; // Permitir que Pannellum maneje estos eventos
        }
        
        // Verificar si se hizo clic en un hotspot
        if (target.classList.contains('custom-hotspot') || 
            target.closest('.custom-hotspot')) {
          setClickedOnHotspot(true);
          return;
        }
        
        // Solo activar el seguimiento para creación de hotspots
        setIsMouseDown(true);
        setHasMoved(false);
      } catch (error) {
        console.warn('Error en mouseDownHandler:', error);
      }
    };
    
    // Manejador de mousemove simplificado
    const mouseMoveHandler = throttle((e: Event) => {
      try {
        if (isMouseDown) {
          setHasMoved(true);
        }
      } catch (error) {
        console.warn('Error en mouseMoveHandler:', error);
      }
    }, 50); // Throttle para reducir actualizaciones
    
    // Manejador de mouseup para resetear estado
    const mouseUpHandler = (e: Event) => {
      try {
        setIsMouseDown(false);
      } catch (error) {
        console.warn('Error en mouseUpHandler:', error);
      }
    };

    // Nuevo manejador de clic para crear hotspots en modo de creación
    const clickHandler = (e: Event) => {
      try {
        const mouseEvent = e as MouseEvent;
        const target = mouseEvent.target as HTMLElement;
        
        // No interferir con controles o UI
        if (target.closest('.pnlm-controls') || 
            target.closest('.pnlm-ui') ||
            !isHotspotCreationMode) {
          return;
        }
        
        // Verificar si se hizo clic en un hotspot existente
        if (target.classList.contains('custom-hotspot') || 
            target.closest('.custom-hotspot')) {
          return;
        }
        
        // Para evitar la creación accidental con arrastre
        if (hasMoved) {
          return;
        }
        
        // Solo crear hotspot si estamos en modo creación
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        
        // Procesar el clic para crear el hotspot
        handlePanoramaClick(mouseEvent);
      } catch (error) {
        console.warn('Error en clickHandler:', error);
      }
    };
    
    // Manejador de doble clic optimizado (se mantiene para compatibilidad)
    const dblClickHandler = (e: Event) => {
      try {
        const mouseEvent = e as MouseEvent;
        const target = mouseEvent.target as HTMLElement;
        
        // No interferir con controles o UI
        if (target.closest('.pnlm-controls') || 
            target.closest('.pnlm-ui')) {
          return;
        }
        
        // Verificar si se hizo clic en un hotspot existente
        if (target.classList.contains('custom-hotspot') || 
            target.closest('.custom-hotspot')) {
          setClickedOnHotspot(true);
          return;
        }
        
        // Crear hotspot al hacer doble clic, sin importar el modo
        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
        
        // Activar el modo de creación si no está activo
        if (!isHotspotCreationMode) {
          setIsHotspotCreationMode(true);
        }
        
        // Procesar el clic para crear el hotspot
        handlePanoramaClick(mouseEvent);
        
        setClickedOnHotspot(false);
      } catch (error) {
        console.warn('Error en dblClickHandler:', error);
      }
    };

    // Añadir eventos con opciones para mejorar rendimiento
    try {
      currentViewerRef.addEventListener('mousedown', mouseDownHandler as unknown as EventListener, { passive: true });
      currentViewerRef.addEventListener('mousemove', mouseMoveHandler as unknown as EventListener, { passive: true });
      currentViewerRef.addEventListener('mouseup', mouseUpHandler as unknown as EventListener, { passive: true });
      currentViewerRef.addEventListener('click', clickHandler as unknown as EventListener);
      currentViewerRef.addEventListener('dblclick', dblClickHandler as unknown as EventListener);

      // Manejar clic en fondo para deseleccionar hotspot
      if (pannellumRef.current) {
        const viewer = pannellumRef.current;
        viewer.on('mousedown', function(e: any) {
          try {
            // Solo deseleccionar si es un clic en el fondo y hay un hotspot seleccionado
            const target = e.target as HTMLElement;
            if (!target.classList.contains('custom-hotspot') && 
                !target.closest('.custom-hotspot') && 
                !target.closest('.pnlm-controls') &&
                selectedHotspotId !== null) {
              setSelectedHotspotId(null);
            }
          } catch (error) {
            console.warn('Error en evento mousedown de pannellum:', error);
          }
        });
      }
    } catch (error) {
      console.warn('Error al configurar eventos:', error);
    }

    return cleanupEvents;
  // Eliminamos clickedOnHotspot de las dependencias ya que se gestiona dentro de la función
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isHotspotCreationMode, 
    isMouseDown, 
    setIsMouseDown, 
    setHasMoved, 
    setClickedOnHotspot, 
    handlePanoramaClick, 
    selectedHotspotId, 
    setSelectedHotspotId,
    hasMoved
  ]);

  // Agregar un hotspot al visor con manejo de errores
  const addHotSpotToViewer = useCallback((hotspot: PannellumHotSpot) => {
    if (!pannellumRef.current) return;
    try {
      pannellumRef.current.addHotSpot(hotspot);
    } catch (error) {
      console.warn('Error al añadir hotspot al visor:', error);
    }
  }, [pannellumRef]);

  // Aplicar efecto tiny planet con manejo de errores
  const applyTinyPlanetEffect = useCallback(() => {
    if (!pannellumRef.current) return;
    
    try {
      // Configurar la vista para el efecto tiny planet
      pannellumRef.current.setHfov(120);
      pannellumRef.current.setPitch(-90);
    } catch (error) {
      console.warn('Error al aplicar efecto tiny planet:', error);
    }
  }, [pannellumRef]);

  // Inicializar el visor Pannellum
  const initPannellumViewer = useCallback(() => {
    if (!viewerRef.current || !currentScene || !currentScene.imageUrl) return;
    
    try {
      // Eliminar visor existente si hay uno
      if (pannellumRef.current) {
        pannellumRef.current.remove();
        pannellumRef.current = null;
      }

      // Configuración optimizada del visor
      const config = {
        type: 'equirectangular',
        panorama: currentScene.imageUrl,
        autoLoad: true,
        showControls: true,
        hotSpotDebug: false,
        friction: 0.2, // Reducir fricción para una experiencia más suave
        mouseZoom: true,
        touchPanEnabled: true,
        disableKeyboardCtrl: false,
        backgroundColor: [0, 0, 0],
        hfov: 100, // Campo de visión horizontal
        minHfov: 50,  // Mínimo campo de visión (más zoom)
        maxHfov: 120, // Máximo campo de visión (menos zoom)
        multiResMinHfov: false,
        draggable: true, // Asegurar que el arrastre esté habilitado
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        keyboardZoom: true,
        doubleClickZoom: false // Desactivar zoom con doble clic para evitar conflictos
      };

      // Inicializar con configuración optimizada
      pannellumRef.current = window.pannellum.viewer(
        viewerRef.current,
        config
      );

      // Agregar hotspots después de que el visor se haya cargado completamente
      pannellumRef.current.on('load', () => {
        try {
          // Limpiar el indicador de carga
          setIsLoading(false);
          
          // Añadir hotspots existentes
          const hotspots = convertHotspotsToPannellum();
          if (hotspots && hotspots.length > 0) {
            hotspots.forEach((hotspot) => {
              addHotSpotToViewer(hotspot);
            });
          }

          // Optimización importante: aplicar throttle a los eventos de renderizado
          pannellumRef.current.on('render', throttle(() => {
            if (isTinyPlanet) {
              applyTinyPlanetEffect();
            }
          }, 100)); // Throttle de 100ms para evitar demasiados re-renderizados
        } catch (error) {
          console.warn('Error en evento load de pannellum:', error);
          setIsLoading(false);
        }
      });

      // Mostrar indicador de carga
      setIsLoading(true);
    } catch (error) {
      console.error('Error al inicializar el visor de Pannellum:', error);
      setIsLoading(false);
    }
  }, [viewerRef, currentScene, isTinyPlanet, convertHotspotsToPannellum, addHotSpotToViewer, applyTinyPlanetEffect, setIsLoading]);

  // Efecto para configurar el visor y los manejadores de eventos
  useEffect(() => {
    if (!currentScene || typeof window === 'undefined' || !window.pannellum) {
      console.warn('Pannellum no está disponible o no hay escena actual');
      return;
    }
    
    // Mostrar indicador de carga
    setIsLoading(true);
    
    // Restablecer estados para evitar comportamientos no deseados
    setIsMouseDown(false);
    setHasMoved(false);
    setClickedOnHotspot(false);
    setShowSceneSelectionModal(false);
    
    try {
      // Inicializar el visor
      initPannellumViewer();
      
      // Configurar manejadores de eventos una vez que el visor esté listo
      const cleanup = setupEventHandlers();
      
      return () => {
        // Verificar que cleanup no sea undefined antes de invocarlo
        if (cleanup) {
          cleanup();
        }
        if (pannellumRef.current) {
          try {
            pannellumRef.current.destroy();
          } catch (error) {
            console.warn('Error al destruir el visor de Pannellum:', error);
          }
          pannellumRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error en el efecto principal:', error);
      setIsLoading(false);
    }
  }, [currentScene, initPannellumViewer, setupEventHandlers]);

  // Efecto para manejar el evento de conexión cuando se selecciona una escena en el modal
  useEffect(() => {
    if (selectedSceneConnection && createHotspotCallback) {
      // Si se ha seleccionado una escena y existe la función de callback, crear el hotspot
      createHotspotCallback(selectedSceneConnection);
    }
  }, [selectedSceneConnection, createHotspotCallback]);

  // Actualizar hotspots en el visor cuando se crea uno nuevo o se elimina
  useEffect(() => {
    if (pannellumRef.current && currentScene && currentScene.hotSpots) {
      try {
        const hotspots = convertHotspotsToPannellum();
        
        // Eliminar todos los hotspots existentes primero
        // Pannellum no tiene método removeHotSpots, así que eliminamos cada uno individualmente
        // o utilizamos setHotSpots con un array vacío y luego los añadimos manualmente
        pannellumRef.current.setHotSpots([]); // Eliminar todos los hotspots con array vacío
        
        // Añadir los hotspots actualizados
        hotspots.forEach(hotspot => {
          addHotSpotToViewer(hotspot);
        });
      } catch (error) {
        console.warn('Error al actualizar hotspots en el visor:', error);
      }
    }
  }, [currentScene?.hotSpots, addHotSpotToViewer, convertHotspotsToPannellum, currentScene, pannellumRef]);

  return (
    <ViewerContainer style={{ width, height }}>
      <div ref={viewerRef} style={{ width: '100%', height: '100%' }} />
      
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>Optimizando imagen...</LoadingText>
        </LoadingOverlay>
      )}
      
      {!currentScene && (
        <NoSceneMessage>
          <p>No hay imágenes panorámicas para mostrar.</p>
          <p>Agrega una imagen desde el panel lateral.</p>
        </NoSceneMessage>
      )}
      
      {currentScene && (
        <>
          <ViewerControls>
            <ViewerControlButton 
              onClick={toggleTinyPlanet}
              active={isTinyPlanet}
              title={isTinyPlanet ? "Vista normal" : "Tiny Planet"}
            >
              <span>🌎</span>
            </ViewerControlButton>
            
            <ViewerControlButton 
              onClick={toggleHotspotCreationMode}
              active={isHotspotCreationMode}
              title={isHotspotCreationMode ? "Desactivar creación de puntos de acceso" : "Activar creación de puntos de acceso"}
            >
              <IconContext.Provider value={{ size: '16px' }}>
                <FaPlus />
              </IconContext.Provider>
            </ViewerControlButton>
            
            {selectedHotspotId && (
              <ViewerControlButton 
                onClick={handleDeleteSelectedHotspot}
                title="Eliminar punto de acceso seleccionado"
              >
                <IconContext.Provider value={{ size: '16px' }}>
                  <FaTrash />
                </IconContext.Provider>
              </ViewerControlButton>
            )}
            
            <ModeIndicator active={isHotspotCreationMode}>
              {isHotspotCreationMode 
                ? `Modo creación` 
                : selectedHotspotId 
                  ? 'Hotspot seleccionado'
                  : 'Modo visualización'}
            </ModeIndicator>
          </ViewerControls>
          
          {isHotspotCreationMode && !showSceneSelectionModal && (
            <HelpTooltip>
              <FaLightbulb size={16} color="#FFD700" />
              <HelpTooltipText>
                <p>Haz <strong>doble clic</strong> en cualquier parte para crear un punto de acceso</p>
              </HelpTooltipText>
            </HelpTooltip>
          )}
          
          {!isHotspotCreationMode && !showSceneSelectionModal && (
            <HelpTooltip style={{ opacity: 0.7, bottom: '20px', right: '20px', left: 'auto' }}>
              <FaLightbulb size={16} color="#FFD700" />
              <HelpTooltipText>
                <p>Doble clic para crear punto de acceso</p>
              </HelpTooltipText>
            </HelpTooltip>
          )}
          
          {/* Modal para seleccionar escena de destino */}
          {showSceneSelectionModal && (
            <>
              <ModalOverlay onClick={() => {
                setShowSceneSelectionModal(false);
                setSelectedSceneConnection(null);
              }} />
              <ConnectionPanel>
                <ConnectionPanelHeader>
                  <h3>Seleccionar destino del punto</h3>
                  <CloseButton onClick={() => {
                    setShowSceneSelectionModal(false);
                    setSelectedSceneConnection(null);
                  }}>
                    <IconContext.Provider value={{ size: '20px' }}>
                      <FaTimes />
                    </IconContext.Provider>
                  </CloseButton>
                </ConnectionPanelHeader>
                
                <ConnectionInstructions>
                  Elige la imagen panorámica a la que este punto conectará:
                </ConnectionInstructions>
                
                <ConnectionList>
                  {tour.scenes
                    .filter(scene => scene.id !== currentScene.id) // Filtrar la escena actual
                    .map(scene => (
                      <ConnectionItem 
                        key={scene.id}
                        selected={selectedSceneConnection === scene.id}
                        onClick={() => setSelectedSceneConnection(scene.id)}
                      >
                        <ConnectionPreview>
                          <img src={scene.imageUrl} alt={scene.title} />
                        </ConnectionPreview>
                        <ConnectionTitle>{scene.title}</ConnectionTitle>
                      </ConnectionItem>
                    ))}
                </ConnectionList>
                
                {tour.scenes.length <= 1 && (
                  <NoScenesMessage>
                    No hay otras imágenes disponibles para conectar.
                    Añade más escenas desde el panel lateral.
                  </NoScenesMessage>
                )}
                
                <ConnectionButton 
                  onClick={() => {
                    if (selectedSceneConnection && createHotspotCallback) {
                      createHotspotCallback(selectedSceneConnection);
                    }
                  }}
                  disabled={!selectedSceneConnection}
                >
                  <IconContext.Provider value={{ size: '16px' }}>
                    <FaLink />
                  </IconContext.Provider>
                  <span>Crear conexión entre puntos</span>
                </ConnectionButton>
              </ConnectionPanel>
            </>
          )}
        </>
      )}
    </ViewerContainer>
  );
};

const ViewerContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 200;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 15px;
  color: white;
  font-size: 16px;
`;

const NoSceneMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 1.5rem;
  text-align: center;
  padding: 20px;
`;

const ViewerControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 10;
`;

const ViewerControlButton = styled.button<{ active?: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${props => props.active ? 'rgba(74, 144, 226, 0.9)' : 'rgba(0, 0, 0, 0.5)'};
  border: 2px solid ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(74, 144, 226, 0.7);
    border-color: white;
  }
`;

const ModeIndicator = styled.div<{ active?: boolean }>`
  background-color: ${props => props.active ? 'rgba(74, 144, 226, 0.8)' : 'rgba(0, 0, 0, 0.5)'};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  font-size: 12px;
  border: 1px solid ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConnectionPanel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-height: 80vh;
  background-color: rgba(17, 25, 40, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  padding: 25px;
  color: white;
  z-index: 100;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -48%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
`;

const ConnectionPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 15px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 500;
    color: #4a90e2;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ConnectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 50vh;
  margin-bottom: 20px;
  padding-right: 10px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

const ConnectionItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? 'rgba(74, 144, 226, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.selected ? 'rgba(255, 255, 255, 0.6)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.selected ? 'rgba(74, 144, 226, 0.7)' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ConnectionPreview = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ConnectionTitle = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
`;

const ConnectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-top: 10px;
  
  &:hover {
    background-color: #357abd;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: rgba(74, 144, 226, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const NoScenesMessage = styled.div`
  text-align: center;
  padding: 25px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  backdrop-filter: blur(2px);
`;

const ConnectionInstructions = styled.p`
  margin: 0 0 15px 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
`;

const HelpTooltip = styled.div`
  position: absolute;
  bottom: 80px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 250px;
  transform: translateY(0);
  transition: transform 0.3s ease;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

const HelpTooltipText = styled.div`
  color: white;
  font-size: 12px;
  
  p {
    margin: 4px 0;
  }
`;

export default PannellumViewer; 