# Keepsake Frontend

The Keepsake website is a React app. For the full project guide, Firebase setup, local development, deployment, and user instructions, see the [repository README](../README.md).

## Frontend commands

```sh
npm ci
npm start
npm test -- --watchAll=false
npm run build
```

The app uses Firebase Authentication and Firestore. Its GitHub Pages build is published from `frontend/build` by the [Pages workflow](../.github/workflows/pages.yml).
