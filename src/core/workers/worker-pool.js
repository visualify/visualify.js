/**
 * @fileoverview Web Worker Pool Manager
 * @module core/workers/worker-pool
 *
 * Manages a pool of web workers for concurrent data processing.
 * Provides task queuing, load balancing, and error handling.
 */

/**
 * Default configuration for worker pool
 * @readonly
 */
const DEFAULT_CONFIG = {
	minWorkers: 2,
	maxWorkers: navigator.hardwareConcurrency || 4,
	taskTimeout: 30000,
	idleTimeout: 60000,
};

/**
 * Worker task status
 * @readonly
 */
const TASK_STATUS = {
	PENDING: 'pending',
	RUNNING: 'running',
	COMPLETED: 'completed',
	FAILED: 'failed',
	CANCELLED: 'cancelled',
};

/**
 * Worker Pool Manager
 * Manages multiple web workers for parallel data processing
 */
class WorkerPool {
	/**
	 * Create a new worker pool
	 * @param {Object} options - Pool configuration
	 * @param {string} options.workerScript - Path to worker script
	 * @param {number} options.minWorkers - Minimum number of workers
	 * @param {number} options.maxWorkers - Maximum number of workers
	 * @param {number} options.taskTimeout - Task timeout in milliseconds
	 * @param {number} options.idleTimeout - Idle worker termination timeout
	 */
	constructor(options = {}) {
		this.config = { ...DEFAULT_CONFIG, ...options };
		this.workerScript = options.workerScript;

		if (!this.workerScript) {
			throw new Error('WorkerPool requires a workerScript path');
		}

		this.workers = new Map();
		this.taskQueue = [];
		this.activeTasks = new Map();
		this.taskIdCounter = 0;
		this.isTerminated = false;

		// Initialize minimum workers
		this._ensureMinWorkers();
	}

	/**
	 * Ensure minimum number of workers are available
	 * @private
	 */
	_ensureMinWorkers() {
		const currentCount = this.workers.size;
		const needed = this.config.minWorkers - currentCount;

		for (let i = 0; i < needed; i++) {
			this._createWorker();
		}
	}

	/**
	 * Create a new worker
	 * @private
	 * @returns {string} Worker ID
	 */
	_createWorker() {
		const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		try {
			const worker = new Worker(this.workerScript, { type: 'module' });

			const workerInfo = {
				id: workerId,
				worker,
				status: 'idle',
				currentTask: null,
				createdAt: Date.now(),
				taskCount: 0,
			};

			worker.onmessage = (event) => this._handleMessage(workerId, event);
			worker.onerror = (error) => this._handleError(workerId, error);
			worker.onmessageerror = (error) => this._handleMessageError(workerId, error);

			this.workers.set(workerId, workerInfo);

			return workerId;
		} catch (error) {
			console.error('[WorkerPool] Failed to create worker:', error);
			throw error;
		}
	}

	/**
	 * Handle message from worker
	 * @private
	 * @param {string} workerId - Worker ID
	 * @param {MessageEvent} event - Message event
	 */
	_handleMessage(workerId, event) {
		const { type, taskId, payload, error } = event.data;
		const workerInfo = this.workers.get(workerId);

		if (!workerInfo) return;

		const task = this.activeTasks.get(taskId);
		if (!task) return;

		// Clear timeout
		if (task.timeoutId) {
			clearTimeout(task.timeoutId);
		}

		// Update worker status
		workerInfo.status = 'idle';
		workerInfo.currentTask = null;
		workerInfo.taskCount++;

		// Remove from active tasks
		this.activeTasks.delete(taskId);

		// Resolve or reject the task
		if (type === 'error' || error) {
			task.status = TASK_STATUS.FAILED;
			task.reject(new Error(error?.message || 'Worker error'));
		} else {
			task.status = TASK_STATUS.COMPLETED;
			task.resolve(payload);
		}

		// Process next task in queue
		this._processQueue();
	}

	/**
	 * Handle worker error
	 * @private
	 * @param {string} workerId - Worker ID
	 * @param {ErrorEvent} error - Error event
	 */
	_handleError(workerId, error) {
		console.error(`[WorkerPool] Worker ${workerId} error:`, error);

		const workerInfo = this.workers.get(workerId);
		if (workerInfo?.currentTask) {
			const task = this.activeTasks.get(workerInfo.currentTask);
			if (task) {
				task.status = TASK_STATUS.FAILED;
				task.reject(new Error(`Worker error: ${error.message}`));
				this.activeTasks.delete(workerInfo.currentTask);
			}
		}

		// Terminate and remove the faulty worker
		this._terminateWorker(workerId);

		// Create a replacement if needed
		if (this.workers.size < this.config.minWorkers) {
			this._createWorker();
		}

		// Process queue
		this._processQueue();
	}

	/**
	 * Handle message error
	 * @private
	 * @param {string} workerId - Worker ID
	 * @param {ErrorEvent} error - Error event
	 */
	_handleMessageError(workerId, error) {
		console.error(`[WorkerPool] Worker ${workerId} message error:`, error);
		this._handleError(workerId, error);
	}

	/**
	 * Terminate a worker
	 * @private
	 * @param {string} workerId - Worker ID
	 */
	_terminateWorker(workerId) {
		const workerInfo = this.workers.get(workerId);
		if (workerInfo) {
			workerInfo.worker.terminate();
			this.workers.delete(workerId);
		}
	}

	/**
	 * Get an available worker
	 * @private
	 * @returns {Object|null} Worker info or null if none available
	 */
	_getAvailableWorker() {
		for (const workerInfo of this.workers.values()) {
			if (workerInfo.status === 'idle') {
				return workerInfo;
			}
		}
		return null;
	}

	/**
	 * Process the task queue
	 * @private
	 */
	_processQueue() {
		if (this.isTerminated || this.taskQueue.length === 0) return;

		const availableWorker = this._getAvailableWorker();
		if (!availableWorker) {
			// Try to create a new worker if under max
			if (this.workers.size < this.config.maxWorkers) {
				const newWorkerId = this._createWorker();
				this._assignTask(newWorkerId, this.taskQueue.shift());
			}
			return;
		}

		const task = this.taskQueue.shift();
		this._assignTask(availableWorker.id, task);
	}

	/**
	 * Assign a task to a worker
	 * @private
	 * @param {string} workerId - Worker ID
	 * @param {Object} task - Task object
	 */
	_assignTask(workerId, task) {
		const workerInfo = this.workers.get(workerId);
		if (!workerInfo) {
			task.reject(new Error('Worker not found'));
			return;
		}

		workerInfo.status = 'busy';
		workerInfo.currentTask = task.id;

		task.status = TASK_STATUS.RUNNING;
		this.activeTasks.set(task.id, task);

		// Set timeout
		task.timeoutId = setTimeout(() => {
			task.status = TASK_STATUS.FAILED;
			task.reject(new Error(`Task ${task.id} timed out after ${this.config.taskTimeout}ms`));
			this.activeTasks.delete(task.id);

			// Reset worker
			workerInfo.status = 'idle';
			workerInfo.currentTask = null;

			// Terminate and recreate worker
			this._terminateWorker(workerId);
			this._createWorker();
			this._processQueue();
		}, this.config.taskTimeout);

		// Send task to worker
		workerInfo.worker.postMessage({
			type: 'task',
			taskId: task.id,
			payload: task.payload,
		});
	}

	/**
	 * Execute a task in a worker
	 * @param {Object} payload - Task payload
	 * @returns {Promise<any>} Task result
	 */
	execute(payload) {
		if (this.isTerminated) {
			return Promise.reject(new Error('Worker pool has been terminated'));
		}

		return new Promise((resolve, reject) => {
			const task = {
				id: `task-${++this.taskIdCounter}`,
				payload,
				status: TASK_STATUS.PENDING,
				resolve,
				reject,
				timeoutId: null,
				createdAt: Date.now(),
			};

			this.taskQueue.push(task);
			this._processQueue();
		});
	}

	/**
	 * Execute multiple tasks in parallel
	 * @param {Array<Object>} payloads - Array of task payloads
	 * @returns {Promise<Array<any>>} Array of results
	 */
	executeAll(payloads) {
		return Promise.all(payloads.map((payload) => this.execute(payload)));
	}

	/**
	 * Get pool statistics
	 * @returns {Object} Pool statistics
	 */
	getStats() {
		let idleWorkers = 0;
		let busyWorkers = 0;

		for (const workerInfo of this.workers.values()) {
			if (workerInfo.status === 'idle') idleWorkers++;
			else busyWorkers++;
		}

		return {
			totalWorkers: this.workers.size,
			idleWorkers,
			busyWorkers,
			queuedTasks: this.taskQueue.length,
			activeTasks: this.activeTasks.size,
			isTerminated: this.isTerminated,
		};
	}

	/**
	 * Terminate all workers and clear queue
	 */
	terminate() {
		this.isTerminated = true;

		// Clear queue
		for (const task of this.taskQueue) {
			task.status = TASK_STATUS.CANCELLED;
			task.reject(new Error('Worker pool terminated'));
		}
		this.taskQueue = [];

		// Cancel active tasks
		for (const task of this.activeTasks.values()) {
			if (task.timeoutId) clearTimeout(task.timeoutId);
			task.status = TASK_STATUS.CANCELLED;
			task.reject(new Error('Worker pool terminated'));
		}
		this.activeTasks.clear();

		// Terminate all workers
		for (const workerId of this.workers.keys()) {
			this._terminateWorker(workerId);
		}
	}
}

// Singleton instance
let globalPool = null;

/**
 * Get or create global worker pool
 * @param {Object} config - Pool configuration
 * @returns {WorkerPool} Global worker pool instance
 */
export function getWorkerPool(config = {}) {
	if (!globalPool) {
		globalPool = new WorkerPool(config);
	}
	return globalPool;
}

/**
 * Terminate global worker pool
 */
export function terminateWorkerPool() {
	if (globalPool) {
		globalPool.terminate();
		globalPool = null;
	}
}

export { WorkerPool, TASK_STATUS };
export default WorkerPool;
