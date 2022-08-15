# Web Integration

This tutorial shows how to integrate Hippy into a Web page.

> Different from @hippy/react-web and @hippy/vue-Web, this solution (Web Renderer) will not replace @hippy/react and @hippy/vue. Instead, the bundle running in the native environment will run intactly on the Web, which has advantages and disadvantages with Web translation solution. Application can adopt appropriate solution according to specific scenarios

## Preparation

- Template file: An HTML file is required as an entry for web working
- Entry file: WebRenderer is a running environment of the Hippy bundle, so it does not share the JS entry file, and should create an independent entry file for it

## Experience the demo

For a quick experience, you can base it directly on our [HippyReact Web Demo](https://github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) and
[HippyVue Web Demo](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)

### npm script

In the Demo project, run the `web:dev` command to start the WebRenderer debugging service, and run the `web:build` to package.

```json
  "scripts": {
    "web:dev": "npm run hippy:dev & cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider webpack serve --config ./scripts/hippy-webpack.web-renderer.dev.js",
    "web:build": "cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider webpack --config ./scripts/hippy-webpack.web-renderer.js"
  }
```

### Start debugging

Run `npm run web:dev` to start WebRenderer debugging. According to the Webpack configuration of the demo, the WebRenderer web service runs on port `3000`, the browser accesses the page through `http://localhost:3000`.

## Quick access

The execution of WebRenderer should comply with the following process:

1. Import the WebRenderer: This stage will initialize the environment for the Hippy code to run
2. Load the application bundle: This bundle is consistent with the bundle package running on the native side
3. Start WebRenderer: This stage will load hippy built-in components and modules, or custom components and modules

### Import WebRenderer

#### Use in CDN mode

Add these code to the template file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
    <title>Example</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- web renderer cdn url -->
    <!-- Hippy does not provide CDN resource management and needs to be uploaded by the application itself -->
    <script src="//xxx.com/lib/hippy-web-renderer/0.1.1/hippy-web-renderer.js"></script>
    <script src="src/index.ts"></script>
  </body>
</html>
```

#### Use in NPM package mode

```shell
npm install -S @hippy/web-renderer
```

Add to the entry file:

```javascript
// 1. import web renderer
import { HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

// 2. Import the entry file of the application bundle after the web renderer import

// 3. Create the web engine. If there are application custom modules and components, pass them in from here
```

### Load application bundle

There are multiple ways to load the bundle package, which can be flexibly selected according to application needs. Just ensure that the import order is after the WebRenderer

#### Reference and load in the template file

```html
<script src="//xxx.com/lib/hippy-web-renderer/0.1.1/hippy-web-renderer.js"></script>
<!-- application bundle -->
<script src="//xxx.com/hippy-biz/index.bundle.js"></script>
<!-- entry file -->
<script src="src/index.ts"></script>
```

#### Load dynamically in the entry file

```javascript
import { HippyWebEngine } from '@hippy/web-renderer';

const engine = HippyWebEngine.create();

 engine.load('https://xxxx.com/hippy-bundle/index.bundle.js').then(() => {
  engine.start({
    id: 'root',
    name: 'example',
  });
});
```

#### Import from source code

```javascript
import { HippyCallBack, HippyWebEngine, HippyWebModule, View } from '@hippy/web-renderer';
// Import the entry file of the application bundle after the web renderer import
import './main';


const engine = HippyWebEngine.create();
```

### Start the WebRenderer

After the application bundle is loaded, the relevant API is invoked to create and start the WebRenderer

```js
// Create the web engine. If there are application custom modules and components, pass them in from here
// If only official modules and components are used, directly use const engine = hippywebengine Create()
const engine = HippyWebEngine.create({
  modules: {
    CustomCommonModule,
  },
  components: {
    CustomPageView,
  },
});

// Start the web renderer
engine.start({
  // Mounted dom id
  id: 'root',
  // Module name
  name: 'module-name',
  // The module startup parameters are customized by the service,
  // hippy-react can be obtained from the props entry file, and hippy-vue can be obtained from app.$options.$superProps
  params: {
    path: '/home',
    singleModule: true,
    isSingleMode: true,
    business: '',
    data: { },
  },
});
```
