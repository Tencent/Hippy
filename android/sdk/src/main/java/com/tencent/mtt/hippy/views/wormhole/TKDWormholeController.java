package com.tencent.mtt.hippy.views.wormhole;

import android.content.Context;
import android.view.View;

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.StyleNode;
import com.tencent.mtt.hippy.dom.node.TKDWormholeNode;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;

@HippyController(name = "TKDWormhole")
public class TKDWormholeController extends HippyViewController<TKDWormholeView> {
  //private HippyWormholeProxy mWormholeProxy = HippyWormholeManager.getInstance();

  @Override
  protected View createViewImpl(final Context context) {
    return new TKDWormholeView(context);
  }

  @Override
  protected View createViewImpl(final Context context, HippyMap initProps) {
    TKDWormholeView tkdWormholeView = new TKDWormholeView(context);
    String wormholeId = HippyWormholeManager.getInstance().getWormholeIdFromProps(initProps);
    int rootId = HippyWormholeManager.getInstance().getRootIdFromProps(initProps);
    tkdWormholeView.setWormholeId(wormholeId);
    tkdWormholeView.setRootId(rootId);
    HippyWormholeManager.getInstance().onCreateTKDWormholeView(tkdWormholeView, wormholeId);
    return tkdWormholeView;
  }

  @Override
  protected StyleNode createNode(boolean virtual, int rootId) {
    HippyWormholeManager manager = HippyWormholeManager.getInstance();
    String wormholeId = manager.generateWormholeId();
    return new TKDWormholeNode(virtual, wormholeId, rootId);
  }

  @Override
  public void onViewDestroy(TKDWormholeView tkdWormHoleView) {
    HippyWormholeManager.getInstance().onTKDWormholeViewDestroy(tkdWormHoleView);
  }

  @Override
  public void dispatchFunction(TKDWormholeView view, String functionName, HippyArray dataArray) {
    super.dispatchFunction(view, functionName, dataArray);
    switch (functionName) {
      case HippyWormholeManager.FUNCTION_SENDEVENT_TO_WORMHOLEVIEW: {
        if (view != null && view.getChildCount() > 0) {
          View child = view.getChildAt(0);
          if (child != null && child instanceof HippyWormholeView) {
            //前端约定一个tkdWormhole下面只能有一个wormhole
            HippyViewEvent event = new HippyViewEvent(HippyWormholeManager.FUNCTION_ONCUSTOMEVENT);
            event.send(child, dataArray);
          }
        }
        break;
      }
    }
  }

}
