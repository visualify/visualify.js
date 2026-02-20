/**
 * @fileoverview Visual Editor Command for Visualify CLI
 * @module cli/commands/edit
 *
 * Starts the visual configuration editor for creating and editing
 * Visualify configurations without writing JSON.
 */

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const http = require('http');
const logger = require('../utils/logger');

/**
 * Default port for the editor server
 * @readonly
 */
const DEFAULT_PORT = 3456;

/**
 * Default host for the editor server
 * @readonly
 */
const DEFAULT_HOST = 'localhost';

/**
 * HTML template for the editor page
 */
const EDITOR_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visualify Editor</title>
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
        crossorigin="anonymous"
    />
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        #root {
            height: 100vh;
            width: 100vw;
        }
        .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading-screen">
            <div class="loading-spinner"></div>
            <h3>Loading Visualify Editor...</h3>
            <p>Please wait while the editor initializes</p>
        </div>
    </div>
    <script>
        // Embedded editor configuration
        window.VISUALIFY_EDITOR_CONFIG = {{EDITOR_CONFIG}};
    </script>
    <script src="/editor/static/js/editor.js"></script>
</body>
</html>`;

/**
 * Serve static file
 * @param {http.ServerResponse} res - Response object
 * @param {string} filePath - Path to file
 * @param {string} contentType - MIME type
 */
function serveStaticFile(res, filePath, contentType) {
    try {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        res.writeHead(404);
        res.end('Not found');
    }
}

/**
 * Load configuration from file
 * @param {string} filePath - Path to config file
 * @returns {Object|null} Loaded configuration
 */
function loadConfigFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        logger.warn(`Failed to load config file: ${error.message}`);
        return null;
    }
}

/**
 * Create the editor server
 * @param {Object} options - Server options
 * @param {number} options.port - Server port
 * @param {string} options.host - Server host
 * @param {string|null} options.configFile - Path to config file
 * @returns {http.Server}
 */
function createEditorServer(options) {
    const { port, host, configFile } = options;

    // Load config if specified
    let editorConfig = {
        version: '3.0.0',
        charts: [],
        layout: { type: 'grid', rows: 1, cols: 1, gap: '10px' },
        theme: 'modern',
    };

    if (configFile) {
        const loadedConfig = loadConfigFile(configFile);
        if (loadedConfig) {
            editorConfig = { ...editorConfig, ...loadedConfig };
            logger.success(`Loaded configuration from ${configFile}`);
        }
    }

    const server = http.createServer((req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${host}:${port}`);
        const pathname = url.pathname;

        // Main editor page
        if (pathname === '/' || pathname === '/editor') {
            const html = EDITOR_HTML_TEMPLATE.replace(
                '{{EDITOR_CONFIG}}',
                JSON.stringify(editorConfig).replace(/</g, '\\u003c')
            );
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
            return;
        }

        // Static assets - editor bundle
        if (pathname === '/editor/static/js/editor.js') {
            const editorJsPath = path.join(__dirname, '../../../editor/static/js/editor.js');
            if (fs.existsSync(editorJsPath)) {
                serveStaticFile(res, editorJsPath, 'application/javascript');
            } else {
                // Return placeholder if bundle doesn't exist yet
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(`
                    // Visualify Editor Bundle
                    // This is a placeholder. In production, this would be the compiled editor bundle.
                    console.log('Visualify Editor loaded');

                    // Simple editor implementation for demo
                    const root = document.getElementById('root');
                    const config = window.VISUALIFY_EDITOR_CONFIG || {};

                    root.innerHTML = \`
                        <div style="padding: 20px; font-family: sans-serif;">
                            <h1>Visualify Editor</h1>
                            <p>Configuration loaded with \${config.charts?.length || 0} charts</p>
                            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px;">
                                <pre style="margin: 0; overflow: auto;">\${JSON.stringify(config, null, 2)}</pre>
                            </div>
                            <p style="margin-top: 20px; color: #666;">
                                <strong>Note:</strong> This is a development preview.
                                The full editor requires building the React application.
                            </p>
                        </div>
                    \`;
                `);
            }
            return;
        }

        // API endpoints
        if (pathname === '/api/config') {
            if (req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(editorConfig));
                return;
            }

            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const newConfig = JSON.parse(body);
                        Object.assign(editorConfig, newConfig);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
                return;
            }
        }

        // 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    });

    return server;
}

/**
 * Open browser
 * @param {string} url - URL to open
 */
function openBrowser(url) {
    const { exec } = require('child_process');
    const platform = process.platform;

    let command;
    switch (platform) {
        case 'darwin':
            command = `open "${url}"`;
            break;
        case 'win32':
            command = `start "" "${url}"`;
            break;
        default:
            command = `xdg-open "${url}"`;
    }

    exec(command, (error) => {
        if (error) {
            logger.debug('Failed to open browser:', error.message);
        }
    });
}

/**
 * Execute the edit command
 * @param {string|null} configFile - Path to config file
 * @param {Object} options - Command options
 * @param {number} options.port - Server port
 * @param {string} options.host - Server host
 * @param {boolean} options.open - Whether to open browser
 * @returns {Promise<void>}
 */
async function executeEdit(configFile, options) {
    try {
        const port = parseInt(options.port, 10) || DEFAULT_PORT;
        const host = options.host || DEFAULT_HOST;
        const shouldOpen = options.open !== false;

        logger.header('Visualify Editor');
        logger.info('Starting visual configuration editor...');

        // Validate config file if provided
        if (configFile && !fs.existsSync(configFile)) {
            logger.warn(`Config file not found: ${configFile}`);
            logger.tip('Starting with default configuration');
            configFile = null;
        }

        // Create and start server
        const server = createEditorServer({ port, host, configFile });

        server.listen(port, host, () => {
            const url = `http://${host}:${port}`;

            logger.success('Editor server started');
            logger.newline();
            logger.info(`Local:   ${url}`);
            logger.info(`Network: http://${require('os').networkInterfaces()['en0']?.[0]?.address || host}:${port}`);
            logger.newline();

            if (configFile) {
                logger.info(`Editing: ${path.resolve(configFile)}`);
            } else {
                logger.info('Editing: New configuration');
            }

            logger.newline();
            logger.tip('Press Ctrl+C to stop the server');
            logger.newline();

            // Open browser
            if (shouldOpen) {
                setTimeout(() => {
                    openBrowser(url);
                }, 1000);
            }
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${port} is already in use`);
                logger.tip(`Try a different port with: visualify edit --port ${port + 1}`);
            } else {
                logger.error('Server error:', error.message);
            }
            process.exit(1);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            logger.newline();
            logger.info('Shutting down editor server...');
            server.close(() => {
                logger.success('Server stopped');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Failed to start editor:', error.message);
        logger.debug('Stack trace:', error.stack);
        process.exit(1);
    }
}

/**
 * Create and configure the edit command
 * @returns {Command} The configured command
 */
function createEditCommand() {
    const command = new Command('edit')
        .description('Start the visual configuration editor')
        .argument('[file]', 'Configuration file to edit (optional)')
        .option('-p, --port <number>', 'Port to run the editor on', String(DEFAULT_PORT))
        .option('-h, --host <host>', 'Host to bind the server to', DEFAULT_HOST)
        .option('--no-open', 'Do not open browser automatically')
        .action(executeEdit);

    // Add alias 'editor' for convenience
    command.alias('editor');

    return command;
}

module.exports = {
    createEditCommand,
    executeEdit,
    DEFAULT_PORT,
    DEFAULT_HOST,
};
