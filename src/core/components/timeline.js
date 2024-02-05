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
	// Render title if it exists
	const renderTitle = () => {
		return title && <h3>{title}</h3>;
	};

	const [nodes, setNodes] = useState([]);

	useEffect(() => {
		const { selection, urlval, rm_suffix } = props;

		const fetchData = async () => {
			try {
				const response = await simplefetch(selection, { key: urlval });
				// remove the suffix "_metadata" from the options
				try {
					const removed_suffix = response.map((item) =>
						item.replace(rm_suffix, ''),
					);
					//console.log('Removed suffix:', removed_suffix);
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
	}, [props, split_pattern, debug]);

	const { setSharedData } = useAppContext();

	const handleNodeClick = (node) => {
		if (debug) console.log(`Node [${node}] clicked!`);
		if (val) {
			setSharedData((prevSharedData) => {
				return { ...prevSharedData, [val]: [node] };
			});
			alert(`Clicked: ${node}`);
		}
	};

	const _sort_pattern =
		typeof sort_pattern === 'string'
			? new RegExp(sort_pattern)
			: sort_pattern;

	const sortedNodes = Object.keys(nodes)
		.sort((a, b) => {
			//console.log('a:', a, 'b:', b, 'sort_pattern:', _sort_pattern);
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

			//console.log('str', str, 'match:', match, 'distance_pattern:', dis_regex);
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

		//console.log('numA:', numA, 'numB:', numB, 'diff:', Math.abs(numA - numB));

		return Math.abs(numA - numB) * basicGap; // Distance based on the basic gap value
	};

	let previousMain = null;

	return (
		<div
			key={id}
			style={{ ...style }}
			className={className}>
			{renderTitle()}
			<div
				key={id + '.timeline'}
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					position: 'relative',
				}}>
				<div
					style={{
						borderLeft: '10px solid black',
						//minHeight: '350px',
						height: '100%',
						position: 'absolute',
						left: '0px',
						top: '0px',
					}}
				/>
				<div
					style={{ ...style }}
					className={className}>
					<div
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
							previousMain = main; // Update previousMain for the next iteration
							return (
								<div
									key={index}
									style={{
										display: 'flex',
										alignItems: 'center',
										marginTop: distance + 'px', // Apply distance here
										position: 'relative',
										flexDirection: 'column',
									}}>
									<div
										style={{
											position: 'absolute',
											left: '0%',
											top: '10px',
											width: node_width ?? '50%',
											height: '2px',
											background: 'black',
										}}
									/>
									<div
										id='Timeline.Dot'
										style={{
											position: 'absolute',
											left: '0%',
											top: '15px',
											width: '10px',
											height: '10px',
											borderRadius: '50%',
											background: 'black',
										}}
									/>
									{nodes[main] ? (
										<>
											<div style={{ marginLeft: '15%' }}>
												{main}
											</div>
											<div
												style={{
													marginLeft: '15%',
													display: 'flex',
													flexWrap: 'wrap',
												}}>
												{nodes[main].map(
													(sub, subIndex) => (
														<button
															key={subIndex}
															style={{
																padding:
																	'5px 3px',
																marginLeft:
																	'2px',
																border: '1px solid black',
																cursor: 'pointer',
															}}
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
											style={{
												marginLeft: '15%',
												padding: '5px 3px',
												border: '1px solid black',
												cursor: 'pointer',
											}}
											onClick={() =>
												handleNodeClick(main)
											}>
											{main}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Timeline;
