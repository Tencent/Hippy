# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.17.2](https://github.com/Tencent/Hippy/compare/2.17.1...2.17.2) (2023-10-27)

**Note:** Version bump only for package @hippy/vue-next





## [2.17.1](https://github.com/Tencent/Hippy/compare/2.17.0...2.17.1) (2023-08-28)

**Note:** Version bump only for package @hippy/vue-next





# [2.17.0](https://github.com/Tencent/Hippy/compare/2.16.5...2.17.0) (2023-08-07)


### Bug Fixes

* **vue-next:** fix element do not use beforeLoadStyle hooks issue ([#3339](https://github.com/Tencent/Hippy/issues/3339)) ([2d63fa5](https://github.com/Tencent/Hippy/commit/2d63fa54953b496de131bf796241bae7ff66c026))





## [2.16.5](https://github.com/Tencent/Hippy/compare/2.16.4...2.16.5) (2023-07-21)

**Note:** Version bump only for package @hippy/vue-next





## [2.16.4](https://github.com/Tencent/Hippy/compare/2.16.2...2.16.4) (2023-05-25)


### Bug Fixes

* **vue:** remove redundant props & perf cache logic ([d635977](https://github.com/Tencent/Hippy/commit/d635977224f9e4e0f68f07fc2b70a0f429dfe660))


### Features

* **react,vue:** show nodeId in debug mode ([68f9c02](https://github.com/Tencent/Hippy/commit/68f9c02829b26df7fbef545bfe2a3dad3a817e3b))





## [2.16.3](https://github.com/Tencent/Hippy/compare/2.16.2...2.16.3) (2023-04-24)

**Note:** Version bump only for package @hippy/vue-next





## [2.16.2](https://github.com/Tencent/Hippy/compare/2.16.1...2.16.2) (2023-04-04)

**Note:** Version bump only for package @hippy/vue-next





## [2.16.1](https://github.com/Tencent/Hippy/compare/2.16.0...2.16.1) (2023-04-03)


### Bug Fixes

* **vue:** make sure start animation after node created ([9517d1b](https://github.com/Tencent/Hippy/commit/9517d1b5cb80be397cb6aa8fed73bbea175a38b9))





# [2.16.0](https://github.com/Tencent/Hippy/compare/2.15.5...2.16.0) (2023-03-21)


### Bug Fixes

* **android:** return size after loading gif ([#3001](https://github.com/Tencent/Hippy/issues/3001)) ([28fdfa9](https://github.com/Tencent/Hippy/commit/28fdfa925fa0170d822416f2ac6f2e53ea4eb4d8))
* **vue3:** fix listViewItem disappear event not triggered ([c11ca94](https://github.com/Tencent/Hippy/commit/c11ca942b2938cacc859813ced244c2641450d80))
* **vue:** perf style diff ([9d3611b](https://github.com/Tencent/Hippy/commit/9d3611bfe166502aaa6d8562cf8901834ac2c615))


### Features

* **andr:** add prod remotedebug, local bundle instead of remote server([#2849](https://github.com/Tencent/Hippy/issues/2849)) ([70fbde4](https://github.com/Tencent/Hippy/commit/70fbde4d5a249f5bda872b6bd69ff4e6a2ad5a1b))
* **vue-next:** add beforeRenderToNative hook ([#2775](https://github.com/Tencent/Hippy/issues/2775)) ([3839135](https://github.com/Tencent/Hippy/commit/383913585da4e718cf1bbe341529076a4358fc0c))
* **vue:** add native event parameters ([d08affb](https://github.com/Tencent/Hippy/commit/d08affb8c3add1db81da3719a6859fbd604ae09b))
* **webrenderer:** merge webrenderer repo to hippy repo ([#2609](https://github.com/Tencent/Hippy/issues/2609)) ([c1e30f3](https://github.com/Tencent/Hippy/commit/c1e30f3f75b123b64022f1e4364e45fed56d5d18)), closes [#2651](https://github.com/Tencent/Hippy/issues/2651) [#4](https://github.com/Tencent/Hippy/issues/4)





## [2.15.5](https://github.com/Tencent/Hippy/compare/2.15.4...2.15.5) (2022-12-07)

**Note:** Version bump only for package @hippy/vue-next





## [2.15.4](https://github.com/Tencent/Hippy/compare/2.15.3...2.15.4) (2022-12-05)

**Note:** Version bump only for package @hippy/vue-next





## [2.15.3](https://github.com/Tencent/Hippy/compare/2.15.2...2.15.3) (2022-11-25)


### Bug Fixes

* **react,vue:** change measureInAppWindow error return value ([2a96aaf](https://github.com/Tencent/Hippy/commit/2a96aaf43cd4fdc274bb7be8fb79d2f4d1f76835))
* **react,vue:** fix getBoundingClientRect errMsg syntax ([8348fef](https://github.com/Tencent/Hippy/commit/8348fef6fd01a8682eba7c219a3c321895d6b0f6))


### Features

* **android,ios,js:** add getBoundingClientRect method ([#2651](https://github.com/Tencent/Hippy/issues/2651)) ([92ab25b](https://github.com/Tencent/Hippy/commit/92ab25bb2f9d77851f34f24077223ba0a16d1cae)), closes [#4](https://github.com/Tencent/Hippy/issues/4)
* **ios,android,vue:** add load result param for webView's onLoadEnd api ([#2667](https://github.com/Tencent/Hippy/issues/2667)) ([bbdd9ae](https://github.com/Tencent/Hippy/commit/bbdd9ae60cc6eafff57332288822e57fc4cf46a7))
* **vue:** add whitespace handler config ([8a65d23](https://github.com/Tencent/Hippy/commit/8a65d2391d67131b6e18dfea0e0b74cdf37958c0))


### Performance Improvements

* **vue:** ignore to append existed node to improve router performance ([cc24c27](https://github.com/Tencent/Hippy/commit/cc24c27bc4995f7b13051b4939339725ed2f86b2))





## [2.15.2](https://github.com/Tencent/Hippy/compare/2.15.1...2.15.2) (2022-11-07)


### Features

* **vue:** support to merge styles on root element of child component ([efea081](https://github.com/Tencent/Hippy/commit/efea081cf9bec979fbe73aabf5bee3380440e4d7))





## [2.15.1](https://github.com/Tencent/Hippy/compare/2.15.0...2.15.1) (2022-10-26)


### Features

* **vue:** fix attribute selector & support deep selector ([87ce13e](https://github.com/Tencent/Hippy/commit/87ce13e80369a067b04af5b43371976a95fe75d6))


### Performance Improvements

* **vue:** refer native script source code to reduce number of loops ([#2571](https://github.com/Tencent/Hippy/issues/2571)) ([21900d0](https://github.com/Tencent/Hippy/commit/21900d0f0b494dc78ba33b4c1bae9934d587ecfd))





# [2.15.0](https://github.com/Tencent/Hippy/compare/2.14.7...2.15.0) (2022-10-14)


### Bug Fixes

* **vue-next:** add missing modules & perf docs ([6046d2c](https://github.com/Tencent/Hippy/commit/6046d2cf37e526f77dfb270f5df5b7dbb927121d))
* **vue-next:** fix syntax errors ([93faab4](https://github.com/Tencent/Hippy/commit/93faab404c219deff5805a5e9726bad05bbf9e06))


### Features

* **hippy-vue-next:** support vue3.x ([#2357](https://github.com/Tencent/Hippy/issues/2357)) ([0445c4e](https://github.com/Tencent/Hippy/commit/0445c4ec41ea3abcbd45728a62ef75abd21df676))
* **vue-next:** add web-renderer script ([1be39dc](https://github.com/Tencent/Hippy/commit/1be39dc41d62b3a917b8d054a4f91cd07b5fb725))
* **vue-next:** refactor type definition files place ([#2542](https://github.com/Tencent/Hippy/issues/2542)) ([202dccb](https://github.com/Tencent/Hippy/commit/202dccbe42626b0f356c93f43aba4544d84ee6bd))
