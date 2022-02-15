package com.tencent.mtt.hippy.example.view;

import android.content.Context;
import android.graphics.Color;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.List;

@SuppressWarnings({"unused"})
@HippyController(name = "MyView")
public class MyViewController extends HippyViewController<MyView>
{
	@Override
	protected MyView createViewImpl(Context context)
	{
		return new MyView(context);
	}

	@HippyControllerProps(name = "text", defaultType = HippyControllerProps.STRING)
	public void setText(MyView textView, String text)
	{
		textView.setText(text);
	}

	/**
	 * 这dispatchFunction没有Promise参数，不再满足需要，已经被废弃，建议不要再重写这个函数
	 * 如果非要重写这个被废弃的函数，则不要同时重写那个带有Promise promise参数的同名函数。
	 * 否则的话，会出现重复调用（2个dispatchFunction都会被调用到）
	 * @see #dispatchFunction(MyView, String, HippyArray, Promise)
	 */
	// @Override
	// public void dispatchFunction(MyView view, String functionName, HippyArray params)
	// {}

	//this is show receive js call
	@Override
	public void dispatchFunction(MyView view, @NonNull String functionName,
			@NonNull List params) {
		super.dispatchFunction(view, functionName, params);
		try {
			switch (functionName) {
				case "changeColor":
					String color = (String) params.get(0);
					view.setColor(Color.parseColor(color));
					break;

				case "changeText":
					String text = (String) params.get(0);;
					view.setText(text);
					break;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
