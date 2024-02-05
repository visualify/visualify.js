/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-01 22:17:15
 * @FilePath     : /visualifyjs/src/core/modules/codeEditorWithPreview.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
import React, { useState } from 'react';
import AceEditor from 'react-ace';
import EChartSwitcher from './echartswitcher';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';

const CodeEditorWithPreview = ({ config }) => {
	const supportedThemes = ['', 'monokai'];
	const supportedMode = ['javascript'];

	const {
		theme = '',
		mode = 'javascript',
		width,
		height = '400px',
		title = 'Rechart Preview',
		editorProps = { $blockScrolling: true },
	} = config;

	if (!supportedThemes.includes(theme)) {
		throw new Error(
			`Theme '${theme}' not supported. Supported themes are: ${supportedThemes.join(
				', ',
			)}`,
		);
	}

	if (!supportedMode.includes(mode)) {
		throw new Error(
			`Mode '${mode}' not supported. Supported modes are: ${supportedMode.join(
				', ',
			)}`,
		);
	}

	const [code, setCode] = useState(config.code);

	// Function to evaluate the code and return the chart options
	const getChartOptions = () => {
		try {
			// eslint-disable-next-line no-new-func
			const func = new Function(code);
			return func()();
		} catch (error) {
			console.error('Error evaluating chart options:', error);
			return {};
		}
	};

	const blockStyles = {
		display: 'flex',
		justifyContent: 'space-between',
	};
	if (width) blockStyles.width = width;

	const editorStyles = {
		flexGrow: 1,
		border: '1px solid #ddd',
		borderRadius: '4px',
		marginBottom: '10px',
		width: '50%',
	};

	const editorTitleStyles = {
		backgroundColor: '#f4f4f4',
		padding: '10px',
		borderBottom: '1px solid #ddd',
		width: '100%',
	};

	return (
		<div style={blockStyles}>
			<div style={editorStyles}>
				<div style={editorTitleStyles}>{title}</div>
				<AceEditor
					mode={mode}
					theme={theme}
					value={code}
					onChange={setCode}
					name={title}
					editorProps={editorProps}
					width='100%'
					height={height}
					setOptions={{
						wrap: true,
						useWorker: false,
					}}
				/>
			</div>
			<div style={{ width: '50%' }}>
				<EChartSwitcher props={{ config: getChartOptions() }} />
			</div>
		</div>
	);
};

export default CodeEditorWithPreview;
