# 转 Web

hippy-react 通过 [@hippy/react-web](//www.npmjs.com/package/@hippy/react-web) 库来将 Hippy 应用转译、运行在浏览器中。

> 该项目仍在开发中，有不完善的地方，欢迎 PR。

# 安装运行时依赖

请使用 `npm i` 安装以下 npm 包，保证转 Web 运行时正常。

| 包名            | 说明                              |
| --------------- | --------------------------------- |
| bezier-easing   | hippy-react 动画在 Web 运行时需要 |
| hippy-react-web | hippy-react 转 Web 适配器         |
| react-dom       | react 的 Web 的渲染器             |

# 编译时依赖

以官方提供的 [范例工程](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) 范例工程为例，需要使用 `npm i -D` 准备好以下依赖，当然开发者可以根据需要自行选择：

| 包名                | 说明                          |
| ------------------- | ----------------------------- |
| css-loader          | Webpack 插件 - 内联样式转 CSS |
| html-webpack-plugin | Webpack 插件 - 生成首页 html  |
| style-loader        | Webpack 插件 - 内联样式       |
| webpack-dev-server  | Webpack 网页端调试服务        |

# 终端开发调试用编译配置

该配置展示了将 Hippy 运行于 Web 的最小化配置，并未包含分包等内容，开发者可以自行扩展。

和 hippy-react 的主要区别在于做了一个 hippy-react 到 hippy-react-web 的 [alias](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.web.js#L80)，使之可以不用修改代码直接运行。

| 配置文件                                                     | 说明       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.web.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.web.js) | 调试用配置 |

# 入口文件

hippy-react-web 和 hippy-react 的启动参数一致，可以共享同一个 `main.js` 入口文件。

# npm script

hippy-react-web 使用了 [webpack-dev-server](//webpack.js.org/configuration/dev-server/) 来启动调试，可以支持全部的 Web 调试特性，而同时使用同一份配置文件换而使用 webpack 进行打包。

这里的命令其实参考了 vue-cli 生成的 Vue 项目，通过 `serve` 启动调试服务，通过 `build` 编译出 JS 包。

```json
  "scripts": {
    "serve": "webpack-dev-server --config ./scripts/hippy-webpack.web.js",
    "build": "webpack --config ./scripts/hippy-webpack.web.js",
  }
```

# 启动调试

执行 `npm run serve` 后就会启动 Web 调试，但要注意默认生成的 HTML 文件名是从 `package.json` 的 `name` 字段定义，而不是默认的 `index.html`，所以对于官方范例，需要使用 `http://localhost:8080/hippy-react-demo.html` 来访问调试用页面。
