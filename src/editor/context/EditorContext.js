/**
 * @fileoverview Editor Context - State management for the visual editor
 * @module editor/context/EditorContext
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Action types
const ACTIONS = {
	SET_CONFIG: 'SET_CONFIG',
	UPDATE_CHART: 'UPDATE_CHART',
	ADD_CHART: 'ADD_CHART',
	REMOVE_CHART: 'REMOVE_CHART',
	REORDER_CHARTS: 'REORDER_CHARTS',
	SET_SELECTED_CHART: 'SET_SELECTED_CHART',
	UPDATE_LAYOUT: 'UPDATE_LAYOUT',
	SET_HISTORY: 'SET_HISTORY',
	UNDO: 'UNDO',
	REDO: 'REDO',
	SET_LOADING: 'SET_LOADING',
	SET_ERROR: 'SET_ERROR',
};

// Initial state
const initialState = {
	config: {
		version: '3.0.0',
		charts: [],
		layout: {
			type: 'grid',
			rows: 1,
			cols: 1,
			gap: '10px',
		},
		theme: 'modern',
	},
	selectedChartId: null,
	history: {
		past: [],
		present: null,
		future: [],
	},
	loading: false,
	error: null,
};

// Reducer
function editorReducer(state, action) {
	switch (action.type) {
		case ACTIONS.SET_CONFIG:
			return {
				...state,
				config: action.payload,
				history: {
					past: [...state.history.past, state.config],
					present: action.payload,
					future: [],
				},
			};

		case ACTIONS.UPDATE_CHART:
			return {
				...state,
				config: {
					...state.config,
					charts: state.config.charts.map((chart) =>
						chart.id === action.payload.id
							? { ...chart, ...action.payload.updates }
							: chart,
					),
				},
			};

		case ACTIONS.ADD_CHART:
			return {
				...state,
				config: {
					...state.config,
					charts: [...state.config.charts, action.payload],
				},
				selectedChartId: action.payload.id,
			};

		case ACTIONS.REMOVE_CHART:
			return {
				...state,
				config: {
					...state.config,
					charts: state.config.charts.filter(
						(c) => c.id !== action.payload,
					),
				},
				selectedChartId:
					state.selectedChartId === action.payload
						? null
						: state.selectedChartId,
			};

		case ACTIONS.REORDER_CHARTS:
			return {
				...state,
				config: {
					...state.config,
					charts: action.payload,
				},
			};

		case ACTIONS.SET_SELECTED_CHART:
			return {
				...state,
				selectedChartId: action.payload,
			};

		case ACTIONS.UPDATE_LAYOUT:
			return {
				...state,
				config: {
					...state.config,
					layout: { ...state.config.layout, ...action.payload },
				},
			};

		case ACTIONS.UNDO:
			if (state.history.past.length === 0) return state;
			const previous = state.history.past[state.history.past.length - 1];
			const newPast = state.history.past.slice(0, -1);
			return {
				...state,
				config: previous,
				history: {
					past: newPast,
					present: previous,
					future: [state.config, ...state.history.future],
				},
			};

		case ACTIONS.REDO:
			if (state.history.future.length === 0) return state;
			const next = state.history.future[0];
			const newFuture = state.history.future.slice(1);
			return {
				...state,
				config: next,
				history: {
					past: [...state.history.past, state.config],
					present: next,
					future: newFuture,
				},
			};

		case ACTIONS.SET_LOADING:
			return { ...state, loading: action.payload };

		case ACTIONS.SET_ERROR:
			return { ...state, error: action.payload };

		default:
			return state;
	}
}

// Context
const EditorContext = createContext(null);

// Provider component
export function EditorProvider({ children, initialState: customInitialState }) {
	const [state, dispatch] = useReducer(
		editorReducer,
		customInitialState || initialState,
	);

	// Actions
	const setConfig = useCallback((config) => {
		dispatch({ type: ACTIONS.SET_CONFIG, payload: config });
	}, []);

	const updateChart = useCallback((id, updates) => {
		dispatch({ type: ACTIONS.UPDATE_CHART, payload: { id, updates } });
	}, []);

	const addChart = useCallback((chart) => {
		dispatch({ type: ACTIONS.ADD_CHART, payload: chart });
	}, []);

	const removeChart = useCallback((id) => {
		dispatch({ type: ACTIONS.REMOVE_CHART, payload: id });
	}, []);

	const reorderCharts = useCallback((charts) => {
		dispatch({ type: ACTIONS.REORDER_CHARTS, payload: charts });
	}, []);

	const setSelectedChart = useCallback((id) => {
		dispatch({ type: ACTIONS.SET_SELECTED_CHART, payload: id });
	}, []);

	const updateLayout = useCallback((layout) => {
		dispatch({ type: ACTIONS.UPDATE_LAYOUT, payload: layout });
	}, []);

	const undo = useCallback(() => {
		dispatch({ type: ACTIONS.UNDO });
	}, []);

	const redo = useCallback(() => {
		dispatch({ type: ACTIONS.REDO });
	}, []);

	const canUndo = state.history.past.length > 0;
	const canRedo = state.history.future.length > 0;

	const value = {
		state,
		dispatch,
		// Actions
		setConfig,
		updateChart,
		addChart,
		removeChart,
		reorderCharts,
		setSelectedChart,
		updateLayout,
		undo,
		redo,
		// Computed
		canUndo,
		canRedo,
		selectedChart: state.config.charts.find(
			(c) => c.id === state.selectedChartId,
		),
	};

	return (
		<EditorContext.Provider value={value}>{children}</EditorContext.Provider>
	);
}

// Hook
export function useEditor() {
	const context = useContext(EditorContext);
	if (!context) {
		throw new Error('useEditor must be used within an EditorProvider');
	}
	return context;
}

export { ACTIONS };
export default EditorContext;
