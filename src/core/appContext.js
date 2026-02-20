/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-23 15:50:00
 * @FilePath     : /visualifyjs/src/core/appContext.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { createContext, useContext, useState, useMemo } from 'react';

// Create the AppContext
const Visualify = createContext();

// Create a custom hook for accessing the AppContext
export function useAppContext() {
	return useContext(Visualify);
}

// Create the AppProvider component to wrap your app with the context
export function VisualifyProvider({ children }) {
	const [sharedData, setSharedData] = useState({}); // Initialize your shared data here

	// Memoize the context value to prevent unnecessary re-renders
	// Only creates a new object when sharedData actually changes
	const contextValue = useMemo(
		() => ({ sharedData, setSharedData }),
		[sharedData],
	);

	return (
		<Visualify.Provider value={contextValue}>
			{children}
		</Visualify.Provider>
	);
}
