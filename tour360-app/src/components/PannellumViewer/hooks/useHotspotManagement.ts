import { useCallback, MutableRefObject } from 'react';
import { PannellumHotSpot } from '../types';

/**
 * Hook para gestionar hotspots en el visor Pannellum
 */
export const useHotspotManagement = (pannellumRef: MutableRefObject<any>) => {
  // Función para convertir hotspots al formato Pannellum
  const convertHotspotsToPannellum = useCallback((
    hotspots: any[] | undefined, 
    selectedHotspotId: string | null,
    navigationCallback: (sceneId: string) => void
  ) => {
    if (!hotspots) return [];
    
    return hotspots.map(hotspot => {
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
              navigationCallback(hotspot.sceneId);
              return;
            }
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
  }, []);
  
  // Agregar un hotspot al visor con manejo de errores
  const addHotSpotToViewer = useCallback((hotspot: PannellumHotSpot) => {
    if (!pannellumRef.current) return;
    try {
      pannellumRef.current.addHotSpot(hotspot);
    } catch (error) {
      console.warn('Error al añadir hotspot al visor:', error);
    }
  }, [pannellumRef]);
  
  // Actualizar todos los hotspots en el visor
  const updateHotspotsInViewer = useCallback((
    hotspots: any[] | undefined, 
    selectedHotspotId: string | null,
    navigationCallback: (sceneId: string) => void
  ) => {
    if (!pannellumRef.current || !hotspots) return;
    
    try {
      const pannellumHotspots = convertHotspotsToPannellum(hotspots, selectedHotspotId, navigationCallback);
      
      // Eliminar todos los hotspots existentes primero
      pannellumRef.current.setHotSpots([]); 
      
      // Añadir los hotspots actualizados
      pannellumHotspots.forEach(hotspot => {
        addHotSpotToViewer(hotspot);
      });
    } catch (error) {
      console.warn('Error al actualizar hotspots en el visor:', error);
    }
  }, [pannellumRef, convertHotspotsToPannellum, addHotSpotToViewer]);
  
  // Crear un indicador visual para un clic
  const createClickIndicator = useCallback((clientX: number, clientY: number) => {
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
    clickIndicator.style.left = `${clientX}px`;
    clickIndicator.style.top = `${clientY}px`;
    
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
  }, []);

  // Mostrar mensaje de confirmación
  const showConfirmationMessage = useCallback((message: string) => {
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
    confirmMsg.innerHTML = `<span style="margin-right: 8px;">✓</span> ${message}`;
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
  }, []);
  
  return {
    convertHotspotsToPannellum,
    addHotSpotToViewer,
    updateHotspotsInViewer,
    createClickIndicator,
    showConfirmationMessage
  };
};

export default useHotspotManagement; 