package com.tencent.mtt.hippy.views.hippylist;

import android.view.View;
import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadParams;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyEngineLifecycleEventListener;
import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorEvent;
import com.tencent.mtt.hippy.bridge.HippyBridgeManager;
import com.tencent.mtt.hippy.bridge.HippyCoreAPI;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.TimeMonitor;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Created by niuniuyang on 2021/4/8.
 * Description
 */
class TestHippyContext implements HippyEngineContext {

    private RenderManager renderManager;
    final CopyOnWriteArrayList<HippyRootView> mInstances = new CopyOnWriteArrayList<>();

    @Override public HippyGlobalConfigs getGlobalConfigs() {
        return null;
    }

    @Override public HippyModuleManager getModuleManager() {
        return null;
    }

    @Override public HippyBridgeManager getBridgeManager() {
        return null;
    }

    @Override public DevSupportManager getDevSupportManager() {
        return null;
    }

    @Override public ThreadExecutor getThreadExecutor() {
        return null;
    }

    @Override public DomManager getDomManager() {
        return null;
    }

    @Override public RenderManager getRenderManager() {
        if (renderManager == null) {
            List<HippyAPIProvider> providers = new ArrayList<>();
            providers.add(new HippyCoreAPI());
            renderManager = new RenderManager(this, providers);
        }

        return renderManager;
    }

    void createRenderNode() {
        RenderManager renderManager = getRenderManager();
        renderManager.createRootNode(0);
        HippyRootView hippyRootView = mInstances.get(0);
        int listViewId = 1;
        renderManager.createNode(hippyRootView, listViewId, 0, 0, "ListView", new HippyMap());
        renderManager.getRenderNode(0).updateLayout(0, 0, 480, 752);
        int listItemCount = 20;
        for (int i = 2; i < listItemCount; i++) {
            int listItemId = i;
            renderManager.createNode(hippyRootView, listItemId, listViewId, 0, "ListViewItem", new HippyMap());
            renderManager.getRenderNode(listItemId).updateLayout(0, 0, 480, 100);
            int childId = listItemId + listViewId;
            renderManager.createNode(hippyRootView, childId, listItemId, 0, "View", new HippyMap());
            renderManager.getRenderNode(childId).updateLayout(0, 0, 480, 100);
        }
    }

    @Override public HippyRootView getInstance(int id) {
        return mInstances.get(0);
    }

    public HippyRootView loadModule(ModuleLoadParams loadParams) {
        HippyRootView view = new HippyRootView(loadParams) {
            @Override public void onViewAdded(View child) {

            }
        };
        view.setTimeMonitor(new TimeMonitor(false));
        view.getTimeMonitor().begine();
        view.getTimeMonitor().startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_WAIT_ENGINE);
        view.setId(0);
        mInstances.add(view);
        return view;
    }

    @Override public void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {

    }

    @Override public void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {

    }

    @Override public void addEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener) {

    }

    @Override public void removeEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener) {

    }

    @Override public void handleException(Throwable throwable) {

    }

    @Override public TimeMonitor getStartTimeMonitor() {
        return null;
    }

    @Override public int getEngineId() {
        return 0;
    }
}
