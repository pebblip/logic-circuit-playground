interface Window {
  Cypress?: unknown;
  useCircuitStore?: unknown;
}

interface ImportMetaEnv {
  readonly VITE_DEBUG_MODE?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
