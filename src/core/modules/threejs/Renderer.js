/**
 * Renderer.js - Three.js WebGL Renderer for Visualify.js
 * Handles renderer setup, antialiasing, resize handling, and pixel ratio support
 */

import * as THREE from 'three';

/**
 * RendererManager class for managing WebGL renderers
 */
export class RendererManager {
	constructor(options = {}) {
		this.renderers = new Map();
		this.activeRendererId = null;

		this.defaultOptions = {
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance',
			precision: 'highp',
			stencil: false,
			depth: true,
			logarithmicDepthBuffer: false,
			...options,
		};
	}

	/**
	 * Create a new WebGL renderer
	 * @param {string} id - Renderer identifier
	 * @param {HTMLCanvasElement} canvas - Canvas element
	 * @param {Object} options - Renderer options
	 * @returns {THREE.WebGLRenderer}
	 */
	createRenderer(id, canvas, options = {}) {
		if (this.renderers.has(id)) {
			console.warn(`Renderer with id "${id}" already exists. Returning existing renderer.`);
			return this.renderers.get(id).renderer;
		}

		const config = { ...this.defaultOptions, ...options };

		// Create renderer
		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: config.antialias,
			alpha: config.alpha,
			powerPreference: config.powerPreference,
			stencil: config.stencil,
			depth: config.depth,
			logarithmicDepthBuffer: config.logarithmicDepthBuffer,
		});

		// Configure renderer
		this.configureRenderer(renderer, config);

		// Store renderer
		this.renderers.set(id, {
			renderer,
			config,
			canvas,
			resizeObserver: null,
			createdAt: Date.now(),
		});

		// Set as active if it's the first renderer
		if (!this.activeRendererId) {
			this.activeRendererId = id;
		}

		return renderer;
	}

	/**
	 * Configure renderer settings
	 * @param {THREE.WebGLRenderer} renderer
	 * @param {Object} config
	 */
	configureRenderer(renderer, config) {
		// Set pixel ratio (capped at 2 for performance)
		const pixelRatio = Math.min(window.devicePixelRatio, 2);
		renderer.setPixelRatio(pixelRatio);

		// Set size
		if (config.width && config.height) {
			renderer.setSize(config.width, config.height);
		}

		// Set precision
		if (config.precision) {
			renderer.capabilities.precision = config.precision;
		}

		// Configure shadow map
		if (config.shadowMap !== false) {
			renderer.shadowMap.enabled = true;
			renderer.shadowMap.type = config.shadowMapType || THREE.PCFSoftShadowMap;
		}

		// Set output color space
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		// Set tone mapping
		if (config.toneMapping) {
			renderer.toneMapping = config.toneMapping;
			if (config.toneMappingExposure) {
				renderer.toneMappingExposure = config.toneMappingExposure;
			}
		}

		// Set clear color
		if (config.clearColor !== undefined) {
			renderer.setClearColor(config.clearColor, config.clearAlpha ?? 1);
		}
	}

	/**
	 * Get a renderer by ID
	 * @param {string} id - Renderer identifier
	 * @returns {THREE.WebGLRenderer|null}
	 */
	getRenderer(id) {
		const rendererData = this.renderers.get(id);
		return rendererData ? rendererData.renderer : null;
	}

	/**
	 * Get the currently active renderer
	 * @returns {THREE.WebGLRenderer|null}
	 */
	getActiveRenderer() {
		return this.activeRendererId ? this.getRenderer(this.activeRendererId) : null;
	}

	/**
	 * Set the active renderer
	 * @param {string} id - Renderer identifier
	 */
	setActiveRenderer(id) {
		if (!this.renderers.has(id)) {
			throw new Error(`Renderer with id "${id}" does not exist`);
		}
		this.activeRendererId = id;
	}

	/**
	 * Update renderer size
	 * @param {string} id - Renderer identifier
	 * @param {number} width
	 * @param {number} height
	 */
	updateSize(id, width, height) {
		const rendererData = this.renderers.get(id);
		if (!rendererData) return;

		const renderer = rendererData.renderer;
		renderer.setSize(width, height);

		// Update config
		rendererData.config.width = width;
		rendererData.config.height = height;
	}

	/**
	 * Update pixel ratio
	 * @param {string} id - Renderer identifier
	 * @param {number} pixelRatio
	 */
	updatePixelRatio(id, pixelRatio) {
		const rendererData = this.renderers.get(id);
		if (!rendererData) return;

		const renderer = rendererData.renderer;
		renderer.setPixelRatio(Math.min(pixelRatio, 2));
	}

	/**
	 * Enable automatic resize handling
	 * @param {string} id - Renderer identifier
	 * @param {HTMLElement} container - Container element
	 */
	enableAutoResize(id, container) {
		const rendererData = this.renderers.get(id);
		if (!rendererData) return;

		// Clean up existing observer
		if (rendererData.resizeObserver) {
			rendererData.resizeObserver.disconnect();
		}

		// Create resize observer
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				this.updateSize(id, width, height);
			}
		});

		resizeObserver.observe(container);
		rendererData.resizeObserver = resizeObserver;
	}

	/**
	 * Disable automatic resize handling
	 * @param {string} id - Renderer identifier
	 */
	disableAutoResize(id) {
		const rendererData = this.renderers.get(id);
		if (!rendererData || !rendererData.resizeObserver) return;

		rendererData.resizeObserver.disconnect();
		rendererData.resizeObserver = null;
	}

	/**
	 * Render a scene with a camera
	 * @param {string} id - Renderer identifier
	 * @param {THREE.Scene} scene
	 * @param {THREE.Camera} camera
	 */
	render(id, scene, camera) {
		const renderer = this.getRenderer(id);
		if (!renderer) return;

		renderer.render(scene, camera);
	}

	/**
	 * Take a screenshot
	 * @param {string} id - Renderer identifier
	 * @param {string} mimeType - Image mime type
	 * @param {number} quality - Image quality (0-1)
	 * @returns {string} Data URL
	 */
	takeScreenshot(id, mimeType = 'image/png', quality = 1) {
		const renderer = this.getRenderer(id);
		if (!renderer) return null;

		return renderer.domElement.toDataURL(mimeType, quality);
	}

	/**
	 * Get WebGL info
	 * @param {string} id - Renderer identifier
	 * @returns {Object|null}
	 */
	getWebGLInfo(id) {
		const renderer = this.getRenderer(id);
		if (!renderer) return null;

		return {
			renderer: renderer.info.render,
			memory: renderer.info.memory,
			programs: renderer.info.programs?.length || 0,
		};
	}

	/**
	 * Reset WebGL info counters
	 * @param {string} id - Renderer identifier
	 */
	resetInfo(id) {
		const renderer = this.getRenderer(id);
		if (!renderer) return;

		renderer.info.reset();
	}

	/**
	 * Compile shaders for a scene
	 * @param {string} id - Renderer identifier
	 * @param {THREE.Scene} scene
	 * @param {THREE.Camera} camera
	 */
	compile(id, scene, camera) {
		const renderer = this.getRenderer(id);
		if (!renderer) return;

		renderer.compile(scene, camera);
	}

	/**
	 * Dispose of a renderer
	 * @param {string} id - Renderer identifier
	 */
	removeRenderer(id) {
		const rendererData = this.renderers.get(id);
		if (!rendererData) return;

		// Disable auto resize
		this.disableAutoResize(id);

		// Dispose renderer
		rendererData.renderer.dispose();

		// Remove from map
		this.renderers.delete(id);

		// Update active renderer if needed
		if (this.activeRendererId === id) {
			const remainingRenderers = Array.from(this.renderers.keys());
			this.activeRendererId = remainingRenderers.length > 0 ? remainingRenderers[0] : null;
		}
	}

	/**
	 * Get all renderer IDs
	 * @returns {string[]}
	 */
	getRendererIds() {
		return Array.from(this.renderers.keys());
	}

	/**
	 * Dispose all renderers
	 */
	dispose() {
		this.getRendererIds().forEach((id) => this.removeRenderer(id));
		this.activeRendererId = null;
	}
}

/**
 * Create a renderer from configuration
 * @param {HTMLCanvasElement} canvas
 * @param {Object} config
 * @returns {THREE.WebGLRenderer}
 */
export function createRendererFromConfig(canvas, config = {}) {
	const manager = new RendererManager(config);
	return manager.createRenderer('default', canvas, config);
}

/**
 * Handle window resize for a renderer
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Camera} camera
 * @param {HTMLElement} container
 */
export function handleResize(renderer, camera, container) {
	const width = container.clientWidth;
	const height = container.clientHeight;

	renderer.setSize(width, height);

	if (camera.isPerspectiveCamera) {
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	} else if (camera.isOrthographicCamera) {
		const aspect = width / height;
		const frustumSize = Math.max(
			camera.right - camera.left,
			camera.top - camera.bottom
		);

		camera.left = -frustumSize * aspect / 2;
		camera.right = frustumSize * aspect / 2;
		camera.top = frustumSize / 2;
		camera.bottom = -frustumSize / 2;
		camera.updateProjectionMatrix();
	}
}

export default RendererManager;
