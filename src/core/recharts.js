/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 16:02:42
 * @FilePath     : /visualifyjs/src/core/recharts.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import EChartSwitcher from './modules/echartswitcher';
import { VisualifyProvider } from './appContext';
import { initHMR, useHMR, preserveChartState, restoreChartState } from './hmr-client';

// Import 3D components for docs mode support
import Scatter3D from './components/Scatter3D';
import Bar3D from './components/Bar3D';
import Surface3D from './components/Surface3D';
import Line3D from './components/Line3D';

/**
 * Map of 3D chart types to their components
 * @type {Object<string, React.Component>}
 */
const CHART_3D_COMPONENTS = {
	scatter3d: Scatter3D,
	bar3d: Bar3D,
	surface3d: Surface3D,
	line3d: Line3D,
};

/**
 * Check if a chart type is a 3D chart
 * @param {string} type - Chart type from config
 * @returns {boolean} True if 3D chart type
 */
function is3DChartType(type) {
	if (!type) return false;
	const normalizedType = type.toLowerCase();
	return Object.keys(CHART_3D_COMPONENTS).includes(normalizedType);
}

/**
 * Global registry of chart instances for HMR state preservation
 * @type {Map<string, Object>}
 */
const chartRegistry = new Map();

/**
 * Chart wrapper component with HMR support
 * Renders either standard ECharts or 3D components based on config type
 * @param {Object} props - Component props
 * @param {Object} props.config - Chart configuration
 * @param {Object} [props.parser] - Data parser
 * @param {Object} [props.advanced] - Advanced options
 * @param {string} [props.chartId] - Unique chart identifier
 */
function ChartWithHMR({ config, parser, advanced, chartId }) {
	const chartRef = useRef(null);
	const [currentConfig, setCurrentConfig] = useState(config);
	const preservedStateRef = useRef(null);

	// Determine if this is a 3D chart
	const is3D = is3DChartType(currentConfig.type);

	// Preserve chart state before updates
	const preserveState = useCallback(() => {
		if (chartRef.current) {
			const instance = chartRef.current.getEchartsInstance?.() || chartRef.current;
			preservedStateRef.current = preserveChartState(instance);

			// Also store in global registry
			if (chartId) {
				chartRegistry.set(chartId, preservedStateRef.current);
			}

			return preservedStateRef.current;
		}
		return null;
	}, [chartId]);

	// Setup HMR integration
	useHMR({
		configType: 'component',
		onUpdate: (update) => {
			if (update.config) {
				// Preserve current state before updating
				preserveState();

				// Update config
				setCurrentConfig(update.config);
			}
		},
		onError: (error) => {
			console.error('[Recharts] HMR error:', error.message);
		},
		preserveState,
	});

	// Restore state after config update
	useEffect(() => {
		if (preservedStateRef.current && chartRef.current) {
			// Small delay to ensure chart is rendered
			const timer = setTimeout(() => {
				const instance = chartRef.current.getEchartsInstance?.() || chartRef.current;
				restoreChartState(instance, preservedStateRef.current);
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [currentConfig]);

	// Render 3D chart component
	if (is3D) {
		const Component3D = CHART_3D_COMPONENTS[currentConfig.type.toLowerCase()];
		return (
			<Component3D
				ref={chartRef}
				props={{
					config: currentConfig,
					parser: parser,
					advanced: advanced,
					id: chartId,
				}}
			/>
		);
	}

	// Render standard EChart
	return (
		<EChartSwitcher
			ref={chartRef}
			props={{
				config: currentConfig,
				parser: parser,
				advanced: advanced,
			}}
		/>
	);
}

class Recharts {
	constructor(config = {}) {
		const { el = null, id = null } = config;
		// Default to empty object if nothing is passed
		if (typeof el === 'string') {
			this.selector = document.querySelector(el);
			if (!this.selector) {
				throw new Error(`Element not found with selector: ${el}`);
			}
		} else {
			this.selector = el;
		}
		const { parser = null, advanced = null, ...rest } = config;
		this.config = rest;
		this.parser = parser;
		this.advanced = advanced;
		this.chartId = id || `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		this.root = null;
		this.isMounted = false;

		// Initialize HMR if available
		if (typeof window !== 'undefined' && window.__VISUALIFY_HMR__?.enabled) {
			initHMR();
		}
	}

	/**
	 * Mount the chart to the DOM
	 * @param {string|Element} [selector=this.selector] - Selector or element to mount to
	 * @returns {Recharts} This instance for chaining
	 */
	mount(selector = this.selector) {
		const el =
			typeof selector === 'string'
				? document.querySelector(selector)
				: selector;

		if (!el)
			throw new Error(`Element not found with selector: ${selector}`);

		try {
			// Check for preserved state from HMR
			const preservedState = chartRegistry.get(this.chartId);

			// Create or reuse root
			if (!this.root) {
				this.root = createRoot(el);
			}

			this.root.render(
				<VisualifyProvider>
					<ChartWithHMR
						config={this.config}
						parser={this.parser}
						advanced={this.advanced}
						chartId={this.chartId}
					/>
				</VisualifyProvider>,
			);

			this.isMounted = true;

			// Register for HMR updates
			this.registerHMR();
		} catch (e) {
			console.error('Error mounting chart:', e);
		}

		return this;
	}

	/**
	 * Unmount the chart and cleanup
	 * @returns {Recharts} This instance for chaining
	 */
	unmount() {
		if (this.root) {
			// Preserve state before unmounting
			this.preserveState();

			this.root.unmount();
			this.root = null;
			this.isMounted = false;
		}

		// Unregister from HMR
		this.unregisterHMR();

		return this;
	}

	/**
	 * Update the chart configuration (for HMR)
	 * @param {Object} newConfig - New configuration
	 * @returns {Recharts} This instance for chaining
	 */
	update(newConfig) {
		// Preserve current state
		this.preserveState();

		// Update config
		const { parser, advanced, ...rest } = newConfig;
		this.config = { ...this.config, ...rest };
		if (parser) this.parser = parser;
		if (advanced) this.advanced = advanced;

		// Re-mount if already mounted
		if (this.isMounted) {
			this.mount();
		}

		return this;
	}

	/**
	 * Preserve the current chart state
	 * @returns {Object|null} The preserved state
	 */
	preserveState() {
		// State is preserved in the ChartWithHMR component
		// This method is for external access
		const state = chartRegistry.get(this.chartId);
		return state || null;
	}

	/**
	 * Restore chart state
	 * @param {Object} state - State to restore
	 * @returns {Recharts} This instance for chaining
	 */
	restoreState(state) {
		if (state) {
			chartRegistry.set(this.chartId, state);
		}
		return this;
	}

	/**
	 * Register this chart for HMR updates
	 * @private
	 */
	registerHMR() {
		if (typeof window === 'undefined') return;

		// Store reference for HMR updates
		if (!window.__VISUALIFY_CHARTS__) {
			window.__VISUALIFY_CHARTS__ = new Map();
		}
		window.__VISUALIFY_CHARTS__.set(this.chartId, this);
	}

	/**
	 * Unregister this chart from HMR updates
	 * @private
	 */
	unregisterHMR() {
		if (typeof window === 'undefined') return;

		window.__VISUALIFY_CHARTS__?.delete(this.chartId);
		chartRegistry.delete(this.chartId);
	}

	/**
	 * Get the chart ID
	 * @returns {string} The chart ID
	 */
	getId() {
		return this.chartId;
	}

	/**
	 * Check if the chart is mounted
	 * @returns {boolean} Whether the chart is mounted
	 */
	getIsMounted() {
		return this.isMounted;
	}
}

/**
 * Reload all mounted charts (for HMR)
 * @param {Object} [configUpdate] - Optional configuration update
 */
export function reloadAllCharts(configUpdate) {
	if (typeof window === 'undefined') return;

	const charts = window.__VISUALIFY_CHARTS__;
	if (!charts) return;

	charts.forEach((chart) => {
		if (chart.getIsMounted() && configUpdate) {
			chart.update(configUpdate);
		}
	});
}

/**
 * Preserve state of all charts
 * @returns {Map<string, Object>} Map of chart IDs to preserved states
 */
export function preserveAllChartStates() {
	const states = new Map();

	chartRegistry.forEach((state, chartId) => {
		states.set(chartId, state);
	});

	return states;
}

/**
 * Restore state to all charts
 * @param {Map<string, Object>} states - Map of chart IDs to states
 */
export function restoreAllChartStates(states) {
	states.forEach((state, chartId) => {
		chartRegistry.set(chartId, state);
	});
}

export default Recharts;
