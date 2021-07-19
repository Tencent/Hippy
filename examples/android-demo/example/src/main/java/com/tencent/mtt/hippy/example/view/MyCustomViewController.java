package com.tencent.mtt.hippy.example.view;

import android.view.View;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;

@SuppressWarnings({"unused"})
@HippyController(name = HippyCustomPropsController.CLASS_NAME)
public class MyCustomViewController extends HippyCustomPropsController
{
	@HippyControllerProps(name = "customString", defaultType = HippyControllerProps.STRING)
	public void setCustomString(View view, String text) {
		LogUtils.d("MyCustomViewController", "setCustomString: text=" + text);
	}
}
