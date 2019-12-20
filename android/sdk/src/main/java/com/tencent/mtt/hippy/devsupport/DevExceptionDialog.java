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
package com.tencent.mtt.hippy.devsupport;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.StateListDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.utils.PixelUtil;

/**
 * FileName: DevExceptionDialog
 * Description：
 * History：
 */
public class DevExceptionDialog extends Dialog implements View.OnClickListener
{

	private TextView			mTitleTv;
	private TextView			mContentTv;
	private TextView			mReloadTv;
	private TextView			mCancelTv;
	private OnReloadListener	mOnReloadListener;

	public DevExceptionDialog(Context context)
	{
		super(context);
		setCanceledOnTouchOutside(false);
		initUI();
	}

	public void setOnReloadListener(OnReloadListener listener)
	{
		mOnReloadListener = listener;
	}

	@Override
	protected void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
	}

	StateListDrawable buildDrawable()
	{
		int[] mNormalState = new int[]{};
		int[] mFocusedSate = new int[]{android.R.attr.state_focused, android.R.attr.state_enabled};

		//默认文字和背景颜色
		int mBgNormalColor =Color.TRANSPARENT ;
		int mBgFocusedColor = Color.parseColor("#ffddd9d9");
		//创建状态管理器
		StateListDrawable drawable = new StateListDrawable();

		/**
		 * 注意StateListDrawable的构造方法我们这里使用的
		 * 是第一参数它是一个float的数组保存的是圆角的半径，它是按照top-left顺时针保存的八个值
		 */
		//创建圆弧形状
		//创建drawable
		ColorDrawable pressedDrawable = new ColorDrawable(mBgFocusedColor);
		//添加到状态管理里面
		drawable.addState(mFocusedSate, pressedDrawable);

        ColorDrawable normalDrawable = new ColorDrawable(mBgNormalColor);
		drawable.addState(mNormalState, normalDrawable);

		return drawable;
	}
	private void initUI()
	{
		LinearLayout root = new LinearLayout(getContext());
		GradientDrawable bg = new GradientDrawable();
		bg.setColor(Color.WHITE);
		bg.setCornerRadius(PixelUtil.dp2px(8));
		root.setBackgroundDrawable(bg);
		root.setOrientation(LinearLayout.VERTICAL);

		mTitleTv = new TextView(getContext());
		int padding = (int) PixelUtil.dp2px(12);
		mTitleTv.setPadding(padding, padding, padding, padding);
		mTitleTv.setTextSize(16);
		mTitleTv.setGravity(Gravity.CENTER_HORIZONTAL);
		mTitleTv.setTextColor(Color.BLACK);

		LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT,
				LinearLayout.LayoutParams.WRAP_CONTENT);
		root.addView(mTitleTv, params);


		ScrollView scrollView = new ScrollView(getContext());
		scrollView.setVerticalScrollBarEnabled(false);
		mContentTv = new TextView(getContext());
		mContentTv.setGravity(Gravity.CENTER);
		mContentTv.setTextSize(12);
		mContentTv.setTextColor(Color.parseColor("#424242"));

		scrollView.addView(mContentTv);

		params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0);
		params.gravity = Gravity.CENTER_HORIZONTAL;
		params.leftMargin = (int) PixelUtil.dp2px(40);
		params.rightMargin = (int) PixelUtil.dp2px(40);
		params.bottomMargin = (int) PixelUtil.dp2px(30);
		params.weight = 1;
		root.addView(scrollView, params);

		View view = new View(getContext());
		view.setBackgroundColor(Color.parseColor("#f3f3f3"));

		params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int) PixelUtil.dp2px(1));
		root.addView(view, params);

		LinearLayout buttonContainer = new LinearLayout(getContext());
		buttonContainer.setOrientation(LinearLayout.HORIZONTAL);

		params = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int) PixelUtil.dp2px(50));
		root.addView(buttonContainer, params);

		mReloadTv = new TextView(getContext());
		mReloadTv.setGravity(Gravity.CENTER);
		mReloadTv.setTextSize(12);
		mReloadTv.setTextColor(Color.BLUE);
		mReloadTv.setFocusable(true);
		mReloadTv.setText("reload");
		mReloadTv.setOnClickListener(this);
//
        //设置我们的背景，就是xml里面的selector
        mReloadTv.setBackgroundDrawable(buildDrawable());

		params = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT);
		params.weight = 1;
		buttonContainer.addView(mReloadTv, params);

		view = new View(getContext());
		view.setBackgroundColor(Color.parseColor("#f3f3f3"));

		params = new LinearLayout.LayoutParams((int) PixelUtil.dp2px(1), LinearLayout.LayoutParams.MATCH_PARENT);
		buttonContainer.addView(view, params);

		mCancelTv = new TextView(getContext());
		mCancelTv.setGravity(Gravity.CENTER);
		mCancelTv.setTextSize(12);
		mCancelTv.setText("cancel");
		mCancelTv.setFocusable(true);
		mCancelTv.setOnClickListener(this);
		mCancelTv.setTextColor(Color.parseColor("#a1a1a1"));
        mCancelTv.setBackgroundDrawable(buildDrawable());
		params = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.MATCH_PARENT);
		params.weight = 1;
		buttonContainer.addView(mCancelTv, params);

		setContentView(root);
	}

	public void handleException(Throwable exception)
	{
		mTitleTv.setText(exception.getMessage());
		if (exception instanceof HippyJsException)
		{
			mContentTv.setText(((HippyJsException) exception).getStack());
			exception.printStackTrace();
		}
		else
		{
			StackTraceElement[] elements = exception.getStackTrace();
			StringBuilder builder = new StringBuilder();
			if (elements != null)
			{
				for (StackTraceElement element : elements)
				{
					builder.append(element.toString()).append("\n").append("\n");
				}
				for (StackTraceElement element : elements)
				{
					builder.append(element.toString()).append("\n").append("\n");
				}
			}
			mContentTv.setText(builder.toString());
			exception.printStackTrace();
		}
		mContentTv.setGravity(Gravity.LEFT);


	}

	@Override
	public void onClick(View v)
	{
		if (v == mCancelTv)
		{
			this.dismiss();
		}
		else if (v == mReloadTv && mOnReloadListener != null)
		{
			this.dismiss();
			mOnReloadListener.onReload();

		}
	}

	public interface OnReloadListener
	{
		public void onReload();
	}
}
