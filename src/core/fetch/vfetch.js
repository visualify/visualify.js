/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-21 16:49:22
 * @FilePath     : /visualifyjs/src/core/fetch/vfetch.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
const fetchApi = async (
	url,
	method = 'GET',
	body = null,
	headers = {},
	debug = false,
) => {
	// Setup for CORS and headers
	let fetchOptions = {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		mode: debug ? 'cors' : 'same-origin',
	};

	// Add body for POST request
	if (method === 'POST' && body) {
		fetchOptions.body = JSON.stringify(body);
	}

	try {
		const response = await fetch(url, fetchOptions);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (err) {
		console.error('Fetch API Error:', err);
		throw err;
	}
};

export default fetchApi;
