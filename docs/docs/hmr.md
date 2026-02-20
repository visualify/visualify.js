# Hot Module Replacement (HMR)

Visualify.js includes a built-in HMR system for development that enables instant chart updates without page reloads.

## Overview

HMR allows you to:
- See chart changes instantly when editing configuration files
- Preserve chart state during updates
- Get visual feedback for configuration errors
- Work efficiently with iterative chart design

## How It Works

The HMR system consists of:

1. **File Watcher** - Monitors your visualization JSON files for changes
2. **WebSocket Server** - Pushes updates to the browser
3. **Client Handler** - Receives and applies updates while preserving state
4. **Error Overlay** - Displays configuration errors without breaking the app

## Enabling HMR

### In Development Mode

HMR is automatically enabled when using the Visualify CLI development server:

```bash
visualify dev
```

Or with a specific configuration:

```bash
visualify dev --config ./my-visualization.json
```

### Programmatic API

Enable HMR when initializing Visualify:

```javascript
import { initHMR } from 'visualify';

// Initialize HMR with custom options
const hmr = initHMR({
    wsUrl: 'ws://localhost:3000/__hmr',
    reconnectDelay: 1000,
    maxReconnectAttempts: 10,
    debug: false
});
```

### React Hook

Use the `useHMR` hook in custom components:

```javascript
import { useHMR } from 'visualify';

function MyChartComponent() {
    useHMR({
        onUpdate: (newConfig) => {
            console.log('Configuration updated:', newConfig);
        },
        onError: (error) => {
            console.error('HMR Error:', error);
        }
    });

    return <div>{/* Chart content */}</div>;
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wsUrl` | String | `'ws://localhost:3000/__hmr'` | WebSocket server URL |
| `reconnectDelay` | Number | `1000` | Delay between reconnection attempts (ms) |
| `maxReconnectAttempts` | Number | `10` | Maximum reconnection attempts |
| `heartbeatInterval` | Number | `30000` | WebSocket heartbeat interval (ms) |
| `debug` | Boolean | `false` | Enable debug logging |

## State Preservation

HMR preserves the following chart state during updates:

- Current zoom level and pan position
- Selected/highlighted data points
- Tooltip visibility
- Legend toggle states
- User interactions

To customize state preservation:

```javascript
import { preserveState } from 'visualify';

preserveState('myChart', {
    save: () => ({
        zoom: chart.getZoom(),
        selection: chart.getSelection()
    }),
    restore: (state) => {
        chart.setZoom(state.zoom);
        chart.setSelection(state.selection);
    }
});
```

## Error Handling

HMR includes a visual error overlay that displays configuration errors:

```javascript
import { setErrorOverlay } from 'visualify';

// Customize error overlay appearance
setErrorOverlay({
    position: 'top-right',
    timeout: 5000,
    theme: 'dark'
});
```

## Disabling HMR

To disable HMR (e.g., for production builds):

```javascript
// Set global flag before loading Visualify
window.__VISUALIFY_HMR__ = { enabled: false };
```

Or via CLI:

```bash
visualify build --no-hmr
```

## Best Practices

1. **Use HMR in development only** - Disable for production builds
2. **Handle state compatibility** - Ensure restored state is compatible with new config
3. **Test error scenarios** - Verify error overlays work with invalid configurations
4. **Monitor WebSocket connection** - Check console for reconnection warnings

## Troubleshooting

### HMR Not Connecting

- Verify the WebSocket URL matches your dev server
- Check firewall settings for WebSocket connections
- Ensure `window.__VISUALIFY_HMR__.enabled` is not set to `false`

### State Not Preserved

- Implement custom `preserveState` handlers for complex charts
- Check that state keys match between save and restore

### Performance Issues

- Increase `reconnectDelay` if experiencing frequent reconnections
- Disable HMR for charts with heavy data processing
