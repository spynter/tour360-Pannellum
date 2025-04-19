import React from 'react';
import { IconContext } from 'react-icons';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { ViewerControls as ViewerControlsStyled, ViewerControlButton, ModeIndicator } from '../styles';

interface ViewerControlsProps {
  isTinyPlanet: boolean;
  isHotspotCreationMode: boolean;
  selectedHotspotId: string | null;
  onToggleTinyPlanet: () => void;
  onToggleHotspotCreationMode: () => void;
  onDeleteSelectedHotspot: () => void;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({
  isTinyPlanet,
  isHotspotCreationMode,
  selectedHotspotId,
  onToggleTinyPlanet,
  onToggleHotspotCreationMode,
  onDeleteSelectedHotspot
}) => {
  return (
    <ViewerControlsStyled>
      <ViewerControlButton 
        onClick={onToggleTinyPlanet}
        active={isTinyPlanet}
        title={isTinyPlanet ? "Vista normal" : "Tiny Planet"}
      >
        <span>🌎</span>
      </ViewerControlButton>
      
      <ViewerControlButton 
        onClick={onToggleHotspotCreationMode}
        active={isHotspotCreationMode}
        title={isHotspotCreationMode ? "Desactivar creación de puntos de acceso" : "Activar creación de puntos de acceso"}
      >
        <IconContext.Provider value={{ size: '16px' }}>
          <FaPlus />
        </IconContext.Provider>
      </ViewerControlButton>
      
      {selectedHotspotId && (
        <ViewerControlButton 
          onClick={onDeleteSelectedHotspot}
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
    </ViewerControlsStyled>
  );
};

export default ViewerControls; 