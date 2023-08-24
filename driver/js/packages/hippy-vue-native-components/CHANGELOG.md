# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2-beta](https://github.com/Tencent/Hippy/compare/3.0.1...3.0.2-beta) (2023-08-22)

**Note:** Version bump only for package @hippy/vue-native-components





## [3.0.1](https://github.com/Tencent/Hippy/compare/3.0.0...3.0.1) (2023-08-07)

**Note:** Version bump only for package @hippy/vue-native-components





# [3.0.0](https://github.com/Tencent/Hippy/compare/2.2.1...3.0.0) (2023-06-29)


### Bug Fixes

* **hippy-vue:** fix dialog default style not take effect ([195a06b](https://github.com/Tencent/Hippy/commit/195a06bbb027473cf72374895c99b0b9d098ff4f))
* **vue:** make sure start animation after node created ([478307f](https://github.com/Tencent/Hippy/commit/478307f94322d2af0af15fbd5c88cb2189d3fbcd))


### Features

* **hippy-vue:** add animaiton actionsDidUpdate hook ([24fea20](https://github.com/Tencent/Hippy/commit/24fea20394d2b4d370d86ac40000424458883930))
* **hippy-vue:** change animation module ([1e3cd60](https://github.com/Tencent/Hippy/commit/1e3cd60b4b8f63c95a5f5a0c5bd6072f89bf8269))
* **react,vue:** add collapsePullHeaderWithOptions api ([0b82e18](https://github.com/Tencent/Hippy/commit/0b82e18d20ebbb6370143fc590bd04340b39e7e4))





## [2.1.2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/compare/2.1.1...2.1.2) (2020-11-23)

**Note:** Version bump only for package @hippy/vue-native-components





## [2.1.1](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/compare/2.1.0...2.1.1) (2020-11-11)


### Bug Fixes

* **hippy-vue:** fixed tryConvertNumber bug & some compatible issue ([ba8836d](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/commit/ba8836d9b3c3461f013d325c0e86c84233e3ede6))



# [2.1.0](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/compare/2.0.3...2.1.0) (2020-10-29)


### Bug Fixes

* **hippy-vue:** fix hippy-vue transform multi-animation not working ([84bd58b](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/commit/84bd58be840ea3f5ddd9d387e92b5a084387e9d1))
* **swiper:** fixed props passing ([3081d69](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/commit/3081d6999fe7ce7556798d41caaa5bdee5907fb3))


### Features

* **hippy-vue:** added pull-header and pull-footer components support ([3fbc862](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/commit/3fbc86230eef085fe1e33efc53c8507bf3598233))





## [2.0.3](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/compare/2.0.2...2.0.3) (2020-04-23)

**Note:** Version bump only for package @hippy/vue-native-components





## [2.0.2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/compare/2.0.1...2.0.2) (2020-03-18)

### Features

* **vue-native-components:** added stateChanged event handler to swiper ([71760cc](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue-native-components/commit/71760cccf15a819c644efaa1e084a96fcc4e856e))

## 2.0.1 (2020-01-22)

### Change

* Rename to @hippy/vue-native-components.

## 2.0.0 (2019-12-18)

### Change

* Removed the npm namespace prefix '@tencent', restore to version 2.0.0, and make it public.

## 1.0.0-beta.8 (2019-07-12)

### Added

* Added immersionStatusBar: true to dialog default props

## 1.0.0-beta.7 (2019-06-18)

### Fixed

* Make animation start in nextTick for iOS compatible

## 1.0.0-beta.6 (2019-05-21)

### Fixed

* Use the last repeatCount of Animation be the AnimationSet repeatCount

## 1.0.0-beta.5 (2019-03-08)

### Added

* Added transparent props to <dialog> module to fit iOS to Android.