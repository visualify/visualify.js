import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { ReactComponent as Corner } from '../../_media/corner.svg';
import { useLocation, Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../../_media/logo.svg';

function Vheader({ config }) {
	const location = useLocation();
	const [Navgation, setNavgation] = useState(null);
	const [activeNav, setActiveNav] = useState('home');

	const {
		logo = <Logo />,
		logolink = 'https://www.lgcyaxi.net/visualify',
		name = 'Visualify',
		nav = false,
		alias = {},
		nav_alignment = 'start',
		repo,
	} = config;

	// Function to get the current directory path
	const getCurrentDirectoryPath = () => {
		// Extract the path from the hash, removing the leading '#/'
		const hashPath = window.location.hash.slice(2);
		const pathSegments = hashPath.split('/');
		// Remove the last segment (file name or empty string if it ends with '/')
		pathSegments.pop();
		// Rejoin the remaining segments to form the directory path
		let directoryPath = pathSegments.join('/');
		// Ensure the directory path ends with '/'
		if (!directoryPath.endsWith('/')) {
			directoryPath += '/';
		}
		return directoryPath;
	};

	const renderLogo = () => {
		return (
			<a
				className='navbar-brand d-flex align-items-center'
				href={logolink}
				target='_blank'
				rel='noreferrer'>
				{typeof logo === 'string' ? (
					<img
						src={logo}
						alt='logo'
						width='65'
						height='65'
						className='d-inline-block align-top'
					/>
				) : (
					logo
				)}
			</a>
		);
	};

	const renderTitle = () => {
		if (typeof name === 'string') {
			return <h1 className='rainbow-text'>{name}</h1>;
		}
		const {
			text = 'Visualify',
			font_weight = 'bold',
			color = 'rainbow',
			...rest
		} = name;

		if (color === 'rainbow') {
			return (
				<h1
					className='rainbow-text'
					style={{ fontWeight: font_weight }}>
					{text}
				</h1>
			);
		} else {
			return (
				<h1 style={{ fontWeight: font_weight, color: color, ...rest }}>
					{text}
				</h1>
			);
		}
	};

	useEffect(() => {
		const resolveNavUrl = () => {
			let pathSegments = location.pathname.split('/');
			//console.log('pathseg:' + pathSegments);
			pathSegments.pop();
			let directoryPath = pathSegments.join('/');
			
			if (directoryPath === '') directoryPath = window.location.pathname;
			//console.log('directoryPath:' + directoryPath,'windows.pathname:' + window.location.pathname,);
			
			if (!directoryPath.endsWith('/')) directoryPath += '/';

			const fullNavPath = directoryPath + '_nav.json';
			const aliasPath = alias && alias[fullNavPath];

			return aliasPath ? aliasPath : fullNavPath;
		};

		if (nav && typeof nav === 'boolean') {
			const navUrl = resolveNavUrl();

			// Fetch the navigation data only if the URL has changed
			if (navUrl !== previousNavUrl.current) {
				fetch(navUrl)
					.then((res) => res.json())
					.then((data) => {
						// Check if the fetched data is different from the current state
						if (
							JSON.stringify(data) !== JSON.stringify(Navgation)
						) {
							setNavgation(data);
						}
					})
					.catch((err) => {
						console.error(
							`Failed to fetch navigation data: ${err}`,
						);
						setNavgation(null);
					});

				// Update the ref with the new URL
				previousNavUrl.current = navUrl;
			}
		} else if (
			nav &&
			typeof nav === 'object' &&
			JSON.stringify(nav) !== JSON.stringify(Navgation)
		) {
			setNavgation(nav);
		} else if (!nav) {
			setNavgation(null);
		}
	}, [nav, alias, Navgation, location.pathname]); // Use location.pathname if only the path is relevant

	// Use a ref to store the previous navigation URL
	const previousNavUrl = useRef();

	useEffect(() => {
		// Update the active nav item based on the current location
		let path = location.pathname === '/' ? '/home' : location.pathname;
		setActiveNav(path.slice(1));
	}, [location]);

	const renderNav = () => {
		if (!Navgation) return <Container />;
		const currentDirectoryPath = getCurrentDirectoryPath();
		const navs = Navgation.map((navItem, index) => {
			let fullPath = `${currentDirectoryPath}${navItem.link}`;
			if (fullPath.startsWith('/')) {
				fullPath = fullPath.slice(1);
			}
			const isActive = activeNav === fullPath;
			let navLinkClass = 'nav-link';
			if (navItem.type === 'primary')
				navLinkClass = 'btn btn-primary shadow no-border-radius';
			if (isActive) navLinkClass += ' active';
			const isExternal = navItem.link.startsWith('http');

			return (
				<li
					className='nav-item'
					key={index}>
					{isExternal ? (
						<a
							className={navLinkClass}
							href={fullPath}
							target='_blank'
							rel='noreferrer'>
							{navItem.title}
						</a>
					) : (
						<Link
							className={navLinkClass}
							to={fullPath}>
							{navItem.title}
						</Link>
					)}
				</li>
			);
		});

		return (
			<Container>
				<ul
					className={`navbar-nav d-flex justify-content-${nav_alignment} mx-auto`}
					id='navtabs'>
					{navs}
				</ul>
			</Container>
		);
	};

	const renderGitHubCorner = () => {
		if (!repo) return null;

		// Check if it's a full URL or a "username/repo" string
		const isFullUrl =
			repo.startsWith('http://') || repo.startsWith('https://');
		const githubUrl = isFullUrl ? repo : `https://github.com/${repo}`;

		return (
			<a
				href={githubUrl}
				className='github-corner'
				aria-label='View source on GitHub'
				target='_blank'
				rel='noreferrer'>
				{<Corner />}
			</a>
		);
	};

	return (
		<header className='v-header'>
			<nav className='navbar navbar-light navbar-expand-md py-3'>
				<Container>
					{renderLogo()}
					{renderTitle()}
					{renderNav()}
				</Container>
			</nav>
			{renderGitHubCorner()}
		</header>
	);
}

export default Vheader;
