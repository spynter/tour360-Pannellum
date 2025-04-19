import { useState, useCallback } from 'react';

/**
 * Hook para optimizar imágenes usando canvas para reducir tamaño
 */
export const useImageOptimization = () => {
  // Estado para el cache de imágenes optimizadas
  const [optimizedImageCache, setOptimizedImageCache] = useState<{[key: string]: string}>({});
  
  // Función para optimizar imágenes
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
  
  // Función para precargar escenas conectadas
  const preloadConnectedScenes = useCallback((connectedSceneIds: string[], scenes: any[]) => {
    // Precargar cada escena conectada solo si no están ya en caché
    connectedSceneIds.forEach(sceneId => {
      const sceneToPreload = scenes.find(scene => scene.id === sceneId);
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
  }, [optimizeImage, optimizedImageCache]);

  return {
    optimizedImageCache,
    optimizeImage,
    preloadConnectedScenes
  };
};

export default useImageOptimization; 