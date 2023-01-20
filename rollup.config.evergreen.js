import resolve from '@rollup/plugin-node-resolve';
//import { getBabelOutputPlugin } from '@rollup/plugin-babel';
//import babel from '@rollup/plugin-babel';
//import commonjs from '@rollup/plugin-commonjs';

export default args => {
	let version = process.env.CHAIN_VERSION,
		name = process.env.CHAIN_GLOBAL_NAME
			.replace(
				/^(?:[^\/]*\/)?\w/gi, 
				function(m,o,s){
					return m.slice(-1).toUpperCase();
				}
		);
	return {
		input: 'src/index.js',
		output: {
			file: 'dist/chain.' + version + '.evergreen.js',
			format: 'umd',
			name: name
		},
		plugins:[
			resolve()
		]
	}
};