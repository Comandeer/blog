import crypto from 'node:crypto';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import { cwd } from 'node:process';
import { compileAsync } from 'sass';
import { minify } from 'terser';

/**
 * @type {Map<string, string>}
 */
const hashedAssets = new Map();

export function assetPipeline( eleventyConfig ) {
	eleventyConfig.on( 'eleventy.before', async () => {
		const distPath = resolvePath( cwd(), 'dist', 'assets' );

		await mkdir( distPath, {
			recursive: true
		} );
		await compileSCSS();
		await compileJS();
	} );

	eleventyConfig.addFilter( 'asset', ( asset ) => {
		return hashedAssets.get( asset ) ?? asset;
	} );
}

async function compileSCSS() {
	const { css } = await compileAsync( 'src/assets/main.scss', {
		style: 'compressed'
	} );
	const hash = await hashString( css );
	const filePath = resolvePath( cwd(), 'dist', 'assets', `main-${ hash }.css` );

	await writeFile( filePath, css, 'utf-8' );
	hashedAssets.set( '/assets/main.css', `/assets/main-${ hash }.css` );
}

async function compileJS() {
	const jsAssets = new Map( [
		[ 'assets/main.js', 'assets/main-{{hash}}.js' ],
		[ 'sw.js', 'sw-{{hash}}.js' ]
	] );

	/* eslint-disable no-await-in-loop */
	for ( const [ srcRelativePath, distPathTemplate ] of jsAssets ) {
		const srcPath = resolvePath( cwd(), 'src', srcRelativePath );
		const content = await readFile( srcPath, 'utf-8' );
		const { code } = await minify( content, {
			module: true
		} );
		const hash = await hashString( code );
		const distRelativePath = distPathTemplate.replaceAll( '{{hash}}', hash );
		const distPath = resolvePath( cwd(), 'dist', distRelativePath );

		await writeFile( distPath, code, 'utf-8' );
		hashedAssets.set( `/${ srcRelativePath }`, `/${ distRelativePath }` );
	}
	/* eslint-enable no-await-in-loop */
}

/**
 * @param {string} string
 * @returns {Promise<string>}
 */
async function hashString( string ) {
	return crypto.
		createHash( 'sha512' ).
		update( string ).
		digest( 'hex' ).
		slice( 0, 8 );
}
