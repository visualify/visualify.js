import React, { useEffect, useState } from 'react';
import simplefetch from '../fetch/fetch';
import { useAppContext } from '../appContext';

const generateNodes = (data, split_pattern) => {
	return data.reduce((groups, item) => {
		const parts = item.split(split_pattern);
		const main = parts[0];
		const sub = parts.slice(1).join(split_pattern);

		if (sub) {
			if (!groups[main]) {
				groups[main] = [];
			}
			groups[main].push(sub);
		} else {
			groups[main] = null;
		}

		return groups;
	}, {});
};

function Timeline({ props, style }) {
	const { debug } = props;

	const { style: _style_parsed = {} } = props;
	const { class: className, ...customStyle } = _style_parsed;

	// if debug is true, then border is red, else no border
	style = {
		...style,
		border: debug ? '1px solid red' : 'none',
		maxHeight: '500px',
		overflowY: 'auto',
		overflowX: 'hidden',
		...customStyle,
		position: 'relative',
	};

	const { id, val, config = {}, title } = props;

	const {
		split_pattern = '_',
		node_width = '50%',
		sort_pattern = new RegExp(/E(\d+)/),
		distance_pattern = undefined,
		basicGap = 1,
	} = config;

	const renderTitle = () => {
		return title && <h3 className='v-control-title'>{title}</h3>;
	};

	const [nodes, setNodes] = useState([]);
	const [activeNode, setActiveNode] = useState(null);

	// Extract stable primitives from props for dependency tracking
	const { selection, urlval, rm_suffix } = props;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await simplefetch(selection, { key: urlval });
				try {
					const removed_suffix = response.map((item) =>
						item.replace(rm_suffix, ''),
					);
					const groupedNodes = generateNodes(
						removed_suffix,
						split_pattern,
					);
					setNodes(groupedNodes);
				} catch (error) {
					setNodes(response);
				}
			} catch (error) {
				console.error('Error fetching options:', error);
			}
		};

		fetchData();
	}, [selection, urlval, rm_suffix, split_pattern, debug]);

	const { setSharedData } = useAppContext();

	const handleNodeClick = (node) => {
		if (debug) console.log(`Node [${node}] clicked!`);
		if (val) {
			setSharedData((prevSharedData) => {
				return { ...prevSharedData, [val]: [node] };
			});
			setActiveNode(node);
		}
	};

	const _sort_pattern =
		typeof sort_pattern === 'string'
			? new RegExp(sort_pattern)
			: sort_pattern;

	const sortedNodes = Object.keys(nodes)
		.sort((a, b) => {
			const numA = parseInt(a.match(_sort_pattern)[1]);
			const numB = parseInt(b.match(_sort_pattern)[1]);
			return numA - numB;
		})
		.reduce((acc, key) => {
			acc[key] = nodes[key];
			return acc;
		}, {});

	const extractNumber = (str) => {
		const matchE = str.match(/E(\d+)/);

		if (distance_pattern && distance_pattern.regex) {
			const dis_regex =
				typeof distance_pattern?.regex === 'string'
					? new RegExp(distance_pattern.regex)
					: distance_pattern.regex;

			const match = str.match(dis_regex);

			if (match) {
				for (let i = distance_pattern.pos; i >= 1; i--) {
					if (match[i]) {
						return parseInt(match[i]);
					}
				}
			}
		} else if (matchE) {
			return parseInt(matchE[1]);
		}
		return 0;
	};

	const calculateDistance = (main, previousMain) => {
		if (!previousMain) return 0;

		const numA = extractNumber(main);
		const numB = extractNumber(previousMain);

		return Math.abs(numA - numB) * basicGap;
	};

	let previousMain = null;

	// Check if a node group has any active sub-item
	const isNodeActive = (main) => {
		if (activeNode === main) return true;
		if (nodes[main]) {
			return nodes[main].some(
				(sub) => activeNode === `${main}_${sub}`,
			);
		}
		return false;
	};

	return (
		<div
			key={id}
			style={{ ...style }}
			className={className}>
			{renderTitle()}
			<div
				key={id + '.timeline'}
				className='v-timeline'
				style={{
					position: 'relative',
				}}>
				<div className='v-timeline-line' />
				<div className='v-timeline-scroll'
					style={{
						maxHeight: '500px',
						overflowY: 'auto',
						overflowX: 'hidden',
					}}>
					{Object.keys(sortedNodes).map((main, index) => {
						const distance = calculateDistance(
							main,
							previousMain,
						);
						previousMain = main;
						const nodeActive = isNodeActive(main);
						return (
							<div
								key={index}
								className={`v-timeline-node${nodeActive ? ' has-active' : ''}`}
								style={{
									marginTop: distance + 'px',
								}}>
								<div className='v-timeline-branch' />
								<div className='v-timeline-dot' />
								<div className='v-timeline-content'>
									{nodes[main] ? (
										<>
											<div className='v-timeline-label'>
												{main}
											</div>
											<div className='v-timeline-btn-group'>
												{nodes[main].map(
													(sub, subIndex) => (
														<button
															key={subIndex}
															className={`v-timeline-btn${activeNode === `${main}_${sub}` ? ' active' : ''}`}
															onClick={() =>
																handleNodeClick(
																	`${main}_${sub}`,
																)
															}>
															{sub}
														</button>
													),
												)}
											</div>
										</>
									) : (
										<div
											className={`v-timeline-single${activeNode === main ? ' active' : ''}`}
											onClick={() =>
												handleNodeClick(main)
											}>
											{main}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default Timeline;
