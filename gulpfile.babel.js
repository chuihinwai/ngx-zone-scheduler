import del from 'del';
import fs from 'fs';
import gulp from 'gulp';
import yaml from 'js-yaml';
import { posix as path } from 'path';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import webpack from 'webpack';

const settings = yaml.safeLoad( fs.readFileSync( path.resolve( 'build-settings.yaml' ), 'utf8' ) );

export const clean = () => del( [ 'dist' ] ); 

function getWebpackCompiler() {
	const loaders = {
		tslint: { loader: 'tslint-loader', options: settings.options.tslint },
		typescript: { loader: 'awesome-typescript-loader', options: settings.options.typescript }
	};

	return webpack( {
		devtool: 'source-map',
		entry: {
			index: path.resolve( 'src/index' )
		},
		externals: {
			'@angular/core': '@angular/core',
			'rxjs/scheduler/AsyncAction': 'rxjs/scheduler/AsyncAction',
			'rxjs/scheduler/AsyncScheduler': 'rxjs/scheduler/AsyncScheduler',
			tslib: 'tslib'
		},
		module: {
			rules: [
				{ test: /\.ts$/, exclude: /node_modules/, enforce: 'pre', loaders: [ loaders.tslint ] },
				{ test: /\.ts$/, loaders: [ loaders.typescript ] }
			]
		},
		output: {
			filename: 'dist/[name].js',
			libraryTarget: 'commonjs'
		},
		plugins: [
			// new UglifyJsPlugin( {
			// 	uglifyOptions: settings.options.uglify,
			// 	sourceMap: true,
			// 	parallel: false
			// } )
		],
		resolve: {
			extensions: [ '.ts', '.js' ]
		}
	} );
}

export const buildWebpack = async () => {
	const compiler = getWebpackCompiler();

	const stats = await new Promise( ( resolve, reject ) => {
		compiler.run( ( error, stats ) => {
			if( error ) reject( error );
			else resolve( stats );
		} );
	} );
	const statsOutput = stats.toString( 'errors-only' );
	if( statsOutput ) console.log( statsOutput );
};

export const build = gulp.parallel( buildWebpack );

export const watchWebpack = () => {
	const compiler = getWebpackCompiler();

	compiler.watch( {}, ( error, stats ) => {
		if( error ) {
			console.error( error );
			return;
		}
		const statsOutput = stats.toString( 'errors-only' );
		if( statsOutput ) console.log( statsOutput );
	} );
};

export const watch = gulp.parallel( watchWebpack );

export default gulp.series( clean, build );
