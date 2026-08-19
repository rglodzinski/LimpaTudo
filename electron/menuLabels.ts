import type { Settings } from "./types";

export interface MenuLabels {
  about: string;
  hide: string;
  hideOthers: string;
  showAll: string;
  quit: string;
  edit: string;
  undo: string;
  redo: string;
  cut: string;
  copy: string;
  paste: string;
  selectAll: string;
  view: string;
  reload: string;
  toggleDevTools: string;
  resetZoom: string;
  zoomIn: string;
  zoomOut: string;
  toggleFullscreen: string;
  window: string;
  minimize: string;
  zoom: string;
  front: string;
  close: string;
  help: string;
  learnMore: string;
}

const LABELS: Record<Settings["language"], MenuLabels> = {
  "pt-BR": {
    about: "Sobre o Limpa Tudo",
    hide: "Ocultar Limpa Tudo",
    hideOthers: "Ocultar Outros",
    showAll: "Mostrar Todos",
    quit: "Sair do Limpa Tudo",
    edit: "Editar",
    undo: "Desfazer",
    redo: "Refazer",
    cut: "Cortar",
    copy: "Copiar",
    paste: "Colar",
    selectAll: "Selecionar Tudo",
    view: "Visualizar",
    reload: "Recarregar",
    toggleDevTools: "Ferramentas de Desenvolvedor",
    resetZoom: "Zoom Padrão",
    zoomIn: "Aumentar Zoom",
    zoomOut: "Diminuir Zoom",
    toggleFullscreen: "Tela Cheia",
    window: "Janela",
    minimize: "Minimizar",
    zoom: "Zoom",
    front: "Trazer Tudo para Frente",
    close: "Fechar",
    help: "Ajuda",
    learnMore: "Saiba mais sobre o Limpa Tudo",
  },
  "en-US": {
    about: "About Limpa Tudo",
    hide: "Hide Limpa Tudo",
    hideOthers: "Hide Others",
    showAll: "Show All",
    quit: "Quit Limpa Tudo",
    edit: "Edit",
    undo: "Undo",
    redo: "Redo",
    cut: "Cut",
    copy: "Copy",
    paste: "Paste",
    selectAll: "Select All",
    view: "View",
    reload: "Reload",
    toggleDevTools: "Toggle Developer Tools",
    resetZoom: "Actual Size",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    toggleFullscreen: "Toggle Full Screen",
    window: "Window",
    minimize: "Minimize",
    zoom: "Zoom",
    front: "Bring All to Front",
    close: "Close",
    help: "Help",
    learnMore: "Learn More about Limpa Tudo",
  },
  es: {
    about: "Acerca de Limpa Tudo",
    hide: "Ocultar Limpa Tudo",
    hideOthers: "Ocultar los demás",
    showAll: "Mostrar todos",
    quit: "Salir de Limpa Tudo",
    edit: "Editar",
    undo: "Deshacer",
    redo: "Rehacer",
    cut: "Cortar",
    copy: "Copiar",
    paste: "Pegar",
    selectAll: "Seleccionar todo",
    view: "Ver",
    reload: "Recargar",
    toggleDevTools: "Herramientas de desarrollador",
    resetZoom: "Tamaño real",
    zoomIn: "Acercar",
    zoomOut: "Alejar",
    toggleFullscreen: "Pantalla completa",
    window: "Ventana",
    minimize: "Minimizar",
    zoom: "Zoom",
    front: "Traer todo al frente",
    close: "Cerrar",
    help: "Ayuda",
    learnMore: "Más información sobre Limpa Tudo",
  },
};

export function menuLabels(language: Settings["language"]): MenuLabels {
  return LABELS[language] ?? LABELS["en-US"];
}
