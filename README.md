## Visualify.js

> The magical data portal generator &mdash; best mate for [Docsify](https://docsify.js.org/)

Visualify takes the complexity out of generating data portal websites. Forget about manually writing React components or generating static HTML files. Visualify smartly loads and parses your configuration and data API, allowing you to provide the information directly in a JavaScript file.

[Quick Start](https://visualify.pharmacy.arizona.edu/#/quickstart) | [Documentation](https://visualify.pharmacy.arizona.edu/) | [Changelog](docs/CHANGELOG.md)

## Usage

### Charts Mode (Docsify integration)

Embed interactive charts in your Docsify documentation:

```html
<script src="https://cdn.jsdelivr.net/gh/visualify/visualify.js@release/dist/visualify-loader.js"></script>
<script>
  $visualify = { mode: 'charts' }

  // Mount a chart
  new $visualify.Recharts({
    type: 'line',
    title: 'Example',
    data: { 'series1': [300, 280, 250, 260, 270] },
  }).mount('#chart')
</script>
```

### Pages Mode (Data portal)

Build a full data portal website from JSON configuration:

```html
<script>
  $visualify = {
    el: '#root',
    mode: 'pages',
    name: 'My Data Portal',
    nav: true,
  }
</script>
<script src="https://cdn.jsdelivr.net/gh/visualify/visualify.js@release/dist/visualify-loader.js"></script>
```

### CLI

```bash
npm i -g visualifyjs

visualify init my-project        # Initialize a new project
visualify dev                    # Start dev server (auto-detect mode)
visualify docs build             # Build static documentation
visualify portal dev             # Start portal dev server
visualify edit                   # Open visual editor
```

## Installation

### Stable (npm)

```bash
npm install visualifyjs
```

### Beta (dev branch)

Get the latest development build directly from GitHub:

```bash
npm install github:visualify/visualify.js#dev
```

Or via CDN (beta):

```html
<script src="https://cdn.jsdelivr.net/gh/visualify/visualify.js@dev/dist/visualify-loader.js"></script>
```

> Beta builds are updated daily on the `dev` branch. For production use, install from npm.

## Features

- **Two modes**: Charts mode for Docsify integration, Pages mode for full data portals
- **3D Visualization**: Scatter3D, Bar3D, Surface3D, Line3D via ECharts GL and Three.js
- **Smart Configuration**: JSON-based configuration with TypeScript validation
- **CDN Auto-loader**: Single `<script>` tag loads all dependencies automatically
- **Internationalization**: 6 languages with RTL support
- **Accessibility**: Keyboard navigation, ARIA labels, screen reader support
- **Easy Deployment**: Deploy on GitHub Pages, personal server, or any static host

## Showcases

- [MmTrBC](https://visualify.pharmacy.arizona.edu/MmTrBC/) - Airway basal cells metaplastic differentiation (Zhou et al., Elife 2022)
- [EsoDev](https://visualify.pharmacy.arizona.edu/EsoDev/) - Esophageal mucosa spatiotemporal platform (Yang et al., bioRxiv 2023)
