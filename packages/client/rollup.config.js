import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default {
  input: './src/index.ts',
  output: {
    file: 'lib/bundle.js',
    format: 'cjs'
  },
  external: [
    // ...Object.keys(pkg.dependencies || {}),
    // ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript(),
    commonjs({extensions: ['.js', '.ts']})
  ]
  // TODO: minify node_modules too
}