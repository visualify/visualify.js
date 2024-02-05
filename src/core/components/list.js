import React, { useState } from 'react';
import { Button, InputGroup, FormControl, ListGroup } from 'react-bootstrap';
import { useAppContext } from '../appContext';
import SearchBar from './searchbar';

const List = ({ props, style }) => {
	const { debug } = props;

	const { style: _style_parsed = {} } = props;
	const { class: className, ...customStyle } = _style_parsed;

	// if debug is true, then border is red, else no border
	style = {
		...style,
		border: debug ? '1px solid red' : 'none',
		margin: '0px auto',
		width: '200px',
		...customStyle,
	};

	// Title & Subtitle--------------------------------------------------
	const { id = 'genelist', title, subtitle } = props;
	// Render title
	const renderTitle = () => {
		return title && <h3>{title}</h3>;
	};

	const renderSubtitle = () => {
		return subtitle && <h5>{subtitle}</h5>;
	};
	// Search | Typing --------------------------------------------------
	const { search } = props;
	const renderSearch = () => {
		return search && <SearchBar props={search} />;
	};
	// Input --------------------------------------------------
	const { input } = props;

	const [items, setItems] = useState([]);
	const [inputValue, setInputValue] = useState('');

	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	};

	const renderInput = () => {
		return (
			input && (
				<FormControl
					placeholder={input.placeholder}
					aria-label={input.ariaLabel}
					aria-describedby='basic-addon2'
					value={inputValue}
					onChange={handleInputChange}
				/>
			)
		);
	};
	// Button --------------------------------------------------
	const { add, clear, remove } = props.btn;

	const { sharedData, setSharedData } = useAppContext();
	const { addfrom } = add;
	const val_shared = sharedData[addfrom];

	const handleAddItem = () => {
		if (!input && !add.addfrom) {
			alert('Please enable input first');
		} else if (addfrom && val_shared) {
			if (items.includes(val_shared)) {
				alert('Item already exist');
			} else {
				setItems([...items, val_shared]);
				setSharedData({ ...sharedData, [id]: [...items, val_shared] });
			}
		} else if (inputValue.trim() !== '') {
			setItems([...items, inputValue]);
			setInputValue('');
		}
	};

	const handleRemoveItem = (itemIndex) => {
		setItems(items.filter((_, index) => index !== itemIndex));

		if (addfrom && val_shared) {
			setSharedData({
				...sharedData,
				[id]: items.filter((_, index) => index !== itemIndex),
			});
		}
	};

	const handleClearItems = () => {
		setItems([]);

		if (addfrom && val_shared) {
			setSharedData({ ...sharedData, [id]: [] });
		}

		if (clear.msg) {
			alert(clear.msg === true ? 'All items cleared' : clear.msg);
		}
	};

	const renderAddbtn = () => {
		return (
			add &&
			add.show && (
				<Button
					style={add.style}
					variant='outline-secondary'
					onClick={handleAddItem}>
					{add.text}
				</Button>
			)
		);
	};

	const renderClearbtn = () => {
		return (
			clear &&
			clear.show && (
				<Button
					style={clear.style}
					variant='outline-secondary'
					onClick={handleClearItems}>
					{clear.text}
				</Button>
			)
		);
	};

	const renderRemovebtn = (index) => {
		return (
			remove &&
			remove.show && (
				<Button
					variant='outline-danger'
					size='sm'
					style={{ ...remove.style, float: 'right' }}
					onClick={() => handleRemoveItem(index)}>
					{remove.text ?? 'X'}
				</Button>
			)
		);
	};

	const { liststyle = { maxHeight: '380px', overflow: 'auto' } } = props;

	return (
		<div
			key={id}
			style={style}
			className={className}>
			{renderTitle()}
			{renderSubtitle()}
			{renderSearch()}
			<InputGroup
				className='mb-3'
				style={{ justifyContent: 'center' }}>
				{renderInput()}
				{renderAddbtn()}
				{renderClearbtn()}
			</InputGroup>

			<ListGroup style={liststyle}>
				{items.map((item, index) => (
					<ListGroup.Item key={index}>
						{item}
						{renderRemovebtn(index)}
					</ListGroup.Item>
				))}
			</ListGroup>
		</div>
	);
};

export default List;
