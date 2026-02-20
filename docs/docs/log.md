# log

## 3.0.0 (2026-02-19)

### Features
1. Bundle splitting: separate core, 3D, and pages chunks for on-demand loading.
2. CDN loader (`visualify-loader.js`): auto-loads echarts/plotly/three.js from CDN — single `<script>` tag usage.
3. 3D visualization support: Scatter3D, Bar3D, Surface3D, Line3D via ECharts GL and Three.js.
4. Internationalization (i18n): 6 languages with RTL support.
5. Accessibility (a11y): keyboard navigation, ARIA labels, screen reader support.
6. Live code editor with real-time chart preview.
7. TypeScript configuration support with validation.

### Optimizations
1. Legacy IIFE bundle reduced from 9.6 MB to 1.8 MB by externalizing echarts, plotly, and three.js.
2. Removed debug `console.log` statements from production code.
3. Suppressed i18next default logger warnings.

### Bug Fixes
1. Fixed infinite re-render loop caused by unstable useEffect dependencies.
2. Fixed Visium background image and visualMap coloring.
3. Stabilized React component keys to prevent double event binding.

## 2.5.3-1(2024-02-24)

### Features
1. Scatter examples added.
2. xAxis and yAxis now support Object type data.


