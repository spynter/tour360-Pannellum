import React, { useState } from 'react';
import { IconContext } from 'react-icons';
import { FaLink, FaTimes } from 'react-icons/fa';
import {
  ConnectionPanel,
  ConnectionPanelHeader,
  CloseButton,
  ConnectionList,
  ConnectionItem,
  ConnectionPreview,
  ConnectionTitle,
  NoScenesMessage,
  ConnectionButton,
  ModalOverlay,
  ConnectionInstructions
} from '../styles';

interface ConnectionModalProps {
  scenes: any[];
  currentSceneId: string;
  onClose: () => void;
  onConfirm: (sceneId: string) => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  scenes,
  currentSceneId,
  onClose,
  onConfirm
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  
  // Filtrar la escena actual
  const availableScenes = scenes.filter(scene => scene.id !== currentSceneId);

  return (
    <>
      <ModalOverlay onClick={onClose} />
      <ConnectionPanel>
        <ConnectionPanelHeader>
          <h3>Seleccionar destino del punto</h3>
          <CloseButton onClick={onClose}>
            <IconContext.Provider value={{ size: '20px' }}>
              <FaTimes />
            </IconContext.Provider>
          </CloseButton>
        </ConnectionPanelHeader>
        
        <ConnectionInstructions>
          Elige la imagen panorámica a la que este punto conectará:
        </ConnectionInstructions>
        
        <ConnectionList>
          {availableScenes.map(scene => (
            <ConnectionItem 
              key={scene.id}
              selected={selectedSceneId === scene.id}
              onClick={() => setSelectedSceneId(scene.id)}
            >
              <ConnectionPreview>
                <img src={scene.imageUrl} alt={scene.title} />
              </ConnectionPreview>
              <ConnectionTitle>{scene.title}</ConnectionTitle>
            </ConnectionItem>
          ))}
        </ConnectionList>
        
        {availableScenes.length === 0 && (
          <NoScenesMessage>
            No hay otras imágenes disponibles para conectar.
            Añade más escenas desde el panel lateral.
          </NoScenesMessage>
        )}
        
        <ConnectionButton 
          onClick={() => selectedSceneId && onConfirm(selectedSceneId)}
          disabled={!selectedSceneId}
        >
          <IconContext.Provider value={{ size: '16px' }}>
            <FaLink />
          </IconContext.Provider>
          <span>Crear conexión entre puntos</span>
        </ConnectionButton>
      </ConnectionPanel>
    </>
  );
};

export default ConnectionModal; 