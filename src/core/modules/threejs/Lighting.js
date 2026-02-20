/**
 * Lighting.js - Three.js Lighting Manager for Visualify.js
 * Handles ambient, directional, point lights and shadow configuration
 */

import * as THREE from 'three';

/**
 * Light types
 */
export const LightType = {
	AMBIENT: 'ambient',
	DIRECTIONAL: 'directional',
	POINT: 'point',
	SPOT: 'spot',
	HEMISPHERE: 'hemisphere',
	RECT_AREA: 'rectArea',
};

/**
 * LightingManager class for managing lights
 */
export class LightingManager {
	constructor() {
		this.lights = new Map();
		this.lightGroups = new Map();
	}

	/**
	 * Create an ambient light
	 * @param {string} id - Light identifier
	 * @param {Object} options - Light options
	 * @returns {THREE.AmbientLight}
	 */
	createAmbientLight(id, options = {}) {
		const config = {
			color: 0xffffff,
			intensity: 0.5,
			...options,
		};

		const light = new THREE.AmbientLight(config.color, config.intensity);
		this.storeLight(id, light, LightType.AMBIENT, config);

		return light;
	}

	/**
	 * Create a directional light
	 * @param {string} id - Light identifier
	 * @param {Object} options - Light options
	 * @returns {THREE.DirectionalLight}
	 */
	createDirectionalLight(id, options = {}) {
		const config = {
			color: 0xffffff,
			intensity: 1,
			position: [10, 10, 10],
			target: [0, 0, 0],
			castShadow: false,
			shadow: null,
			...options,
		};

		const light = new THREE.DirectionalLight(config.color, config.intensity);
		light.position.set(...config.position);
		light.target.position.set(...config.target);

		// Configure shadows
		if (config.castShadow) {
			light.castShadow = true;
			this.configureShadow(light, config.shadow);
		}

		this.storeLight(id, light, LightType.DIRECTIONAL, config);

		return light;
	}

	/**
	 * Create a point light
	 * @param {string} id - Light identifier
	 * @param {Object} options - Light options
	 * @returns {THREE.PointLight}
	 */
	createPointLight(id, options = {}) {
		const config = {
			color: 0xffffff,
			intensity: 1,
			distance: 0,
			decay: 2,
			position: [0, 0, 0],
			castShadow: false,
			shadow: null,
			...options,
		};

		const light = new THREE.PointLight(
			config.color,
			config.intensity,
			config.distance,
			config.decay
		);
		light.position.set(...config.position);

		// Configure shadows
		if (config.castShadow) {
			light.castShadow = true;
			this.configureShadow(light, config.shadow);
		}

		this.storeLight(id, light, LightType.POINT, config);

		return light;
	}

	/**
	 * Create a spot light
	 * @param {string} id - Light identifier
	 * @param {Object} options - Light options
	 * @returns {THREE.SpotLight}
	 */
	createSpotLight(id, options = {}) {
		const config = {
			color: 0xffffff,
			intensity: 1,
			distance: 0,
			angle: Math.PI / 6,
			penumbra: 0,
			decay: 2,
			position: [0, 10, 0],
			target: [0, 0, 0],
			castShadow: false,
			shadow: null,
			...options,
		};

		const light = new THREE.SpotLight(
			config.color,
			config.intensity,
			config.distance,
			config.angle,
			config.penumbra,
			config.decay
		);
		light.position.set(...config.position);
		light.target.position.set(...config.target);

		// Configure shadows
		if (config.castShadow) {
			light.castShadow = true;
			this.configureShadow(light, config.shadow);
		}

		this.storeLight(id, light, LightType.SPOT, config);

		return light;
	}

	/**
	 * Create a hemisphere light
	 * @param {string} id - Light identifier
	 * @param {Object} options - Light options
	 * @returns {THREE.HemisphereLight}
	 */
	createHemisphereLight(id, options = {}) {
		const config = {
			skyColor: 0xffffff,
			groundColor: 0x444444,
			intensity: 1,
			position: [0, 10, 0],
			...options,
		};

		const light = new THREE.HemisphereLight(
			config.skyColor,
			config.groundColor,
			config.intensity
		);
		light.position.set(...config.position);

		this.storeLight(id, light, LightType.HEMISPHERE, config);

		return light;
	}

	/**
	 * Configure shadow properties for a light
	 * @param {THREE.Light} light - Light with shadow capabilities
	 * @param {Object} shadowConfig - Shadow configuration
	 */
	configureShadow(light, shadowConfig = {}) {
		if (!light.shadow) return;

		const config = {
			mapSize: { width: 1024, height: 1024 },
			camera: {
				near: 0.5,
				far: 500,
				left: -50,
				right: 50,
				top: 50,
				bottom: -50,
			},
			bias: -0.001,
			radius: 1,
			...shadowConfig,
		};

		// Set shadow map size
		if (config.mapSize) {
			light.shadow.mapSize.width = config.mapSize.width;
			light.shadow.mapSize.height = config.mapSize.height;
		}

		// Configure shadow camera
		if (config.camera && light.shadow.camera) {
			Object.assign(light.shadow.camera, config.camera);
			light.shadow.camera.updateProjectionMatrix();
		}

		// Set bias and radius
		if (config.bias !== undefined) {
			light.shadow.bias = config.bias;
		}
		if (config.radius !== undefined) {
			light.shadow.radius = config.radius;
		}
	}

	/**
	 * Store light in manager
	 * @param {string} id
	 * @param {THREE.Light} light
	 * @param {string} type
	 * @param {Object} config
	 */
	storeLight(id, light, type, config) {
		if (this.lights.has(id)) {
			console.warn(`Light with id "${id}" already exists. Replacing.`);
			this.disposeLight(id);
		}

		this.lights.set(id, {
			light,
			type,
			config,
			createdAt: Date.now(),
		});
	}

	/**
	 * Create a light from configuration
	 * @param {string} id - Light identifier
	 * @param {Object} config - Light configuration
	 * @returns {THREE.Light}
	 */
	createLight(id, config = {}) {
		const type = config.type || LightType.AMBIENT;

		switch (type) {
			case LightType.AMBIENT:
				return this.createAmbientLight(id, config);
			case LightType.DIRECTIONAL:
				return this.createDirectionalLight(id, config);
			case LightType.POINT:
				return this.createPointLight(id, config);
			case LightType.SPOT:
				return this.createSpotLight(id, config);
			case LightType.HEMISPHERE:
				return this.createHemisphereLight(id, config);
			default:
				throw new Error(`Unknown light type: ${type}`);
		}
	}

	/**
	 * Get a light by ID
	 * @param {string} id - Light identifier
	 * @returns {THREE.Light|null}
	 */
	getLight(id) {
		const lightData = this.lights.get(id);
		return lightData ? lightData.light : null;
	}

	/**
	 * Update light intensity
	 * @param {string} id - Light identifier
	 * @param {number} intensity - New intensity
	 */
	updateIntensity(id, intensity) {
		const lightData = this.lights.get(id);
		if (lightData && lightData.light) {
			lightData.light.intensity = intensity;
		}
	}

	/**
	 * Update light color
	 * @param {string} id - Light identifier
	 * @param {string|number} color - New color
	 */
	updateColor(id, color) {
		const lightData = this.lights.get(id);
		if (lightData && lightData.light) {
			lightData.light.color.set(color);
		}
	}

	/**
	 * Update light position
	 * @param {string} id - Light identifier
	 * @param {number[]} position - New position [x, y, z]
	 */
	updatePosition(id, position) {
		const lightData = this.lights.get(id);
		if (lightData && lightData.light) {
			lightData.light.position.set(...position);
		}
	}

	/**
	 * Create a light group
	 * @param {string} groupId - Group identifier
	 * @param {string[]} lightIds - Array of light IDs to include
	 */
	createLightGroup(groupId, lightIds = []) {
		const group = new THREE.Group();

		lightIds.forEach((lightId) => {
			const lightData = this.lights.get(lightId);
			if (lightData) {
				group.add(lightData.light);
			}
		});

		this.lightGroups.set(groupId, {
			group,
			lightIds,
		});

		return group;
	}

	/**
	 * Get a light group
	 * @param {string} groupId - Group identifier
	 * @returns {THREE.Group|null}
	 */
	getLightGroup(groupId) {
		const groupData = this.lightGroups.get(groupId);
		return groupData ? groupData.group : null;
	}

	/**
	 * Remove a light
	 * @param {string} id - Light identifier
	 */
	removeLight(id) {
		this.disposeLight(id);
		this.lights.delete(id);
	}

	/**
	 * Dispose light resources
	 * @param {string} id - Light identifier
	 */
	disposeLight(id) {
		const lightData = this.lights.get(id);
		if (!lightData) return;

		const light = lightData.light;

		// Dispose shadow map if exists
		if (light.shadow && light.shadow.map) {
			light.shadow.map.dispose();
		}

		// Remove from any groups
		this.lightGroups.forEach((groupData) => {
			groupData.group.remove(light);
		});

		lightData.light = null;
	}

	/**
	 * Remove a light group
	 * @param {string} groupId - Group identifier
	 */
	removeLightGroup(groupId) {
		const groupData = this.lightGroups.get(groupId);
		if (!groupData) return;

		// Remove all lights from group
		groupData.lightIds.forEach((lightId) => {
			const lightData = this.lights.get(lightId);
			if (lightData) {
				groupData.group.remove(lightData.light);
			}
		});

		this.lightGroups.delete(groupId);
	}

	/**
	 * Get all light IDs
	 * @returns {string[]}
	 */
	getLightIds() {
		return Array.from(this.lights.keys());
	}

	/**
	 * Dispose all lights
	 */
	dispose() {
		this.getLightIds().forEach((id) => this.removeLight(id));
		this.lightGroups.clear();
	}
}

/**
 * Create lights from configuration array
 * @param {Object[]} lightConfigs - Array of light configurations
 * @returns {THREE.Light[]}
 */
export function createLightsFromConfig(lightConfigs = []) {
	const manager = new LightingManager();
	const lights = [];

	lightConfigs.forEach((config, index) => {
		const id = config.id || `light_${index}`;
		const light = manager.createLight(id, config);
		lights.push(light);
	});

	return lights;
}

/**
 * Create a default lighting setup
 * @returns {THREE.Light[]}
 */
export function createDefaultLighting() {
	return createLightsFromConfig([
		{ type: LightType.AMBIENT, color: 0xffffff, intensity: 0.5 },
		{
			type: LightType.DIRECTIONAL,
			color: 0xffffff,
			intensity: 1,
			position: [10, 10, 10],
			castShadow: true,
		},
	]);
}

export default LightingManager;
