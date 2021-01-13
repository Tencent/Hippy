package com.tencent.mtt.hippy.views.wormhole.event;

import com.tencent.mtt.hippy.common.HippyMap;

public interface HippyEventObserverAdapter {
  void handleMessage(HippyMap data);
}
