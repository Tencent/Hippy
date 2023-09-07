# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2-beta](https://github.com/Tencent/Hippy/compare/3.0.1...3.0.2-beta) (2023-08-22)


### Bug Fixes

* **vue:** fix node not mounted when move ([74d6444](https://github.com/Tencent/Hippy/commit/74d6444f63adaa92faed306f5997bc8447a28101))





## [3.0.1](https://github.com/Tencent/Hippy/compare/3.0.0...3.0.1) (2023-08-07)


### Bug Fixes

* **vue:** fix rootview conditional statement ([#3355](https://github.com/Tencent/Hippy/issues/3355)) ([5364548](https://github.com/Tencent/Hippy/commit/5364548e5f3cb11d501b79989419e3608c2562da))





# [3.0.0](https://github.com/Tencent/Hippy/compare/2.2.1...3.0.0) (2023-06-29)


### Bug Fixes

* **hippy-vue:** fix referendeNode not found error ([4c52546](https://github.com/Tencent/Hippy/commit/4c52546474190cec9d29ead5b7cafb35f9ce2bb2))
* **hippy-vue:** remove unused code ([3977dd4](https://github.com/Tencent/Hippy/commit/3977dd46567f0a7dbcb19314ae228650b24a91a6))
* **hippy-vue:** use non-skipAddToDom node for referencen node ([04db6e0](https://github.com/Tencent/Hippy/commit/04db6e0ad3c947ebbacae5c231d33cad134018ce))
* **npm:** update got from vulnerable to safe version ([93cf4d8](https://github.com/Tencent/Hippy/commit/93cf4d8e3752143c62dae49c3318ef6316abf134))
* **npm:** update vulnerable npm packages ([a5897fa](https://github.com/Tencent/Hippy/commit/a5897fafea94d9fd25977bb4c30db55704a10903))
* **react,vue:** fix event register error ([67e92cf](https://github.com/Tencent/Hippy/commit/67e92cf572587a3092900a5bc8a46c7a098fe899))
* **vue3:** fix listViewItem disappear event not triggered ([b14d4c4](https://github.com/Tencent/Hippy/commit/b14d4c485659bf90ec714df979f797bad19ce730))
* **vue:** fix regular expressions catastrophic backtracking ([1fe30ed](https://github.com/Tencent/Hippy/commit/1fe30eda6cf05e46bb929da53194cdba265c8887))
* **vue:** fix static style not updated in some case ([68be47a](https://github.com/Tencent/Hippy/commit/68be47acf6499bc55eabc4669ea0704fc3edfb7f))
* **vue:** fix vNode element empty error ([de7dc93](https://github.com/Tencent/Hippy/commit/de7dc93b7785ed8cac780758d69199fa41aacfd8))
* **vue:** fix vue node sequence error ([27a3124](https://github.com/Tencent/Hippy/commit/27a312419c72a2a2742ba7f4264f610c96540f6f))
* **vue:** fix vue style diff error ([6e067d3](https://github.com/Tencent/Hippy/commit/6e067d3550b837ecfd43a34085b0f682b56cd182))
* **vue:** fix web-renderer script ([d5577ee](https://github.com/Tencent/Hippy/commit/d5577ee8b8c92e80ed5574bf1d7187ec9117882f))
* **vue:** not to move node when refNode is same as newNode ([4b718fe](https://github.com/Tencent/Hippy/commit/4b718feafd70cd936062194a107beef309c47fd3))
* **vue:** perf style diff ([8fc1a5e](https://github.com/Tencent/Hippy/commit/8fc1a5ec47e0ed1ddfd0b04749596a3c625d4211))
* **vue:** set id for root view to fix style missed ([8c38d29](https://github.com/Tencent/Hippy/commit/8c38d2921125a81b497e5445d5528aa87763033a))
* **vue:** support static style diff in updateNode ([dd32e19](https://github.com/Tencent/Hippy/commit/dd32e19d5359e5c264703e90a87a0f069eecf892))


### Features

* **android,ios,js:** add getBoundingClientRect api ([#2914](https://github.com/Tencent/Hippy/issues/2914)) ([60f71e9](https://github.com/Tencent/Hippy/commit/60f71e9459b77b2f0a4cb39bcf3585ebd20a2640))
* **hippy-vue:** change node api to lowercase ([42f06c5](https://github.com/Tencent/Hippy/commit/42f06c5a1d83fadf58e3bea67c7791e735a233cc))
* **hippy-vue:** perf attribute & style update performance ([e7272ef](https://github.com/Tencent/Hippy/commit/e7272efec40a55f3b4036c221d40ad0346b10b71))
* **hippy-vue:** perf attribute update ([55174ed](https://github.com/Tencent/Hippy/commit/55174ed47208d6aac65adc9fd8066941509b54a9))
* **hippy-vue:** support breakStrategy ([348183c](https://github.com/Tencent/Hippy/commit/348183cea800e267f999f765a08c39abb2c6e67c))
* **hippy-vue:** support once modifier ([04a5e8a](https://github.com/Tencent/Hippy/commit/04a5e8acafcbf13afa0672ba1ca771d3da8a6818))
* **ios,android,vue:** add load result param for webView's onLoadEnd api ([#2668](https://github.com/Tencent/Hippy/issues/2668)) ([e9eb76e](https://github.com/Tencent/Hippy/commit/e9eb76e45ce78ef288af01be90680662bb2b4ac7))
* **react,vue:** add isFoucus function ([b365a97](https://github.com/Tencent/Hippy/commit/b365a97a536e33318061b00cdece5ab7835c135d))
* **react,vue:** add tagName attribute to production mode ([bc67c5d](https://github.com/Tencent/Hippy/commit/bc67c5dec12e40c548c29de4dcfadf9a2c47dfc8))
* **react,vue:** perf print log logic & remove event attribute in props ([f1fbbf1](https://github.com/Tencent/Hippy/commit/f1fbbf198bbc5c2abc70379307f752ce70b7ee24))
* **react,vue:** support event capture & bubbling ([4b498d4](https://github.com/Tencent/Hippy/commit/4b498d46a5b481270588020f02eb71e080ccab7c))
* **react,vue:** use callUIFunction to call measureInWindow ([04468e0](https://github.com/Tencent/Hippy/commit/04468e0f55ffdfc241444e9f4ce98d3ce3b5dd8e))
* **vue3.0:** change unit test for hippy3.0 ([53ed799](https://github.com/Tencent/Hippy/commit/53ed7999cdc7820e652bf09252ea173bac696cd6))
* **vue3:** support vue3 for hippy3.0 ([5923ea8](https://github.com/Tencent/Hippy/commit/5923ea80778a6ef5eecf49a3dd8de80f42266663))
* **vue:** add beforeRenderToNative hook to support computed style ([0220dc4](https://github.com/Tencent/Hippy/commit/0220dc4f815b94730da587d0ba3987fbf14b21af))
* **vue:** add getElemCss scoped judgement ([46d30f3](https://github.com/Tencent/Hippy/commit/46d30f3e6023864681a2d8fd219f80af3ddd8faf))
* **vue:** add native event parameters ([72fc39c](https://github.com/Tencent/Hippy/commit/72fc39c5fdb1c892e8ec978ed9b18885091b7064))
* **vue:** add whitespace handler config ([9ed39d7](https://github.com/Tencent/Hippy/commit/9ed39d704ca6fc66f704898f4c5265756550675b))
* **vue:** fix attribute selector & support deep selector ([875d8ee](https://github.com/Tencent/Hippy/commit/875d8eea849cbd03b566aed18e5b159f27a0b6bb))
* **vue:** perf first screen attributes node update ([53919fa](https://github.com/Tencent/Hippy/commit/53919fa97ff1a01a6ab58cab48b2cdcf91373dc5))
* **vue:** support scoped & attribute selector ([d72d9f8](https://github.com/Tencent/Hippy/commit/d72d9f8486d5f5c93ee09b26f641c48c8f1a7d5a))
* **vue:** support ScrollView & ListView scroll related event params ([4b8bcd9](https://github.com/Tencent/Hippy/commit/4b8bcd9473995429dd809004f2fe117fa2fe9f85))
* **vue:** support to merge styles on root element of child component ([a9c4f37](https://github.com/Tencent/Hippy/commit/a9c4f37c5d24b889ebda553d97b7bc012cd068f7))


### Performance Improvements

* **vue:** ignore to append existed node to improve router performance ([5c3a7ef](https://github.com/Tencent/Hippy/commit/5c3a7efc0fd3be8b19af4a1559d851fc73563e52))
* **vue:** refer native script source code to reduce number of loops ([c09818b](https://github.com/Tencent/Hippy/commit/c09818baefc8a947451fedcc8354d3e2fba819c2))





## [2.2.1](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.2.0...2.2.1) (2020-12-28)

**Note:** Version bump only for package @hippy/vue





# [2.2.0](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.1.6...2.2.0) (2020-12-25)

**Note:** Version bump only for package @hippy/vue





## [2.1.6](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.1.5...2.1.6) (2020-12-23)


### Bug Fixes

* **hippy-vue,hippy-react:** compatible loadMore and endReached event ([#429](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/issues/429)) ([d992cbe](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/d992cbefbd9a0f76bee70bf604df7d377a08e97c))


### Features

* **hippy-react:** added hippy-react boxShadow attr and demo ([#458](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/issues/458)) ([6fd6a34](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/6fd6a342f7c0b7b6aa742eeee5c585e9e5a1d31b))
* **hippy-vue:** vue css selectors support dynamic import ([#440](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/issues/440)) ([3baa571](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/3baa57105df8f4e7a46d52d4334a88ee921c388d))





## [2.1.5](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.1.4...2.1.5) (2020-12-10)

**Note:** Version bump only for package @hippy/vue





## [2.1.4](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.1.3...2.1.4) (2020-12-03)


### Features

* **hippy-vue,hippy-react:** added setNativeProps on element ([#430](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/issues/430)) ([d1f7e21](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/d1f7e216b5fef46ace0cf50803ad2940b429a0d6))
* **hippy-vue,hippy-react:** perf setNativeProps ([5cd1291](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/5cd12910262ad3bb15d07c2dc974a829958a2b86))





## [2.1.2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.1.1...2.1.2) (2020-11-23)


### Features

* **hippy-vue:** added iOS12 statusBarHeight ([d33e993](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/d33e993b72b3627e3fd73e5f5e08d8c34d4ee23d))
* **hippy-vue, hippy-react:** changeTryConvertNumberCompatibility ([714faaf](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/714faaf11988659b450a3276342597b7ed095a17))





## [2.1.1](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.1.0...2.1.1) (2020-11-11)


### Bug Fixes

* **hippy-vue:** fixed focus event support for div ([#387](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/issues/387)) ([21d8b58](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/21d8b58946f546bc2313c163818f525b0da8ef9a))
* **hippy-vue:** fixed tryConvertNumber bug & some compatible issue ([ba8836d](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/ba8836d9b3c3461f013d325c0e86c84233e3ede6))





# [2.1.0](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.0.3...2.1.0) (2020-10-29)


### Bug Fixes

* **hippy-vue:** fix hippy-vue transform multi-animation not working ([84bd58b](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/84bd58be840ea3f5ddd9d387e92b5a084387e9d1))
* **vue:** fixed remove style issue ([#329](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/issues/329)) ([33f2f7d](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/33f2f7d3a1518e70471a060b930b3372d6b49c99))


### Features

* **hippy-vue:** add new method measureInAppWindow ([e6348a2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/e6348a2fa31ea61fcfda66151c15830871f47ab6))
* **hippy-vue:** added the callback execution before $mount in $start ([1a1cc3f](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/1a1cc3fb5ee92a3dd704765bc628530f9f146c8b))
* **hippy-vue:** box-shadow style support ([0604461](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/06044610f85f891d52d28439b3a48554c8db6487))
* **hippy-vue:** export parseColor api for HippyVue ([a354c94](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/a354c94ede4542bb9111c030e088a70f617ca0c7))





## [2.0.3](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.0.2...2.0.3) (2020-04-23)


### Features

* **hippy-vue:** make beforeStyleLoad hooks applied in runtime ([2fc49cf](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/2fc49cf819c32038b780569a8d278a865e438703))





## [2.0.2](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/compare/2.0.1...2.0.2) (2020-03-18)

### Bug Fixes

* **hippy-vue:** add TypeSelector test ([38f08ef](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/38f08ef4180fa08781492ea80f3dcfbc3ad37036))
* **hippy-vue:** fix css selectors TypeSelector match ([de98e8a](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/de98e8a560ee771d4f10fcbd3642afccfc92e70e))
* **hippy-vue:** fix wrong preSibling of childNode's nexSibling ([6e76d5e](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/6e76d5e1ead0a1d359ab0ec3d25d94c2ffed792b))
* **hippy-vue:** fixed css selectors TypeSelector match ([adddcea](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/adddcea319c816d49deed0b2893e6ee82c203648))
* **vue:** setStyle px unit determine ([8379d53](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/8379d53e4b275dda8243b1869eded475a0113373))

### Features

* **vue:** added disabled props to input tag ([47facd4](https://github.com/Tencent/Hippy/tree/master/packages/hippy-vue/commit/47facd4584b1361a760fd62162b0d4f9384ee673))

## 2.0.1 (2020-01-22)

### Added

* Added `disableBuiltinElements` options.
* Remove childNode if exist when append childNodes - thx @mandydyluo

### Change

* Rename to @hippy/vue.

## 2.0.0 (2019-12-18)

### Change

* Removed the npm namespace prefix '@tencent', restore to version 2.0.0, and make it public.

## 2.0.0 (2019-11-21)

### Changed

* Nothing different with beta.4 but released.

## 2.0.0-beta.4 (2019-10-22)

### Added

* Added hippy-core compatible

### Changed

* Improved the log system.

## 1.3.3 (2019-09-20)

### Added

* Added inline length unit convert at runtime.
* Added H5 touch events compatible, and make old touch events deprecated.

### Fixed

* Fixed length value in `<style>` that supports number.

## 1.3.2 (2019-09-05)

### Added

* Added caret-color convert from style and attribute - thx @cyndizhang report the issue
* Added typescript declaration files - thx @weijiezhu

### Fixed

* Fixed font-weight inline style must be string - thx @luckyzeng

## 1.3.1 (2019-08-27)

### Changed

* Optimized list rendering with merge li render request - thx @luckyzeng

## 1.3.0 (2019-08-12)

### Added

* Make loadInstance be able to trigger multiple times.
* Added translate color at runtime
* Added clean method for `<input>`
* Make Vue.$Document for Document class, and Vue.$Event for Event class.

### Changed

* Make 3rd argument to duration for scrollTo method of ScrollView
* Clean up the styles AST from global after loaded.
* Moved onScroll event processor from dispatcher to built-in.

### Fixed

* Fixed Vue.Native.statusBarHeight calculate issue.
* Make onKeyboardWillShow event be dp unit in Android.

## 1.2.17 (2019-07-08)

### Fixed

* Fixed image src tag specific for iOS issue.

## 1.2.16 (2019-07-05)

### Added

* Added setValue method to input/textarea.
* Added placeholder option to image.

### Fixed

* Fixed Native.measureInWindow meets iOS returns undefined issue.
* Fixed image source specific for platforms.

### Changed

* changed scrollTo option needAnimation to duration 

## 1.2.15 (2019-06-19)

### Added

* Added Vue.Native.Clipboard module support.
* Added callback support for Vue.Native.callUIFunction.
* Added getValue() method for `input` and `textarea`.

### Changed

* Native.screen.statusBarHeight for Android, change unit to dp.
* Changed Vue.Native.isIPhoneX to determine with statusBarHeight.
* Splitted elements to input/list element node.
* Added symbol to built-in elements for better compare performance.

### Fixed

* Fixed ul resort order issue - thx @justinzyang

## 1.2.14 (2019-06-06)

### Added

* Added startRefresh and refreshComplected methods for ul-refresh

### Fixed

* Fixed v-model meets onContentSizeChange binding issue
* Fixed &nbsp; replacement to all of string
* Try to convert to number in setStyle
* Prevent infinite loop caused by class name like .aa_bb.aa

## 1.2.13 (2019-05-20)

### Chagne

* Ignore throw error when app is not initialized.
* Updated iPhone X determine method for Vue.Native.isIPhoneX.

## 1.2.12 (2019-05-07)

### Fixed

* Fixed same size class compare by setsAreEqual() issue. - Thanks @mandydyluo
* Fixed children style updating when parent id/class changed. - Thanks @mandydyluo's PR.

## 1.2.11 (2019-04-25)

### Added

* TextInput added onContentSizeChange event handler

## 1.2.10 (2019-04-12)

### Added

* Added iframe component mapping to WebView.
* Added liLastFlag props for ul to batch updating li.

### Changed

* updateNode is excluding child.
* Update style when value changed only.

## 1.2.9 (2019-04-08)

### Changed

* Changed Vue.Native.Cookie.set() key/value argument to keyValue for set multiple values.

## 1.2.8 (2019-04-08)

### Added

* Added Cookie interface to Vue.Native, with getAll/set methods

## 1.2.7 (2019-04-02)

### Changed

* Updated to latest Vue 2.6.10.
* Downgrade ava to 1.3.1 and esm to 3.2.10 for unit testing.

### Fixed

* Fixed v-model binding for `<input>` specific for iOS.

## 1.2.6 (2019-03-22)

### Changed

* Makes numberOfRows of ul will not trigger updateNode except iOS.

## 1.2.5 (2019-03-20)

### Added

* Added Device, OSVersion, APILevel fields to Vue.Native.

## 1.2.4 (2019-03-06)

### Changed

* Improved input type checking and removed default keyboardType props for input element.

## 1.2.3 (2019-03-05)

### Fixed

* 1.2.2 forget to build issue. T_T

## 1.2.2 (2019-03-05)

### Added

* Added text and search input type mapping.

### Fixed

* Fixed input/textarea content update by state issue

## 1.2.1 (2019-02-22)

### Changed

* Matched Android scrollEventThrottle changes - /hippy/Android/commit/5aec89aef917564c448db1cc86a64f90b65741c4
* Updated Vue dependency to latest 2.6.7.

## 1.2.0 (2018-12-20)

### Changed

* Updated to latest dependencies such as Vue 2.5.21 and Hippy 1.0.1.
* Added error prompt when native event trigger while app not initialized.

## 1.1.13 (2018-12-07)

### Added

* Added select event handler for TextInput.
* Added focus() and blur() to TextInput.

### Changed

* Change the TextInput appearance be the same between iOS and Android.

## 1.1.12 (2018-12-04)

### Added

* Added Vue.Native.OnePixel property to get 1 pixel size.
* Added Vue.Native.version to get the hippy-vue version number in runtime.

### Changed

* Revert `Change the log output for lower level info.` patch, it makes Vue.registerElement('TAG_NAME') got RangeError.

## 1.1.11 (2018-11-30)

### Added

* Added swiper/swiper-slide(ViewPager/ViewPagerItem) component.
* Integrated the source code from hippy-vue-router, and supported the back button of Android.
* Added css loader hook for process styles from global.

### Changed

* Change the log output for lower level info.
* Optimized the render timing.
* Added isFunction() and refined all of function determine.
* Make event name translation be able define in component meta.
* Make the scrollTo() for ListView/ScrollView to fit the [standard](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo).
* Dropped first argument registerElement() must be lowercase limitation.
* Removed customized template compiler, use the compiler that Vue built-in.
* Add the CSS property name map for translation.

### Fixed

* Fixed <keep-alive> for TextInput.

## 1.1.10 (2018-11-17)

### Added

* Added unit test in CI.
* Added listReady and touchStart event convert.
* Added AUTHORS doc.
* Released hippy-vue-css-loader 1.0.3.

### Fixed

* Fixed float value of size unit in CSS.
* Fixed transform property convert for iOS.
* Fixed CSS updateStyle() meets zero value issue.

### Changed

* Dropped color convert from cli.

## 1.1.9 (2018-11-15)

### Added

* Added hippy-vue-native-components 1.0.0-beta.2 package, including animation ul-refresh, dialog native components.
* Added callNativeWithCallbackId in Vue.Native for animation calling.
* Added a npm script for color convert.
* Added touch event handlers.

### Changed

* Element.setStyle() will apply to native now, but **NOT RECOMMEND TO USE** because it's execute too often.

### Fixed

* Added multiline props to fix input type="password" behavior in iOS.
* Fixed callUIFunction in iOS require real component name issue.

## 1.1.8 (2018-11-03)

### Fixed

* Fixed unicode convert string value for placeholder, defaultValue and value props.
* Initial fixed CSS compiler comment issue.
* Initial fixed RegExp without sticky flag when Style Matcher initializing.

## 1.1.7 (2018-10-26)

### Added

* Static resources loading support.
* Makes Element.scrollToPosition works with ScrollView.
* Added CSSOM View standard Element.scrollTo method with Element.scrollToPosition.
* Added clean npm script with rimraf for clean the built files.

### Changed

* [BREAK CHANGES]: iPhoneXStatusBar startup property was changed to iPhone.statusBar property.

### Fixed

* Refined Vue.Native to make sure it's working on lower version of iOS.
* Fixed Vue.Native.measureInWindow method no response when component out of screen.
* Fixed transparent color support.
* [BREAK CHANGES]: Swap the stupid overflow-x/y css property for ScrollView.

## 1.1.6 (2018-10-11)

### Added

* Added safe area padding for iPhone X with simple Vue options.
* Added Element.getBoundingClientRect() method for get the size and position of element.
* Added onLayout event handler.

## 1.1.5 (2018-10-10)

### Added

* div now support ScrollView with overflowX: scroll or overflowY: scroll.
* Orange CI integration -- Thx @youkunhuang.
* onScroll event handler for ListView/ScrollView, added offsetX/offsetY property for event to handler the position.

### Fixed

* Fixed registerElement issues with default component properties.

## 1.1.4 (2018-10-09)

### Added

* Added $start callback argument for post processing after register.

### Changed

* Fixed the eslint issues checked by CodeCC.

## 1.1.3 (2018-09-20)

### Added

* CSS loader stripped background-image url() wrapper.
* All of hippy-base exported modules be in Vue.Native.

### Changed

* defaultNativeProps in meta could be a function.

### Fixed

* iOS text node be a number caused crash issue.
* Event name without `on` prefix issue

## 1.1.2 (2018-08-31)

### Added

* Added Vue.Native property to handler the native properties.
* Added &nbsp; replace with space.

## 1.1.1 (2018-08-31)

### Added

* Added a tag to support hippy-vue-router.

## 1.0.0 (2018-08-29)

### Added

* Added v-if/v-else/v-show directives support.
* Fill more unit testing, coverage up to 82%.

### Changed

* Added arrayCount for count elements in array by iterator.

## 1.0.0-beta.7 (2018-08-27)

### Fixed

* Fixed iOS compatible issues.

## 1.0.0-beta.6 (2018-08-23)

### Fixed

* Fixed unicodeToChar meets 2 bytes unicode issue -- thanks erikqin(秦睦迪) found the issue

### Added

* v-model support