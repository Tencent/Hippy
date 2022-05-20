# hippy-vue-router

> This is a fork of [vue-router](https://github.com/vuejs/vue-router) for working together with [hippy-vue](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue) in native environment.

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg)

### Introduction

`hippy-vue-router` is the official router for `hippy-vue`. It deeply integrated with hippy-vue to make building Native Application with hippy-vue a breeze. It's supported all of features of vue-router, and will support following features:

1. Android hardware back button to navigate to previous page.
2. Safe area wrapper for hippy-vue app to compatible different hardware.

### Development Setup

The developing line is following the mainstream vue-router, master branch is the vue-router's remote `dev` branch, All of features will append to `feature/hippy-vue`  after original `dev` branch.

All of core feature/bug fixes please PR to vue-router.

``` bash
# install deps
npm install

# build dist files
npm run build

# serve examples at localhost:8080
npm run dev

# lint & run all tests
npm test

# serve docs at localhost:8080
npm run docs
```

## Questions

For questions and support please file a new issue. The issue list of this repo is **exclusively** for bug reports and feature requests.

## Issues

Please make sure to read the [Issue Reporting Checklist](https://github.com/vuejs/vue/blob/dev/.github/CONTRIBUTING.md#issue-reporting-guidelines) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## Contribution

Please make sure to read the [Contributing Guide](https://github.com/vuejs/vue/blob/dev/.github/CONTRIBUTING.md) before making a pull request.

## Changelog

Details changes for each release are documented in the [release notes](https://github.com/vuejs/vue-router/releases).

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2013-present Evan You
