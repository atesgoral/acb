import pkg from './package.json';

export default {
  input: 'src/index.js',
  external: ['stream-parser'],
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' }
  ]
};
