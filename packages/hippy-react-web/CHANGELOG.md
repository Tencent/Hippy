# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2020-01-22

### Change

* Rename to @hippy/react-web.

## [2.0.0] - 2019-12-18

### Change

* Removed the npm namespace prefix '@tencent', restore to version 2.0.0, and make it public.

## [1.0.0-beta.7] - 2019-10-29

### Fixed

* Change Dimensions.get('window') from document to window.
* Fixed transform rotateZ animation unit issue.

## [1.0.0-beta.6] - 2019-06-25

### Fixed

* Fixed Dimensions.window.

* Fixed animation for rotate transform and opacity issue.

## [1.0.0-beta.5] - 2019-06-19

### Added

* Added VideoPlayer component.

### Fixed

* Fixed determine Animation class name with constructor name issue.
* Fixed the lower version browser that can't support flex.

## [1.0.0-beta.4] - 2019-05-27

### Added

* Just for test wechat robot.

## [1.0.0-beta.3] - 2019-05-27

### Added

* #1 - Make ref be able to access for View. @cesoxiong

### Change

* #3 - Initialize leftSetRepeatCount when Animation start.

### Fixed

* Migrate Object.entries() to Object.keys() for lower browser compatible.

## [1.0.0-beta.2] - 2019-05-13

### Added

* Added more components/modules from hippy-react, and issue fixed.

## [1.0.0-beta.1] - 2019-05-10

### Added

* Initial commit, based on saizhao and rickiezheng's working.
