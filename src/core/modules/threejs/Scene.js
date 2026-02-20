/**
 * Scene.js - Three.js Scene Manager for Visualify.js
 * Handles scene creation, scene graph operations, and multiple viewport support
 */

import * as THREE from 'three';

/**
 * SceneManager class for managing Three.js scenes
 */
export class SceneManager {
	constructor(options = {}) {
		this.scenes = new Map();
		this.activeSceneId = null;
		this.defaultOptions = {
			backgroundColor: 0x000000,
			fog: null,
			...options,
		};
	}

	/**
	 * Create a new scene
	 * @param {string} id - Unique scene identifier
	 * @param {Object} options - Scene configuration options
	 * @returns {THREE.Scene} The created scene
	 */
	createScene(id, options = {}) {
		if (this.scenes.has(id)) {
			console.warn(`Scene with id "${id}" already exists. Returning existing scene.`);
			return this.scenes.get(id).scene;
		}

		const scene = new THREE.Scene();
		const config = { ...this.defaultOptions, ...options };

		// Set background
		if (config.backgroundColor !== undefined) {
			scene.background = new THREE.Color(config.backgroundColor);
		}

		// Set fog if provided
		if (config.fog) {
			scene.fog = new THREE.Fog(
				config.fog.color || 0x000000,
				config.fog.near || 1,
				config.fog.far || 1000
			);
		}

		// Store scene with metadata
		this.scenes.set(id, {
			scene,
			config,
			objects: new Map(),
			createdAt: Date.now(),
		});

		// Set as active if it's the first scene
		if (!this.activeSceneId) {
			this.activeSceneId = id;
		}

		return scene;
	}

	/**
	 * Get a scene by ID
	 * @param {string} id - Scene identifier
	 * @returns {THREE.Scene|null}
	 */
	getScene(id) {
		const sceneData = this.scenes.get(id);
		return sceneData ? sceneData.scene : null;
	}

	/**
	 * Get the currently active scene
	 * @returns {THREE.Scene|null}
	 */
	getActiveScene() {
		return this.activeSceneId ? this.getScene(this.activeSceneId) : null;
	}

	/**
	 * Set the active scene
	 * @param {string} id - Scene identifier
	 */
	setActiveScene(id) {
		if (!this.scenes.has(id)) {
			throw new Error(`Scene with id "${id}" does not exist`);
		}
		this.activeSceneId = id;
	}

	/**
	 * Add an object to a scene
	 * @param {string} sceneId - Scene identifier
	 * @param {string} objectId - Object identifier
	 * @param {THREE.Object3D} object - Three.js object
	 */
	addObject(sceneId, objectId, object) {
		const sceneData = this.scenes.get(sceneId);
		if (!sceneData) {
			throw new Error(`Scene with id "${sceneId}" does not exist`);
		}

		sceneData.scene.add(object);
		sceneData.objects.set(objectId, object);
	}

	/**
	 * Remove an object from a scene
	 * @param {string} sceneId - Scene identifier
	 * @param {string} objectId - Object identifier
	 */
	removeObject(sceneId, objectId) {
		const sceneData = this.scenes.get(sceneId);
		if (!sceneData) return;

		const object = sceneData.objects.get(objectId);
		if (object) {
			sceneData.scene.remove(object);
			this.disposeObject(object);
			sceneData.objects.delete(objectId);
		}
	}

	/**
	 * Get an object from a scene
	 * @param {string} sceneId - Scene identifier
	 * @param {string} objectId - Object identifier
	 * @returns {THREE.Object3D|null}
	 */
	getObject(sceneId, objectId) {
		const sceneData = this.scenes.get(sceneId);
		return sceneData ? sceneData.objects.get(objectId) || null : null;
	}

	/**
	 * Clear all objects from a scene
	 * @param {string} sceneId - Scene identifier
	 */
	clearScene(sceneId) {
		const sceneData = this.scenes.get(sceneId);
		if (!sceneData) return;

		// Remove and dispose all objects
		sceneData.objects.forEach((object, objectId) => {
			sceneData.scene.remove(object);
			this.disposeObject(object);
		});
		sceneData.objects.clear();
	}

	/**
	 * Remove a scene and dispose all resources
	 * @param {string} id - Scene identifier
	 */
	removeScene(id) {
		const sceneData = this.scenes.get(id);
		if (!sceneData) return;

		// Clear all objects
		this.clearScene(id);

		// Dispose scene
		if (sceneData.scene.background) {
			if (sceneData.scene.background.dispose) {
				sceneData.scene.background.dispose();
			}
		}

		this.scenes.delete(id);

		// Update active scene if needed
		if (this.activeSceneId === id) {
			const remainingScenes = Array.from(this.scenes.keys());
			this.activeSceneId = remainingScenes.length > 0 ? remainingScenes[0] : null;
		}
	}

	/**
	 * Dispose a Three.js object and its resources
	 * @param {THREE.Object3D} object
	 */
	disposeObject(object) {
		if (!object) return;

		// Traverse and dispose geometries and materials
		object.traverse((child) => {
			if (child.geometry) {
				child.geometry.dispose();
			}

			if (child.material) {
				if (Array.isArray(child.material)) {
					child.material.forEach((material) => this.disposeMaterial(material));
				} else {
					this.disposeMaterial(child.material);
				}
			}
		});
	}

	/**
	 * Dispose material and its textures
	 * @param {THREE.Material} material
	 */
	disposeMaterial(material) {
		if (!material) return;

		// Dispose textures
		Object.keys(material).forEach((key) => {
			const value = material[key];
			if (value && value.isTexture) {
				value.dispose();
			}
		});

		material.dispose();
	}

	/**
	 * Get all scene IDs
	 * @returns {string[]}
	 */
	getSceneIds() {
		return Array.from(this.scenes.keys());
	}

	/**
	 * Dispose all scenes and resources
	 */
	dispose() {
		this.getSceneIds().forEach((id) => this.removeScene(id));
		this.activeSceneId = null;
	}
}

/**
 * Create a scene from configuration
 * @param {Object} config - Scene configuration
 * @returns {THREE.Scene}
 */
export function createSceneFromConfig(config = {}) {
	const scene = new THREE.Scene();

	// Set background color
	if (config.backgroundColor) {
		scene.background = new THREE.Color(config.backgroundColor);
	}

	// Set fog
	if (config.fog) {
		scene.fog = new THREE.Fog(
			config.fog.color || 0x000000,
			config.fog.near || 1,
			config.fog.far || 1000
		);
	}

	return scene;
}

export default SceneManager;
