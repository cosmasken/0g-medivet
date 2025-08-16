/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_L1_RPC: string
  readonly VITE_STANDARD_STORAGE_RPC: string
  readonly VITE_TURBO_STORAGE_RPC: string
  readonly VITE_STANDARD_FLOW_ADDRESS: string
  readonly VITE_TURBO_FLOW_ADDRESS: string
  readonly VITE_PROJECT_ID: string
  readonly VITE_STANDARD_EXPLORER_URL: string
  readonly VITE_TURBO_EXPLORER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
