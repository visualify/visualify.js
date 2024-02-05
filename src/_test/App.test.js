/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-11-29 15:35:28
 * @FilePath     : /visualifyjs/src/_test/App.test.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import { render, screen } from '@testing-library/react';
import App from '../core/App';

test('renders learn react link', () => {
	render(<App />);
	const linkElement = screen.getByText(/learn react/i);
	expect(linkElement).toBeInTheDocument();
});
