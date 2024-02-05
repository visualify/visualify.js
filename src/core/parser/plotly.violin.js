/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2024-01-14 16:20:14
 * @FilePath     : /visualifyjs/src/core/parser/plotly.violin.js
 * @Description  :
 * Copyright (c) 2024 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */

export const handle_violin_plot = (processed_data) => {
	const plotlyData = processed_data.map((item) => {
		return {
			type: item.type,
			y: item.data.map((d) => d.value[2]),
			name: item.name,
		};
	});
	return plotlyData;
};
