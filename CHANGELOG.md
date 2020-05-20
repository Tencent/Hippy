# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
