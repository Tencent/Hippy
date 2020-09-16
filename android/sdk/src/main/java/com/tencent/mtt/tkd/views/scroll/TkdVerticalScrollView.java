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
package com.tencent.mtt.tkd.views.scroll;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.os.Build;
import android.util.Log;
import android.view.MotionEvent;
import android.widget.ScrollView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.scroll.HippyVerticalScrollView;

public class TkdVerticalScrollView extends HippyVerticalScrollView implements TkdScrollView
{
	private int mPreloadDistance       = 0;
	private boolean mIsLoading         = false;

	public TkdVerticalScrollView(Context context)
	{
		super(context);
        mScrollMinOffset = (int)PixelUtil.dp2px(5);
        mPreloadDistance = (int)PixelUtil.dp2px(200);
	}

	@Override
	public void setPreloadDistance(int preloadDistance)
	{
		preloadDistance = Math.max(0, preloadDistance);
		mPreloadDistance = (int)PixelUtil.dp2px(preloadDistance);
	}

	@Override
	public void callLoadMoreFinish() {
		mIsLoading = false;
	}

	@Override
	public void callScrollToTop(boolean isSmoothScroll) {
		if (isSmoothScroll) {
			smoothScrollTo(0, 0);
		} else {
			scrollTo(0, 0);
		}
	}

	@Override
	protected void onScrollChanged(int x, int y, int oldX, int oldY)
	{
		super.onScrollChanged(x, y, oldX, oldY);
		if (mPreloadDistance > 0 && !mIsLoading && shouldEmitEndReachedEvent(y, oldY)) {
			TkdScrollViewEventHelper.emitScrollEndReachedEvent(this);
			mIsLoading = true;
		}
	}

	@Override
	public void callScrollToPosition(int distance, int duration, final Promise promise) {
		int offset = getScrollY() + distance;
		if (duration <= 0) {
			scrollTo(0, offset);
			if (promise != null) {
				HippyMap resultMap = new HippyMap();
				resultMap.pushString("msg", "on scroll end!");
				promise.resolve(resultMap);
			}
		} else {
			ObjectAnimator xTranslate = ObjectAnimator.ofInt(this, "scrollX", 0);
			ObjectAnimator yTranslate = ObjectAnimator.ofInt(this, "scrollY", offset);

			AnimatorSet animators = new AnimatorSet();
			animators.setDuration(duration);
			animators.playTogether(xTranslate, yTranslate);
			animators.addListener(new Animator.AnimatorListener() {
				@Override
				public void onAnimationStart(Animator arg0) {
					// TODO Auto-generated method stub
				}
				@Override
				public void onAnimationRepeat(Animator arg0) {
					// TODO Auto-generated method stub
				}
				@Override
				public void onAnimationEnd(Animator arg0) {
					// TODO Auto-generated method stub
					if (promise != null) {
						HippyMap resultMap = new HippyMap();
						resultMap.pushString("msg", "on scroll end!");
						promise.resolve(resultMap);
					}
				}
				@Override
				public void onAnimationCancel(Animator arg0) {
					// TODO Auto-generated method stub
				}
			});
			animators.start();
		}
	}

	private boolean shouldEmitEndReachedEvent(int y, int oldY) {
		int contentHeight = getHeight();
		int layoutHeight = getHeight();

		if (getChildCount() > 0) {
			contentHeight = getChildAt(0).getHeight();
		}

		if (contentHeight <= layoutHeight || contentHeight < mPreloadDistance) {
			return true;
		}

		int offset = y + layoutHeight;
		if (y > 0 && y > oldY && (offset >= (contentHeight - mPreloadDistance))) {
			return true;
		}

		return false;
	}

}
