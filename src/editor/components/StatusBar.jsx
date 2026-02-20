/**
 * @fileoverview Status Bar Component
 * @module editor/components/StatusBar
 *
 * Displays editor status information including chart count, auto-save status, and errors.
 */

import React from 'react';
import { CheckCircle, ExclamationCircle, Save } from 'react-bootstrap-icons';

/**
 * Format time ago
 */
function formatTimeAgo(date) {
	if (!date) return 'Never';

	const now = new Date();
	const diff = now - new Date(date);
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (seconds < 60) {
		return 'Just now';
	} else if (minutes < 60) {
		return `${minutes}m ago`;
	} else if (hours < 24) {
		return `${hours}h ago`;
	} else {
		return new Date(date).toLocaleDateString();
	}
}

/**
 * Status Bar Component
 */
function StatusBar({ chartCount, lastSaved, selectedChart }) {
	const hasChanges = !lastSaved;

	return (
		<div className="editor-status-bar">
			<div className="status-bar-left">
				<span className="status-indicator">
					<span
						className={`status-indicator-dot ${chartCount > 0 ? 'success' : 'warning'}`}
					/>
					{chartCount} chart{chartCount !== 1 ? 's' : ''}
				</span>

				{selectedChart && (
					<span className="text-muted">
						Selected: <strong>{selectedChart.title}</strong> ({selectedChart.type})
					</span>
				)}
			</div>

			<div className="status-bar-right">
				<span className="status-indicator">
					{hasChanges ? (
						<>
							<ExclamationCircle className="text-warning" size={14} />
							<span className="text-warning">Unsaved changes</span>
						</>
					) : (
						<>
							<CheckCircle className="text-success" size={14} />
							<span>Saved</span>
						</>
					)}
				</span>

				<span className="status-indicator">
					<Save size={14} />
					<span>Auto-save: {formatTimeAgo(lastSaved)}</span>
				</span>

				<span className="text-muted">
					Press <kbd>Ctrl+S</kbd> to export
				</span>
			</div>
		</div>
	);
}

export default StatusBar;
