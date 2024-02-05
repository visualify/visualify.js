import React from 'react';
import DOMPurify from 'dompurify';
import { Container, Row, Col } from 'react-bootstrap';
import { ReactComponent as ICON } from '../../_media/icon.svg';
import pkg from '../../../package.json';

function Vfooter({ config }) {
	// Download -------------------------------------------------------------------------
	const { download, download_style } = config;

	const _renderDownloads = () => {
		if (download === undefined) return null;
		if (Object.keys(download).length === 0) return null;

		let button_style = {
			marginRight: '1rem',
		};

		if (
			download_style !== undefined &&
			typeof download_style === 'object'
		) {
			button_style = download_style;
		}

		return (
			<Row>
				<Col>
					<b style={{ marginRight: '1rem' }}>Download: </b>
					{Object.keys(download).map((key) => (
						<a
							key={key}
							href={download[key]}
							download>
							<button style={button_style}>{`${key}`}</button>
						</a>
					))}
				</Col>
			</Row>
		);
	};

	// References -------------------------------------------------------------------------
	// get references config for rendering references
	const { references, references_style } = config;

	const _renderRefs = () => {
		let refs = [];
		var ref_list_style = references_style;
		if (references === undefined || references.length === 0) return null;
		if (references_style === undefined || references_style === '')
			ref_list_style = 'circle';

		references.map((reference, index) =>
			refs.push(
				<li
					key={index}
					className={`reference-item ${ref_list_style}`}
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(reference),
					}}
				/>,
			),
		);

		return (
			<Row>
				<Col>
					<ul className='reference-list'>{refs}</ul>
				</Col>
			</Row>
		);
	};

	// CopyRight -------------------------------------------------------------------------
	const { copyright = pkg.name } = config;
	const _renderCopyRight = () => {
		return (
			<Col>
				<p
					className='mb-0'
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(
							`${copyright} Copyright © ${new Date().getFullYear()} powered by ${
								pkg.name
							}@<a href="${pkg.homepage}">${pkg.version}</a>`,
						),
					}}
				/>
			</Col>
		);
	};

	// Icons -------------------------------------------------------------------------
	const { icons } = config;

	const _renderIcons = () => {
		let Icons = [];

		if (icons === undefined) {
			Icons.push(
				<li
					key='visualify'
					className='list-inline-item'>
					<a href='https://visualify.pharmacy.arizona.edu/'>
						<ICON />
					</a>
				</li>,
			);

			Icons.push(
				<li
					key='v_github'
					className='list-inline-item'>
					<a href='https://github.com/visualify/visualify.js'>
						<i className='fa-brands fa-github fa-lg'></i>
					</a>
				</li>,
			);
		} else {
			for (const [icon, link] of Object.entries(icons)) {
				let IconElement = null;
				if (icon.startsWith('fa')) {
					IconElement = <i className={`${icon}`} />;
				} else if (icon.startsWith('<svg')) {
					IconElement = (
						<div
							dangerouslySetInnerHTML={{
								__html: DOMPurify.sanitize(icon),
							}}
						/>
					);
				} else {
					IconElement = (
						<img
							src={icon}
							alt=''
						/>
					);
				}
				Icons.push(
					<li
						key={link}
						className='list-inline-item'>
						<a href={link}>{IconElement}</a>
					</li>,
				);
			}
		}

		return (
			<Col>
				<ul
					id='footer_icon'
					className='list-inline mb-0'>
					{Icons}
				</ul>
			</Col>
		);
	};

	return (
		<footer className='v-footer'>
			<Container className='py-4 py-lg-5'>
				{_renderDownloads()}
				{_renderRefs()}
				<hr />
				<Row className='text-muted d-flex justify-content-between align-items-center pt-3 list-inline mb-0'>
					{_renderCopyRight()}
					{_renderIcons()}
				</Row>
			</Container>
		</footer>
	);
}

export default Vfooter;
