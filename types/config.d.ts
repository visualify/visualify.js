/**
 * Visualify.js Configuration Types
 * @module types/config
 *
 * @example
 * ```typescript
 * import { VisualifyConfig, DocsConfig } from 'visualifyjs/types';
 *
 * const config: VisualifyConfig = {
 *   version: '3.0.0',
 *   mode: 'portal',
 *   docs: {
 *     basePath: './docs',
 *     theme: 'vue',
 *     plugins: []
 *   }
 * };
 * ```
 */

/**
 * Application operating mode
 * - 'docs': Documentation mode with markdown rendering
 * - 'portal': Full portal mode with navigation
 * - 'hybrid': Combined docs and portal
 * - 'auto': Automatically detect based on content
 */
export type AppMode = 'docs' | 'portal' | 'hybrid' | 'auto';

/**
 * Supported charting libraries
 */
export type ChartLibrary = 'echarts' | 'plotly';

/**
 * Data source types for portal configuration
 */
export type DataSourceType = 'json' | 'csv' | 'api' | 'websocket';

/**
 * Data source configuration for portal
 */
export interface DataSource {
  /** Unique name for the data source */
  name: string;
  /** Type of data source */
  type: DataSourceType;
  /** URL for API or WebSocket connections */
  url?: string;
  /** File path for local data files */
  path?: string;
  /** Additional properties for specific data source types */
  [key: string]: unknown;
}

/**
 * Documentation configuration
 */
export interface DocsConfig {
  /** Base path for documentation files */
  basePath: string;
  /** Documentation theme */
  theme: string;
  /** List of plugin modules to load */
  plugins: string[];
  /** Additional documentation settings */
  [key: string]: unknown;
}

/**
 * Portal configuration
 */
export interface PortalConfig {
  /** Homepage configuration file */
  homepage: string;
  /** Portal theme */
  theme: string;
  /** Data sources for the portal */
  dataSources: DataSource[];
  /** Additional portal settings */
  [key: string]: unknown;
}

/**
 * Visualization configuration
 */
export interface VisualizationConfig {
  /** Default charting library */
  defaultLibrary: ChartLibrary;
  /** Enable 3D visualization capabilities */
  enable3D: boolean;
  /** Use Web Workers for rendering */
  webWorkers: boolean;
  /** Additional visualization settings */
  [key: string]: unknown;
}

/**
 * Main Visualify configuration interface
 * This is the root configuration object used throughout the application.
 *
 * @example
 * ```typescript
 * const config: VisualifyConfig = {
 *   version: '3.0.0',
 *   mode: 'portal',
 *   docs: {
 *     basePath: './docs',
 *     theme: 'modern',
 *     plugins: ['search', 'pagination']
 *   },
 *   portal: {
 *     homepage: 'home.json',
 *     theme: 'modern',
 *     dataSources: [
 *       { name: 'api', type: 'api', url: 'https://api.example.com' }
 *     ]
 *   },
 *   visualization: {
 *     defaultLibrary: 'echarts',
 *     enable3D: true,
 *     webWorkers: false
 *   }
 * };
 * ```
 */
export interface VisualifyConfig {
  /** Schema version for compatibility checking */
  version: '3.0.0';
  /** Application operating mode */
  mode: AppMode;
  /** Documentation configuration (required in docs/hybrid modes) */
  docs?: DocsConfig;
  /** Portal configuration (required in portal/hybrid modes) */
  portal?: PortalConfig;
  /** Visualization configuration */
  visualization?: VisualizationConfig;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Configuration loading options
 */
export interface LoadConfigOptions {
  /** Whether to validate the final config */
  validate?: boolean;
  /** Skip loading from file */
  skipFile?: boolean;
  /** Skip loading from environment */
  skipEnvironment?: boolean;
}

/**
 * Configuration cache entry
 */
export interface ConfigCacheEntry {
  /** Parsed configuration object */
  config: VisualifyConfig;
  /** Last modification time */
  mtime: Date;
  /** Path to the config file */
  filepath: string;
}

/**
 * Configuration cache statistics
 */
export interface CacheStats {
  /** Number of cached configurations */
  size: number;
  /** List of cached file paths */
  files: string[];
}

/**
 * Watcher control object returned by watchConfig
 */
export interface ConfigWatcher {
  /** Stop watching for changes */
  stop: () => void;
  /** Path to the watched file */
  filepath: string;
}

/**
 * Configuration reload callback
 */
export type ConfigReloadCallback = (
  config: VisualifyConfig | null,
  error: Error | null
) => void;

/**
 * Partial configuration for merging
 */
export type PartialConfig = Partial<VisualifyConfig> & {
  [key: string]: unknown;
};
