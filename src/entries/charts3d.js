/**
 * 3D Charts Entry Point
 * @description Separate chunk for 3D visualization components
 * Loaded on demand when 3D chart types are detected
 * Global name: Visualify3D
 *
 * External dependencies (not bundled):
 * - three
 * - @react-three/fiber
 * - @react-three/drei
 * - echarts-gl
 */

// 3D visualization components
export { default as Scatter3D } from '../core/components/Scatter3D';
export { default as Bar3D } from '../core/components/Bar3D';
export { default as Surface3D } from '../core/components/Surface3D';
export { default as Line3D } from '../core/components/Line3D';
export { default as ThreeScene } from '../core/components/ThreeScene';
export { default as ThreeCustom } from '../core/components/ThreeCustom';

// ECharts GL integration (lazy loading, WebGL detection)
export {
	isWebGLSupported,
	getWebGLInfo,
	loadEChartsGL,
	preloadEChartsGL,
	getLoadingState,
	display3DError,
	cleanupWebGL,
	handleWebGLContextLoss,
} from '../core/modules/echarts/gl';

// Three.js module
export { default as ThreeJS } from '../core/modules/threejs/index';

/**
 * Visualify3D namespace
 * 3D chart components loaded on demand
 */
const Visualify3D = {
	version: process.env.VISUALIFY_VERSION || 'dev',

	/**
	 * Check if the current environment supports 3D rendering
	 * @returns {boolean}
	 */
	isSupported() {
		try {
			const canvas = document.createElement('canvas');
			const gl =
				canvas.getContext('webgl2') ||
				canvas.getContext('webgl') ||
				canvas.getContext('experimental-webgl');
			return !!gl;
		} catch (e) {
			return false;
		}
	},

	/**
	 * Preload 3D dependencies in the background
	 */
	async preload() {
		const { preloadEChartsGL } = await import('../core/modules/echarts/gl');
		preloadEChartsGL();
	},
};

export default Visualify3D;
