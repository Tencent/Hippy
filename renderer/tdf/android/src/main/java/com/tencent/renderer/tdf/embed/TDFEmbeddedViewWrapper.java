package com.tencent.renderer.tdf.embed;

import android.view.View;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.tdf.embed.EmbeddedView;

import java.util.Map;

public class TDFEmbeddedViewWrapper implements EmbeddedView {

    private final String PROPS_KEY = "props"; // 和 C++ 侧约定好通过这个 key 传递组件属性

    private View mView;
    private int mViewID;
    private int mRootId;
    private String mViewType;
    private ControllerManager mControllerManager;


    public TDFEmbeddedViewWrapper(int rootId, ControllerManager controllerManager, View view, int viewID, String viewType) {
        this.mRootId = rootId;
        this.mView = view;
        this.mViewType = viewType;
        this.mControllerManager = controllerManager;
        this.mViewID = viewID;
    }

    @Override
    public View getView() {
        return mView;
    }

    @Override
    public void dispose() {
    }

    @Override
    public void updateProps(Map<String, String> propsMap) {
        EmbeddedView.super.updateProps(propsMap);
        mControllerManager.updateView(mRootId, mViewID, mViewType, parsePropsStringToMap(propsMap), null);
    }

    private Map<String, Object> parsePropsStringToMap(Map<String, String> propsMap) {
        String jsonStr = propsMap.get(PROPS_KEY);
        Map<String, Object> map = ArgumentUtils.parseToMap(jsonStr).getInternalMap();

        for (String key : map.keySet()) {
            Object value = map.get(key);
            if (value != null && value.getClass() == HippyMap.class) {
                map.put(key, ((HippyMap) value).getInternalMap());
            }
        }
        return map;
    }
}
