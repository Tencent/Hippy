import { HippyCallBack, View, HippyWebEngine, HippyWebModule } from '../../src';
const AccountInfoData = {"birthday":1642003200,"openId":"oFhrwsw6FiWg9CbbBJ30pRu8kQWc","userPhone":"","icon":"http:\/\/p.qlogo.cn\/yoyo_avatar\/0\/ol7y7uI5d-QoO72gJSaZEvsEU2r8\/76","type":2,"pfKey":"pfkey","sig":"eJxlkE1vgkAURff8CsK6aeY9HMt05xBpif1CFHU1oTLKiMIUp6Bp*t-bYpOSdH1O7s29H5Zt287sIb5O1*vqvTTCnLV07FvbIc7VH9RaZSI1wq2zf1CetKqlSDdG1h1EypCQvqIyWRq1Ub-CgIGLCHTYU45ZIbqazoDBdwCl4EFfUdsOPo5Xfhj5ya7hPNohb9pkslxMTbFf1GfOKr*VkZlRQ11twsN*Mm-DfPTCX4MiPYHXkvgNq-wZ7rbeU54sEZVeeeMbSoIyCpDF971Kow6XN2BIKXrAGOvRRtZHVZWX0QQoADDys9z6tL4ASJZclw__","TYPE_NOT_INSTALL_WEIXIN":3,"forceBindPhone":0,"roleId":"275534465","sex":1,"accessToken":"58_kl6Abbeo1EDJkQTzNxTS0pi-srZBJVKFYU1xy5_xg53n-38HNRh-LKYvZ0dvWKWRxHMz9wnOUuiWkuNypnG0M25G19Aj8pIPpIdFpHemMK4","userId":"491322156","userToken":"mm4dbrY9","pf":"wechat_wx-2001-android-sample","TYPE_QQ":1,"commId":"oFhrwsw6FiWg9CbbBJ30pRu8kQWc","largeIcon":"http:\/\/p.qlogo.cn\/yoyo_avatar\/0\/ol7y7uI5d-QoO72gJSaZEvsEU2r8\/190","name":"布鲁布鲁WN","snsName":"布鲁布鲁","TYPE_WEIXIN":2,"forceChangeName":0,"refreshToken":"58_YYiboJNbVMuNjY7Mx8pD5asRQGLsRKlLLHU9HhZku_sp1d3ekXrTYSEa6lfwe20P52CITlA-3PjWd_uKDZNmFj2KOSHttfXyr8bTpK6yqaY"}
const DeviceInfoData = {"safeAreaBottom":0};
const NetRoleInfoData = {"error_msg":"","data":{"userInfo":{"platformUser":{"closeOnlineStatus":false,"closeOnlineNotify":false,"loginType":"","sex":1,"lt":1599034329,"lu":1655792160,"avatar":"http:\/\/p.qlogo.cn\/yoyo_avatar\/0\/ol7y7uI5d-QoO72gJSaZEvsEU2r8\/76","userId":"491322156","appOnline":1,"vipLevel":0,"userLevel":"30","nickname":"布鲁布鲁WN","cSystem":"","uScore":793,"closeOffLineTime":false},"confirmInfo":{"userdesc":"","userconfirm":0}},"mainRoleInfo":{"battleId":"","chartTime":1650888446,"serverId":3284,"shortRoleJobName":"星耀IV","extInfo":"[1544,89,10,103,179,163,124,186,16,3,1376,2579,1,1,0,0,93,166,1281,2407,0,0,0,1,5,4]","gameOpenId":"owanlsuaK0935nkCesgPf14Jq5EU","chessDoubleMmr":1200,"areaName":"微信安卓","groupServerId":0,"roleIcon":"https:\/\/wx.qlogo.cn\/mmhead\/PiajxSqBRaEJI5fsBlWosSdA47iaW2kKjhgcicyt5Oiaa5urW9dSicQBPeA\/96","isCommon":1,"onlineTime":1655792161,"gameOnline":0,"offlineTime":1655787475,"gameId":20001,"receive":1,"roleJobIcon":"https:\/\/camp.qq.com\/battle\/smoba\/roleJobIcon\/23.png","roleId":"275534465","chessSingleMmr":1400,"isSyncFriends":1,"gameLevel":30,"mainUin":"oFhrwsw6FiWg9CbbBJ30pRu8kQWc","isAdd":1,"userId":"491322156","gameRoleId":"1982413934","isHidden":0,"isVest":0,"areaId":3,"gourpId":"0","roleJobName":"至尊星耀IV","roleJob":23,"topStatus":0,"roleName":"爸爸出现","status":1,"hideMatch":1}},"status":0};
const MedalData = {"error_msg":"","data":{"unlockList":[{"unlock":1,"level":0,"topId":30110,"pubTime":"1631064444","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/2a13ac4b354779428a49344eaccca1a9.png","pid":0,"rules":[],"title":"区级荣耀","type":3,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/beaa78bf2d4d74c814a3047fb305d222.png","quality":2,"score":"0","onTime":"1612001329","sourceDesc":"达成过区服称号","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/2a13ac4b354779428a49344eaccca1a9.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/d5b8fdfd8ee2d008ebf231b99f96ec24.png","unlockTime":"1634011347","linkUrl":"smobagamehelper:\/\/postdetail?postid=784648179","guideDesc":"","giftBag":"","offTime":"1894435722","medalId":30110,"desc":"区县里的排行榜上，有在下的名字！"},{"unlock":1,"level":0,"topId":20110,"pubTime":"1617075334","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e22eee0f2e03e4298e069353384c723f.png","pid":0,"rules":[],"title":"两年同行","type":1,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e1a247bde8b21d066694235eeda21209.png","quality":2,"score":"0","onTime":"1611646686","sourceDesc":"参与两周年限时活动","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e22eee0f2e03e4298e069353384c723f.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/6b4b7edd2ab7aea8816136308f6a92a2.png","unlockTime":"1611943534","linkUrl":"smobagamehelper:\/\/web?url=https%3A%2F%2Fpvp.qq.com%2Fcp%2Fa20210125wzyd%2Findex_wqg.html","guideDesc":"活动已结束，暂无获取途径","giftBag":"","offTime":"1612510687","medalId":20110,"desc":"两年营地，相伴王者\n王者营地两周年庆限定勋章"}],"tabList":[{"score":0,"medalType":0,"name":"全部"},{"score":0,"medalType":1,"name":"限定勋章"},{"score":0,"medalType":2,"name":"成长勋章"},{"score":0,"medalType":3,"name":"身份勋章"}],"count":{"unlock":2,"lock":11},"lockedList":[{"unlock":0,"level":0,"topId":20210,"pubTime":"1655256735","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/730c15244735049171cf8bb8578bcec4.png","pid":0,"rules":[],"title":"感谢有你","type":1,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/411be57a1ca201fdbb3f0985b0d6f694.png","quality":3,"score":"0","onTime":"1651654631","sourceDesc":"五五朋友节活动产出","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/730c15244735049171cf8bb8578bcec4.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/2795324dd45e2e99eceb0f429d81e722.png","unlockTime":"0","linkUrl":"","guideDesc":"暂无产出渠道，请关注后续活动","giftBag":"","offTime":"1652259454","medalId":20210,"desc":"听我说，谢谢你，\n因为有你，峡谷更美丽！"},{"unlock":0,"level":0,"topId":20100,"pubTime":"1652259639","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/1135aefb7cf21d0a37a4fc4591c3ea97.png","pid":0,"rules":[],"title":"聚在一起","type":1,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/d905dbe2440cceb28be5f68eb2990734.png","quality":2,"score":"0","onTime":"1640361600","sourceDesc":"参与一周年限时活动","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/1135aefb7cf21d0a37a4fc4591c3ea97.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/28ad0a2eadd1fc448712c96bf6f32b85.png","unlockTime":"0","linkUrl":"smobagamehelper:\/\/web?url=https%3A%2F%2Fpvp.qq.com%2Fcp%2Fa20211216znq%2Findex.html","guideDesc":"活动已结束，暂无获取途径","giftBag":"","offTime":"1641225599","medalId":20100,"desc":"团在王者，聚在营地\n王者营地一周年庆限定勋章"},{"unlock":0,"level":0,"topId":20120,"pubTime":"1652259650","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/f6058d608a4382cdf06615aa3fad50a1.png","pid":0,"rules":[],"title":"三载相伴","type":1,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/d905dbe2440cceb28be5f68eb2990734.png","quality":2,"score":"0","onTime":"1640361600","sourceDesc":"参与三周年限时活动","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/f6058d608a4382cdf06615aa3fad50a1.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/78acfcbe071df58a97f75053a1db854c.png","unlockTime":"0","linkUrl":"smobagamehelper:\/\/web?url=https%3A%2F%2Fpvp.qq.com%2Fcp%2Fa20211216znq%2Findex.html","guideDesc":"活动已结束，暂无获取途径","giftBag":"","offTime":"1641225599","medalId":20120,"desc":"三载相伴，共聚营地\n王者营地三周年庆限定勋章"},{"unlock":0,"level":0,"topId":30150,"pubTime":"1631064360","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e87903e0b162ce2ceab61d22b722a6a6.png","pid":0,"rules":[],"title":"国服荣耀","type":3,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/42e35376fe82f2a8f6b0d5a3c67ec959.png","quality":3,"score":"0","onTime":"1612001597","sourceDesc":"达成过国服称号","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e87903e0b162ce2ceab61d22b722a6a6.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e4a1a0063f6ff855c5776a00669e57d5.png","unlockTime":"0","linkUrl":"smobagamehelper:\/\/postdetail?postid=784648179","guideDesc":"","giftBag":"","offTime":"1894443155","medalId":30150,"desc":"在全国排的上名号的人没几个，本人是其中之一！"},{"unlock":0,"level":0,"topId":30140,"pubTime":"1631064452","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/450c73cdd1add430355ecdfe80b822b7.png","pid":0,"rules":[],"title":"全国最强","type":3,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/1782ab5b911e25b658ab86eb53fbb351.png","quality":3,"score":"1","onTime":"1612001543","sourceDesc":"达成过全国最强","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/450c73cdd1add430355ecdfe80b822b7.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/ec544f4a4c8b6fbc522c64a6ddecefb0.png","unlockTime":"0","linkUrl":"smobagamehelper:\/\/postdetail?postid=784648179","guideDesc":"","giftBag":"","offTime":"1894443100","medalId":30140,"desc":"登顶！誉霸全国，孤独求败！"},{"unlock":0,"level":0,"topId":30130,"pubTime":"1631064449","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/17edc6100119d86ecf339e48a5b0c16e.png","pid":0,"rules":[],"title":"省级荣耀","type":3,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/beaa78bf2d4d74c814a3047fb305d222.png","quality":2,"score":"0","onTime":"1612001479","sourceDesc":"达成过省服称号","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/17edc6100119d86ecf339e48a5b0c16e.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/154868ebc49d6f2d1530a00a67701d81.png","unlockTime":"0","linkUrl":"smobagamehelper:\/\/postdetail?postid=784648179","guideDesc":"","giftBag":"","offTime":"1894443020","medalId":30130,"desc":"在本省，提我的名字，谁人不知？"},{"unlock":0,"level":0,"topId":30120,"pubTime":"1631064447","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/825de5f8a59ff3642dc304e1bea6ebc3.png","pid":0,"rules":[],"title":"市级荣耀","type":3,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/beaa78bf2d4d74c814a3047fb305d222.png","quality":2,"score":"0","onTime":"1612001405","sourceDesc":"达成过市服称号","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/825de5f8a59ff3642dc304e1bea6ebc3.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/557d7d87d061ca6dd8d1cbd514c9224b.png","unlockTime":"0","linkUrl":"smobagamehelper:\/\/postdetail?postid=784648179","guideDesc":"","giftBag":"","offTime":"1894442954","medalId":30120,"desc":"我可是市里响当当的人物！"},{"unlock":0,"level":0,"topId":10131,"pubTime":"1617075289","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/a0289b8bc496393cf52466e9f399a327.png","pid":0,"rules":[],"title":"百粉新星","type":2,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/3ded8d592c4bb76f9ab4ea93efcaa3b4.png","quality":1,"score":"0","onTime":"1611993539","sourceDesc":"粉丝数","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/a0289b8bc496393cf52466e9f399a327.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/cda95c57c9f9cefdfc52778978c05807.png","unlockTime":"0","linkUrl":"","guideDesc":"用你的优秀创作和个人魅力吸引更多粉丝吧~","giftBag":"","offTime":"1893483144","medalId":10131,"desc":"在营地收获100粉丝，开启你的星光之路！"},{"unlock":0,"level":0,"topId":11011,"pubTime":"1627005428","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/8755af1afe14e0219a4e480a3440a67b.png","pid":0,"rules":[],"title":"积跬步","type":2,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/77e71591fdefe9776735168113e6f6c2.png","quality":1,"score":"0","onTime":"1611830779","sourceDesc":"营地连登天数","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/8755af1afe14e0219a4e480a3440a67b.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/b5dbae4e9caeb25de09018645d8ccf9a.png","unlockTime":"0","linkUrl":"","guideDesc":"记得每日登录营地，连续50天即可解锁。","giftBag":"","offTime":"1893485025","medalId":11011,"desc":"连续登录营地50天，不积跬步何以至千里？"},{"unlock":0,"level":0,"topId":10111,"pubTime":"1617075311","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/b810931acb7054935c507782d74f4680.png","pid":0,"rules":[],"title":"活动先锋","type":2,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/4342f9e41e0bd9a6d7e070ec9d846260.png","quality":1,"score":"0","onTime":"1611830307","sourceDesc":"营地任务完成","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/b810931acb7054935c507782d74f4680.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/49bd849617804c5bb9e6b1dba2abfdf4.png","unlockTime":"0","linkUrl":"","guideDesc":"完成66个营地任务即可解锁！","giftBag":"","offTime":"1893482385","medalId":10111,"desc":"完成66个营地任务，成为营地活动先锋！"},{"unlock":0,"level":0,"topId":10121,"pubTime":"1617075299","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/0b771475fa04709c24631ffcad97ceb6.png","pid":0,"rules":[],"title":"习惯初成","type":2,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/aa703055dde7d3bf51017f17d65245a4.png","quality":1,"score":"0","onTime":"1611582529","sourceDesc":"圈子最高连签天数","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/0b771475fa04709c24631ffcad97ceb6.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/966bf02f57bd61293f37720004581e97.png","unlockTime":"0","linkUrl":"","guideDesc":"在任意圈子最高连续签到21天即可获得！","giftBag":"","offTime":"1893482759","medalId":10121,"desc":"圈子连签21天，三周，帮助你养成一个习惯。"}],"redDot":[]},"status":0};
const MedalSkinData = {"error_msg":"","data":[{"unlock":1,"level":0,"topId":30110,"pubTime":"1631064444","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/2a13ac4b354779428a49344eaccca1a9.png","pid":0,"rules":[],"title":"区级荣耀","type":3,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/beaa78bf2d4d74c814a3047fb305d222.png","quality":2,"score":"0","onTime":"1612001329","sourceDesc":"达成过区服称号","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/2a13ac4b354779428a49344eaccca1a9.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/d5b8fdfd8ee2d008ebf231b99f96ec24.png","unlockTime":"1634011347","linkUrl":"smobagamehelper:\/\/postdetail?postid=784648179","guideDesc":"","giftBag":"","offTime":"1894435722","medalId":30110,"desc":"区县里的排行榜上，有在下的名字！"},{"unlock":1,"level":0,"topId":20110,"pubTime":"1617075334","icon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e22eee0f2e03e4298e069353384c723f.png","pid":0,"rules":[],"title":"两年同行","type":1,"textIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e1a247bde8b21d066694235eeda21209.png","quality":2,"score":"0","onTime":"1611646686","sourceDesc":"参与两周年限时活动","bgIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/e22eee0f2e03e4298e069353384c723f.png","lockedIcon":"https:\/\/wzzsmanager-1255653016.file.myqcloud.com\/common-image\/6b4b7edd2ab7aea8816136308f6a92a2.png","unlockTime":"1611943534","linkUrl":"smobagamehelper:\/\/web?url=https%3A%2F%2Fpvp.qq.com%2Fcp%2Fa20210125wzyd%2Findex_wqg.html","guideDesc":"活动已结束，暂无获取途径","giftBag":"","offTime":"1612510687","medalId":20110,"desc":"两年营地，相伴王者\n王者营地两周年庆限定勋章"}],"status":0};
class CustomModule extends HippyWebModule {
  public name = 'camp_common_ability_module'; //module name

  public getSwScale(callBack: HippyCallBack) {
    callBack.resolve({ swScale: 1 })
  }
  public setStatusBarColor(callBack: HippyCallBack) {
  }
  public getDeviceInfo(callBack: HippyCallBack) {
    callBack.resolve(DeviceInfoData);
  }
}

class CustomModule3 extends HippyWebModule {
  public name = 'camp_account_module'; //module name

  public getCurrentAccount(callBack: HippyCallBack) {
    callBack.resolve(AccountInfoData);
  }
}
class CustomModule2 extends HippyWebModule {
  public name = 'camp_hippy_net'; //module name

  public post(isTrpc, path, urlParams, requestData, callBack: HippyCallBack) {
    switch (path)
    {
      case '/user/getuserroleinfo':
        callBack.resolve(NetRoleInfoData);
        break;
      case '/medal/list':
        callBack.resolve(MedalData);
        break;
      case '/medal/skidding':
        callBack.resolve(MedalSkinData);
        break;
    }
  }
}
class CustomView extends View {

}

class PAGView extends View {

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
    CustomModule3,
    DemoTurboModule
  },
  components: {
    CampPageView: CustomView,
    NativePagView:PAGView
  }
});
