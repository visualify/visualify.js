import React, { useEffect, useState } from 'react';
import { useAppContext } from '../appContext';
import simplefetch from '../fetch/fetch';
import Select from 'react-select';

const selectTheme = (theme) => ({
	...theme,
	borderRadius: 6,
	spacing: { ...theme.spacing, controlHeight: 36, baseUnit: 3 },
	colors: {
		...theme.colors,
		primary: '#4a90d9',
		primary75: '#6ba3e0',
		primary50: '#e8f0fe',
		primary25: '#f5f8fd',
		neutral5: '#fafbfc',
		neutral10: '#f0f2f5',
		neutral20: '#e0e0e0',
		neutral30: '#ccc',
		danger: '#e25c5c',
		dangerLight: '#fce8e8',
	},
});

function Selection({ props, style }) {
	const { debug } = props;
	const { style: _style } = props;

	const { title } = props;
	const renderTitle = () => {
		return title && <h3 className='v-control-title'>{title}</h3>;
	};

	// If val is exist, store it to SharedData
	const { sharedData, setSharedData } = useAppContext();

	// store attr in state so that we can update it when it changes
	const [selected, setSelected] = useState([]);

	// store options in state so that we can update it when it changes
	const [selectionOptions, setSelectionOptions] = useState([]);

	const [menuIsOpen, setMenuIsOpen] = useState();

	// Extract stable primitives from props to avoid object reference dependency
	const { selection, urlval, rm_suffix, nested = false, entry } = props;

	// For nested selections, track the entry value from sharedData
	const entryValue = entry ? sharedData[entry] : undefined;
	const entryFirst = Array.isArray(entryValue) && entryValue.length > 0 ? entryValue[0] : null;

	useEffect(() => {
		const fetchData = async () => {
			if (nested) {
				if (entry) {
					if (entryFirst) {
						if (debug)
							console.log('Selection: entryValue:', entryFirst);
						if (debug)
							console.log(
								'Selection: nested url:',
								selection + entryFirst,
								urlval,
							);
						try {
							const response = await simplefetch(
								selection + entryFirst,
								{
									key: urlval,
									debug: debug,
								},
							);
							try {
								const removed_suffix = response.map((item) =>
									item.replace(rm_suffix, ''),
								);
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
					try {
						const removed_suffix = response.map((item) =>
							item.replace(rm_suffix, ''),
						);
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
		// Depend on stable primitives, not entire props/sharedData objects
	}, [selection, urlval, rm_suffix, nested, entry, entryFirst, debug]);

	const handleChange = (selectedOptions) => {
		if (single) {
			setSelected(selectedOptions ? [selectedOptions] : []);
		} else {
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
					placeholder={single ? 'Select...' : 'Select items...'}
					theme={selectTheme}
					styles={{
						container: (provided) => ({
							...provided,
							width: bar_width,
							margin: bar_margin,
						}),
						control: (provided, state) => ({
							...provided,
							minHeight: 36,
							borderColor: state.isFocused ? '#4a90d9' : 'transparent',
							background: state.isFocused ? '#fff' : '#f5f7fa',
							boxShadow: state.isFocused
								? '0 0 0 3px rgba(74, 144, 217, 0.12)'
								: 'none',
							transition: 'all 0.2s ease',
							'&:hover': {
								borderColor: '#4a90d9',
								background: '#fff',
							},
						}),
						valueContainer: (provided) => ({
							...provided,
							maxHeight: bar_maxHeight ?? '200px',
							overflowY: 'auto',
							padding: '2px 8px',
							gap: '3px',
						}),
						multiValue: (provided) => ({
							...provided,
							borderRadius: 12,
							background: '#e8f0fe',
							border: '1px solid #c5d9f2',
						}),
						multiValueLabel: (provided) => ({
							...provided,
							fontSize: '0.8rem',
							fontWeight: 500,
							color: '#2c5282',
							padding: '2px 6px',
						}),
						multiValueRemove: (provided) => ({
							...provided,
							borderRadius: '0 12px 12px 0',
							color: '#4a90d9',
							'&:hover': {
								background: '#c5d9f2',
								color: '#2c5282',
							},
						}),
						menu: (provided) => ({
							...provided,
							maxHeight: menu_maxHeight ?? '250px',
							borderRadius: 8,
							border: '1px solid #e0e0e0',
							boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
							overflow: 'hidden',
							zIndex: 10,
						}),
						menuList: (provided) => ({
							...provided,
							maxHeight: menu_maxHeight ?? '250px',
							padding: '4px',
						}),
						option: (provided, state) => ({
							...provided,
							borderRadius: 6,
							fontSize: '0.85rem',
							padding: '8px 12px',
							margin: '1px 0',
							cursor: 'pointer',
							background: state.isSelected
								? '#4a90d9'
								: state.isFocused
									? '#f0f5ff'
									: 'transparent',
							color: state.isSelected ? '#fff' : '#333',
							'&:active': {
								background: '#e8f0fe',
							},
						}),
						placeholder: (provided) => ({
							...provided,
							fontSize: '0.85rem',
							color: '#aaa',
						}),
						indicatorSeparator: () => ({
							display: 'none',
						}),
						dropdownIndicator: (provided, state) => ({
							...provided,
							color: state.isFocused ? '#4a90d9' : '#bbb',
							padding: '6px',
							transition: 'transform 0.2s ease, color 0.2s ease',
							transform: state.selectProps.menuIsOpen
								? 'rotate(180deg)'
								: 'rotate(0deg)',
							'&:hover': {
								color: '#4a90d9',
							},
						}),
						clearIndicator: (provided) => ({
							...provided,
							color: '#bbb',
							padding: '6px',
							'&:hover': {
								color: '#e25c5c',
							},
						}),
					}}
				/>
			</div>
		);
	};

	// Store value to SharedData
	const { id, val } = props;

	// Serialize selected values for stable comparison
	const selectedValuesKey = JSON.stringify(
		selected ? selected.map((option) => option.value) : [],
	);
	useEffect(() => {
		if (val) {
			setSharedData((prevSharedData) => {
				const selectedValues = selected
					? selected.map((option) => option.value)
					: [];
				// Skip update if the value is already the same
				if (JSON.stringify(prevSharedData[val]) === selectedValuesKey)
					return prevSharedData;
				return { ...prevSharedData, [val]: selectedValues };
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedValuesKey, val, setSharedData]);

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
