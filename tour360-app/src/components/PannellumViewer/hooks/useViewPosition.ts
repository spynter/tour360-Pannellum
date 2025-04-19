import { useState, useCallback, MutableRefObject } from 'react';
import { ViewPosition } from '../../../types';

/**
 * Hook para manejar la posición de la vista en el visor Pannellum
 */
export const useViewPosition = (pannellumRef: MutableRefObject<any>) => {
  // Estado para guardar la posición actual de la vista
  const [savedViewPosition, setSavedViewPosition] = useState<ViewPosition | null>(null);
  
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
  
  // Función para centrar la vista en un hotspot
  const centerViewOnHotspot = useCallback((hotspotId: string, hotspots?: any[]) => {
    if (!pannellumRef.current || !hotspots) return;
    
    const hotspot = hotspots.find(h => h.id === hotspotId);
    
    if (hotspot) {
      // Centrar la vista en las coordenadas del hotspot
      pannellumRef.current.lookAt(
        hotspot.pitch, // pitch
        hotspot.yaw,   // yaw
        pannellumRef.current.getHfov() // mantener el mismo nivel de zoom
      );
    }
  }, [pannellumRef]);
  
  // Función para aplicar efecto tiny planet
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

  return {
    savedViewPosition,
    saveCurrentViewPosition,
    restoreViewPosition,
    centerViewOnHotspot,
    applyTinyPlanetEffect
  };
};

export default useViewPosition; 