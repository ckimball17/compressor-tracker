
# Compressor Tracker (StackBlitz-ready)
- React 18 + Vite
- Google Maps via `@react-google-maps/api`
- Works without a backend: if `/api/clients` doesn't return JSON, it falls back to built-in mock data.
- Tests with Jest + React Testing Library.

## Run
```bash
npm install
npm run dev
```

## Map key (runtime)
In the browser console:
```js
window.__REACT_APP_GOOGLE_MAPS_API_KEY__ = 'YOUR_GOOGLE_MAPS_API_KEY'
```

## Tests
```bash
npm test
```
