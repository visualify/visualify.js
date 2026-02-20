/**
 * @fileoverview Colored logging utility for Visualify CLI with i18n support
 * @module cli/utils/logger
 */

const chalk = require('chalk');

// Simple i18n for CLI (Node.js compatible)
let currentLocale = 'en';
const translations = {};

/**
 * Load translations for a locale
 * @param {string} locale - Locale code
 * @param {Object} messages - Translation messages
 */
function loadTranslations(locale, messages) {
  translations[locale] = { ...translations[locale], ...messages };
}

/**
 * Set the current locale for CLI messages
 * @param {string} locale - Locale code
 */
function setLocale(locale) {
  currentLocale = locale;
}

/**
 * Get the current locale
 * @returns {string} Current locale code
 */
function getLocale() {
  return currentLocale;
}

/**
 * Translate a key with optional interpolation
 * @param {string} key - Translation key
 * @param {Object} params - Interpolation parameters
 * @returns {string} Translated string
 */
function t(key, params = {}) {
  const messages = translations[currentLocale] || translations['en'] || {};
  let message = key.split('.').reduce((obj, k) => obj?.[k], messages) || key;

  // Simple interpolation: {key} -> value
  Object.keys(params).forEach((param) => {
    message = message.replace(new RegExp(`{${param}}`, 'g'), params[param]);
  });

  return message;
}

// Load default English translations
loadTranslations('en', {
  cli: {
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
    success: 'success',
    tip: 'tip',
  },
});

loadTranslations('zh', {
  cli: {
    debug: '调试',
    info: '信息',
    warn: '警告',
    error: '错误',
    success: '成功',
    tip: '提示',
  },
});

loadTranslations('es', {
  cli: {
    debug: 'depurar',
    info: 'info',
    warn: 'advertencia',
    error: 'error',
    success: 'éxito',
    tip: 'consejo',
  },
});

loadTranslations('de', {
  cli: {
    debug: 'debug',
    info: 'info',
    warn: 'warnung',
    error: 'fehler',
    success: 'erfolg',
    tip: 'tipp',
  },
});

/**
 * Log level constants
 * @readonly
 * @enum {number}
 */
const LOG_LEVELS = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
	SUCCESS: 4,
};

/**
 * Current log level (can be overridden by --verbose flag)
 * @type {number}
 */
let currentLogLevel = LOG_LEVELS.INFO;

/**
 * Set the minimum log level for output
 * @param {number} level - The log level to set
 */
function setLogLevel(level) {
	currentLogLevel = level;
}

/**
 * Enable verbose/debug mode
 */
function enableVerbose() {
	currentLogLevel = LOG_LEVELS.DEBUG;
}

/**
 * Check if a message should be logged based on current level
 * @param {number} level - The level of the message
 * @returns {boolean} Whether the message should be logged
 */
function shouldLog(level) {
	return level >= currentLogLevel;
}

/**
 * Print a debug message (gray)
 * @param {...any} args - Messages to log
 */
function debug(...args) {
	if (!shouldLog(LOG_LEVELS.DEBUG)) return;
	console.log(chalk.gray(`[${t('cli.debug')}]`), ...args);
}

/**
 * Print an info message (cyan)
 * @param {...any} args - Messages to log
 */
function info(...args) {
	if (!shouldLog(LOG_LEVELS.INFO)) return;
	console.log(chalk.cyan(`[${t('cli.info')}]`), ...args);
}

/**
 * Print a warning message (yellow)
 * @param {...any} args - Messages to log
 */
function warn(...args) {
	if (!shouldLog(LOG_LEVELS.WARN)) return;
	console.warn(chalk.yellow(`[${t('cli.warn')}]`), ...args);
}

/**
 * Print an error message (red)
 * @param {...any} args - Messages to log
 */
function error(...args) {
	if (!shouldLog(LOG_LEVELS.ERROR)) return;
	console.error(chalk.red(`[${t('cli.error')}]`), ...args);
}

/**
 * Print a success message (green)
 * @param {...any} args - Messages to log
 */
function success(...args) {
	if (!shouldLog(LOG_LEVELS.SUCCESS)) return;
	console.log(chalk.green(`[${t('cli.success')}]`), ...args);
}

/**
 * Print a newline
 */
function newline() {
	console.log();
}

/**
 * Print a section header (bold white)
 * @param {string} title - The section title
 */
function header(title) {
	console.log(chalk.bold.white(`\n${title}\n`));
}

/**
 * Print a command example (dim)
 * @param {string} command - The command to display
 * @param {string} [description] - Optional description
 */
function example(command, description) {
	if (description) {
		console.log(chalk.dim(`  $ ${command}`), chalk.gray(`- ${description}`));
	} else {
		console.log(chalk.dim(`  $ ${command}`));
	}
}

/**
 * Print a tip/suggestion (magenta)
 * @param {string} message - The tip message
 */
function tip(message) {
	console.log(chalk.magenta(`[${t('cli.tip')}]`), message);
}

module.exports = {
	LOG_LEVELS,
	setLogLevel,
	enableVerbose,
	debug,
	info,
	warn,
	error,
	success,
	newline,
	header,
	example,
	tip,
	setLocale,
	getLocale,
	loadTranslations,
	t,
};
