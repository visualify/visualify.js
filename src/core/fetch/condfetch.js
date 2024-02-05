/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-27 17:34:06
 * @FilePath     : /visualifyjs/src/core/fetch/condfetch.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import fetchApi from './vfetch';
import { isEmpty } from 'lodash';

const conditionalFetch = async (
	source,
	sharedData,
	title,
	visualify = {},
	body = null,
) => {
	const {
		name,
		method = 'GET',
		url,
		responseKey,
		mapping: api_mapping = visualify?.api_mapping ?? {},
		trigger,
	} = source;

	if (!name) throw new Error('name is required for api sources');
	if (!url) throw new Error('url is required for api sources');

	if (Array.isArray(trigger)) {
		// Handle complex trigger configurations
		const triggerValues = trigger.map((triggerItem) => {
			const triggerValue =
				sharedData[triggerItem.name] || sharedData[triggerItem];
			if (triggerItem.title && title) title.text = triggerValue;

			return triggerValue !== undefined &&
				triggerValue !== null &&
				triggerValue !== '' &&
				!isEmpty(triggerValue)
				? api_mapping?.[triggerValue] || triggerValue
				: null;
		});

		if (triggerValues.some((val) => val === null)) {
			// If any trigger value is not available, skip this source
			return null;
		}

		// Replace multiple {trigger} placeholders in the URL with trigger values
		let finalUrl = url;
		triggerValues.forEach((triggerValue) => {
			finalUrl = finalUrl.replace('{trigger}', triggerValue);
		});

		const response = await fetchApi(finalUrl, method, body, {}, true);

		return responseKey ? response[responseKey] : response;
	} else if (trigger) {
		// Handle simple string trigger
		const triggerValue = sharedData[trigger.name] || sharedData[trigger];

		if (
			triggerValue !== undefined &&
			triggerValue !== null &&
			triggerValue !== '' &&
			!isEmpty(triggerValue)
		) {
			if (trigger.title && title) title.text = triggerValue;
			const triggerVal = api_mapping?.[triggerValue] || triggerValue;
			const finalUrl = url.replace('{trigger}', triggerVal);

			const response = await fetchApi(finalUrl, method, null, {}, true);
			return responseKey ? response[responseKey] : response;
		}
	} else {
		const response = await fetchApi(url, method, null, {}, true);
		return responseKey ? response[responseKey] : response;
	}
};

export default conditionalFetch;
