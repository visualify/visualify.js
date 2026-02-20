/**
 * ThreeScene.js - React component for Three.js integration
 * Uses @react-three/fiber for React integration
 */

import React, {
	useRef,
	useMemo,
	useEffect,
	useState,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, TrackballControls, FlyControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Default camera configuration
 */
const DEFAULT_CAMERA = {
	position: [0, 0, 100],
	fov: 75,
	near: 0.1,
	far: 1000,
};

/**
 * Default lighting configuration
 */
const DEFAULT_LIGHTS = [
	{ type: 'ambient', color: '#ffffff', intensity: 0.5 },
	{ type: 'directional', position: [10, 10, 10], intensity: 1 },
];

/**
 * Light component that creates different light types
 */
function Light({ config }) {
	const lightRef = useRef();

	const light = useMemo(() => {
		switch (config.type) {
			case 'ambient':
				return new THREE.AmbientLight(config.color, config.intensity)
			case 'directional':
				const dirLight = new THREE.DirectionalLight(config.color, config.intensity)
				dirLight.position.set(...(config.position || [10, 10, 10]))
				dirLight.castShadow = config.castShadow || false
				return dirLight
			case 'point':
				const pointLight = new THREE.PointLight(
					config.color,
					config.intensity,
					config.distance || 0,
					config.decay || 2
				)
				pointLight.position.set(...(config.position || [0, 0, 0]))
				pointLight.castShadow = config.castShadow || false
				return pointLight
			case 'spot':
				const spotLight = new THREE.SpotLight(
					config.color,
					config.intensity,
					config.distance || 0,
					config.angle || Math.PI / 6,
					config.penumbra || 0,
					config.decay || 2
				)
				spotLight.position.set(...(config.position || [0, 10, 0]))
				spotLight.castShadow = config.castShadow || false
				return spotLight
			case 'hemisphere':
				const hemiLight = new THREE.HemisphereLight(
					config.skyColor || '#ffffff',
					config.groundColor || '#444444',
					config.intensity || 1
				)
				hemiLight.position.set(...(config.position || [0, 10, 0]))
				return hemiLight
			default:
				return new THREE.AmbientLight('#ffffff', 0.5)
		}
	}, [config])

	useEffect(() => {
		if (lightRef.current) {
			// Update light properties if config changes
			if (config.intensity !== undefined) {
				lightRef.current.intensity = config.intensity
			}
			if (config.color !== undefined) {
				lightRef.current.color.set(config.color)
			}
		}
	}, [config.intensity, config.color])

	return <primitive ref={lightRef} object={light} />
}

/**
 * Mesh component that creates different geometry types
 */
function MeshObject({ config }) {
	const meshRef = useRef()

	const geometry = useMemo(() => {
		if (!config.geometry) return new THREE.BoxGeometry(1, 1, 1)

		const geo = config.geometry
		switch (geo.type) {
			case 'box':
				return new THREE.BoxGeometry(
					geo.width || 1,
					geo.height || 1,
					geo.depth || 1
				)
			case 'sphere':
				return new THREE.SphereGeometry(
					geo.radius || 1,
					geo.widthSegments || 32,
					geo.heightSegments || 16
				)
			case 'cylinder':
				return new THREE.CylinderGeometry(
					geo.radiusTop || 1,
					geo.radiusBottom || 1,
					geo.height || 1,
					geo.radialSegments || 32
				)
			case 'plane':
				return new THREE.PlaneGeometry(
					geo.width || 1,
					geo.height || 1
				)
			case 'torus':
				return new THREE.TorusGeometry(
					geo.radius || 1,
					geo.tube || 0.4,
					geo.radialSegments || 16,
					geo.tubularSegments || 100
				)
			case 'cone':
				return new THREE.ConeGeometry(
					geo.radius || 1,
					geo.height || 1,
					geo.radialSegments || 32
				)
			default:
				return new THREE.BoxGeometry(1, 1, 1)
		}
	}, [config.geometry])

	const material = useMemo(() => {
		if (!config.material) return new THREE.MeshStandardMaterial({ color: '#888888' })

		const mat = config.material
		switch (mat.type) {
			case 'basic':
				return new THREE.MeshBasicMaterial({
					color: mat.color || '#888888',
					transparent: mat.transparent || false,
					opacity: mat.opacity !== undefined ? mat.opacity : 1,
					wireframe: mat.wireframe || false,
				})
			case 'standard':
				return new THREE.MeshStandardMaterial({
					color: mat.color || '#888888',
					roughness: mat.roughness !== undefined ? mat.roughness : 0.5,
					metalness: mat.metalness !== undefined ? mat.metalness : 0.5,
					transparent: mat.transparent || false,
					opacity: mat.opacity !== undefined ? mat.opacity : 1,
					wireframe: mat.wireframe || false,
				})
			case 'phong':
				return new THREE.MeshPhongMaterial({
					color: mat.color || '#888888',
					shininess: mat.shininess || 30,
					transparent: mat.transparent || false,
					opacity: mat.opacity !== undefined ? mat.opacity : 1,
				})
			case 'lambert':
				return new THREE.MeshLambertMaterial({
					color: mat.color || '#888888',
					transparent: mat.transparent || false,
					opacity: mat.opacity !== undefined ? mat.opacity : 1,
				})
			default:
				return new THREE.MeshStandardMaterial({ color: mat.color || '#888888' })
		}
	}, [config.material])

	// Handle animation
	useFrame((state) => {
		if (config.animation && meshRef.current) {
			const { rotation, position } = config.animation
			if (rotation) {
				if (rotation[0]) meshRef.current.rotation.x += rotation[0]
				if (rotation[1]) meshRef.current.rotation.y += rotation[1]
				if (rotation[2]) meshRef.current.rotation.z += rotation[2]
			}
			if (position) {
				if (position.speed) {
					meshRef.current.position.y = Math.sin(state.clock.elapsedTime * position.speed) * (position.amplitude || 1)
				}
			}
		}
	})

	// Cleanup
	useEffect(() => {
		return () => {
			geometry.dispose()
			material.dispose()
		}
	}, [geometry, material])

	return (
		<mesh
			ref={meshRef}
			geometry={geometry}
			material={material}
			position={config.position || [0, 0, 0]}
			rotation={config.rotation || [0, 0, 0]}
			scale={config.scale || [1, 1, 1]}
			castShadow={config.castShadow !== false}
			receiveShadow={config.receiveShadow !== false}
		/>
	)
}

/**
 * Controls component for camera manipulation
 */
function Controls({ type, config = {} }) {
	const { camera, gl } = useThree()

	const controlsProps = useMemo(() => ({
		enableDamping: config.enableDamping !== false,
		dampingFactor: config.dampingFactor || 0.05,
		enableZoom: config.enableZoom !== false,
		enablePan: config.enablePan !== false,
		enableRotate: config.enableRotate !== false,
		autoRotate: config.autoRotate || false,
		autoRotateSpeed: config.autoRotateSpeed || 1,
		minDistance: config.minDistance || 0,
		maxDistance: config.maxDistance || Infinity,
		...config,
	}), [config])

	switch (type) {
		case 'orbit':
			return <OrbitControls {...controlsProps} args={[camera, gl.domElement]} />
		case 'trackball':
			return <TrackballControls {...controlsProps} args={[camera, gl.domElement]} />
		case 'fly':
			return <FlyControls {...controlsProps} args={[camera, gl.domElement]} />
		default:
			return <OrbitControls {...controlsProps} args={[camera, gl.domElement]} />
	}
}

/**
 * Animation handler for auto-rotation
 */
function AnimationHandler({ config }) {
	useFrame((state, delta) => {
		if (config?.autoRotate) {
			// Auto-rotation is handled by controls, but we can add custom animations here
		}
	})
	return null
}

/**
 * Scene content component
 */
function SceneContent({ sceneConfig, controls, animation }) {
	const { scene } = useThree()

	// Set scene background
	useEffect(() => {
		if (sceneConfig?.backgroundColor) {
			scene.background = new THREE.Color(sceneConfig.backgroundColor)
		}
		if (sceneConfig?.fog) {
			scene.fog = new THREE.Fog(
				sceneConfig.fog.color || 0x000000,
				sceneConfig.fog.near || 1,
				sceneConfig.fog.far || 1000
			)
		}
	}, [scene, sceneConfig])

	// Memoize lights to prevent unnecessary re-renders
	const lights = useMemo(() => {
		return (sceneConfig?.lights || DEFAULT_LIGHTS).map((light, index) => (
			<Light key={`light-${index}`} config={light} />
		))
	}, [sceneConfig?.lights])

	// Memoize objects to prevent unnecessary re-renders
	const objects = useMemo(() => {
		if (!sceneConfig?.objects) return null
		return sceneConfig.objects.map((obj, index) => {
			if (obj.type === 'mesh') {
				return <MeshObject key={`mesh-${index}`} config={obj} />
			}
			return null
		})
	}, [sceneConfig?.objects])

	return (
		<>
			{lights}
			{objects}
			<Controls type={controls} config={animation} />
			<AnimationHandler config={animation} />
		</>
	)
}

/**
 * Error boundary for WebGL failures
 */
class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error }
	}

	componentDidCatch(error, errorInfo) {
		console.error('ThreeScene error:', error, errorInfo)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
					<h3>WebGL Error</h3>
					<p>Failed to initialize 3D scene. Please check your browser supports WebGL.</p>
					<p style={{ fontSize: '12px', color: '#666' }}>{this.state.error?.message}</p>
				</div>
			)
		}
		return this.props.children
	}
}

/**
 * Main ThreeScene component
 */
const ThreeScene = forwardRef(({ props, style }, ref) => {
	const { config } = props || {}
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const canvasRef = useRef()

	// Extract configuration
	const sceneConfig = config?.scene || {}
	const cameraConfig = sceneConfig?.camera || DEFAULT_CAMERA
	const controls = config?.controls || 'orbit'
	const animation = config?.animation || {}

	// Memoize camera settings
	const cameraSettings = useMemo(() => ({
		position: cameraConfig.position || DEFAULT_CAMERA.position,
		fov: cameraConfig.fov || DEFAULT_CAMERA.fov,
		near: cameraConfig.near || DEFAULT_CAMERA.near,
		far: cameraConfig.far || DEFAULT_CAMERA.far,
	}), [cameraConfig])

	// Memoize canvas props
	const canvasProps = useMemo(() => ({
		gl: {
			antialias: true,
			alpha: true,
			powerPreference: 'high-performance',
		},
		camera: cameraSettings,
		onCreated: () => setIsLoading(false),
		onError: (err) => {
			console.error('Canvas error:', err)
			setError(err)
			setIsLoading(false)
		},
	}), [cameraSettings])

	// Expose imperative handle
	useImperativeHandle(ref, () => ({
		getCanvas: () => canvasRef.current,
		getScene: () => canvasRef.current?.scene,
		getCamera: () => canvasRef.current?.camera,
		getRenderer: () => canvasRef.current?.gl,
		screenshot: (mimeType = 'image/png') => {
			const renderer = canvasRef.current?.gl
			if (renderer) {
				return renderer.domElement.toDataURL(mimeType)
			}
			return null
		},
	}), [])

	if (error) {
		return (
			<div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ color: 'red', textAlign: 'center' }}>
					<p>Failed to load 3D scene</p>
					<p style={{ fontSize: '12px' }}>{error.message}</p>
				</div>
			</div>
		)
	}

	return (
		<div id={props?.id} style={{ ...style, position: 'relative' }}>
			{isLoading && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: '#f5f5f5',
						zIndex: 1,
					}}
				>
					Loading 3D Scene...
				</div>
			)}
			<ErrorBoundary>
				<Canvas
					ref={canvasRef}
					{...canvasProps}
					style={{ width: '100%', height: '100%' }}
				>
					<SceneContent
						sceneConfig={sceneConfig}
						controls={controls}
						animation={animation}
					/>
				</Canvas>
			</ErrorBoundary>
		</div>
	)
})

ThreeScene.displayName = 'ThreeScene'

export default ThreeScene
