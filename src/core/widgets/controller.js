/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-21 13:07:59
 * @FilePath     : /visualifyjs/src/core/widgets/controller.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useRef, useEffect } from 'react';
import widgetMapping from './mapping';
import { applyA11yStyles } from '../../a11y';

function Vcontroller({ components = [], layout, ariaLabel = 'Dashboard' }) {
	const containerRef = useRef(null);

	// Apply accessibility styles on mount
	useEffect(() => {
		applyA11yStyles();
	}, []);

	// ----------------------------------------------------------------------
	// Iterate over the config array and render the components based on their type and position
	// Use stable keys derived from component id/index to prevent unmount/remount on re-render
	const Allcomponents = components.map((componentConfig, index) => {
		const {
			row = 1,
			col = 1,
			colspan = 1,
			rowspan = 1,
			debug = false,
		} = componentConfig;

		// Stable key: prefer component id, fall back to type+index
		const stableKey = componentConfig.id || `${componentConfig.type}-${index}`;

		const componentStyle =
			layout === 'grid'
				? {
						gridColumn: `${col} / span ${colspan}`,
						gridRow: `${row} / span ${rowspan}`,
						border: debug ? '1px solid red' : 'none',
				  }
				: {};

		const Component = widgetMapping[componentConfig.type];

		const componentAriaLabel = componentConfig.ariaLabel ||
			`${componentConfig.type} widget ${index + 1} of ${components.length}`;

		if (!Component) {
			return (
				<span
					key={stableKey}
					style={componentStyle}
					role="alert"
					aria-live="assertive">
					Error: Component{' '}
					<b style={{ color: 'red' }}>{componentConfig.type}</b> not
					found.
				</span>
			);
		}

		return React.cloneElement(<Component key={stableKey} />, {
			style: componentStyle,
			props: {
				...componentConfig,
				id: componentConfig.id || stableKey,
			},
			'aria-label': componentAriaLabel,
			role: 'region',
		});
	});

	return (
		<div
			ref={containerRef}
			className="visualify-controller"
			role="main"
			aria-label={ariaLabel}
			tabIndex={-1}
			style={{ display: 'contents' }}
		>
			{/* Skip link for keyboard navigation */}
			<a
				href="#visualify-main-content"
				className="sr-only sr-only-focusable"
				style={{
					position: 'absolute',
					top: '-40px',
					left: '0',
					background: '#000',
					color: '#fff',
					padding: '8px 16px',
					zIndex: 9999,
					textDecoration: 'none',
					transition: 'top 0.2s',
				}}
				onFocus={(e) => {
					e.target.style.top = '0';
				}}
				onBlur={(e) => {
					e.target.style.top = '-40px';
				}}
			>
				Skip to main content
			</a>

			{/* Main content — display:contents makes grid items direct participants */}
			<div id="visualify-main-content" className="visualify-components-container" style={{ display: 'contents' }}>
				{Allcomponents}
			</div>
		</div>
	);
}

export default Vcontroller;
