package com.tencent.mtt.hippy.views.hippylist;

import android.app.Activity;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadParams;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.utils.ContextHolder;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.robolectric.Robolectric;

/**
 * Created  on 2021/4/8.
 * Description
 */
@RunWith(QBRobolectricTestRunner.class)
@PowerMockIgnore({"com.tencent.mtt.hippy.*"})
public class HippyRecyclerViewTest {

    Activity testActivity;
    private Activity context;

    @Before
    public void setUp() {
        testActivity = Robolectric.setupActivity(Activity.class);
        context = testActivity;
        ContextHolder.initAppContext(context);
    }

    @Test
    public void createHippyContext() {
        TestHippyContext engineContext = new TestHippyContext();
        ModuleLoadParams loadParams = new ModuleLoadParams();
        loadParams.context = context;
        HippyInstanceContext instanceContext = new HippyInstanceContext(context, new ModuleLoadParams());
        instanceContext.setEngineContext(engineContext);
        engineContext.loadModule(loadParams);
        engineContext.createRenderNode();

        HippyRecyclerViewController viewController = new HippyRecyclerViewController();
        HippyRecyclerViewWrapper recyclerViewWrapper = (HippyRecyclerViewWrapper) viewController
                .createViewImpl(instanceContext, null);
        recyclerViewWrapper.setId(1);
        viewController.onBatchComplete(recyclerViewWrapper);
        testActivity.setContentView(recyclerViewWrapper);
    }
}