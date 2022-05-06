import { HippyCallBack, View, HippyWebEngine, HippyWebModule } from '../../src';

class CustomModule extends HippyWebModule {
  public name = 'camp_common_ability_module'; //module name

  public getSwScale(callBack: HippyCallBack) {
    callBack.resolve({ swScale: 1 })
  }
}

class CustomModule2 extends HippyWebModule {
  public name = 'camp_hippy_net'; //module name

  public post(isTrpc, path, urlParams, requestData, callBack: HippyCallBack) {
    //TODO implement method
  }
}

class CustomView extends View {

}

HippyWebEngine.create({
  modules: {
    CampCommonModule: CustomModule,
    CampHippyNet: CustomModule2
  },
  components: {
    CampPageView: CustomView
  }
});
