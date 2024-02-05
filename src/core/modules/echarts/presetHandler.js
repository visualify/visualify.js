/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-02 21:36:01
 * @FilePath     : /visualifyjs/src/core/modules/echarts/presetHandler.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
// presetHandler.js
import minimumPreset from './common';
import mmtrbc from './presets/mmtrbc';
import esodev_chromium from './presets/esodev.chromium';
import esodev_codex from './presets/esodev.codex';
import esodev_visium from './presets/esodev.visium';

// Example embedded presets
const embeddedPresets = {
	mmtrbc: mmtrbc,
	esodev_chromium: esodev_chromium,
	esodev_codex: esodev_codex,
	esodev_visium: esodev_visium,
	// 'presetName': { ...preset data... }
	// Define embedded presets here
};

// Function to fetch preset data from a URL
export const fetchPresetFromURL = async (url) => {
	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching preset from URL:', error);
		return null; // Return null or appropriate error handling
	}
};

// Function to get an embedded preset based on a string key
export const getEmbeddedPreset = (presetKey) => {
	// Return minimumPreset if preset not found
	return embeddedPresets[presetKey] || minimumPreset;
};
