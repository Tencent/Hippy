/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.uimanager;

import android.content.Context;
import android.graphics.Color;
import android.os.Looper;
import android.os.MessageQueue;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.dom.node.StyleNode;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.common.CommonBorder;
import com.tencent.mtt.hippy.views.view.HippyViewGroupController;

import java.util.Map;

/**
 * @author: edsheng
 * @date: 2017/11/29 14:14
 * @version: V1.0
 */

public abstract class HippyViewController<T extends View & HippyViewBase> implements View.OnFocusChangeListener
{
	private static final String								TAG								= "HippyViewController";

	private static MatrixUtil.MatrixDecompositionContext	sMatrixDecompositionContext		= new MatrixUtil.MatrixDecompositionContext();
	private static double[]									sTransformDecompositionArray	= new double[16];
    private boolean bUserChageFocus = false;
	public View createView(HippyRootView rootView, int id, HippyEngineContext hippyContext, String className, HippyMap initialProps)
	{
		View view = null;
		if (rootView != null)
		{
			Context rootViewContext = rootView.getContext();
			if (rootViewContext instanceof HippyInstanceContext)
			{
				Map nativeParam = ((HippyInstanceContext) rootViewContext).getNativeParams();
				if (nativeParam != null)
				{
					Object object = nativeParam.get(HippyCustomViewCreator.HIPPY_CUSTOM_VIEW_CREATOR);
					if (object instanceof HippyCustomViewCreator)
					{
						view = ((HippyCustomViewCreator) object).createCustomView(className, rootView.getContext(), initialProps);
					}
				}
			}
			if (view == null)
			{
				view = createViewImpl(rootView.getContext(), initialProps);
				if (view == null)
				{
					view = createViewImpl(rootView.getContext());
				}
			}

			LogUtils.d(TAG, "createView id " + id);
			view.setId(id);
			view.setTag(className);
		}
		return view;
	}

	public void onAfterUpdateProps(T v)
	{

	}

	//	public void updateProps(View view, HippyMap props)
	//	{
	//		if (props == null)
	//			return;
	//		try
	//		{
	//			HippyMap styleProps = props.get(NodeProps.STYLE) != null ? (HippyMap) props.get(NodeProps.STYLE) : null;
	//			Method[] targetMethods = getClass().getMethods();
	//
	//			for (Method targetMethod : targetMethods)
	//			{
	//				HippyControllerProps hippyProps = targetMethod.getAnnotation(HippyControllerProps.class);
	//				if (hippyProps != null)
	//				{
	//					String propsName = hippyProps.name();
	//					if (props.get(propsName) != null) // try normal props first
	//					{
	//						targetMethod.invoke(this, view, props.get(propsName));
	//					}
	//					else if (styleProps != null && styleProps.get(propsName) != null) // then try styleprops
	//					{
	//						targetMethod.invoke(this, view, styleProps.get(propsName));
	//					}
	//				}
	//			}
	//		}
	//		catch (IllegalAccessException e)
	//		{
	//			e.printStackTrace();
	//		}
	//		catch (InvocationTargetException e)
	//		{
	//			e.printStackTrace();
	//		}
	//		catch (IllegalArgumentException e)
	//		{
	//			e.printStackTrace();
	//		}
	//	}


	protected void updateExtra(View view, Object object)
	{

	}

	protected StyleNode createNode(boolean isVirtual)
	{
		return new StyleNode();
	}

	public void updateLayout(int id, int x, int y, int width, int height, ControllerRegistry componentHolder)
	{
		View view = componentHolder.getView(id);
		if (view != null)
		{
			view.measure(View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
					View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY));
			if (!shouldInterceptLayout(view, x, y, width, height))
			{
				view.layout(x, y, x + width, y + height);
			}
		}
	}

	protected boolean shouldInterceptLayout(View view, int x, int y, int width, int height)
	{
		return false;
	}

	protected boolean handleGestureBySelf()
	{
		return false;
	}


	/**
	 * please use createViewImpl(Context context,HippyMap iniProps) instead ,it
	 * will be removed no longer
	 * 
	 * @param context
	 * @return
	 */
	@Deprecated
	protected abstract View createViewImpl(Context context);

	protected View createViewImpl(Context context, HippyMap iniProps)
	{
		return null;
	}


	/** transform **/
	@HippyControllerProps(name = NodeProps.TRANSFORM, defaultType = HippyControllerProps.ARRAY)
	public void setTransform(T view, HippyArray transformArray)
	{
		if (transformArray == null)
		{
			resetTransform(view);
		}
		else
		{
			applyTransform(view, transformArray);
		}
	}

	@HippyControllerProps(name = NodeProps.PROP_ACCESSIBILITY_LABEL)
	public void setAccessibilityLabel(T view, String accessibilityLabel)
	{
		if (accessibilityLabel == null)
		{
			accessibilityLabel = "";
		}
		view.setContentDescription(accessibilityLabel);
	}

	/** zIndex **/
	@HippyControllerProps(name = NodeProps.Z_INDEX, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setZIndex(T view, int zIndex)
	{
		HippyViewGroupController.setViewZIndex(view, zIndex);
		ViewParent parent = view.getParent();
		if (parent instanceof IHippyZIndexViewGroup)
		{
			((IHippyZIndexViewGroup) parent).updateDrawingOrder();
		}
	}

	/** color/border/alpha **/
	@HippyControllerProps(name = NodeProps.BACKGROUND_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setBackground(T view, int backgroundColor)
	{
		view.setBackgroundColor(backgroundColor);
	}

	@HippyControllerProps(name = NodeProps.OPACITY, defaultType = HippyControllerProps.NUMBER, defaultNumber = 1.f)
	public void setOpacity(T view, float opacity)
	{
		view.setAlpha(opacity);
	}

	@HippyControllerProps(name = NodeProps.BORDER_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setBorderRadius(T view, float borderRadius)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderRadius(borderRadius, CommonBorder.BorderRadiusDirection.ALL.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_TOP_LEFT_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setTopLeftBorderRadius(T view, float topLeftBorderRadius)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderRadius(topLeftBorderRadius, CommonBorder.BorderRadiusDirection.TOP_LEFT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_TOP_RIGHT_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setTopRightBorderRadius(T view, float topRightBorderRadius)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderRadius(topRightBorderRadius, CommonBorder.BorderRadiusDirection.TOP_RIGHT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_BOTTOM_RIGHT_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setBottomRightBorderRadius(T view, float bottomRightBorderRadius)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderRadius(bottomRightBorderRadius, CommonBorder.BorderRadiusDirection.BOTTOM_RIGHT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_BOTTOM_LEFT_RADIUS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setBottomLeftBorderRadius(T view, float bottomLeftBorderRadius)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderRadius(bottomLeftBorderRadius, CommonBorder.BorderRadiusDirection.BOTTOM_LEFT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setBorderWidth(T view, float borderWidth)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderWidth(borderWidth, CommonBorder.BorderWidthDirection.ALL.ordinal());
	}

	@HippyControllerProps(name = NodeProps.NEXT_FOCUS_DOWN_ID, defaultType = HippyControllerProps.BOOLEAN)
	public void setNextFocusDownId(T view, int id)
	{
		view.setNextFocusDownId(id);
	}

	@HippyControllerProps(name = NodeProps.NEXT_FOCUS_UP_ID, defaultType = HippyControllerProps.BOOLEAN)
	public void setNextFocusUpId(T view, int id)
	{
		view.setNextFocusUpId(id);
	}

	@HippyControllerProps(name = NodeProps.NEXT_FOCUS_LEFT_ID, defaultType = HippyControllerProps.BOOLEAN)
	public void setNextFocusLeftId(T view, int id)
	{
		view.setNextFocusLeftId(id);
	}

	@HippyControllerProps(name = NodeProps.NEXT_FOCUS_RIGHT_ID, defaultType = HippyControllerProps.BOOLEAN)
	public void setNextFocusRightId(T view, int id)
	{
		view.setNextFocusRightId(id);
	}



	@HippyControllerProps(name = NodeProps.FOCUSABLE, defaultType = HippyControllerProps.BOOLEAN)
	public void setFocusable(T view, boolean focusable)
	{
		view.setFocusable(focusable);
		if (focusable)
		{
			view.setOnFocusChangeListener(this);
		}
		else
		{
			view.setOnFocusChangeListener(null);
		}
	}

	@HippyControllerProps(name = NodeProps.REQUEST_FOCUS, defaultType = HippyControllerProps.BOOLEAN)
	public void requestFocus(final T view, boolean request)
	{
		if (request)
		{
			Looper.getMainLooper().myQueue().addIdleHandler(new MessageQueue.IdleHandler()
			{
				@Override
				public boolean queueIdle()
				{
                    bUserChageFocus = true;
					boolean result = view.requestFocusFromTouch();

					if (!result)
					{
						result = view.requestFocus();
						LogUtils.d("requestFocus", "requestFocus result:" + result);
					}
                    bUserChageFocus = false;
					return false;
				}
			});

		}
	}

	@Override
	public void onFocusChange(View v, boolean hasFocus)
	{
		if(bUserChageFocus) //只有用户导致的焦点获取，会通知出去
		{
		HippyMap hippyMap = new HippyMap();
		hippyMap.pushBoolean("focus", hasFocus);
		new HippyViewEvent("onFocus").send(v, hippyMap);
		}
	}

	@HippyControllerProps(name = NodeProps.BORDER_LEFT_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setLeftBorderWidth(T view, float borderLeftWidth)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderWidth(borderLeftWidth, CommonBorder.BorderWidthDirection.LEFT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_TOP_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setTopBorderWidth(T view, float borderTopWidth)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderWidth(borderTopWidth, CommonBorder.BorderWidthDirection.TOP.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_RIGHT_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setRightBorderWidth(T view, float borderRightWidth)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderWidth(borderRightWidth, CommonBorder.BorderWidthDirection.RIGHT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_BOTTOM_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
	public void setBottomBorderWidth(T view, float borderBottomWidth)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderWidth(borderBottomWidth, CommonBorder.BorderWidthDirection.BOTTOM.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setBorderColor(T view, int borderColor)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderColor(borderColor, CommonBorder.BorderWidthDirection.ALL.ordinal());
	}

	@HippyControllerProps(name = NodeProps.BORDER_LEFT_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setBorderLeftColor(T view, int borderLeftColor)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderColor(borderLeftColor, CommonBorder.BorderWidthDirection.LEFT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_TOP_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setBorderTopWidth(T view, int borderTopColor)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderColor(borderTopColor, CommonBorder.BorderWidthDirection.TOP.ordinal());
	}

	@HippyControllerProps(name = NodeProps.BORDER_RIGHT_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setBorderRightWidth(T view, int borderRightColor)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderColor(borderRightColor, CommonBorder.BorderWidthDirection.RIGHT.ordinal());
	}


	@HippyControllerProps(name = NodeProps.BORDER_BOTTOM_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setBorderBottomWidth(T view, int borderBottomColor)
	{
		if (view instanceof CommonBorder)
			((CommonBorder) view).setBorderColor(borderBottomColor, CommonBorder.BorderWidthDirection.BOTTOM.ordinal());
	}

	/** touch/click **/
	@HippyControllerProps(name = NodeProps.ON_CLICK, defaultType = HippyControllerProps.BOOLEAN)
	public void setClickable(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			if (flag)
			{
				view.setOnClickListener(NativeGestureDispatcher.getOnClickListener());
			}
			else
			{
				view.setOnClickListener(null);
				view.setClickable(false);
			}
		}
	}


	@HippyControllerProps(name = NodeProps.ON_LONG_CLICK, defaultType = HippyControllerProps.BOOLEAN)
	public void setLongClickable(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			if (flag)
			{
				view.setOnLongClickListener(NativeGestureDispatcher.getOnLongClickListener());
			}
			else
			{
				view.setOnLongClickListener(null);
				view.setLongClickable(false);
			}
		}
	}

	@HippyControllerProps(name = NodeProps.ON_PRESS_IN, defaultType = HippyControllerProps.BOOLEAN)
	public void setPressInable(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(view, NodeProps.ON_PRESS_IN, flag);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_PRESS_OUT, defaultType = HippyControllerProps.BOOLEAN)
	public void setPressOutable(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(view, NodeProps.ON_PRESS_OUT, flag);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_DOWN, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
	public void setTouchDownHandle(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(view, NodeProps.ON_TOUCH_DOWN, flag);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_MOVE, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
	public void setTouchMoveHandle(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(view, NodeProps.ON_TOUCH_MOVE, flag);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_END, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
	public void setTouchEndHandle(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(view, NodeProps.ON_TOUCH_END, flag);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_TOUCH_CANCEL, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
	public void setTouchCancelHandle(T view, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(view, NodeProps.ON_TOUCH_CANCEL, flag);
		}
	}

	@HippyControllerProps(name = NodeProps.ON_ATTACHED_TO_WINDOW, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
	public void setAttachedToWindowHandle(T view, boolean flag)
	{
		if (flag)
		{
			view.addOnAttachStateChangeListener(NativeGestureDispatcher.getOnAttachedToWindowListener());
		}
		else
		{
			view.removeOnAttachStateChangeListener(NativeGestureDispatcher.getOnAttachedToWindowListener());
		}
	}

	@HippyControllerProps(name = NodeProps.ON_DETACHED_FROM_WINDOW, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
	public void setDetachedFromWindowHandle(T view, boolean flag)
	{
		if (flag)
		{
			view.addOnAttachStateChangeListener(NativeGestureDispatcher.getOnDetachedFromWindowListener());
		}
		else
		{
			view.removeOnAttachStateChangeListener(NativeGestureDispatcher.getOnDetachedFromWindowListener());
		}
	}

	@HippyControllerProps(name = NodeProps.CUSTOM_PROP)
	public void setCustomProp(T view, String methodName, Object props)
	{

	}

	protected void setGestureType(T view, String type, boolean flag)
	{
		if (flag)
		{
			if (view.getGestureDispatcher() == null)
			{
				view.setGestureDispatcher(new NativeGestureDispatcher(view));
			}
			view.getGestureDispatcher().addGestureType(type);
		}
		else
		{
			if (view.getGestureDispatcher() != null)
			{
				view.getGestureDispatcher().removeGestureType(type);
			}
		}
	}

	public RenderNode createRenderNode(int id, HippyMap props, String className, HippyRootView hippyRootView, ControllerManager controllerManager,
			boolean lazy)
	{
		return new RenderNode(id, props, className, hippyRootView, controllerManager, lazy);
	}

	private void applyTransform(T view, HippyArray transformArray)
	{
		TransformUtil.processTransform(transformArray, sTransformDecompositionArray);
		sMatrixDecompositionContext.reset();
		MatrixUtil.decomposeMatrix(sTransformDecompositionArray, sMatrixDecompositionContext);
		view.setTranslationX(PixelUtil.dp2px((float) sMatrixDecompositionContext.translation[0]));
		view.setTranslationY(PixelUtil.dp2px((float) sMatrixDecompositionContext.translation[1]));
		view.setRotation((float) sMatrixDecompositionContext.rotationDegrees[2]);
		view.setRotationX((float) sMatrixDecompositionContext.rotationDegrees[0]);
		view.setRotationY((float) sMatrixDecompositionContext.rotationDegrees[1]);
		view.setScaleX((float) sMatrixDecompositionContext.scale[0]);
		view.setScaleY((float) sMatrixDecompositionContext.scale[1]);
	}

	public static void resetTransform(View view)
	{
		view.setTranslationX(0);
		view.setTranslationY(0);
		view.setRotation(0);
		view.setRotationX(0);
		view.setRotationY(0);
		view.setScaleX(1);
		view.setScaleY(1);
	}

	/***
	 * dispatch the js call UI Function.
	 * @see #dispatchFunction(View, String, HippyArray, Promise)
	 * @param view
	 * @param functionName
	 * @param var
	 */
	public void dispatchFunction(T view, String functionName, HippyArray var)
	{
	}

	/***
	 * dispatch the js call UI Function with Promise to call back.
	 *
	 * @param view view实例
	 * @param functionName 函数名
	 * @param params 函数参数
	 * @param promise 回调
	 */
	public void dispatchFunction(T view, String functionName, HippyArray params, Promise promise)
	{
	}

	/***
	 * batch complete
	 * 
	 * @param view
	 */
	public void onBatchComplete(T view)
	{

	}

	protected void deleteChild(ViewGroup parentView, View childView)
	{
		parentView.removeView(childView);
	}

	protected void deleteChild(ViewGroup parentView, View childView, int childIndex)
	{
		deleteChild(parentView, childView);
	}

	public void onViewDestroy(T t)
	{
	}

	protected void addView(ViewGroup parentView, View view, int index)
	{
		// TODO: 这里需要复现场景来解，先上一个临时方案
		int realIndex = index;
		if (realIndex > parentView.getChildCount())
		{
			realIndex = parentView.getChildCount();
		}
		try
		{
			parentView.addView(view, realIndex);
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

	protected void onManageChildComplete(T view)
	{

	}

	public int getChildCount(T viewGroup)
	{
		if (viewGroup instanceof ViewGroup)
		{
			return ((ViewGroup) viewGroup).getChildCount();
		}
		return 0;
	}

	public View getChildAt(T viewGroup, int i)
	{
		if (viewGroup instanceof ViewGroup)
		{
			return ((ViewGroup) viewGroup).getChildAt(i);
		}
		return null;
	}
}
