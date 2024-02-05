/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-02 16:34:41
 * @FilePath     : /visualifyjs/src/core/widgets/errorBoundary.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React from 'react';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { hasError: true, error };
	}

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		console.error('Caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			return <h1>Something went wrong: {this.state.error.message}</h1>;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
