/**
 * @fileoverview Property Panel Component - Dynamic form for chart configuration
 * @module editor/components/PropertyPanel
 *
 * Provides property editing for selected charts with dynamic forms based on chart type.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
	Sliders,
	Database,
	Palette,
	Code,
	ChevronDown,
	ChevronUp,
} from 'react-bootstrap-icons';
import { Form, Button, Accordion, Row, Col } from 'react-bootstrap';
import { useEditor } from '../context/EditorContext';

/**
 * Debounce hook for delaying updates
 */
function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => clearTimeout(timer);
	}, [value, delay]);

	return debouncedValue;
}

/**
 * Data Editor Component
 */
function DataEditor({ chart, onChange }) {
	const [dataText, setDataText] = useState('');
	const [error, setError] = useState(null);

	useEffect(() => {
		try {
			setDataText(JSON.stringify(chart.data, null, 2));
			setError(null);
		} catch (e) {
			setError('Failed to serialize data');
		}
	}, [chart.data]);

	const handleChange = useCallback((e) => {
		setDataText(e.target.value);
	}, []);

	const handleBlur = useCallback(() => {
		try {
			const parsed = JSON.parse(dataText);
			onChange('data', parsed);
			setError(null);
		} catch (e) {
			setError(`Invalid JSON: ${e.message}`);
		}
	}, [dataText, onChange]);

	return (
		<div className="property-group">
			<div className="property-group-title">
				<Database className="me-1" size={14} />
				Data
			</div>
			<Form.Group>
				<Form.Control
					as="textarea"
					value={dataText}
					onChange={handleChange}
					onBlur={handleBlur}
					className="data-editor-textarea"
					isInvalid={!!error}
					placeholder="Enter JSON data array..."
				/>
				{error && (
					<Form.Control.Feedback type="invalid">
						{error}
					</Form.Control.Feedback>
				)}
				<Form.Text className="text-muted">
					Enter data as JSON array. Changes apply on blur.
				</Form.Text>
			</Form.Group>
		</div>
	);
}

/**
 * Basic Properties Component
 */
function BasicProperties({ chart, onChange }) {
	const [localValues, setLocalValues] = useState({
		title: chart.title || '',
		width: chart.width || '100%',
		height: chart.height || '400px',
	});

	const debouncedValues = useDebounce(localValues, 100);

	useEffect(() => {
		setLocalValues({
			title: chart.title || '',
			width: chart.width || '100%',
			height: chart.height || '400px',
		});
	}, [chart.title, chart.width, chart.height]);

	useEffect(() => {
		Object.entries(debouncedValues).forEach(([key, value]) => {
			if (value !== chart[key]) {
				onChange(key, value);
			}
		});
	}, [debouncedValues, chart, onChange]);

	const handleChange = useCallback((field, value) => {
		setLocalValues((prev) => ({ ...prev, [field]: value }));
	}, []);

	return (
		<div className="property-group">
			<div className="property-group-title">
				<Sliders className="me-1" size={14} />
				Basic Properties
			</div>

			<Form.Group className="property-field">
				<Form.Label>Title</Form.Label>
				<Form.Control
					type="text"
					value={localValues.title}
					onChange={(e) => handleChange('title', e.target.value)}
					placeholder="Chart title"
				/>
			</Form.Group>

			<Row>
				<Col>
					<Form.Group className="property-field">
						<Form.Label>Width</Form.Label>
						<Form.Control
							type="text"
							value={localValues.width}
							onChange={(e) => handleChange('width', e.target.value)}
							placeholder="100%"
						/>
					</Form.Group>
				</Col>
				<Col>
					<Form.Group className="property-field">
						<Form.Label>Height</Form.Label>
						<Form.Control
							type="text"
							value={localValues.height}
							onChange={(e) => handleChange('height', e.target.value)}
							placeholder="400px"
						/>
					</Form.Group>
				</Col>
			</Row>
		</div>
	);
}

/**
 * Axis Properties Component
 */
function AxisProperties({ chart, onChange }) {
	const is3D = chart.type.includes('3d');
	const [axisOptions, setAxisOptions] = useState(chart.options || {});

	useEffect(() => {
		setAxisOptions(chart.options || {});
	}, [chart.options]);

	const handleAxisChange = useCallback(
		(axis, field, value) => {
			const newOptions = {
				...axisOptions,
				[axis]: {
					...axisOptions[axis],
					[field]: value,
				},
			};
			setAxisOptions(newOptions);
			onChange('options', newOptions);
		},
		[axisOptions, onChange]
	);

	const axes = is3D
		? [
				{ key: 'xAxis3D', label: 'X Axis (3D)' },
				{ key: 'yAxis3D', label: 'Y Axis (3D)' },
				{ key: 'zAxis3D', label: 'Z Axis (3D)' },
			]
		: [
				{ key: 'xAxis', label: 'X Axis' },
				{ key: 'yAxis', label: 'Y Axis' },
			];

	return (
		<div className="property-group">
			<div className="property-group-title">
				<Palette className="me-1" size={14} />
				Axis Configuration
			</div>

			{axes.map(({ key, label }) => (
				<div key={key} className="mb-3">
					<strong className="d-block mb-2 fs-7">{label}</strong>
					<Form.Group className="property-field">
						<Form.Label>Name</Form.Label>
						<Form.Control
							type="text"
							value={axisOptions[key]?.name || ''}
							onChange={(e) =>
								handleAxisChange(key, 'name', e.target.value)
							}
							placeholder={`${label} name`}
						/>
					</Form.Group>
					<Form.Group className="property-field">
						<Form.Label>Type</Form.Label>
						<Form.Select
							value={axisOptions[key]?.type || 'value'}
							onChange={(e) =>
								handleAxisChange(key, 'type', e.target.value)
							}
						>
							<option value="value">Value</option>
							<option value="category">Category</option>
							<option value="time">Time</option>
							<option value="log">Log</option>
						</Form.Select>
					</Form.Group>
				</div>
			))}
		</div>
	);
}

/**
 * Series Properties Component
 */
function SeriesProperties({ chart, onChange }) {
	const [seriesOptions, setSeriesOptions] = useState(chart.series || {});

	useEffect(() => {
		setSeriesOptions(chart.series || {});
	}, [chart.series]);

	const handleChange = useCallback(
		(field, value) => {
			const newSeries = { ...seriesOptions, [field]: value };
			setSeriesOptions(newSeries);
			onChange('series', newSeries);
		},
		[seriesOptions, onChange]
	);

	const renderTypeSpecificOptions = () => {
		switch (chart.type) {
			case 'scatter':
			case 'scatter3d':
				return (
					<>
						<Form.Group className="property-field">
							<Form.Label>Symbol Size</Form.Label>
							<Form.Control
								type="number"
								value={seriesOptions.symbolSize || 10}
								onChange={(e) =>
									handleChange(
										'symbolSize',
										parseInt(e.target.value)
									)
								}
							/>
						</Form.Group>
						<Form.Group className="property-field">
							<Form.Label>Symbol Type</Form.Label>
							<Form.Select
								value={seriesOptions.symbol || 'circle'}
								onChange={(e) =>
									handleChange('symbol', e.target.value)
								}
							>
								<option value="circle">Circle</option>
								<option value="rect">Rectangle</option>
								<option value="triangle">Triangle</option>
								<option value="diamond">Diamond</option>
								<option value="pin">Pin</option>
							</Form.Select>
						</Form.Group>
					</>
				);

			case 'line':
			case 'line3d':
				return (
					<>
						<Form.Group className="property-field">
							<Form.Check
								type="checkbox"
								label="Smooth Line"
								checked={seriesOptions.smooth || false}
								onChange={(e) =>
									handleChange('smooth', e.target.checked)
								}
							/>
						</Form.Group>
						<Form.Group className="property-field">
							<Form.Check
								type="checkbox"
								label="Show Area"
								checked={seriesOptions.areaStyle !== undefined}
								onChange={(e) =>
									handleChange(
										'areaStyle',
										e.target.checked ? {} : undefined
									)
								}
							/>
						</Form.Group>
					</>
				);

			case 'bar':
			case 'bar3d':
				return (
					<Form.Group className="property-field">
						<Form.Check
							type="checkbox"
							label="Stack Bars"
							checked={seriesOptions.stack !== undefined}
							onChange={(e) =>
								handleChange(
									'stack',
									e.target.checked ? 'total' : undefined
								)
							}
						/>
					</Form.Group>
				);

			case 'pie':
				return (
					<>
						<Form.Group className="property-field">
							<Form.Label>Inner Radius (%)</Form.Label>
							<Form.Control
								type="text"
								value={seriesOptions.radius?.[0] || '0%'}
								onChange={(e) =>
									handleChange('radius', [
										e.target.value,
										seriesOptions.radius?.[1] || '70%',
									])
								}
							/>
						</Form.Group>
						<Form.Group className="property-field">
							<Form.Label>Outer Radius (%)</Form.Label>
							<Form.Control
								type="text"
								value={seriesOptions.radius?.[1] || '70%'}
								onChange={(e) =>
									handleChange('radius', [
										seriesOptions.radius?.[0] || '0%',
										e.target.value,
									])
								}
							/>
						</Form.Group>
					</>
				);

			default:
				return null;
		}
	};

	return (
		<div className="property-group">
			<div className="property-group-title">
				<Code className="me-1" size={14} />
				Series Options
			</div>
			{renderTypeSpecificOptions()}
		</div>
	);
}

/**
 * Property Panel Component
 */
function PropertyPanel() {
	const { state, updateChart } = useEditor();
	const { selectedChart } = state;

	const handlePropertyChange = useCallback(
		(field, value) => {
			if (selectedChart) {
				updateChart(selectedChart.id, { [field]: value });
			}
		},
		[selectedChart, updateChart]
	);

	if (!selectedChart) {
		return (
			<div className="editor-property-panel">
				<div className="property-panel-header">Properties</div>
				<div className="property-panel-empty">
					<Sliders size={48} className="mb-3 opacity-25" />
					<p className="text-muted">
						Select a chart to edit its properties
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="editor-property-panel">
			<div className="property-panel-header">
				Properties: {selectedChart.title}
				<span className="badge bg-secondary ms-2 fs-7">
					{selectedChart.type}
				</span>
			</div>
			<div className="property-panel-content">
				<BasicProperties
					chart={selectedChart}
					onChange={handlePropertyChange}
				/>

				<DataEditor
					chart={selectedChart}
					onChange={handlePropertyChange}
				/>

				{!['pie', 'funnel', 'radar'].includes(selectedChart.type) && (
					<AxisProperties
						chart={selectedChart}
						onChange={handlePropertyChange}
					/>
				)}

				<SeriesProperties
					chart={selectedChart}
					onChange={handlePropertyChange}
				/>
			</div>
		</div>
	);
}

export default PropertyPanel;
