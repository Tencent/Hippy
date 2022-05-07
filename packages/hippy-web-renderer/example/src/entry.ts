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

class DemoTurboModule extends HippyWebModule {
  name = 'demoTurbo';
  getNum(num: number) {
    return num;
  }
  getString(info: string) {
    return "demoTurbo" + ":" + info;
  }
  getBoolean(b: boolean) {
    return b;
  }
  getMap(map: Map<any, any>) {
    return map;
  }
  getObject(obj: object) {
    return obj;
  }
  getArray(array: any[]) {
    return array;
  }
  getMapRef() {
    return {};
  }
  nativeWithPromise(info: string, promise: typeof Promise) {
    return promise.resolve("resolve from demoTurbo: " + info);
  }
  getTurboConfig() {
    return {
      setInfo: () => {},
      getInfo: () => {}
    }
  }
  printTurboConfig() {

  }
}

HippyWebEngine.create({
  modules: {
    CampCommonModule: CustomModule,
    CampHippyNet: CustomModule2,
    DemoTurboModule
  },
  components: {
    CampPageView: CustomView
  }
});
