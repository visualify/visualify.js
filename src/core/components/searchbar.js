import React, { useState, useEffect, useRef } from 'react';
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
		config = {},
		debug,
	} = props;

	if (config.save && typeof config.save !== 'string') config.save = id;

	// Stabilize config.source reference to prevent infinite re-renders
	const sourceRef = useRef(config.source);
	sourceRef.current = config.source;

	// Extract the trigger key to narrow the dependency
	const triggerKey = config.source?.trigger;
	// Support both string triggers and object triggers with .name
	const triggerName = typeof triggerKey === 'object' ? triggerKey.name || triggerKey : triggerKey;
	const rawTriggerValue = triggerName ? sharedData[triggerName] : undefined;
	// Serialize trigger value to a stable string for dependency comparison
	// This prevents re-renders from array/object reference changes (e.g., [] vs [])
	const triggerValueKey = JSON.stringify(rawTriggerValue);

	// Use a ref to access latest sharedData in the fetch effect without depending on it
	const sharedDataRef = useRef(sharedData);
	sharedDataRef.current = sharedData;

	// Stable source URL for dependency tracking (avoids object reference changes)
	const sourceUrl = config.source?.url;
	const sourceName = config.source?.name;
	const isArraySource = Array.isArray(config.source);

	useEffect(() => {
		const source = sourceRef.current;
		if (source) {
			const fetchWordlist = async () => {
				const response = await conditionalFetch(
					source,
					sharedDataRef.current,
					null,
					null,
				);
				if (response) {
					const newWordlist =
						response[source.responseKey] || response;
					setWordlist(newWordlist);
				} else if (source.trigger) {
					if (debug) console.log('wait for trigger');
				} else {
					console.error('Error fetching wordlist.');
				}
			};

			if (isArraySource) {
				setWordlist(source);
			} else if (typeof source === 'object') {
				fetchWordlist();
			}
		}
		// Depend on stable primitives — triggerValueKey is a serialized string,
		// not an object/array reference, preventing spurious re-runs
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sourceUrl, sourceName, isArraySource, debug, triggerValueKey]);

	// Sync input value from sharedData only when it externally changes
	const savedValue = sharedData[id];
	useEffect(() => {
		setInputValue(savedValue || '');
	}, [savedValue]);

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
			className={`v-searchbar-container${className ? ' ' + className : ''}`}>
			{title && <h3 className='v-control-title'>{title}</h3>}
			<div className='autosuggestion'>
				<div className='v-searchbar-wrapper'>
					<input
						type='text'
						placeholder={placeholder}
						className='v-searchbar-input'
						value={inputValue}
						onChange={handleInputChange}
					/>
				</div>
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
