import React from 'react';
import { NoSceneMessage as NoSceneMessageStyled } from '../styles';

interface NoSceneMessageProps {
  message?: string;
  subMessage?: string;
}

const NoSceneMessage: React.FC<NoSceneMessageProps> = ({
  message = 'No hay imágenes panorámicas para mostrar.',
  subMessage = 'Agrega una imagen desde el panel lateral.'
}) => {
  return (
    <NoSceneMessageStyled>
      <p>{message}</p>
      <p>{subMessage}</p>
    </NoSceneMessageStyled>
  );
};

export default NoSceneMessage; 