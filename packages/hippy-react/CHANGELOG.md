# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project ad

## [2.0.1] - 2020-01-22

### Change

* Rename to @hippy/react.

## [2.0.0] - 2019-12-18

### Change

* Removed the npm namespace prefix '@tencent', restore to version 2.0.0, and make it public.

## [2.0.1] - 2019-12-11

### Added

* Added `silent` option for disable the framework log.

### Fixed

* Fixed nesting `<Text>` rendering issue.

## [2.0.0] - 2019-11-21

### Changed

* Nothing different with beta.11 but released.

## [2.0.0-beta.11] - 2019-11-14

### Changed

* Changed deleteNode with children to childNode only.

### Fixed

* Fixed array and object mixed style
* Fixed style determine issue

## [2.0.0-beta.10] - 2019-11-07

### Fixed

* Fixed parse color issue

## [2.0.0-beta.9] - 2019-11-07

### Fixed

* Fixed `<Text>` nesting issue.

## [2.0.0-beta.8] - 2019-11-06

### Fixed

* Fixed `<Text>` component meets null in children array issue.

## [2.0.0-beta.7] - 2019-11-05

### Changed

* Nothing changed, but tnpm crashes.

## [2.0.0-beta.6] - 2019-10-25

### Fixed

* Restored onPageScrollStateChanged event handler for ViewPager.

## [2.0.0-beta.5] - 2019-10-25

### Fixed

* Fixed Text component meets number children warning.

## [2.0.0-beta.3] - 2019-10-22

### Added

* Added type definition of Typescript

### Fixed

* Fixed compatible issues with QB

## [1.1.9] - 2019-09-16

### Added

* Passthrough the props to Modal directly.

## [1.1.8] - 2019-08-23

### Added

* Add IOS ViewPager onPageScrollStateChanged - thx @victoryin

## [2.0.0-beta.1] - 2019-07-18

### Changed

* Brand new hippy-core architecture.

## [1.1.7] - 2019-07-16

### Changed

* Restored ScrollView scrollTo method, and added scrollToWithDuration method

## [1.1.6] - 2019-07-15

### Added

* Added onRowLayout event handler to ListView.

### Fixed

* Fixed ScrollView scrollTo method compatible issue.

## [1.1.4] - 2019-07-10

### Added

* Added setValue method to TextInput

### Changed

* Changed ScrollView's scrollTo method animated option to duration.

### Fixed

* Fixed keyboardHeight to dp for Android.

## [1.1.3] - 2019-07-01

### Fixed

* Fixed animation meets undefined issue - thx @calvinma.

## [1.1.2] - 2019-06-24

### Fixed

* Fixed Text style meets null issue.

## [1.1.1] - 2019-06-19

### Changed

* Changed default Text color to black - #000.

### Fixed

* Fixed mobx compatibility - Thx @daringuo and @calvinma

## [1.1.0] - 2019-06-13

### Added

* Added default color style to Text
* Added Clipboard module

### Changed

* Dropped web adapter

### Fixed

* Fixed redux 5.x compatible -- Thanks @calvinma

## [1.1.0-beta.1] - 2019-05-13

### Added

* Added default text color to style.

### Changed

* Removed web adapter
