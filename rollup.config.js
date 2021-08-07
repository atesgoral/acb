import {defineConfig} from 'rollup';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default defineConfig({
  input: 'src/index.ts',
  external: ['stream-parser', 'stream'],
  plugins: [typescript({tsconfig: './tsconfig.json'})],
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ]
});
