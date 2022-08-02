# hippy-vue-next示例
本项目为hippy-vue-next示例项目

### 快速上手 / Start

0、进入项目根目录

1、安装pnpm（已安装则不需要）

npm install -g pnpm

2、安装依赖
pnpm install

3、构建
pnpm run build-all

构建出样式parser、框架以及构建插件

4、运行demo

进入packages/example目录
运行 pnpm run vite:build-dev 使用 vite 构建出开发 bundle
或
运行 pnpm run webpack:build-dev 使用 webpack 构建出开发 bundle

5、开发 debug
vite
先运行 pnpm run demo:debug，然后插入手机连接（需要有ADB）。具体调试方法可以看Hippy调试文档

webpack
第4步运行了webpack:build-dev即可，插入手机连接并进行debug
