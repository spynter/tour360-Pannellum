import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TourProvider } from './contexts/TourContext';
import PannellumViewer from './components/PannellumViewer';
import SidePanel from './components/SidePanel';
import './App.css';

const App: React.FC = () => {
  // Estado para mostrar/ocultar el onboarding
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Comprobar si es la primera visita
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('tour360_hasVisited');
    if (!hasVisitedBefore) {
      setShowOnboarding(true);
      localStorage.setItem('tour360_hasVisited', 'true');
    }
  }, []);

  return (
    <TourProvider>
      <AppContainer>
        <PannellumViewer />
        <SidePanel />
        
        {showOnboarding && (
          <>
            <OnboardingOverlay onClick={() => setShowOnboarding(false)} />
            <OnboardingPanel>
              <OnboardingHeader>
                <h2>Bienvenido a Tour360</h2>
                <CloseButton onClick={() => setShowOnboarding(false)}>×</CloseButton>
              </OnboardingHeader>
              
              <OnboardingContent>
                <h3>Crea tours virtuales en 3 sencillos pasos:</h3>
                
                <OnboardingStep>
                  <StepIcon>1</StepIcon>
                  <div>
                    <h4>Añade imágenes panorámicas</h4>
                    <p>Sube tus fotos 360° desde el panel lateral.</p>
                  </div>
                </OnboardingStep>
                
                <OnboardingStep>
                  <StepIcon>2</StepIcon>
                  <div>
                    <h4>Crea puntos de conexión</h4>
                    <p>Conecta tus escenas con puntos interactivos.</p>
                  </div>
                </OnboardingStep>
                
                <OnboardingStep>
                  <StepIcon>3</StepIcon>
                  <div>
                    <h4>Exporta e integra</h4>
                    <p>Guarda tu tour y añádelo a tu sitio web.</p>
                  </div>
                </OnboardingStep>
                
                <GetStartedButton onClick={() => setShowOnboarding(false)}>
                  ¡Comenzar ahora!
                </GetStartedButton>
                
                <HelpTip>
                  Para más ayuda, visita la pestaña "Ayuda" en el panel lateral.
                </HelpTip>
              </OnboardingContent>
            </OnboardingPanel>
          </>
        )}
      </AppContainer>
    </TourProvider>
  );
};

const AppContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const OnboardingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
`;

const OnboardingPanel = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  background-color: white;
  border-radius: 12px;
  z-index: 1001;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const OnboardingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #4a90e2;
  color: white;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
`;

const OnboardingContent = styled.div`
  padding: 20px;
  color: #333;
  
  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 1.2rem;
  }
`;

const OnboardingStep = styled.div`
  display: flex;
  margin-bottom: 15px;
  align-items: center;
  
  h4 {
    margin: 0 0 5px 0;
    font-size: 1.1rem;
    color: #4a90e2;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const StepIcon = styled.div`
  width: 30px;
  height: 30px;
  background-color: #4a90e2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
`;

const GetStartedButton = styled.button`
  display: block;
  width: 100%;
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  margin: 25px 0 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #357abd;
  }
`;

const HelpTip = styled.p`
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

export default App;
