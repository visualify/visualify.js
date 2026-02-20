/**
 * @fileoverview Locale-aware formatters for Visualify.js i18n
 * @module i18n/formatters
 *
 * Provides locale-aware formatting for:
 * - Dates and times
 * - Numbers (decimals, percentages)
 * - Currency
 * - File sizes (bytes)
 * - Relative time
 */

import { getCurrentLanguage } from './index';

/**
 * Get Intl.DateTimeFormat options based on locale
 * @param {string} locale - Locale string
 * @returns {Object} DateTimeFormat options
 */
function getDateTimeFormatOptions(locale) {
  const region = locale.split('-')[1] || locale;

  // Locale-specific date formats
  const dateFormats = {
    'en-US': { month: '2-digit', day: '2-digit', year: 'numeric' },
    'en-GB': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'zh': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'zh-CN': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'de': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'de-DE': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'es': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'es-ES': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'ar': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'ar-SA': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'he': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'he-IL': { day: '2-digit', month: '2-digit', year: 'numeric' },
  };

  return dateFormats[locale] || dateFormats[region] || dateFormats['en-US'];
}

/**
 * Format a date according to the current locale
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const locale = getCurrentLanguage();
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const defaultOptions = getDateTimeFormatOptions(locale);
  const formatOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Format a time according to the current locale
 * @param {Date|string|number} time - Time to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export function formatTime(time, options = {}) {
  const locale = getCurrentLanguage();
  const dateObj = time instanceof Date ? time : new Date(time);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format date and time together
 * @param {Date|string|number} datetime - DateTime to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(datetime, options = {}) {
  const locale = getCurrentLanguage();
  const dateObj = datetime instanceof Date ? datetime : new Date(datetime);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const defaultOptions = {
    ...getDateTimeFormatOptions(locale),
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Format a number according to the current locale
 * @param {number} value - Number to format
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number string
 */
export function formatNumber(value, options = {}) {
  const locale = getCurrentLanguage();

  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }

  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat(locale, defaultOptions).format(value);
}

/**
 * Format a percentage according to the current locale
 * @param {number} value - Value to format as percentage (0-1 or 0-100)
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, options = {}) {
  const locale = getCurrentLanguage();

  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }

  // Normalize value to 0-1 range if it appears to be 0-100
  const normalizedValue = value > 1 ? value / 100 : value;

  const defaultOptions = {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  return new Intl.NumberFormat(locale, defaultOptions).format(normalizedValue);
}

/**
 * Format currency according to the current locale
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (e.g., 'USD', 'EUR', 'CNY')
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD', options = {}) {
  const locale = getCurrentLanguage();

  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }

  const defaultOptions = {
    style: 'currency',
    currency,
    ...options,
  };

  return new Intl.NumberFormat(locale, defaultOptions).format(value);
}

/**
 * Format bytes to human-readable format
 * @param {number} bytes - Bytes to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted bytes string
 */
export function formatBytes(bytes, options = {}) {
  const locale = getCurrentLanguage();

  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return '';
  }

  const { decimals = 2, binary = false } = options;
  const base = binary ? 1024 : 1000;
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  if (bytes === 0) {
    return `0 ${units[0]}`;
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );
  const value = bytes / Math.pow(base, exponent);

  const formattedValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);

  return `${formattedValue} ${units[exponent]}`;
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string|number} date - Date to compare
 * @param {Date|string|number} [relativeTo] - Date to compare against (default: now)
 * @returns {string} Formatted relative time string
 */
export function formatRelativeTime(date, relativeTo = new Date()) {
  const locale = getCurrentLanguage();
  const dateObj = date instanceof Date ? date : new Date(date);
  const relativeObj = relativeTo instanceof Date ? relativeTo : new Date(relativeTo);

  const diffMs = dateObj.getTime() - relativeObj.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  // Use Intl.RelativeTimeFormat if available
  if (typeof Intl.RelativeTimeFormat !== 'undefined') {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) {
      return rtf.format(diffSeconds, 'second');
    } else if (Math.abs(diffMinutes) < 60) {
      return rtf.format(diffMinutes, 'minute');
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(diffHours, 'hour');
    } else if (Math.abs(diffDays) < 30) {
      return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffDays) < 365) {
      return rtf.format(Math.round(diffDays / 30), 'month');
    } else {
      return rtf.format(Math.round(diffDays / 365), 'year');
    }
  }

  // Fallback for browsers without RelativeTimeFormat
  const absSeconds = Math.abs(diffSeconds);
  const absMinutes = Math.abs(diffMinutes);
  const absHours = Math.abs(diffHours);
  const absDays = Math.abs(diffDays);

  let value, unit;
  if (absSeconds < 60) {
    value = absSeconds;
    unit = 'second';
  } else if (absMinutes < 60) {
    value = absMinutes;
    unit = 'minute';
  } else if (absHours < 24) {
    value = absHours;
    unit = 'hour';
  } else {
    value = absDays;
    unit = 'day';
  }

  const suffix = diffMs > 0 ? 'from now' : 'ago';
  return `${value} ${unit}${value !== 1 ? 's' : ''} ${suffix}`;
}

/**
 * Format a list according to locale conventions
 * @param {Array<string>} items - Items to format
 * @param {Object} options - Intl.ListFormat options
 * @returns {string} Formatted list string
 */
export function formatList(items, options = {}) {
  const locale = getCurrentLanguage();

  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  // Use Intl.ListFormat if available
  if (typeof Intl.ListFormat !== 'undefined') {
    const listFormat = new Intl.ListFormat(locale, options);
    return listFormat.format(items);
  }

  // Fallback
  if (items.length === 1) {
    return items[0];
  } else if (items.length === 2) {
    const conjunctions = {
      'en': ' and ',
      'zh': '和',
      'es': ' y ',
      'de': ' und ',
      'ar': ' و ',
      'he': ' ו ',
    };
    const lang = locale.split('-')[0];
    return items.join(conjunctions[lang] || ' and ');
  } else {
    const conjunctions = {
      'en': ', and ',
      'zh': '和',
      'es': ', y ',
      'de': ', und ',
      'ar': ', و ',
      'he': ', ו ',
    };
    const lang = locale.split('-')[0];
    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1);
    return otherItems.join(', ') + (conjunctions[lang] || ', and ') + lastItem;
  }
}

/**
 * Get number formatting info for the current locale
 * @returns {Object} Formatting info (decimal separator, group separator)
 */
export function getNumberFormatInfo() {
  const locale = getCurrentLanguage();
  const number = 1234.5;
  const formatted = new Intl.NumberFormat(locale).format(number);

  // Extract separators from formatted number
  const parts = formatted.split('');
  let decimalSeparator = '.';
  let groupSeparator = ',';

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '4') {
      // Found the decimal part start
      decimalSeparator = parts[i - 1];
    } else if (parts[i] === '1' && i > 0) {
      // Found the group separator
      groupSeparator = parts[i - 1];
    }
  }

  return {
    decimalSeparator,
    groupSeparator,
  };
}

/**
 * Parse a localized number string back to a number
 * @param {string} value - Localized number string
 * @returns {number|null} Parsed number or null if invalid
 */
export function parseNumber(value) {
  if (typeof value !== 'string') {
    return typeof value === 'number' ? value : null;
  }

  const { decimalSeparator, groupSeparator } = getNumberFormatInfo();

  // Remove group separators and normalize decimal separator
  const normalized = value
    .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
    .replace(decimalSeparator, '.');

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Format chart axis label with locale-aware number formatting
 * @param {number} value - Value to format
 * @param {string} type - Axis type ('value', 'log', 'time')
 * @returns {string} Formatted label
 */
export function formatAxisLabel(value, type = 'value') {
  const locale = getCurrentLanguage();

  if (type === 'time') {
    return formatDate(value, { month: 'short', day: 'numeric' });
  }

  if (type === 'log') {
    // For log scales, use scientific notation for very small/large numbers
    if (Math.abs(value) < 0.001 || Math.abs(value) > 10000) {
      return new Intl.NumberFormat(locale, {
        notation: 'scientific',
        maximumFractionDigits: 2,
      }).format(value);
    }
  }

  // Standard number formatting
  return formatNumber(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

/**
 * Format data value for tooltip display
 * @param {*} value - Value to format
 * @param {string} dataType - Type of data ('number', 'date', 'category', 'currency')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted value
 */
export function formatTooltipValue(value, dataType = 'number', options = {}) {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (dataType) {
    case 'date':
      return formatDate(value, options);
    case 'datetime':
      return formatDateTime(value, options);
    case 'currency':
      return formatCurrency(value, options.currency || 'USD', options);
    case 'percent':
      return formatPercent(value, options);
    case 'bytes':
      return formatBytes(value, options);
    case 'number':
    default:
      if (typeof value === 'number') {
        return formatNumber(value, options);
      }
      return String(value);
  }
}

// Default export with all formatters
export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatCurrency,
  formatBytes,
  formatRelativeTime,
  formatList,
  getNumberFormatInfo,
  parseNumber,
  formatAxisLabel,
  formatTooltipValue,
};
