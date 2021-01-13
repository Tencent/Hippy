package com.tencent.mtt.hippy.dom.node;

import static com.tencent.mtt.hippy.views.wormhole.HippyWormholeManager.WORMHOLE_PARAMS;
import static com.tencent.mtt.hippy.views.wormhole.HippyWormholeManager.WORMHOLE_ROOT_TAG;
import static com.tencent.mtt.hippy.views.wormhole.HippyWormholeManager.WORMHOLE_WORMHOLE_ID;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.views.wormhole.HippyWormholeManager;
import org.json.JSONArray;

public class TKDWormholeNode extends StyleNode {
  private final boolean mIsVirtual;
  private String mWormholeId;
  private int mRootId;

  public TKDWormholeNode(boolean isVirtual, String wormholeId, int rootId) {
    this.mIsVirtual = isVirtual;
    this.mWormholeId = wormholeId;
    this.mRootId = rootId;
  }

  public boolean isVirtual() {
    return mIsVirtual;
  }

  @Override
  public void setProps(HippyMap props) {
    super.setProps(props);
    props.pushInt(WORMHOLE_ROOT_TAG, mRootId);
    HippyMap paramsMap = props.getMap(WORMHOLE_PARAMS);
    if (paramsMap != null) {
      paramsMap.pushString(WORMHOLE_WORMHOLE_ID, mWormholeId);
      HippyWormholeManager.getInstance().onTkdWormholeNodeSetProps(paramsMap, mWormholeId, getId(), mRootId);
    }
  }

  public String getWormholeId() {
    return mWormholeId;
  }
}
