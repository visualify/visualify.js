/**
 * @fileoverview Chart Type Sidebar Component
 * @module editor/components/ChartTypeSidebar
 *
 * Displays available chart types for drag-and-drop.
 */

import React from 'react';
import {
	GraphUp,
	BarChart,
	PieChart,
	Diagram3,
	ScatterChart,
	LineChart,
	Box,
	Grid3x3,
} from 'react-bootstrap-icons';

/**
 * 2D Chart Types
 */
const CHART_TYPES_2D = [
	{ type: 'scatter', label: 'Scatter', icon: ScatterChart },
	{ type: 'bar', label: 'Bar', icon: BarChart },
	{ type: 'line', label: 'Line', icon: LineChart },
	{ type: 'pie', label: 'Pie', icon: PieChart },
	{ type: 'radar', label: 'Radar', icon: Diagram3 },
	{ type: 'funnel', label: 'Funnel', icon: GraphUp },
	{ type: 'heatmap', label: 'Heatmap', icon: Grid3x3 },
	{ type: 'boxplot', label: 'Box Plot', icon: Box },
];

/**
 * 3D Chart Types
 */
const CHART_TYPES_3D = [
	{ type: 'scatter3d', label: '3D Scatter', icon: ScatterChart },
	{ type: 'bar3d', label: '3D Bar', icon: BarChart },
	{ type: 'surface3d', label: '3D Surface', icon: Grid3x3 },
	{ type: 'line3d', label: '3D Line', icon: LineChart },
];

/**
 * Chart Type Item Component
 */
function ChartTypeItem({ type, label, icon: Icon }) {
	const handleDragStart = (e) => {
		e.dataTransfer.setData('chartType', type);
		e.dataTransfer.effectAllowed = 'copy';
	};

	return (
		<div
			className="chart-type-item"
			draggable
			onDragStart={handleDragStart}
			title={`Drag to add ${label} chart`}
		>
			<div className="chart-type-icon">
				<Icon />
			</div>
			<span className="chart-type-label">{label}</span>
		</div>
	);
}

/**
 * Chart Type Sidebar Component
 */
function ChartTypeSidebar() {
	return (
		<div className="editor-sidebar">
			<div className="editor-sidebar-header">2D Charts</div>
			<div className="chart-types-list">
				{CHART_TYPES_2D.map((chartType) => (
					<ChartTypeItem key={chartType.type} {...chartType} />
				))}
			</div>

			<div className="editor-sidebar-header">3D Charts</div>
			<div className="chart-types-list">
				{CHART_TYPES_3D.map((chartType) => (
					<ChartTypeItem key={chartType.type} {...chartType} />
				))}
			</div>
		</div>
	);
}

export default ChartTypeSidebar;
