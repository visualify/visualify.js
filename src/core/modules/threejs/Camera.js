/**
 * Camera.js - Three.js Camera Manager for Visualify.js
 * Handles perspective and orthographic cameras with animation helpers
 */

import * as THREE from 'three';

/**
 * Camera types
 */
export const CameraType = {
	PERSPECTIVE: 'perspective',
	ORTHOGRAPHIC: 'orthographic',
};

/**
 * CameraManager class for managing cameras
 */
export class CameraManager {
	constructor(options = {}) {
		this.cameras = new Map();
		this.activeCameraId = null;
		this.defaultOptions = {
			type: CameraType.PERSPECTIVE,
			position: [0, 0, 100],
			target: [0, 0, 0],
			up: [0, 1, 0],
			...options,
		};
	}

	/**
	 * Create a perspective camera
	 * @param {string} id - Camera identifier
	 * @param {Object} options - Camera options
	 * @returns {THREE.PerspectiveCamera}
	 */
	createPerspectiveCamera(id, options = {}) {
		const config = {
			fov: 75,
			near: 0.1,
			far: 1000,
			aspect: window.innerWidth / window.innerHeight,
			...this.defaultOptions,
			...options,
		};

		const camera = new THREE.PerspectiveCamera(
			config.fov,
			config.aspect,
			config.near,
			config.far
		);

		this.setupCamera(camera, config);
		this.storeCamera(id, camera, config);

		return camera;
	}

	/**
	 * Create an orthographic camera
	 * @param {string} id - Camera identifier
	 * @param {Object} options - Camera options
	 * @returns {THREE.OrthographicCamera}
	 */
	createOrthographicCamera(id, options = {}) {
		const config = {
			left: -50,
			right: 50,
			top: 50,
			bottom: -50,
			near: 0.1,
			far: 1000,
			...this.defaultOptions,
			...options,
		};

		const camera = new THREE.OrthographicCamera(
			config.left,
			config.right,
			config.top,
			config.bottom,
			config.near,
			config.far
		);

		this.setupCamera(camera, config);
		this.storeCamera(id, camera, config);

		return camera;
	}

	/**
	 * Setup camera position and orientation
	 * @param {THREE.Camera} camera
	 * @param {Object} config
	 */
	setupCamera(camera, config) {
		// Set position
		if (config.position) {
			camera.position.set(...config.position);
		}

		// Set up vector
		if (config.up) {
			camera.up.set(...config.up);
		}

		// Look at target
		if (config.target) {
			camera.lookAt(...config.target);
		}
	}

	/**
	 * Store camera in manager
	 * @param {string} id
	 * @param {THREE.Camera} camera
	 * @param {Object} config
	 */
	storeCamera(id, camera, config) {
		if (this.cameras.has(id)) {
			console.warn(`Camera with id "${id}" already exists. Replacing.`);
			this.disposeCamera(id);
		}

		this.cameras.set(id, {
			camera,
			config,
			createdAt: Date.now(),
		});

		// Set as active if it's the first camera
		if (!this.activeCameraId) {
			this.activeCameraId = id;
		}
	}

	/**
	 * Create a camera from configuration
	 * @param {string} id - Camera identifier
	 * @param {Object} config - Camera configuration
	 * @returns {THREE.Camera}
	 */
	createCamera(id, config = {}) {
		const type = config.type || this.defaultOptions.type;

		switch (type) {
			case CameraType.PERSPECTIVE:
				return this.createPerspectiveCamera(id, config);
			case CameraType.ORTHOGRAPHIC:
				return this.createOrthographicCamera(id, config);
			default:
				throw new Error(`Unknown camera type: ${type}`);
		}
	}

	/**
	 * Get a camera by ID
	 * @param {string} id - Camera identifier
	 * @returns {THREE.Camera|null}
	 */
	getCamera(id) {
		const cameraData = this.cameras.get(id);
		return cameraData ? cameraData.camera : null;
	}

	/**
	 * Get the currently active camera
	 * @returns {THREE.Camera|null}
	 */
	getActiveCamera() {
		return this.activeCameraId ? this.getCamera(this.activeCameraId) : null;
	}

	/**
	 * Set the active camera
	 * @param {string} id - Camera identifier
	 */
	setActiveCamera(id) {
		if (!this.cameras.has(id)) {
			throw new Error(`Camera with id "${id}" does not exist`);
		}
		this.activeCameraId = id;
	}

	/**
	 * Update camera aspect ratio (for perspective cameras)
	 * @param {string} id - Camera identifier
	 * @param {number} aspect - Aspect ratio
	 */
	updateAspectRatio(id, aspect) {
		const cameraData = this.cameras.get(id);
		if (!cameraData) return;

		const camera = cameraData.camera;
		if (camera.isPerspectiveCamera) {
			camera.aspect = aspect;
			camera.updateProjectionMatrix();
		}
	}

	/**
	 * Update orthographic camera bounds
	 * @param {string} id - Camera identifier
	 * @param {Object} bounds - Bounds { left, right, top, bottom }
	 */
	updateOrthographicBounds(id, bounds) {
		const cameraData = this.cameras.get(id);
		if (!cameraData) return;

		const camera = cameraData.camera;
		if (camera.isOrthographicCamera) {
			Object.assign(camera, bounds);
			camera.updateProjectionMatrix();
		}
	}

	/**
	 * Animate camera to a new position
	 * @param {string} id - Camera identifier
	 * @param {Object} target - Target position and lookAt
	 * @param {number} duration - Animation duration in milliseconds
	 * @returns {Promise<void>}
	 */
	async animateTo(id, target, duration = 1000) {
		const camera = this.getCamera(id);
		if (!camera) throw new Error(`Camera with id "${id}" does not exist`);

		const startPosition = camera.position.clone();
		const startTarget = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);

		const endPosition = new THREE.Vector3(...(target.position || [0, 0, 100]));
		const endTarget = new THREE.Vector3(...(target.target || [0, 0, 0]));

		const startTime = Date.now();

		return new Promise((resolve) => {
			const animate = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);

				// Easing function (ease-in-out cubic)
				const eased = progress < 0.5
					? 4 * progress * progress * progress
					: 1 - Math.pow(-2 * progress + 2, 3) / 2;

				// Interpolate position
				camera.position.lerpVectors(startPosition, endPosition, eased);

				// Interpolate target and look at it
				const currentTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, eased);
				camera.lookAt(currentTarget);

				if (progress < 1) {
					requestAnimationFrame(animate);
				} else {
					resolve();
				}
			};

			animate();
		});
	}

	/**
	 * Reset camera to initial configuration
	 * @param {string} id - Camera identifier
	 * @param {number} duration - Animation duration
	 */
	async resetCamera(id, duration = 1000) {
		const cameraData = this.cameras.get(id);
		if (!cameraData) return;

		const config = cameraData.config;
		await this.animateTo(id, {
			position: config.position,
			target: config.target,
		}, duration);
	}

	/**
	 * Remove a camera
	 * @param {string} id - Camera identifier
	 */
	removeCamera(id) {
		this.disposeCamera(id);

		this.cameras.delete(id);

		// Update active camera if needed
		if (this.activeCameraId === id) {
			const remainingCameras = Array.from(this.cameras.keys());
			this.activeCameraId = remainingCameras.length > 0 ? remainingCameras[0] : null;
		}
	}

	/**
	 * Dispose camera resources
	 * @param {string} id - Camera identifier
	 */
	disposeCamera(id) {
		const cameraData = this.cameras.get(id);
		if (!cameraData) return;

		// Cameras don't have much to dispose, but we clean up references
		cameraData.camera = null;
	}

	/**
	 * Get all camera IDs
	 * @returns {string[]}
	 */
	getCameraIds() {
		return Array.from(this.cameras.keys());
	}

	/**
	 * Dispose all cameras
	 */
	dispose() {
		this.getCameraIds().forEach((id) => this.removeCamera(id));
		this.activeCameraId = null;
	}
}

/**
 * Create a camera from configuration object
 * @param {Object} config - Camera configuration
 * @returns {THREE.Camera}
 */
export function createCameraFromConfig(config = {}) {
	const type = config.type || CameraType.PERSPECTIVE;
	let camera;

	if (type === CameraType.PERSPECTIVE) {
		camera = new THREE.PerspectiveCamera(
			config.fov || 75,
			config.aspect || window.innerWidth / window.innerHeight,
			config.near || 0.1,
			config.far || 1000
		);
	} else {
		camera = new THREE.OrthographicCamera(
			config.left || -50,
			config.right || 50,
			config.top || 50,
			config.bottom || -50,
			config.near || 0.1,
			config.far || 1000
		);
	}

	// Set position
	if (config.position) {
		camera.position.set(...config.position);
	}

	// Set up vector
	if (config.up) {
		camera.up.set(...config.up);
	}

	// Look at target
	if (config.target) {
		camera.lookAt(...config.target);
	}

	return camera;
}

export default CameraManager;
