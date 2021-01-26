import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: {
    exports: 'named',
    format: 'es',
    file: 'dist/worker.mjs',
    sourcemap: true,
  },

  plugins: [typescript(), nodeResolve({ browser: true }), commonjs(), terser()],
};
