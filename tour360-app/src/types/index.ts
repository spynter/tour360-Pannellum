export interface PanoramaImage {
  id: string;
  title: string;
  imageUrl: string;
  hotSpots?: HotSpot[];
}

export interface HotSpot {
  id: string;
  pitch: number;
  yaw: number;
  type: 'info' | 'scene';
  text?: string;
  sceneId?: string;
  cssClass?: string;
}

export interface Tour {
  id: string;
  name: string;
  scenes: PanoramaImage[];
  currentSceneId: string;
}

// Interfaz para guardar la posición de la vista
export interface ViewPosition {
  pitch: number;
  yaw: number;
  hfov: number;
} 