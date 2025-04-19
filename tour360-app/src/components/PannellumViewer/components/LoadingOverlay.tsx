import React from 'react';
import { LoadingOverlay as LoadingOverlayStyled, LoadingSpinner, LoadingText } from '../styles';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Optimizando imagen...' 
}) => {
  return (
    <LoadingOverlayStyled>
      <LoadingSpinner />
      <LoadingText>{message}</LoadingText>
    </LoadingOverlayStyled>
  );
};

export default LoadingOverlay; 