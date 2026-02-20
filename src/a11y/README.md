# Accessibility (a11y) Module for Visualify.js

This module provides comprehensive accessibility support for Visualify.js charts, ensuring compliance with WCAG 2.1 AA standards and compatibility with screen readers and keyboard navigation.

## Features

- **ARIA Labels**: Automatic generation of descriptive labels for charts
- **Keyboard Navigation**: Full keyboard support for navigating and interacting with charts
- **Screen Reader Support**: Data tables and live regions for screen reader announcements
- **Color Contrast**: WCAG AA compliance checking with automatic color suggestions
- **Focus Management**: Visible focus indicators and logical tab order
- **Motion Preferences**: Respects `prefers-reduced-motion` settings

## Quick Start

```javascript
import { applyA11yStyles } from 'visualify/a11y';

// Apply accessibility styles once in your app
applyA11yStyles();
```

## Components with A11y Support

The following components have built-in accessibility support:

- `Scatter` - Scatter plots with keyboard navigation
- `Scatter3D` - 3D scatter plots with accessibility features
- `Bar` - Bar charts with ARIA labels
- `Bar3D` - 3D bar charts with keyboard navigation
- `EChartSwitcher` - Dynamic chart switcher with screen reader support
- `Vcontroller` - Dashboard controller with skip links

## Configuration

### Chart Configuration

```javascript
const config = {
  title: 'Sales by Month',
  data: [...],

  // Accessibility options
  a11y: {
    enabled: true,           // Enable accessibility features
    announceLoad: true,      // Announce when chart loads
    autoFix: true,           // Auto-fix color contrast issues
    enableDownload: true,    // Enable CSV download for screen readers
    description: 'Detailed description of the chart',
  }
};
```

### Color Contrast

The module automatically checks and fixes color contrast issues:

```javascript
import { validateChartColors, applyAccessibleColors } from 'visualify/a11y';

// Validate colors
const validation = validateChartColors(config);
if (!validation.valid) {
  console.log('Issues:', validation.issues);
  console.log('Suggestions:', validation.suggestions);
}

// Auto-fix colors
const accessibleConfig = applyAccessibleColors(config);
```

### Keyboard Navigation

Charts support the following keyboard shortcuts:

| Key | Action |
|-----|--------|
| Tab | Focus the chart |
| Arrow Right/Down | Navigate to next data point |
| Arrow Left/Up | Navigate to previous data point |
| Enter/Space | Activate/select data point |
| Escape | Clear selection |
| Home | Jump to first data point |
| End | Jump to last data point |
| Page Up | Jump back 10 data points |
| Page Down | Jump forward 10 data points |

## API Reference

### ARIA Labels (`aria-labels.js`)

#### `generateChartLabel(config, chartType)`
Generates a descriptive ARIA label for a chart.

#### `formatDataForScreenReader(data, config, chartType)`
Formats chart data for screen reader output.

#### `generateDataTable(data, config, chartType)`
Creates a data table structure for screen readers.

#### `announceToScreenReader(message, priority)`
Announces a message via ARIA live region.

### Keyboard Navigation (`keyboard-nav.js`)

#### `useChartKeyboardNav(options)`
React hook for chart keyboard navigation.

```javascript
const {
  containerRef,
  handleKeyDown,
  handleFocus,
  focusedIndex,
  containerProps
} = useChartKeyboardNav({
  data: chartData,
  config: chartConfig,
  onFocusChange: (index, dataPoint) => {},
  onActivate: (index, dataPoint) => {},
});
```

### Color Contrast (`color-contrast.js`)

#### `checkWCAGCompliance(foreground, background, isLargeText)`
Checks if color combination meets WCAG AA standards.

#### `getContrastRatio(color1, color2)`
Calculates contrast ratio between two colors.

#### `suggestAccessibleColor(background, preferredColor, options)`
Suggests an accessible color for given background.

## CSS Classes

### `.sr-only`
Hides content visually but keeps it accessible to screen readers.

### `.visualify-chart`
Applied to all chart containers. Includes focus styles.

### `.visualify-controller`
Applied to the dashboard controller. Includes skip link styles.

## Testing Checklist

- [ ] Can navigate to charts using Tab key
- [ ] Focus indicator is clearly visible
- [ ] Arrow keys navigate between data points
- [ ] Enter/Space activates data points
- [ ] Screen reader announces chart title and type
- [ ] Screen reader announces data values
- [ ] Data table is accessible to screen readers
- [ ] Color contrast passes WCAG AA (4.5:1 for normal text)
- [ ] Works with 200% zoom
- [ ] Respects reduced motion preferences

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- IE 11 (with polyfills)

## Screen Reader Support

- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
