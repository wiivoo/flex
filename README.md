# flex – EV Flex Band Viewer

An interactive visualization of the aggregate charging flexibility of a pool of electric vehicles over a 24‑hour day.

You can use it to get an intuition for how the available charging power (kW) of a fleet grows as you add more cars, given a stylized distribution of plug‑in times and session durations.

## Live demo

The latest version is deployed to GitHub Pages:

- https://wiivoo.github.io/flex/

The repository is private; only the built static site is public.

## What this tool shows

- A simple **“flex band”** over the day: for each hour, the chart shows the maximum charging power (kW) the EV pool could consume if all plugged‑in cars charged at full power.
- A **car slider** lets you scale the pool size (e.g. from 100 to 2,000 cars). The band height scales roughly linearly with the number of cars.
- The shape of the band comes from:
  - A fixed distribution of **arrival times** (more cars arriving in the evening).
  - A mix of **session durations** (short, medium, long, very long).
  - A constant per‑car charging power assumption.

This is intentionally stylized, not a calibrated model for a specific fleet.

## Local development

Requirements:

- Node.js 20+
- npm

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173/`). Open it in your browser to use the viewer.

To build the production bundle:

```bash
npm run build
```

The static files will be generated in the `dist/` directory.

## Deployment

This project uses:

- Vite with `base: '/flex/'` so it can be served from the `/flex/` path on GitHub Pages.
- A GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that:
  - Installs dependencies
  - Builds the app (`npm run build`)
  - Uploads the `dist/` folder as a Pages artifact
  - Deploys it to GitHub Pages

Any push to the `main` branch will trigger a new deployment.

## Tech stack

- React 19 + TypeScript
- Vite
- Recharts for the area chart
