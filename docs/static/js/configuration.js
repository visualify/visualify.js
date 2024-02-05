// variableName (Type) | Default: defaultValue | Brief description
/*  variableName (Type) 
    Default: defaultValue
    Brief description
*/

config = {};

// ====================================== Basic ======================================

// name (String) | Website name in the sidebar, can include custom HTML for customization
config.name = 'visualify.js';

// repo (String) | Configure repository URL or username/repo for GitHub Corner widget in the top right corner
config.repo = 'https://github.com/visualify/';

/*
config.corner = {
  // the icon link url to another site
  url: "https://github.com/usleolihao",
  // the default preset icon in docsify-corner
  //icon: "static/avatar/corner-unscreen.gif",
  //background: "#091a28",
  //width: 50,
  //height: 50,
};
*/

/*  auto2top (Boolean) 
    Default: false 
    Scrolls to the top when the route is changed
*/
config.auto2top = true;

// basePath (String) | Base path of the website. You can set it to another directory or another domain name.
config.basePath = 'https://visualify.github.io/visualify.js/docs/';

// autoHeader (Boolean) | Default: false | prepend a header to the page before converting it to HTML.
config.autoHeader = false;

// catchPluginErrors (Boolean) | Default: true | prevent plugin errors from affecting docsify
config.catchPluginErrors = true;

/*  coverpage (Boolean|String|String[]|Object) 
    Default: false
    Activate the cover feature. If true, it will load from _coverpage.md.
*/
config.coverpage = true;

// el (String) | Default: '#app' | The DOM element to be mounted on initialization.
config.el = '#docsify';

/*  executeScript (Boolean) 
    Default: null
    Execute the script on the page. Only parses the first script tag (demo). 
    If Vue is detected, this is true by default.
    <script>
        console.log(2333)
    </script>
*/
config.executeScript = true;

/*  formatUpdated (String|Function) 
    Default: null
    display the file update date through {docsify-updated} variable.
    window.$docsify = {
        formatUpdated: '{MM}/{DD} {HH}:{mm}',

        formatUpdated: function (time) {
            // ...

            return time;
        },
    };
*/
config.formatUpdated =
	'<hr>\
<footer><strong>Last modified</strong>: {MM}/{DD}/{YYYY} {HH}:{mm} <br>\
    <div style="text-align: center;margin-top: 50px;">\
        <span>Fluff & Stuff</a> © 2023. Power by <a href="https://docsify.js.org/#/" target="_blank">docsify</a></span>\
    </div>\
</footer>';

// homepage (String) | Default: 'README.md' | serve another file as homepage
// config.homepage = "home.md"

// loadNavbar (Boolean|String) | Default: false | Loads navbar from _navbar.md if true, else from specified path
config.loadNavbar = false;

// logo (String) | Website logo in the sidebar, can be resized using CSS
config.logo = './static/logo/logo_128x128.png';

// maxLevel (Number) | Default: 6 | Maximum Table of Contents level
config.maxLevel = 3;

// mergeNavbar (Boolean) | Default: false | Navbar merges with the sidebar on smaller screens
config.mergeNavbar = true;

// noCompileLinks (Array<string>) | Skips compiling of specified links using regex patterns
config.noCompileLinks = ['/_media/', '/_social/'];

// noEmoji (Boolean) | Default: false | Disables emoji parsing and renders all emoji shorthand as text
config.noEmoji = false;

// notFoundPage (Boolean | String | Object) | Default: false | Configures 404 page display or custom 404 page path
config.notFoundPage = true;

// onlyCover (Boolean) | Default: false | Only cover page is loaded when visiting the home page
config.onlyCover = false;

// relativePath (Boolean) | Default: false | If true, links are relative to the current context
config.relativePath = true;

// routerMode (String) | Default: 'hash' | Set router mode for navigation, can be 'hash' or 'history'
config.routerMode = 'hash';

// loadSidebar (Boolean|String) | Default: false | Loads sidebar from _sidebar.md if true, else from specified path
config.loadSidebar = true;

// subMaxLevel (Number) | Default: 0 | Add table of contents
// 自定义侧边栏后默认不会再生成目录，你也可以通过设置生成目录的最大层级开启这个功能。
config.subMaxLevel = 2;
// set sidebar display level
config.sidebarDisplayLevel = 3;

// ====================================== Theme ======================================

// themeColor (String) | Customize theme color using CSS3 variables feature and polyfill in older browsers
config.themeColor = '#3F51B5';

// topMargin (Number) | Default: 0 | Add space on top when scrolling content page to align anchors with sticky-header
config.topMargin = 90;

// ====================================== Router ======================================

config.alias = {
	'/.*/_navbar.md': '/_navbar.md',
	'/.*/_sidebar.md': '/_sidebar.md',
	// "/_contents/fluffy/_sidebar.md"
	// "/_projs/_IoT/_sidebar.md"
};

// routes (Object) | Define virtual routes for dynamic content, map path to string or function returning markdown
config.routes = {
	// ... existing routes ...
	// Basic match w/ return string
	'/foo': '# Custom Markdown',
	// RegEx match w/ synchronous function
	'/bar/(.*)': function (route, matched) {
		return '# Custom Markdown bar ' + matched[1];
	},
	// RegEx match w/ asynchronous function
	'/baz/(.*)': function (route, matched, next) {
		// Requires `fetch` polyfill for legacy browsers (https://github.github.io/fetch/)
		fetch('/api/users?id=12345')
			.then(function (response) {
				next(
					'# Custom Markdown baz\n' +
						matched[1] +
						' ' +
						response.json(),
				);
			})
			.catch(function (err) {
				// Handle error...
			});
	},
	// accepts everything other than dogs (synchronous)
	'/pets/(.+)': function (route, matched) {
		if (matched[0] === 'dogs') {
			return null;
		} else {
			return 'I like all pets but dogs';
		}
	},

	// accepts everything other than cats (asynchronous)
	'/pets/(.*)': function (route, matched, next) {
		if (matched[0] === 'cats') {
			next();
		} else {
			// Async task(s)...
			next('I like all pets but cats');
		}
	},

	// explicit false value to load real markdown file
	'/petss/cats': function (route, matched) {
		return false;
	},

	// generate dynamic content for other pets
	'/petss/(.+)': function (route, matched) {
		const pet = matched[0];
		return `your pet is ${pet} (but not a cat)`;
	},
};

// ====================================== Markdown ======================================

// markdown (Function) | Allows Markdown configuration and customization
config.debug = false;

config.markdown = {
	renderer: {
		code: function (code, lang) {
			if (typeof lang === 'string' && lang.startsWith('output')) {
				const conf = lang.split(',');
				let oconf = {};
				// iterate over the rest of the elements
				for (let i = 0; i < conf.length; i++) {
					//skip if not a key-value pair
					if (conf[i].indexOf('=') === -1) continue;
					// split the element into key and value
					const [key, value] = conf[i].split('=');
					// set the key-value pair in the config object
					oconf[key] = value;
				}
				if (config.debug) {
					console.log(oconf);
				}

				// add line numbers if linenums attribute is true
				if (oconf.linenums === 'true') {
					let lines = code.split(/(?:<br>)|(?:\n)/);
					for (let i = 0; i < lines.length; i++) {
						lines[i] = i + 1 + ': ' + lines[i];
					}
					code = lines.join('<br>');
				}

				return (
					'<div class="terminal">' +
					'<div class="terminal-fakeMenu">' +
					'<div class="terminal-fakeButtons terminal-fakeClose"></div>' +
					'<div class="terminal-fakeButtons terminal-fakeMinimize"></div>' +
					'<div class="terminal-fakeButtons terminal-fakeZoom"></div>' +
					'<span> ' +
					(oconf.title ?? 'Output') +
					' </span>' +
					'</div>' +
					'<div class="terminal-fakeScreen">' +
					'<output data-lang="output">' +
					code +
					'</output>' +
					'</div>' +
					'</div>'
				);
			} else if (lang === 'mermaid') {
				//console.log("mermaid", this, arguments[0], arguments[1]);
				return (
					'<div class="fsmermaid">' +
					this.origin.code.apply(this, arguments) +
					'</div>'
				);
			}
			return this.origin.code.apply(this, arguments);
		},
	},
};

// ====================================== Cross Origin Links ======================================

// crossOriginLinks (Array) | Default: true | prevent plugin errors from affecting docsify
config.crossOriginLinks = [
	// 'https://example.com/cross-origin-link'
];

/* requestHeaders (Object) 
   Set request resource headers for custom configurations, e.g., caching
    requestHeaders: {
        'x-token': 'xxx', //设置请求头
        'cache-control': 'max-age=600', //设置缓存
    },
*/
config.requestHeaders = {};

// ====================================== Vue ======================================

/*  vueComponents (Object) 
    Creates and registers global Vue components with unique data per instance
    Components are specified using the component name as the key with an object containing Vue options as the value.
    Component data is unique for each instance and will not persist as users navigate the site.
*/
config.vueComponents = {
	'button-counter': {
		template: `
        <button @click="count += 1">
          You clicked me {{ count }} times
        </button>
      `,
		data() {
			return { count: 0 };
		},
	}, // <button-counter></button-counter>
};

// vueGlobalOptions (Object) | Specifies Vue options for global content, changes persist across global references
config.vueGlobalOptions = {
	data() {
		return {
			version: '1.0.0',
		};
	},
};

// vueMounts (Object) | Specifies DOM elements to mount as Vue instances with unique data per instance
config.vueMounts = {
	'#counter': {
		data() {
			return { count: 0 };
		},
	},
};
// ====================================== Plugins ======================================

// ~~~~~~~~~~~~~~~~~~~~~ sidebarbar ~~~~~~~~~~~~~~~~~~~~~~
config.sidebarbar = {
	showVersion: true,
};

// ~~~~~~~~~~~~~~~~~~~~~ Search ~~~~~~~~~~~~~~~~~~~~~~
/*  search (String|String[]|Object) 
    Default: false
    Usage:

    config. = 'auto'; //default 

    config.search = [
        '/',            // => /README.md
        '/guide',       // => /guide.md
        '/get-started', // => /get-started.md
        '/zh-cn/',      // => /zh-cn/README.md
    ]
*/
// complete configuration parameters
config.search = {
	maxAge: 86400000, // Expiration time, the default one day
	paths: 'auto', // or 'auto'
	placeholder: 'Type to search',
	// Localization
	noData: 'No Results!',
	// Headline depth, 1 - 6
	depth: 5,

	hideOtherSidebarContent: false, // whether or not to hide other sidebar content

	// To avoid search index collision
	// between multiple websites under the same domain
	namespace: 'fluff',

	// Use different indexes for path prefixes (namespaces).
	// NOTE: Only works in 'auto' mode.
	//
	// When initialiazing an index, we look for the first path from the sidebar.
	// If it matches the prefix from the list, we switch to the corresponding index.
	pathNamespaces: ['/zh-cn', '/ru-ru', '/ru-ru/v1'],

	// You can provide a regexp to match prefixes. In this case,
	// the matching substring will be used to identify the index
	pathNamespaces: /^(\/(zh-cn|ru-ru))?(\/(v1|v2))?/,

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Custom search ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

	// exclude (Stirng("\.html$")|String[]) | Default: '' | Exclude files from search index (.html means exclude all html files)
	exclude: ['.html', '.png', '.zip'],
	// debug (Boolean) | Default: false | Enable debug mode
	debug: false,
};

/*  docsify-copy-code 
    A docsify plugin that adds a button to easily copy code blocks to your clipboard.
    <script src="https://unpkg.com/docsify-copy-code@2"></script>
    copyCode: {
        buttonText : 'Copy to clipboard',
        errorText  : 'Error',
        successText: 'Copied'
    }

    copyCode: {
        buttonText: {
        '/zh-cn/': '点击复制',
        '/'      : 'Copy to clipboard'
        },
        errorText: {
        '/zh-cn/': '错误',
        '/'      : 'Error'
        },
        successText: {
        '/zh-cn/': '复制',
        '/'      : 'Copied'
        }
    }
*/
config.copyCode = {
	buttonText: 'Copy to clipboard',
	errorText: 'Error',
	successText: 'Copied',
};

// https://jhildenbiddle.github.io/docsify-tabs/
config.tabs = {
	persist: true, // default
	sync: true, // default
	theme: 'Material', // Classic/material/No Theme
	tabComments: true, // default
	tabHeadings: true, // default
};

config.latex = {
	inlineMath: [
		['$', '$'],
		['\\(', '\\)'],
	], // default
	displayMath: [['$$', '$$']], // default
};

config['flexible-alerts'] = {
	style: 'callout',
	note: {
		label: {
			'/zh-cn/': '提示',
			'/': 'Note',
		},
	},
	tip: {
		label: {
			'/zh-cn/': '小窍门',
			'/': 'Tip',
		},
	},
	warning: {
		label: {
			'/zh-cn/': '注意',
			'/': 'Warning',
		},
	},
	attention: {
		label: {
			'/zh-cn/': '警告',
			'/': 'Attention',
		},
	},
};

config.mermaidConfig = {
	querySelector: '.mermaid',
};
