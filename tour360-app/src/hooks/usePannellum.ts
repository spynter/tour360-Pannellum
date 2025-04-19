import { useCallback, useRef } from 'react';
import { HotSpot } from '../types';

// Asegúrate de que Pannellum esté disponible
const Pannellum = require('pannellum');

interface PannellumInstance {
  destroy: () => void;
  lookAt: (pitch: number, yaw: number, hfov: number, animated: boolean) => void;
  getHfov: () => number;
  getPitch: () => number;
  getYaw: () => number;
  getConfig: () => any;
  getViewer: () => HTMLElement;
  addHotSpot: (hotSpot: any, sceneId?: string) => void;
  removeHotSpot: (hotSpotId: string, sceneId?: string) => void;
  setCoordsFromMouseClick: (e: MouseEvent) => [number, number];
  mouseEventToCoords: (e: MouseEvent) => [number, number];
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

export const usePannellum = () => {
  // Referencia a la instancia actual de Pannellum
  const instanceRef = useRef<PannellumInstance | null>(null);

  // Inicializar el visor de Pannellum
  const initViewer = useCallback((
    container: HTMLElement,
    config: any
  ): PannellumInstance => {
    // Destruir la instancia anterior si existe
    if (instanceRef.current) {
      instanceRef.current.destroy();
    }

    // Crear nueva instancia
    const instance = Pannellum.viewer(container, config);
    instanceRef.current = instance;
    return instance;
  }, []);

  // Centrar la vista en un hotspot
  const lookAtHotSpot = useCallback((hotSpot: HotSpot, animated: boolean = true) => {
    if (!instanceRef.current) return;
    
    instanceRef.current.lookAt(
      hotSpot.pitch,
      hotSpot.yaw,
      instanceRef.current.getHfov(),
      animated
    );
  }, []);

  // Obtener coordenadas desde un evento de mouse
  const getCoordinatesFromMouseEvent = useCallback((e: MouseEvent): [number, number] | null => {
    if (!instanceRef.current) return null;
    
    return instanceRef.current.mouseEventToCoords(e);
  }, []);

  // Agregar un hotspot dinámicamente
  const addHotSpot = useCallback((hotSpot: any, sceneId?: string) => {
    if (!instanceRef.current) return;
    
    instanceRef.current.addHotSpot(hotSpot, sceneId);
  }, []);

  // Eliminar un hotspot dinámicamente
  const removeHotSpot = useCallback((hotSpotId: string, sceneId?: string) => {
    if (!instanceRef.current) return;
    
    instanceRef.current.removeHotSpot(hotSpotId, sceneId);
  }, []);

  // Destruir el visor
  const destroyViewer = useCallback(() => {
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }
  }, []);

  return {
    initViewer,
    lookAtHotSpot,
    getCoordinatesFromMouseEvent,
    addHotSpot,
    removeHotSpot,
    destroyViewer,
    getInstance: () => instanceRef.current,
  };
}; 