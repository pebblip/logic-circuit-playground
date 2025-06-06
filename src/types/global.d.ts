interface Window {
  Cypress?: any;
  useCircuitStore?: any;
}

interface ImportMetaEnv {
  readonly VITE_DEBUG_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
