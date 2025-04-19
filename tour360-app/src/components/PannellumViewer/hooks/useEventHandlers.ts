import { useCallback, MutableRefObject } from 'react';
import { throttle } from 'lodash';

/**
 * Hook para gestionar eventos del visor Pannellum
 */
export const useEventHandlers = (
  pannellumRef: MutableRefObject<any>,
  isHotspotCreationMode: boolean,
  setClickedOnHotspot: (value: boolean) => void,
  setSelectedHotspotId: (id: string | null) => void,
  handlePanoramaClick: (e: MouseEvent) => void
) => {
  // Configurar manejadores de eventos
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

    // Variables de estado para los eventos
    let isMouseDown = false;
    let hasMoved = false;

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
        isMouseDown = true;
        hasMoved = false;
      } catch (error) {
        console.warn('Error en mouseDownHandler:', error);
      }
    };
    
    // Manejador de mousemove simplificado
    const mouseMoveHandler = throttle((e: Event) => {
      try {
        if (isMouseDown) {
          hasMoved = true;
        }
      } catch (error) {
        console.warn('Error en mouseMoveHandler:', error);
      }
    }, 50); // Throttle para reducir actualizaciones
    
    // Manejador de mouseup para resetear estado
    const mouseUpHandler = (e: Event) => {
      try {
        isMouseDown = false;
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
    
    // Manejador de doble clic optimizado
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
                !target.closest('.pnlm-controls')) {
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
  }, [pannellumRef, isHotspotCreationMode, setClickedOnHotspot, setSelectedHotspotId, handlePanoramaClick]);

  return {
    setupEventHandlers
  };
};

export default useEventHandlers;