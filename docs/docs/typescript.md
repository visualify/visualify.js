# TypeScript Migration Guide

Visualify.js provides first-class TypeScript support with comprehensive type definitions for all chart configurations and APIs.

## Installation

```bash
npm install visualify
npm install --save-dev @types/react @types/react-dom
```

## Type Definitions

### Chart Configuration Types

```typescript
import { ChartConfig, ChartType, AxisConfig, DataSeries } from 'visualify';

// Basic chart configuration
const config: ChartConfig = {
    type: 'line' as ChartType,
    title: 'Sales Overview',
    data: {
        categories: ['Jan', 'Feb', 'Mar'],
        series: [{
            name: 'Revenue',
            data: [120, 200, 150]
        }]
    },
    xAxis: {
        type: 'category',
        name: 'Month'
    } as AxisConfig,
    yAxis: {
        type: 'value',
        name: 'Amount ($)'
    } as AxisConfig
};
```

### Component Props

```typescript
import { RechartsProps, ChartComponent } from 'visualify';

interface MyChartProps extends RechartsProps {
    customTitle?: string;
    onDataSelect?: (data: DataPoint) => void;
}

const MyChart: React.FC<MyChartProps> = ({ config, style, onDataSelect }) => {
    return (
        <ChartComponent
            config={config}
            style={style}
            onClick={onDataSelect}
        />
    );
};
```

### 3D Chart Types

```typescript
import { Scatter3DConfig, Bar3DConfig, Surface3DConfig } from 'visualify';

const scatter3D: Scatter3DConfig = {
    type: 'scatter3d',
    data: {
        x: [1, 2, 3],
        y: [4, 5, 6],
        z: [7, 8, 9]
    },
    xAxis3D: { name: 'X', type: 'value' },
    yAxis3D: { name: 'Y', type: 'value' },
    zAxis3D: { name: 'Z', type: 'value' },
    grid3D: {
        viewControl: { autoRotate: true }
    }
};
```

## Generic Types

### Data Types

```typescript
import { ChartData, DataPoint, SeriesData } from 'visualify';

// Typed data points
interface SalesData extends DataPoint {
    date: string;
    revenue: number;
    units: number;
}

const salesData: ChartData<SalesData> = {
    categories: ['Q1', 'Q2', 'Q3'],
    series: [{
        name: 'Sales',
        data: [
            { date: '2024-01', revenue: 10000, units: 100 },
            { date: '2024-02', revenue: 15000, units: 150 }
        ]
    }]
};
```

### Event Handlers

```typescript
import { ChartEvent, ChartEventHandler } from 'visualify';

const handleClick: ChartEventHandler = (event: ChartEvent) => {
    console.log('Clicked:', event.dataIndex, event.seriesIndex);
};

const handleHover = (event: ChartEvent<{ value: number; name: string }>) => {
    console.log('Hovering over:', event.data.name);
};
```

## Configuration Interfaces

### Complete Chart Configuration

```typescript
import {
    VisualifyConfig,
    ThemeConfig,
    AnimationConfig,
    TooltipConfig
} from 'visualify';

const fullConfig: VisualifyConfig = {
    type: 'bar',
    title: {
        text: 'Annual Report',
        subtext: '2024',
        left: 'center'
    },
    theme: {
        color: ['#5470c6', '#91cc75', '#fac858'],
        backgroundColor: '#fff'
    } as ThemeConfig,
    animation: {
        duration: 1000,
        easing: 'cubicOut'
    } as AnimationConfig,
    tooltip: {
        trigger: 'axis',
        formatter: (params) => {
            return `${params[0].name}: ${params[0].value}`;
        }
    } as TooltipConfig,
    data: {
        categories: ['A', 'B', 'C'],
        series: [{
            name: 'Series 1',
            data: [120, 200, 150]
        }]
    }
};
```

## Utility Types

### Chart Type Union

```typescript
import { ChartType } from 'visualify';

type SupportedCharts = Extract<ChartType, 'line' | 'bar' | 'pie'>;

function createChart(type: SupportedCharts, data: unknown) {
    // Type-safe chart creation
}
```

### Deep Partial for Configuration

```typescript
import { DeepPartial, ChartConfig } from 'visualify';

// Useful for configuration merging
type PartialConfig = DeepPartial<ChartConfig>;

const overrides: PartialConfig = {
    title: { text: 'Updated Title' },
    // Other partial properties
};
```

## React Integration

### Hook Types

```typescript
import { useChart, UseChartOptions, UseChartReturn } from 'visualify';

const options: UseChartOptions = {
    config: chartConfig,
    onReady: (chart) => {
        console.log('Chart ready');
    },
    onError: (error) => {
        console.error('Chart error:', error);
    }
};

const { chartRef, updateChart, resizeChart }: UseChartReturn = useChart(options);
```

### Ref Forwarding

```typescript
import { ChartRef } from 'visualify';

const MyChartComponent = React.forwardRef<ChartRef, ChartProps>(
    (props, ref) => {
        return <Recharts ref={ref} {...props} />;
    }
);
```

## Migration from JavaScript

### Step 1: Add TypeScript Configuration

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "node",
        "jsx": "react-jsx",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true
    }
}
```

### Step 2: Rename Files

Rename `.js` files to `.tsx` (for React components) or `.ts` (for utilities).

### Step 3: Add Type Annotations

```typescript
// Before (JavaScript)
const config = {
    type: 'line',
    data: { ... }
};

// After (TypeScript)
import { ChartConfig } from 'visualify';

const config: ChartConfig = {
    type: 'line',
    data: { ... }
};
```

### Step 4: Fix Type Errors

Common issues during migration:

1. **Implicit any** - Add explicit types or enable `strict: false` temporarily
2. **Missing properties** - Use `Partial<T>` for incremental configurations
3. **Event types** - Cast event handlers to expected types

## Best Practices

1. **Use strict mode** - Enable `strict: true` in tsconfig.json
2. **Define custom types** - Extend Visualify interfaces for your data
3. **Type event handlers** - Avoid implicit `any` in callbacks
4. **Leverage generics** - Use generic types for reusable components

## Troubleshooting

### Type Definitions Not Found

```bash
# Ensure types are installed
npm install --save-dev @types/visualify

# Or add to tsconfig.json
{
    "compilerOptions": {
        "typeRoots": ["./node_modules/@types", "./types"]
    }
}
```

### Strict Type Errors

Use type assertions sparingly:

```typescript
const config = {
    type: 'custom' as unknown as ChartType,
    // ...
};
```
