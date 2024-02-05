/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-04 12:47:02
 * @FilePath     : /visualifyjs/src/core/router/alias.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import { Navigate, useLocation } from 'react-router-dom';

const AliasRoute = ({ alias, children }) => {
	const location = useLocation();

	for (const pattern in alias) {
		const regex = new RegExp(pattern);
		if (regex.test(location.pathname)) {
			const target = alias[pattern];

			// Check if the target is defined and is a string
			if (typeof target === 'string') {
				// Check if target is a URL or a path
				if (
					target.startsWith('http://') ||
					target.startsWith('https://')
				) {
					window.location.href = target;
					return null;
				}

				// Redirect to the matched route
				const newPath = location.pathname.replace(regex, target);
				return (
					<Navigate
						to={newPath}
						replace
					/>
				);
			} else {
				console.error(
					`Alias target for pattern '${pattern}' is not defined or not a string.`,
				);
				continue; // Skip to the next pattern
			}
		}
	}

	return children;
};

export default AliasRoute;
