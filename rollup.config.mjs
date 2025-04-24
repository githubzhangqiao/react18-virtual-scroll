import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts', // 入口文件（TypeScript）
  output: {
    file: 'dist/bundle.js', // 输出文件
    format: 'esm',        // 输出格式（esm / cjs / umd / iife）
    sourcemap: true,      // 生成 sourcemap（可选）
  },
  plugins: [
    resolve(),            // 解析 node_modules 中的模块
    commonjs(),           // 转换 CommonJS 模块（如果依赖了 CommonJS）
    typescript(),         // 编译 TypeScript
  ],
};