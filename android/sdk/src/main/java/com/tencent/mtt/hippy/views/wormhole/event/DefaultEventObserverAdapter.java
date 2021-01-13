package com.tencent.mtt.hippy.views.wormhole.event;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.views.wormhole.HippyWormholeManager;

public class DefaultEventObserverAdapter implements HippyEventObserverAdapter {
  @Override
  public void handleMessage(HippyMap data) {
    HippyWormholeManager.getInstance().sendMessageToWormhole(data);
  }
}
