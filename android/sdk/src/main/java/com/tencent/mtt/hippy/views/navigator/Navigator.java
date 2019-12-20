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
package com.tencent.mtt.hippy.views.navigator;

import android.animation.Animator;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.view.View;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;

/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2018/9/25 15:41
 * @version: V1.0
 */
public class Navigator extends HippyViewGroup
{
	private final static String	DIRECTION_LEFT	= "left";
	private final static String	DIRECTION_RIGHT	= "right";
	private final static String	DIRECTION_TOP		= "top";
	private final static String	DIRECTION_BOTTOM	= "bottom";

	public Navigator(Context context)
	{
		super(context);
	}

	public void push(HippyRootView hippyRootView, boolean animated, String fromDirection)
	{
		addView(hippyRootView);
		hippyRootView.layout(0, 0, getWidth(), getHeight());

		if (animated)
		{
			Animator animator = null;
			switch (fromDirection == null ? "" : fromDirection)
			{
				case DIRECTION_TOP:
					animator = ObjectAnimator.ofFloat(hippyRootView, "translationY", -getHeight(), 0);
					break;
				case DIRECTION_BOTTOM:
					animator = ObjectAnimator.ofFloat(hippyRootView, "translationY", getHeight(), 0);
					break;
				case DIRECTION_LEFT:
					animator = ObjectAnimator.ofFloat(hippyRootView, "translationX", -getWidth(), 0);
					break;
				case DIRECTION_RIGHT:
				default:
					// 默认值就是"right"
					animator = ObjectAnimator.ofFloat(hippyRootView, "translationX", getWidth(), 0);
					break;
			}
			if (animator != null)
				animator.start();
		}
	}


	@Override
	protected void onLayout(boolean change, int l, int t, int r, int b)
	{
		//        super.onLayout(b, i, i1, i2, i3);

		int childCount = getChildCount();

		for (int i = 0; i < childCount; i++)
		{
			getChildAt(i).layout(0, 0, getWidth(), getHeight());
		}
	}

	public void init(HippyRootView hippyRootView)
	{
		addView(hippyRootView);
	}


	@Override
	public void onAnimationEnd(Animator animator)
	{
		super.onAnimationEnd(animator);

		final View chileView = (View) ((ObjectAnimator) animator).getTarget();
		NavigatorController.destroyInstance(chileView);
		animator.removeAllListeners();

		post(new Runnable()
		{
			@Override
			public void run()
			{
				removeView(chileView);
			}
		});
	}

	public void pop(boolean animated, String toDirection)
	{
		final View childView = getChildAt(getChildCount() - 1);
		if (animated)
		{
			Animator animator = null;
			switch (toDirection == null ? "" : toDirection)
			{
				case DIRECTION_TOP:
					animator = ObjectAnimator.ofFloat(childView, "translationY", 0, -getHeight());
					break;
				case DIRECTION_BOTTOM:
					animator = ObjectAnimator.ofFloat(childView, "translationY", 0, getHeight());
					break;
				case DIRECTION_LEFT:
					animator = ObjectAnimator.ofFloat(childView, "translationX", 0, -getWidth());
					break;
				case DIRECTION_RIGHT:
				default:
					// 默认值就是"right"
					animator = ObjectAnimator.ofFloat(childView, "translationX", 0, getWidth());;
					break;
			}
			if (animator != null)
			{
				animator.addListener(this);
				animator.start();
			}
		}
		else
		{
			NavigatorController.destroyInstance(childView);
			removeView(childView);
		}
	}
}
