/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-01 12:28:29
 * @FilePath     : /visualifyjs/src/core/fetch/json.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
function fetchJson(jsonFileName, externalURL) {
	let jsonUrl;
	if (externalURL) {
		jsonUrl = externalURL;
	} else {
		jsonUrl = `./${jsonFileName}.json`;
	}

	return fetch(jsonUrl).then((response) => {
		if (!response.ok) {
			throw new Error(`Failed to fetch JSON for ${jsonFileName}`);
		}
		if (
			!response.headers.get('content-type')?.includes('application/json')
		) {
			throw new TypeError('Response not in JSON format');
		}
		return response.json();
	});
}

export default fetchJson;
