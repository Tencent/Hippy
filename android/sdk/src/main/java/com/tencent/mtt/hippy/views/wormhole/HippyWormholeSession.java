package com.tencent.mtt.hippy.views.wormhole;

import android.content.Context;
import android.view.View;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

@HippyController(name = "WormholeSession")
public class HippyWormholeSession extends HippyViewController<HippySessionView> {

  @Override
  protected View createViewImpl(Context context) {
    return new HippySessionView(context);
  }

  @Override
  protected View createViewImpl(final Context context, HippyMap iniProps) {
    HippySessionView hippySessionView = new HippySessionView(context);
    HippyWormholeManager.getInstance().onCreateSessionView(hippySessionView, iniProps);
    return hippySessionView;
  }

  @Override
  public void onViewDestroy(HippySessionView sessionView) {
    HippyWormholeManager.getInstance().onSessionViewDestroy(sessionView);
  }
}
