# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
