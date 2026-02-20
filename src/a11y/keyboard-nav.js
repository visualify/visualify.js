/**
 * Keyboard Navigation Handlers for Visualify.js
 * Provides keyboard accessibility for chart interactions
 * @module a11y/keyboard-nav
 */

import { useState, useRef, useCallback } from 'react';
import { announceToScreenReader, generateDataPointLabel } from './aria-labels';

/**
 * Default keyboard navigation configuration
 */
const DEFAULT_CONFIG = {
	enableArrowNavigation: true,
	enableTabNavigation: true,
	enableEnterActivation: true,
	wrapAround: true,
	announceChanges: true,
};

/**
 * Creates a keyboard navigation handler for charts
 * @param {Object} options - Configuration options
 * @param {Array} options.data - Chart data array
 * @param {Function} options.onFocusChange - Callback when focus changes
 * @param {Function} options.onActivate - Callback when item is activated
 * @param {Function} options.onEscape - Callback when escape is pressed
 * @param {Object} options.config - Chart configuration
 * @returns {Object} Keyboard navigation state and handlers
 */
export const useKeyboardNavigation = (options = {}) => {
	const {
		data = [],
		onFocusChange,
		onActivate,
		onEscape,
		config = {},
		navConfig = {},
	} = options;

	const navigationConfig = { ...DEFAULT_CONFIG, ...navConfig };
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const containerRef = useRef(null);

	/**
	 * Moves focus to a specific data point
	 * @param {number} index - Index of data point to focus
	 */
	const focusDataPoint = (index) => {
		if (index < 0 || index >= data.length) {
			if (navigationConfig.wrapAround) {
				// Wrap around
				if (index < 0) {
					index = data.length - 1;
				} else {
					index = 0;
				}
			} else {
				return;
			}
		}

		setFocusedIndex(index);

		if (navigationConfig.announceChanges && index >= 0) {
			const label = generateDataPointLabel(data[index], index, config);
			announceToScreenReader(label, 'polite');
		}

		if (onFocusChange) {
			onFocusChange(index, data[index]);
		}
	};

	/**
	 * Activates the currently focused data point
	 */
	const activateDataPoint = () => {
		if (focusedIndex >= 0 && focusedIndex < data.length) {
			if (navigationConfig.announceChanges) {
				announceToScreenReader(`Activated ${generateDataPointLabel(data[focusedIndex], focusedIndex, config)}`, 'polite');
			}

			if (onActivate) {
				onActivate(focusedIndex, data[focusedIndex]);
			}
		}
	};

	/**
	 * Clears the current focus
	 */
	const clearFocus = () => {
		setFocusedIndex(-1);
		if (onEscape) {
			onEscape();
		}
	};

	/**
	 * Handles keyboard events for chart navigation
	 * @param {KeyboardEvent} event - Keyboard event
	 */
	const handleKeyDown = (event) => {
		if (!navigationConfig.enableArrowNavigation && !navigationConfig.enableEnterActivation) {
			return;
		}

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(focusedIndex + 1);
				}
				break;

			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(focusedIndex - 1);
				}
				break;

			case 'Enter':
			case ' ':
				event.preventDefault();
				if (navigationConfig.enableEnterActivation) {
					activateDataPoint();
				}
				break;

			case 'Escape':
				event.preventDefault();
				clearFocus();
				// Move focus back to container
				if (containerRef.current) {
					containerRef.current.focus();
				}
				break;

			case 'Home':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(0);
				}
				break;

			case 'End':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(data.length - 1);
				}
				break;

			case 'PageUp':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(Math.max(0, focusedIndex - 10));
				}
				break;

			case 'PageDown':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(Math.min(data.length - 1, focusedIndex + 10));
				}
				break;

			default:
				break;
		}
	};

	/**
	 * Handles focus entering the chart
	 */
	const handleFocus = () => {
		if (focusedIndex === -1 && data.length > 0) {
			// Auto-focus first item when tabbing into chart
			focusDataPoint(0);
		}
	};

	/**
	 * Handles blur leaving the chart
	 */
	const handleBlur = (event) => {
		// Check if focus is moving outside the chart container
		if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
			clearFocus();
		}
	};

	return {
		focusedIndex,
		setFocusedIndex,
		containerRef,
		handleKeyDown,
		handleFocus,
		handleBlur,
		focusDataPoint,
		activateDataPoint,
		clearFocus,
	};
};

/**
 * React hook for chart keyboard navigation
 * @param {Object} options - Configuration options
 * @returns {Object} Navigation props and state
 */
export const useChartKeyboardNav = (options = {}) => {
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const containerRef = useRef(null);

	const {
		data = [],
		onFocusChange,
		onActivate,
		onEscape,
		config = {},
		navConfig = {},
	} = options;

	const navigationConfig = { ...DEFAULT_CONFIG, ...navConfig };

	const focusDataPoint = useCallback((index) => {
		if (index < 0 || index >= data.length) {
			if (navigationConfig.wrapAround) {
				if (index < 0) {
					index = data.length - 1;
				} else {
					index = 0;
				}
			} else {
				return;
			}
		}

		setFocusedIndex(index);

		if (navigationConfig.announceChanges && index >= 0) {
			const label = generateDataPointLabel(data[index], index, config);
			announceToScreenReader(label, 'polite');
		}

		if (onFocusChange) {
			onFocusChange(index, data[index]);
		}
	}, [data, config, navigationConfig, onFocusChange]);

	const activateDataPoint = useCallback(() => {
		if (focusedIndex >= 0 && focusedIndex < data.length) {
			if (navigationConfig.announceChanges) {
				announceToScreenReader(
					`Activated ${generateDataPointLabel(data[focusedIndex], focusedIndex, config)}`,
					'polite'
				);
			}

			if (onActivate) {
				onActivate(focusedIndex, data[focusedIndex]);
			}
		}
	}, [focusedIndex, data, config, navigationConfig, onActivate]);

	const clearFocus = useCallback(() => {
		setFocusedIndex(-1);
		if (onEscape) {
			onEscape();
		}
	}, [onEscape]);

	const handleKeyDown = useCallback((event) => {
		if (!navigationConfig.enableArrowNavigation && !navigationConfig.enableEnterActivation) {
			return;
		}

		switch (event.key) {
			case 'ArrowRight':
			case 'ArrowDown':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(focusedIndex + 1);
				}
				break;

			case 'ArrowLeft':
			case 'ArrowUp':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(focusedIndex - 1);
				}
				break;

			case 'Enter':
			case ' ':
				event.preventDefault();
				if (navigationConfig.enableEnterActivation) {
					activateDataPoint();
				}
				break;

			case 'Escape':
				event.preventDefault();
				clearFocus();
				if (containerRef.current) {
					containerRef.current.focus();
				}
				break;

			case 'Home':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(0);
				}
				break;

			case 'End':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(data.length - 1);
				}
				break;

			case 'PageUp':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(Math.max(0, focusedIndex - 10));
				}
				break;

			case 'PageDown':
				event.preventDefault();
				if (navigationConfig.enableArrowNavigation) {
					focusDataPoint(Math.min(data.length - 1, focusedIndex + 10));
				}
				break;

			default:
				break;
		}
	}, [focusedIndex, data.length, navigationConfig, focusDataPoint, activateDataPoint, clearFocus]);

	const handleFocus = useCallback(() => {
		if (focusedIndex === -1 && data.length > 0) {
			focusDataPoint(0);
		}
	}, [focusedIndex, data.length, focusDataPoint]);

	const handleBlur = useCallback((event) => {
		if (containerRef.current && !containerRef.current.contains(event.relatedTarget)) {
			clearFocus();
		}
	}, [clearFocus]);

	return {
		focusedIndex,
		containerRef,
		handleKeyDown,
		handleFocus,
		handleBlur,
		focusDataPoint,
		activateDataPoint,
		clearFocus,
		// Props to spread on container
		containerProps: {
			ref: containerRef,
			tabIndex: 0,
			onKeyDown: handleKeyDown,
			onFocus: handleFocus,
			onBlur: handleBlur,
			role: 'application',
			'aria-label': config.title || 'Interactive chart',
		},
	};
};

/**
 * Creates keyboard handlers for the echarts switcher component
 * @param {Object} chartRef - Reference to the chart instance
 * @param {Object} config - Chart configuration
 * @returns {Object} Keyboard event handlers
 */
export const createEChartsSwitcherKeyboardHandlers = (chartRef, config = {}) => {
	const handleKeyDown = (event) => {
		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				// Trigger chart click event
				if (chartRef?.current) {
					const chart = chartRef.current.getEchartsInstance?.();
					if (chart) {
						// Dispatch a click event on the chart
						chart.dispatchAction({
							type: 'highlight',
							seriesIndex: 0,
							dataIndex: 0,
						});
					}
				}
				break;

			case 'r':
			case 'R':
				// Refresh chart data (Ctrl+R or Cmd+R is handled by browser)
				if (event.ctrlKey || event.metaKey) {
					return;
				}
				event.preventDefault();
				if (chartRef?.current) {
					const chart = chartRef.current.getEchartsInstance?.();
					if (chart) {
						chart.resize();
						announceToScreenReader('Chart refreshed', 'polite');
					}
				}
				break;

			case 'Escape':
				event.preventDefault();
				// Clear any selections
				if (chartRef?.current) {
					const chart = chartRef.current.getEchartsInstance?.();
					if (chart) {
						chart.dispatchAction({
							type: 'downplay',
						});
					}
				}
				break;

			default:
				break;
		}
	};

	return {
		handleKeyDown,
	};
};

/**
 * Traps focus within a modal or overlay element
 * @param {HTMLElement} element - Container element
 * @returns {Function} Cleanup function
 */
export const trapFocus = (element) => {
	if (!element) return () => {};

	const focusableElements = element.querySelectorAll(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
	);

	const firstFocusable = focusableElements[0];
	const lastFocusable = focusableElements[focusableElements.length - 1];

	const handleTabKey = (e) => {
		if (e.key !== 'Tab') return;

		if (e.shiftKey) {
			if (document.activeElement === firstFocusable) {
				lastFocusable.focus();
				e.preventDefault();
			}
		} else {
			if (document.activeElement === lastFocusable) {
				firstFocusable.focus();
				e.preventDefault();
			}
		}
	};

	element.addEventListener('keydown', handleTabKey);

	// Focus first element
	if (firstFocusable) {
		firstFocusable.focus();
	}

	return () => {
		element.removeEventListener('keydown', handleTabKey);
	};
};

/**
 * Checks if the user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Gets appropriate animation settings based on user preferences
 * @param {Object} animationConfig - Desired animation configuration
 * @returns {Object} Animation config respecting user preferences
 */
export const getAccessibleAnimation = (animationConfig = {}) => {
	if (prefersReducedMotion()) {
		return {
			duration: 0,
			delay: 0,
			easing: 'linear',
			...animationConfig.reducedMotion,
		};
	}

	return animationConfig;
};

export default {
	useKeyboardNavigation,
	useChartKeyboardNav,
	createEChartsSwitcherKeyboardHandlers,
	trapFocus,
	prefersReducedMotion,
	getAccessibleAnimation,
};
