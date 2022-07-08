package com.tencent.renderer.tdf.embed;

import android.content.Context;
import android.view.View;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.tdf.embed.EmbeddedView;
import com.tencent.tdf.embed.EmbeddedViewFactory;

import java.util.Map;

public class TDFEmbeddedViewFactoryImpl extends EmbeddedViewFactory {

    private final String PROPS_KEY = "props";

    private int mRootId;
    private ControllerManager mControllerManager;
    private String mViewType;

    public TDFEmbeddedViewFactoryImpl(int rootId, ControllerManager controllerManager, String viewType) {
        this.mRootId = rootId;
        this.mControllerManager = controllerManager;
        this.mViewType = viewType;
    }

    @Override
    public EmbeddedView create(Context context, int viewId, Map<String, String> propsMap) {
        assert (!mViewType.isEmpty());
        View view = mControllerManager.createView(mRootId, viewId, mViewType, parsePropsStringToMap(propsMap));
        return new TDFEmbeddedViewWrapper(mRootId, mControllerManager, view, viewId, mViewType);
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
