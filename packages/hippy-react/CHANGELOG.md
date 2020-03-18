# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.0.1...2.0.2) (2020-03-18)


### Bug Fixes

* **hippy-react:** callUIFunction supports passing  as targetNode ([f7c8391](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/f7c83911622140db9f3f5ac9eba44aefe44cd4ce))
* **hippy-react:** change the NODE_ENV to 'development' ([2585bc5](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/2585bc5f3f28816c7ff1f4bdf210011508e7d2e8))
* **hippy-react:** text component text repeated rendering ([96e278d](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/96e278d33c3bd18cdec6c839cc5454c5c3479224))
* **hippy-react:** text nest ([da5ca3b](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/da5ca3b45cad28659bf0c6bacc90a1a64658d906))
* **hippy-react:** text-input style ([a9fa8d1](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/a9fa8d1e896c5d5ee62c8ef09d6b32de85124618))
* **hippy-react:** ui operation merge ([9b4f77d](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/9b4f77dfa54a0747efccec3beee6db170c3848cd))


### Features

* **vue-native-components:** added stateChanged event handler to swiper ([71760cc](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/71760cccf15a819c644efaa1e084a96fcc4e856e))


## 2.0.1 (2020-01-22)

### Change

* Rename to @hippy/react.

## 2.0.0 (2019-12-18)

### Change

* Removed the npm namespace prefix '@tencent', restore to version 2.0.0, and make it public.

## 2.0.1 (2019-12-11)

### Added

* Added `silent` option for disable the framework log.

### Fixed

* Fixed nesting `<Text>` rendering issue.

## 2.0.0 (2019-11-21)

### Changed

* Nothing different with beta.11 but released.

## 2.0.0-beta.11 (2019-11-14)

### Changed

* Changed deleteNode with children to childNode only.

### Fixed

* Fixed array and object mixed style
* Fixed style determine issue

## 2.0.0-beta.10 (2019-11-07)

### Fixed

* Fixed parse color issue

## 2.0.0-beta.9 (2019-11-07)

### Fixed

* Fixed `<Text>` nesting issue.

## 2.0.0-beta.8 (2019-11-06)

### Fixed

* Fixed `<Text>` component meets null in children array issue.

## 2.0.0-beta.7 (2019-11-05)

### Changed

* Nothing changed, but tnpm crashes.

## 2.0.0-beta.6 (2019-10-25)

### Fixed

* Restored onPageScrollStateChanged event handler for ViewPager.

## 2.0.0-beta.5 (2019-10-25)

### Fixed

* Fixed Text component meets number children warning.

## 2.0.0-beta.3 (2019-10-22)

### Added

* Added type definition of Typescript

### Fixed

* Fixed compatible issues with QB

## 1.1.9 (2019-09-16)

### Added

* Passthrough the props to Modal directly.

## 1.1.8 (2019-08-23)

### Added

* Add IOS ViewPager onPageScrollStateChanged - thx @victoryin

## 2.0.0-beta.1 (2019-07-18)

### Changed

* Brand new hippy-core architecture.

## 1.1.7 (2019-07-16)

### Changed

* Restored ScrollView scrollTo method, and added scrollToWithDuration method

## 1.1.6 (2019-07-15)

### Added

* Added onRowLayout event handler to ListView.

### Fixed

* Fixed ScrollView scrollTo method compatible issue.

## 1.1.4 (2019-07-10)

### Added

* Added setValue method to TextInput

### Changed

* Changed ScrollView's scrollTo method animated option to duration.

### Fixed

* Fixed keyboardHeight to dp for Android.

## 1.1.3 (2019-07-01)

### Fixed

* Fixed animation meets undefined issue - thx @calvinma.

## 1.1.2 (2019-06-24)

### Fixed

* Fixed Text style meets null issue.

## 1.1.1 (2019-06-19)

### Changed

* Changed default Text color to black - #000.

### Fixed

* Fixed mobx compatibility - Thx @daringuo and @calvinma

## 1.1.0 (2019-06-13)

### Added

* Added default color style to Text
* Added Clipboard module

### Changed

* Dropped web adapter

### Fixed

* Fixed redux 5.x compatible -- Thanks @calvinma

## 1.1.0-beta.1 (2019-05-13)

### Added

* Added default text color to style.

### Changed

* Removed web adapter
