package com.tencent.mtt.hippy.views.wormhole;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;

public class HippyWormholeView extends HippyViewGroup {
  private String mWormholeId;

  public HippyWormholeView(Context context) {
    super(context);
  }

  public void setWormholeId(String id) {
    mWormholeId = id;
  }

  public String getWormholeId() {
    return mWormholeId;
  }

}
