package com.tencent.mtt.hippy.views.wormhole;

import android.content.Context;
import android.view.View;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

@HippyController(name = "WormholeContainer")
public class HippyWormholeContainerController extends HippyViewController<HippyWormholeContainer> {

  @Override
  protected View createViewImpl(Context context) {
    return new HippyWormholeContainer(context);
  }

  @Override
  protected View createViewImpl(final Context context, HippyMap iniProps) {
    HippyWormholeContainer wormholeContainer = new HippyWormholeContainer(context);
    return wormholeContainer;
  }

}

