import React, { useState, useRef, DragEvent } from 'react';
import styled from 'styled-components';
import { FaTimes, FaPlus, FaTrash, FaSave, FaUpload, FaDownload, FaArrowRight, FaLink, FaGlobe } from 'react-icons/fa';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useTour } from '../../contexts/TourContext';
import { PanoramaImage } from '../../types';
// Importamos IconContext para ayudar con el renderizado de iconos
import { IconContext } from 'react-icons';

interface SidePanelProps {
  width?: string;
}

const SidePanel: React.FC<SidePanelProps> = ({ width = '300px' }) => {
  const { 
    tour, 
    isSidePanelOpen, 
    setIsSidePanelOpen, 
    addScene, 
    removeScene, 
    updateScene, 
    setCurrentScene, 
    saveTour, 
    loadTour 
  } = useTour();

  const [newSceneTitle, setNewSceneTitle] = useState('');
  const [newSceneFile, setNewSceneFile] = useState<File | null>(null);
  const [expandedSceneId, setExpandedSceneId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scenes' | 'hotspots' | 'settings' | 'help'>('scenes');

  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Tamaños de iconos consistentes
  const ICON_SIZE_SM = 16;
  const ICON_SIZE_MD = 24;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewSceneFile(e.target.files[0]);
    }
  };

  const handleAddScene = () => {
    if (!newSceneTitle || !newSceneFile) return;

    // Convertir el archivo a URL de datos para evitar problemas con rutas de archivo local
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      
      // Agregar la nueva escena
      addScene({
        title: newSceneTitle,
        imageUrl: base64data,
      });
      
      // Resetear los campos
      setNewSceneTitle('');
      setNewSceneFile(null);
      
      // Limpiar el input de archivos
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    };
    
    reader.readAsDataURL(newSceneFile);
  };

  const handleExportTour = () => {
    // Guardar el tour y generar un archivo JSON para descargar
    const tourData = saveTour();
    const blob = new Blob([tourData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tour.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTour = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const content = reader.result as string;
        loadTour(content);
        
        // Limpiar el input de archivos
        e.target.value = '';
      };
      
      reader.readAsText(file);
    }
  };

  const handleSceneClick = (sceneId: string) => {
    setCurrentScene(sceneId);
  };

  const toggleSceneExpand = (sceneId: string) => {
    setExpandedSceneId(expandedSceneId === sceneId ? null : sceneId);
  };

  const applyTinyPlanetEffect = (sceneId: string) => {
    // La implementación del efecto tiny planet se haría con pannellum
    console.log('Aplicando efecto Tiny Planet a la escena:', sceneId);
    // Esta función se completaría con la implementación real
  };

  // Funciones para manejar el arrastre de archivos
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validar que sea una imagen
      if (file.type.match('image.*')) {
        setNewSceneFile(file);
        // Intenta extraer un nombre para la escena del nombre del archivo
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Quita la extensión
        setNewSceneTitle(fileName);
      }
    }
  };

  return (
    <SidePanelContainer open={isSidePanelOpen} width={width}>
      <GlassPanel />
      <ToggleButton 
        open={isSidePanelOpen}
        onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
      >
        <IconContext.Provider value={{ size: `${ICON_SIZE_MD}px` }}>
          {isSidePanelOpen ? <MdChevronRight /> : <MdChevronLeft />}
        </IconContext.Provider>
      </ToggleButton>
      
      <PanelHeader>
        <h2>Tour 360° Editor</h2>
        <TabContainer>
          <Tab 
            active={activeTab === 'scenes'} 
            onClick={() => setActiveTab('scenes')}
          >
            Escenas
          </Tab>
          <Tab 
            active={activeTab === 'hotspots'} 
            onClick={() => setActiveTab('hotspots')}
          >
            Hotspots
          </Tab>
          <Tab 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          >
            Ajustes
          </Tab>
          <Tab 
            active={activeTab === 'help'} 
            onClick={() => setActiveTab('help')}
          >
            Ayuda
          </Tab>
        </TabContainer>
      </PanelHeader>
      
      <PanelContent>
        {activeTab === 'scenes' && (
          <>
            <ActionButtonsContainer>
              <ImportLabel htmlFor="import-tour">
                <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                  <FaUpload />
                </IconContext.Provider>
                <span>Importar</span>
                <input 
                  id="import-tour" 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportTour} 
                  style={{ display: 'none' }}
                />
              </ImportLabel>
              <ActionButton onClick={handleExportTour}>
                <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                  <FaDownload />
                </IconContext.Provider>
                <span>Exportar</span>
              </ActionButton>
              <ActionButton onClick={saveTour}>
                <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                  <FaSave />
                </IconContext.Provider>
                <span>Guardar</span>
              </ActionButton>
            </ActionButtonsContainer>
            
            <PanelSection>
              <h3>Agregar nueva escena</h3>
              <FormGroup>
                <label htmlFor="scene-title">Título:</label>
                <input
                  id="scene-title"
                  type="text"
                  value={newSceneTitle}
                  onChange={(e) => setNewSceneTitle(e.target.value)}
                  placeholder="Nombre de la escena"
                />
              </FormGroup>
              
              <DropArea 
                ref={dropAreaRef}
                isDragging={isDragging}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => {
                  const fileInput = document.getElementById('file-input');
                  if (fileInput) fileInput.click();
                }}
              >
                <DropAreaContent>
                  {newSceneFile ? (
                    <>
                      <DropAreaIcon>
                        <IconContext.Provider value={{ size: `${ICON_SIZE_MD}px` }}>
                          <FaUpload />
                        </IconContext.Provider>
                      </DropAreaIcon>
                      <DropAreaText>{newSceneFile.name}</DropAreaText>
                    </>
                  ) : (
                    <>
                      <DropAreaIcon>
                        <IconContext.Provider value={{ size: `${ICON_SIZE_MD}px` }}>
                          <FaUpload />
                        </IconContext.Provider>
                      </DropAreaIcon>
                      <DropAreaText>Arrastra una imagen panorámica aquí o haz clic para seleccionar</DropAreaText>
                    </>
                  )}
                </DropAreaContent>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </DropArea>
              
              <AddButton onClick={handleAddScene} disabled={!newSceneTitle || !newSceneFile}>
                <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                  <FaPlus />
                </IconContext.Provider>
                <span>Añadir escena</span>
              </AddButton>
            </PanelSection>
            
            <PanelSection>
              <h3>Escenas del Tour</h3>
              <DragDropInfo>Arrastra y suelta para ordenar o conectar escenas</DragDropInfo>
              <SceneList>
                {tour.scenes.length === 0 ? (
                  <NoSceneMessage>No hay escenas</NoSceneMessage>
                ) : (
                  tour.scenes.map((scene) => (
                    <SceneItem 
                      key={scene.id} 
                      active={scene.id === tour.currentSceneId}
                      expanded={scene.id === expandedSceneId}
                      draggable
                    >
                      <SceneHeader>
                        <SceneTitle onClick={() => handleSceneClick(scene.id)}>
                          {scene.title}
                        </SceneTitle>
                        <SceneActions>
                          <SceneActionButton title="Tiny Planet" onClick={() => applyTinyPlanetEffect(scene.id)}>
                            <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                              <FaGlobe />
                            </IconContext.Provider>
                          </SceneActionButton>
                          <SceneActionButton title="Punto de anclaje" onClick={() => {}}>
                            <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                              <FaLink />
                            </IconContext.Provider>
                          </SceneActionButton>
                          <SceneActionButton title="Expandir" onClick={() => toggleSceneExpand(scene.id)}>
                            <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                              {scene.id === expandedSceneId ? <FaTimes /> : <FaArrowRight />}
                            </IconContext.Provider>
                          </SceneActionButton>
                          <SceneActionButton title="Eliminar" onClick={() => removeScene(scene.id)}>
                            <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                              <FaTrash />
                            </IconContext.Provider>
                          </SceneActionButton>
                        </SceneActions>
                      </SceneHeader>
                      
                      {scene.id === expandedSceneId && (
                        <SceneDetails>
                          <FormGroup>
                            <label>Título:</label>
                            <input
                              type="text"
                              value={scene.title}
                              onChange={(e) => {
                                const updatedScene: PanoramaImage = {
                                  ...scene,
                                  title: e.target.value
                                };
                                updateScene(updatedScene);
                              }}
                            />
                          </FormGroup>
                          <ScenePreview>
                            <img 
                              src={scene.imageUrl} 
                              alt={scene.title} 
                              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                          </ScenePreview>
                          <div>
                            <label>Hotspots: {scene.hotSpots?.length || 0}</label>
                            {(scene.hotSpots?.length || 0) > 0 && (
                              <HotspotList>
                                {scene.hotSpots?.map((hotspot) => (
                                  <HotspotItem key={hotspot.id}>
                                    {hotspot.text || (hotspot.type === 'info' ? 'Información' : 'Ir a otra escena')}
                                    <small>({hotspot.type})</small>
                                  </HotspotItem>
                                ))}
                              </HotspotList>
                            )}
                          </div>
                        </SceneDetails>
                      )}
                    </SceneItem>
                  ))
                )}
              </SceneList>
            </PanelSection>
          </>
        )}

        {activeTab === 'hotspots' && (
          <PanelSection>
            <h3>Gestión de Hotspots</h3>
            <p>Haz doble clic en la imagen panorámica para agregar un nuevo punto de información.</p>
            <p>Para crear conexiones entre escenas, selecciona una escena destino y haz clic en "Punto de anclaje".</p>
            <HotspotInstructions>
              <li><strong>Hotspot de información:</strong> Muestra texto informativo.</li>
              <li><strong>Punto de anclaje:</strong> Permite navegar entre escenas diferentes.</li>
              <li><strong>Arrastrar y soltar:</strong> Para mover los hotspots a la posición deseada.</li>
            </HotspotInstructions>
          </PanelSection>
        )}

        {activeTab === 'settings' && (
          <PanelSection>
            <h3>Ajustes del Tour</h3>
            <FormGroup>
              <label htmlFor="tour-name">Nombre del Tour:</label>
              <input
                id="tour-name"
                type="text"
                value={tour.name}
                onChange={(e) => {
                  // Actualizar el nombre del tour
                }}
                placeholder="Nombre del tour"
              />
            </FormGroup>
            <FormGroup>
              <label>Efectos:</label>
              <CheckboxGroup>
                <label>
                  <input type="checkbox" /> Habilitar brújula
                </label>
                <label>
                  <input type="checkbox" /> Autorotación
                </label>
                <label>
                  <input type="checkbox" /> Controles de zoom
                </label>
              </CheckboxGroup>
            </FormGroup>
            <ActionButton style={{ marginTop: '20px' }} onClick={saveTour}>
              <IconContext.Provider value={{ size: `${ICON_SIZE_SM}px` }}>
                <FaSave />
              </IconContext.Provider>
              <span>Guardar configuración</span>
            </ActionButton>
          </PanelSection>
        )}

        {activeTab === 'help' && (
          <PanelSection>
            <h3>Guía Rápida Tour360</h3>
            
            <TutorialSection>
              <TutorialStep>
                <StepNumber>1</StepNumber>
                <StepContent>
                  <StepTitle>Crear escenas</StepTitle>
                  <StepDescription>
                    Añade imágenes panorámicas en la pestaña "Escenas". 
                    Puedes arrastrar y soltar imágenes 360° o usar el selector de archivos.
                  </StepDescription>
                </StepContent>
              </TutorialStep>
              
              <TutorialStep>
                <StepNumber>2</StepNumber>
                <StepContent>
                  <StepTitle>Añadir puntos de acceso</StepTitle>
                  <StepDescription>
                    Haz clic en el botón <FaPlus size={14} /> en el visor y selecciona 
                    posiciones para conectar tus escenas entre sí.
                  </StepDescription>
                </StepContent>
              </TutorialStep>
              
              <TutorialStep>
                <StepNumber>3</StepNumber>
                <StepContent>
                  <StepTitle>Conectar escenas</StepTitle>
                  <StepDescription>
                    Al crear un punto de acceso, selecciona la escena de destino 
                    para establecer la conexión entre panoramas.
                  </StepDescription>
                </StepContent>
              </TutorialStep>
              
              <TutorialStep>
                <StepNumber>4</StepNumber>
                <StepContent>
                  <StepTitle>Exportar tu tour</StepTitle>
                  <StepDescription>
                    Usa el botón "Exportar" para guardar tu tour. Podrás importarlo 
                    después o compartirlo con otros.
                  </StepDescription>
                </StepContent>
              </TutorialStep>
              
              <TutorialStep>
                <StepNumber>5</StepNumber>
                <StepContent>
                  <StepTitle>Integración en tu web</StepTitle>
                  <StepDescription>
                    <EmbedCode>
                      {`<!-- Añade esto en el <head> de tu HTML -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css" />
<script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>

<!-- Añade esto donde quieras mostrar el tour -->
<div id="panorama" style="width: 100%; height: 500px;"></div>

<script>
  // Carga tu archivo JSON exportado
  fetch('ruta/a/tu-tour-exportado.json')
    .then(response => response.json())
    .then(tourData => {
      // Inicializa el visor con la primera escena
      const firstScene = tourData.scenes[0];
      pannellum.viewer('panorama', {
        default: { firstScene: firstScene.id },
        scenes: tourData.scenes.reduce((scenes, scene) => {
          scenes[scene.id] = {
            title: scene.title,
            panorama: scene.imageUrl,
            hotSpots: scene.hotSpots || []
          };
          return scenes;
        }, {})
      });
    });
</script>`}
                    </EmbedCode>
                  </StepDescription>
                </StepContent>
              </TutorialStep>
            </TutorialSection>
            
            <HelpSection>
              <h4>Consejos útiles:</h4>
              <ul>
                <li>Usa imágenes panorámicas equirectangulares (360° x 180°)</li>
                <li>Imágenes recomendadas: 4000-8000px de ancho</li>
                <li>Puedes mover la vista antes de crear un punto de acceso</li>
                <li>Guarda tu trabajo regularmente con el botón "Guardar"</li>
                <li>Prueba el modo "Tiny Planet" para una vista diferente</li>
              </ul>
            </HelpSection>
          </PanelSection>
        )}
      </PanelContent>
    </SidePanelContainer>
  );
};

// Estilos modernizados con efecto de vidrio (glassmorphism)
const SidePanelContainer = styled.div<{ open: boolean; width: string }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: ${props => props.open ? props.width : '0'};
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  color: white;
  border-left: 1px solid rgba(255, 255, 255, 0.18);
  text-align: center;
  overflow: hidden;
`;

const GlassPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 25, 40, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: -1;
`;

const PanelContent = styled.div`
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 15px 20px;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const ToggleButton = styled.button<{ open: boolean }>`
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(17, 25, 40, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: none;
  border-radius: 5px 0 0 5px;
  width: 40px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: white;
  font-size: 24px;
  border-left: 1px solid rgba(255, 255, 255, 0.18);
  
  &:hover {
    background-color: rgba(27, 38, 59, 0.8);
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  justify-content: center;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 15px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border: none;
  border-radius: 8px 8px 0 0;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const PanelHeader = styled.div`
  padding: 15px;
  text-align: center;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: white;
    text-align: center;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 15px;
  justify-content: center;
  width: 100%;
`;

const ImportLabel = styled.label`
  padding: 8px 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #357abd;
  }
`;

const PanelSection = styled.div`
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const FormGroup = styled.div`
  width: 100%;
  margin-bottom: 12px;
  text-align: left;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    text-align: left;
    
    input {
      margin: 0;
    }
  }
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #357abd;
  }
  
  &:disabled {
    background-color: rgba(74, 144, 226, 0.5);
    cursor: not-allowed;
  }
`;

const DropArea = styled.div<{ isDragging: boolean }>`
  width: 100%;
  height: 100px;
  border: 2px dashed ${props => props.isDragging ? '#357abd' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #357abd;
  }
`;

const DropAreaContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const DropAreaIcon = styled.div`
  font-size: 24px;
  color: white;
`;

const DropAreaText = styled.span`
  font-size: 14px;
  color: white;
`;

const AddButton = styled.button`
  padding: 8px 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #357abd;
  }
  
  &:disabled {
    background-color: rgba(74, 144, 226, 0.5);
    cursor: not-allowed;
  }
`;

const SceneList = styled.div`
  width: 100%;
  margin-top: 10px;
`;

const SceneItem = styled.div<{ active: boolean; expanded: boolean; draggable: boolean }>`
  width: 100%;
  padding: 10px;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const SceneHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SceneTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: white;
  cursor: pointer;
`;

const SceneActions = styled.div`
  display: flex;
  gap: 5px;
`;

const SceneActionButton = styled.button`
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const SceneDetails = styled.div`
  width: 100%;
  margin-top: 10px;
`;

const ScenePreview = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const HotspotList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HotspotItem = styled.li`
  margin-bottom: 5px;
  color: white;
  font-size: 0.9rem;
`;

const DragDropInfo = styled.p`
  margin: 10px 0;
  color: white;
  font-size: 0.9rem;
`;

const NoSceneMessage = styled.p`
  margin: 10px 0;
  color: white;
  font-size: 0.9rem;
`;

const HotspotInstructions = styled.ol`
  list-style: none;
  padding: 0;
  margin: 10px 0;
  
  li {
    margin-bottom: 10px;
    color: white;
    font-size: 0.9rem;
  }
`;

const TutorialSection = styled.div`
  margin-bottom: 20px;
`;

const TutorialStep = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 15px;
  border-radius: 8px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const StepNumber = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background-color: #4a90e2;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StepTitle = styled.h5`
  margin: 0;
  font-size: 1rem;
  color: white;
`;

const StepDescription = styled.p`
  margin: 5px 0;
  color: white;
  font-size: 0.9rem;
`;

const EmbedCode = styled.pre`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 6px;
  margin: 10px 0;
  color: white;
  font-size: 0.9rem;
`;

const HelpSection = styled.div`
  margin-top: 20px;
`;

export default SidePanel;