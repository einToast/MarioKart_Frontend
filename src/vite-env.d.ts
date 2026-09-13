/// <reference types="vite/client" />

declare module '*/env.js' {
  export const env: Record<string, string | undefined>;
}
