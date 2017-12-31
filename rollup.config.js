import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

const pkg = require('./package.json');
const external = Object.keys(pkg.dependencies);

export default {
  input: 'src/index.js',
  plugins: [
    babel(babelrc({
      addModuleOptions: false,
    })),
  ],
  external,
  exports: 'named',
  globals: {
    lodash: '_',
    redux: 'redux',
    'perfect-immutable': 'perfectImmutable',
  },
  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'redux-breeze',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
};
