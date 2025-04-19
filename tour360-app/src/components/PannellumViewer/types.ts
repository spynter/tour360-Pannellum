import { HotSpot, ViewPosition } from '../../types';

// Interfaz para los hotspots específicos de Pannellum que incluye propiedades adicionales
export interface PannellumHotSpot extends HotSpot {
  cssClass?: string;
  createTooltipFunc?: (hotSpotDiv: HTMLElement) => HTMLElement | { div: HTMLElement };
}

export interface PannellumViewerProps {
  width?: string;
  height?: string;
}

// Asegurarnos que Pannellum esté disponible globalmente
declare global {
  interface Window {
    pannellum: any;
  }
} 