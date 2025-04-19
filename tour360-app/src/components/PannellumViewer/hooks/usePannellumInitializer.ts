import { useCallback, RefObject, MutableRefObject } from 'react';

/**
 * Hook para inicializar el visor Pannellum
 */
export const usePannellumInitializer = () => {
  // Función para inicializar el visor Pannellum
  const initPannellumViewer = useCallback((
    viewerRef: MutableRefObject<HTMLDivElement | null>,
    imageUrl: string | undefined,
    pannellumRef: RefObject<any>,
    onLoad: () => void
  ) => {
    if (!viewerRef.current || !imageUrl) return null;
    
    try {
      // Eliminar visor existente si hay uno
      if (pannellumRef.current) {
        pannellumRef.current.remove();
        pannellumRef.current = null;
      }

      // Configuración optimizada del visor
      const config = {
        type: 'equirectangular',
        panorama: imageUrl,
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

      // Comprobar que Pannellum está disponible
      if (!window.pannellum) {
        console.error('Pannellum no está disponible');
        return null;
      }

      // Inicializar con configuración optimizada
      const viewer = window.pannellum.viewer(
        viewerRef.current,
        config
      );

      // Agregar evento de carga
      viewer.on('load', onLoad);

      return viewer;
    } catch (error) {
      console.error('Error al inicializar el visor de Pannellum:', error);
      return null;
    }
  }, []);

  // Agregar estilos globales para el visor
  const addPannellumStyles = useCallback(() => {
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

  return {
    initPannellumViewer,
    addPannellumStyles
  };
};

export default usePannellumInitializer; 