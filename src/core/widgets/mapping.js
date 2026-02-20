/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-21 13:52:36
 * @FilePath     : /visualifyjs/src/core/widgets/mapping.js
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */

import SearchBar from '../components/searchbar';
import NaiveHTML from '../components/html';
import Markdown from '../components/markdown';
import Browser from '../components/browser';
import Macaron from '../components/macaron';
import EChartSwitcher from '../modules/echartswitcher';
import ScatterL from '../components/scatterL';
import RatioBox from '../components/ratio';
import Selection from '../components/selection';
import Timeline from '../components/timeline';
import VisiumPlot from '../components/VisiumPlot';
import RePlotly from '../modules/replotly';
import List from '../components/list';
import DotBio from '../components/dotplot';
import Scatter3D from '../components/Scatter3D';
import Bar3D from '../components/Bar3D';
import Surface3D from '../components/Surface3D';
import Line3D from '../components/Line3D';
import ThreeScene from '../components/ThreeScene';
import ThreeCustom from '../components/ThreeCustom';

const widgetMapping = {
	// Add  components here
	SearchBar,
	Echart: EChartSwitcher,
	HTML: NaiveHTML,
	Markdown,
	Browser,
	Macaron,
	ScatterL,
	RatioBox,
	Selection,
	Timeline,
	Visium: VisiumPlot,
	Plotly: RePlotly,
	List,
	DotBio,
	// 3D Chart Components
	scatter3d: Scatter3D,
	bar3d: Bar3D,
	surface3d: Surface3D,
	line3d: Line3D,
	// Three.js Components
	threejs: ThreeScene,
	threecustom: ThreeCustom,
};

export default widgetMapping;
