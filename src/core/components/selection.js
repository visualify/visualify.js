import React, { useEffect, useState } from 'react';
import { useAppContext } from '../appContext';
import simplefetch from '../fetch/fetch';
import Select from 'react-select';

function Selection({ props, style }) {
	const { debug } = props;
	const { style: _style } = props;

	// Render title if it exists
	const { title } = props;
	const renderTitle = () => {
		return title && <h3>{title}</h3>;
	};

	// If val is exist, store it to SharedData
	const { sharedData, setSharedData } = useAppContext();

	// store attr in state so that we can update it when it changes
	const [selected, setSelected] = useState([]);

	// store options in state so that we can update it when it changes
	const [selectionOptions, setSelectionOptions] = useState([]);

	const [menuIsOpen, setMenuIsOpen] = useState();

	useEffect(() => {
		const { selection, urlval, rm_suffix, nested = false, entry } = props;

		const fetchData = async () => {
			if (nested) {
				if (entry) {
					const entryValue = sharedData[entry];
					if (entryValue && entryValue.length > 0) {
						if (debug)
							console.log('Selection: entryValue:', entryValue);
						if (debug)
							console.log(
								'Selection: nested url:',
								selection + entryValue[0],
								urlval,
							);
						try {
							const response = await simplefetch(
								selection + entryValue[0],
								{
									key: urlval,
									debug: debug,
								},
							);
							// remove the suffix "_metadata" from the options
							try {
								const removed_suffix = response.map((item) =>
									item.replace(rm_suffix, ''),
								);
								// insert the "None" into removed_Suffix
								removed_suffix.unshift('None');
								if (debug)
									console.log(
										'Removed suffix:',
										removed_suffix,
									);
								setSelectionOptions(removed_suffix);
							} catch (error) {
								setSelectionOptions([]);
							}
						} catch (error) {
							console.error('Error fetching options:', error);
						}
					}
				} else
					console.error(
						'Error: nested is true but entry is not defined.',
					);
			} else {
				try {
					const response = await simplefetch(selection, {
						key: urlval,
						debug: debug,
					});
					// remove the suffix "_metadata" from the options
					try {
						const removed_suffix = response.map((item) =>
							item.replace(rm_suffix, ''),
						);
						//console.log("Removed suffix:", removed_suffix);
						setSelectionOptions(removed_suffix);
					} catch (error) {
						setSelectionOptions(response);
					}
				} catch (error) {
					console.error('Error fetching options:', error);
				}
			}
		};

		fetchData();
	}, [props, setSelectionOptions, sharedData, debug]);

	const handleChange = (selectedOptions) => {
		if (single) {
			// If single selection, selectedOptions will be an object
			setSelected(selectedOptions ? [selectedOptions] : []);
		} else {
			// If multi-selection, selectedOptions will be an array
			setSelected(selectedOptions || []);
		}
	};

	const onInputChange = (inputValue, { action, prevInputValue }) => {
		if (action === 'input-change') return inputValue;
		if (action === 'menu-close') {
			if (prevInputValue) setMenuIsOpen(true);
			else setMenuIsOpen(undefined);
		}
		return prevInputValue;
	};

	// ----------------- Selection bar ------------------------------------------------
	const { config = {} } = props;
	const {
		bar_width = '300px',
		bar_margin = '0 auto',
		bar_maxHeight = '300px',
		menu_maxHeight = '300px',
		single = false,
	} = config;

	const renderSelection = () => {
		const options = selectionOptions.map((item) => ({
			value: item,
			label: item,
		}));

		return (
			<div className='select-wrapper'>
				<Select
					isMulti={!single}
					options={options}
					value={selected}
					onChange={handleChange}
					onInputChange={onInputChange}
					menuIsOpen={menuIsOpen}
					styles={{
						container: (provided) => ({
							...provided,
							width: bar_width,
							margin: bar_margin,
							maxHeight: bar_maxHeight,
						}),
						valueContainer: (provided) => ({
							...provided,
							maxHeight: bar_maxHeight ?? 'auto',
							overflowY: 'auto',
						}),
						menu: (provided) => ({
							...provided,
							maxHeight: menu_maxHeight ?? 'auto', // Set the max height as required
							overflowY: 'auto', // Enable scroll if exceeds max height
						}),
					}}
				/>
			</div>
		);
	};

	// Store value to SharedData
	const { id, val } = props;

	useEffect(() => {
		if (val) {
			setSharedData((prevSharedData) => {
				const selectedValues = selected
					? selected.map((option) => option.value)
					: [];
				//console.log("Selection: selected:", selectedValues);
				return { ...prevSharedData, [val]: selectedValues };
			});
		}
	}, [selected, val, setSharedData]);

	return (
		<div
			key={id}
			style={{ ...style, ..._style }}
			className='selection-box-container'>
			{renderTitle()}
			{renderSelection()}
		</div>
	);
}

export default Selection;
