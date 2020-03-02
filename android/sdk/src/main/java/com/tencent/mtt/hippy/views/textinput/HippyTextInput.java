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
package com.tencent.mtt.hippy.views.textinput;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.common.CommonBackgroundDrawable;
import com.tencent.mtt.hippy.views.common.CommonBorder;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.os.Build;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.Display;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;

import java.lang.reflect.Field;
/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2017/12/19 20:05
 * @version: V1.0
 */

public class HippyTextInput extends EditText implements HippyViewBase, CommonBorder, TextView.OnEditorActionListener, View.OnFocusChangeListener
{

	private CommonBackgroundDrawable	mReactBackgroundDrawable;
	HippyEngineContext					mHippyContext;
	boolean								mHasAddWatcher			= false;
	private String						mPreviousText;
	TextWatcher							mTextWatcher				= null;
	boolean								mHasSetOnSelectListener	= false;

	private int							mDefaultGravityHorizontal;
	private int							mDefaultGravityVertical;
	//输入法键盘的相关方法
	private Rect						mRect						= new Rect();	//获取当前RootView的大小位置信息
	private Rect						mLastRect					= new Rect();	//当前RootView的上一次大小位置信息
	private int							mLastRootViewVisibleHeight	= -1;			//当前RootView的上一次大小
	private boolean						mIsKeyBoardShow				= false;		//键盘是否在显示
	private ReactContentSizeWatcher 	mReactContentSizeWatcher =  null;
	public HippyTextInput(Context context)
	{
		super(context);
		mHippyContext = ((HippyInstanceContext) context).getEngineContext();
		setFocusable(true);
		mDefaultGravityHorizontal = getGravity() & (Gravity.HORIZONTAL_GRAVITY_MASK | Gravity.RELATIVE_HORIZONTAL_GRAVITY_MASK);
		mDefaultGravityVertical = getGravity() & Gravity.VERTICAL_GRAVITY_MASK;
		// Android这个EditText控件默认带有内边距，强制去掉内边距
		setPadding(0, 0, 0, 0);


	}
	@Override
	public void onEditorAction(int actionCode) {
		HippyMap hippyMap = new HippyMap();
		hippyMap.pushInt("actionCode", actionCode);
		hippyMap.pushString("text", getText().toString());
		switch (actionCode)
		{
			case EditorInfo.IME_ACTION_GO:
				hippyMap.pushString("actionName", "go");
				break;
			case EditorInfo.IME_ACTION_NEXT:
				hippyMap.pushString("actionName", "next");
				break;
			case EditorInfo.IME_ACTION_NONE:
				hippyMap.pushString("actionName", "none");
				break;
			case EditorInfo.IME_ACTION_PREVIOUS:
				hippyMap.pushString("actionName", "previous");
				break;
			case EditorInfo.IME_ACTION_SEARCH:
				hippyMap.pushString("actionName", "search");
				break;
			case EditorInfo.IME_ACTION_SEND:
				hippyMap.pushString("actionName", "send");
				break;
			case EditorInfo.IME_ACTION_DONE:
				hippyMap.pushString("actionName", "done");
				break;
			default:
				hippyMap.pushString("actionName", "unknown");
				break;
		}
		mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
				"onEditorAction", hippyMap);
		super.onEditorAction(actionCode);
	}

	@Override
	protected void onAttachedToWindow() {
		super.onAttachedToWindow();
		//监听RootView的布局变化,来判断键盘是否弹起
		if (getRootView() != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN)
		{
			getRootView().getViewTreeObserver().addOnGlobalLayoutListener(globaListener);
		}
			
	}

	@Override
	protected void onDetachedFromWindow() {
		super.onDetachedFromWindow();
		//监听RootView的布局变化,Listern去掉
		if (getRootView() != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN)
		{
			getRootView().getViewTreeObserver().removeOnGlobalLayoutListener(globaListener);
		}
	}

	void setGravityHorizontal(int gravityHorizontal)
	{
		if (gravityHorizontal == 0)
		{
			gravityHorizontal = mDefaultGravityHorizontal;
		}
		setGravity((getGravity() & ~Gravity.HORIZONTAL_GRAVITY_MASK & ~Gravity.RELATIVE_HORIZONTAL_GRAVITY_MASK) | gravityHorizontal);
	}

	void setGravityVertical(int gravityVertical)
	{
		if (gravityVertical == 0)
		{
			gravityVertical = mDefaultGravityVertical;
		}
		setGravity((getGravity() & ~Gravity.VERTICAL_GRAVITY_MASK) | gravityVertical);
	}

	@Override
	protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
		super.onLayout(changed, left, top, right, bottom);
		if(mReactContentSizeWatcher != null )
		{
			mReactContentSizeWatcher.onLayout();
		}
	}

	@Override
	protected void onTextChanged(CharSequence text, int start, int lengthBefore, int lengthAfter) {
		super.onTextChanged(text, start, lengthBefore, lengthAfter);
		if(mReactContentSizeWatcher != null )
		{
			mReactContentSizeWatcher.onLayout();
		}
	}

	public class ReactContentSizeWatcher  {
		private EditText mEditText;
		HippyEngineContext					mHippyContext;
		private int mPreviousContentWidth = 0;
		private int mPreviousContentHeight = 0;

		public ReactContentSizeWatcher(EditText editText,HippyEngineContext	 hippyContext) {
			mEditText = editText;
			mHippyContext = hippyContext;
		}

		public void onLayout() {
			int contentWidth = mEditText.getWidth();
			int contentHeight = mEditText.getHeight();

			// Use instead size of text content within EditText when available
			if (mEditText.getLayout() != null) {
				contentWidth = mEditText.getCompoundPaddingLeft() + mEditText.getLayout().getWidth()<0?0:mEditText.getLayout().getWidth() +
						mEditText.getCompoundPaddingRight();
				contentHeight = mEditText.getCompoundPaddingTop() + mEditText.getLayout().getHeight()<0?0:mEditText.getLayout().getHeight() +
						mEditText.getCompoundPaddingBottom();
			}

			if (contentWidth != mPreviousContentWidth || contentHeight != mPreviousContentHeight) {
				mPreviousContentHeight = contentHeight;
				mPreviousContentWidth = contentWidth;
				HippyMap contentSize = new HippyMap();
				contentSize.pushDouble("width", mPreviousContentWidth);
				contentSize.pushDouble("height", mPreviousContentWidth);
				HippyMap eventData = new HippyMap();
				eventData.pushMap("contentSize", contentSize);
				mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
						.receiveUIComponentEvent(getId(), "onContentSizeChange", eventData);

			}
		}
	}

	public void setOnContentSizeChange(boolean contentSizeChange)
	{
		if(contentSizeChange == true)
		{
			mReactContentSizeWatcher = new ReactContentSizeWatcher(this,mHippyContext);
		}
		else
		{
			mReactContentSizeWatcher = null;
		}
	}
	@Override
	public boolean onTouchEvent(MotionEvent event)
	{
		boolean handleTouch = super.onTouchEvent(event);
//		if (handleTouch)
//		{
//			if (getParent() != null)
//			{
//				getParent().requestDisallowInterceptTouchEvent(true);
//			}
//		}
		return handleTouch;
	}
	public InputMethodManager getInputMethodManager()
	{
		return (InputMethodManager) this.getContext().getSystemService(Context.INPUT_METHOD_SERVICE);
	}

	public void hideInputMethod()
	{
		InputMethodManager imm = this.getInputMethodManager();
		if (imm != null && imm.isActive(this))
		{
			try
			{
				imm.hideSoftInputFromWindow(this.getWindowToken(), 0);
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
		}

	}

	//成功的話返回手機屏幕的高度,失敗返回-1
	private int getScreenHeight()
	{
		try
		{
			Context context = ContextHolder.getAppContext();
			android.view.WindowManager manager = (android.view.WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
			Display display = manager.getDefaultDisplay();

			if (display != null)
			{
				int width = manager.getDefaultDisplay().getWidth();
				int height = manager.getDefaultDisplay().getHeight();
				return Math.max(width, height);
			}

		}
		catch (SecurityException e)
		{

		}
		return -1;
	}

	/**
	 * 返回RootView的高度,要注意即使全屏,他應該也少了一個狀態欄的高度
	 */
	private int getRootViewHeight()
	{
		int height = -1;
		View rootView = getRootView();
		if (rootView == null)
		{
			return height;
		}
		// 问题ID： 106874510 某些奇葩手机ROM调用此方法会报错，做下捕获吧
		try
		{
			rootView.getWindowVisibleDisplayFrame(mRect);
		}
		catch (Throwable e)
		{
			LogUtils.d("InputMethodStatusMonitor:", "getWindowVisibleDisplayFrame failed !" + e);
			e.printStackTrace();
		}

		int visibleHeight = mRect.bottom - mRect.top;
		if (visibleHeight < 0)
		{
			return -1;
		}
		return visibleHeight;
	}

	//监听RootView布局变化的listener
	ViewTreeObserver.OnGlobalLayoutListener globaListener = new ViewTreeObserver.OnGlobalLayoutListener()
	{
		@Override
		public void onGlobalLayout()
		{
			int rootViewVisibleHeight = getRootViewHeight(); //RootView的高度
			int screenHeight = getScreenHeight(); //屏幕高度
			if (rootViewVisibleHeight == -1 || screenHeight == -1) //如果有失败直接返回 //TODO...仔细检查下这里的逻辑
			{
				mLastRootViewVisibleHeight = rootViewVisibleHeight;
				mLastRect = mRect;
				return;
			}
			if (mLastRootViewVisibleHeight == -1) // 首次
			{
				//假设输入键盘的高度位屏幕高度20%
				if (rootViewVisibleHeight > screenHeight * 0.8f)
				{

					mIsKeyBoardShow = false; //键盘没有显示
				}
				else
				{
					if (mIsKeyBoardShow == false)
					{
						HippyMap hippyMap = new HippyMap();
						hippyMap.pushInt("keyboardHeight", Math.abs(screenHeight - rootViewVisibleHeight) ); //TODO 首次输入这里需要减去一个statusbar的高度,但是又要当心全屏模式
						mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
								"onKeyboardWillShow", hippyMap);
					}
					mIsKeyBoardShow = true; //键盘显示 ----s首次需要通知
				}
			}

			else
			{
				//假设输入键盘的高度位屏幕高度20%
				if (rootViewVisibleHeight > screenHeight * 0.8f)
				{
					if (mIsKeyBoardShow == true)
					{
						HippyMap hippyMap = new HippyMap();
						mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
								"onKeyboardWillHide", hippyMap);
					}
					mIsKeyBoardShow = false; //键盘没有显示
				}
				else
				{
					if (mIsKeyBoardShow == false)
					{
						HippyMap hippyMap = new HippyMap();
						hippyMap.pushInt("keyboardHeight", Math.abs(mLastRootViewVisibleHeight - rootViewVisibleHeight) );
						mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
								"onKeyboardWillShow", hippyMap);
					}
					mIsKeyBoardShow = true; //键盘显示 ----s首次需要通知
				}
			}

			mLastRootViewVisibleHeight = rootViewVisibleHeight;
			mLastRect = mRect;
		}
	};

	public void showInputMethodManager()
	{

		InputMethodManager imm = this.getInputMethodManager();

		try
		{
			imm.showSoftInput(this, 0, null);
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}

	}


	private String	mValidator			= "";		//这则表达式,前端传入,要比较小心导致的crash
	private String	sRegrexValidBefore	= "";
	private String	sRegrexValidRepeat	= "";		//如果有无效的正则输入,会设置.
	private boolean	mTextInputed		= false;	//文本是否输入过
	public void setValidator(String validator)
	{
		mValidator  = validator;
	}
	//changeListener == true 代表前端监听了 onTextChagne.
	//所以如果
	public void setOnChangeListener(boolean changeListener)
	{
		if (changeListener) //需要监听文字的通知
		{
			if(mHasAddWatcher) //如果已经注册过了，直接退出。
			{
				return ;
			}
			//第一次才注册。
			mTextWatcher = new TextWatcher()
			{
				@Override
				public void beforeTextChanged(CharSequence s, int start, int count, int after)
				{
					sRegrexValidBefore = s.toString();//在文本变化前,记录一下当前输入框的文本值.也就是说现在肯定是符合正则表达式的.
				}

				@Override
				public void onTextChanged(CharSequence s, int start, int before, int count)
				{

				}

				@Override
				public void afterTextChanged(Editable s)
				{
					if (TextUtils.isEmpty((mValidator))) //如果没有正则匹配
					{
						//如果文本输入过,判断是否两次相同
						if (mTextInputed && TextUtils.equals(s.toString(), mPreviousText))
						{
							return;
						}
						//这里为什么不用sRegrexValidBefore,sRegrexValidBefore是每次有词汇变化就会被回调设置.
						mPreviousText = s.toString();
						mTextInputed = true;
						if (!bUserSetValue) //如果是前端设置下来的值,不再需要回调给前端.
						{
							HippyMap hippyMap = new HippyMap();
							hippyMap.pushString("text", s.toString());
							mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
									"onChangeText", hippyMap);
							LogUtils.d("robinsli", "afterTextChanged 通知前端文本变化=" + s.toString());
						}
					}
					else //如果设置了正则表达式
					{
						try
						{
							//如果当前的内容不匹配正则表达式
							if (!s.toString().matches(mValidator) && !"".equals(s.toString()))
							{
								LogUtils.d("robinsli", "afterTextChanged 不符合正则表达式,需要设置回去=" + s.toString());
								//丢弃当前的内容,回退到上一次的值.上一次的值检查过,肯定是符合正则表达式的.
								setText(sRegrexValidBefore);
								//上一步的setText,将触发新一轮的beforeTextChanged,onTextChanged,afterTextChanged
								//为了避免前端收到两次内容同样的通知.记录一下正则匹配设置回去的值.
								sRegrexValidRepeat = sRegrexValidBefore;
								setSelection(getText().toString().length()); // TODO这里不应该通知
								mTextInputed = true;
							}
							else
							{
								//如果文本输入过,判断是否两次相同
								if (mTextInputed && TextUtils.equals(s.toString(), mPreviousText))
								{
									return;
								}
								mTextInputed = true;
								mPreviousText = s.toString();
								if (!bUserSetValue //如果是前端设置的一定不通知
										&& (TextUtils.isEmpty(sRegrexValidRepeat) //如果没有,输入过无效的内容
										|| !TextUtils.equals(sRegrexValidRepeat, mPreviousText) //如果本次输入的内容是上一次重复的蓉蓉
								))
								{
									HippyMap hippyMap = new HippyMap();
									hippyMap.pushString("text", s.toString());
									mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(),
											"onChangeText", hippyMap);
									LogUtils.d("robinsli", "afterTextChanged 通知前端文本变化=" + s.toString());
									sRegrexValidRepeat = "";
								}
							}
						}
						catch (Throwable error)
						{
							// 不知道外部的正则表达式,最好保护住
						}

					}

				}
			};

			//注册。并标记
			mHasAddWatcher = true;
			addTextChangedListener(mTextWatcher);

		}
		else //不需要需要监听文字的通知
		{
			mHasAddWatcher = false;
			removeTextChangedListener(mTextWatcher);
		}
	}

	@Override
	public void setBackgroundColor(int color)
	{
		int paddingBottom = getPaddingBottom();
		int paddingTop = getPaddingTop();
		int paddingLeft = getPaddingLeft();
		int paddingRight = getPaddingRight();

		if (color == Color.TRANSPARENT && mReactBackgroundDrawable == null)
		{
			// don't do anything, no need to allocate ReactBackgroundDrawable for transparent background
		}
		else
		{
			getOrCreateReactViewBackground().setBackgroundColor(color);
		}
		// Android这个EditText控件默认带有内边距，设置背景时系统也可能会再把它默认的内边距给加上去。这里强制去掉内边距
		setPadding(paddingLeft, paddingTop, paddingRight, paddingBottom);
	}

	public void setBorderColor(int color, int position)
	{
		getOrCreateReactViewBackground().setBorderColor(color, position);
	}

	public void setBorderRadius(float borderRadius, int position)
	{
		getOrCreateReactViewBackground().setBorderRadius(borderRadius, position);
	}

	@Override
	public void setBorderStyle(int borderStyle) {
	}

	@Override
	public void setBorderWidth(float width, int position)
	{
		getOrCreateReactViewBackground().setBorderWidth(width, position);
	}

	private CommonBackgroundDrawable getOrCreateReactViewBackground()
	{
		if (mReactBackgroundDrawable == null)
		{
			mReactBackgroundDrawable = new CommonBackgroundDrawable();
			Drawable backgroundDrawable = getBackground();
			super.setBackgroundDrawable(null); // required so that drawable callback is cleared before we add the
			// drawable back as a part of LayerDrawable
			if (backgroundDrawable == null)
			{
				super.setBackgroundDrawable(mReactBackgroundDrawable);
			}
			else
			{
				LayerDrawable layerDrawable = new LayerDrawable(new Drawable[] { mReactBackgroundDrawable, backgroundDrawable });
				super.setBackgroundDrawable(layerDrawable);
			}
		}
		return mReactBackgroundDrawable;
	}

	@Override
	public NativeGestureDispatcher getGestureDispatcher()
	{
		return null;
	}

	@Override
	public void setGestureDispatcher(NativeGestureDispatcher dispatcher)
	{

	}



	public void setOnEndEditingListener(boolean onEndEditingLIstener)
	{
		if (onEndEditingLIstener)
		{
			setOnEditorActionListener(this);
		}
		else
		{
			setOnEditorActionListener(null);
		}
	}

	@Override
	public boolean onEditorAction(TextView v, int actionId, KeyEvent event)
	{
		if ((actionId & EditorInfo.IME_MASK_ACTION) > 0 || actionId == EditorInfo.IME_NULL)
		{
			HippyMap hippyMap = new HippyMap();
			hippyMap.pushString("text", getText().toString());
			mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(), "onEndEditing", hippyMap);
		}
		return false;
	}

	public void setBlurOrOnFocus(boolean blur)
	{
		if (blur)
		{
			setOnFocusChangeListener(this);
		}
		else
		{
			setOnFocusChangeListener(null);
		}
	}

	@Override
	public void onFocusChange(View v, boolean hasFocus)
	{

		HippyMap hippyMap = new HippyMap();
		hippyMap.pushString("text", getText().toString());
		if (hasFocus)
		{
			mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(), "onFocus", hippyMap);
		}
		else
		{
			mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(), "onBlur", hippyMap);
			// harryguo: 屏蔽这里的onEndEditing事件。理由：失去焦点时，就只发onBlur就够了。onEndEditing不可再发，否则和那个地方（哪个地方？键盘回车或点击软键盘send、search、next...时的）的onEditorAction重复
			// mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveUIComponentEvent(getId(), "onEndEditing", hippyMap);
		}
	}


	@Override
	protected void onSelectionChanged(int selStart, int selEnd)
	{
		super.onSelectionChanged(selStart, selEnd);
		if (mHasSetOnSelectListener)
		{
			HippyMap selection = new HippyMap();
			selection.pushInt("start", selStart);
			selection.pushInt("end", selEnd);
			HippyMap hippyMap = new HippyMap();
			hippyMap.pushMap("selection", selection);
			mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
					.receiveUIComponentEvent(getId(), "onSelectionChange", hippyMap);
		}
	}

	public HippyMap jsGetValue()
	{
		HippyMap hippyMap = new HippyMap();
		hippyMap.pushString("text", getText().toString());
		return hippyMap;
//		mHippyContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
//				.receiveUIComponentEvent(getId(), "getValue", hippyMap);
	}
	public boolean bUserSetValue = false;
	public void jsSetValue(String value,int pos)
	{
		bUserSetValue = true;
		setText(value);
		if(value != null )
		{
			if(pos < 0)
				pos =value.length();
			if(pos >= value.length())
				pos =value.length();
			setSelection(pos);
		}
		bUserSetValue = false;
	}
	public void setOnSelectListener(boolean change)
	{
		mHasSetOnSelectListener = change;
	}

	public void setReturnKeyType(String returnKeyType)
	{
	}

	/**
	 * Robinsli设置输入框光标颜色
	 * */
	public void setCursorColor(int color)
	{
		try
		{
			Field field = TextView.class.getDeclaredField("mCursorDrawableRes");
			field.setAccessible(true);
			int drawableResId = field.getInt(this);
			field = TextView.class.getDeclaredField("mEditor");
			field.setAccessible(true);
			Object editor = field.get(this);
			Drawable drawable = null;
			final int version = Build.VERSION.SDK_INT;
			if (version >= 21)
			{
				drawable = this.getContext().getDrawable(drawableResId);
			}
			else if (version >= 16)
			{
				drawable = this.getContext().getResources().getDrawable(drawableResId);
			}
			if(drawable == null)
				return;
			drawable.setColorFilter(color, PorterDuff.Mode.SRC_IN);
			Class  editorClass = editor.getClass(); //有的ROM自己复写了，Editor类，所以之类里面没有mDrawableForCursor，这里需要遍历
			while (editorClass != null)
			{
				try {
					if (version >= 28)
					{
						field = editorClass.getDeclaredField("mDrawableForCursor");//mCursorDrawable
						field.setAccessible(true);
						field.set(editor, drawable);
						break;
					}
					else
					{
						Drawable[] drawables = { drawable, drawable };
						field = editorClass.getDeclaredField("mCursorDrawable");//mCursorDrawable
						field.setAccessible(true);
						field.set(editor, drawables);
						break;
					}
				}
				catch (Throwable ignored)
				{
					LogUtils.d("robinsli", ignored.getMessage());
				}
				editorClass = editorClass.getSuperclass(); //继续往上反射父亲
			}
		}
		catch (Throwable ignored)
		{
			LogUtils.d("robinsli", ignored.getMessage());
		}
	}
}
