import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/integration/**/*.cy.ts",
    supportFile: "cypress/support/integration.ts",
    viewportWidth: 414,
    viewportHeight: 896,
    video: false,
    defaultCommandTimeout: 8000,
  },
});
