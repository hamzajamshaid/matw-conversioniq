# ConversionIQ — MATW-inspired research theme

Independent educational/portfolio project, not affiliated with or endorsed by MATW. No official MATW logos or campaign imagery are included.

## What changed
- Blue/pink visual styling, typography accents, title and prototype disclosure
- Preserved original input schema, prediction request, probability display and threshold
- Restored Colab-compatible Vite proxy and allowedHosts configuration

## Colab replacement
Upload this zip to `MyDrive/MATW_Donor_Conversion/`, extract the `frontend/` folder into the project (overwriting existing frontend files), and rerun Cell 20.

## Deployment
The Vite `/api` proxy works only during development. Production hosting must route `/api/predict` and `/api/health` to a separately deployed FastAPI service, or adapt the frontend to use a configured HTTPS API origin. Do not deploy the Colab runtime URL as a permanent backend.
