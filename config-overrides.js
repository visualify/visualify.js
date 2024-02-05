/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 15:39:38
 * @FilePath     : /visualifyjs/config-overrides.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let jsChunkCounter = -1;
let cssChunkCounter = -1;

module.exports = function override(config, env) {
	if (env === 'production') {
		// Change output filenames for the production build
		config.output.filename = 'static/js/visualify.js';
		config.output.chunkFilename = () =>
			`static/js/visualify.chunk${jsChunkCounter++}.js`;

		// Update MiniCssExtractPlugin filename and chunkFilename
		const miniCssExtractPlugin = config.plugins.find(
			(plugin) => plugin.constructor.name === 'MiniCssExtractPlugin',
		);
		if (miniCssExtractPlugin) {
			miniCssExtractPlugin.options.filename = 'static/css/visualify.css';
			miniCssExtractPlugin.options.chunkFilename = () =>
				`static/css/visualify.chunk${cssChunkCounter++}.css`;
		}
	}
	return config;
};
