/**
 * @fileoverview Visualify Visual Editor - Main Entry Point
 * @module editor/index
 *
 * Visual configuration editor for creating and editing Visualify configurations
 * without writing JSON. Provides a drag-and-drop interface for building charts.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Container, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import Editor from './components/Editor';
import { EditorProvider } from './context/EditorContext';
import './styles/editor.css';

/**
 * Default empty configuration
 * @readonly
 */
const DEFAULT_CONFIG = {
	version: '3.0.0',
	charts: [],
	layout: {
		type: 'grid',
		rows: 1,
		cols: 1,
		gap: '10px',
	},
	theme: 'modern',
};

/**
 * Load configuration from file or localStorage
 * @param {string|null} filePath - Path to config file
 * @returns {Object} Loaded configuration
 */
function loadConfiguration(filePath) {
	// Try to load from localStorage first (auto-save)
	const savedConfig = localStorage.getItem('visualify_editor_autosave');
	if (savedConfig) {
		try {
			return JSON.parse(savedConfig);
		} catch (e) {
			console.warn('Failed to parse auto-saved config:', e);
		}
	}

	// Return default config
	return { ...DEFAULT_CONFIG };
}

/**
 * Main Editor Application Component
 */
function EditorApp({ initialConfig = null, filePath = null }) {
	const [config, setConfig] = useState(() =>
		initialConfig || loadConfiguration(filePath),
	);
	const [toasts, setToasts] = useState([]);
	const [isReady, setIsReady] = useState(false);
	const autoSaveTimeoutRef = useRef(null);

	// Show toast notification
	const showToast = useCallback((message, type = 'info') => {
		const id = Date.now();
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 3000);
	}, []);

	// Auto-save to localStorage with debounce
	useEffect(() => {
		if (autoSaveTimeoutRef.current) {
			clearTimeout(autoSaveTimeoutRef.current);
		}

		autoSaveTimeoutRef.current = setTimeout(() => {
			try {
				localStorage.setItem(
					'visualify_editor_autosave',
					JSON.stringify(config),
				);
			} catch (e) {
				console.warn('Auto-save failed:', e);
			}
		}, 1000);

		return () => {
			if (autoSaveTimeoutRef.current) {
				clearTimeout(autoSaveTimeoutRef.current);
			}
		};
	}, [config]);

	// Handle configuration updates
	const updateConfig = useCallback((updates) => {
		setConfig((prev) => ({
			...prev,
			...updates,
		}));
	}, []);

	// Handle chart updates
	const updateChart = useCallback((chartId, updates) => {
		setConfig((prev) => ({
			...prev,
			charts: prev.charts.map((chart) =>
				chart.id === chartId ? { ...chart, ...updates } : chart,
			),
		}));
	}, []);

	// Add new chart
	const addChart = useCallback((chartType) => {
		const newChart = {
			id: `chart_${Date.now()}`,
			type: chartType,
			title: `${chartType} Chart`,
			data: [],
			options: {},
			position: { x: 0, y: 0, w: 1, h: 1 },
		};

		setConfig((prev) => ({
			...prev,
			charts: [...prev.charts, newChart],
		}));

		showToast(`Added ${chartType} chart`, 'success');
		return newChart.id;
	}, [showToast]);

	// Remove chart
	const removeChart = useCallback((chartId) => {
		setConfig((prev) => ({
			...prev,
			charts: prev.charts.filter((c) => c.id !== chartId),
		}));
		showToast('Chart removed', 'info');
	}, [showToast]);

	// Export configuration
	const exportConfig = useCallback(() => {
		try {
			// Validate configuration
			if (config.charts.length === 0) {
				showToast('No charts to export', 'warning');
				return null;
			}

			// Clean up config for export
			const exportData = {
				...config,
				charts: config.charts.map((chart) => ({
					...chart,
					// Remove internal properties
					id: undefined,
				})),
			};

			const json = JSON.stringify(exportData, null, 2);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const link = document.createElement('a');
			link.href = url;
			link.download = 'visualify.json';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			showToast('Configuration exported successfully', 'success');
			return json;
		} catch (error) {
			showToast(`Export failed: ${error.message}`, 'danger');
			return null;
		}
	}, [config, showToast]);

	// Import configuration
	const importConfig = useCallback((jsonString) => {
		try {
			const imported = JSON.parse(jsonString);

			// Validate required fields
			if (!imported.charts || !Array.isArray(imported.charts)) {
				throw new Error('Invalid configuration: missing charts array');
			}

			// Add IDs to charts
			const chartsWithIds = imported.charts.map((chart, index) => ({
				...chart,
				id: chart.id || `chart_${Date.now()}_${index}`,
			}));

			setConfig({
				...DEFAULT_CONFIG,
				...imported,
				charts: chartsWithIds,
			});

			showToast('Configuration imported successfully', 'success');
			return true;
		} catch (error) {
			showToast(`Import failed: ${error.message}`, 'danger');
			return false;
		}
	}, [showToast]);

	// Clear all charts
	const clearAll = useCallback(() => {
		if (window.confirm('Are you sure you want to clear all charts?')) {
			setConfig((prev) => ({
				...prev,
				charts: [],
			}));
			showToast('All charts cleared', 'info');
		}
	}, [showToast]);

	// Initialize
	useEffect(() => {
		setIsReady(true);
	}, []);

	if (!isReady) {
		return (
			<Container className='editor-loading'>
				<div className='text-center py-5'>
					<div className='spinner-border text-primary' role='status'>
						<span className='visually-hidden'>Loading...</span>
					</div>
					<p className='mt-3'>Loading Visualify Editor...</p>
				</div>
			</Container>
		);
	}

	return (
		<EditorProvider initialState={{ config }}>
			<div className='visualify-editor'>
				<Editor />

				{/* Toast Notifications */}
				<ToastContainer
					position='bottom-end'
					className='p-3'>
					{toasts.map((toast) => (
						<Toast
							key={toast.id}
							bg={toast.type}
							onClose={() =>
								setToasts((prev) =>
									prev.filter((t) => t.id !== toast.id),
								)
							}>
							<Toast.Body className='text-white'>
								{toast.message}
							</Toast.Body>
						</Toast>
					))}
				</ToastContainer>
			</div>
		</EditorProvider>
	);
}

/**
 * Mount the editor application
 * @param {HTMLElement|string} element - DOM element or selector
 * @param {Object} options - Editor options
 * @param {Object} options.config - Initial configuration
 * @param {string} options.filePath - Path to config file
 */
function mountEditor(element, options = {}) {
	const el =
		typeof element === 'string' ? document.querySelector(element) : element;

	if (!el) {
		throw new Error(`Element not found: ${element}`);
	}

	const root = createRoot(el);
	root.render(
		<EditorApp
			initialConfig={options.config}
			filePath={options.filePath}
		/>,
	);

	return root;
}

// Export for module usage
export { EditorApp, mountEditor, DEFAULT_CONFIG };
export default mountEditor;

// Auto-mount if DOM is ready and editor container exists
if (typeof window !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			const container = document.getElementById('visualify-editor');
			if (container) {
				mountEditor(container);
			}
		});
	} else {
		const container = document.getElementById('visualify-editor');
		if (container) {
			mountEditor(container);
		}
	}
}
