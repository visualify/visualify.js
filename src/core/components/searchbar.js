import React, { useState, useEffect } from 'react';
import '../../_css/autoSuggestion.css';
import { useAppContext } from '../appContext';
import conditionalFetch from '../fetch/condfetch';

function SearchBar({ props, style }) {
	const [suggestions, setSuggestions] = useState([]);
	const [wordlist, setWordlist] = useState([]);
	const [inputValue, setInputValue] = useState('');

	const { sharedData, setSharedData } = useAppContext();

	const {
		id,
		title = 'Search',
		className,
		style: _style = { height: '130px', width: '200px' },
		placeholder = 'Search...',
		wordlimit = 15,
		suggestLen = 3,
		searchStyle = {
			borderRadius: '15px',
			width: '100%',
		},
		config = {},
		debug,
	} = props;

	if (config.save && typeof config.save !== 'string') config.save = id;

	useEffect(() => {
		if (config.source) {
			const fetchWordlist = async () => {
				const response = await conditionalFetch(
					config.source,
					sharedData,
					null,
					null,
				);
				if (response) {
					const newWordlist =
						response[config.source.responseKey] || response;
					setWordlist(newWordlist);
				} else if (config.source.trigger) {
					console.log('wait for trigger');
				} else {
					console.error('Error fetching wordlist.');
				}
			};

			if (Array.isArray(config.source)) {
				setWordlist(config.source);
			} else if (typeof config.source === 'object') {
				fetchWordlist();
			}
		}
	}, [config.source, debug, sharedData]);

	useEffect(() => {
		// 更新inputValue，但不要影响其他组件的共享数据
		setInputValue(sharedData[id] || '');
	}, [sharedData, id]);

	const handleInputChange = (e) => {
		const inputValue = e.target.value;
		const inputValueLowerCase = inputValue.trim().toLowerCase();
		setInputValue(inputValue);

		if (inputValue.length >= suggestLen) {
			setSuggestions(
				wordlist
					.filter((word) =>
						word.toLowerCase().includes(inputValueLowerCase),
					)
					.slice(0, wordlimit),
			);
		}

		if (
			config.save &&
			(wordlist.includes(inputValue) || inputValue === '')
		) {
			setSharedData((prevSharedData) => ({
				...prevSharedData,
				[config.save]: inputValue,
			}));
		}
	};

	const handleSuggestionClick = (suggestion) => {
		setInputValue(suggestion);
		setSuggestions([]);

		if (config.save) {
			setSharedData((prevSharedData) => ({
				...prevSharedData,
				[config.save]: suggestion,
			}));
		}
	};

	return (
		<div
			id={id}
			style={{ ...style, ..._style }}
			className={className}>
			{title && <h3>{title}</h3>}
			<div className='autosuggestion'>
				<input
					type='text'
					placeholder={placeholder}
					style={searchStyle}
					value={inputValue}
					onChange={handleInputChange}
				/>
				<ul className='suggestion-list'>
					{suggestions.map((suggestion, index) => (
						<li
							key={index}
							className='suggestion-item'
							onClick={() => handleSuggestionClick(suggestion)}>
							{suggestion}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

export default SearchBar;
