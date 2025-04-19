import styled from 'styled-components';

export const ViewerContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 200;
`;

export const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.div`
  margin-top: 15px;
  color: white;
  font-size: 16px;
`;

export const NoSceneMessage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 1.5rem;
  text-align: center;
  padding: 20px;
`;

export const ViewerControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 10;
`;

export const ViewerControlButton = styled.button<{ active?: boolean }>`
  width: 40px;
  height: 40px;
  background-color: ${props => props.active ? 'rgba(74, 144, 226, 0.9)' : 'rgba(0, 0, 0, 0.5)'};
  border: 2px solid ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(74, 144, 226, 0.7);
    border-color: white;
  }
`;

export const ModeIndicator = styled.div<{ active?: boolean }>`
  background-color: ${props => props.active ? 'rgba(74, 144, 226, 0.8)' : 'rgba(0, 0, 0, 0.5)'};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  font-size: 12px;
  border: 1px solid ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.3)'};
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Estilos para el panel de conexión
export const ConnectionPanel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  max-height: 80vh;
  background-color: rgba(17, 25, 40, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  padding: 25px;
  color: white;
  z-index: 100;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translate(-50%, -48%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
`;

export const ConnectionPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 15px;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 500;
    color: #4a90e2;
  }
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

export const ConnectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 50vh;
  margin-bottom: 20px;
  padding-right: 10px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.4);
    }
  }
`;

export const ConnectionItem = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.selected ? 'rgba(74, 144, 226, 0.6)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.selected ? 'rgba(255, 255, 255, 0.6)' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.selected ? 'rgba(74, 144, 226, 0.7)' : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const ConnectionPreview = styled.div`
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ConnectionTitle = styled.div`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
`;

export const ConnectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-top: 10px;
  
  &:hover {
    background-color: #357abd;
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: rgba(74, 144, 226, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const NoScenesMessage = styled.div`
  text-align: center;
  padding: 25px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin-bottom: 20px;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  backdrop-filter: blur(2px);
`;

export const ConnectionInstructions = styled.p`
  margin: 0 0 15px 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
`;

export const HelpTooltip = styled.div`
  position: absolute;
  bottom: 80px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 250px;
  transform: translateY(0);
  transition: transform 0.3s ease;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

export const HelpTooltipText = styled.div`
  color: white;
  font-size: 12px;
  
  p {
    margin: 4px 0;
  }
`; 