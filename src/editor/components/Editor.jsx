
/**
 * @fileoverview Main Editor UI Component
 * @module editor/components/Editor
 *
 * Provides the main layout with toolbar, sidebar, canvas, and property panel.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
	Navbar,
	Container,
	Button,
	ButtonGroup,
	Modal,
	Form,
} from 'react-bootstrap';
import {
	Plus,
	FolderOpen,
	Download,
	Undo,
	Redo,
	Trash2,
	Eye,
	Code,
} from 'react-bootstrap-icons';
import { useEditor } from '../context/EditorContext';
import ChartBuilder from './ChartBuilder';
import PropertyPanel from './PropertyPanel';
import Preview from './Preview';
import ChartTypeSidebar from './ChartTypeSidebar';
import StatusBar from './StatusBar';

/**
 * Main Editor Component
 */
function Editor() {
	const {
		state,
		setConfig,
		undo,
		redo,
		canUndo,
		canRedo,
		selectedChart,
		setSelectedChart,
		clearAll,
	} = useEditor();

	const [showPreview, setShowPreview] = useState(false);
	const [showJsonModal, setShowJsonModal] = useState(false);
	const [jsonContent, setJsonContent] = useState('');
	const [importError, setImportError] = useState(null);
	const [lastSaved, setLastSaved] = useState(null);

	const { config } = state;

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			// Ctrl/Cmd + Z - Undo
			if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				if (canUndo) undo();
			}

			// Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
			if (
				(e.ctrlKey || e.metaKey) &&
				(e.key === 'y' || (e.key === 'z' && e.shiftKey))
			) {
				e.preventDefault();
				if (canRedo) redo();
			}

			// Ctrl/Cmd + S - Save/Export
			if ((e.ctrlKey || e.metaKey) && e.key === 's') {
				e.preventDefault();
				handleExport();
			}

			// Escape - Close modals
			if (e.key === 'Escape') {
				setShowPreview(false);
				setShowJsonModal(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [canUndo, canRedo, undo, redo]);

	// Handle file import
	const handleImport = useCallback(() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e) => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (event) => {
					try {
						const imported = JSON.parse(event.target.result);
						setConfig(imported);
						setLastSaved(new Date());
					} catch (error) {
						alert(`Import failed: ${error.message}`);
					}
				};
				reader.readAsText(file);
			}
		};
		input.click();
	}, [setConfig]);

	// Handle export
	const handleExport = useCallback(() => {
		try {
			const exportData = {
				...config,
				charts: config.charts.map((chart) => {
					const { id, ...rest } = chart;
					return rest;
				}),
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

			setLastSaved(new Date());
		} catch (error) {
			alert(`Export failed: ${error.message}`);
		}
	}, [config]);

	// Handle show JSON
	const handleShowJson = useCallback(() => {
		const exportData = {
			...config,
			charts: config.charts.map((chart) => {
				const { id, ...rest } = chart;
				return rest;
			}),
		};
		setJsonContent(JSON.stringify(exportData, null, 2));
		setShowJsonModal(true);
	}, [config]);

	// Handle JSON import from modal
	const handleJsonImport = useCallback(() => {
		try {
			const imported = JSON.parse(jsonContent);
			setConfig(imported);
			setImportError(null);
			setShowJsonModal(false);
			setLastSaved(new Date());
		} catch (error) {
			setImportError(error.message);
		}
	}, [jsonContent, setConfig]);

	// Handle new config
	const handleNew = useCallback(() => {
		if (
			config.charts.length > 0 &&
			!window.confirm(
				'Are you sure you want to create a new configuration? Unsaved changes will be lost.',
			)
		) {
			return;
		}
		setConfig({
			version: '3.0.0',
			charts: [],
			layout: { type: 'grid', rows: 1, cols: 1, gap: '10px' },
			theme: 'modern',
		});
		setSelectedChart(null);
	}, [config.charts.length, setConfig, setSelectedChart]);

	return (
		<div className='visualify-editor'>
			{/* Toolbar */}
			<Navbar className='editor-toolbar' bg='light' expand='lg'>
				<Container fluid>
					<Navbar.Brand className='editor-toolbar-title'>
						Visualify Editor
					</Navbar.Brand>

					<div className='d-flex align-items-center gap-2'>
						<ButtonGroup>
							<Button
								variant='outline-primary'
								size='sm'
								onClick={handleNew}
								title='New Configuration (Ctrl+N)'>
								<Plus className='me-1' />
								New
							</Button>
							<Button
								variant='outline-secondary'
								size='sm'
								onClick={handleImport}
								title='Import JSON (Ctrl+O)'>
								<FolderOpen className='me-1' />
								Open
							</Button>
							<Button
								variant='outline-success'
								size='sm'
								onClick={handleExport}
								title='Export JSON (Ctrl+S)'>
								<Download className='me-1' />
								Export
							</Button>
						</ButtonGroup>

						<div className='vr mx-2' />

						<ButtonGroup>
							<Button
								variant='outline-secondary'
								size='sm'
								onClick={undo}
								disabled={!canUndo}
								title='Undo (Ctrl+Z)'>
								<Undo />
							</Button>
							<Button
								variant='outline-secondary'
								size='sm'
								onClick={redo}
								disabled={!canRedo}
								title='Redo (Ctrl+Y)'>
								<Redo />
							</Button>
						</ButtonGroup>

						<div className='vr mx-2' />

						<ButtonGroup>
							<Button
								variant='outline-info'
								size='sm'
								onClick={() => setShowPreview(true)}
								title='Preview'>
								<Eye className='me-1' />
								Preview
							</Button>
							<Button
								variant='outline-dark'
								size='sm'
								onClick={handleShowJson}
								title='View/Edit JSON'>
								<Code className='me-1' />
								JSON
							</Button>
						</ButtonGroup>

						<div className='vr mx-2' />

						<Button
							variant='outline-danger'
							size='sm'
							onClick={clearAll}
							disabled={config.charts.length === 0}
							title='Clear All'>
							<Trash2 />
						</Button>
					</div>
				</Container>
			</Navbar>

			{/* Main Content */}
			<div className='editor-main'>
				{/* Sidebar - Chart Types */}
				<ChartTypeSidebar />

				{/* Canvas */}
				<ChartBuilder />

				{/* Property Panel */}
				<PropertyPanel />
			</div>

			{/* Status Bar */}
			<StatusBar
				chartCount={config.charts.length}
				lastSaved={lastSaved}
				selectedChart={selectedChart}
			/>

			{/* Preview Modal */}
			<Modal
				show={showPreview}
				onHide={() => setShowPreview(false)}
				size='xl'
				fullscreen='lg-down'
				className='editor-modal'>
				<Modal.Header closeButton>
					<Modal.Title>Preview</Modal.Title>
				</Modal.Header>
				<Modal.Body className='p-0'>
					<Preview config={config} fullscreen />
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowPreview(false)}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			{/* JSON Modal */}
			<Modal
				show={showJsonModal}
				onHide={() => setShowJsonModal(false)}
				size='lg'
				className='editor-modal'>
				<Modal.Header closeButton>
					<Modal.Title>Configuration JSON</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{importError && (
						<div className='alert alert-danger'>{importError}</div>
					)}
					<Form.Group>
						<Form.Control
							as='textarea'
							value={jsonContent}
							onChange={(e) => setJsonContent(e.target.value)}
							style={{
								fontFamily: 'monospace',
								minHeight: '400px',
								fontSize: '0.875rem',
							}}
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowJsonModal(false)}>
						Cancel
					</Button>
					<Button variant='primary' onClick={handleJsonImport}>
						Import JSON
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}

export default Editor;
