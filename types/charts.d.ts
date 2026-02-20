/**
 * Visualify.js Chart Configuration Types
 * @module types/charts
 *
 * @example
 * ```typescript
 * import { ScatterConfig, Bar3DConfig } from 'visualifyjs/types';
 *
 * const scatter: ScatterConfig = {
 *   type: 'scatter',
 *   data: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
 *   title: 'My Scatter Plot'
 * };
 * ```
 */

import { CSSProperties } from 'react';

/**
 * Supported chart types
 */
export type ChartType =
  | 'scatter'
  | 'scatter3D'
  | 'bar'
  | 'bar3D'
  | 'line'
  | 'line3D'
  | 'surface3D'
  | 'pie'
  | 'heatmap'
  | 'custom';

/**
 * Axis type for charts
 */
export type AxisType = 'value' | 'category' | 'time' | 'log';

/**
 * Data zoom type
 */
export type DataZoomType = 'inside' | 'slider' | 'both' | 'none';

/**
 * 3D shading modes
 */
export type ShadingType = 'lambert' | 'realistic' | 'color';

/**
 * Coordinate in 2D space
 */
export interface Point2D {
  x: number;
  y: number;
}

/**
 * Coordinate in 3D space
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Data point with optional metadata
 */
export interface DataPoint extends Record<string, unknown> {
  name?: string;
  value?: number | number[];
  itemStyle?: ItemStyle;
}

/**
 * Item style configuration
 */
export interface ItemStyle {
  color?: string;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  [key: string]: unknown;
}

/**
 * Line style configuration
 */
export interface LineStyle {
  color?: string;
  width?: number;
  type?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
  [key: string]: unknown;
}

/**
 * Label configuration
 */
export interface LabelConfig {
  show?: boolean;
  position?: string;
  formatter?: string | ((params: unknown) => string);
  fontSize?: number;
  color?: string;
  [key: string]: unknown;
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  /** Axis type */
  type?: AxisType;
  /** Axis name */
  name?: string;
  /** Gap between axis name and axis line */
  nameGap?: number;
  /** Location of axis name */
  nameLocation?: 'start' | 'center' | 'end';
  /** Minimum value */
  min?: number | string;
  /** Maximum value */
  max?: number | string;
  /** Axis data for category type */
  data?: string[] | number[];
  /** Show axis line */
  axisLine?: { show?: boolean; lineStyle?: LineStyle };
  /** Show axis labels */
  axisLabel?: { show?: boolean; formatter?: string | ((value: unknown) => string) };
  /** Show split lines */
  splitLine?: { show?: boolean; lineStyle?: LineStyle };
  [key: string]: unknown;
}

/**
 * 3D Axis configuration
 */
export interface Axis3DConfig extends AxisConfig {
  /** 3D specific axis settings */
  nameTextStyle?: {
    fontSize?: number;
    color?: string;
  };
}

/**
 * Grid configuration for 2D charts
 */
export interface GridConfig {
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  containLabel?: boolean;
  show?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  [key: string]: unknown;
}

/**
 * 3D Grid configuration
 */
export interface Grid3DConfig {
  /** Width of the 3D box */
  boxWidth?: number;
  /** Depth of the 3D box */
  boxDepth?: number;
  /** Height of the 3D box */
  boxHeight?: number;
  /** View control settings */
  viewControl?: {
    autoRotate?: boolean;
    projection?: 'perspective' | 'orthographic';
    alpha?: number;
    beta?: number;
    distance?: number;
    [key: string]: unknown;
  };
  /** Light settings */
  light?: {
    main?: {
      intensity?: number;
      shadow?: boolean;
      [key: string]: unknown;
    };
    ambient?: {
      intensity?: number;
      [key: string]: unknown;
    };
  };
  [key: string]: unknown;
}

/**
 * Visual map configuration for data mapping
 */
export interface VisualMapConfig {
  show?: boolean;
  type?: 'continuous' | 'piecewise';
  min?: number;
  max?: number;
  dimension?: number;
  inRange?: {
    color?: string[];
    symbolSize?: number[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  show?: boolean;
  trigger?: 'item' | 'axis' | 'none';
  formatter?: string | ((params: unknown) => string);
  axisPointer?: {
    type?: 'line' | 'cross' | 'shadow';
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Legend configuration
 */
export interface LegendConfig {
  show?: boolean;
  data?: string[];
  orient?: 'horizontal' | 'vertical';
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  [key: string]: unknown;
}

/**
 * Toolbox configuration
 */
export interface ToolboxConfig {
  show?: boolean;
  feature?: {
    saveAsImage?: { show?: boolean; [key: string]: unknown };
    dataZoom?: { show?: boolean; [key: string]: unknown };
    restore?: { show?: boolean; [key: string]: unknown };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Series configuration base interface
 */
export interface SeriesConfig {
  type?: string;
  name?: string;
  data?: unknown[];
  itemStyle?: ItemStyle;
  label?: LabelConfig;
  emphasis?: {
    itemStyle?: ItemStyle;
    label?: LabelConfig;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Scatter series configuration
 */
export interface ScatterSeriesConfig extends SeriesConfig {
  type: 'scatter';
  symbolSize?: number | ((data: unknown) => number);
  symbol?: string;
}

/**
 * 3D Scatter series configuration
 */
export interface Scatter3DSeriesConfig extends SeriesConfig {
  type: 'scatter3D';
  symbolSize?: number;
  opacity?: number;
  shading?: ShadingType;
}

/**
 * Bar series configuration
 */
export interface BarSeriesConfig extends SeriesConfig {
  type: 'bar';
  barWidth?: string | number;
  barGap?: string | number;
  stack?: string;
}

/**
 * 3D Bar series configuration
 */
export interface Bar3DSeriesConfig extends SeriesConfig {
  type: 'bar3D';
  shading?: ShadingType;
  bevelSize?: number;
  bevelSmoothness?: number;
}

/**
 * Line series configuration
 */
export interface LineSeriesConfig extends SeriesConfig {
  type: 'line';
  smooth?: boolean;
  lineStyle?: LineStyle;
  areaStyle?: ItemStyle;
  symbol?: string;
  symbolSize?: number;
  connectNulls?: boolean;
}

/**
 * 3D Line series configuration
 */
export interface Line3DSeriesConfig extends SeriesConfig {
  type: 'line3D';
  lineStyle?: LineStyle;
  symbol?: string;
  symbolSize?: number;
}

/**
 * 3D Surface series configuration
 */
export interface SurfaceSeriesConfig extends SeriesConfig {
  type: 'surface';
  shading?: ShadingType;
  wireframe?: {
    show?: boolean;
    lineStyle?: LineStyle;
  };
  contour?: {
    show?: boolean;
    color?: string;
    [key: string]: unknown;
  };
}

/**
 * Title configuration
 */
export interface TitleConfig {
  text?: string;
  subtext?: string;
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
  textStyle?: {
    fontSize?: number;
    color?: string;
    fontWeight?: string | number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Base chart configuration interface
 * All chart configurations extend this interface.
 */
export interface ChartConfig {
  /** Chart type identifier */
  type: ChartType;
  /** Chart data - format varies by chart type */
  data: Record<string, unknown> | unknown[];
  /** Chart title configuration */
  title?: string | TitleConfig;
  /** Chart width */
  chartWidth?: string | number;
  /** Chart height */
  chartHeight?: string | number;
  /** Background color */
  backgroundColor?: string;
  /** Color palette */
  color?: string[];
  /** CSS styles */
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * Scatter chart configuration
 */
export interface ScatterConfig extends ChartConfig {
  type: 'scatter';
  data: Point2D[] | number[][] | DataPoint[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series?: ScatterSeriesConfig | ScatterSeriesConfig[];
  visualMap?: VisualMapConfig | VisualMapConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  toolbox?: ToolboxConfig;
  grid?: GridConfig;
  dataZoom?: DataZoomType;
  labels?: { x?: string; y?: string };
  formatter?: string | ((params: unknown) => string);
  is3D?: boolean;
}

/**
 * Bar chart configuration
 */
export interface BarConfig extends ChartConfig {
  type: 'bar';
  data: number[] | DataPoint[] | Record<string, unknown>[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series?: BarSeriesConfig | BarSeriesConfig[];
  visualMap?: VisualMapConfig | VisualMapConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  toolbox?: ToolboxConfig;
  grid?: GridConfig;
}

/**
 * Line chart configuration
 */
export interface LineConfig extends ChartConfig {
  type: 'line';
  data: number[] | DataPoint[] | Record<string, unknown>[];
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  series?: LineSeriesConfig | LineSeriesConfig[];
  visualMap?: VisualMapConfig | VisualMapConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  toolbox?: ToolboxConfig;
  grid?: GridConfig;
}

/**
 * 3D Scatter chart configuration
 */
export interface Scatter3DConfig extends ChartConfig {
  type: 'scatter3D';
  data: Point3D[] | number[][];
  xAxis3D?: Axis3DConfig;
  yAxis3D?: Axis3DConfig;
  zAxis3D?: Axis3DConfig;
  grid3D?: Grid3DConfig;
  series?: Scatter3DSeriesConfig;
  visualMap?: VisualMapConfig | VisualMapConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  toolbox?: ToolboxConfig;
}

/**
 * 3D Bar chart configuration
 */
export interface Bar3DConfig extends ChartConfig {
  type: 'bar3D';
  data: Point3D[] | number[][];
  xAxis3D?: Axis3DConfig;
  yAxis3D?: Axis3DConfig;
  zAxis3D?: Axis3DConfig;
  grid3D?: Grid3DConfig;
  series?: Bar3DSeriesConfig;
  visualMap?: VisualMapConfig | VisualMapConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  toolbox?: ToolboxConfig;
}

/**
 * 3D Line chart configuration
 */
export interface Line3DConfig extends ChartConfig {
  type: 'line3D';
  data: Point3D[] | number[][] | { x: number[]; y: number[]; z: number[] };
  xAxis3D?: Axis3DConfig;
  yAxis3D?: Axis3DConfig;
  zAxis3D?: Axis3DConfig;
  grid3D?: Grid3DConfig;
  series?: Line3DSeriesConfig;
  visualMap?: VisualMapConfig | VisualMapConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  toolbox?: ToolboxConfig;
}

/**
 * 3D Surface chart configuration
 */
export interface Surface3DConfig extends ChartConfig {
  type: 'surface3D';
  data: Point3D[] | number[][] | ((x: number, y: number) => number);
  xAxis3D?: Axis3DConfig;
  yAxis3D?: Axis3DConfig;
  zAxis3D?: Axis3DConfig;
  grid3D?: Grid3DConfig;
  series?: SurfaceSeriesConfig;
  visualMap?: VisualMapConfig | VisualMapConfig[];
  tooltip?: TooltipConfig;
  legend?: LegendConfig;
  toolbox?: ToolboxConfig;
  contour?: {
    show?: boolean;
    color?: string;
    [key: string]: unknown;
  };
  range?: {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    step?: number;
  };
}

/**
 * Union type of all chart configurations
 */
export type AnyChartConfig =
  | ScatterConfig
  | BarConfig
  | LineConfig
  | Scatter3DConfig
  | Bar3DConfig
  | Line3DConfig
  | Surface3DConfig;

/**
 * Chart data format types
 */
export type ChartData =
  | Point2D[]
  | Point3D[]
  | number[][]
  | DataPoint[]
  | Record<string, unknown>[];

/**
 * ECharts option object (simplified)
 */
export interface EChartsOption {
  title?: TitleConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  toolbox?: ToolboxConfig;
  grid?: GridConfig | GridConfig[];
  grid3D?: Grid3DConfig;
  xAxis?: AxisConfig | AxisConfig[];
  yAxis?: AxisConfig | AxisConfig[];
  xAxis3D?: Axis3DConfig;
  yAxis3D?: Axis3DConfig;
  zAxis3D?: Axis3DConfig;
  series?: SeriesConfig | SeriesConfig[];
  visualMap?: VisualMapConfig | VisualMapConfig[];
  dataZoom?: unknown[];
  backgroundColor?: string;
  color?: string[];
  [key: string]: unknown;
}
