# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.14.12](https://github.com/Tencent/Hippy/compare/2.14.11...2.14.12) (2024-07-09)


### Bug Fixes

* **core:** GetTurboModule crash protect ([#3945](https://github.com/Tencent/Hippy/issues/3945)) ([daa91ae](https://github.com/Tencent/Hippy/commit/daa91aefa21dd246d3608122bb29694a7280a146))


## [2.14.11](https://github.com/Tencent/Hippy/compare/2.14.10...2.14.11) (2023-12-20)


### Bug Fixes

* **core:** fix std hash for xcode15 ([0d98153](https://github.com/Tencent/Hippy/commit/0d98153fadeb249757f40f19906c933b79d3cc27))





## [2.14.10](https://github.com/Tencent/Hippy/compare/2.14.9...2.14.10) (2023-02-08)


### Bug Fixes

* **android:** nested scroll conflict ([739a966](https://github.com/Tencent/Hippy/commit/739a9664b1133fb7515ef20968540ee5a8e02584))
* **ios:** avoid a thread race for animated image ([acfebf4](https://github.com/Tencent/Hippy/commit/acfebf43bfc0554c48b27d258842a1f40045416e))





## [2.14.9](https://github.com/Tencent/Hippy/compare/2.14.8...2.14.9) (2022-11-07)


### Bug Fixes

* **android:** empty text node height compatibility ([f9bf570](https://github.com/Tencent/Hippy/commit/f9bf5709833f1702e5e41ae0e2fac7505ed9c651))





## [2.14.8](https://github.com/Tencent/Hippy/compare/2.14.7...2.14.8) (2022-11-07)


### Bug Fixes

* **android:** fix setTextColor not working ([6c72a7c](https://github.com/Tencent/Hippy/commit/6c72a7ccf05978136b18f342cb78280abee7c7d3))
* **core:** revert hippy1.x compatible code ([1ec5d85](https://github.com/Tencent/Hippy/commit/1ec5d8582b00d2bd7159d956a8465ce50bbea77e))





## [2.14.7](https://github.com/Tencent/Hippy/compare/2.14.6...2.14.7) (2022-09-08)


### Bug Fixes

* **android:** listview not update when delete invisible items ([e893f50](https://github.com/Tencent/Hippy/commit/e893f503c1044b6ca0ba66e18044a3fe1fb9d7e7))
* **hippy-react:** remove NetInfo duplicated EventEmitter creating ([8591c9f](https://github.com/Tencent/Hippy/commit/8591c9fbe1a4d768c2bc819056fac628fef69f71))
* **ios:** ViewPager onPageScrollStateChange missing ([adb0121](https://github.com/Tencent/Hippy/commit/adb0121a925e0af49870422db74e89cff7646d15))





## [2.14.6](https://github.com/Tencent/Hippy/compare/2.14.5...2.14.6) (2022-08-26)


### Bug Fixes

* **hippy-react:** add overflow scroll to fix listview unable to scroll ([96c670a](https://github.com/Tencent/Hippy/commit/96c670a8f0af373d055a7ec81fc92afc89f4fe5a))


### Features

* **vue:** support ScrollView & ListView scroll related event params ([9d77ec6](https://github.com/Tencent/Hippy/commit/9d77ec6c99c2354cfc273c3f9b085369324cd84b))





## [2.14.5](https://github.com/Tencent/Hippy/compare/2.14.4...2.14.5) (2022-08-23)


### Bug Fixes

* **android, ios:** the final `onScroll` may be dropped ([#2377](https://github.com/Tencent/Hippy/issues/2377)) ([963992b](https://github.com/Tencent/Hippy/commit/963992b1d20647c64561e89fb42a6e5997889563))
* **android:** add try-catch for NetInfoModule ([258f9ac](https://github.com/Tencent/Hippy/commit/258f9acf75875855b37d52d09ac873a6c2637b6e))
* **android:** gif borderRadius not working and radius scale issue ([bb84fcd](https://github.com/Tencent/Hippy/commit/bb84fcdc3e179bd1123c849d8b587faa86c00fc6))
* **android:** handleRequestCookie error ([2ff9388](https://github.com/Tencent/Hippy/commit/2ff938899d7e7624b19d0a6a8de1a718282757bf))
* **android:** set init complete after bridge ready ([04c8bdc](https://github.com/Tencent/Hippy/commit/04c8bdc8af8fa2009504d64ffc50776c9e029470))
* **core:** fix code lint warnings ([7f60759](https://github.com/Tencent/Hippy/commit/7f60759796616d9b9a356a7d4b534565ffef33fc))
* **devtools:** remove v8 inspector flag for ios ([f431ab5](https://github.com/Tencent/Hippy/commit/f431ab5c6a36a77b32ad4ce4a33e72bb8f7e619c))
* **homepage:** fix secure problem for homepage redirect ([a7b552f](https://github.com/Tencent/Hippy/commit/a7b552f143b58192a23624600c3f2e0bdeebb942))
* **ios:** fix refresh component bug ([36559b1](https://github.com/Tencent/Hippy/commit/36559b15289d7baed76eb50a22adb5d56a114ead))
* **ios:** fix scroll rtl for content view ([2c7da42](https://github.com/Tencent/Hippy/commit/2c7da4267f8c8d08521c9d86d48d3d04d76d32e8))
* **ios:** hippy-vue textInput isFocused not working ([623b117](https://github.com/Tencent/Hippy/commit/623b117c2908962a5179875ce3062d1892856a03))
* **ios:** padding not working on text's subview ([65676f0](https://github.com/Tencent/Hippy/commit/65676f0a61d3a00608d35836f8113014e5061afc))
* **ios:** turbo runtime must release in js thread ([5f96fae](https://github.com/Tencent/Hippy/commit/5f96fae74d18b455c6aaa3ae2abff20ffc0d8d2f))
* **vue:** fix regular expressions catastrophic backtracking ([510a587](https://github.com/Tencent/Hippy/commit/510a587cd646005041a80f3ff0f4bf36c5824b4e))
* **vue:** revert a catastrophic backtracking fix ([2fbb0d9](https://github.com/Tencent/Hippy/commit/2fbb0d9d31d60afab9248b2e3acc9e83f30ce77c))


### Features

* **android:** add `visibility` style ([8b7a81e](https://github.com/Tencent/Hippy/commit/8b7a81e23797913c804d3e55d9bb9f992b83b326))
* **android:** update AGP version to 7.2.2 ([d9b6ccd](https://github.com/Tencent/Hippy/commit/d9b6ccdcb9f82ef4fad90930f7a53ff199630d8a))
* **android:** update NDK and CMake versions ([2b7282f](https://github.com/Tencent/Hippy/commit/2b7282f34d32f8adec4c7319a5aa233d009e91bd))
* **hippy-vue:** perf attribute update ([e5c181f](https://github.com/Tencent/Hippy/commit/e5c181fcb49d6cdb4edc4a962f561dfdba0c4711))





## [2.14.4](https://github.com/Tencent/Hippy/compare/2.14.3...2.14.4) (2022-08-10)


### Bug Fixes

* **android:** fix LLVM linker version script not taking effect ([5c535c9](https://github.com/Tencent/Hippy/commit/5c535c92ebd1a037137e69ce5affc439d304cf4e))
* **core:** add android native2js promsie reject condition ([daa484b](https://github.com/Tencent/Hippy/commit/daa484bd5f97d8c47ec7b003808687c24703787e))
* **ios:** set thread priority explictly to avoid priority revertion ([d38105f](https://github.com/Tencent/Hippy/commit/d38105f7e3620ddcbdc42185d829ad3f8a5cf3b9))
* **workflows:** CodeQL analysis checkout using LFS ([c004cc0](https://github.com/Tencent/Hippy/commit/c004cc062a9c9201e081b28c6a0714bc8dfe9ecb))


### Features

* **hippy-vue:** support once modifier ([58f4d10](https://github.com/Tencent/Hippy/commit/58f4d10ba04adfc150690b6c9201599b72ccc4df))
* **workflows:** add github actions for project artifact release ([40dbc91](https://github.com/Tencent/Hippy/commit/40dbc9192ace48c8f28817fcfdbe3599f27b75c5))
* **workflows:** artifact release action always compress symbols ([66852f5](https://github.com/Tencent/Hippy/commit/66852f5a8cdb8f2ec61d93cbf3788115b692e9cd))
* **workflows:** CodeQL analysis runs at every night ([55cd140](https://github.com/Tencent/Hippy/commit/55cd14015d56fbca157f26ac71260ae1a7d378cd))





## [2.14.3](https://github.com/Tencent/Hippy/compare/2.14.2...2.14.3) (2022-08-03)


### Bug Fixes

* **vue:** fix static style not updated in some case ([830b557](https://github.com/Tencent/Hippy/commit/830b557c6e25e0807b5444ac0fe6944b0a72d348))





## [2.14.2](https://github.com/Tencent/Hippy/compare/2.14.1...2.14.2) (2022-08-01)


### Bug Fixes

* **android:** horizontal `ScrollView` cannot scroll in other scrollable ([724d4af](https://github.com/Tencent/Hippy/commit/724d4af45d73606c00ebf5509b26fea6c48338e4))
* **android:** listview can not scroll inside other listview ([d92ac95](https://github.com/Tencent/Hippy/commit/d92ac953f9def0866419c5eef549664c68dc6b7c))
* **buildcore:** fix buildcore script ([4bce58c](https://github.com/Tencent/Hippy/commit/4bce58cf4927d499fe67fbef34bb7f52ead5d47a))
* **image:** fix image border path not reset ([cfb800d](https://github.com/Tencent/Hippy/commit/cfb800de485d00966d5ed02df06354d1ba2effd8))
* **ios:** direction is for shadow view ,not view ([63189f7](https://github.com/Tencent/Hippy/commit/63189f703d0847e5f9f2343b5d6bb78ac99ff536))
* **ios:** fix a potential null pointer when waterfallview cell resuse ([e50fc40](https://github.com/Tencent/Hippy/commit/e50fc403f15780c1dddb6ebf3637d0d99b74c14b))
* **ios:** fix HippyDevLoadingView shows in release environment ([37faba6](https://github.com/Tencent/Hippy/commit/37faba63aed52823acf37c2a960559820ed31b0c))
* **ios:** nested listview may not get rendered ([bb12159](https://github.com/Tencent/Hippy/commit/bb121591302b91399ddd202bda522e23097aab7f))
* **ios:** radius must be smaller than half of component's length ([0e97ad0](https://github.com/Tencent/Hippy/commit/0e97ad056e328e97f613a47aaf22cf2e274d1dd0))
* **ios:** roottag property should not be updated ([34ca26f](https://github.com/Tencent/Hippy/commit/34ca26f3f53783526b92a917b22979a3809f3999))
* **ios:** try to avoid cases where result is NAN ([7989dbe](https://github.com/Tencent/Hippy/commit/7989dbe00d5833dde17d713166c26127835ea30d))


### Features

* **android:** add breakStrategy prop for Text and TextInput ([#2285](https://github.com/Tencent/Hippy/issues/2285)) ([8dd4c03](https://github.com/Tencent/Hippy/commit/8dd4c0307e9ea856e3841cf27feb898ad1f159e2))
* **devtools:** support multi jscontext debug ([#2189](https://github.com/Tencent/Hippy/issues/2189)) ([3e18e89](https://github.com/Tencent/Hippy/commit/3e18e89a0f0eed7077bec663c64f6d144eac83d3))
* **hippy-vue:** support breakStrategy ([d5309c2](https://github.com/Tencent/Hippy/commit/d5309c20c33988427318fed09adb98b12630ddfe))
* **ios:** add method to get key window in ios13 ([6a625b6](https://github.com/Tencent/Hippy/commit/6a625b638ef26dbd315341d5f9919802460b1339))





## [2.14.1](https://github.com/Tencent/Hippy/compare/2.14.0...2.14.1) (2022-07-25)


### Bug Fixes

* **android:** add on error call back for get image ([17e1481](https://github.com/Tencent/Hippy/commit/17e14817f482add13eae1c885255a10b6900c081))
* **android:** call function callback reuse ([03e5931](https://github.com/Tencent/Hippy/commit/03e5931b26ac9895f4964a9d501224abe587d230))
* **android:** check collapsable at attribute ([46a7d80](https://github.com/Tencent/Hippy/commit/46a7d80d1021dcd2b6a6f87989de6383f82fe567))
* **android:** fix the `skipCmakeAndNinja` flag does not take effect ([a293fdc](https://github.com/Tencent/Hippy/commit/a293fdc079fb6e801f430780dcf428d2c63520e4))
* **android:** fix websocket frame for ping and close ([016cda1](https://github.com/Tencent/Hippy/commit/016cda1295924173368589edb89102e1567b7460))
* **Android:** hippypager layout and pageselect event ([efbdd38](https://github.com/Tencent/Hippy/commit/efbdd3817b62ecf40b5938a0c8acc9441cb57a45))
* **android:** implicit narrowing conversion in compound assignment ([133a8d4](https://github.com/Tencent/Hippy/commit/133a8d40eb6c53e0c6978fe93f375f8b409bacdb))
* **android:** re implementation progress long value switch to int ([cd1071e](https://github.com/Tencent/Hippy/commit/cd1071e58209b76cd93d916ca536856f0405f023))
* **android:** remove unnecessary dir form git ignore ([c06e14e](https://github.com/Tencent/Hippy/commit/c06e14e8aa88bd349f82331ab26a42e5270745ce))
* **android:** reset hippy view group clip children to true ([6e98859](https://github.com/Tencent/Hippy/commit/6e988591080964568b42e5ba175c6ada6d0d9832))
* **android:** set default background color to TRANSPARENT ([c6822da](https://github.com/Tencent/Hippy/commit/c6822daa4d8cdc2517b94be9480ceb3dcf0078ea))
* **android:** set mini sdk version to 21 ([6fc5871](https://github.com/Tencent/Hippy/commit/6fc5871dfe9e7f88a68e1e93411f15357f3a3150))
* **android:** viewpager scrollEnabled ([252089f](https://github.com/Tencent/Hippy/commit/252089f1aad4583511da457dfb59febcf5414c0d))
* **Android:** web socket client boolean to AtomicBoolean ([c267f9e](https://github.com/Tencent/Hippy/commit/c267f9eaf5c225db6b5b4e6a5d8fb53600850b6a))
* **core:** fix CreateJSCString bug ([1a463ec](https://github.com/Tencent/Hippy/commit/1a463ec037f881078a0b4b81ad48d8534d5ed6d3))
* **devtools:** disconnect ws when close ([c827e8c](https://github.com/Tencent/Hippy/commit/c827e8c54bfc8b8057192eccb34ca0eefb23bc50))
* **devtools:** fix elements reload and update bug ([#2272](https://github.com/Tencent/Hippy/issues/2272)) ([f6912ed](https://github.com/Tencent/Hippy/commit/f6912ed638487b80f1f3a1981f200efed32a7d39))
* **devtools:** fix mini scale for screen cast ([c0e837e](https://github.com/Tencent/Hippy/commit/c0e837e99667fce165d6b43b521ddd8ab441a573))
* **example:** change webrenderer version ([d6af3b5](https://github.com/Tencent/Hippy/commit/d6af3b577620d7caeb7f94e6aec1388475187208))
* **hippy-react-web:** add unhandleRejection event handler ([145364b](https://github.com/Tencent/Hippy/commit/145364b0e1efdd2a001fbea271b9ab9e125ca550))
* **hippy-react-web:** fix borwser does not support addRule ([1b30755](https://github.com/Tencent/Hippy/commit/1b307553366dc2107b384693e9a78aee497acb0c))
* **hippy-react-web:** fix error handler ([d289f39](https://github.com/Tencent/Hippy/commit/d289f3960b99b67167c366dd60d4acaaeef6ad9b))
* **hippy-react-web:** fix img onClick envet does not emit ([2d4d57b](https://github.com/Tencent/Hippy/commit/2d4d57b6bf917b560c8d79a0ec3efcb897c732ff))
* **hippy-react-web:** support ListView renderPullFooter ([#2166](https://github.com/Tencent/Hippy/issues/2166)) ([95fc4c5](https://github.com/Tencent/Hippy/commit/95fc4c54c969147d406f95e77fed197ef1e3fb94))
* **hippy-vue-css-loader:** support to parse letter-spacing ([7b404f5](https://github.com/Tencent/Hippy/commit/7b404f59951e20aaeefcca12bf30c0b67e06db26))
* **ios:** async image load to avoid downsampling stuck ([9dc36a1](https://github.com/Tencent/Hippy/commit/9dc36a172672773adb538c9651d4e217369e4462))
* **iOS:** async runloop to main thread ([c5638e7](https://github.com/Tencent/Hippy/commit/c5638e7d16d8b171e419daca2bb3e87b79e37e6c))
* **ios:** check weak self status ([6c64f41](https://github.com/Tencent/Hippy/commit/6c64f412ba31071abc313b7a12d2eb3cd15d7647))
* **ios:** fix a dead lock ([a6cf131](https://github.com/Tencent/Hippy/commit/a6cf13158bd71531137427bc97b1b5d7cc834dc2))
* **ios:** fix memory leaks for block usage ([a1fd07b](https://github.com/Tencent/Hippy/commit/a1fd07b0a4cb4af5eb5e56b142f283de3d2bd55d))
* **ios:** fix potential crash due to dangling pointer ([25af245](https://github.com/Tencent/Hippy/commit/25af245aad57d4af37bce4f9e03c40e8928fb7c7))
* **ios:** fix potentian crash due to dangling pointer ([74ea629](https://github.com/Tencent/Hippy/commit/74ea62987fb63334cb42931b8dab3f05b6439e7a))
* **ios:** fix undo crash for uitextfiled component ([0f5bb91](https://github.com/Tencent/Hippy/commit/0f5bb9145f7ddf4d58d2f08dff08b06026a5e5d6))
* **ios:** no more ceiling item height ([76421c1](https://github.com/Tencent/Hippy/commit/76421c17076d684464bfcfdc47b3c62e6fe66e15))
* **ios:** reset properties if value is null ([de6482d](https://github.com/Tencent/Hippy/commit/de6482d9a5e73952bf94360a43231af6fc5cebda))
* **ios:** try to avoid destroying variables in use ([ac705fb](https://github.com/Tencent/Hippy/commit/ac705fb956e45e43bcd118a2df3efd3c3a296d85))
* **ios:** use smart pointer instead of non-smart pointer ([d648eda](https://github.com/Tencent/Hippy/commit/d648eda41f123a9d4e44645e1cb563ddf6809ea8))
* **npm:** update got from vulnerable to safe version ([0987946](https://github.com/Tencent/Hippy/commit/0987946b2ea2b1ebca2222f2209e27cc4c2fe128))
* **npm:** update lerna to fix vulernable npm package ([6dcdd9c](https://github.com/Tencent/Hippy/commit/6dcdd9cd5aca908a47b0694c59d106493377f62c))
* **npm:** update vulnerable npm packages ([a06bae2](https://github.com/Tencent/Hippy/commit/a06bae20f95a7e24716a303b611b5bb187b15ff3))
* **react:** add ref null judgement for getElementFromFiberRef ([eb55f3e](https://github.com/Tencent/Hippy/commit/eb55f3e439ffec14b9d29bf04fc5a5433d52a54d))
* **vue-css-loader:** fixed collapsable boolean convert error ([e49d3b5](https://github.com/Tencent/Hippy/commit/e49d3b579c585772e39ce94e4e8a2a40deb85e55))
* **workflows:** fix CodeQL analysis failure problem ([177b81b](https://github.com/Tencent/Hippy/commit/177b81bc79429743f9e5b192b7443a0decbcff36))
* **workflows:** fix CodeQL not working as expected ([4ff2e82](https://github.com/Tencent/Hippy/commit/4ff2e82d07ffc4090309c6ed0e5120f476fe745d))
* **workflows:** fix the problem that CodeQL results are not generated ([41fed9b](https://github.com/Tencent/Hippy/commit/41fed9b2de265d354843129228d30f8f58e32750))


### Features

* **android:** add `ellipsizeMode` prop support for `Text` componment ([#2221](https://github.com/Tencent/Hippy/issues/2221)) ([2ec6c70](https://github.com/Tencent/Hippy/commit/2ec6c70009186b2d5c88c977eeb0e018e75a74f2))
* **android:** change compiler options based on LLVM 12 ([deebf6f](https://github.com/Tencent/Hippy/commit/deebf6f3e5770dc60f8c3d3e943eaf37e1058959))
* **android:** merge TVHippySdk to master ([31c4cf5](https://github.com/Tencent/Hippy/commit/31c4cf595c234871eff62d0c417e562db08a86ab))
* **android:** modify the `V8_COMPONENT` to specify the `V8` version ([eacfde3](https://github.com/Tencent/Hippy/commit/eacfde379a1375ca8cbc8c739bdb4bfd77122339))
* **android:** remove useless override method ([9466a2e](https://github.com/Tencent/Hippy/commit/9466a2e5b00a213343d17bbe6dc5cf5986486f7e))
* **android:** set hippy view group clip children to false ([54485b0](https://github.com/Tencent/Hippy/commit/54485b0789da974782f985a069bdd08a89fb64af))
* **android:** specify the `V8` version used ([3452763](https://github.com/Tencent/Hippy/commit/345276352844a1fd6f4489ce13bff465a1cf9c36))
* **android:** support horizontal PullHeader & PullFooter ([#2268](https://github.com/Tencent/Hippy/issues/2268)) ([d6b662a](https://github.com/Tencent/Hippy/commit/d6b662a85cff73d9b00748d67f183ec80cb609bc))
* **core:** add `isFocused` method for `TextInput` ([c84a566](https://github.com/Tencent/Hippy/commit/c84a5662e176212d9ef61c648b70efb089f92abb))
* **core:** update docs ([3527693](https://github.com/Tencent/Hippy/commit/352769306a821b196369fee59a78950ef9f4c551))
* **core:** update docs ([864810e](https://github.com/Tencent/Hippy/commit/864810ef4369c878b54b2ad278164ccb7a26f582))
* **core:** update docs and demo ([b4d7e12](https://github.com/Tencent/Hippy/commit/b4d7e12e8fc04c83f82f74e159e532a109f7cbd1))
* **devtools:** remove ios inspector instance ([f9ca23e](https://github.com/Tencent/Hippy/commit/f9ca23efd0f0a2eb82c6ee27734fdbc96c1cabd9))
* **hippy-react-web:** fix web style issues ([#2087](https://github.com/Tencent/Hippy/issues/2087)) ([e6d0416](https://github.com/Tencent/Hippy/commit/e6d04161da9204335bd269b5310a330c4426dce6))
* **hippy-react:** support horizontal PullHeader & PullFooter ([f9541f2](https://github.com/Tencent/Hippy/commit/f9541f2e3e84695692a4ac5f52cf853ae704eb7b))
* **hippy-vue:** perf attribute & style update performance ([10945d7](https://github.com/Tencent/Hippy/commit/10945d7f3dec7112a46be44ae5602df07655652b))
* **ios:** allows the access party to customize filter attributes ([19938bd](https://github.com/Tencent/Hippy/commit/19938bd6d039681d80d62319b8c434de951ee609))
* **ios:** remove uncall codes ([b53bc03](https://github.com/Tencent/Hippy/commit/b53bc0391c88ecd09a22e16c1abe4f26470b5d8e))
* **ios:** set magnificationFilter as kCAFilterNearest by default ([bd1642d](https://github.com/Tencent/Hippy/commit/bd1642d22feece636e5760696856ecf6e8a54134))
* **ios:** support skew animation ([eb6042b](https://github.com/Tencent/Hippy/commit/eb6042bc88a132b94fefccef39aa9a3b2436cb79))
* **js:** add iOS promise unhandledrejection ([c11766d](https://github.com/Tencent/Hippy/commit/c11766db00a69618e35b17932e4a049f461e2108))
* **web-renderer:** add web-renderer demo & docs ([#2234](https://github.com/Tencent/Hippy/issues/2234)) ([ca39aea](https://github.com/Tencent/Hippy/commit/ca39aea045ee3d8eb9752b59fcd7850a2750d1ac))
* **workflows:** optimize for speed when CodeQL is not required ([ae34106](https://github.com/Tencent/Hippy/commit/ae34106b5000fc88231648b60a508aa1f5f18c4c))
* **workflows:** optimize logic to reduce misjudgment ([f7065eb](https://github.com/Tencent/Hippy/commit/f7065ebdd01ac863e45594402816839097139655))





# [2.14.0](https://github.com/Tencent/Hippy/compare/2.13.10...2.14.0) (2022-06-21)


### Bug Fixes

* **android:** add RecyclerView extra class name ([b124434](https://github.com/Tencent/Hippy/commit/b124434c38caceca370bc5a78f4c5ee3690ee8bc))
* **android:** crash of sticky item view ([f2c78d1](https://github.com/Tencent/Hippy/commit/f2c78d11b618ddca9238d04b4f077c00e3bc2b26))
* **android:** fix `v8` inspector does not work ([a0e65b8](https://github.com/Tencent/Hippy/commit/a0e65b8abdd67953982b59fb33c1b9f74e91b587))
* **android:** fix `v8` inspector does not work ([f53df58](https://github.com/Tencent/Hippy/commit/f53df58109508f8010309e9b9601276caad207d1))
* **android:** fix java lint warnings ([bbff285](https://github.com/Tencent/Hippy/commit/bbff2857721c9095984bff9f01239cd120c3b452))
* **android:** fix occasional crash when jsi convert ([ff7e298](https://github.com/Tencent/Hippy/commit/ff7e298f4e7e4525ae7cc103d381713ea812c4b9))
* **android:** handle ACTION_CANCEL in scroll view onTouchEvent ([2b847db](https://github.com/Tencent/Hippy/commit/2b847dbf659789b298d16c6f0949ecca8d52fecd))
* **android:** pull foot and header can exist at same time ([b435496](https://github.com/Tencent/Hippy/commit/b435496c9039df66b91a1e38b72d7c8803502d41))
* **android:** should catch exception from CookieManager.getInstance() ([7b8fda3](https://github.com/Tencent/Hippy/commit/7b8fda35343a91a5982554b3d431945deb895ef1))
* **ci:** fix android build tests workflow throw `gradle not found` error ([2a0fb62](https://github.com/Tencent/Hippy/commit/2a0fb629dd676c90e129a4acb81723cf7bf45b43))
* **ci:** fix front-end bypass jobs event issue ([e962e61](https://github.com/Tencent/Hippy/commit/e962e61ec78971b2787fe8af8e4b661dd0f7316d))
* **cmake:** disable outline atomics on android ([d7a5a43](https://github.com/Tencent/Hippy/commit/d7a5a4343b6cb4bc18239b67d978e76f11b2bb55))
* **cmake:** fix `core.modules` not automatically registered problem ([463a5d5](https://github.com/Tencent/Hippy/commit/463a5d50f76df7f62404f16d905711456e68ce87))
* **cmake:** fix typo problems ([723a6d1](https://github.com/Tencent/Hippy/commit/723a6d185ba9dcf7dd0d5416475b8770392427b7))
* **core:** add ios dimensions getter & setter and combine logic ([255500d](https://github.com/Tencent/Hippy/commit/255500defeeb8d7e104bb19e6911076e749563c6))
* **devtools:** support node 17 for md4 hash ([41a4695](https://github.com/Tencent/Hippy/commit/41a46957fb12f5adb84d04f811e0bb14214652f0))
* **docker:** use 2.7 version of `get-pip.py` instead ([41655ed](https://github.com/Tencent/Hippy/commit/41655ed102d0807b892e2637c48e18e9045847a6))
* **docs:** add debug access introduction ([11ddb53](https://github.com/Tencent/Hippy/commit/11ddb539d98ca9278241aee341c8b4339335e915))
* **docs:** update debug for android debug mode ([f2e41b3](https://github.com/Tencent/Hippy/commit/f2e41b3c8f380aa9703dce9965ba474a69f8b5e0))
* **hippy-react-web:**  fix hippy-react-web some issues ([#1850](https://github.com/Tencent/Hippy/issues/1850)) ([43b785b](https://github.com/Tencent/Hippy/commit/43b785b46bedf60dd812acd91401e18b0270d23b))
* **hippy-vue:** update hippy-vue node test ([14d2242](https://github.com/Tencent/Hippy/commit/14d224258dd99ecef14bdda0ccc6ed1b7945a4ad))
* **ios:** adjust text layout ([fe4a6f7](https://github.com/Tencent/Hippy/commit/fe4a6f712dbff19b56f52337438bdc9f8ef01219))
* **ios:** check cookie availabity before commit ([b902ad8](https://github.com/Tencent/Hippy/commit/b902ad8dafea6b64077be1e106d809b155d4edaf))
* **ios:** fix a crash caused by thread race ([b63148e](https://github.com/Tencent/Hippy/commit/b63148e8744deb52e736b63ce82c81ff4ab1904a))
* **ios:** fix a crash caused by thread race ([5291ab6](https://github.com/Tencent/Hippy/commit/5291ab632d1db2768df28821f59a5414960245d5))
* **ios:** fix border bottom color display error ([1f342b2](https://github.com/Tencent/Hippy/commit/1f342b24c36ecef028183eeb1e9568e73e09447d))
* **ios:** fix crash due to null pointer ([5df3cfb](https://github.com/Tencent/Hippy/commit/5df3cfb8b12150d9ebe6bee537bd38409f7558fa))
* **ios:** fix memory leaks ([ae4be6b](https://github.com/Tencent/Hippy/commit/ae4be6b9c5a92ad0a3d5196eb7a9a07f51dce232))
* **ios:** fix refresh bug for header refresh and footer refresh ([9fb451f](https://github.com/Tencent/Hippy/commit/9fb451f6bdcf1eec08d5dedaa5dd4d83729efbe6))
* **ios:** fix refresh component delay reset bug ([0157ebe](https://github.com/Tencent/Hippy/commit/0157ebee0cf6668f7dadf3c06e1eecf1711b4b6f))
* **ios:** fix zpoistion error for indicator and header view ([8a045d8](https://github.com/Tencent/Hippy/commit/8a045d831d160918a0293a87256e10aaf94e9063))
* **ios:** modify cookie setting logic ([e4a8c87](https://github.com/Tencent/Hippy/commit/e4a8c87f2300f74aa36068dab7ac0b75b7dcd06d))
* **workflows:** add accessible permission to avoid error ([0f17bdc](https://github.com/Tencent/Hippy/commit/0f17bdc11b0a0d143a0c8fce58494016cf5b144e))


### Features

* **android:** add gradlew script execute permission ([7a45c0e](https://github.com/Tencent/Hippy/commit/7a45c0ec43303e7b4279d48f0bb99bc9865f8152))
* **android:** add initialContentOffset support for recycle view ([63f7ef4](https://github.com/Tencent/Hippy/commit/63f7ef46540646a30b491ab9a379783f1cd19dcf))
* **android:** change one byte string encoding ([d55d214](https://github.com/Tencent/Hippy/commit/d55d21483eb756c4a885bb2e0fd8a297e946ebab))
* **android:** fix and provide `gradlew` command support ([4608ea1](https://github.com/Tencent/Hippy/commit/4608ea12da9aa08281d73b94241d30b66bc14bf7))
* **android:** modify the `V8` inspector macro definition ([dc4df92](https://github.com/Tencent/Hippy/commit/dc4df923214a46920973fb9b943d9d1e6462aa35))
* **android:** remove unused cmake variable ([3790d47](https://github.com/Tencent/Hippy/commit/3790d476ef8d1609b11178817e6eeb284b4dce16))
* **android:** remove unused visual studio project ([2b99eac](https://github.com/Tencent/Hippy/commit/2b99eacca1adecb60813508be8c7ae2c89f10e47))
* **android:** remove useless jni third_party ([a65fbb1](https://github.com/Tencent/Hippy/commit/a65fbb19a02c3433f66ae7ad3a113c073623b45c))
* **android:** restructure pull header and footer ([bd5b6ea](https://github.com/Tencent/Hippy/commit/bd5b6ea22316d1d4339e024f3f65a0e8207aaf73))
* **android:** support getNativeParams from HippyEngineContext ([91a8b8e](https://github.com/Tencent/Hippy/commit/91a8b8ed3e39fa875673aa0cbdeb0d24f48d8842))
* **android:** support HippyHttpRequest get NativeParams ([69898bb](https://github.com/Tencent/Hippy/commit/69898bb10dcdb347c696ab3fda43b590a2ffb3db))
* **android:** support host customize default font family ([#1839](https://github.com/Tencent/Hippy/issues/1839)) ([c14e06a](https://github.com/Tencent/Hippy/commit/c14e06a6da13570106dae3467a34bb0733622e53))
* **android:** support sync restoreInstanceState ([79f3307](https://github.com/Tencent/Hippy/commit/79f3307ea24bd176d41c17bcf2ddfb2bd6ba106f))
* **android:** support wrap-reverse and space-evenly ([#742](https://github.com/Tencent/Hippy/issues/742)) ([27e7bad](https://github.com/Tencent/Hippy/commit/27e7badfea459b0b93413e056501a33e2d29caf3))
* **android:** upgrade recommend `v8` version to 9.8-lkgr ([58402df](https://github.com/Tencent/Hippy/commit/58402df5c1932ba8615ff25317fafb0411dc2a15))
* **android:** use androidX recyclerView ([3ad6355](https://github.com/Tencent/Hippy/commit/3ad635521caccb76bbe244c249b201a0c043262d))
* **android:** use HIP(hippy-infa-packages) to replace local `v8` ([0ed2f79](https://github.com/Tencent/Hippy/commit/0ed2f79d271b27752ee9d6742cd6556898a446b4))
* **cmake:** add unified compiler toolchain ([7713364](https://github.com/Tencent/Hippy/commit/77133641c5ca21bb9d789c1fc70edfc4ab1ccfc8))
* **cmake:** do not overwrite original value ([cd7df69](https://github.com/Tencent/Hippy/commit/cd7df69461e9253b0287fa2bbadbbb77db26fb18))
* **core:** support other options for fetch request ([762494a](https://github.com/Tencent/Hippy/commit/762494a714bc37b586b236f994ba69df8b29f481))
* **devtools:** support devtools connect after disconnect ([462d121](https://github.com/Tencent/Hippy/commit/462d121b35dd9677b7ae6efe1b9262296c04ff60))
* **devtools:** support devtools reload and update context ([b9ea0be](https://github.com/Tencent/Hippy/commit/b9ea0be538308002ec31a493a2192640475818af))
* **devtools:** support react-devtools ([5a7bdf7](https://github.com/Tencent/Hippy/commit/5a7bdf76675a658282c6dfebc7ce0b3564bab897))
* **hippy-react-web:** perfect hippy-react-web components ([#1427](https://github.com/Tencent/Hippy/issues/1427)) ([f6a6c01](https://github.com/Tencent/Hippy/commit/f6a6c015d985d0191e5afb53854ecdf8c8e069b5))
* **hippy-react-web:** support tree-sharking & fix issues ([#2069](https://github.com/Tencent/Hippy/issues/2069)) ([75ece3b](https://github.com/Tencent/Hippy/commit/75ece3bb372350254966fba0e028fb4b11903bfd))
* **hippy-react:** add callUIFunction debug log ([5944182](https://github.com/Tencent/Hippy/commit/5944182dc6f4e61bbb471253e9efe74c90f51c1e))
* **hippy-vue:** add animaiton actionsDidUpdate hook ([f61b48e](https://github.com/Tencent/Hippy/commit/f61b48e83d6154b05be9fa40e3739672038a91c4))
* **hippy-vue:** merge vue updating attriute operation ([ac36f8f](https://github.com/Tencent/Hippy/commit/ac36f8f877fc50d6fc265856746f553ee5a5a9a7))
* **hippy-vue:** refactor vue animation events ([e98a0d7](https://github.com/Tencent/Hippy/commit/e98a0d7d97c9a3080f3be92c4e4a22071fec89a8))
* **hippy-vue:** rm compatible process for endReached & loadMore event ([d320eb1](https://github.com/Tencent/Hippy/commit/d320eb1cf113bc0151af71c601e74aca610592bc))
* **hippy-vue:** support to remove event & merge alias event registered ([b34d7ef](https://github.com/Tencent/Hippy/commit/b34d7efdcef876b41de79108058ae71512407be8))
* **ios:** add textinput keyboard height changed event ([aed4a15](https://github.com/Tencent/Hippy/commit/aed4a15d858678601b8f8c3cd6e575110a18b309))
* **ios:** make item view be a subclass of hippyview ([f2d685d](https://github.com/Tencent/Hippy/commit/f2d685d55d28c1cc030bc02129e2b23a35a806e2))
* **react,vue:** add collapsePullHeaderWithOptions api ([af0129a](https://github.com/Tencent/Hippy/commit/af0129a57af36b25ef90f6514b93578fc65568fe))
* **react:** change updateNode to batch operation & perf event binding ([fdae46a](https://github.com/Tencent/Hippy/commit/fdae46aed86a7f2d2034645c6912e372a5d1b4e5))
* **workflows:** add Hippy Infra Packages(HIP) related workflows ([f01a845](https://github.com/Tencent/Hippy/commit/f01a845b78fcbe27069c80cf991a24ad28f9f806))
* **workflows:** support for getting artifact tags ([0d9e1e4](https://github.com/Tencent/Hippy/commit/0d9e1e48907de2d4ade20cf6114ba7ceb2177dfc))





## [2.13.10](https://github.com/Tencent/Hippy/compare/2.13.9...2.13.10) (2022-05-25)


### Bug Fixes

* **android:** call engine context method NullPointerException ([0c34965](https://github.com/Tencent/Hippy/commit/0c34965a3ce829a00d55b23bd82e0efff6f0b344))
* **android:** mBridgeCallback leaked in fetchResourceWithUri ([6ae7813](https://github.com/Tencent/Hippy/commit/6ae7813ae5d706aca34e4486d649c51f863a2a95))
* **core:** fix deadlock bug ([f08708f](https://github.com/Tencent/Hippy/commit/f08708fad63832ad87c92806d5184585493b8c60))
* **core:** fix iOS warning ([018f529](https://github.com/Tencent/Hippy/commit/018f5296717c77b172d8d8e3c0593bcda4068da4))
* **core:** fix memory leak in multi-context mode ([c5447e1](https://github.com/Tencent/Hippy/commit/c5447e18e2498e5e12817ef32adcc8a41dc92ebc))
* **hippy-react-web:** change rmc-list-view to hippy domain ([c9e28f4](https://github.com/Tencent/Hippy/commit/c9e28f460ff25c34a8e94e30d017dbe7743c752f))
* **ios:** fix hippy view reuse bug ([253fe78](https://github.com/Tencent/Hippy/commit/253fe7865b515c428a1232fc767b258923e989d2))
* **ios:** reduce GPU usage by reducing off-screen rendering ([#1902](https://github.com/Tencent/Hippy/issues/1902)) ([4f5a0b2](https://github.com/Tencent/Hippy/commit/4f5a0b27c4e040a0fe33b24f08ec9f596489a24b))





## [2.13.9](https://github.com/Tencent/Hippy/compare/2.13.8...2.13.9) (2022-05-16)


### Bug Fixes

* **core:** fix mutex crash ([de3dad1](https://github.com/Tencent/Hippy/commit/de3dad1f61f024f944a23974ec5611d175553999))





## [2.13.8](https://github.com/Tencent/Hippy/compare/2.13.7...2.13.8) (2022-05-12)


### Bug Fixes

* **android:** fix remote url debug not contains version ([3005622](https://github.com/Tencent/Hippy/commit/30056228856242132892b99090f02cfc9a673a8b))
* **android:** reset pull header position on scroll back ([301f631](https://github.com/Tencent/Hippy/commit/301f631f6acea235407bdb2f68bb62d9e7c96031))
* **android:** reset recycle view stick view item type ([f79b73d](https://github.com/Tencent/Hippy/commit/f79b73d563705cf9bedb735a0d7942a1d7e6a291))
* **core:** fix convert bug ([f43988f](https://github.com/Tencent/Hippy/commit/f43988fa7bfe6a5f1143d22965d20e979159f3a6))
* **core:** fix jni pending exception crash ([5273ba5](https://github.com/Tencent/Hippy/commit/5273ba586308cddf6cbbde4de2feb718ddc75bcf))
* **core:** fix turbomodule crash ([6d08242](https://github.com/Tencent/Hippy/commit/6d082428cdb196e14d5eebc0c328ea60bcb0f444))
* **hippy-vue:** fix hmr for root App component ([2c2ef45](https://github.com/Tencent/Hippy/commit/2c2ef45f82e140173c0625b2e5837fbf6d76df5a))
* **ios:** remove an unused macro check ([7f2b7f7](https://github.com/Tencent/Hippy/commit/7f2b7f788be67ed83dc5bfb01b968f2562e8065e))


### Features

* **devtools:** change the screenshot canvas background to white ([00445d5](https://github.com/Tencent/Hippy/commit/00445d57f0bc780e96bcaeb6ef03cd583c18b95f))





## [2.13.7](https://github.com/Tencent/Hippy/compare/2.13.6...2.13.7) (2022-04-27)


### Bug Fixes

* **android:** elements page screencast at first msg ([f9059d1](https://github.com/Tencent/Hippy/commit/f9059d1101cde64b87ec876be1bffaf83599ef60))
* **android:** fix 'mControllers' may be accessed by multi-threads ([460ad50](https://github.com/Tencent/Hippy/commit/460ad502e22838d9b82f546bbc1911d66f438e57))
* **android:** post to dom thread do save ([0ccb13a](https://github.com/Tencent/Hippy/commit/0ccb13ad748dbe314de3a5d5e1a090200223994c))
* **android:** remove build modal from user agent ([4d0d376](https://github.com/Tencent/Hippy/commit/4d0d376b4a7493268f066b8939e44062e740c333))
* **android:** reset pull header position for recycler view ([42ef3c9](https://github.com/Tencent/Hippy/commit/42ef3c9e682af037a87ff052cd970d4a2ff41ceb))
* **android:** should call onInterceptPromiseCallBack first ([484d6c6](https://github.com/Tencent/Hippy/commit/484d6c658803f17ca4c1b02c3601794a355402ba))
* **core:** fix jni detach crash ([785edb3](https://github.com/Tencent/Hippy/commit/785edb31bcef4d04f21dc52f11c8ab3f9f9d377c))
* **core:** fix log macro conflict for iOS ([5654164](https://github.com/Tencent/Hippy/commit/565416408d2e5da98e8359bb3474cbc798394cda))
* **debug-server:** update vulerable pacakage ([bd4653f](https://github.com/Tencent/Hippy/commit/bd4653f04aa9ea13f7cf96b2554a75c4cad2fd1e))
* **devtools:** fix alpha screencast ([8604f1a](https://github.com/Tencent/Hippy/commit/8604f1a769a38f5721cf1a1213443fc0959d95ec))
* **hippy-vue:** fixed vue text update filter ([c127669](https://github.com/Tencent/Hippy/commit/c127669b7695ddd4dc29e4b12a81ac42d9fe3060))
* **ios:** fix image display crash ([c9a39fc](https://github.com/Tencent/Hippy/commit/c9a39fc3ccf5afa47a8c5f93ff2ecd69006f21bf))
* **ios:** fix list scroll event throttle bug ([44b8aed](https://github.com/Tencent/Hippy/commit/44b8aed46edc1b3539ff66051178dea8abe5a44b))
* **ios:** fix strange shaped text render bug ([d77df3b](https://github.com/Tencent/Hippy/commit/d77df3b7125437ac434999592c18825f0b3b07d5))
* **ios:** fix touch handler conflict ([6ae38ca](https://github.com/Tencent/Hippy/commit/6ae38ca54c164d91cdf0ed122b4a46baca962401))
* **ios:** fix value fetch error ([e0edfae](https://github.com/Tencent/Hippy/commit/e0edfaee4b06310c0f43590c82ce0ac5d9ea520f))


### Features

* **android:** add call native and promise callback monitor ([301562c](https://github.com/Tencent/Hippy/commit/301562c547d6f2b23c528fb86607cfaee7bcb5f6))
* **android:** add method 'addApiProviders' in HippyEngineContext ([50dbe8a](https://github.com/Tencent/Hippy/commit/50dbe8ad71cafb333f1342debd02e4f86c87997a))
* **android:** support vue-devtools debugClientId ([c09e751](https://github.com/Tencent/Hippy/commit/c09e7514af4e58148b9ca6782e07e07d1b5c53dd))
* **core:** change log level ([12022fb](https://github.com/Tencent/Hippy/commit/12022fb9c9bfa8e0663cb64edadbeafbd232c0b9))
* **devtools:** support vue-devtools ([e0cf765](https://github.com/Tencent/Hippy/commit/e0cf7654f4a95d4342aaeaca8bffa590ce9e2852))
* **ios:** add clientId and fix empty port ([#1737](https://github.com/Tencent/Hippy/issues/1737)) ([aea12a3](https://github.com/Tencent/Hippy/commit/aea12a33397a3c6c5786492bd28b8dd8cba21f4a))
* **ios:** localstorage can handle error ([2426a8e](https://github.com/Tencent/Hippy/commit/2426a8e5df948b63cf8d96534e5f91fcee0ae06b))
* **ios:** method invoke interceptor ([#1774](https://github.com/Tencent/Hippy/issues/1774)) ([1ae54c6](https://github.com/Tencent/Hippy/commit/1ae54c6363426ff9f1b2fd877738913796470e24))
* **ios:** unified client id generation logic ([#1743](https://github.com/Tencent/Hippy/issues/1743)) ([1c2359c](https://github.com/Tencent/Hippy/commit/1c2359c5926f0a27cec2744956f0bd73015e2dcc))
* **react,vue:** add position absolute for modal default style ([7bbed56](https://github.com/Tencent/Hippy/commit/7bbed5684e309cde7fe229f81ad746b1873467da))





## [2.13.6](https://github.com/Tencent/Hippy/compare/2.13.5...2.13.6) (2022-04-18)


### Bug Fixes

* **core:** change callbacks to object to fix memory leak ([9ea52da](https://github.com/Tencent/Hippy/commit/9ea52dae503512ef22e9a928483ef4119674c49b))





## [2.13.5](https://github.com/Tencent/Hippy/compare/2.13.4...2.13.5) (2022-04-01)


### Bug Fixes

* **core:** remove batch call redundant param ([69c8b7e](https://github.com/Tencent/Hippy/commit/69c8b7e9fbb1f3181ffd03181c68ae8b1761231d))
* **ios:** fix AnimatedImageView displayLayer crash bug ([7a1e0e3](https://github.com/Tencent/Hippy/commit/7a1e0e3cd1df7dccb40eac32cff5f3b7c92f2123))
* **ios:** fix image display crash ([85de0af](https://github.com/Tencent/Hippy/commit/85de0af705bff371eb41c0b6891139e9773a06c8))





## [2.13.4](https://github.com/Tencent/Hippy/compare/2.13.3...2.13.4) (2022-03-29)


### Bug Fixes

* **android:** fix nested sub-tag serialization issue ([7fe73ca](https://github.com/Tencent/Hippy/commit/7fe73ca9598c85fab81f932ce9ba126935915097))
* **android:** merge recyclerview to master ([8e2038c](https://github.com/Tencent/Hippy/commit/8e2038c4900c847b2b1ed559a2dd9697a2b61cb2))
* **android:** packagingOptions of ARMEABI ([f051421](https://github.com/Tencent/Hippy/commit/f051421c48e1befba986bb832a73baf30d56f3c4))
* **android:** remove final of bundleName ([d284fa1](https://github.com/Tencent/Hippy/commit/d284fa1448c525da0a43b6f317650b04c9aaf31f))
* **android:** use getResources DisplayMetrics ([ad455b3](https://github.com/Tencent/Hippy/commit/ad455b3458abca2a7251215f17106ecb1314f152))
* **core:** fix jni local ref bug ([83348e2](https://github.com/Tencent/Hippy/commit/83348e2bd739144e77cbc9f51e513b05862d9b67))
* **core:** fix log delegate crash ([249f9e4](https://github.com/Tencent/Hippy/commit/249f9e43bcfc059b20d0e26a876ddc03eb0e38a4))
* **hippy-react-demo:** fix backAndroid routes error ([d11fd9a](https://github.com/Tencent/Hippy/commit/d11fd9ab259a0e7193163c110f22b8f4b0119dd7))
* **ios:** fix crash caused by multi-thread race ([513c9d6](https://github.com/Tencent/Hippy/commit/513c9d63217507d6f9b2a55b1a822cb8045fbe97))
* **ios:** fix image blurry error ([83281ca](https://github.com/Tencent/Hippy/commit/83281ca75cf18b5d1d0110c9ca08ec1aa8ee36b1))
* **ios:** fix image load progress error ([618eeda](https://github.com/Tencent/Hippy/commit/618eedabef74cd767f4e834d96a4c6fcc6db8eb4))
* **ios:** fix image tint color bug ([3884b0d](https://github.com/Tencent/Hippy/commit/3884b0d7f5c8e47f793f093470d4b5b3e5ce55db))
* **ios:** fix jsi crash on some devices ([e8fb942](https://github.com/Tencent/Hippy/commit/e8fb942d28047c413a62758f7e9982e8f60e17f7))
* **ios:** fix some issues ([#1679](https://github.com/Tencent/Hippy/issues/1679)) ([8a88f0a](https://github.com/Tencent/Hippy/commit/8a88f0a090b45a2a71c8ef760c3c29f7165b4d1a))
* **react,vue:** add TextInput color parser ([f9f0e2b](https://github.com/Tencent/Hippy/commit/f9f0e2b9637efc1fa82db293bbeeb3124df0eb61))
* **vue:** update vulerable packages ([3e15f5c](https://github.com/Tencent/Hippy/commit/3e15f5c26ff9b7d875791a3cac4520ba22d99524))


### Features

* **android:** js -> native support use js value ([fddfaae](https://github.com/Tencent/Hippy/commit/fddfaae83d2b2ced081ea62ba9f3eb0a47b9223a))
* **android:** support debug context name display ([e134723](https://github.com/Tencent/Hippy/commit/e13472344b89db39c1bec9525db0d9c459ed9c0d))
* **devtools:** support debug multiple project at the same time ([8213ff6](https://github.com/Tencent/Hippy/commit/8213ff6c72db75daedc83b2046650512252b99b7))
* **vue-demo, react-demo:** remote debug, load remote bundle ([1b12953](https://github.com/Tencent/Hippy/commit/1b129538d92fe14119b1c29418ae52def03951b5))





## [2.13.3](https://github.com/Tencent/Hippy/compare/2.13.2...2.13.3) (2022-03-09)


### Bug Fixes

* **android:** onScroll of HippyRecyclerView ([eb2bead](https://github.com/Tencent/Hippy/commit/eb2bead347cc6bbc1371ba663afc82715e40ca31))
* **core:** fix multi-context mode exception handling crash ([659f7a9](https://github.com/Tencent/Hippy/commit/659f7a9bb8a3fe09c3be4adf0f021bc4e8909c33))


### Features

* **android:** support multi instance to debug elements ([1884d0e](https://github.com/Tencent/Hippy/commit/1884d0e93b98ad097f175fefa853516f5e05602d))
* **core:** refactor NAPI and rename macros ([f6f037f](https://github.com/Tencent/Hippy/commit/f6f037f49d23f5646ad922a32ee61d95a4d6ffb8))





## [2.13.2](https://github.com/Tencent/Hippy/compare/2.13.1...2.13.2) (2022-03-08)


### Bug Fixes

* **android:** add lower bound checking for `uint32` value ([7743a52](https://github.com/Tencent/Hippy/commit/7743a52e31eee9e80dd5cb682fb007f5302a63ea))
* **android:** fix context leaks on EngineInitParams ([67bbea5](https://github.com/Tencent/Hippy/commit/67bbea588d6d257ad8cb900a3185ec564c6ef9f6))
* **ios:** close web socket when dev manager release ([a81e2a3](https://github.com/Tencent/Hippy/commit/a81e2a340ababcdde7b8e9a2c26b1cd8e7a138fb))
* **ios:** fix currentRadioAccessTechnology unavailable in ios14.2 ([2031178](https://github.com/Tencent/Hippy/commit/2031178d3ab70dbb5d519a480e3ecadedfa51c01))
* **ios:** fix mixed type text word order bug ([6ed4df3](https://github.com/Tencent/Hippy/commit/6ed4df30c4644d8aa45a8b18dde3db97d0cf0236))
* **lerna:** change lerna execute path ([021fc89](https://github.com/Tencent/Hippy/commit/021fc89d32b24d6af36f360b00d241185cb092dd))





## [2.13.1](https://github.com/Tencent/Hippy/compare/2.13.0...2.13.1) (2022-02-27)


### Bug Fixes

* **android:** fix `armeabi` architecture build script ([bf06413](https://github.com/Tencent/Hippy/commit/bf06413a2853f27c2c6ccb1df6764c77120b27e5))
* **android:** fix context leaks on EngineInitParams ([4ce08d3](https://github.com/Tencent/Hippy/commit/4ce08d35bb3820bfc8a404119cdb5d9993292d3c))
* **android:** fix leaf node can't show css ([a41c07a](https://github.com/Tencent/Hippy/commit/a41c07a84fa512cee003ceb69b66bff549e9fcdc))
* **android:** remove color property in HippyForegroundColorSpan ([376dd9b](https://github.com/Tencent/Hippy/commit/376dd9b320d33dcf85c6212b1108615bccbe7b6c))
* **android:** support elements color/findNode by path ([1ef25c2](https://github.com/Tencent/Hippy/commit/1ef25c27f9782c4f8664d8d6d398614f9b3559fa))
* **android:** use context.getResources() get windowDisplayMetrics ([8813195](https://github.com/Tencent/Hippy/commit/8813195119148b3e01bf927460bbc10487e4f19e))
* **core:** add HandleUncaughtException function and refactor ThrowException function ([0ffe8f9](https://github.com/Tencent/Hippy/commit/0ffe8f90b7defa77cef3e8db683aabe98734b285))
* **core:** fix dynamicLoad bug ([0a51dd4](https://github.com/Tencent/Hippy/commit/0a51dd47cc4f300f5070fcce6518d4b02a91657c))
* **ios:** fix view pager item index error ([151512e](https://github.com/Tencent/Hippy/commit/151512e94df7459fdea2f5bd76a095e183e5f02f))


### Features

* **android:** add log level for delegate ([d2bb277](https://github.com/Tencent/Hippy/commit/d2bb277dbe1532a0367fd9bcc5040c1ce4d92f9a))
* **android:** add remote debugging in non-usb ([e46d571](https://github.com/Tencent/Hippy/commit/e46d571e2874b82e3bd87e73da74b6cc880394ee))
* **android:** cmake script adds `V8` library file format check ([3e90885](https://github.com/Tencent/Hippy/commit/3e908853bd731213f6d82946e2904bfccb77a287))
* **android:** support remote non usb debug ([5bf9109](https://github.com/Tencent/Hippy/commit/5bf91090da4d90fb770d58423b6bedb442b49e0f))
* **android:** textnode custom forgroudcolor ([16c6baf](https://github.com/Tencent/Hippy/commit/16c6bafbdf39489e9b66a323746df59b2f5f649c))
* **android:** update AGP version to 7.1.1 ([cf5eda5](https://github.com/Tencent/Hippy/commit/cf5eda59c710ef5ca973de93dc13107f6f821ff7))
* **android:** view adds touch ripple feature ([#989](https://github.com/Tencent/Hippy/issues/989)) ([5518ffb](https://github.com/Tencent/Hippy/commit/5518ffb68a3348697d9a5586486c43a6ef376793))
* **c++:** optimize c++ code-quality ([e40d6a5](https://github.com/Tencent/Hippy/commit/e40d6a55042208d5a5fabe58880d3b8e66654c10))
* **core:** add log level for delegate ([c211c61](https://github.com/Tencent/Hippy/commit/c211c616fb88ae0040787c654fbf199774f758fa))
* **core:** change print log level and fix check macro not crash bug ([e6779ac](https://github.com/Tencent/Hippy/commit/e6779ac03b25b07699f8165683ec1ac27764f7e2))
* **core:** replacing manually managed GlobalRef with JavaRef ([01e3fc7](https://github.com/Tencent/Hippy/commit/01e3fc73a059b3a1292e2c52891850878351a6a3))
* **ios:** devtools modify debugURL key ([98a0693](https://github.com/Tencent/Hippy/commit/98a06933366c9d22eea99e3e24e7e283087bf4e6))





# [2.13.0](https://github.com/Tencent/Hippy/compare/2.12.2...2.13.0) (2022-02-09)


### Bug Fixes

* **android:** fix lint warnings & errors ([dc7f4d3](https://github.com/Tencent/Hippy/commit/dc7f4d3f36da3e8472fe11876e1a915fc0ece9ca))
* **android:** remove useless `V8` command-line flag ([371daac](https://github.com/Tencent/Hippy/commit/371daacc26597670d023b1e5ffec73034f66ce6d))
* **ci:** add packages npm install ([6a9804e](https://github.com/Tencent/Hippy/commit/6a9804eb746ef35069947adca7d89e6e3bf8bcf6))
* **core:** fix parse uri crash ([48f5af3](https://github.com/Tencent/Hippy/commit/48f5af3c14c95608b22171816ee83f981c52eaa4))
* **ios:** fix ios elements DOM.pushNodesByBackendIdsToFrontend protocol ([38e928e](https://github.com/Tencent/Hippy/commit/38e928e7fa65f911b3c70c02cf87188478c56f92))
* **js:** update ts version and ts declaration issues ([2df21c5](https://github.com/Tencent/Hippy/commit/2df21c55aef2e4369175abfc8bd40d861481a847))
* **web:** fix turbo demo bugs ([6199202](https://github.com/Tencent/Hippy/commit/6199202c25b146eeec547baaa28cdafb009fae85))
* **web:** fix turbo demo bugs ([5d5729d](https://github.com/Tencent/Hippy/commit/5d5729d6846b09d448e997ab7a66c9d236975008))


### Features

* **android,ios:** add jsi document & demo ([#1508](https://github.com/Tencent/Hippy/issues/1508)) ([e3b9143](https://github.com/Tencent/Hippy/commit/e3b914338755afbf02540da331cbd2a96542869c))
* **android:** `HIDDEN_LIBRARY_SYMBOL` flag affects 3rd party libraries ([e0bc3f5](https://github.com/Tencent/Hippy/commit/e0bc3f5a651c22ea2c524400c452b87b63969986))
* **android:** replace unsafe JNI numeric cast with safe method ([d857cba](https://github.com/Tencent/Hippy/commit/d857cba0c9a03b5d8633f6561b1b6d964dbbcea5))
* **android:** update AGP to 7.0.4 version ([8e04792](https://github.com/Tencent/Hippy/commit/8e047922228a36609041bf6c9f3ebd58f2b7ccc3))
* **android:** view pager support offscreenPageLimit ([91e2f6c](https://github.com/Tencent/Hippy/commit/91e2f6c58ebc125e621fee3a0bd01b78127c0ac8))
* **ios:** elements css, add color display and modification ([ec5b5c2](https://github.com/Tencent/Hippy/commit/ec5b5c28823f7c2b7469f7ce6a12ae495b63faab))
* **ios:** modify websocket url symbol ([f3d04e2](https://github.com/Tencent/Hippy/commit/f3d04e21bda1ac1327da166da50dc801c9dfe00b))
* **ios:** parse websocket url from bundle url ([#1474](https://github.com/Tencent/Hippy/issues/1474)) ([03bc96f](https://github.com/Tencent/Hippy/commit/03bc96fe2ed49688344a5484f49c28e30de14e8d))
* **ios:** set default font size to 14 ([0ac9398](https://github.com/Tencent/Hippy/commit/0ac9398b919d0475aa68211e460d44a82c1a1ffa))
* **ios:** websocket url add hash and close with code and reason ([#1447](https://github.com/Tencent/Hippy/issues/1447)) ([3365605](https://github.com/Tencent/Hippy/commit/33656057cb7e7905e788f0a37928d3920b57e7a9))
* **react,vue:** perf startBatch ([5bce8e9](https://github.com/Tencent/Hippy/commit/5bce8e9dedf1b5fd495216792f5f4b7f422671b5))





## [2.12.2](https://github.com/Tencent/Hippy/compare/2.12.1...2.12.2) (2022-01-26)


### Bug Fixes

* **hippy-react:** fixed network-info wrong stored listener ([e3926d9](https://github.com/Tencent/Hippy/commit/e3926d9582e0a15eea15ac721e620aeac20fa9cc))


### Features

* **hippy-vue:** support  value for anim repeatCount ([4c7ede7](https://github.com/Tencent/Hippy/commit/4c7ede7453aa4922d7ec9e4e904dbd5124ef403f))
* **ios:** 1.default enable turbo, 2.fix package jsi error ([#1475](https://github.com/Tencent/Hippy/issues/1475)) ([47ba8d1](https://github.com/Tencent/Hippy/commit/47ba8d133f7495b6a176f7f0b23fa5dcd01e037d))





## [2.12.1](https://github.com/Tencent/Hippy/compare/2.12.0...2.12.1) (2022-01-18)


### Bug Fixes

* **android:** add setMetrics to PixelUtil ([40af198](https://github.com/Tencent/Hippy/commit/40af198c7ec0d67ff920b1b6d1585f33f29b048b))
* **android:** fix HippyImageSpan align problems ([31739fb](https://github.com/Tencent/Hippy/commit/31739fbc616eacd0e2499cc1cdb1e2d9dd4d2137))
* **android:** fix memory leak ([6677220](https://github.com/Tencent/Hippy/commit/6677220539d1339ca2ebdc7759605a059783de6a))
* **core:** fix LoadUntrustedContent crash ([88fa2cd](https://github.com/Tencent/Hippy/commit/88fa2cdb0ad922bf6aa2a0b18a3ea3e1f3fb985d))
* **core:** fix TDF_BASE_DCHECK crash ([b489fbf](https://github.com/Tencent/Hippy/commit/b489fbfcb0f3daa33e306988890df4420f876124))


### Features

* **ios:** jsi switch ([1998302](https://github.com/Tencent/Hippy/commit/199830221048cc36df65adb6f1bf3d301f91ebe9))





# [2.12.0](https://github.com/Tencent/Hippy/compare/2.11.6...2.12.0) (2022-01-04)


### Bug Fixes

* **android:** add callback for save dom node exception ([8c0078e](https://github.com/Tencent/Hippy/commit/8c0078eab1b50d78a4da3517261d7ecabc828fff))
* **android:** fix library symbol visibility settings ([a070cea](https://github.com/Tencent/Hippy/commit/a070ceac3dbf01dc63f6d39c0d77d03a32ff4ff2))
* **build script:** fix debug-server build script ([bee4513](https://github.com/Tencent/Hippy/commit/bee45135acd59c6a4b462d80b3428e43985c6edd))
* **core:** add static cast for nullptr in tuple ([aa0825e](https://github.com/Tencent/Hippy/commit/aa0825ee35560d702561b1e70ed176332f088367))
* **core:** fix convert crash ([eb1d241](https://github.com/Tencent/Hippy/commit/eb1d241aba8f095a43e5bfc602107f26097f230d))
* **debug-server:** fix webpack-dev-server compile callback ([900772d](https://github.com/Tencent/Hippy/commit/900772df46d90866e8e60fe57186ad09b318e917))
* **debug-server:** webpack dev callback ([70f20a6](https://github.com/Tencent/Hippy/commit/70f20a678390f51d8c86f357bf9214d5cf8a9384))
* **hippy-vue:** websocket $on event could not receive ([6ad478e](https://github.com/Tencent/Hippy/commit/6ad478e360388a749069c223262c15bdfe04cb2f))
* **hippy-vue-demo:** update http module ([47ed8f5](https://github.com/Tencent/Hippy/commit/47ed8f5daced83ec5645a8dbd3dc769b3601e57c))
* **react-demo,vue-demo:** local-debug script ([5ce21ad](https://github.com/Tencent/Hippy/commit/5ce21ad73312af943bfa537a3e95a0b624bd4226))


### Features

* **android:** add two properties for TextNode ([62a4cd9](https://github.com/Tencent/Hippy/commit/62a4cd9e0fd364ff6b4439e17fde07ce2e07efc1))
* **android:** remove unused formatAccessorsAsProperties() ([6be967c](https://github.com/Tencent/Hippy/commit/6be967c3210160583b2f3103d60afef3569019e5))
* **android:** support save and restore dom node ([d6e760b](https://github.com/Tencent/Hippy/commit/d6e760bc5105111311261eb75bb43f2ca67129df))
* **debug-server:** add cli API ([b872c34](https://github.com/Tencent/Hippy/commit/b872c343cd5c4bcb731328c43b9abfeee0e0b5f0))
* **hippy-react:** add bind_event boolean value ([bc32a94](https://github.com/Tencent/Hippy/commit/bc32a948acce814e6f34c8a34f811744a5080ad0))
* **react:** add commitEffects hook to change batch update synchronously ([10da99c](https://github.com/Tencent/Hippy/commit/10da99c6963e6c26b4d1a1b241508e33ee983211))
* **vue, react, debug-server, vue-loader, vue-css-loader:** support HMR ([ff9f763](https://github.com/Tencent/Hippy/commit/ff9f763a4578d41a4ff657a577ced7f3675ba8e3))





## [2.11.6](https://github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/compare/2.11.5...2.11.6) (2021-12-23)


### Bug Fixes

* **ios:** fix gain moduleName error for jsi ([66eeb15](https://github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/commit/66eeb151f137e11a2b26ec4c61d4dd2ce1198bec))





## [2.11.5](https://github.com/Tencent/Hippy/compare/2.11.4...2.11.5) (2021-12-15)


### Bug Fixes

* **android:** add getComponentName to engine context interface ([92809fc](https://github.com/Tencent/Hippy/commit/92809fc4dfb9e87f06455d190f6b1109e865eca8))
* **android:** adjust dispatchExposureEvent call of list view ([c9d6502](https://github.com/Tencent/Hippy/commit/c9d6502176073eb88cf3b463fd7e6c7e0cd396d8))
* **android:** set text cursor of input for android 12 ([6725483](https://github.com/Tencent/Hippy/commit/6725483cd053b2aecdea6bd7e7f996d98e4bf103))
* **ios:** check image url length before use it ([d109fbf](https://github.com/Tencent/Hippy/commit/d109fbfd380c65a0674b2f7d69377b77e2e461f0))
* **ios:** fix chrome elements bug and add websocket close ([#1210](https://github.com/Tencent/Hippy/issues/1210)) ([8366882](https://github.com/Tencent/Hippy/commit/836688204c6aa8cdf6f1aefb5fa5339146032b10))
* **ios:** revert scroll animation fix for ios15 ([c6dc24b](https://github.com/Tencent/Hippy/commit/c6dc24b18ca43eb6c111fdd5400d3ecb98a83369))


### Features

* **hippy-react:** change event capture handle ([fb73c63](https://github.com/Tencent/Hippy/commit/fb73c639824be97625ae45fcb67a9671f1570ad1))
* **hippy-react:** compatible for react18 ([1b300ea](https://github.com/Tencent/Hippy/commit/1b300ea9b35d11c9493709fa2d0cb46d331f0b71))
* **react,vue:** add caret color parser ([68ef4a5](https://github.com/Tencent/Hippy/commit/68ef4a526dd72fda2ce184848d12e37e06c862e3))





## [2.11.4](https://github.com/Tencent/Hippy/compare/2.11.3...2.11.4) (2021-12-10)

**Note:** Version bump only for package hippy





## [2.11.3](https://github.com/Tencent/Hippy/compare/2.11.2...2.11.3) (2021-12-08)


### Bug Fixes

* **hippy-react:** don't update node on event handler changed ([0be2968](https://github.com/Tencent/Hippy/commit/0be2968656b6d103492f23c6ee2176baee97b2dc))





## [2.11.2](https://github.com/Tencent/Hippy/compare/2.11.1...2.11.2) (2021-12-06)


### Bug Fixes

* **android:** release engine context when destroy ([4cf275a](https://github.com/Tencent/Hippy/commit/4cf275adfa5b8c9ef652735bb2f5498d23a7320e))
* **core:** disable rtti and c++ exception ([a2089e4](https://github.com/Tencent/Hippy/commit/a2089e4568c9263aaac50c6a42b587bff98d5c32))
* **core:** fix inspector crash ([6f4e57b](https://github.com/Tencent/Hippy/commit/6f4e57b2e82e8961c95e7b7d13e40ee26581db5e))
* **core:** fix lint warning ([b2b6df3](https://github.com/Tencent/Hippy/commit/b2b6df3797c61b002adedc2126438eb2cd038c23))
* **core:** remove dynamic_pointer_cast and try catch ([c173a13](https://github.com/Tencent/Hippy/commit/c173a13e798fb42e87c357a812f1c62d3bf8e2d9))
* **core:** remove runtime exception ([6aedb26](https://github.com/Tencent/Hippy/commit/6aedb26d76b545fa0cbf4894ff4581c041e04e08))
* **hippy-react:** fixed cached fiberNode event handler problem ([1ed9a77](https://github.com/Tencent/Hippy/commit/1ed9a771284096b9001ee181c805d7e84fa9b424))
* **ios:** check current image url before display ([61dc140](https://github.com/Tencent/Hippy/commit/61dc140dd49fcbaadb9c7d9d458958681f88bd76))
* **ios:** fix nested text layout error ([#929](https://github.com/Tencent/Hippy/issues/929)) ([87c9a14](https://github.com/Tencent/Hippy/commit/87c9a14efe4e8cc2f76bfc7f8cc3e56441645caf))
* **react,vue:** fixed timeRemaining judge ([8dd993f](https://github.com/Tencent/Hippy/commit/8dd993f16d83be509019b2d890ed6a9d3095462e))


### Features

* **android:** add `__unused` attribute for unused parameters ([b5a50e0](https://github.com/Tencent/Hippy/commit/b5a50e0b156570535c52d7e12e00882e807c3aa4))
* **android:** add componentName to EngineContext ([750a738](https://github.com/Tencent/Hippy/commit/750a7383c2020c04654a85ef450a2d2676de5204))
* **android:** add JNI numeric cast function with boundary check ([7d76547](https://github.com/Tencent/Hippy/commit/7d76547bd9046f02ce7d788309f5489ff76d05b6))
* **android:** numeric cast with boundary checker ([e7761b5](https://github.com/Tencent/Hippy/commit/e7761b52b767ecd734f646f4c7966c2dd7270367))
* **hippy-react:** add system event instance ([bc0e6ac](https://github.com/Tencent/Hippy/commit/bc0e6ac52638adeac84fcf181da74c9fd7890729))
* **ios:** add ios chrome dev debug ability ([#1060](https://github.com/Tencent/Hippy/issues/1060)) ([a8a4ec1](https://github.com/Tencent/Hippy/commit/a8a4ec1022363d92d01090dd3be32dbffadfbad4))
* **react:** support event capture phase ([6eba75a](https://github.com/Tencent/Hippy/commit/6eba75acb2599ddf89fb0dcb25f1f554fd7a7408))
* **react,vue:** add js node cache to improve event performance ([b72e42c](https://github.com/Tencent/Hippy/commit/b72e42ca1419891019f937942d45c9a26f9c92e2))
* **react,vue:** perf node traversing process ([8102057](https://github.com/Tencent/Hippy/commit/8102057db4743989fc996ec7455226f08b58c81b))





## [2.11.1](https://github.com/Tencent/Hippy/compare/2.11.0...2.11.1) (2021-11-24)


### Bug Fixes

* **android:** adapter android 11 get status bar height ([c918740](https://github.com/Tencent/Hippy/commit/c918740685e7b698f4abd436cc4fb959f9460edb))
* **android:** fix lint warnings & errors ([49c9c4f](https://github.com/Tencent/Hippy/commit/49c9c4f77c11f14b7b9c42781c85663be2210574))
* **android:** minisdk=14 and release minifyEnabled=false ([69b18d8](https://github.com/Tencent/Hippy/commit/69b18d8c92886b03289a8e2c1e1eb9101214f7cc))
* **android:** remove dispatch layout in onLayout for RecyclerViewBase ([2c3d378](https://github.com/Tencent/Hippy/commit/2c3d3782fde7d93f1cad8cabc12d5841fa36a088))
* **android:** resolve [#1104](https://github.com/Tencent/Hippy/issues/1104) commit crash ([626cb0d](https://github.com/Tencent/Hippy/commit/626cb0de027ab64a33ad19555633d2604eb15f1e))
* **hippy-react-web:** event.path is not supported for safari ([9855ff9](https://github.com/Tencent/Hippy/commit/9855ff92ccda25d22be33d3e1b56eadd4a8b9bdf))
* **ios:** text should not be available for view cache ([10fdadb](https://github.com/Tencent/Hippy/commit/10fdadb9d0dca10d2d942152b9d5a49fea1ad85f))


### Features

* **core:** fix lint warning and fix iOS demo bug ([2bec712](https://github.com/Tencent/Hippy/commit/2bec712b1ef1e7d16e2bc1cf452912a59d36ff88))





# [2.11.0](https://github.com/Tencent/Hippy/compare/2.10.3...2.11.0) (2021-11-18)


### Bug Fixes

* **android:** scroll view onScroll event ([feafe71](https://github.com/Tencent/Hippy/commit/feafe71d3ee6aa062df370d30b3a1aa74f0064e7))
* **core:** fix debug mode uncaught exception bug ([#1058](https://github.com/Tencent/Hippy/issues/1058)) ([44fcb76](https://github.com/Tencent/Hippy/commit/44fcb76ab07a2a5ac526989889b70a346cee9aa9))
* **core:** fix jni crash ([0b8c325](https://github.com/Tencent/Hippy/commit/0b8c3259cee528577cf498cb008eeb53d5909dcb))
* **core:** fix turbo runtime ([4ff32f9](https://github.com/Tencent/Hippy/commit/4ff32f9c3496f2b24eaaddf40f95c86f9a517288))
* **core:** jsi ([f28ccf7](https://github.com/Tencent/Hippy/commit/f28ccf748126db0cb97080180bba4221ec31e368))
* **hippy-react:** fixed getting appear event name for anonymous function ([9c180a7](https://github.com/Tencent/Hippy/commit/9c180a711e92784ef262311993862b2d7fac78af))
* **hippy-vue:** fixed measureInAppWindow issue ([57a2523](https://github.com/Tencent/Hippy/commit/57a252364d161d3c22a2089ba809dd45d625fa08))
* **ios:** fix compile-time error on Xcode 12 and previous versions ([fb47e54](https://github.com/Tencent/Hippy/commit/fb47e548f474c61b1a5a6ea1c07086ffdf552782))


### Features

* **android:** add v8 init param ([04235b3](https://github.com/Tencent/Hippy/commit/04235b32ea9c567bb312b78360d7d00308cecb55))
* **android:** jsi ([792294f](https://github.com/Tencent/Hippy/commit/792294f8967226038076e12908e47ae36b6ee8c7))
* **core:** add v8 init param ([b15d3a6](https://github.com/Tencent/Hippy/commit/b15d3a683efcf7b25ad07dffef11bf08acfe45da))
* **ios:** add ios jsi ([1960454](https://github.com/Tencent/Hippy/commit/19604547f465fca5be14cb95a40d3f5b43f2d5bd))
* **ios:** optimize scale factor and demo ([f49813b](https://github.com/Tencent/Hippy/commit/f49813bfbd95996b7e9238cbd4eaf43e2fa41274))
* **react,vue:** improve managing node performance ([8b35ba6](https://github.com/Tencent/Hippy/commit/8b35ba6bdbe4bfaf2f3ac866ed05ebfed2df3d8e))
* **vue:** add vue jsi ([368874d](https://github.com/Tencent/Hippy/commit/368874dda6d3ef6ba7c65d693b0722132edb6aee))





## [2.10.3](https://github.com/Tencent/Hippy/compare/2.10.2...2.10.3) (2021-11-16)


### Bug Fixes

* **android:** element y position use root view location ([3542a59](https://github.com/Tencent/Hippy/commit/3542a59a6b7b40808e36382d4761b26282b5f6a8))
* **android:** view pager use Number cast obj to int ([f5c982f](https://github.com/Tencent/Hippy/commit/f5c982f0f5ffd924fca559cf58734dbc798f1e35))
* **hippy-react:** fixed insertBefore moveChild condition ([b2d71eb](https://github.com/Tencent/Hippy/commit/b2d71ebee6bec5813da930e4f907d445cc1282ee))
* **hippy-vue:** remove vue other attributes converted to number ([8ce311a](https://github.com/Tencent/Hippy/commit/8ce311a175ea1616168e3621e1c43a3eef9a1b30))
* **ios:** crash fixed,improve stability ([#1042](https://github.com/Tencent/Hippy/issues/1042)) ([383daba](https://github.com/Tencent/Hippy/commit/383daba3a6b947f7bdd0027e8c028c194f0d1a89))
* **ios:** fix layout nan value ([7b394fb](https://github.com/Tencent/Hippy/commit/7b394fba92b663abba1ddbdcc5f6d77ceb6d63cd))
* **ios:** ignore multiline property for password type textinput ([72c0879](https://github.com/Tencent/Hippy/commit/72c08794089fa821ce58c02db11e6b3b4f562c71))
* **ios:** improve stability ([ec2686f](https://github.com/Tencent/Hippy/commit/ec2686f96ad5c9abcae09d03135f87c07b2d715a))


### Features

* **core:** modify console module log level ([809627d](https://github.com/Tencent/Hippy/commit/809627dbdc3828026328342bdd8046886d9360c4))





## [2.10.2](https://github.com/Tencent/Hippy/compare/2.10.1...2.10.2) (2021-11-02)


### Bug Fixes

* **android:** fix exception caused by multiple instances ([6db49c9](https://github.com/Tencent/Hippy/commit/6db49c976f667ad96d841c5f17b8bfcb24f88598))
* **vue-demo:** fix waterfall Platform judgement ([9409cb2](https://github.com/Tencent/Hippy/commit/9409cb2b91f1b7c9caa122547a1129255c00960d))





## [2.10.1](https://github.com/Tencent/Hippy/compare/2.10.0...2.10.1) (2021-10-27)


### Bug Fixes

* **android:** do not onRestoreInstanceState for sub views ([87bb19c](https://github.com/Tencent/Hippy/commit/87bb19c844278de5321b3341cc8ffeb39596ff4f))
* **android:** do not use JAVA 8 lambda temporary ([d5fdf41](https://github.com/Tencent/Hippy/commit/d5fdf413290eac1d115073c841f288c0ca0645dd))
* **android:** fix `hippy` library build script exception ([1534ba3](https://github.com/Tencent/Hippy/commit/1534ba3ac2ae22be126f777515a1a90e36b5c10c))
* **android:** scroll view page scroll problem ([2b22b5f](https://github.com/Tencent/Hippy/commit/2b22b5fcd5ec7e8afcf8e32d5026cf9ef4c0dc94))
* **hippy-react:** change dev condition judge ([268a6e9](https://github.com/Tencent/Hippy/commit/268a6e90eb8c926f17776a26e7f554221134f9cd))
* **hippy-vue-demo:** fix scroll height bug ([42c30ce](https://github.com/Tencent/Hippy/commit/42c30ceddf6a0a3fd70a2d6b1208f080773fc002))
* **ios:** a placeholder of text attachment for all system version ([519d40e](https://github.com/Tencent/Hippy/commit/519d40edb364ef1acbc6f5194d56b31dbf0a3f20))
* **ios:** place an empty image for placeholder ([f1e1856](https://github.com/Tencent/Hippy/commit/f1e18562d31218f258dca69512166ebe73a17e5f))


### Features

* **android:** support add native module after init engine ([d1924d6](https://github.com/Tencent/Hippy/commit/d1924d676b0fdc5e48c23772dbf0110ba3f9fd93))
* **android:** update `x5-lite` definitions ([86f9509](https://github.com/Tencent/Hippy/commit/86f9509506a1f73278848c61ba75c7f5ffdfd5a0))
* **hippy-react:** add global bubbles config ([56edf20](https://github.com/Tencent/Hippy/commit/56edf204214b56cbf1098097c34cc84d20dff069))
* **hippy-vue:** add getElemCss function ([32101dc](https://github.com/Tencent/Hippy/commit/32101dcad1bce6bde43f4253d4e0f785ce114d35))





# [2.10.0](https://github.com/Tencent/Hippy/compare/2.9.2...2.10.0) (2021-10-12)


### Features

* **core:** seperate console & ConsoleModule ([dd9d80a](https://github.com/Tencent/Hippy/commit/dd9d80a4e5bdf9048bf61f31866c59266e1aeaf6))
* **hippy-react:** update react 17 ([df6bccb](https://github.com/Tencent/Hippy/commit/df6bccba5d6e74fcb88e343e77ff6425e46442f4))
* **hippy-vue,hippy-react:** add text shadow ([a891690](https://github.com/Tencent/Hippy/commit/a8916904cca88f09bdee55511dce670bf09571fa))





## [2.9.2](https://github.com/Tencent/Hippy/compare/2.9.1...2.9.2) (2021-10-12)


### Bug Fixes

* **hippy-debug-server:** change child_process to cross-spawn ([870ab07](https://github.com/Tencent/Hippy/commit/870ab07d3592eb1865e40cfca617b6b338a4f711))
* **hippy-vue:** update ava package to safe ver ([e9752b4](https://github.com/Tencent/Hippy/commit/e9752b494c66a49938575fd32e9f9234ef643d1f))
* **ios:** also check root tag for touch handler ([58feddf](https://github.com/Tencent/Hippy/commit/58feddf981f3bdd4ae944bc9d323941d247b294b))
* **ios:** fix a potential crash due to null pointer ([#985](https://github.com/Tencent/Hippy/issues/985)) ([77545f2](https://github.com/Tencent/Hippy/commit/77545f21a64d5e624f77104ad3aca4bc88320ba7))
* **ios:** fix potential multi-thread crash ([e2faa1d](https://github.com/Tencent/Hippy/commit/e2faa1dae532f5154b5aa5f4bddc1aa2bbda3484))
* **ios:** fix scroll animation in ios15 ([c31f25e](https://github.com/Tencent/Hippy/commit/c31f25e2d86b56514296a992af39435897db9e09))
* **ios:** improve stability for vfs module ([888d408](https://github.com/Tencent/Hippy/commit/888d408860811317ac0764fd357b6aa3f017f1d7))
* **ios:** improve stability for websocket module ([d5595ea](https://github.com/Tencent/Hippy/commit/d5595ea2f9a9b7a404bbcce27addce7937f93e34))
* **ios:** reset tableview top padding to zero in ios15 ([#1000](https://github.com/Tencent/Hippy/issues/1000)) ([a5184cf](https://github.com/Tencent/Hippy/commit/a5184cfe5d4777ede135cdff52da23ab5b59f89a))
* **vue-example:** fix loop animation height ([dc3d948](https://github.com/Tencent/Hippy/commit/dc3d948b836bcab5a9f7c35ee0be840f4a050b3c))





## [2.9.1](https://github.com/Tencent/Hippy/compare/2.9.0...2.9.1) (2021-09-24)


### Bug Fixes

* **android:**  remove add 0.5 from px2dp ([8f7b2fb](https://github.com/Tencent/Hippy/commit/8f7b2fb8481f64e3ada8fd3743a4b936becdb0d9))
* **android:** enlarge DEFAULT_MAX_SCRAP to 10 ([7023c70](https://github.com/Tencent/Hippy/commit/7023c7026f4381687850bd307daf58ada110aea9))
* **android:** fix v8 build script for `latest` TAG ([#975](https://github.com/Tencent/Hippy/issues/975)) ([d79012f](https://github.com/Tencent/Hippy/commit/d79012fbf775a52b9a2b1802fd96785611a8d082))
* **android:** getRenderNodeHeight headerEventHelper null crash ([dff7bb3](https://github.com/Tencent/Hippy/commit/dff7bb303edd8888781eb55b073e9a392fbcbb9a))
* **android:** linearGradient needs >= 2 number of colors ([eab80a6](https://github.com/Tencent/Hippy/commit/eab80a651c2e88ba4d20698465c84dce28a663f6))
* **android:** use Number do type conversion ([4cbdd47](https://github.com/Tencent/Hippy/commit/4cbdd477b1b8c3c619a7946a2953782d898ca9ab))
* **css-loader:** collapsable transfer to boolean ([b5b2e12](https://github.com/Tencent/Hippy/commit/b5b2e12c8e52b62aac4bc2be0eaa443cc2f50a63))
* **ios:** fix a bug that a wrong zposition for section view ([#983](https://github.com/Tencent/Hippy/issues/983)) ([96eb238](https://github.com/Tencent/Hippy/commit/96eb238175b9aa19877c4c85b4ab2f2a70a7eeee))


### Features

* **android:** add DevMemu module for reload ([c936581](https://github.com/Tencent/Hippy/commit/c936581411e879fa0f718c2b13e679ca543826b1))
* **android:** callNative remove init flag limit ([30215b0](https://github.com/Tencent/Hippy/commit/30215b08f7b0c099f89daf731c46bb98002fc08d))
* **hippy-react:** add unhideInstance api in hostconfig ([39da68a](https://github.com/Tencent/Hippy/commit/39da68a1212fc1a979886d84599a42c1fb6849f3))
* **hippy-react:** compatible for react 17 ([a3c21d6](https://github.com/Tencent/Hippy/commit/a3c21d6f79b40475aa8bae7840ffa10a2bd9aa3a))


### Reverts

* Revert "refactor(android): set default false to view group clip children" ([9873d21](https://github.com/Tencent/Hippy/commit/9873d214a04905d01c2dff0e3229d9b3002a1600))





# [2.9.0](https://github.com/Tencent/Hippy/compare/2.8.4...2.9.0) (2021-09-10)


### Bug Fixes

* **android:** add HippyDrawable get gif width and height ([d4c10ff](https://github.com/Tencent/Hippy/commit/d4c10ffaf06bda0151623b7629600db5ee41255a))
* **android:** add useAndroidX to sdk gradle properties ([4c88717](https://github.com/Tencent/Hippy/commit/4c88717ac813a6dfcf1a19ead093493b29498c13))
* **android:** correct recycler list pull header height ([f07e485](https://github.com/Tencent/Hippy/commit/f07e4851add0b0beba89bcae1fc2d44764a75dde))
* **android:** element refresh bug ([955b01b](https://github.com/Tencent/Hippy/commit/955b01b60669e3a6b36f97e48d6b70da21f6d2f7))
* **hippy-react:** add callUIFunction default options ([24c3d9c](https://github.com/Tencent/Hippy/commit/24c3d9c7732c558251d99eb77725b03a3c951373))
* **ios:** fix an animation group error ([67104f0](https://github.com/Tencent/Hippy/commit/67104f0db5121d956de41b243476176918260df1))
* **ios:** fix combined animation error ([#941](https://github.com/Tencent/Hippy/issues/941)) ([a090d32](https://github.com/Tencent/Hippy/commit/a090d3272bc608e487aef86dd99bdd243dbca5f5))
* **ios:** fix degree rotation bug ([76fab1d](https://github.com/Tencent/Hippy/commit/76fab1db3c8e522ab55fae3d39393db6c09fa263))
* **ios:** properties define in uiview's designated initializer ([63d0841](https://github.com/Tencent/Hippy/commit/63d08414aa9511ac453ee8c818d12e622b1267ff))
* **ios:** set right zPosition for listview cell ([#928](https://github.com/Tencent/Hippy/issues/928)) ([c9a0b0e](https://github.com/Tencent/Hippy/commit/c9a0b0e3b073acc7b748c192750f704a8a015b9f))
* **ios:** update visibility available now ([988106c](https://github.com/Tencent/Hippy/commit/988106c9f128a645bc74079e4b9d1147eeebd7a2))


### Features

* **android:** import junit + powermock + robolectric ([18dcaff](https://github.com/Tencent/Hippy/commit/18dcaff2b5b709ec605ab77541aec4e50f6086da))
* **animation:** animation cubic-bezier timingFunction ([#785](https://github.com/Tencent/Hippy/issues/785)) ([044e8b2](https://github.com/Tencent/Hippy/commit/044e8b2dec9d86a0c5e391d99794953b73c11bcf))
* **debug-server:** change chrome dev protocal for Elements tab ([da50de2](https://github.com/Tencent/Hippy/commit/da50de25ff00705604373c0e482879405dc283ee))
* **ios:** add visibility property for view ([4652fe9](https://github.com/Tencent/Hippy/commit/4652fe98363521dbba770082869da1bd29150b47))
* **ios:** enable swipe to delete in UITableView ([#935](https://github.com/Tencent/Hippy/issues/935)) ([ebcf138](https://github.com/Tencent/Hippy/commit/ebcf138c7167e4b4a42244ec00a2c28390af695b))
* **react,vue,android:** add live reload ([22582f4](https://github.com/Tencent/Hippy/commit/22582f4179d484ae4b7ff088511d42656307e1de))
* **react,vue,ios,android:** add waterfall component for hippy ([#933](https://github.com/Tencent/Hippy/issues/933)) ([909cf79](https://github.com/Tencent/Hippy/commit/909cf793af5fb70f54f001a2ddb1c43702ca2352)), closes [#1](https://github.com/Tencent/Hippy/issues/1)


### Reverts

* Revert "fix(ios): fix combined animation error (#941)" ([6c4fe03](https://github.com/Tencent/Hippy/commit/6c4fe03f6510442385011ad86f6f60ceecb01ca0)), closes [#941](https://github.com/Tencent/Hippy/issues/941)





## [2.8.4](https://github.com/Tencent/Hippy/compare/2.8.3...2.8.4) (2021-08-13)


### Bug Fixes

* **android:** fixed gradle config ([9837afa](https://github.com/Tencent/Hippy/commit/9837afa2dc172a9ba63bac46fbf6bb19b5c5a8f4))


### Features

* **hippy-react:** add nativeNode attributes info for debugging ([#923](https://github.com/Tencent/Hippy/issues/923)) ([6af97f7](https://github.com/Tencent/Hippy/commit/6af97f72872024b17e65f2c81aff66788bbd7e93))





## [2.8.3](https://github.com/Tencent/Hippy/compare/2.8.2...2.8.3) (2021-08-12)


### Bug Fixes

* **android:** remove hasNavigationBar from DimensionsUtil ([dd05d26](https://github.com/Tencent/Hippy/commit/dd05d26b2b6bd1e77107a2e3d2e6649b9a70265a))
* **android:** shuold call invalidate after reset props ([c85fc75](https://github.com/Tencent/Hippy/commit/c85fc7511a56b972921a7f5866e27105ea8dab3c))
* **ios:** fix gradient backgroundcolor update error ([60ceae3](https://github.com/Tencent/Hippy/commit/60ceae3d879281dd03bb7cdeaf7ee3a0c3385622))
* **react:** fixed linearGradient update not work ([96f7451](https://github.com/Tencent/Hippy/commit/96f74515a8cbb5b6f43682d6e15e9744bca1455a))


### Features

* **android:** add image type to HippyDrawable ([4e7d4ba](https://github.com/Tencent/Hippy/commit/4e7d4bae67c76a2d0b4b238b7f9dadacdae0cf9e))
* **android:** fix cookie sync, no need to call removeSessionCookie ([6f7f766](https://github.com/Tencent/Hippy/commit/6f7f76607d43ddf709e130ade05833622576d602))
* **android:** support ui element module for devtools ([1567572](https://github.com/Tencent/Hippy/commit/156757252261e7c1c78277ffe66199f6b817d185))





## [2.8.2](https://github.com/Tencent/Hippy/compare/2.8.1...2.8.2) (2021-08-09)


### Bug Fixes

* **android:** rtl text direction for ARABIC ([6ce4014](https://github.com/Tencent/Hippy/commit/6ce4014281dfbd62719a891090c1568a515fd7d9))
* **android:** should draw image border ([c71d7dc](https://github.com/Tencent/Hippy/commit/c71d7dceea3cae00ee74fe08d546b6de1fdd7e37))





## [2.8.1](https://github.com/Tencent/Hippy/compare/2.8.0...2.8.1) (2021-08-09)


### Bug Fixes

* **core:** fix uri crash ([a2a9e86](https://github.com/Tencent/Hippy/commit/a2a9e8606fb3d1073759c999f3e4bd3675d75798))
* **ios:** fix bug when hippyview uses local image ([4849c26](https://github.com/Tencent/Hippy/commit/4849c264581f5566b04823d77f4ad2df38344739))
* **react,vue:** fix rgb format for linear-gradient parser ([1ae803c](https://github.com/Tencent/Hippy/commit/1ae803c9aa7eb77601d7f995b73c451e0a6971bc))


### Features

* **android:** support hpfile use in backgroundImage ([c4808c8](https://github.com/Tencent/Hippy/commit/c4808c8109b73a6d062e6c34e6634f8412c9b7e3))
* **react:** add local img ([3d901a8](https://github.com/Tencent/Hippy/commit/3d901a8f7478a04bc7af16106e7e3bf5cb2a2752))





# [2.8.0](https://github.com/Tencent/Hippy/compare/2.7.6...2.8.0) (2021-08-04)


### Bug Fixes

* **android:** fix `v8` crash caused by multiple initialize ([59f36af](https://github.com/Tencent/Hippy/commit/59f36afd333402e9482362f58448348bb7b17029))
* **android:** rotate animation deg value type ([347e296](https://github.com/Tencent/Hippy/commit/347e296ca859e8391202b8c0ada5933fb5256696))
* **android:** warnings for minSdkVersion 19 ([676de9c](https://github.com/Tencent/Hippy/commit/676de9cdf9cbf280d9d46b96b4c047a614cd031d))
* **android:** writeJSArray should use length to iterates array ([2031ab1](https://github.com/Tencent/Hippy/commit/2031ab105baff7eb62032a9f98ad412641d3abea))
* **commit:** fix husky commit issue ([397e717](https://github.com/Tencent/Hippy/commit/397e717d73fcf96b5a8602e208e855fe4ff4af58))
* **core:** fix v8 local string crash ([26dec91](https://github.com/Tencent/Hippy/commit/26dec916e25a2923149b23156b96549fabd78707))
* **core:** fix v8::maybelocal crash, remove TO_LOCAL_UNCHECKED macro ([4eb7ddd](https://github.com/Tencent/Hippy/commit/4eb7ddd3ec1de8b15150b11fd1c2610ab7e61d16))
* **core:** uniform type ([568979d](https://github.com/Tencent/Hippy/commit/568979d0645e7e8b60609c278729539052e6c75b))
* **docker:** fix docker image build script error ([77cee97](https://github.com/Tencent/Hippy/commit/77cee978c1d4c7f158893286993f22f57b48ed9b))
* **hippy-react-web:** correct lineHeight style values ([#901](https://github.com/Tencent/Hippy/issues/901)) ([1ba1192](https://github.com/Tencent/Hippy/commit/1ba11929f015033d29dc9aafcfe77883296cd07d))
* **hippy-vue:** fixed vue-css-loader path option for building demo ([22c495b](https://github.com/Tencent/Hippy/commit/22c495b1283678ed7a0080f67ee015c38eb4c17d))
* **ios:** animation must be removed from view even it is not finished ([3462cee](https://github.com/Tencent/Hippy/commit/3462cee62daa835aca272619ce5ca782d5de50a0))
* **ios:** fix contentoffset property error ([#834](https://github.com/Tencent/Hippy/issues/834)) ([189822a](https://github.com/Tencent/Hippy/commit/189822ab4a0bcc16a076cae24d2b275250d14590))
* **ios:** fix hippytext reuse bug ([65fbf36](https://github.com/Tencent/Hippy/commit/65fbf369adcc74daa00a776fb107125e132b7dc9))
* **ios:** fix rtl language support ([b428854](https://github.com/Tencent/Hippy/commit/b428854ac7a270181f7b2acf98a431c2bc00e729))
* **ios:** fix scrollview padding error ([863ce96](https://github.com/Tencent/Hippy/commit/863ce960db3ab697237a1c35d87ce04ca06b1789))
* **react:** fixed custom style for scrollview not work ([6e19169](https://github.com/Tencent/Hippy/commit/6e1916939be607bcf87dc8dd491a3f59a242c884))
* **react:** fixed focusable component child displayName ([ce69b77](https://github.com/Tencent/Hippy/commit/ce69b7789fd88c2a92e70d7eaa9875880f53407f))


### Features

* **android:** add ability to disable the inspector ([a9d58eb](https://github.com/Tencent/Hippy/commit/a9d58eb39316fed8bff187e63dfff461080b0459))
* **android:** add interceptHorizontalTouch prop for listView ([556e7d9](https://github.com/Tencent/Hippy/commit/556e7d9335eca2c5c150db207749af6660b4aa98))
* **android:** remove unused `gradle-wrapper.jar` ([9a6056f](https://github.com/Tencent/Hippy/commit/9a6056fa005f786f07dcc2d6be703b1c50e31ea0))
* **android:** support gradient paint in BackgroundDrawable ([f77d76e](https://github.com/Tencent/Hippy/commit/f77d76e03a6f442530b4dc413f52f1ad078535db))
* **android:** support horizontal scrollToContentOffset event ([814efbd](https://github.com/Tencent/Hippy/commit/814efbd895f0b0033f170c724555f9e6021cfc9e))
* **android:** support initialContentOffset props for listView ([348754d](https://github.com/Tencent/Hippy/commit/348754d82166359ee04ce1b4f462a934d390c30a))
* **android:** support initialContentOffset props for ScrollView ([60111c7](https://github.com/Tencent/Hippy/commit/60111c79581c0028f24a8c0cff2a1a83d2461935))
* **android:** support listView HORIZONTAL on scroll event ([7d0efe3](https://github.com/Tencent/Hippy/commit/7d0efe31b75023def1810a9f137f023ec8f0e26d))
* **android:** update v8 build script ([32b32c6](https://github.com/Tencent/Hippy/commit/32b32c6efbc27e26d467a61ddbd33374aa9cc317))
* **android:** use implicit loading for java useless library ([e79370e](https://github.com/Tencent/Hippy/commit/e79370e75ca89344ed4ae0c8a995bf41b655fdb7))
* **android,react,vue:** support RTL layout ([#893](https://github.com/Tencent/Hippy/issues/893)) ([149ec04](https://github.com/Tencent/Hippy/commit/149ec0458e82676d16c0728a6feba486bfb2aace))
* **core:** adapt to official release version v8 ([683dff1](https://github.com/Tencent/Hippy/commit/683dff1050a0b2f11eb02b36521888de84656a24))
* **core:** refactor ctx value ([1547226](https://github.com/Tencent/Hippy/commit/1547226fbc10ef2d57319fd0f6375f3424c35b24))
* **hippy-react,hippy-vue:** add linear-gradient ([02b5b82](https://github.com/Tencent/Hippy/commit/02b5b8256995a5fa6a70fcfd0f67ed1c383569ae))
* **ios:** add linear gradient for view component ([#828](https://github.com/Tencent/Hippy/issues/828)) ([fe8659a](https://github.com/Tencent/Hippy/commit/fe8659ab39a465d124fd1052149895aef2709242))
* **ios:** add localization infomations in deviceinfo object ([24a4aaa](https://github.com/Tencent/Hippy/commit/24a4aaa97920d2a721af3fed34e8a6523dc0d679))
* **ios:** add performance log enumation options ([155c62d](https://github.com/Tencent/Hippy/commit/155c62d3cc4eb6066a90e0b85e45f2852c6496b8))
* **ios:** add try catch block for js execution ([28e5d68](https://github.com/Tencent/Hippy/commit/28e5d68d71ceedb048a53e405ba5842f3b53c559))
* **ios:** defaultimage & backgroundimage now support local file path ([#811](https://github.com/Tencent/Hippy/issues/811)) ([227b584](https://github.com/Tencent/Hippy/commit/227b5844687f98c1df5417f9e2ff550e88752612))
* **ios:** layout updated, RTL supported ([#873](https://github.com/Tencent/Hippy/issues/873)) ([7e13eee](https://github.com/Tencent/Hippy/commit/7e13eee21b452a4ca8e74953b5c0d41ad6aa38cf))
* **layout:** update layout build script ([428bf42](https://github.com/Tencent/Hippy/commit/428bf42cd23891b5e028b863834ad27a820a6bf3))





## [2.7.6](https://github.com/Tencent/Hippy/compare/2.7.5...2.7.6) (2021-07-22)


### Bug Fixes

* **hippy-vue:** add onScrollBeginDrag & onScrollEndDrag param ([bc27f40](https://github.com/Tencent/Hippy/commit/bc27f40eede5ab20ab2b43380ca288777c5397c4))


### Features

* **hippy-vue:** add nativeNode attributes info for debugging ([#869](https://github.com/Tencent/Hippy/issues/869)) ([28a9a58](https://github.com/Tencent/Hippy/commit/28a9a58899106539cbbce48a195f8b3b230d54a3))





## [2.7.5](https://github.com/Tencent/Hippy/compare/2.7.4...2.7.5) (2021-07-16)


### Bug Fixes

* **ios:** fix hippybaselistview crash when hippyfooterfresh exists ([6132266](https://github.com/Tencent/Hippy/commit/6132266eadeddb62bc297e14dc89d98e354415a2))





## [2.7.4](https://github.com/Tencent/Hippy/compare/2.7.3...2.7.4) (2021-07-08)

**Note:** Version bump only for package hippy





## [2.7.3](https://github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/compare/2.7.2...2.7.3) (2021-07-08)


### Bug Fixes

* **core:** rm jscore promise ([efdf9af](https://github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/commit/efdf9af93ca269285c96de650873bbc5f4313cfc))





## [2.7.2](https://github.com/Tencent/Hippy/compare/2.7.1...2.7.2) (2021-06-18)


### Bug Fixes

* **android:** support horizontal scrollView offset x reuse ([5fc57eb](https://github.com/Tencent/Hippy/commit/5fc57eb0309d1e086a66e0b727249e506db6b1da))
* **core:** fix code cache crash ([#817](https://github.com/Tencent/Hippy/issues/817)) ([8f71301](https://github.com/Tencent/Hippy/commit/8f713013a00617d6738223cae12cb8b5a4e6e678))
* **core:** fix create ctx value crash ([#820](https://github.com/Tencent/Hippy/issues/820)) ([45a9440](https://github.com/Tencent/Hippy/commit/45a944094e7e32c7d5ed3ac25f1903f213df9996))
* **core:** fix jni crash ([#803](https://github.com/Tencent/Hippy/issues/803)) ([d1921c0](https://github.com/Tencent/Hippy/commit/d1921c02cdbe4ff86b12690c5414601b0339c9f9))
* **ios:** image processed by operation should set needblur yes ([5057bfb](https://github.com/Tencent/Hippy/commit/5057bfb418a55684deaebe599bdac2abe04e2e67))
* **ios:** save scroll's contentoffset for reusing in cell ([197c6d2](https://github.com/Tencent/Hippy/commit/197c6d20874f488fd897382b60a482248c2767e3))


### Features

* **hippy-debug-server:** update websocket version ([ab0fdfe](https://github.com/Tencent/Hippy/commit/ab0fdfee364faf669cd1a6a86d08ca5dd64ce824))
* **hippy-react-web:** update swiper ([2c93933](https://github.com/Tencent/Hippy/commit/2c939332d95f737cb57a49187324e66d57b89b48))
* **ios:** custom properies can be set before seconary bundle loaded ([8c966bb](https://github.com/Tencent/Hippy/commit/8c966bb084ed1671a00179dbf573e8255c970b95))
* **ios:** users can get cell type from hippynetinfo module ([cc907f5](https://github.com/Tencent/Hippy/commit/cc907f50c54b1541707666f763573799036d9f6c))





## [2.7.1](https://github.com/Tencent/Hippy/compare/2.7.0...2.7.1) (2021-06-10)


### Bug Fixes

* **hippy-vue:** update package to safe version ([0cb5d94](https://github.com/Tencent/Hippy/commit/0cb5d944788eac1b576a36366fcdbada991dd80d))
* **ios:** hippysubviews should be removed when reuse ([6ee4573](https://github.com/Tencent/Hippy/commit/6ee45739dedbab058b9161bb1bc5ed67161f2b4f))


### Features

* **core:** throw jni exception to java ([3158369](https://github.com/Tencent/Hippy/commit/3158369600cccb43ae60c035ef38f0534ea6de75))





# [2.7.0](https://github.com/Tencent/Hippy/compare/2.6.4...2.7.0) (2021-06-07)


### Bug Fixes

* **android:** `Serializer` call `reset` first to reset the writer ([e915135](https://github.com/Tencent/Hippy/commit/e9151359c840e595a001007a80ae2bf85515cf4c))
* **android:** fix `java.lang.Long` cast to `java.lang.Double` exception ([33abebf](https://github.com/Tencent/Hippy/commit/33abebfc20a3a7ff523934b5eaf9a4c9c78623fe))
* **android:** fix setRenderToHardwareTexture ([815409e](https://github.com/Tencent/Hippy/commit/815409ee9f21afaa48755d1b67c10f8d37aa0e00))
* **android:** recyclerview pullheader without collapsePullHeader ([eb791f7](https://github.com/Tencent/Hippy/commit/eb791f7cfe31392f8cf2f33fc9aed27bd6ea8ac6))
* **core:** fix code cache bug ([5247700](https://github.com/Tencent/Hippy/commit/52477008c7a940ac837133a0e566cdcffe5c1d7a))
* **core:** fix codecc warning ([d91e4b0](https://github.com/Tencent/Hippy/commit/d91e4b0f00c1d6c59542001125ecfb5402ff0db9))
* **core:** fix unicode_string_view null pointer bug ([#787](https://github.com/Tencent/Hippy/issues/787)) ([0734460](https://github.com/Tencent/Hippy/commit/073446043008305845e5ebea8d47c8705cf51b2c))
* **core:** fixed nativeFlushQueueImmediate callID issue ([ea77912](https://github.com/Tencent/Hippy/commit/ea779126d19f31b70d5ff7371f301432df226671))
* **hippy-react:** fix react demo listview style ([15d0961](https://github.com/Tencent/Hippy/commit/15d0961b2e73f775987c98e3236f88d369bfc440))
* **hippy-vue,hippy-react:** add task polyfill for batch render ([7cdf026](https://github.com/Tencent/Hippy/commit/7cdf026e345a187202a0f7ae91171c2804cb4562))
* **ios:** check if null pointer before setting __hippycurdir__ ([d8f6748](https://github.com/Tencent/Hippy/commit/d8f6748e62f17fb564d8eeed58f95b865d5c70b6))


### Features

* **android:** add `@NonNull` annotation to serialization package method ([ae2c588](https://github.com/Tencent/Hippy/commit/ae2c588c4c934e61ebe24182e7be8f3de70a0c8f))
* **android:** add HippyRecyclerView extends from androidx recyclerview ([3071092](https://github.com/Tencent/Hippy/commit/3071092e0dbd5c24e655665200d69460c2c86d90))
* **android:** add onTopReached event for RecyclerView ([06e07db](https://github.com/Tencent/Hippy/commit/06e07db88a0813a6e284b51884a24b7100a9e042))
* **android:** interface `BinaryWriter` add `reset` method ([08823cb](https://github.com/Tencent/Hippy/commit/08823cb3b4571647d87736f69d929ff7be887cc0))
* **android:** support renderToHardwareTextureAndroid ([809f55e](https://github.com/Tencent/Hippy/commit/809f55e4cf7536ce0d772876ff89116f8c376c8b))
* **core:** add unicode_string_view and js_value_wrapper ([#782](https://github.com/Tencent/Hippy/issues/782)) ([34a1f4e](https://github.com/Tencent/Hippy/commit/34a1f4e020768a4b87dee55a50f17398cd9f662b))
* **hippy-react,hippy-vue:** perf shadow demo ([0f37fd2](https://github.com/Tencent/Hippy/commit/0f37fd2a67778f6b28707eb5f50e530f5e788f8b))
* **hippy-vue:** add some native modules ([e960c01](https://github.com/Tencent/Hippy/commit/e960c01d98aa09db5ea443b14c16e427d7023fcd))





## [2.6.4](https://github.com/Tencent/Hippy/compare/2.6.3...2.6.4) (2021-05-19)


### Bug Fixes

* **ios:** fix viewpager onpagescroll and onpageselected event ([#761](https://github.com/Tencent/Hippy/issues/761)) ([1a50294](https://github.com/Tencent/Hippy/commit/1a502942767d5c4860479f5e090f17030d64e462))
* **ios:** fix websocket params error and remove assert ([56794a0](https://github.com/Tencent/Hippy/commit/56794a08bfb659b187865064a5a79b1ac101eea1))


### Features

* **android:** keep some classes for wormhole ([d6eb008](https://github.com/Tencent/Hippy/commit/d6eb008a24c7c69a7a802b63bd8ef3a55d28ad12))
* **hippy-core:** add original console api ([c3da871](https://github.com/Tencent/Hippy/commit/c3da87108f9034b31130c48a72520dae45eba6c9))





## [2.6.3](https://github.com/Tencent/Hippy/compare/2.6.2...2.6.3) (2021-05-17)


### Bug Fixes

* **android:** correct view pager onPageScroll event params ([5c00cc2](https://github.com/Tencent/Hippy/commit/5c00cc25f8c8b319d67371f844e15657c65fead6))
* **android:** reset another enable buffer setting in HippyEngineManager ([8b5f4a9](https://github.com/Tencent/Hippy/commit/8b5f4a99bf994672c41b12c18bb3b3a782fc4292))
* **android:** send exposure event when listview first show ([d8c9ab7](https://github.com/Tencent/Hippy/commit/d8c9ab7ad72a241322a45e71d56a080fc672d6b3))
* **android:** support null key in v8 serialization ([df49900](https://github.com/Tencent/Hippy/commit/df49900bd742d29bcbe661598a255dcce54b1026))
* **core:** fix log bug ([8e60e23](https://github.com/Tencent/Hippy/commit/8e60e23ba0443a959cfca6f2a92a5a1972ff08df))
* **core:** merge master ([dcd7123](https://github.com/Tencent/Hippy/commit/dcd71239f14b8459dad2f2f97d3972832789b802))
* **core:** setTimeout and setInterval of TimerModule support ...args ([#733](https://github.com/Tencent/Hippy/issues/733)) ([655aa15](https://github.com/Tencent/Hippy/commit/655aa152bf9872a3fcf6ef53492ae71e6b1afdd3))
* **core:** update 77 v8 ([24fc1b0](https://github.com/Tencent/Hippy/commit/24fc1b0322974df51a2c556dce5c6181841351c3))
* **hippy-react-demo:** perf tabhost demo ([ea33076](https://github.com/Tencent/Hippy/commit/ea330765b61b7b7a7b70e225d3affd8a779a6ce6))
* **ios:** add header search path config ([2f8d419](https://github.com/Tencent/Hippy/commit/2f8d419d6135261ebefb0bcd573dd5694b188a0b))
* **ios:** fix animation timing function type error ([1a98153](https://github.com/Tencent/Hippy/commit/1a98153639cbafff3a844a267257c56cde3a2f16))
* **ios:** fix synax error ([47612e9](https://github.com/Tencent/Hippy/commit/47612e9f3856ffd708f541fa1086bd93448fad44))
* **ios:** fix viewpageritem frame set error ([9b8d51b](https://github.com/Tencent/Hippy/commit/9b8d51b69f08d13d43326b7547071dfb0319494f))
* **ios:** list node should set dirty when loads lazily ([3ad5c10](https://github.com/Tencent/Hippy/commit/3ad5c1070442345a2ba70d8c9f384ef8e8311dcc))
* **ios:** make sure calayer.setneedsdisplay will trigger displaylayer ([16a5802](https://github.com/Tencent/Hippy/commit/16a580245acfc6fca36cab5bf03ef49b3fe98ccd))


### Features

* **android:** image span support onLoad event ([389acfc](https://github.com/Tencent/Hippy/commit/389acfc6650e9b62f4ded1b839516f18e2cc885b))
* **android:** support set custom C log handler ([b06479d](https://github.com/Tencent/Hippy/commit/b06479d31f2c4601d10c0c4a454b5e7faa7669aa))
* **android:** support v8 serialization ([6cca7ca](https://github.com/Tencent/Hippy/commit/6cca7ca5123f6ca3b17e9c0bd7092814aad569e1))
* **core:** adapter new Serializer ([da12e1c](https://github.com/Tencent/Hippy/commit/da12e1c0775a3bc05a106e24e638d737e9db2af9))
* **core:** add jni static method register macro ([aaff868](https://github.com/Tencent/Hippy/commit/aaff868046a6e93cdadbb646ccae3c2c5b31dbb7))
* **core:** refactor logger ([d3a6f0d](https://github.com/Tencent/Hippy/commit/d3a6f0df0fe353b0fad87e73e6aa5f6bde422652))
* **hippy-vue:** add local path support for placeholder & bgImg ([f0c56e6](https://github.com/Tencent/Hippy/commit/f0c56e61e22bb14ec6b0f100c03b93ec8491fae5))
* **ios:** add hippy log handler ([044e0a2](https://github.com/Tencent/Hippy/commit/044e0a21c16790a79ae162d74b3f802aceda3b68))
* **ios:** add log handler ([9afc682](https://github.com/Tencent/Hippy/commit/9afc682a5b0c698c4c1bda8d05ffff825bb8dc11))
* **ios:** delete video compnent ([2ba451c](https://github.com/Tencent/Hippy/commit/2ba451cb4c31aeca9a321dcbfd5f093d6c99197c))





## [2.6.2](https://github.com/Tencent/Hippy/compare/2.6.1...2.6.2) (2021-04-26)


### Bug Fixes

* **android:**  some image view default source display issues ([0dd696e](https://github.com/Tencent/Hippy/commit/0dd696e01234305a00f263ad83ccb4c3a7473ce1))
* **core:** fix jni dynamic register crash ([0d639b1](https://github.com/Tencent/Hippy/commit/0d639b18c4a8ca09bd4f26c47de5f30fff44a7bc))
* **hippy-vue:** fix registerElement elem name and comp name problem ([abec3bd](https://github.com/Tencent/Hippy/commit/abec3bdef337bf2b238fd7fef4159194a313abba))
* **ios:** fix a bug about touch handler ([d96dcf3](https://github.com/Tencent/Hippy/commit/d96dcf3fb803e4cb817420ecbae3e4bcf585899a))
* **ios:** fix resize mode center error ([0483a3f](https://github.com/Tencent/Hippy/commit/0483a3f1036a657f5f0ebda25a8a37c3d7c90a11))
* **ios:** fix wrap-reverse layout ([e5c2ab9](https://github.com/Tencent/Hippy/commit/e5c2ab9ea8ce7d77ea298db4a3360ac37c127eef))


### Features

* **android:** support use default source in image span ([218b4dd](https://github.com/Tencent/Hippy/commit/218b4dd0eac0125d1ea7a251aae31d85602efec6))
* **hippy-vue:** add txt/span/img/a/label/p touch event ([391bafd](https://github.com/Tencent/Hippy/commit/391bafd21f2a0fd0c0f8ec3c514fed8f08a2f531))
* **ios:** sdk will send error code if image load failure ([7b40ec6](https://github.com/Tencent/Hippy/commit/7b40ec6a80648b0ab9fb8162bfc2602a2cad3b87))


### Reverts

* Revert "feat(ios): add log handler" ([0499d7b](https://github.com/Tencent/Hippy/commit/0499d7bb5a96525c7632a6a11d2e4d951969c92e))
* Revert "fix(ios): add header search path config" ([b9b294d](https://github.com/Tencent/Hippy/commit/b9b294dee3cdaa04278d157bc4853d42414f419e))





## [2.6.1](https://github.com/Tencent/Hippy/compare/2.6.0...2.6.1) (2021-04-22)


### Bug Fixes

* **android:** remove some unused code from HippyBridgeImpl ([57ace32](https://github.com/Tencent/Hippy/commit/57ace3273897df3e16832ee52ed0d8e6779a6159))
* **ios:** fix resize mode center error ([#708](https://github.com/Tencent/Hippy/issues/708)) ([9670940](https://github.com/Tencent/Hippy/commit/9670940d4b2238bd7799cc2b4ab4d6e21a05d897))
* **ios:** fix text-image mixed content layout error ([04a7d6c](https://github.com/Tencent/Hippy/commit/04a7d6c4a4197fb8c524d4f108f7dd342d5f32be))
* **ios:** jsc stringRef bad access ([df73c0d](https://github.com/Tencent/Hippy/commit/df73c0d93c816b2d96d472310b41093dea55b4a8))
* **ios:** optimize process when reset scrollview's subview ([61cf1e7](https://github.com/Tencent/Hippy/commit/61cf1e796dd7097755c9d3ee5c77e1ba665f5a70))
* **ios:** optimize process when reset scrollview's subview ([cf71b8c](https://github.com/Tencent/Hippy/commit/cf71b8c29cb6963d79041ab0256cf78f5fca122f))
* **ios:** optimize process when reset scrollview's subview ([c9ab5e4](https://github.com/Tencent/Hippy/commit/c9ab5e49ca0e3047bfaf8f962e6d58d60f807dc4))


### Features

* **android:** add navigation bar height  to global dimension ([5e85304](https://github.com/Tencent/Hippy/commit/5e853046964e31126dc61a4353cd10e5d6dd09c7))
* **hippy-react,hippy-vue:** support to load local img ([4331fd5](https://github.com/Tencent/Hippy/commit/4331fd5c3a0ae0ae6700973e3399d520cf3d1d00))





# [2.6.0](https://github.com/Tencent/Hippy/compare/2.5.5...2.6.0) (2021-04-19)


### Bug Fixes

* **android:** add skipCmakeAndNinja ([8e87ec2](https://github.com/Tencent/Hippy/commit/8e87ec2f00df68d45a1ba2e115035d9ee8aa440b))
* **android:** call onDestroy in main thread ([c6563f8](https://github.com/Tencent/Hippy/commit/c6563f80fe6b7918831a787f1d9e00296eef7d9a))
* **android:** crash from RDM ([ceccb6d](https://github.com/Tencent/Hippy/commit/ceccb6df22685510a92abc7a567735a4fb139222))
* **android:** load module error ([45238bc](https://github.com/Tencent/Hippy/commit/45238bc9bc82c7c592d4466425fc3ca9d6f85d4a))
* **android:** pull header problem ([3cd6de6](https://github.com/Tencent/Hippy/commit/3cd6de6c526258ec8242a1e470266973a4964ed0))
* **android:** remove deprecated JNI ([38cede0](https://github.com/Tencent/Hippy/commit/38cede07390c7e84a2e11dfed85abcfa4396cabc))
* **android:** remove local properties in example gradle ([6771016](https://github.com/Tencent/Hippy/commit/6771016d6a9d21139633ab97b2f60fa92bc62ca5))
* **android:** remove so copy task from gradle ([5955c08](https://github.com/Tencent/Hippy/commit/5955c081e2bc0490c3017f0688b9f39398029b43))
* **android:** update integration.md ([d4ed351](https://github.com/Tencent/Hippy/commit/d4ed35192e507c762bdd4611b40fb0a608041a17))
* **core:** fix inspector crash ([05c6bc1](https://github.com/Tencent/Hippy/commit/05c6bc1d9e272d58a31489e08ccc061d62ef69eb))
* **core:** fix v8 scope bug ([62ddc7d](https://github.com/Tencent/Hippy/commit/62ddc7df753215773fc7f43f4331200fb074b8dc))
* **core:** use internal promise for iOS ([d63cf60](https://github.com/Tencent/Hippy/commit/d63cf60ca98c32ce390c3b68e6b41cdc00ddae2d))
* **hippy-react:** demo rm ios color anim ([80905f9](https://github.com/Tencent/Hippy/commit/80905f997954d59cd0d7a30d00504234c736e81d))
* **hippy-vue:** fix measureInWindowByMethod return value ([f5ca629](https://github.com/Tencent/Hippy/commit/f5ca6294227330db7855305ac61a09928f06fd40))
* **hippy-vue:** update y18n to safe ver ([9708117](https://github.com/Tencent/Hippy/commit/9708117a459345893f433a11a0f214be56443a09))
* **ios:** add synthesize for bridge in HippyExceptionModule ([3ea2419](https://github.com/Tencent/Hippy/commit/3ea2419927b4e42d6e0010e31aeb61b3c0f569b1))
* **ios:** check response charactset ([af073f5](https://github.com/Tencent/Hippy/commit/af073f5d3a399150987d62e604461ea814037b56))
* **ios:** fix animation pause & resume error ([b3ea1b7](https://github.com/Tencent/Hippy/commit/b3ea1b7ec8954d5be1fb59223ebb89a2ee6ab647))
* **ios:** fix backgroundimage update error ([2101edd](https://github.com/Tencent/Hippy/commit/2101edd531a3262282ee03835f1766a1c3f86638))
* **ios:** fix dynamic load error ([52bbdcd](https://github.com/Tencent/Hippy/commit/52bbdcddc5493e13a7274d73dc6225a004b31608))
* **ios:** fix scroll view error when same subview inserted ([97de391](https://github.com/Tencent/Hippy/commit/97de3918b8de95fd5adf9f3a2bea4072a66916e0))
* **ios:** fix view pager item frame error ([5a2a228](https://github.com/Tencent/Hippy/commit/5a2a2288b89f7e82f1d301582f387b0d62e55a1d))
* **ios:** fix view pager item frame error ([022a8f7](https://github.com/Tencent/Hippy/commit/022a8f717fb449150ca3c44f47dd9fa61ff42e24))
* **ios:** no setting CAAnimation.beginTime as far as possible ([b389e10](https://github.com/Tencent/Hippy/commit/b389e103cb3701666d30adddd3a9a2914ed32ce1))
* **ios:** optimizing hippy view creation ([0e06597](https://github.com/Tencent/Hippy/commit/0e0659765c0aaacebdfc964dc66592acdd50846b))


### Features

* **android:** support color animation ([70b3a0d](https://github.com/Tencent/Hippy/commit/70b3a0d2884ece7b3e3d34cdaedf5046d854a3a2))
* **android:** support create font from custom file path ([84bb5b8](https://github.com/Tencent/Hippy/commit/84bb5b8b428d8ae32934539e198e8a6af61c51c1))
* **core:** add dynamic jni ([ceeee74](https://github.com/Tencent/Hippy/commit/ceeee745827e39e287972964b375c4317d9835b7))
* **hippy-debug-server:** extend MIME ([4f1fe7d](https://github.com/Tencent/Hippy/commit/4f1fe7d6f4a1476b9cd3ccf95412d2e36e54a5a2))
* **hippy-react:** perf pullHeader example ([3d01ae4](https://github.com/Tencent/Hippy/commit/3d01ae40dc24fdd0e4941d18a543e438dc766ac3))
* **hippy-react,hippy-vue:** support color animation ([6c191a0](https://github.com/Tencent/Hippy/commit/6c191a08e203f45e8dd28e8e2e2f492bee20de8d))
* **hippy-vue,hippy-react:** add http dynamic import demo ([5d63f0a](https://github.com/Tencent/Hippy/commit/5d63f0a01b1dce3000890220186485898c7bda19))
* **ios:** animating view can trigger touch event ([375df39](https://github.com/Tencent/Hippy/commit/375df39f25e4f2e9ce9e671d3040f8e674290829))
* **ios:** pull header feature to set refresh time ([#695](https://github.com/Tencent/Hippy/issues/695)) ([2bec86a](https://github.com/Tencent/Hippy/commit/2bec86ad90010f91780fbb460c227f08c417afdb))
* **ios:** support background animation ([#686](https://github.com/Tencent/Hippy/issues/686)) ([6ed48b1](https://github.com/Tencent/Hippy/commit/6ed48b14d1ed25b38e759f3f9038d41375e0249c))





## [2.5.5](https://github.com/Tencent/Hippy/compare/2.5.4...2.5.5) (2021-03-26)


### Bug Fixes

* **android:** fetch resource with https:// ([c3dee7c](https://github.com/Tencent/Hippy/commit/c3dee7ca8bf7302f5aecc263b6e77624249073a6))
* **android:** should catch resource NotFoundException ([6284a49](https://github.com/Tencent/Hippy/commit/6284a49d05582825cd158fb73f56f335ac9a5af8))
* **android:** support engine status enum to int ([9708892](https://github.com/Tencent/Hippy/commit/970889220fa4eeb011c9e8c9cd443a125d025ad9))
* **android:** use ByteBuffer for onResourceReady ([9863317](https://github.com/Tencent/Hippy/commit/9863317dd89a6cb3a4d3242564920a4da8af7f02))
* **core:** fix conflict resolve error ([903650a](https://github.com/Tencent/Hippy/commit/903650a824a5b2fb14db3cfc47347bff50227469))
* **core:** fix dynamic load crash ([f9138b2](https://github.com/Tencent/Hippy/commit/f9138b2fcb203b0af5820694ab1ca8a2b231e070))
* **core:** fix iOS CreateJsError function error ([df8355c](https://github.com/Tencent/Hippy/commit/df8355cbc05914aba9b0c87146192809c92a8d0a))
* **core:** fix jni crash ([#651](https://github.com/Tencent/Hippy/issues/651)) ([6ae32cf](https://github.com/Tencent/Hippy/commit/6ae32cf835fe8ebc218a897d34b8836e0e1151ec))
* **core:** format ([618a40a](https://github.com/Tencent/Hippy/commit/618a40a1f4f667d8a1fd1f49358a38a876e5b270))
* **core:** revert v8 refactor ([82b0b27](https://github.com/Tencent/Hippy/commit/82b0b272971f2832ea5d74b21c57b646a1fc1e06))
* **core:** update so ([acd5bd1](https://github.com/Tencent/Hippy/commit/acd5bd1e124f63c1f4d8a4dd5ff9d295489e9722))
* **docs:** fix dynamic import docs ([d4a553d](https://github.com/Tencent/Hippy/commit/d4a553d34666bd548723e3a26ab2cf233981bdfa))
* **ios:** fix bug for touch handler ([15d0bb3](https://github.com/Tencent/Hippy/commit/15d0bb3a39cb44497069f8a7f1a58121fd65b6c5))
* **ios:** fix dynamic load for local file ([130b9d5](https://github.com/Tencent/Hippy/commit/130b9d5c622797b02915f688f11684a4fc260ef4))
* **ios:** fix index exceed range of array ([34591dd](https://github.com/Tencent/Hippy/commit/34591ddfb123490adac08f7c2d86f16be7219295))
* **ios:** improve stability ([3dc0743](https://github.com/Tencent/Hippy/commit/3dc074388c03ef0068bf98c21b600f3200839e4f))


### Features

* **android:** adjust for wormhole ([09fb96b](https://github.com/Tencent/Hippy/commit/09fb96b4b532ba5ae3daa11ec1f9c220d4a5ff87))
* **core:** daymiacLoad support http req ([#640](https://github.com/Tencent/Hippy/issues/640)) ([e7cd1f3](https://github.com/Tencent/Hippy/commit/e7cd1f3896c2fc287730ac24778732cd2704b976))
* **core:** refactor dynamic jni ([2f627df](https://github.com/Tencent/Hippy/commit/2f627df6d1f92e0ca11c93d4924f401f970d3c32))
* **core:** support multi scheme dynamic load ([932b51c](https://github.com/Tencent/Hippy/commit/932b51c952aca14150d153366a6695c078ef3a97))
* **ios:** adapter dynamic load ([f53bdd1](https://github.com/Tencent/Hippy/commit/f53bdd1fc4b73635fd211f677bba8a1fecf0e2c8))





## [2.5.4](https://github.com/Tencent/Hippy/compare/2.5.3...2.5.4) (2021-03-17)


### Bug Fixes

* **android:** add d8 setting for qq ([e001cdf](https://github.com/Tencent/Hippy/commit/e001cdfd1f5b9823da5bd6afa16958ba572a63c1))
* **android:** as inspect code ([357aac2](https://github.com/Tencent/Hippy/commit/357aac29d74bf4d66c533ea2ef8e6a6efb7de849))
* **android:** demo add onResume and onStop ([8435397](https://github.com/Tencent/Hippy/commit/8435397c7f85f0364e49b202da89f1642e60930e))
* **android:** run fetch image on main thread ([bd3479e](https://github.com/Tencent/Hippy/commit/bd3479e29768c4ecdba6d0b54cf89cd3da222261))
* **core:** add explicit ([22d3601](https://github.com/Tencent/Hippy/commit/22d360177162475bee7cc104aea4dc2ee1f11af3))
* **core:** fix codecc ([f8212e4](https://github.com/Tencent/Hippy/commit/f8212e49ae7bac63590de6622447dfc50c9e9df4))
* **core:** fix codecc warning ([#608](https://github.com/Tencent/Hippy/issues/608)) ([1077a79](https://github.com/Tencent/Hippy/commit/1077a7962a717f5151a8c3cc5da310d241560ce4))
* **core:** fix scope nullptr bug ([3df0e8c](https://github.com/Tencent/Hippy/commit/3df0e8c229c0a2ef9abb442701e45993ba2f8671))
* **hippy-vue:** add child animation destroy logic ([e0404fa](https://github.com/Tencent/Hippy/commit/e0404fa8cb31612309c39c16d8fe8a967fac5300))


### Features

* **core:** adapter 89 chrome dev tools ([#626](https://github.com/Tencent/Hippy/issues/626)) ([bab3d67](https://github.com/Tencent/Hippy/commit/bab3d67b632f867c4124396cac0c353d91e027db))
* **ios:** add onInterceptPullUpEvent propery ([d46432f](https://github.com/Tencent/Hippy/commit/d46432f9e4a5c9ad4cc7ceb0193c55a7c9967e6d))
* **layout:** format files ([5d18951](https://github.com/Tencent/Hippy/commit/5d18951a547efd1ea6d116f0704a863b5753fa0b))





## [2.5.3](https://github.com/Tencent/Hippy/compare/2.5.2...2.5.3) (2021-03-10)


### Bug Fixes

* **android:** add maven publish ([f7c4552](https://github.com/Tencent/Hippy/commit/f7c4552c4725132947fdcc45be3e35227ed84d69))
* **android:** call super.onDestroy() ([0f7e2d9](https://github.com/Tencent/Hippy/commit/0f7e2d945ce3b4688e6742ebb0ce4ee26179c31b))
* **android:** get thirdParty packageName first ([3fb32f3](https://github.com/Tencent/Hippy/commit/3fb32f3b49256b7b78ad2d5abcd6115150d94ba8))
* **android:** mListScrollListeners ConcurrentModificationException ([d8b2ab2](https://github.com/Tencent/Hippy/commit/d8b2ab2b846f30bf11f6423eb27eda286abf1df1))
* **android:** should catch UnsatisfiedLinkError for runScriptFromUri ([28d0a02](https://github.com/Tencent/Hippy/commit/28d0a02df34c5eb497a0a4f7c38aece511848435))
* **core:** fix DLOG macro ([9eb0bb8](https://github.com/Tencent/Hippy/commit/9eb0bb8ce066e34404a8629d5c411f63c920ce44))
* **ios:** fix HippyRootView did load finish callback ([e646db5](https://github.com/Tencent/Hippy/commit/e646db5479031ac93f85ab04f78a23a09d67e406))
* **ios:** try catch malloc exception when make image blurred ([#603](https://github.com/Tencent/Hippy/issues/603)) ([cc2521b](https://github.com/Tencent/Hippy/commit/cc2521bd6cff2a676c363f03e55ef5a9761063d0))


### Features

* **core:** avoid crash when the jni method does not exist ([05ae0cd](https://github.com/Tencent/Hippy/commit/05ae0cd4d02a8aae24f10f0c51da4c052966ce9f))





## [2.5.2](https://github.com/Tencent/Hippy/compare/2.5.1...2.5.2) (2021-03-08)


### Bug Fixes

* **android:** add onPreload for preloadItemNumber ([9d94837](https://github.com/Tencent/Hippy/commit/9d94837ed51c1ca46fa5db8fe548be014f99f30d))
* **android:** code style of HippyListAdapter ([66b4a39](https://github.com/Tencent/Hippy/commit/66b4a39e77b4f08fa25b120cfa47f030d5242585))
* **android:** ignore ClassNotFoundException for add video controller ([664dd7a](https://github.com/Tencent/Hippy/commit/664dd7a1f6bb60e322e53bd3ed29e22e8020e7fd))
* **android:** keep setCustomProp handle ([30d24b5](https://github.com/Tencent/Hippy/commit/30d24b5aa40eb871c16a2e2d31a19c914e3ec0da))
* **android:** rdm exception bug reports ([afcfc0c](https://github.com/Tencent/Hippy/commit/afcfc0c1bb8b022fa32b604aa55ffb95474a6d0a))
* **android:** some code style problem ([2246f53](https://github.com/Tencent/Hippy/commit/2246f5339c45297961f85d648de59ea91291bf23))
* **android:** use LogUtils replace Log ([56135da](https://github.com/Tencent/Hippy/commit/56135da02d18cafbdb2c72c41368c4e46ec1bdca))
* **ios:** fix support for translateZ ([6de05fa](https://github.com/Tencent/Hippy/commit/6de05fa5fd7eb4e1e3960f8e9f6ea4487d69ce23))
* **ios:** implement backgroundSize setter for HippyImageView ([b7ff2b8](https://github.com/Tencent/Hippy/commit/b7ff2b89d758d3d3501fd724a8b486fed18043db))


### Features

* **hippy-vue:** add animation event & method ([4018df8](https://github.com/Tencent/Hippy/commit/4018df8d8873e5830182b7d567e837c9bc5a0ef1))





## [2.5.1](https://github.com/Tencent/Hippy/compare/2.5.0...2.5.1) (2021-03-02)


### Bug Fixes

* **android:** add gradle features setting, remove PRODUCT_FLAVORS ([6e0c501](https://github.com/Tencent/Hippy/commit/6e0c501f9b06125d688f4b0f417f6ea0dbb8c906))
* **android:** fix TextNode width when do StaticLayout ([9942a2a](https://github.com/Tencent/Hippy/commit/9942a2a107fcc08f8dbc83c3534feb97d7e57dca))
* **android:** fix ViewPager setScrollEnabled not works ([cf5514b](https://github.com/Tencent/Hippy/commit/cf5514b352874aee065110647d7ab22b103fe5ed))
* **android:** resolve touch conflict for nested ViewPager ([aa4ac15](https://github.com/Tencent/Hippy/commit/aa4ac155f95e14fff814743ba88fdf5bb73967f7))
* **hippy-vue:** fixed repeatCount error in animationSet ([c16f306](https://github.com/Tencent/Hippy/commit/c16f3069d1361d69d872acf9476f345c0f886364))
* **ios:** invoke jscexecutor.invalide on js queue ([35262c4](https://github.com/Tencent/Hippy/commit/35262c4ff7e32df6e385e6fc824f1c9a456f5509))


### Features

* **android:** listview add props : overScrollEnabled ([3ed9418](https://github.com/Tencent/Hippy/commit/3ed9418b61e447365f0becdda6274c536a931c9d))





# [2.5.0](https://github.com/Tencent/Hippy/compare/2.4.0...2.5.0) (2021-02-25)


### Bug Fixes

* **ios:** fix viewpager bug ([54b0e06](https://github.com/Tencent/Hippy/commit/54b0e060b1dc078d83f830ce3a9b42df210dec56))


### Reverts

* Revert "feat(hippy-core): export so symbol" ([94842f6](https://github.com/Tencent/Hippy/commit/94842f69c5001cf69226848978e93703a3828c1c))





# [2.4.0](https://github.com/Tencent/Hippy/compare/2.3.4...2.4.0) (2021-02-25)


### Bug Fixes

* **android:** add usesCleartextTraffic=true ([6c21253](https://github.com/Tencent/Hippy/commit/6c2125336fadc85df86743b62874bf7393bc3d3c))
* **android:** merge some bug fix from QB branch ([5ad10ae](https://github.com/Tencent/Hippy/commit/5ad10ae476ad8178996cf5ada0e11115c196edc0))
* **android:** merge some bug fix from QQ branch ([a9b9460](https://github.com/Tencent/Hippy/commit/a9b94603627612f4b84a0100345a7a898a3bb385))
* **android:** onCreateSuspendViewHolderWithPos should return null ([7efa9c9](https://github.com/Tencent/Hippy/commit/7efa9c9a980dc54ba879e1a7c9a4ed3536a37f27))
* **android:** support only include armeabi ([3e60c4d](https://github.com/Tencent/Hippy/commit/3e60c4d9e02ef20e2ad7731a23eec73eab75f208))
* **android:** update v8 77 so ([a05fdaf](https://github.com/Tencent/Hippy/commit/a05fdaf8c1cc069c560a44fbe96e7807e1432023))
* **android:** webview set allow content access to false ([b12e5cf](https://github.com/Tencent/Hippy/commit/b12e5cfd25008ecdb29c780a250ab5a58087175c))
* **core:** avoid iOS map crash ([7657ab5](https://github.com/Tencent/Hippy/commit/7657ab53bc2c7ee998bed8cbd52f923996843e04))
* **core:** fix debug crash ([748c6de](https://github.com/Tencent/Hippy/commit/748c6dede274f423c21c955f003f7cc7a751d046))
* **core:** fix js exception report bug ([1b27277](https://github.com/Tencent/Hippy/commit/1b27277be0e4060d6480aea835c4d8c832bc6f70))
* **feat:** change build-core script ([38b99dd](https://github.com/Tencent/Hippy/commit/38b99dd9510da2e4c4ba4fd7525f78398cc9a0e5))
* **hippy-core:** remove getOwnPropertyDescriptors ([58f5ff7](https://github.com/Tencent/Hippy/commit/58f5ff7729b57c246ccce7f72d103e5af6498165))
* **hippy-react-web:** correct margin and padding style values ([#543](https://github.com/Tencent/Hippy/issues/543)) ([0754a68](https://github.com/Tencent/Hippy/commit/0754a682ffe894f36c48b1a739c65ab8b76e9a24))
* **hippy-react,hippy-vue:** add examples webpack sourcetype ([839da97](https://github.com/Tencent/Hippy/commit/839da975819024647a9797a836792dabeeb19acf))
* **hippy-vue:** fix vue webpack dll problem ([bbdc95c](https://github.com/Tencent/Hippy/commit/bbdc95cd602d8d545a2958cd1b877905300b1c4d))
* **hippy-vue,hippy-react:** added example babel plugins ([cd54ce9](https://github.com/Tencent/Hippy/commit/cd54ce91082f81257095d7979ea6ca717bd323f9))
* **hippy-vue,hippy-react:** change webpack vendor script ([4ac88cb](https://github.com/Tencent/Hippy/commit/4ac88cbf03ec4ea34538ce27b850f8d4ab1c24be))
* **ios:** add [@autoreleasepool](https://github.com/autoreleasepool) in hippy custom js thread callback block ([b0518a2](https://github.com/Tencent/Hippy/commit/b0518a25dd0f46a69ac78cb6261cbe8ca661dc63))
* **ios:** fix apng image delay time error ([f8eb557](https://github.com/Tencent/Hippy/commit/f8eb557ab92167bd9351d149078373e3ceeebdd7))
* **ios:** fix backgroundSize property of View component ([e16cedf](https://github.com/Tencent/Hippy/commit/e16cedf9301194ec22cfe312dfef11a9cf5cf6a8))
* **ios:** fix device orientation change event bug ([d80c6a3](https://github.com/Tencent/Hippy/commit/d80c6a36f0a6aa17345740571c72b2fa140dfc84))
* **ios:** fix image down sample error ([b967ceb](https://github.com/Tencent/Hippy/commit/b967cebad80c9eb55f3fc3dbade3bf9d7b697324))
* **ios:** fix image insets error ([9651d84](https://github.com/Tencent/Hippy/commit/9651d8412d9ed234a984d8321ee39d8cec22d6b0))
* **ios:** fix potential crash because of a nil context pointer ([e8c1820](https://github.com/Tencent/Hippy/commit/e8c18208376715a636d2288df123d86b44e7d8af))
* **ios:** fix protential crash when AppDelegate.window called ([5048b0b](https://github.com/Tencent/Hippy/commit/5048b0b772fc78c766fea5ca67fcb764bb0b3a32))
* **ios:** fix text input placeholder error ([83b6f48](https://github.com/Tencent/Hippy/commit/83b6f48da3bef9dbd35669badef8db040cf97f74))
* **ios:** fix view creation missing if view is created lazily ([b8747ac](https://github.com/Tencent/Hippy/commit/b8747acf62c913731c471422ad80c40fe6969aac))
* **ios:** fix viewpager component bug ([#564](https://github.com/Tencent/Hippy/issues/564)) ([56c481b](https://github.com/Tencent/Hippy/commit/56c481bda62a3268b2259430f54fa685de2eafcd))


### Features

* **android:** add gaussian blur property to image ([6c7290e](https://github.com/Tencent/Hippy/commit/6c7290e19bfa4ecda11b0dad00ef49e7b615f624))
* **android:** add local aar dependencies in demo ([227302c](https://github.com/Tencent/Hippy/commit/227302c5dea8d117213ac5b3461abd738ad9c796))
* **android:** change gaussian blur property type ([2733d1a](https://github.com/Tencent/Hippy/commit/2733d1a249ec0b6feae8530f803ba7e1111e8fe7))
* **android:** night mode support ([31ca5d1](https://github.com/Tencent/Hippy/commit/31ca5d1b1e371b846bc73d7790a248cd409d9e9f))
* **android:** support abi and v8 gradle setting ([8961799](https://github.com/Tencent/Hippy/commit/8961799439c890fc84ce24fc593697c3b4307a9e))
* **android:** support assemble by product flavors ([d0ecb6a](https://github.com/Tencent/Hippy/commit/d0ecb6a615c58c4e89648bb1fe41d8a5c1ea9e17))
* **android:** support register multi module name ([3060283](https://github.com/Tencent/Hippy/commit/30602839b598d2ff51b2260faab7a4551bf14ebc))
* **hippy-core:** export so symbol ([3f9d5cb](https://github.com/Tencent/Hippy/commit/3f9d5cb98079176f03874a6b6607d6fb43ed1b3a))





## [2.3.4](https://github.com/Tencent/Hippy/compare/2.3.3...2.3.4) (2021-01-25)


### Bug Fixes

* **android:** add debug and release argument for cmake ([fff9084](https://github.com/Tencent/Hippy/commit/fff90840b71d7267e4bb502de372502d7a4f3398))
* **android:** add support-annotations:28.0.0 ([46d5bf2](https://github.com/Tencent/Hippy/commit/46d5bf2e7a285c571187f8c34a9df2c1225ad42f))
* **ios:** block ui actions when bridge is invalide ([2581f3d](https://github.com/Tencent/Hippy/commit/2581f3d948760b51d31647f82b8588d29c91ceca))
* **ios:** fix error on drawing image with backgroundPositionX/Y ([a57240a](https://github.com/Tencent/Hippy/commit/a57240a044235e85cfbaefcd8ea77d791a044a28))
* **ios:** fix reference cycle in block ([3a77ebe](https://github.com/Tencent/Hippy/commit/3a77ebe1849b12522dd3d5e3bd4dd90d0909ee73))
* **ios:** no more tracking safa area for tableview ([df91cb4](https://github.com/Tencent/Hippy/commit/df91cb4ca1a399be4ec8705b5f962852e24c671a))


### Features

* **hippy-core:** add navigatorBarHeight ([71b5470](https://github.com/Tencent/Hippy/commit/71b5470475d71564275001f67600218d0569348b))





## [2.3.3](https://github.com/Tencent/Hippy/compare/2.3.2...2.3.3) (2021-01-20)


### Bug Fixes

* **android:** can not find cmake path ([720750a](https://github.com/Tencent/Hippy/commit/720750a2312614436f609c484f521a3c9eefe7ae))
* **ios:** fix image load error event ([d4099ee](https://github.com/Tencent/Hippy/commit/d4099eea71c2f9d4f4dc19c120edd25d78e46362))
* **ios:** fix network type judgment method ([#517](https://github.com/Tencent/Hippy/issues/517)) ([73daf87](https://github.com/Tencent/Hippy/commit/73daf87a9b7b418281296efd29493c16717d7835))


### Features

* **ios:** hippy now will send ‘destroyInstance’ event to JS ([b0ae490](https://github.com/Tencent/Hippy/commit/b0ae490d9ac13b9f79d6b0e95c7add02bf4ecb07))
* **ios:** optimize image load error message ([e20bed9](https://github.com/Tencent/Hippy/commit/e20bed987e86a5a184247196243867d3aa75b3c4))





## [2.3.2](https://github.com/Tencent/Hippy/compare/2.3.1...2.3.2) (2021-01-18)


### Bug Fixes

* **hippy-react:** fix appendChild error in react16 by key diff ([233e40c](https://github.com/Tencent/Hippy/commit/233e40c48511eee5745f189a6b9b58df1604a377))
* **ios:** fix crash due to a nil pointer of JSGlobalContextRef ([8aedca6](https://github.com/Tencent/Hippy/commit/8aedca638dc1ad97634a5b84e64f6a96e782df08))


### Features

* **hippy-react:** added demo key ([bd2201b](https://github.com/Tencent/Hippy/commit/bd2201b525c33642a67f11b9cd4e95c0c51159bc))





## [2.3.1](https://github.com/Tencent/Hippy/compare/2.3.0...2.3.1) (2021-01-13)


### Bug Fixes

* **ios:** fix bug that onPageScroll and onPageSelected invoke incorrect ([f86623d](https://github.com/Tencent/Hippy/commit/f86623d5e0d19194efe5a1fd0a2225e07c2d3cec))


### Features

* **core:** added destroyInstance event ([1dd9783](https://github.com/Tencent/Hippy/commit/1dd97839a98df0e4979672861b90e33651dcdfc8))
* **hippy-react:** added Text displayName ([f591206](https://github.com/Tencent/Hippy/commit/f5912066a56d3ebed8a5ec0cd96e8bedc46d792f))





# [2.3.0](https://github.com/Tencent/Hippy/compare/2.2.2...2.3.0) (2021-01-11)


### Bug Fixes

* **android:** revert RecyclerViewBase onTouchMove call ([2bbf339](https://github.com/Tencent/Hippy/commit/2bbf3399e481fdecf9a12c72bb69b444f6cee6de))
* **core:** fix exception rethrow bug ([60cf9cc](https://github.com/Tencent/Hippy/commit/60cf9ccea1098a9fb5b91c60f3259e378b52194a))
* **hippy-react-web:** correctly add px to number style values ([f774726](https://github.com/Tencent/Hippy/commit/f7747265d18565811e4346f6b342d23c26cf3827))
* **hippy-vue,hippy-react:** fixed listview appear & disappear event ([86c02fd](https://github.com/Tencent/Hippy/commit/86c02fde0e47ff8862e92a4892c768da78a63674))
* **ios:** fix a notification error with wrong object ([ae8fa7f](https://github.com/Tencent/Hippy/commit/ae8fa7ffcdecc0aed28f79d59174210d65cb82fd))
* **ios:** fix header file include error ([7786837](https://github.com/Tencent/Hippy/commit/77868370777043363f689fd5696463ad816044f7))
* **ios:** fix image show when image source did not change ([a67e81d](https://github.com/Tencent/Hippy/commit/a67e81d0b15c6d8e6836dc3813dfe8ec33cd31d3))
* **ios:** onPulling will occur on right number ([f79d99d](https://github.com/Tencent/Hippy/commit/f79d99d8bd49e9c4d106c99a929b7cd2f9d6b543))
* **ios:** remove an unused gesture ([7259e94](https://github.com/Tencent/Hippy/commit/7259e944e0b817b1a324680dd92a75461c5e9185))
* **ios:** remove check numberOfRows property ([269a75c](https://github.com/Tencent/Hippy/commit/269a75c2c7bf7e010d54c906ac09209e6cd5fc0e))


### Features

* **core:** add delloc event ([b11ae13](https://github.com/Tencent/Hippy/commit/b11ae136b6b6a62506f60697c83009078c2f28fb))
* **hippy-react:** forward Text ref ([5595dc1](https://github.com/Tencent/Hippy/commit/5595dc14d430c0289692358b47de3975f40945c2))
* **hippy-react-web:** added ScrollView scrollEnabled attribute ([efb1ea1](https://github.com/Tencent/Hippy/commit/efb1ea15dea6b16fe06222d604297339354733f1))
* **hippy-vue-demo,hippy-react-demo:** add dynamic import demo ([c4f357b](https://github.com/Tencent/Hippy/commit/c4f357b77d5ee5183f960afbebff7d0f7b1298c9))
* **hippy-vue,hippy-react:** added willAppear & willDisappear event ([d0eb0f1](https://github.com/Tencent/Hippy/commit/d0eb0f1aac4a13886fed6682ac08e2c082bd8448))
* **ios:** add appear event for cell in list view ([#496](https://github.com/Tencent/Hippy/issues/496)) ([2b9b653](https://github.com/Tencent/Hippy/commit/2b9b653d284041743c7915f0e016eea6dbe72d1e))





## [2.2.2](https://github.com/Tencent/Hippy/compare/2.2.1...2.2.2) (2021-01-04)


### Bug Fixes

* **hippy-react-web:** fixed image newProps src unRendered problem ([#472](https://github.com/Tencent/Hippy/issues/472)) ([86bd187](https://github.com/Tencent/Hippy/commit/86bd1874ff6ebb9f5ad97260e595b6e35b54cd29))
* **hippy-vue:** fix css rulesets concat error ([d0c900c](https://github.com/Tencent/Hippy/commit/d0c900c44be8c7759db8539a3c57be845471d227))
* **ios:** fix gif play error when using gif cache data ([32d0729](https://github.com/Tencent/Hippy/commit/32d07295e6d5efa5feebeeb9b587a6f607bdc081))


### Features

* **ios:** set a switch for red box show ([eb44a9c](https://github.com/Tencent/Hippy/commit/eb44a9c41386ec496b3d9f9da6aaade614fa2447))





## [2.2.1](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/compare/2.2.0...2.2.1) (2020-12-28)


### Bug Fixes

* **hippy-react-web:** fixed image onLoadEnd undefined ([#470](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/issues/470)) ([6e312b6](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/commit/6e312b6b623d3e53ff12e725003dc28a10a7e61f))





# [2.2.0](https://github.com/Tencent/Hippy/compare/2.1.6...2.2.0) (2020-12-25)


### Bug Fixes

* **android:** local image uri start with file:// ([34ba5cf](https://github.com/Tencent/Hippy/commit/34ba5cfc4085eaceb0d050affe726858223229c1))
* **core:** add jni code ([f5451fd](https://github.com/Tencent/Hippy/commit/f5451fd151acf8d33f6f3336e119aa9aeaa94b34))
* **hippy-core:** fixed network header default type ([#466](https://github.com/Tencent/Hippy/issues/466)) ([2879afc](https://github.com/Tencent/Hippy/commit/2879afcfbfc2aa87a515a3f74de40e6e1d909033))
* **hippy-react-web:** fixed api to web issues and some warnings ([#456](https://github.com/Tencent/Hippy/issues/456)) ([80efec7](https://github.com/Tencent/Hippy/commit/80efec7aca16cd5a16575bac6696c7f12cf04626))
* **hippy-react,hippy-vue:** fixed boxShadow annotation ([#460](https://github.com/Tencent/Hippy/issues/460)) ([fceb70e](https://github.com/Tencent/Hippy/commit/fceb70ee4803a978ea4c1b28fd33700b991dee42))


### Features

* **android:** support dynamic load ([67b0b3f](https://github.com/Tencent/Hippy/commit/67b0b3f9becb26fdcd729c05b2a940134eba58b7))
* **core:** add dynamic load ([20e2ed9](https://github.com/Tencent/Hippy/commit/20e2ed983d556897c9b9c2fcc7e6d8d858131070))
* **core:** update so ([5d6a25c](https://github.com/Tencent/Hippy/commit/5d6a25c2db8d6dd1987c851adc4836430291bda8))
* **ios:** add dynamic load ([50c427a](https://github.com/Tencent/Hippy/commit/50c427ab4361b7c5e3c0463965553dd2043af43c))
* **ios:** same businesses will share same memory in LocalStorage modul ([8ab4b3b](https://github.com/Tencent/Hippy/commit/8ab4b3b44885d44dba41ba3798cfe1bcfc948cb1))





## [2.1.6](https://github.com/Tencent/Hippy/compare/2.1.5...2.1.6) (2020-12-23)


### Bug Fixes

* **android:** add shadow offset props ([0f8eb08](https://github.com/Tencent/Hippy/commit/0f8eb084facd324b9298f218a2457445073ca648))
* **android:** draw shadow with border radius ([87a608a](https://github.com/Tencent/Hippy/commit/87a608ab744ac7ed7f0a5a44e27fd847d89100fd))
* **hippy-react:** fixed hairlineWidth NaN in ios ([82faee1](https://github.com/Tencent/Hippy/commit/82faee1f6693dce534ad97e18f4a42d9af1d2d9d))
* **hippy-vue,hippy-react:** compatible loadMore and endReached event ([#429](https://github.com/Tencent/Hippy/issues/429)) ([d992cbe](https://github.com/Tencent/Hippy/commit/d992cbefbd9a0f76bee70bf604df7d377a08e97c))
* **ios:** fix crash caused by a nil pScope ([2ae1349](https://github.com/Tencent/Hippy/commit/2ae134969cea5a0601a7e61d7c677ac4541dd050))
* **ios:** fix memory leaks in HippyBaseListViewCell ([#453](https://github.com/Tencent/Hippy/issues/453)) ([39d1760](https://github.com/Tencent/Hippy/commit/39d1760dd04e4fe75370632ef1c4106bc466f5e2))
* **ios:** hippy image loader will search the cache ([c13f4d1](https://github.com/Tencent/Hippy/commit/c13f4d14bc0677a5fd61228d1f2e4f59da0c822f))


### Features

* **demo:** perf demo dev debug experience ([#452](https://github.com/Tencent/Hippy/issues/452)) ([20fda8c](https://github.com/Tencent/Hippy/commit/20fda8c92b8bebb584b4636ea4685c18d5969215))
* **hippy-react:** added hippy-react boxShadow attr and demo ([#458](https://github.com/Tencent/Hippy/issues/458)) ([6fd6a34](https://github.com/Tencent/Hippy/commit/6fd6a342f7c0b7b6aa742eeee5c585e9e5a1d31b))
* **hippy-vue:** change boxShadowOffset standard format ([7be6617](https://github.com/Tencent/Hippy/commit/7be661783182ef6d2e024e260c462bc33dcba4e6))
* **hippy-vue:** vue css selectors support dynamic import ([#440](https://github.com/Tencent/Hippy/issues/440)) ([3baa571](https://github.com/Tencent/Hippy/commit/3baa57105df8f4e7a46d52d4334a88ee921c388d))
* **hippy-vue-example:** change dev cssloader path ([#451](https://github.com/Tencent/Hippy/issues/451)) ([795bf75](https://github.com/Tencent/Hippy/commit/795bf7588af20e740de23b0295f87b2bf69e8343))





## [2.1.5](https://github.com/Tencent/Hippy/compare/2.1.4...2.1.5) (2020-12-10)


### Bug Fixes

* **android:** correct text truncate ([58efa65](https://github.com/Tencent/Hippy/commit/58efa65fc47030639238547813b85b9a2f304df5))
* **android:** support customize debug port ([2b88947](https://github.com/Tencent/Hippy/commit/2b88947f1a6fc8a7c1097e8fe445ab64cc511f16))
* **hippy-react:** continue finding nodeId if stringref's stateNode is a ([#442](https://github.com/Tencent/Hippy/issues/442)) ([3860d3f](https://github.com/Tencent/Hippy/commit/3860d3ff3c36299b1f973dedbede83bcf94fa9ad))





## [2.1.4](https://github.com/Tencent/Hippy/compare/2.1.3...2.1.4) (2020-12-03)


### Bug Fixes

* **hippy-react:** fix pullHeader and pullFooter ([#420](https://github.com/Tencent/Hippy/issues/420)) ([abfc574](https://github.com/Tencent/Hippy/commit/abfc57401951acca4fb3fea72456784efcd4e926))
* **hippy-react-web:** suppress childContextTypes warning ([#431](https://github.com/Tencent/Hippy/issues/431)) ([4a7ba66](https://github.com/Tencent/Hippy/commit/4a7ba66fc7ada2ba0f4010ab49b4e24d1886bca2))
* **hippy-react,hippy-vue:** fixed setNativeProps demo ([#436](https://github.com/Tencent/Hippy/issues/436)) ([cf8be7c](https://github.com/Tencent/Hippy/commit/cf8be7cb19919bf5a1fe2bdd5372690ec98024da))


### Features

* **hippy-vue,hippy-react:** added setNativeProps on element ([#430](https://github.com/Tencent/Hippy/issues/430)) ([d1f7e21](https://github.com/Tencent/Hippy/commit/d1f7e216b5fef46ace0cf50803ad2940b429a0d6))
* **hippy-vue,hippy-react:** perf setNativeProps ([5cd1291](https://github.com/Tencent/Hippy/commit/5cd12910262ad3bb15d07c2dc974a829958a2b86))
* support isomorphic rendering ([#415](https://github.com/Tencent/Hippy/issues/415)) ([c131734](https://github.com/Tencent/Hippy/commit/c1317348bab9d38990decf7d39f0631d807ab9a5))





## [2.1.2](https://github.com/Tencent/Hippy/compare/2.1.1...2.1.2) (2020-11-23)


### Bug Fixes

* **hippy-debug-server:** fixed the way the server read from file ([#405](https://github.com/Tencent/Hippy/issues/405)) ([fa16ee8](https://github.com/Tencent/Hippy/commit/fa16ee85a31cfbd05c91e33a8b3f4029a15936ac))
* **hippy-debug-server:** response 404 when file not found ([#410](https://github.com/Tencent/Hippy/issues/410)) ([8b161a8](https://github.com/Tencent/Hippy/commit/8b161a883d8506015cb7c0f0c41cc4fc2022a89e))
* **ios:** change way to get bridge property ([1f7a843](https://github.com/Tencent/Hippy/commit/1f7a843e0d3d84ee132ab6fb52d75cc651f16c5a))
* **ios:** fix bugs that some js exceptions may not be caught ([629fa22](https://github.com/Tencent/Hippy/commit/629fa224a889e3aba3a2bb383286983daf834a4b))
* **ios:** fix loop count property ([7a3f093](https://github.com/Tencent/Hippy/commit/7a3f093a3cd96038d501e13d67af38e69d65d8f4))
* **ios:** fix loop count property ([6d44bf4](https://github.com/Tencent/Hippy/commit/6d44bf469937e18873aa8175a9bd8446b106371d))
* **ios:** fix multiple thread competion ([f281bd1](https://github.com/Tencent/Hippy/commit/f281bd17ef7437e634e3656a0498aacc33480b67))
* **ios:** fix the bug that get wrong _bridge value ([b4132c7](https://github.com/Tencent/Hippy/commit/b4132c70155571bf993695308b05d35b96a01393))
* **ios:** fix threads competion bugs ([258a480](https://github.com/Tencent/Hippy/commit/258a4804fa16ff28731cd066ff22b71886f05d3a))
* **ios:** have to consider an exception for QB ([9d4f724](https://github.com/Tencent/Hippy/commit/9d4f724042f67ca0ee82aeffda7f0ffcb34b1c50))
* **ios:** jscontextref held by jscontextgroupref cannot be deallocated ([e85e0a3](https://github.com/Tencent/Hippy/commit/e85e0a31986965152e59c1bc2f334c9a5ed16aba))
* **ios:** now modal component property will be set corrently ([0fbc5ad](https://github.com/Tencent/Hippy/commit/0fbc5ad8f95a4babf09622ef47518b05e8b51733))
* **ios:** use isEqualToString for NSString comparison ([fef7971](https://github.com/Tencent/Hippy/commit/fef79713b20613735d99978bb8909c3f07429a9d))


### Features

* **hippy-debug-server:** modify debug server to support multiple files ([#411](https://github.com/Tencent/Hippy/issues/411)) ([508ec9f](https://github.com/Tencent/Hippy/commit/508ec9f2f11070b1616cf155a330fb538d9c23ff))
* **hippy-vue:** added iOS12 statusBarHeight ([d33e993](https://github.com/Tencent/Hippy/commit/d33e993b72b3627e3fd73e5f5e08d8c34d4ee23d))
* **hippy-vue, hippy-react:** changeTryConvertNumberCompatibility ([714faaf](https://github.com/Tencent/Hippy/commit/714faaf11988659b450a3276342597b7ed095a17))
* **ios:** add method for HippyBridge ([a24dbfd](https://github.com/Tencent/Hippy/commit/a24dbfd17f15f05e3bc20476b0210d2f45f750b6))
* **ios:** check necessity of reloading image for HippyImageView ([34ce4eb](https://github.com/Tencent/Hippy/commit/34ce4eb72a4479cd6cba1edadaf89fd894af0905))
* **ios:** fix incorrect of image cache ([c00c344](https://github.com/Tencent/Hippy/commit/c00c34467742d67d062e6a920149405cb4bc9b44))
* **ios:** increase error infomation propery ([f2f24e8](https://github.com/Tencent/Hippy/commit/f2f24e8e9f7cc679eb356515b2c60e39b30721a5))
* **ios:** modify pod config file ([d889fd4](https://github.com/Tencent/Hippy/commit/d889fd4a86a11982dd09598d7f93307780d704bd))
* **ios:** perfect error function ([dbfefd5](https://github.com/Tencent/Hippy/commit/dbfefd5936501556063218e8759b771a1cfe0020))
* **ios:** set predrawing no for animated image ([d80b04a](https://github.com/Tencent/Hippy/commit/d80b04ae1ba377fc98411ed15a91805e90efea05))





## [2.1.1](https://github.com/Tencent/Hippy/compare/2.1.0...2.1.1) (2020-11-11)


### Bug Fixes

* **hippy-vue:** fixed focus event support for div ([#387](https://github.com/Tencent/Hippy/issues/387)) ([21d8b58](https://github.com/Tencent/Hippy/commit/21d8b58946f546bc2313c163818f525b0da8ef9a))
* **hippy-vue:** fixed tryConvertNumber bug & some compatible issue ([ba8836d](https://github.com/Tencent/Hippy/commit/ba8836d9b3c3461f013d325c0e86c84233e3ede6))




# [2.1.0](https://github.com/Tencent/Hippy/compare/2.0.3...2.1.0) (2020-10-29)


### Bug Fixes

* **android:** avoid null pointer before bouncing RefreshWrapper ([43c2fb5](https://github.com/Tencent/Hippy/commit/43c2fb56360c2b4471a6c0cbefb1bcec94e87edd))
* **android:** change hippy.jar storage path ([161cb38](https://github.com/Tencent/Hippy/commit/161cb38663b036783ec64f6e45fa8a957500b906))
* **android:** change style of font size invalid ([a0b534f](https://github.com/Tencent/Hippy/commit/a0b534f17118a464ff8e1328c1dba23ca2034b3a))
* **android:** checkUpdateDimension window height==width problem for QB ([1011371](https://github.com/Tencent/Hippy/commit/1011371303a6233a97604f1d8d321f531179a9fd))
* **android:** compile problem ([631c9d3](https://github.com/Tencent/Hippy/commit/631c9d3e90039d09186d0dcfe647c78476d0140d))
* **android:** context holder memory leak ([b810bc1](https://github.com/Tencent/Hippy/commit/b810bc16f293bd18fd8f23ae3b66a278a54cb698))
* **android:** correct list view onEndReached to onLoadMore ([eaa7e5f](https://github.com/Tencent/Hippy/commit/eaa7e5faa141cd0d703e473d8f141b7b7adbed7d))
* **android:** dispatchFunction with promise for textinput getValue ([f886e0b](https://github.com/Tencent/Hippy/commit/f886e0b15297caaf86cb8147e7353a83d4743f7a))
* **android:** fetchImage param should support different type ([497ba71](https://github.com/Tencent/Hippy/commit/497ba7155e081774de507d18076b7e6fb0fd7f98))
* **android:** fix support-ui code style ([04c9959](https://github.com/Tencent/Hippy/commit/04c99593742f614256f95b0b83c5a97918096ef2))
* **android:** get listView frame size function ([74e2769](https://github.com/Tencent/Hippy/commit/74e2769399d29b02c9446af9b999dcb0c97f2887))
* **android:** imageview will flash when list loadmore ([#228](https://github.com/Tencent/Hippy/issues/228)) ([366247a](https://github.com/Tencent/Hippy/commit/366247abcb89772ce11c539a3d66fdfe124131c1))
* **android:** list view flash when exceed 7 item in screen ([0109fe5](https://github.com/Tencent/Hippy/commit/0109fe521bf888ed65f06788af6ab6bd34d67886))
* **android:** list view init position incorrect when contain pull header ([c6eb90d](https://github.com/Tencent/Hippy/commit/c6eb90de9f5aea4e5140f3bd01cff62338f3a7ed))
* **android:** list view item reuse tintcolor invalid problem ([7270141](https://github.com/Tencent/Hippy/commit/727014141e358a0ddd7c2f3d21b0372367939444))
* **android:** make ListViewItem as same type props with iOS ([1ae5b54](https://github.com/Tencent/Hippy/commit/1ae5b54490e3659df6b4355708df70b274936d0d))
* **android:** memory leak suspect ([a9ef48d](https://github.com/Tencent/Hippy/commit/a9ef48df1a6a18b8fe2cee8f219cf65c02525d49))
* **android:** modal view crash when activity destroyed ([e73b656](https://github.com/Tencent/Hippy/commit/e73b656ed693d5b4fef56e355fcec01a1d909fbc))
* **android:** module load listener memory leak ([55a084f](https://github.com/Tencent/Hippy/commit/55a084fe2cc1c1fdb3698621ee5edabb52a89e08))
* **android:** optimize view hippmap tag impl ([f433ec4](https://github.com/Tencent/Hippy/commit/f433ec4246d2511c8a29a7611b5380e1067dc3e3))
* **android:** pic not display when adapter call back file path ([7620d7a](https://github.com/Tencent/Hippy/commit/7620d7adac330574cf13b52816f7694f1633c789))
* **android:** revert build gradle publish config ([b2c67e3](https://github.com/Tencent/Hippy/commit/b2c67e3658b849582528c759066cfc62826342ba))
* **android:** revert fetch image optimize in support ui ([416a6e2](https://github.com/Tencent/Hippy/commit/416a6e2c1c3396e41eea86c6ecd32a3429044c28))
* **android:** set engine context null may case crash ([10146f0](https://github.com/Tencent/Hippy/commit/10146f0119e6f8922942c1e27a81e08dc18cc918))
* **android:** support ui fetch image and react bug fix ([d829ed4](https://github.com/Tencent/Hippy/commit/d829ed48c2cb8001f3c19f8937863d71536ab76d))
* **android:** temporary remove example third party adapter ([6d148ec](https://github.com/Tencent/Hippy/commit/6d148ecc091dfc06af0bf0cf36e130e2b5a5fb07))
* **android:** tkd list view loadMoreFinish incorrect ([6659a07](https://github.com/Tencent/Hippy/commit/6659a078666ef6f1d3908d1e276db9e289a2d9ef))
* **android-viola:** modify maven configuration ([7558e6a](https://github.com/Tencent/Hippy/commit/7558e6a34d355f153346b5263e2c6e446a3cdde5))
* **android-viola:** modify maven configuration for 0.1.2 ([b7da1f0](https://github.com/Tencent/Hippy/commit/b7da1f0e6fad313a40dd9e72882b97c2d577a3f0))
* **doc:** add a new attribute to listView ([8232db6](https://github.com/Tencent/Hippy/commit/8232db658217717a9288bedfbc01f07ea2c979d8))
* **hippy-react:** fix hippy-react animationSet destroy problem ([#382](https://github.com/Tencent/Hippy/issues/382)) ([3c66ca6](https://github.com/Tencent/Hippy/commit/3c66ca676d8f4fa3bc852492d24e533c617b252d))
* **hippy-react:** removed unncessary Object.values() ([8a68d44](https://github.com/Tencent/Hippy/commit/8a68d44d7c7bd439b2be0badc542e9224685c76f))
* **hippy-react:** restore the ListView type props be number ([#367](https://github.com/Tencent/Hippy/issues/367)) ([231ec5a](https://github.com/Tencent/Hippy/commit/231ec5a37b41eb778b649e079ec5d6bbe712fb8f)), closes [/github.com/Tencent/Hippy/commit/9de74e331b797c2137b1d0e3d08cd0dde0ee821a#diff-ccaf44058906717491bd079958ea5684a93acaa5d726e22cb34c0a6c82c79](https://github.com//github.com/Tencent/Hippy/commit/9de74e331b797c2137b1d0e3d08cd0dde0ee821a/issues/diff-ccaf44058906717491bd079958ea5684a93acaa5d726e22cb34c0a6c82c79)
* **hippy-vue:** fix hippy-vue transform multi-animation not working ([84bd58b](https://github.com/Tencent/Hippy/commit/84bd58be840ea3f5ddd9d387e92b5a084387e9d1))
* **ios:** cancel previous custom image loading when a new request come ([3aef246](https://github.com/Tencent/Hippy/commit/3aef2466d5b52ad7daeeba0acdb072bf356b055c))
* **ios:** clear resources before Engine destroy ([fe6e080](https://github.com/Tencent/Hippy/commit/fe6e080754c2112d8043fa5cdf719be9c16fc50c))
* **ios:** code format, add a break to match static analysis ([61a43db](https://github.com/Tencent/Hippy/commit/61a43db3662d0090c34db8f6d8db09ba49c8ff8e))
* **ios:** fix a potential crash ([6239592](https://github.com/Tencent/Hippy/commit/623959298ebb3a58ae14a77223095583e89bdcc6))
* **ios:** fix animated image refresh bug ([8d5e306](https://github.com/Tencent/Hippy/commit/8d5e306e467da1296fe4281cd7cbfe08c3c374ba))
* **ios:** fix animated images check ([eb85032](https://github.com/Tencent/Hippy/commit/eb85032506e1418d6b175b31a227ba653a4956b6))
* **ios:** fix border radius bug ([bbb971f](https://github.com/Tencent/Hippy/commit/bbb971f9271c87e1f9bc2b83951e2fb856a611ba))
* **ios:** fix box shadow propery ([e816c31](https://github.com/Tencent/Hippy/commit/e816c31fbe5524e03dac04d3188831f604136d55))
* **ios:** fix bugs that onInterceptTouchEvent not work ([d615374](https://github.com/Tencent/Hippy/commit/d615374c7e445961e2a299801fee8c45a46ed73e))
* **ios:** fix dev window height on iphoneX ([7e5df6e](https://github.com/Tencent/Hippy/commit/7e5df6ebbf4681a1a0922a2df43ecce8c3d1e200))
* **ios:** fix footer pull method name ([bef9a19](https://github.com/Tencent/Hippy/commit/bef9a197eb51e953b8cf890408549809673e384c))
* **ios:** fix HippyTiming crash ([08fae32](https://github.com/Tencent/Hippy/commit/08fae32f4f3f73c793e6cc6a18cfecf604870175))
* **ios:** fix imageload failed message ([6dfe123](https://github.com/Tencent/Hippy/commit/6dfe123de06b738bdd7f6ef9b08e5b1e08baf56c))
* **ios:** fix list item view type and onEndReach event not trigger ([46bad5d](https://github.com/Tencent/Hippy/commit/46bad5dd842eff897ec87b33ff526b704d2061dc))
* **ios:** fix measureInWindow bug ([fceb0e7](https://github.com/Tencent/Hippy/commit/fceb0e770ffddf395090c79a9b75949c4bd8035c))
* **ios:** fix measureInWindow method,add measureInAppWindow ([e66cab1](https://github.com/Tencent/Hippy/commit/e66cab125521535c9c709394cea7785cb0e5e6a2))
* **ios:** fix touch handler bugs ([d706657](https://github.com/Tencent/Hippy/commit/d7066570f9b69e73d3e5717984eb644e15061ac4))
* **ios:** fix UIFont constructor crash on iOS14 ([be1ce5d](https://github.com/Tencent/Hippy/commit/be1ce5d0fca41f35647804aa0a3d3a8d2ee54505))
* **ios:** fix websocket bug ([f45a9bb](https://github.com/Tencent/Hippy/commit/f45a9bba7bd0a92f0c733d596e37973af059eb6b))
* **ios:** fix websocket function ([987b08c](https://github.com/Tencent/Hippy/commit/987b08c729411ba47b24cca3feff4f0d00260e5b))
* **ios:** fix websocket module function.remove debug code ([8bb3b37](https://github.com/Tencent/Hippy/commit/8bb3b37c6677ffb7461a684e672ee23ae6fe56a4))
* **ios:** set default image need not update imageview ([53a1eb2](https://github.com/Tencent/Hippy/commit/53a1eb24e7f5f0246fcc07bdb1f12c3d67741f9b))
* **ios:** support default font family name ([b97ca96](https://github.com/Tencent/Hippy/commit/b97ca9642ae04286a28f90051af9598060c7c2de))
* **ios:** update props without shadowview ([52f8295](https://github.com/Tencent/Hippy/commit/52f829513638db331eb0108961fb15ff218aff01))
* **swiper:** fixed props passing ([3081d69](https://github.com/Tencent/Hippy/commit/3081d6999fe7ce7556798d41caaa5bdee5907fb3))
* **vue:** fixed remove style issue ([#329](https://github.com/Tencent/Hippy/issues/329)) ([33f2f7d](https://github.com/Tencent/Hippy/commit/33f2f7d3a1518e70471a060b930b3372d6b49c99))


### Features

* **android:** add cell exposure event support ([fd9c464](https://github.com/Tencent/Hippy/commit/fd9c46427f33887e4067750a48ed5bdf69d15018))
* **android:** add exposure event enabled control ([c2f6307](https://github.com/Tencent/Hippy/commit/c2f6307303911cab699734097028aeb8571aadbe))
* **android:** add listView event support 1 ([1e85d9d](https://github.com/Tencent/Hippy/commit/1e85d9de547c5dba83925825cbcefd3d7e9c7ce9))
* **android:** add listView event support 2 ([a3712b2](https://github.com/Tencent/Hippy/commit/a3712b2d9ca25aac114de458a13661a6b81333fd))
* **android:** add listView horizontal support ([cf6e439](https://github.com/Tencent/Hippy/commit/cf6e4396cbbb9aca270fd3aa31283dd0508b0ff2))
* **android:** add page-slider and list view direction prop support ([14ae0a6](https://github.com/Tencent/Hippy/commit/14ae0a6e2fba7b824456a26f4ec830074b0b8798))
* **android:** add page-slider and page support ([826369f](https://github.com/Tencent/Hippy/commit/826369f90d7883dbdebb667f79f22a5ea464cd87))
* **android:** add pullHeader and pullFooter event support ([eeaac37](https://github.com/Tencent/Hippy/commit/eeaac37b2f707de137e1fc4cc1ad462bb4b95134))
* **android:** add pullHeader and pullFooter view support ([f6e432f](https://github.com/Tencent/Hippy/commit/f6e432f828f239a59bac596f071a6ab32285057a))
* **android:** add tdk feature step 1 ([dbc60c4](https://github.com/Tencent/Hippy/commit/dbc60c4d673e31dfe2f0962ffdeef2fa31f510a4))
* **android:** add view hippymap tag support ([799305a](https://github.com/Tencent/Hippy/commit/799305ac3b61ecbe4b4de2f8ef77655ee5190725))
* **android:** optimize list view item exposure impl ([5e09690](https://github.com/Tencent/Hippy/commit/5e09690d43ff751da6208095b459f25ef056a65d))
* **android:** support box-shadow feature ([3dbbe85](https://github.com/Tencent/Hippy/commit/3dbbe85d74ea2ecad59acb7c83ce54f08e051aed))
* **core:** catch hippy-base exception ([#353](https://github.com/Tencent/Hippy/issues/353)) ([0601446](https://github.com/Tencent/Hippy/commit/0601446dc7a0da61c7c73ed1e86c3816fb960b0d))
* **core:** refactor core ([f996af3](https://github.com/Tencent/Hippy/commit/f996af33379f41eefb9a3864756eb1861f70bbf2))
* **hippy-react:** add new method measureInAppWindow ([e25bb67](https://github.com/Tencent/Hippy/commit/e25bb676942b89fbb57601d7c4ac2c9ce8ec175f))
* **hippy-react:** added PullHeader and PullFooter components support ([2fcdee9](https://github.com/Tencent/Hippy/commit/2fcdee9b3ef290f40a25321c978a0c232299b06a))
* **hippy-vue:** add new method measureInAppWindow ([e6348a2](https://github.com/Tencent/Hippy/commit/e6348a2fa31ea61fcfda66151c15830871f47ab6))
* **hippy-vue:** added pull-header and pull-footer components support ([3fbc862](https://github.com/Tencent/Hippy/commit/3fbc86230eef085fe1e33efc53c8507bf3598233))
* **hippy-vue:** added the callback execution before $mount in $start ([1a1cc3f](https://github.com/Tencent/Hippy/commit/1a1cc3fb5ee92a3dd704765bc628530f9f146c8b))
* **hippy-vue:** box-shadow style support ([0604461](https://github.com/Tencent/Hippy/commit/06044610f85f891d52d28439b3a48554c8db6487))
* **hippy-vue:** export parseColor api for HippyVue ([a354c94](https://github.com/Tencent/Hippy/commit/a354c94ede4542bb9111c030e088a70f617ca0c7))
* **ios:** add custom viewcontroller transition animation ([9931ca4](https://github.com/Tencent/Hippy/commit/9931ca42bec513bfc01c3106f24939800aca500d))
* **ios:** add image provider protocol ([#349](https://github.com/Tencent/Hippy/issues/349)) ([d7ff14f](https://github.com/Tencent/Hippy/commit/d7ff14ff1376c5d10bfeb37d99adcb259c761008))
* **ios:** add listitemview appear and disappear event ([dbdc70a](https://github.com/Tencent/Hippy/commit/dbdc70adbbaec4d84e94d18d8c956353588c388a))
* **ios:** add pull header and pull footer components ([ac79c90](https://github.com/Tencent/Hippy/commit/ac79c9018cfb80a71a99b234055021e221f3ecaf))
* **ios:** change hippyDeepCopyProtocol method name ([beb417e](https://github.com/Tencent/Hippy/commit/beb417e9db6a1079986494f6a7e814668cfe612f))
* **ios:** expose image method public ([18307b9](https://github.com/Tencent/Hippy/commit/18307b90523e54d45b565c438bbad3b5a1a1ce61))
* **ios:** expose some properties and methods for Modal component ([cd60af2](https://github.com/Tencent/Hippy/commit/cd60af221a442a6855ab44e90769c9ff1c1ee1c9))
* **ios:** fix viewpager error ([c0c7bcc](https://github.com/Tencent/Hippy/commit/c0c7bcc271d1ab5d75092fecb7119f13963d4766))
* **ios:** no exception thrown in release mode in HippyFatal method ([049f57e](https://github.com/Tencent/Hippy/commit/049f57e99f4826e70c3fef26e58760c78b9d38bd))
* 适配core代码，新增EngineMapper文件 ([d4487e2](https://github.com/Tencent/Hippy/commit/d4487e2b6200e0befd56bf8d66b2d62e33ad7365))
* **ios:** hippyImageView not support all animated image ([c864c34](https://github.com/Tencent/Hippy/commit/c864c343322f71c130f9168d6bc9542c97aaa2eb))
* **ios:** implemention of refresh method ([d237501](https://github.com/Tencent/Hippy/commit/d237501961e2a893c89ae711ee23ca945805525a))
* **ios:** optimize animated image logic ([c71e09d](https://github.com/Tencent/Hippy/commit/c71e09d90b8702a674bffad30cfcb539aaf5004a))
* **ios:** remove macro of scroll delegate method ([1ad5d26](https://github.com/Tencent/Hippy/commit/1ad5d26ef81ca672bec63f431f20535e56362797))
* **ios:** support auto spacing feature ([dfffe2b](https://github.com/Tencent/Hippy/commit/dfffe2b423a608997873ad862729e0ac09a9078a))



## [2.0.3](https://github.com/Tencent/Hippy/compare/2.0.2...2.0.3) (2020-04-23)


### Bug Fixes

* **android:** change style of font size invalid ([a538c24](https://github.com/Tencent/Hippy/commit/a538c24bec38790d6e1e832bfc57e97832af64dc))
* **android:** input can not auto scroll when reach max length ([a9f2355](https://github.com/Tencent/Hippy/commit/a9f23556c44dbe49c90003196cda0eb898f70757))
* **android:** input can not auto scroll when reach max length ([8b25757](https://github.com/Tencent/Hippy/commit/8b25757ab67e450c9a518c53feca0fac4107096a))
* **android:** update arm64 so and should compile alone ([ee65c8e](https://github.com/Tencent/Hippy/commit/ee65c8e743d4d8d72a7bcdf7d516b711e7c9df98))
* **core:** drop Object.entries() for lower iOS compatible ([a3aa0b8](https://github.com/Tencent/Hippy/commit/a3aa0b8514e15f84d590cf0667cb15de2db7ccbd))
* **hippy-react:** drop Object.entries() for lower iOS compatible ([d76b074](https://github.com/Tencent/Hippy/commit/d76b074b7ed2536422be6052c56165be83b341c2))
* **hippy-react-web:** scroll-view style should be called by formatWebS… ([#233](https://github.com/Tencent/Hippy/issues/233)) ([9db12a4](https://github.com/Tencent/Hippy/commit/9db12a4fff59908c48f5547ddeb6deba68903af8))
* **ios:** fix bug that textinput does not support chinese input ([230c6a6](https://github.com/Tencent/Hippy/commit/230c6a60bfd58574408d66837b6bac1764e4487e))
* **ios:** fix extra modules provider bug ([9ba10c9](https://github.com/Tencent/Hippy/commit/9ba10c97b6eb2dfcde0d7e86cc0048f02b8344fe))
* **ios:** fix some bugs ([ce76475](https://github.com/Tencent/Hippy/commit/ce76475bc2c2904000945ecdc73a8f9ffbead8d8))
* **ios:** fixed TextInput blur and focus event trigger when click ([61045d8](https://github.com/Tencent/Hippy/commit/61045d83dae20cf8969661b3fe91fc0329ecfc02))
* **ios:** fixed the value of _JSMethodName in HippyModuleMethod ([4d5fde8](https://github.com/Tencent/Hippy/commit/4d5fde8cce791bc929ed0be65e8ec5a99e71ac23))
* **ios:** reset animated image when reset image source ([9060cfc](https://github.com/Tencent/Hippy/commit/9060cfc54076bfab10a50bf9091a94cc8596cc08))
* **react-web:** annimation-set support opacity ([b29e92c](https://github.com/Tencent/Hippy/commit/b29e92cac95f444925a99dcae82cdf5bcbd47f2a))


### Features

* **hippy-react:** merge createNode operation ([#200](https://github.com/Tencent/Hippy/issues/200)) ([04d77a0](https://github.com/Tencent/Hippy/commit/04d77a074c5d43cbf4bfa0cc40c513167314addc))
* **hippy-react-web:** added default export for hippy-react web ([62cbdb0](https://github.com/Tencent/Hippy/commit/62cbdb0cb7d65c989439e1d7ffb0a5fa1143eddd))
* **hippy-vue:** make beforeStyleLoad hooks applied in runtime ([2fc49cf](https://github.com/Tencent/Hippy/commit/2fc49cf819c32038b780569a8d278a865e438703))
* **ios:** mount all custom objects at __HIPPYNATIVEGLOBAL__ ([9430138](https://github.com/Tencent/Hippy/commit/9430138ae6ad8d71f91f0089f78114ccc00bde85))
* **ios:** update the way custom  objects before execute JS ([e2ee31c](https://github.com/Tencent/Hippy/commit/e2ee31c7449a9b40c06a684b528765524a7dcada))
* **ios:** user can mount custom objects before execute JS ([0df5b43](https://github.com/Tencent/Hippy/commit/0df5b43a111e301635d81ba58ab7114d8a11b331))
* **react-demo:** add router ([c759cbe](https://github.com/Tencent/Hippy/commit/c759cbe400564ccaee239e84e8e52b82d58eaf89))
* **react-web:** support layout event ([fafa65c](https://github.com/Tencent/Hippy/commit/fafa65c2fc6f23cc717f35a163cdf4d7b43ff6a5))





## [2.0.2](https://github.com/Tencent/Hippy/compare/2.0.1...2.0.2) (2020-03-18)


### Bug Fixes

* **android:** compile problem ([df4398d](https://github.com/Tencent/Hippy/commit/df4398da08d3c1d0c67e23912d42d955335705b6))
* **android:** fix keyboard hiding when blur in endEditing after focus ([22e8602](https://github.com/Tencent/Hippy/commit/22e86021a2153b3c8249a3a82e825f8361a7ac1c))
* **android:** textinput focus and blur problem ([#161](https://github.com/Tencent/Hippy/issues/161)) ([44daa93](https://github.com/Tencent/Hippy/commit/44daa93ee9ba45aa3c3a41ff30c25d22f1ab4224))
* **android:** treat Parcelable[] as Bundle[] ([a2ffb28](https://github.com/Tencent/Hippy/commit/a2ffb2813f8744fdb15dcda13eb13b887259840d))
* **example:** split js bundle with webpack dllplugin ([c8ac36d](https://github.com/Tencent/Hippy/commit/c8ac36d081fd0f41d92d566576443febdf194c8f))
* **hippy-react:** callUIFunction supports passing  as targetNode ([f7c8391](https://github.com/Tencent/Hippy/commit/f7c83911622140db9f3f5ac9eba44aefe44cd4ce))
* **hippy-react:** change the NODE_ENV to 'development' ([2585bc5](https://github.com/Tencent/Hippy/commit/2585bc5f3f28816c7ff1f4bdf210011508e7d2e8))
* **hippy-react:** text component text repeated rendering ([96e278d](https://github.com/Tencent/Hippy/commit/96e278d33c3bd18cdec6c839cc5454c5c3479224))
* **hippy-react:** text nest ([da5ca3b](https://github.com/Tencent/Hippy/commit/da5ca3b45cad28659bf0c6bacc90a1a64658d906))
* **hippy-react:** text-input style ([a9fa8d1](https://github.com/Tencent/Hippy/commit/a9fa8d1e896c5d5ee62c8ef09d6b32de85124618))
* **hippy-react:** ui operation merge ([9b4f77d](https://github.com/Tencent/Hippy/commit/9b4f77dfa54a0747efccec3beee6db170c3848cd))
* **hippy-vue:** add TypeSelector test ([38f08ef](https://github.com/Tencent/Hippy/commit/38f08ef4180fa08781492ea80f3dcfbc3ad37036))
* **hippy-vue:** fix css selectors TypeSelector match ([de98e8a](https://github.com/Tencent/Hippy/commit/de98e8a560ee771d4f10fcbd3642afccfc92e70e))
* **hippy-vue:** fix wrong preSibling of childNode's nexSibling ([6e76d5e](https://github.com/Tencent/Hippy/commit/6e76d5e1ead0a1d359ab0ec3d25d94c2ffed792b))
* **hippy-vue:** fixed css selectors TypeSelector match ([adddcea](https://github.com/Tencent/Hippy/commit/adddcea319c816d49deed0b2893e6ee82c203648))
* **ios:** fix crash caused by incorrect creation of UIFont ([0764fdc](https://github.com/Tencent/Hippy/commit/0764fdc5b531edb9ac868909194ecee79c44073a))
* **ios:** fix issue of invalidation of customized font ([3c632dc](https://github.com/Tencent/Hippy/commit/3c632dca651b91e36ef92219d0c7b6a38a8a54b8))
* **ios:** fix return type of TextInput.getValue method ([5db3dac](https://github.com/Tencent/Hippy/commit/5db3dac6a69973196b42d90c7eed0a745fb5a130))
* **ios:** fix some bugs ([a329d40](https://github.com/Tencent/Hippy/commit/a329d4060ed78dddd2dfe72dea5756c94ba14c1c))
* **react-web:** image callback error ([1776634](https://github.com/Tencent/Hippy/commit/1776634552356d32dcb51e2e98ce1e797788dd3c))
* **react-web:** listView not work in dev mode ([44a539f](https://github.com/Tencent/Hippy/commit/44a539fc978e70294b0f30707912aa80dc6652d3))
* **react-web:** updateAnimation support zero ([0ec1dc8](https://github.com/Tencent/Hippy/commit/0ec1dc87aee14660954799c4a89a6d4584a4afe9))
* **vue:** setStyle px unit determine ([8379d53](https://github.com/Tencent/Hippy/commit/8379d53e4b275dda8243b1869eded475a0113373))


### Features

* **android:** add bintray jcenter upload support ([11900b0](https://github.com/Tencent/Hippy/commit/11900b0f9330818c9dfc99d813bfef7d301683cf))
* **ios:** add shadow feature for HippyView ([f111951](https://github.com/Tencent/Hippy/commit/f111951baedc153a229a251fa8fb7bd27f1b52eb))
* **react-web:** support multiple instance ([c5fb93b](https://github.com/Tencent/Hippy/commit/c5fb93be6e40f14f731a6f5dd750254bc049838d))
* **react-web:** text support clip mode ([516fa98](https://github.com/Tencent/Hippy/commit/516fa988c6e616c3a49790d83b06ff4d6ff6d9fd))
* **vue:** added disabled props to input tag ([47facd4](https://github.com/Tencent/Hippy/commit/47facd4584b1361a760fd62162b0d4f9384ee673))
* **vue-native-components:** added stateChanged event handler to swiper ([71760cc](https://github.com/Tencent/Hippy/commit/71760cccf15a819c644efaa1e084a96fcc4e856e))
