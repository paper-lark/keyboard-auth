import typescript from 'rollup-plugin-typescript';
import { uglify } from "rollup-plugin-uglify";
import pkg from './package.json';

export default {
  input: './src/index.ts',
  output: {
    file: 'lib/bundle.js',
    format: 'cjs'
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript(),
    uglify()
  ]
  // FIXME: minify node_modules too
  // FIXME: add cross-platform builds
  // FIXME: automate building a release
}