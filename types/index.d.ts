/**
 * Visualify.js Type Definitions
 * @module visualifyjs/types
 *
 * Main type definitions for Visualify.js - A React-based data visualization library
 * for large-scale omics data analysis.
 *
 * @example
 * ```typescript
 * import {
 *   VisualifyConfig,
 *   ScatterConfig,
 *   ChartConfig,
 *   ScatterProps
 * } from 'visualifyjs/types';
 *
 * // Configuration
 * const config: VisualifyConfig = {
 *   version: '3.0.0',
 *   mode: 'portal',
 *   docs: { basePath: './docs', theme: 'vue', plugins: [] },
 *   portal: { homepage: 'home.json', theme: 'modern', dataSources: [] },
 *   visualization: { defaultLibrary: 'echarts', enable3D: true, webWorkers: false }
 * };
 *
 * // Chart configuration
 * const scatterConfig: ScatterConfig = {
 *   type: 'scatter',
 *   data: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
 *   title: 'Scatter Plot'
 * };
 * ```
 */

// ============================================================================
// Configuration Types
// ============================================================================

export {
  /** Application mode type */
  AppMode,
  /** Supported chart libraries */
  ChartLibrary,
  /** Data source types */
  DataSourceType,
  /** Data source configuration */
  DataSource,
  /** Documentation configuration */
  DocsConfig,
  /** Portal configuration */
  PortalConfig,
  /** Visualization configuration */
  VisualizationConfig,
  /** Main configuration interface */
  VisualifyConfig,
  /** Configuration loading options */
  LoadConfigOptions,
  /** Configuration cache entry */
  ConfigCacheEntry,
  /** Cache statistics */
  CacheStats,
  /** Config watcher control object */
  ConfigWatcher,
  /** Config reload callback type */
  ConfigReloadCallback,
  /** Partial configuration for merging */
  PartialConfig,
} from './config';

// ============================================================================
// Chart Types
// ============================================================================

export {
  /** Supported chart types */
  ChartType,
  /** Axis type */
  AxisType,
  /** Data zoom type */
  DataZoomType,
  /** 3D shading modes */
  ShadingType,
  /** 2D point coordinates */
  Point2D,
  /** 3D point coordinates */
  Point3D,
  /** Data point with metadata */
  DataPoint,
  /** Item style configuration */
  ItemStyle,
  /** Line style configuration */
  LineStyle,
  /** Label configuration */
  LabelConfig,
  /** Axis configuration */
  AxisConfig,
  /** 3D Axis configuration */
  Axis3DConfig,
  /** Grid configuration for 2D charts */
  GridConfig,
  /** 3D Grid configuration */
  Grid3DConfig,
  /** Visual map configuration */
  VisualMapConfig,
  /** Tooltip configuration */
  TooltipConfig,
  /** Legend configuration */
  LegendConfig,
  /** Toolbox configuration */
  ToolboxConfig,
  /** Base series configuration */
  SeriesConfig,
  /** Scatter series configuration */
  ScatterSeriesConfig,
  /** 3D Scatter series configuration */
  Scatter3DSeriesConfig,
  /** Bar series configuration */
  BarSeriesConfig,
  /** 3D Bar series configuration */
  Bar3DSeriesConfig,
  /** Line series configuration */
  LineSeriesConfig,
  /** 3D Line series configuration */
  Line3DSeriesConfig,
  /** Surface series configuration */
  SurfaceSeriesConfig,
  /** Title configuration */
  TitleConfig,
  /** Base chart configuration */
  ChartConfig,
  /** Scatter chart configuration */
  ScatterConfig,
  /** Bar chart configuration */
  BarConfig,
  /** Line chart configuration */
  LineConfig,
  /** 3D Scatter chart configuration */
  Scatter3DConfig,
  /** 3D Bar chart configuration */
  Bar3DConfig,
  /** 3D Line chart configuration */
  Line3DConfig,
  /** 3D Surface chart configuration */
  Surface3DConfig,
  /** Union of all chart configurations */
  AnyChartConfig,
  /** Chart data format types */
  ChartData,
  /** ECharts option object */
  EChartsOption,
} from './charts';

// ============================================================================
// Component Types
// ============================================================================

export {
  /** Base component props */
  BaseComponentProps,
  /** ReCharts wrapper props */
  RechartsProps,
  /** Scatter component props */
  ScatterProps,
  /** ScatterBio component props */
  ScatterBioProps,
  /** 3D Scatter component props */
  Scatter3DProps,
  /** 3D Bar component props */
  Bar3DProps,
  /** 3D Line component props */
  Line3DProps,
  /** 3D Surface component props */
  Surface3DProps,
  /** VisiumPlot component props */
  VisiumPlotProps,
  /** DotPlot component props */
  DotPlotProps,
  /** Grid layout configuration */
  GridLayoutConfig,
  /** DynamicGrid component props */
  DynamicGridProps,
  /** Widget base props */
  WidgetProps,
  /** Header widget props */
  HeaderProps,
  /** Footer widget props */
  FooterProps,
  /** Controller widget props */
  ControllerProps,
  /** Error boundary props */
  ErrorBoundaryProps,
  /** Error boundary state */
  ErrorBoundaryState,
  /** Loading component props */
  LoadingProps,
  /** Three.js scene props */
  ThreeSceneProps,
  /** Custom 3D component props */
  ThreeCustomProps,
  /** Circular progress props */
  CircularProgressProps,
  /** Selection component props */
  SelectionProps,
  /** Search bar props */
  SearchBarProps,
  /** Timeline component props */
  TimelineProps,
  /** Browser component props */
  BrowserProps,
  /** Mapping widget props */
  MappingProps,
  /** Layout configuration props */
  LayoutProps,
  /** Generic chart component props */
  ChartComponentProps,
  /** Union of all chart component props */
  AnyChartComponentProps,
} from './components';

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation error object
 */
export interface ValidationError {
  /** Path to the invalid property */
  path: string;
  /** Property name */
  property: string;
  /** Error message */
  message: string;
  /** Suggested fix */
  suggestion: string | null;
  /** Validation keyword that failed */
  keyword: string;
  /** Invalid value */
  value: unknown;
  /** Source of the configuration */
  source: string;
}

/**
 * Validation result object
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Array of validation errors */
  errors: ValidationError[];
  /** Summary message */
  summary: string | null;
}

/**
 * Error template function type
 */
export type ErrorTemplate = (params: {
  property: string;
  expected?: string;
  received?: string;
  values?: string[];
}) => string;

/**
 * Suggested fix function type
 */
export type SuggestedFix = (error: ValidationError) => string | null;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type for nested optional properties
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * JSON primitive types
 */
export type JSONPrimitive = string | number | boolean | null;

/**
 * JSON value types
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

/**
 * JSON object type
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * JSON array type
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * Type guard for checking if value is a plain object
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for checking if value is a valid chart configuration
 */
export function isChartConfig(value: unknown): value is ChartConfig {
  return (
    isPlainObject(value) &&
    typeof value.type === 'string' &&
    value.data !== undefined
  );
}

// ============================================================================
// Module Declarations
// ============================================================================

declare module 'visualifyjs' {
  // Re-export all types
  export * from './config';
  export * from './charts';
  export * from './components';

  // Main configuration function
  export function loadConfig(
    cwd?: string,
    overrides?: Record<string, unknown>,
    options?: LoadConfigOptions
  ): Promise<VisualifyConfig>;

  // Validation function
  export function validateConfig(
    config: unknown,
    options?: { source?: string }
  ): ValidationResult;

  // Version check
  export function isVersionCompatible(version: string): boolean;
}

declare module 'visualifyjs/types' {
  export * from './config';
  export * from './charts';
  export * from './components';
}
