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

(async () => {
  const engine = HippyWebEngine.create({
    modules: [
      CampCommonModule,
      CampHippyNet
    ],
    components: [
      CampPageView
    ]
  });

  await engine.load([
    'http://localhost:38989/index.bundle?platform=android&dev=1&hot=1&minify=0',
  ]);

  engine.start({
    id: 'test-app',
    name: 'social',
    params: { path: '/gallery' }
  });

})();
