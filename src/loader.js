/**
 * Visualify.js CDN Loader
 *
 * Lightweight bootstrap script that auto-loads required CDN dependencies
 * (echarts, plotly) before loading the main visualify.js bundle.
 * Three.js is bundled with visualify.js and doesn't need separate CDN loading.
 *
 * Usage — replace the manual CDN <script> tags + visualify.js with just:
 *   <script src="visualify-loader.js"></script>
 *
 * The loader will:
 * 1. Detect which globals are already available (skip if loaded)
 * 2. Load missing dependencies from CDN in parallel
 * 3. Load visualify.js after all deps are ready
 * 4. Initialize normally via window.$visualify
 */
(function () {
	'use strict';

	// CDN dependency definitions
	// Each entry: [globalName, cdnUrl, optional?]
	var CDN_DEPS = [
		['echarts', 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js', false],
		['echartsGL', 'https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js', true],
		['Plotly', 'https://cdn.plot.ly/plotly-2.27.0.min.js', true],
	];

	/**
	 * Load a single script from URL, returns a Promise
	 */
	function loadScript(url) {
		return new Promise(function (resolve, reject) {
			var script = document.createElement('script');
			script.src = url;
			script.async = true;
			script.onload = resolve;
			script.onerror = function () {
				// Don't reject — graceful degradation for optional deps
				console.warn('[Visualify Loader] Failed to load: ' + url);
				resolve();
			};
			document.head.appendChild(script);
		});
	}

	/**
	 * Resolve the path to visualify.js relative to this loader script
	 */
	function resolveVisualilyPath() {
		var scripts = document.getElementsByTagName('script');
		for (var i = scripts.length - 1; i >= 0; i--) {
			var src = scripts[i].src || '';
			if (src.indexOf('visualify-loader') !== -1) {
				// Same directory as loader
				return src.replace(/visualify-loader[^/]*\.js.*$/, 'visualify.js');
			}
		}
		// Fallback: assume same directory
		return './visualify.js';
	}

	/**
	 * Main loader logic
	 */
	function boot() {
		var promises = [];

		CDN_DEPS.forEach(function (dep) {
			var globalName = dep[0];
			var url = dep[1];
			var optional = dep[2];

			// Skip if global already exists (user loaded it manually)
			if (window[globalName]) {
				return;
			}

			// Skip optional deps if user opts out via config
			if (optional && window.$visualify && window.$visualify.skip) {
				var skip = window.$visualify.skip;
				if (Array.isArray(skip) && skip.indexOf(globalName.toLowerCase()) !== -1) {
					return;
				}
			}

			promises.push(loadScript(url));
		});

		// After all CDN deps loaded, load visualify.js
		Promise.all(promises).then(function () {
			return loadScript(resolveVisualilyPath());
		}).then(function () {
			// visualify.js self-initializes via window.$visualify
		});
	}

	// Ensure DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
