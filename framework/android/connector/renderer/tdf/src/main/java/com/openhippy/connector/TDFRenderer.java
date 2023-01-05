package com.openhippy.connector;

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.RenderProxy;

@SuppressWarnings("JavaJniMissingFunction")
public class TDFRenderer extends RenderConnector {

    private int mInstanceId;

    @Override public RenderProxy initRenderProxy() {
        mInstanceId = createTDFRenderManager(PixelUtil.getDensity());
        return new com.tencent.renderer.TDFRenderer(mInstanceId);
    }

    @Override public void attachToDom(@NonNull Connector domConnector) {
        attachToDom(mInstanceId, domConnector.getInstanceId());
    }

    @Override public int getInstanceId() {
        return mInstanceId;
    }

    @Override public void destroy() {
        destroyTDFRenderManager(mInstanceId);
    }

    /**
     * Create native (C++) render manager instance.
     *
     * @return the unique id of native (C++) render manager
     */
    private native int createTDFRenderManager(float j_density);

    /**
     * Destroy native (C++) render manager instance.
     */
    private native void destroyTDFRenderManager(int instanceId);

    /**
     * Attach DomManager to native (C++) render manager instance
     */
    private native void attachToDom(int instanceId, int domId);

}
