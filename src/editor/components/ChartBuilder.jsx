/**
 * @fileoverview Chart Builder Component - Drag-and-drop canvas
 * @module editor/components/ChartBuilder
 *
 * Provides the main canvas area for building charts with drag-and-drop.
 */

import React, { useState, useCallback } from 'react';
import {
	GraphUp,
	GripVertical,
	Trash2,
	ArrowsMove,
} from 'react-bootstrap-icons';
import { Button, Badge } from 'react-bootstrap';
import { useEditor } from '../context/EditorContext';

/**
 * Generate a unique chart ID
 */
function generateChartId(type) {
	return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get default chart configuration based on type
 */
function getDefaultChartConfig(type) {
	const baseConfig = {
		id: generateChartId(type),
		type,
		title: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
		data: [],
		options: {},
		position: { x: 0, y: 0, w: 1, h: 1 },
	};

	switch (type) {
		case 'scatter':
		case 'scatter3d':
			return {
				...baseConfig,
				data: [
					{ x: 10, y: 20, z: 30 },
					{ x: 20, y: 30, z: 40 },
					{ x: 30, y: 40, z: 50 },
				],
				options: {
					xAxis: { name: 'X' },
					yAxis: { name: 'Y' },
					zAxis: type === 'scatter3d' ? { name: 'Z' } : undefined,
				},
			};

		case 'bar':
		case 'bar3d':
			return {
				...baseConfig,
				data: [
					{ category: 'A', value: 100 },
					{ category: 'B', value: 200 },
					{ category: 'C', value: 150 },
				],
				options: {
					xAxis: { type: 'category' },
					yAxis: { type: 'value' },
				},
			};

		case 'line':
		case 'line3d':
			return {
				...baseConfig,
				data: [
					{ x: 1, y: 10 },
					{ x: 2, y: 20 },
					{ x: 3, y: 15 },
					{ x: 4, y: 25 },
				],
				options: {
					xAxis: { type: 'category' },
					yAxis: { type: 'value' },
				},
			};

		case 'pie':
			return {
				...baseConfig,
				data: [
					{ name: 'A', value: 30 },
					{ name: 'B', value: 50 },
					{ name: 'C', value: 20 },
				],
				options: {
					radius: ['40%', '70%'],
				},
			};

		case 'radar':
			return {
				...baseConfig,
				data: [
					{ name: 'A', value: [80, 90, 70, 85, 60] },
					{ name: 'B', value: [70, 80, 90, 75, 80] },
				],
				options: {
					radar: {
						indicator: [
							{ name: 'Metric 1' },
							{ name: 'Metric 2' },
							{ name: 'Metric 3' },
							{ name: 'Metric 4' },
							{ name: 'Metric 5' },
						],
					},
				},
			};

		case 'funnel':
			return {
				...baseConfig,
				data: [
					{ value: 100, name: 'Stage 1' },
					{ value: 80, name: 'Stage 2' },
					{ value: 60, name: 'Stage 3' },
					{ value: 40, name: 'Stage 4' },
					{ value: 20, name: 'Stage 5' },
				],
			};

		case 'heatmap':
			return {
				...baseConfig,
				data: [
					[0, 0, 10],
					[0, 1, 20],
					[0, 2, 30],
					[1, 0, 40],
					[1, 1, 50],
					[1, 2, 60],
				],
				options: {
					xAxis: { type: 'category' },
					yAxis: { type: 'category' },
					visualMap: { min: 0, max: 100 },
				},
			};

		case 'boxplot':
			return {
				...baseConfig,
				data: [
					[655, 850, 940, 980, 1175],
					[672, 800, 845, 885, 1012],
					[780, 840, 855, 880, 940],
				],
				options: {
					xAxis: { type: 'category' },
					yAxis: { type: 'value' },
				},
			};

		case 'surface3d':
			return {
				...baseConfig,
				data: [],
				options: {
					xAxis3D: { type: 'value' },
					yAxis3D: { type: 'value' },
					zAxis3D: { type: 'value' },
					grid3D: {},
				},
			};

		default:
			return baseConfig;
	}
}

/**
 * Chart Canvas Item Component
 */
function ChartCanvasItem({ chart, index, isSelected, onSelect, onRemove }) {
	const handleClick = (e) => {
		e.stopPropagation();
		onSelect(chart.id);
	};

	const handleRemove = (e) => {
		e.stopPropagation();
		onRemove(chart.id);
	};

	const is3D = chart.type.includes('3d');

	return (
		<div
			className={`chart-canvas-item ${isSelected ? 'selected' : ''}`}
			onClick={handleClick}
		>
			<div className="chart-canvas-header">
				<div className="d-flex align-items-center gap-2">
					<GripVertical className="text-muted" size={16} />
					<span className="chart-canvas-title">{chart.title}</span>
					{is3D && (
						<Badge bg="info" className="fs-7">3D</Badge>
					)}
				</div>
				<div className="chart-canvas-actions">
					<Button
						variant="link"
						size="sm"
						className="text-muted p-0"
						title="Move"
					>
						<ArrowsMove size={14} />
					</Button>
					<Button
						variant="link"
						size="sm"
						className="text-danger p-0 ms-2"
						onClick={handleRemove}
						title="Remove"
					>
						<Trash2 size={14} />
					</Button>
				</div>
			</div>
			<div className="chart-canvas-preview">
				<div className="text-muted text-center">
					<GraphUp size={48} className="mb-2 opacity-25" />
					<p className="mb-0">{chart.type} chart</p>
					<small className="text-muted">
						{chart.data?.length || 0} data points
					</small>
				</div>
			</div>
		</div>
	);
}

/**
 * Chart Builder Component
 */
function ChartBuilder() {
	const {
		state,
		addChart,
		removeChart,
		setSelectedChart,
		reorderCharts,
	} = useEditor();

	const { config, selectedChartId } = state;
	const [isDragOver, setIsDragOver] = useState(false);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(
		(e) => {
			e.preventDefault();
			setIsDragOver(false);

			const chartType = e.dataTransfer.getData('chartType');
			if (chartType) {
				const newChart = getDefaultChartConfig(chartType);
				addChart(newChart);
			}
		},
		[addChart],
	);

	const handleCanvasClick = useCallback(() => {
		setSelectedChart(null);
	}, [setSelectedChart]);

	const handleSelectChart = useCallback(
		(id) => {
			setSelectedChart(id);
		},
		[setSelectedChart],
	);

	const handleRemoveChart = useCallback(
		(id) => {
			removeChart(id);
		},
		[removeChart],
	);

	return (
		<div
			className="editor-canvas"
			onClick={handleCanvasClick}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<div
				className={`editor-canvas-content ${
					isDragOver ? 'drag-over' : ''
				}`}
			>
				{config.charts.length === 0 ? (
					<div className="editor-canvas-empty">
						<GraphUp size={64} />
						<h4>No charts yet</h4>
						<p>
							Drag and drop chart types from the sidebar to get
							started.
						</p>
					</div>
				) : (
					<div className="charts-list">
						{config.charts.map((chart, index) => (
							<ChartCanvasItem
								key={chart.id}
								chart={chart}
								index={index}
								isSelected={selectedChartId === chart.id}
								onSelect={handleSelectChart}
								onRemove={handleRemoveChart}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default ChartBuilder;
