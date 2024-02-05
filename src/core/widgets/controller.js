/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-21 13:07:59
 * @FilePath     : /visualifyjs/src/core/widgets/controller.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';
import widgetMapping from './mapping';

function Vcontroller({ components = [], layout }) {
	// ----------------------------------------------------------------------
	const UUIDs = new Set();
	function generateUniqueId() {
		let uniqueId;
		do {
			uniqueId = 'xxxx-xxxx-4xxx-yxxx-xxxx-xxxx'.replace(
				/[xy]/g,
				function (c) {
					const r = (Math.random() * 16) | 0;
					const v = c === 'x' ? r : (r & 0x3) | 0x8;
					return v.toString(16);
				},
			);
		} while (UUIDs.has(uniqueId));
		UUIDs.add(uniqueId);
		return uniqueId;
	}

	const _components = {};
	// ----------------------------------------------------------------------
	// Iterate over the config array and render the components based on their type and position
	const Allcomponents = components.map((componentConfig, index) => {
		const {
			row = 1,
			col = 1,
			colspan = 1,
			rowspan = 1,
			debug = false,
		} = componentConfig;

		const componentStyle =
			layout === 'grid'
				? {
						gridColumn: `${col} / span ${colspan}`,
						gridRow: `${row} / span ${rowspan}`,
						border: debug ? '1px solid red' : 'none',
				  }
				: {};

		const Component = widgetMapping[componentConfig.type];

		// Generate a unique ID for the component using both ID and index
		const uniqueId = generateUniqueId();

		//console.log(uniqueId);

		if (!Component) {
			return (
				<span
					key={uniqueId}
					style={componentStyle}>
					Error: Component{' '}
					<b style={{ color: 'red' }}>{componentConfig.type}</b> not
					found.
				</span>
			);
		}

		const _Component = React.cloneElement(<Component key={uniqueId} />, {
			style: componentStyle,
			props: componentConfig,
		});

		_components[uniqueId] = _Component;
		// Clone the Component element with the necessary styles and props
		return _Component;
	});

	return <>{Allcomponents}</>;
}

export default Vcontroller;
