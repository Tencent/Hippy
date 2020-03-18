# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react-web/compare/2.0.1...2.0.2) (2020-03-18)


### Bug Fixes

* **react-web:** image callback error ([1776634](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react-web/commit/1776634552356d32dcb51e2e98ce1e797788dd3c))
* **react-web:** listView not work in dev mode ([44a539f](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react-web/commit/44a539fc978e70294b0f30707912aa80dc6652d3))
* **react-web:** updateAnimation support zero ([0ec1dc8](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react-web/commit/0ec1dc87aee14660954799c4a89a6d4584a4afe9))


### Features

* **react-web:** support multiple instance ([c5fb93b](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react-web/commit/c5fb93be6e40f14f731a6f5dd750254bc049838d))
* **react-web:** text support clip mode ([516fa98](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react-web/commit/516fa988c6e616c3a49790d83b06ff4d6ff6d9fd))


## 2.0.1 (2020-01-22)

### Change

* Rename to @hippy/react-web.

## 2.0.0 (2019-12-18)

### Change

* Removed the npm namespace prefix '@tencent', restore to version 2.0.0, and make it public.

## 1.0.0-beta.7 (2019-10-29)

### Fixed

* Change Dimensions.get('window') from document to window.
* Fixed transform rotateZ animation unit issue.

## 1.0.0-beta.6 (2019-06-25)

### Fixed

* Fixed Dimensions.window.

* Fixed animation for rotate transform and opacity issue.

## 1.0.0-beta.5 (2019-06-19)

### Added

* Added VideoPlayer component.

### Fixed

* Fixed determine Animation class name with constructor name issue.
* Fixed the lower version browser that can't support flex.

## 1.0.0-beta.4 (2019-05-27)

### Added

* Just for test wechat robot.

## 1.0.0-beta.3 (2019-05-27)

### Added

* #1 - Make ref be able to access for View. @cesoxiong

### Change

* #3 - Initialize leftSetRepeatCount when Animation start.

### Fixed

* Migrate Object.entries() to Object.keys() for lower browser compatible.

## 1.0.0-beta.2 (2019-05-13)

### Added

* Added more components/modules from hippy-react, and issue fixed.

## 1.0.0-beta.1 (2019-05-10)

### Added

* Initial commit, based on saizhao and rickiezheng's working.
