/**
 * Visualify.js Component Prop Types
 * @module types/components
 *
 * @example
 * ```typescript
 * import { ScatterProps, RechartsProps } from 'visualifyjs/types';
 *
 * const scatterProps: ScatterProps = {
 *   props: { config: { type: 'scatter', data: [] } },
 *   style: { width: '100%', height: '400px' }
 * };
 * ```
 */

import { CSSProperties, ReactNode, RefObject, ForwardedRef } from 'react';
import {
  ChartConfig,
  ScatterConfig,
  BarConfig,
  LineConfig,
  Scatter3DConfig,
  Bar3DConfig,
  Line3DConfig,
  Surface3DConfig,
  EChartsOption,
} from './charts';

/**
 * Base component props shared across all chart components
 */
export interface BaseComponentProps {
  /** Unique identifier for the component */
  id?: string;
  /** CSS styles */
  style?: CSSProperties;
  /** Additional class names */
  className?: string;
}

/**
 * Props for the ReCharts wrapper component
 */
export interface RechartsProps extends BaseComponentProps {
  /** ECharts option object */
  options: EChartsOption;
  /** Chart container style */
  style?: CSSProperties;
  /** Event handlers */
  onEvents?: Record<string, (params: unknown) => void>;
}

/**
 * Props for the Scatter component
 */
export interface ScatterProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: ScatterConfig;
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Props for the ScatterBio component
 */
export interface ScatterBioProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: ScatterConfig & {
      /** Biological metadata fields */
      bioMeta?: Record<string, unknown>;
    };
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Props for the Scatter3D component
 */
export interface Scatter3DProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: Scatter3DConfig;
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Props for the Bar3D component
 */
export interface Bar3DProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: Bar3DConfig;
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Props for the Line3D component
 */
export interface Line3DProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: Line3DConfig;
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Props for the Surface3D component
 */
export interface Surface3DProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: Surface3DConfig;
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Props for the VisiumPlot component
 */
export interface VisiumPlotProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: ScatterConfig & {
      /** Visium-specific settings */
      tissueImage?: string;
      spots?: unknown[];
    };
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Props for the DotPlot component
 */
export interface DotPlotProps extends BaseComponentProps {
  /** Component configuration */
  props: {
    id?: string;
    config: ChartConfig;
  };
  /** Ref for accessing the chart instance */
  ref?: ForwardedRef<unknown>;
}

/**
 * Grid layout configuration
 */
export interface GridLayoutConfig {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  cols?: number;
  /** Gap between grid items */
  gap?: string | number;
  /** Additional styles */
  style?: CSSProperties;
  /** Debug mode - shows borders */
  debug?: boolean;
}

/**
 * Props for the DynamicGrid component
 */
export interface DynamicGridProps {
  /** Grid configuration */
  config?: GridLayoutConfig;
  /** Child elements */
  children?: ReactNode;
}

/**
 * Widget base props
 */
export interface WidgetProps extends BaseComponentProps {
  /** Widget title */
  title?: string;
  /** Widget content */
  children?: ReactNode;
}

/**
 * Header widget props
 */
export interface HeaderProps extends WidgetProps {
  /** Logo URL or component */
  logo?: string | ReactNode;
  /** Navigation items */
  navItems?: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
}

/**
 * Footer widget props
 */
export interface FooterProps extends WidgetProps {
  /** Copyright text */
  copyright?: string;
  /** Links to display */
  links?: Array<{
    label: string;
    href: string;
  }>;
}

/**
 * Controller widget props
 */
export interface ControllerProps extends WidgetProps {
  /** Control elements configuration */
  controls?: Array<{
    type: 'button' | 'select' | 'slider' | 'checkbox';
    label: string;
    value?: unknown;
    onChange?: (value: unknown) => void;
  }>;
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  /** Child components */
  children: ReactNode;
  /** Fallback UI when error occurs */
  fallback?: ReactNode;
  /** Error handler callback */
  onError?: (error: Error, errorInfo: unknown) => void;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Loading component props
 */
export interface LoadingProps extends BaseComponentProps {
  /** Loading message */
  message?: string;
  /** Whether loading is active */
  active?: boolean;
}

/**
 * Props for 3D scene components using Three.js
 */
export interface ThreeSceneProps extends BaseComponentProps {
  /** Camera configuration */
  camera?: {
    position?: [number, number, number];
    fov?: number;
    near?: number;
    far?: number;
  };
  /** Renderer configuration */
  renderer?: {
    antialias?: boolean;
    alpha?: boolean;
    shadowMap?: boolean;
  };
  /** Lighting configuration */
  lighting?: {
    ambient?: { intensity?: number; color?: string };
    directional?: { intensity?: number; color?: string; position?: [number, number, number] };
  };
  /** Child 3D objects */
  children?: ReactNode;
}

/**
 * Props for custom 3D components
 */
export interface ThreeCustomProps extends BaseComponentProps {
  /** Custom render function */
  render: (scene: unknown, camera: unknown, renderer: unknown) => void;
  /** Animation loop */
  animate?: (scene: unknown, camera: unknown, renderer: unknown, time: number) => void;
}

/**
 * Circular progress widget props
 */
export interface CircularProgressProps extends BaseComponentProps {
  /** Progress value (0-100) */
  value: number;
  /** Size of the progress circle */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Color of the progress */
  color?: string;
  /** Background color */
  backgroundColor?: string;
  /** Show percentage text */
  showText?: boolean;
}

/**
 * Selection component props
 */
export interface SelectionProps extends BaseComponentProps {
  /** Available options */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Selected values */
  value?: string | string[];
  /** Multi-select mode */
  multi?: boolean;
  /** Change handler */
  onChange?: (value: string | string[]) => void;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * Search bar component props
 */
export interface SearchBarProps extends BaseComponentProps {
  /** Search query */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Change handler */
  onChange?: (query: string) => void;
  /** Suggestions data */
  suggestions?: string[];
}

/**
 * Timeline component props
 */
export interface TimelineProps extends BaseComponentProps {
  /** Timeline events */
  events: Array<{
    id: string;
    title: string;
    description?: string;
    timestamp: Date | string;
    color?: string;
  }>;
  /** Selected event ID */
  selected?: string;
  /** Event click handler */
  onSelect?: (id: string) => void;
}

/**
 * Browser component props
 */
export interface BrowserProps extends BaseComponentProps {
  /** Root directory path */
  rootPath: string;
  /** Selected file path */
  selectedPath?: string;
  /** File selection handler */
  onSelect?: (path: string, isDirectory: boolean) => void;
  /** Allowed file extensions */
  allowedExtensions?: string[];
}

/**
 * Mapping widget props
 */
export interface MappingProps extends WidgetProps {
  /** Source fields */
  sourceFields: string[];
  /** Target fields */
  targetFields: string[];
  /** Current mappings */
  mappings?: Record<string, string>;
  /** Mapping change handler */
  onChange?: (mappings: Record<string, string>) => void;
}

/**
 * Layout configuration props
 */
export interface LayoutProps extends BaseComponentProps {
  /** Layout type */
  type?: 'default' | 'fluid' | 'fixed';
  /** Header component */
  header?: ReactNode;
  /** Footer component */
  footer?: ReactNode;
  /** Sidebar component */
  sidebar?: ReactNode;
  /** Main content */
  children: ReactNode;
}

/**
 * Props for chart wrapper components with ref forwarding
 */
export interface ChartComponentProps<T extends ChartConfig = ChartConfig> {
  /** Component props containing config */
  props: {
    id?: string;
    config: T;
  };
  /** CSS styles */
  style?: CSSProperties;
  /** Ref for chart instance access */
  ref?: ForwardedRef<unknown>;
}

/**
 * Union type of all chart component props
 */
export type AnyChartComponentProps =
  | ScatterProps
  | Scatter3DProps
  | Bar3DProps
  | Line3DProps
  | Surface3DProps;
