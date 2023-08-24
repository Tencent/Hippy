# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2-beta](https://github.com/Tencent/Hippy/compare/3.0.1...3.0.2-beta) (2023-08-22)

**Note:** Version bump only for package @hippy/react





## [3.0.1](https://github.com/Tencent/Hippy/compare/3.0.0...3.0.1) (2023-08-07)

**Note:** Version bump only for package @hippy/react





# [3.0.0](https://github.com/Tencent/Hippy/compare/2.2.1...3.0.0) (2023-06-29)


### Bug Fixes

* **hippy-react-web:**  fix hippy-react-web some issues ([#1850](https://github.com/Tencent/Hippy/issues/1850)) ([7a44339](https://github.com/Tencent/Hippy/commit/7a44339edcc7e396351f29e507e6fbabaa4676a1))
* **hippy-react:** add overflow scroll to fix listview unable to scroll ([41beca2](https://github.com/Tencent/Hippy/commit/41beca2c353c31c3258fef17b1be1c357e3e8e70))
* **hippy-react:** remove NetInfo duplicated EventEmitter creating ([6393dc3](https://github.com/Tencent/Hippy/commit/6393dc3cea6af87fe022398994baa6719601daea))
* **hippy-react:** support to emit multi parameters for HippyEvent ([ddfbf75](https://github.com/Tencent/Hippy/commit/ddfbf75a1eef98834978c2d2a278802fede82f65))
* **npm:** update lerna to fix vulernable npm package ([22ae601](https://github.com/Tencent/Hippy/commit/22ae601e50e7070b6290170938b984c85dac4940))
* **react,vue:** fix event register error ([67e92cf](https://github.com/Tencent/Hippy/commit/67e92cf572587a3092900a5bc8a46c7a098fe899))
* **react:** add ref null judgement for getElementFromFiberRef ([96b6640](https://github.com/Tencent/Hippy/commit/96b6640e69a76a1ada5ddcf67444e59cc92c814c))
* **react:** fix animation repeat event error ([407855b](https://github.com/Tencent/Hippy/commit/407855b09404b09951dc8f6db1789906590bb83b))
* **react:** listview initialListSize default value set to 15 ([a87b037](https://github.com/Tencent/Hippy/commit/a87b0378a51b541e486ba819614b2c62d75e7645))
* **vue:** fix regular expressions catastrophic backtracking ([1fe30ed](https://github.com/Tencent/Hippy/commit/1fe30eda6cf05e46bb929da53194cdba265c8887))
* **vue:** fix vue node sequence error ([27a3124](https://github.com/Tencent/Hippy/commit/27a312419c72a2a2742ba7f4264f610c96540f6f))


### Features

* **android,ios,js:** add getBoundingClientRect api ([#2914](https://github.com/Tencent/Hippy/issues/2914)) ([60f71e9](https://github.com/Tencent/Hippy/commit/60f71e9459b77b2f0a4cb39bcf3585ebd20a2640))
* **devtools:** change to debug-server-next ([bae90f0](https://github.com/Tencent/Hippy/commit/bae90f0e2b56281d741d8c2321eda94040c74b44))
* **hippy-react:** add HippyEvent to listen global events ([4f88ad2](https://github.com/Tencent/Hippy/commit/4f88ad20f7953ff192cf67d22105235bf24b5b13))
* **hippy-react:** support horizontal PullHeader & PullFooter ([983d098](https://github.com/Tencent/Hippy/commit/983d09821d11254494edebe6ef88be253c2cca9e))
* **hippy-vue:** support breakStrategy ([348183c](https://github.com/Tencent/Hippy/commit/348183cea800e267f999f765a08c39abb2c6e67c))
* **react,vue:** add collapsePullHeaderWithOptions api ([0b82e18](https://github.com/Tencent/Hippy/commit/0b82e18d20ebbb6370143fc590bd04340b39e7e4))
* **react,vue:** add isFoucus function ([b365a97](https://github.com/Tencent/Hippy/commit/b365a97a536e33318061b00cdece5ab7835c135d))
* **react,vue:** add tagName attribute to production mode ([bc67c5d](https://github.com/Tencent/Hippy/commit/bc67c5dec12e40c548c29de4dcfadf9a2c47dfc8))
* **react,vue:** perf print log logic & remove event attribute in props ([f1fbbf1](https://github.com/Tencent/Hippy/commit/f1fbbf198bbc5c2abc70379307f752ce70b7ee24))
* **react,vue:** support event capture & bubbling ([4b498d4](https://github.com/Tencent/Hippy/commit/4b498d46a5b481270588020f02eb71e080ccab7c))
* **react,vue:** use callUIFunction to call measureInWindow ([04468e0](https://github.com/Tencent/Hippy/commit/04468e0f55ffdfc241444e9f4ce98d3ce3b5dd8e))
* **react:** support fontWeight in number ([2ee66be](https://github.com/Tencent/Hippy/commit/2ee66bef7ce688659ecfa6155bad66890a973e60))


### Performance Improvements

* **react:** assign initialListSize if not undefined ([e1d1507](https://github.com/Tencent/Hippy/commit/e1d15070d656455f89399b826fa0c952dabac0ac))





## [2.2.1](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.2.0...2.2.1) (2020-12-28)

**Note:** Version bump only for package @hippy/react





# [2.2.0](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.1.6...2.2.0) (2020-12-25)

**Note:** Version bump only for package @hippy/react





## [2.1.6](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.1.5...2.1.6) (2020-12-23)


### Bug Fixes

* **hippy-react:** fixed hairlineWidth NaN in ios ([82faee1](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/82faee1f6693dce534ad97e18f4a42d9af1d2d9d))
* **hippy-vue,hippy-react:** compatible loadMore and endReached event ([#429](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/429)) ([d992cbe](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/d992cbefbd9a0f76bee70bf604df7d377a08e97c))


### Features

* **hippy-react:** added hippy-react boxShadow attr and demo ([#458](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/458)) ([6fd6a34](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/6fd6a342f7c0b7b6aa742eeee5c585e9e5a1d31b))





## [2.1.5](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.1.4...2.1.5) (2020-12-10)


### Bug Fixes

* **hippy-react:** continue finding nodeId if stringref's stateNode is a ([#442](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/442)) ([3860d3f](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/3860d3ff3c36299b1f973dedbede83bcf94fa9ad))





## [2.1.4](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.1.3...2.1.4) (2020-12-03)


### Bug Fixes

* **hippy-react:** fix pullHeader and pullFooter ([#420](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/420)) ([abfc574](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/abfc57401951acca4fb3fea72456784efcd4e926))


### Features

* **hippy-vue,hippy-react:** added setNativeProps on element ([#430](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/430)) ([d1f7e21](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/d1f7e216b5fef46ace0cf50803ad2940b429a0d6))
* **hippy-vue,hippy-react:** perf setNativeProps ([5cd1291](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/5cd12910262ad3bb15d07c2dc974a829958a2b86))





## [2.1.2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.1.1...2.1.2) (2020-11-23)


### Features

* **hippy-vue, hippy-react:** changeTryConvertNumberCompatibility ([714faaf](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/714faaf11988659b450a3276342597b7ed095a17))





## [2.1.1](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.1.0...2.1.1) (2020-11-11)


**Note:** Version bump only for package @hippy/react



# [2.1.0](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.0.3...2.1.0) (2020-10-29)


### Bug Fixes

* **hippy-react:** fix hippy-react animationSet destroy problem ([#382](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/382)) ([3c66ca6](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/3c66ca676d8f4fa3bc852492d24e533c617b252d))
* **hippy-react:** removed unncessary Object.values() ([8a68d44](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/8a68d44d7c7bd439b2be0badc542e9224685c76f))
* **hippy-react:** restore the ListView type props be number ([#367](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/367)) ([231ec5a](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/231ec5a37b41eb778b649e079ec5d6bbe712fb8f)), closes [/github.com/Tencent/Hippy/commit/9de74e331b797c2137b1d0e3d08cd0dde0ee821a#diff-ccaf44058906717491bd079958ea5684a93acaa5d726e22cb34c0a6c82c79](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/diff-ccaf44058906717491bd079958ea5684a93acaa5d726e22cb34c0a6c82c79)
* **hippy-vue:** fix hippy-vue transform multi-animation not working ([84bd58b](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/84bd58be840ea3f5ddd9d387e92b5a084387e9d1))


### Features

* **hippy-react:** add new method measureInAppWindow ([e25bb67](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/e25bb676942b89fbb57601d7c4ac2c9ce8ec175f))
* **hippy-react:** added PullHeader and PullFooter components support ([2fcdee9](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/2fcdee9b3ef290f40a25321c978a0c232299b06a))




## [2.0.3](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/compare/2.0.2...2.0.3) (2020-04-23)


### Bug Fixes

* **hippy-react:** drop Object.entries() for lower iOS compatible ([d76b074](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/d76b074b7ed2536422be6052c56165be83b341c2))


### Features

* **hippy-react:** merge createNode operation ([#200](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/issues/200)) ([04d77a0](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/04d77a074c5d43cbf4bfa0cc40c513167314addc))
* **hippy-react-web:** added default export for hippy-react web ([62cbdb0](https://github.com/Tencent/Hippy/tree/master/packages/hippy-react/commit/62cbdb0cb7d65c989439e1d7ffb0a5fa1143eddd))





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