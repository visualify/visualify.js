/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-09-22 21:19:16
 * @FilePath     : /visualifyjs/src/core/fetch/fetch.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */

const MAX_CACHE_SIZE = 512 * 1024 * 1024; // 512MB

const cache = {};
const lruOrder = [];

// Function to manage the cache size and eviction
const manageCache = (cacheKey, data) => {
	// Add the cacheKey to the LRU order
	lruOrder.push(cacheKey);

	// Check if the cache size exceeds the maximum limit
	let currentCacheSize = 0;
	for (const key of lruOrder) {
		if (cache[key]) {
			currentCacheSize += JSON.stringify(cache[key]).length;
		}
		if (currentCacheSize > MAX_CACHE_SIZE) {
			// Remove the least recently used item from the cache and the LRU order
			const lruKey = lruOrder.shift();
			delete cache[lruKey];
		}
	}

	// Cache the data
	cache[cacheKey] = data;
};

const simplefetch = async (url, options = {}) => {
	const { id = undefined, type, key, debug = false, bbox = {} } = options;
	const hasBbox = Object.keys(bbox).length > 0;
	const cacheKey = hasBbox ? `${id}_${JSON.stringify(bbox)}` : `${id}_nobbox`;

	if (cache[cacheKey]) {
		if (debug) console.warn('simplefetch: cache hit ', cacheKey);
		return cache[cacheKey];
	}

	if (typeof url === 'object') {
		if (id && id !== '') return url[id] ?? {};
		else return url;
	} else if (typeof url === 'string') {
		let result = {};
		if (type && type === 'gene' && (id === '' || id === undefined))
			return {};
		if (type && (type === 'gene' || type === 'metadata') && id && id !== '')
			url += (url.charAt(url.length - 1) === '/' ? '' : '/') + id;
		if (type && type === 'metadata' && id && id !== '' && hasBbox) {
			const { xMin, yMin, xMax, yMax } = bbox;
			url += `/${xMin}/${yMin}/${xMax}/${yMax}`;
			//console.log('simplefetch: url', url);
		}

		//console.log("simplefetch: fetch url", url);
		const res = await fetch(url, debug ? { mode: 'cors' } : {}); // using await here
		//console.log("simplefetch: fetch res", res);

		if (res.ok) {
			const data = await res.json(); // using await here
			if (data.code === 200) {
				if (key) {
					result = data[key];
				} else if (type === 'metadata') result = data.metadata;
				else if (type === 'gene') result = data.gene;
				else if (type === 'image') result = data.image;
				else result = data;

				// When caching data, use the manageCache function
				if (id && !cache[cacheKey]) {
					manageCache(cacheKey, result);
				}

				if (debug) console.log('simplefetch: fetch success', result);
			} else console.error('simplefetch: fetch failed', data.code, data.msg);
		} else console.error('simplefetch: fetch error', res);

		//console.log("simplefetch: after fetch", result);
		return result;
	} else {
		console.error('Unsupported type or Invalid url:', url);
		return {};
	}
};

export default simplefetch;
