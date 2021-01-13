package com.tencent.mtt.hippy.views.wormhole;

import android.content.Context;

import com.tencent.mtt.hippy.views.view.HippyViewGroup;

public class HippySessionView extends HippyViewGroup {
  private int mRootId = -1;

  public HippySessionView(Context context) {
    super(context);
  }

  public int getRootId() {
    return mRootId;
  }

  public void setRootId(int id) {
    mRootId = id;
  }

}

