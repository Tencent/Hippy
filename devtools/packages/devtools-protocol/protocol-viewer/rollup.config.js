import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'pages/scripts/index.js',
  output: {
    file: '../site/devtools-protocol/scripts/index.js',
    format: 'esm',
  },
  plugins: [resolve(), terser()],
};
