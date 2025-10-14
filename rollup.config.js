import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

const isProduction = process.env.NODE_ENV === 'production';

const banner = `/**
 * riot-composables v${process.env.npm_package_version}
 * (c) ${new Date().getFullYear()}
 * @license MIT
 */`;

// Main bundle configuration
const mainConfig = {
  input: 'src/index.ts',
  external: ['riot'],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      banner,
      exports: 'named',
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true,
      banner,
      exports: 'named',
    },
    {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'RiotComposables',
      sourcemap: true,
      banner,
      globals: {
        riot: 'riot',
      },
    },
  ],
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: false, // 型定義は別途生成
    }),
    isProduction &&
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
  ].filter(Boolean),
};

// Type definitions configuration
const dtsConfig = {
  input: 'src/index.ts',
  external: ['riot'],
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
    banner,
  },
  plugins: [dts()],
};

export default [mainConfig, dtsConfig];
