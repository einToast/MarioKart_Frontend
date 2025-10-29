# Mario Kart Tournament Frontend

Progressive Web App for managing a Mario Kart tournament: team registration, schedules, live rankings, surveys, and an admin control panel


## Features

- Team registration and login with cookies-based session
- Tournament schedule view with live updates via STOMP/WebSocket
- Live leaderboard, team details, and “How to play” tab
- In-event surveys (multiple choice, checkbox, free text) with results
- Admin dashboard: control, points, schedule, results, final, teams, survey management
- PWA with offline precaching and push notifications

## Tech Stack
- Language: TypeScript
- Framework: React 19 + Ionic 8
- Build: Vite 7
- Websockets: STOMP over SockJS
- Testing: Vitest (unit, jsdom) and Cypress (E2E)
- Linting: ESLint (flat config) with React/TS plugins
- Deployment: Docker + Docker Compose
- PWA support

## Project Structure

```
src/
  pages/          # Screen-level Ionic pages (tabs, auth, admin)
  components/     # Reusable UI (Header, QRCode, modals, charts)
  hooks/          # Custom hooks (e.g., useWebSocketConnection)
  theme/          # Global styles (variables.css, main.css)
  setupTests.ts   # Unit test setup (Testing Library, jest-dom)
public/           # Static assets and service worker (public/sw.js)
cypress/          # E2E tests (e2e/, fixtures/, support/)
vite.config.ts    # Vite + PWA config and env defines
eslint.config.js  # Flat ESLint config
tsconfig.json     # TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 24
- npm 11

### Installation

```bash
npm install
```

### Environment

Create a `.env` in the project root:

```
REACT_APP_BACKEND_PROTOCOL=http
REACT_APP_BACKEND_URL=localhost
REACT_APP_BACKEND_PORT=8080
REACT_APP_BACKEND_PATH=api
REACT_APP_BACKEND_WS_PROTOCOL=ws
REACT_APP_BACKEND_WS_URL=localhost
REACT_APP_BACKEND_WS_PORT=8080
REACT_APP_BACKEND_WS_PATH=api/ws
```

### Run (Vite)

```bash
npm run dev
# http://localhost:5173
```

### Alternative (Ionic CLI)

```bash
npm run ionic_serve
```

### Available Scripts

- `dev`: Start Vite dev server
- `build`: Type-check (`tsc`) then build with Vite
- `preview`: Serve the production build locally
- `lint`: Run ESLint
- `test.unit`: Run Vitest unit tests (jsdom)
- `test.e2e`: Run Cypress E2E tests (baseUrl `http://localhost:5173`)
- `ionic_serve`: Ionic dev server
- `ionic_build`: Ionic production build

### Testing

- Unit tests (Vitest):
  ```bash
  npm run test.unit
  ```
- E2E tests (Cypress):
  ```bash
  npm run dev &
  npm run test.e2e
  ```

### Linting

```bash
npm run lint
```

### Build & Preview

```bash
npm run build
npm run preview   # Serves dist/ on a local port
```

## Docker
- See [MarioKart_Deployment](https://github.com/einToast/MarioKart_Deployment)
