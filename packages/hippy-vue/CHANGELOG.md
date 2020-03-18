# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
