import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../appContext';
import ReCharts from '../modules/echarts';

function processData(
	nodes,
	selected,
	_symbolSize,
	maxValue,
	inner_color,
	unclickable,
) {
	const { nodes: selectedNodes, category: selectedCategory } = selected;

	return nodes.nodes.map((node) => {
		const symbolSize =
			typeof _symbolSize === 'number'
				? _symbolSize
				: typeof _symbolSize === 'string'
				? _symbolSize === 'default'
					? (6 - node.category) * 6
					: 10 + (parseFloat(node[_symbolSize]) / maxValue) * 30 ||
					  (6 - node.category) * 6
				: (6 - node.category) * 6; // Fallback to default

		const isSelected = selectedNodes.includes(node.name);
		const isSameCategory = node.category === selectedCategory;
		const isOriginalState =
			selectedCategory === null && selectedNodes.length === 0;
		const isUnclickable =
			unclickable.includes(node.name) ||
			unclickable.includes(node.category);
		const opacity = isUnclickable
			? 0.8
			: isOriginalState
			? 1
			: isSelected
			? 1
			: isSameCategory
			? 1
			: 0.2;
		const color = isUnclickable
			? 'gray'
			: isOriginalState
			? `hsl(${node.category * 110}, 50%, 50%)`
			: isSelected
			? inner_color.selected ?? 'red'
			: isSameCategory
			? `hsl(${node.category * 100}, 50%, 50%)`
			: inner_color.unselectable ?? 'grey';

		return {
			...node,
			symbolSize,
			itemStyle: {
				color,
				opacity,
			},
			emphasis: {
				focus: 'self',
				itemStyle: {
					color,
					opacity,
				},
				label: {
					position: 'insideTop',
					show: true, // Show label
				},
			},
		};
	});
}

function Macaron({ props, style }) {
	const { debug, style: _style, className } = props;
	const { id, title, data } = props;

	const {
		animation = false,
		draggable = true,
		repulsion = 100,
		edgeLength = 40,
		height: inner_height = '93%',
		width: inner_width = '100%',
		unclickable = [],
		symbolSize: _symbolSize = 'default',
		color: inner_color = {
			selected: 'red',
			unselectable: 'grey',
		},
		singleclick = true,
	} = props.config;

	const [selected, setSelected] = useState({ nodes: [], category: null });
	const { val = 'vnode' } = props;

	const inner_style = {
		border: debug ? '1px solid black' : 'none',
		height: inner_height,
		width: inner_width,
	};

	const maxValue = useMemo(() => {
		const values = data.nodes.map(
			(node) => parseFloat(node[_symbolSize]) || 50,
		);
		return Math.max(...values);
	}, [data, _symbolSize]);

	const processedData = useMemo(
		() =>
			processData(
				data,
				selected,
				_symbolSize,
				maxValue,
				inner_color,
				unclickable,
			),
		[data, selected, _symbolSize, maxValue, inner_color, unclickable],
	);

	const onChartClick = (params) => {
		const category = params.data.category;
		const name = params.data.name;
		if (
			params.dataType === 'node' &&
			!unclickable.includes(category) &&
			!unclickable.includes(name) &&
			(selected.category === null || category === selected.category)
		) {
			let updatedSelectedNodes = [...selected.nodes];
			let updatedSelectedCategory = selected.category;
			if (selected.nodes.includes(name)) {
				updatedSelectedNodes = updatedSelectedNodes.filter(
					(nodeName) => nodeName !== name,
				);
				if (updatedSelectedNodes.length === 0) {
					updatedSelectedCategory = null;
				}
			} else {
				if (singleclick) updatedSelectedNodes = [name];
				else updatedSelectedNodes.push(name);
				updatedSelectedCategory = category;
			}
			setSelected({
				nodes: updatedSelectedNodes,
				category: updatedSelectedCategory,
			});
		}
	};

	const { setSharedData } = useAppContext();

	useEffect(() => {
		if (
			val &&
			Array.isArray(selected.nodes) &&
			selected.nodes.length >= 0
		) {
			setSharedData((prevSharedData) => ({
				...prevSharedData,
				[val]: selected.nodes,
			}));
		}
	}, [selected, val, setSharedData]);

	return (
		<div
			key={id}
			style={{ ...style, ..._style }}
			className={className}>
			{title && <h3>{title}</h3>}
			<ReCharts
				options={{
					series: [
						{
							type: 'graph',
							layout: 'force',
							animation,
							draggable,
							label: {
								position: 'top',
								formatter: '{b}',
								show: true,
							},
							data: processedData,
							categories: data.categories,
							edges: data.edges,
							force: { repulsion, edgeLength },
						},
					],
				}}
				style={inner_style}
				onEvents={{ click: onChartClick }}
			/>
		</div>
	);
}

export default Macaron;
