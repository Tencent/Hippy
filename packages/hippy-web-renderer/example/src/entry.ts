import { HippyCallBack, View, HippyWebEngine, HippyWebModule } from '../../src';
import { SocialMockData } from './mockData';

class CampCommonModule extends HippyWebModule {
  public name = 'camp_common_ability_module';

  public getSwScale(callBack: HippyCallBack) {
    callBack.resolve({ swScale: 1 })
  }
}

class CampHippyNet extends HippyWebModule {
  public name = 'camp_hippy_net';

  public post(isTrpc, path, urlParams, requestData, callBack: HippyCallBack) {
    if (SocialMockData.net[path]) {
      setTimeout(() => {
        callBack.resolve(SocialMockData.net[path]([isTrpc, path, urlParams, requestData]));

      }, 100);
    }
  }
}

class CampPageView extends View {

}

HippyWebEngine.create({
  modules: {
    CampCommonModule,
    CampHippyNet
  },
  components: {
    CampPageView
  }
});
