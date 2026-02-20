/**
 * Three.js Module for Visualify.js
 * Provides foundation for custom 3D visualizations
 * @version 0.1.0
 */

import * as THREE from 'three';

// Core managers
export { SceneManager, createSceneFromConfig } from './Scene';
export { CameraManager, CameraType, createCameraFromConfig } from './Camera';
export { LightingManager, LightType, createLightsFromConfig, createDefaultLighting } from './Lighting';
export { RendererManager, createRendererFromConfig, handleResize } from './Renderer';

// Re-export Three.js for convenience
export { THREE };

// Version information
export const VERSION = '0.1.0';

/**
 * ThreeJSManager - Unified manager for Three.js scenes
 * Combines scene, camera, lighting, and renderer management
 */
export class ThreeJSManager {
	constructor(options = {}) {
		// Managers are lazily initialized in init() to avoid top-level await
		this.sceneManager = null;
		this.cameraManager = null;
		this.lightingManager = null;
		this.rendererManager = null;

		this.options = {
			autoRender: true,
			...options,
		};

		this.animationId = null;
		this.isRendering = false;
	}

	/**
	 * Initialize a complete Three.js setup
	 * @param {string} id - Setup identifier
	 * @param {HTMLCanvasElement} canvas
	 * @param {Object} config
	 * @returns {Object} Setup objects
	 */
	async init(id, canvas, config = {}) {
		// Ensure managers are loaded
		if (!this.sceneManager) {
			const { SceneManager } = await import('./Scene');
			this.sceneManager = new SceneManager();
		}
		if (!this.cameraManager) {
			const { CameraManager } = await import('./Camera');
			this.cameraManager = new CameraManager();
		}
		if (!this.lightingManager) {
			const { LightingManager } = await import('./Lighting');
			this.lightingManager = new LightingManager();
		}
		if (!this.rendererManager) {
			const { RendererManager } = await import('./Renderer');
			this.rendererManager = new RendererManager();
		}

		// Create scene
		const scene = this.sceneManager.createScene(`${id}_scene`, config.scene);

		// Create camera
		const camera = this.cameraManager.createCamera(`${id}_camera`, config.camera);

		// Create lights
		if (config.lights) {
			config.lights.forEach((lightConfig, index) => {
				const light = this.lightingManager.createLight(`${id}_light_${index}`, lightConfig);
				scene.add(light);
			});
		}

		// Create renderer
		const renderer = this.rendererManager.createRenderer(`${id}_renderer`, canvas, config.renderer);

		return { scene, camera, renderer };
	}

	/**
	 * Start render loop
	 * @param {Function} callback - Optional callback for each frame
	 */
	startRenderLoop(callback) {
		if (this.isRendering) return;

		this.isRendering = true;

		const render = () => {
			if (!this.isRendering) return;

			this.animationId = requestAnimationFrame(render);

			// Call user callback
			if (callback) {
				callback();
			}
		};

		render();
	}

	/**
	 * Stop render loop
	 */
	stopRenderLoop() {
		this.isRendering = false;
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	/**
	 * Render a single frame
	 * @param {string} sceneId
	 * @param {string} cameraId
	 * @param {string} rendererId
	 */
	render(sceneId, cameraId, rendererId) {
		const scene = this.sceneManager.getScene(sceneId);
		const camera = this.cameraManager.getCamera(cameraId);

		if (scene && camera) {
			this.rendererManager.render(rendererId, scene, camera);
		}
	}

	/**
	 * Dispose all resources
	 */
	dispose() {
		this.stopRenderLoop();

		if (this.sceneManager) this.sceneManager.dispose();
		if (this.cameraManager) this.cameraManager.dispose();
		if (this.lightingManager) this.lightingManager.dispose();
		if (this.rendererManager) this.rendererManager.dispose();
	}
}

// Default export
export default {
	THREE,
	VERSION,
	ThreeJSManager,
};
