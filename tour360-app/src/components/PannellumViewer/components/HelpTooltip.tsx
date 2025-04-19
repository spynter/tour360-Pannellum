import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
import { HelpTooltip as HelpTooltipStyled, HelpTooltipText } from '../styles';

interface HelpTooltipProps {
  text: string;
  position?: 'bottom-left' | 'bottom-right';
  style?: React.CSSProperties;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  text,
  position = 'bottom-left',
  style = {}
}) => {
  // Configurar la posición del tooltip
  const positionStyles: React.CSSProperties = 
    position === 'bottom-right' 
      ? { bottom: '20px', right: '20px', left: 'auto' } 
      : { bottom: '80px', left: '20px' };
  
  // Combinar los estilos
  const combinedStyles = {
    ...positionStyles,
    ...style
  };

  return (
    <HelpTooltipStyled style={combinedStyles}>
      <FaLightbulb size={16} color="#FFD700" />
      <HelpTooltipText>
        <p dangerouslySetInnerHTML={{ __html: text }}></p>
      </HelpTooltipText>
    </HelpTooltipStyled>
  );
};

export default HelpTooltip; 