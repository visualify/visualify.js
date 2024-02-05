/*
 * @Author       : Lihao leolihao@arizona.edu
 * @Date         : 2023-12-01 12:51:04
 * @FilePath     : /visualifyjs/rollup.config.mjs
 * @Description  :
 * Copyright (c) 2023 by Lihao (leolihao@arizona.edu), All Rights Reserved.
 */
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import image from '@rollup/plugin-image';
import inlineReactSvg from 'babel-plugin-inline-react-svg';
import url from '@rollup/plugin-url';

//import css from 'rollup-plugin-css-only';

function onwarn(warning, warn) {
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
    }
    warn(warning);
}

export default {
    input: 'src/index.js',
    output: [{
            dir: 'dist/',
            format: 'esm',
            entryFileNames: 'visualify.js',
            inlineDynamicImports: true,
            sourcemap: false,
        },
        {
            dir: 'docs/static/js',
            format: 'esm',
            entryFileNames: 'visualify.js',
            inlineDynamicImports: true,
            sourcemap: false,
        },
    ],
    plugins: [
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        resolve({ browser: true }),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled',
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [inlineReactSvg],
        }),
        postcss({
            extensions: ['.css'],
            inject: true,
            minimize: true,
        }),
        url({
            include: ['**/*.svg'], // Only SVG files
            limit: 0, // 0 bytes
            emitFiles: true,
        }),
        commonjs(),
        terser(),
        json(),
        nodePolyfills(),
        image(),
    ],
    onwarn,
};