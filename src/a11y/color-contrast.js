/**
 * Color Contrast Checker for Visualify.js
 * WCAG AA compliance checking and color suggestions
 * @module a11y/color-contrast
 */

/**
 * WCAG contrast ratio thresholds
 */
export const WCAG_THRESHOLDS = {
	// Normal text
	AA_NORMAL: 4.5,
	AAA_NORMAL: 7,
	// Large text (18pt+ or 14pt+ bold)
	AA_LARGE: 3,
	AAA_LARGE: 4.5,
	// UI components and graphical objects
	AA_UI: 3,
};

/**
 * Converts hex color to RGB
 * @param {string} hex - Hex color string (#RGB or #RRGGBB)
 * @returns {Object|null} RGB values {r, g, b} or null if invalid
 */
export const hexToRgb = (hex) => {
	if (!hex || typeof hex !== 'string') return null;

	// Remove # if present
	hex = hex.replace(/^#/, '');

	// Handle shorthand (#RGB)
	if (hex.length === 3) {
		hex = hex.split('').map(char => char + char).join('');
	}

	// Handle 6-digit hex
	if (hex.length === 6) {
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

		return { r, g, b };
	}

	return null;
};

/**
 * Converts RGB to hex color
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string
 */
export const rgbToHex = (r, g, b) => {
	const toHex = (n) => {
		const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Parses color string to RGB (supports hex, rgb, rgba, named colors)
 * @param {string} color - Color string
 * @returns {Object|null} RGB values {r, g, b} or null if invalid
 */
export const parseColor = (color) => {
	if (!color || typeof color !== 'string') return null;

	color = color.trim().toLowerCase();

	// Hex color
	if (color.startsWith('#')) {
		return hexToRgb(color);
	}

	// RGB/RGBA color
	const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (rgbMatch) {
		return {
			r: parseInt(rgbMatch[1], 10),
			g: parseInt(rgbMatch[2], 10),
			b: parseInt(rgbMatch[3], 10),
		};
	}

	// Named colors
	const namedColors = {
		black: { r: 0, g: 0, b: 0 },
		white: { r: 255, g: 255, b: 255 },
		red: { r: 255, g: 0, b: 0 },
		green: { r: 0, g: 128, b: 0 },
		blue: { r: 0, g: 0, b: 255 },
		yellow: { r: 255, g: 255, b: 0 },
		cyan: { r: 0, g: 255, b: 255 },
		magenta: { r: 255, g: 0, b: 255 },
		silver: { r: 192, g: 192, b: 192 },
		gray: { r: 128, g: 128, b: 128 },
		grey: { r: 128, g: 128, b: 128 },
		maroon: { r: 128, g: 0, b: 0 },
		olive: { r: 128, g: 128, b: 0 },
		lime: { r: 0, g: 255, b: 0 },
		aqua: { r: 0, g: 255, b: 255 },
		teal: { r: 0, g: 128, b: 128 },
		navy: { r: 0, g: 0, b: 128 },
		fuchsia: { r: 255, g: 0, b: 255 },
		purple: { r: 128, g: 0, b: 128 },
		orange: { r: 255, g: 165, b: 0 },
	};

	if (namedColors[color]) {
		return namedColors[color];
	}

	return null;
};

/**
 * Calculates relative luminance of a color
 * @param {Object} rgb - RGB values {r, g, b}
 * @returns {number} Relative luminance (0-1)
 */
export const getLuminance = (rgb) => {
	if (!rgb) return 0;

	const { r, g, b } = rgb;

	// Convert to sRGB
	const rsRGB = r / 255;
	const gsRGB = g / 255;
	const bsRGB = b / 255;

	// Apply gamma correction
	const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
	const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
	const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

	return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculates contrast ratio between two colors
 * @param {string|Object} color1 - First color
 * @param {string|Object} color2 - Second color
 * @returns {number} Contrast ratio (1-21)
 */
export const getContrastRatio = (color1, color2) => {
	const rgb1 = typeof color1 === 'string' ? parseColor(color1) : color1;
	const rgb2 = typeof color2 === 'string' ? parseColor(color2) : color2;

	if (!rgb1 || !rgb2) return 1;

	const lum1 = getLuminance(rgb1);
	const lum2 = getLuminance(rgb2);

	const lighter = Math.max(lum1, lum2);
	const darker = Math.min(lum1, lum2);

	return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Checks if color combination meets WCAG AA standards
 * @param {string} foreground - Foreground color
 * @param {string} background - Background color
 * @param {boolean} isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns {Object} Compliance result
 */
export const checkWCAGCompliance = (foreground, background, isLargeText = false) => {
	const ratio = getContrastRatio(foreground, background);
	const threshold = isLargeText ? WCAG_THRESHOLDS.AA_LARGE : WCAG_THRESHOLDS.AA_NORMAL;

	return {
		ratio: Math.round(ratio * 100) / 100,
		passesAA: ratio >= threshold,
		passesAAA: ratio >= (isLargeText ? WCAG_THRESHOLDS.AAA_LARGE : WCAG_THRESHOLDS.AAA_NORMAL),
		threshold,
		isLargeText,
	};
};

/**
 * Suggests an accessible color for given background
 * @param {string} background - Background color
 * @param {string} preferredForeground - Preferred foreground color
 * @param {Object} options - Options
 * @returns {string} Suggested accessible color
 */
export const suggestAccessibleColor = (background, preferredForeground = null, options = {}) => {
	const { minContrast = WCAG_THRESHOLDS.AA_NORMAL, darkenAmount = 20 } = options;

	const bgRgb = parseColor(background);
	if (!bgRgb) return '#000000';

	// If preferred color is provided, try to adjust it
	if (preferredForeground) {
		const fgRgb = parseColor(preferredForeground);
		if (fgRgb) {
			const currentRatio = getContrastRatio(bgRgb, fgRgb);
			if (currentRatio >= minContrast) {
				return preferredForeground;
			}

			// Adjust the color to meet contrast
			return adjustColorForContrast(bgRgb, fgRgb, minContrast);
		}
	}

	// Determine if we need a light or dark color
	const bgLuminance = getLuminance(bgRgb);

	if (bgLuminance > 0.5) {
		// Dark background needs light text
		return '#000000';
	} else {
		// Light background needs dark text
		return '#ffffff';
	}
};

/**
 * Adjusts a color to meet contrast requirements
 * @param {Object} bgRgb - Background RGB
 * @param {Object} fgRgb - Foreground RGB
 * @param {number} minContrast - Minimum contrast ratio
 * @returns {string} Adjusted color hex
 */
const adjustColorForContrast = (bgRgb, fgRgb, minContrast) => {
	const bgLuminance = getLuminance(bgRgb);
	let adjustedRgb = { ...fgRgb };

	// Try lightening or darkening
	const isLightBackground = bgLuminance > 0.5;

	for (let i = 0; i < 20; i++) {
		const currentRatio = getContrastRatio(bgRgb, adjustedRgb);

		if (currentRatio >= minContrast) {
			return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
		}

		if (isLightBackground) {
			// Darken the foreground
			adjustedRgb.r = Math.max(0, adjustedRgb.r - 15);
			adjustedRgb.g = Math.max(0, adjustedRgb.g - 15);
			adjustedRgb.b = Math.max(0, adjustedRgb.b - 15);
		} else {
			// Lighten the foreground
			adjustedRgb.r = Math.min(255, adjustedRgb.r + 15);
			adjustedRgb.g = Math.min(255, adjustedRgb.g + 15);
			adjustedRgb.b = Math.min(255, adjustedRgb.b + 15);
		}
	}

	// Fallback to black or white
	return isLightBackground ? '#000000' : '#ffffff';
};

/**
 * Generates accessible color palette from base colors
 * @param {Array} colors - Array of color strings
 * @param {string} background - Background color
 * @returns {Array} Accessible color palette
 */
export const generateAccessiblePalette = (colors, background = '#ffffff') => {
	if (!colors || !Array.isArray(colors)) return [];

	return colors.map(color => {
		const compliance = checkWCAGCompliance(color, background);

		if (compliance.passesAA) {
			return {
				original: color,
				accessible: color,
				compliance,
			};
		}

		const accessibleColor = suggestAccessibleColor(background, color);
		return {
			original: color,
			accessible: accessibleColor,
			compliance: checkWCAGCompliance(accessibleColor, background),
		};
	});
};

/**
 * Pattern definitions for texture alternatives to color
 */
export const PATTERNS = {
	SOLID: 'solid',
	STRIPED: 'striped',
	DOTTED: 'dotted',
	CROSSED: 'crossed',
	DIAGONAL: 'diagonal',
	WAVY: 'wavy',
};

/**
 * Generates SVG pattern for texture fill
 * @param {string} color - Base color
 * @param {string} patternType - Pattern type
 * @param {string} id - Pattern ID
 * @returns {string} SVG pattern string
 */
export const generatePattern = (color, patternType = PATTERNS.SOLID, id = 'pattern') => {
	switch (patternType) {
		case PATTERNS.STRIPED:
			return `
				<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">
					<rect width="8" height="8" fill="${color}"/>
					<path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
				</pattern>
			`;

		case PATTERNS.DOTTED:
			return `
				<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">
					<rect width="8" height="8" fill="${color}"/>
					<circle cx="4" cy="4" r="1.5" fill="rgba(255,255,255,0.5)"/>
				</pattern>
			`;

		case PATTERNS.CROSSED:
			return `
				<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">
					<rect width="8" height="8" fill="${color}"/>
					<path d="M0,0 L8,8 M0,8 L8,0" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
				</pattern>
			`;

		case PATTERNS.DIAGONAL:
			return `
				<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">
					<rect width="8" height="8" fill="${color}"/>
					<path d="M0,8 L8,0" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
				</pattern>
			`;

		case PATTERNS.WAVY:
			return `
				<pattern id="${id}" patternUnits="userSpaceOnUse" width="10" height="8">
					<rect width="10" height="8" fill="${color}"/>
					<path d="M0,4 Q2.5,0 5,4 T10,4" stroke="rgba(255,255,255,0.5)" stroke-width="1" fill="none"/>
				</pattern>
			`;

		case PATTERNS.SOLID:
		default:
			return `
				<pattern id="${id}" patternUnits="userSpaceOnUse" width="4" height="4">
					<rect width="4" height="4" fill="${color}"/>
				</pattern>
			`;
	}
};

/**
 * Generates pattern fills for chart series to distinguish without color
 * @param {Array} colors - Array of colors
 * @param {string} baseId - Base ID for patterns
 * @returns {Object} Pattern configuration for charts
 */
export const generatePatternFills = (colors, baseId = 'chart-pattern') => {
	if (!colors || !Array.isArray(colors)) return { patterns: [], fills: [] };

	const patternTypes = [
		PATTERNS.SOLID,
		PATTERNS.STRIPED,
		PATTERNS.DOTTED,
		PATTERNS.CROSSED,
		PATTERNS.DIAGONAL,
		PATTERNS.WAVY,
	];

	const patterns = [];
	const fills = [];

	colors.forEach((color, index) => {
		const patternType = patternTypes[index % patternTypes.length];
		const patternId = `${baseId}-${index}`;

		patterns.push(generatePattern(color, patternType, patternId));
		fills.push(`url(#${patternId})`);
	});

	return { patterns, fills };
};

/**
 * Validates chart color configuration for accessibility
 * @param {Object} config - Chart configuration
 * @returns {Object} Validation results with suggestions
 */
export const validateChartColors = (config) => {
	const results = {
		valid: true,
		issues: [],
		suggestions: {},
	};

	const backgroundColor = config.backgroundColor || '#ffffff';

	// Check series colors
	if (config.color && Array.isArray(config.color)) {
		config.color.forEach((color, index) => {
			const compliance = checkWCAGCompliance(color, backgroundColor);
			if (!compliance.passesAA) {
				results.valid = false;
				results.issues.push({
					type: 'series-color',
					index,
					color,
					message: `Series color ${color} does not meet WCAG AA contrast requirements (${compliance.ratio}:1)`,
				});

				results.suggestions[`series-${index}`] = suggestAccessibleColor(backgroundColor, color);
			}
		});
	}

	// Check title color
	if (config.title?.textStyle?.color) {
		const titleCompliance = checkWCAGCompliance(config.title.textStyle.color, backgroundColor);
		if (!titleCompliance.passesAA) {
			results.valid = false;
			results.issues.push({
				type: 'title-color',
				color: config.title.textStyle.color,
				message: `Title color does not meet WCAG AA contrast requirements`,
			});
			results.suggestions.title = suggestAccessibleColor(backgroundColor, config.title.textStyle.color);
		}
	}

	// Check axis labels
	if (config.xAxis?.axisLabel?.color) {
		const xAxisCompliance = checkWCAGCompliance(config.xAxis.axisLabel.color, backgroundColor);
		if (!xAxisCompliance.passesAA) {
			results.valid = false;
			results.issues.push({
				type: 'xaxis-color',
				color: config.xAxis.axisLabel.color,
				message: `X-axis label color does not meet WCAG AA contrast requirements`,
			});
		}
	}

	if (config.yAxis?.axisLabel?.color) {
		const yAxisCompliance = checkWCAGCompliance(config.yAxis.axisLabel.color, backgroundColor);
		if (!yAxisCompliance.passesAA) {
			results.valid = false;
			results.issues.push({
				type: 'yaxis-color',
				color: config.yAxis.axisLabel.color,
				message: `Y-axis label color does not meet WCAG AA contrast requirements`,
			});
		}
	}

	return results;
};

/**
 * Applies accessibility fixes to chart configuration
 * @param {Object} config - Original chart configuration
 * @returns {Object} Fixed configuration
 */
export const applyAccessibleColors = (config) => {
	const fixed = { ...config };
	const backgroundColor = config.backgroundColor || '#ffffff';

	const validation = validateChartColors(config);

	// Fix series colors
	if (validation.suggestions) {
		if (fixed.color && Array.isArray(fixed.color)) {
			fixed.color = fixed.color.map((color, index) => {
				return validation.suggestions[`series-${index}`] || color;
			});
		}

		if (validation.suggestions.title && fixed.title?.textStyle) {
			fixed.title.textStyle.color = validation.suggestions.title;
		}
	}

	return fixed;
};

/**
 * Determines if a color is light or dark
 * @param {string} color - Color string
 * @returns {string} 'light' or 'dark'
 */
export const getColorBrightness = (color) => {
	const rgb = parseColor(color);
	if (!rgb) return 'dark';

	const luminance = getLuminance(rgb);
	return luminance > 0.5 ? 'light' : 'dark';
};

/**
 * Gets contrasting text color for a background
 * @param {string} background - Background color
 * @returns {string} '#000000' or '#ffffff'
 */
export const getContrastingTextColor = (background) => {
	return getColorBrightness(background) === 'light' ? '#000000' : '#ffffff';
};

export default {
	WCAG_THRESHOLDS,
	hexToRgb,
	rgbToHex,
	parseColor,
	getLuminance,
	getContrastRatio,
	checkWCAGCompliance,
	suggestAccessibleColor,
	generateAccessiblePalette,
	PATTERNS,
	generatePattern,
	generatePatternFills,
	validateChartColors,
	applyAccessibleColors,
	getColorBrightness,
	getContrastingTextColor,
};
