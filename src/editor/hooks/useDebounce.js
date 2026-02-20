/**
 * @fileoverview Debounce Hook
 * @module editor/hooks/useDebounce
 *
 * Hook for delaying value updates to improve performance.
 */

import { useState, useEffect } from 'react';

/**
 * Debounce hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}

export default useDebounce;
