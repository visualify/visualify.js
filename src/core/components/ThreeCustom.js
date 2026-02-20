/**
 * ThreeCustom.js - Custom geometry support for Three.js in Visualify.js
 * Supports loading custom geometries (OBJ, GLTF, etc.) with material configuration and animation
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
import {
	OrbitControls,
	TrackballControls,
	FlyControls,
	useGLTF,
	Center,
	Bounds,
} from '@react-three/drei';
import * as THREE from 'three';

// Import OBJLoader - using .js extension for proper module resolution
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

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
		console.error('ThreeCustom error:', error, errorInfo)
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
 * Loading fallback component
 */
function LoadingFallback() {
	return (
		<mesh>
			<boxGeometry args={[1, 1, 1]} />
			<meshBasicMaterial color="#cccccc" wireframe />
		</mesh>
	)
}

/**
 * Light component
 */
function Light({ config }) {
	const lightRef = useRef()

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

	return <primitive ref={lightRef} object={light} />
}

/**
 * Controls component
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
 * Material component that creates materials from config
 */
function createMaterial(materialConfig) {
	if (!materialConfig) return new THREE.MeshStandardMaterial({ color: '#888888' })

	const mat = materialConfig
	switch (mat.type) {
		case 'basic':
			return new THREE.MeshBasicMaterial({
				color: mat.color || '#888888',
				transparent: mat.transparent || false,
				opacity: mat.opacity !== undefined ? mat.opacity : 1,
				wireframe: mat.wireframe || false,
			})
		case 'standard':
			const standardMat = new THREE.MeshStandardMaterial({
				color: mat.color || '#888888',
				roughness: mat.roughness !== undefined ? mat.roughness : 0.5,
				metalness: mat.metalness !== undefined ? mat.metalness : 0.5,
				transparent: mat.transparent || false,
				opacity: mat.opacity !== undefined ? mat.opacity : 1,
				wireframe: mat.wireframe || false,
			})
			if (mat.map) {
				// Texture loading would be handled here
			}
			return standardMat
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
		case 'physical':
			return new THREE.MeshPhysicalMaterial({
				color: mat.color || '#888888',
				roughness: mat.roughness !== undefined ? mat.roughness : 0.5,
				metalness: mat.metalness !== undefined ? mat.metalness : 0.5,
				clearcoat: mat.clearcoat || 0,
				clearcoatRoughness: mat.clearcoatRoughness || 0,
				transparent: mat.transparent || false,
				opacity: mat.opacity !== undefined ? mat.opacity : 1,
			})
		default:
			return new THREE.MeshStandardMaterial({ color: mat.color || '#888888' })
	}
}

/**
 * GLTF Model component
 */
function GLTFModel({ url, config, onLoad, onError }) {
	const groupRef = useRef()
	const [modelError, setModelError] = useState(null)

	const gltf = useGLTF(url, true)

	useEffect(() => {
		if (!gltf) {
			const err = new Error('Failed to load GLTF model')
			setModelError(err)
			if (onError) onError(err)
		}
	}, [gltf, onError])

	useEffect(() => {
		if (gltf && onLoad) {
			onLoad(gltf)
		}
	}, [gltf, onLoad])

	// Apply animations
	useFrame((state) => {
		if (!groupRef.current || !config?.animation) return

		const anim = config.animation
		if (anim.autoRotate) {
			const speed = anim.speed || 0.01
			groupRef.current.rotation.y += speed
		}
		if (anim.rotation) {
			groupRef.current.rotation.x += anim.rotation[0] || 0
			groupRef.current.rotation.y += anim.rotation[1] || 0
			groupRef.current.rotation.z += anim.rotation[2] || 0
		}
	})

	// Apply material override
	useEffect(() => {
		if (!groupRef.current || !config?.material) return

		const material = createMaterial(config.material)
		groupRef.current.traverse((child) => {
			if (child.isMesh) {
				child.material = material
			}
		})

		return () => {
			material.dispose()
		}
	}, [config?.material])

	if (modelError) {
		return (
			<mesh>
				<boxGeometry args={[1, 1, 1]} />
				<meshBasicMaterial color="#ff0000" wireframe />
			</mesh>
		)
	}

	if (!gltf) {
		return <LoadingFallback />
	}

	return (
		<group
			ref={groupRef}
			position={config?.position || [0, 0, 0]}
			rotation={config?.rotation || [0, 0, 0]}
			scale={config?.scale || [1, 1, 1]}
		>
			<primitive object={gltf.scene} />
		</group>
	)
}

/**
 * OBJ Model component
 */
function OBJModel({ url, config, onLoad, onError }) {
	const groupRef = useRef()
	const [model, setModel] = useState(null)
	const [modelError, setModelError] = useState(null)

	useEffect(() => {
		const loader = new OBJLoader()
		loader.load(
			url,
			(loadedModel) => {
				setModel(loadedModel)
				if (onLoad) onLoad(loadedModel)
			},
			undefined,
			(err) => {
				console.error('Error loading OBJ:', err)
				setModelError(err)
				if (onError) onError(err)
			}
		)
	}, [url, onLoad, onError])

	// Apply animations
	useFrame(() => {
		if (!groupRef.current || !config?.animation) return

		const anim = config.animation
		if (anim.autoRotate) {
			const speed = anim.speed || 0.01
			groupRef.current.rotation.y += speed
		}
		if (anim.rotation) {
			groupRef.current.rotation.x += anim.rotation[0] || 0
			groupRef.current.rotation.y += anim.rotation[1] || 0
			groupRef.current.rotation.z += anim.rotation[2] || 0
		}
	})

	// Apply material override
	useEffect(() => {
		if (!groupRef.current || !config?.material) return

		const material = createMaterial(config.material)
		groupRef.current.traverse((child) => {
			if (child.isMesh) {
				child.material = material
			}
		})

		return () => {
			material.dispose()
		}
	}, [config?.material])

	if (modelError) {
		return (
			<mesh>
				<boxGeometry args={[1, 1, 1]} />
				<meshBasicMaterial color="#ff0000" wireframe />
			</mesh>
		)
	}

	if (!model) {
		return <LoadingFallback />
	}

	return (
		<group
			ref={groupRef}
			position={config?.position || [0, 0, 0]}
			rotation={config?.rotation || [0, 0, 0]}
			scale={config?.scale || [1, 1, 1]}
		>
			<primitive object={model} />
		</group>
	)
}

/**
 * Custom geometry from config
 */
function CustomGeometry({ config }) {
	const meshRef = useRef()

	const geometry = useMemo(() => {
		if (!config?.geometry) return new THREE.BoxGeometry(1, 1, 1)

		const geo = config.geometry
		switch (geo.type) {
			case 'box':
				return new THREE.BoxGeometry(geo.width || 1, geo.height || 1, geo.depth || 1)
			case 'sphere':
				return new THREE.SphereGeometry(geo.radius || 1, geo.widthSegments || 32, geo.heightSegments || 16)
			case 'cylinder':
				return new THREE.CylinderGeometry(geo.radiusTop || 1, geo.radiusBottom || 1, geo.height || 1, geo.radialSegments || 32)
			case 'plane':
				return new THREE.PlaneGeometry(geo.width || 1, geo.height || 1)
			case 'torus':
				return new THREE.TorusGeometry(geo.radius || 1, geo.tube || 0.4, geo.radialSegments || 16, geo.tubularSegments || 100)
			case 'cone':
				return new THREE.ConeGeometry(geo.radius || 1, geo.height || 1, geo.radialSegments || 32)
			case 'buffer':
				// Custom buffer geometry from vertices
				if (geo.vertices) {
					const bufferGeo = new THREE.BufferGeometry()
					bufferGeo.setAttribute('position', new THREE.Float32BufferAttribute(geo.vertices, 3))
					if (geo.normals) {
						bufferGeo.setAttribute('normal', new THREE.Float32BufferAttribute(geo.normals, 3))
					}
					if (geo.uvs) {
						bufferGeo.setAttribute('uv', new THREE.Float32BufferAttribute(geo.uvs, 2))
					}
					if (geo.indices) {
						bufferGeo.setIndex(geo.indices)
					}
					return bufferGeo
				}
				return new THREE.BoxGeometry(1, 1, 1)
			default:
				return new THREE.BoxGeometry(1, 1, 1)
		}
	}, [config?.geometry])

	const material = useMemo(() => createMaterial(config?.material), [config?.material])

	// Animation
	useFrame(() => {
		if (!meshRef.current || !config?.animation) return

		const anim = config.animation
		if (anim.autoRotate) {
			const speed = anim.speed || 0.01
			meshRef.current.rotation.y += speed
		}
		if (anim.rotation) {
			meshRef.current.rotation.x += anim.rotation[0] || 0
			meshRef.current.rotation.y += anim.rotation[1] || 0
			meshRef.current.rotation.z += anim.rotation[2] || 0
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
			position={config?.position || [0, 0, 0]}
			rotation={config?.rotation || [0, 0, 0]}
			scale={config?.scale || [1, 1, 1]}
			castShadow={config?.castShadow !== false}
			receiveShadow={config?.receiveShadow !== false}
		/>
	)
}

/**
 * Model loader that handles different formats
 */
function ModelLoader({ config, onLoad, onError }) {
	const format = config?.format || 'geometry'

	switch (format) {
		case 'gltf':
		case 'glb':
			return <GLTFModel url={config.url} config={config} onLoad={onLoad} onError={onError} />
		case 'obj':
			return <OBJModel url={config.url} config={config} onLoad={onLoad} onError={onError} />
		case 'geometry':
		default:
			return <CustomGeometry config={config} />
	}
}

/**
 * Scene content component
 */
function SceneContent({ sceneConfig, controls, animation, onModelLoad, onModelError }) {
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

	// Memoize lights
	const lights = useMemo(() => {
		return (sceneConfig?.lights || [
			{ type: 'ambient', color: '#ffffff', intensity: 0.5 },
			{ type: 'directional', position: [10, 10, 10], intensity: 1 },
		]).map((light, index) => <Light key={`light-${index}`} config={light} />)
	}, [sceneConfig?.lights])

	return (
		<>
			{lights}
			<Bounds fit clip observe margin={1.2}>
				<Center>
					<ModelLoader
						config={sceneConfig?.model}
						onLoad={onModelLoad}
						onError={onModelError}
					/>
				</Center>
			</Bounds>
			<Controls type={controls} config={animation} />
		</>
	)
}

/**
 * Main ThreeCustom component
 */
const ThreeCustom = forwardRef(({ props, style }, ref) => {
	const { config } = props || {}
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)
	const canvasRef = useRef()

	// Extract configuration
	const sceneConfig = config?.scene || {}
	const cameraConfig = sceneConfig?.camera || {
		position: [0, 0, 100],
		fov: 75,
		near: 0.1,
		far: 1000,
	}
	const controls = config?.controls || 'orbit'
	const animation = config?.animation || {}

	// Memoize camera settings
	const cameraSettings = useMemo(
		() => ({
			position: cameraConfig.position || [0, 0, 100],
			fov: cameraConfig.fov || 75,
			near: cameraConfig.near || 0.1,
			far: cameraConfig.far || 1000,
		}),
		[cameraConfig]
	)

	// Handle model load
	const handleModelLoad = useCallback(() => {
		setIsLoading(false)
	}, [])

	// Handle model error
	const handleModelError = useCallback((err) => {
		console.error('Model loading error:', err)
		setError(err)
		setIsLoading(false)
	}, [])

	// Expose imperative handle
	useImperativeHandle(
		ref,
		() => ({
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
		}),
		[]
	)

	if (error) {
		return (
			<div
				style={{
					...style,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div style={{ color: 'red', textAlign: 'center' }}>
					<p>Failed to load 3D model</p>
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
					Loading 3D Model...
				</div>
			)}
			<ErrorBoundary>
				<Canvas
					ref={canvasRef}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
					}}
					camera={cameraSettings}
					style={{ width: '100%', height: '100%' }}
				>
					<SceneContent
						sceneConfig={sceneConfig}
						controls={controls}
						animation={animation}
						onModelLoad={handleModelLoad}
						onModelError={handleModelError}
					/>
				</Canvas>
			</ErrorBoundary>
		</div>
	)
})

ThreeCustom.displayName = 'ThreeCustom'

export default ThreeCustom
