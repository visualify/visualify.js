/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-14 14:54:27
 * @FilePath     : /visualifyjs/src/core/modules/replotly/presetHandler.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */

import minimumPreset from './presets/minimum';
import mmtrbc_violin from './presets/mmtrbc.violin';
import mmtrbc_dot from './presets/mmtrbc.dot';

// Example embedded presets
const embeddedPresets = {
	mmtrbc_violin,
	mmtrbc_dot,
	// 'presetName': { ...preset data... }
	// Define embedded presets here
};

export const getPreset = (presetKey) => {
	// Return minimumPreset if preset not found
	return embeddedPresets[presetKey] || minimumPreset;
};
