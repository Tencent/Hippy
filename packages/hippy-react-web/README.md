# Hippy React Web

> Web adapter for hippy-react.

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

## Introduction

<<<<<<< HEAD
`hippy-react-web` is the web adapter for `hippy-react`, it keeps the same interface with `hippy-react`
=======
`@hippy/react-web` is the web adapter for `hippy-react`, it keeps the same interface with `hippy-react`
>>>>>>> upstream/master
To make hippy-react app running in web browser.

The project is still working progress, contributions are welcome.

## How to use

Make a alias in webpack config for web building will be ok.

```javascript
// webpack-production.js
module.exports = {
  // ...
  // Other configs
  resolve: {
    alias: {
      // Make the the hippy-react-web alias to hippy-react
      '@hippy/react': '@hippy/react-web',
    },
  },
};
```

## Project progress

| Working    | Not Working    |
| ---------- | -------------- |
| View       | RefreshWrapper |
| Text       | Navigator      |
| Animation  | Modal          |
| Image      | NetInfo        |
| ListView   |                |
| ScrollView |                |
| TextInput  |                | 
| ViewPager  |                |
| WebView    |                |
| VideoPlayer|                |
| Slider     |                |
| TabHost    |                |
