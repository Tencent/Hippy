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
import android.widget.HorizontalScrollView;
import com.tencent.mtt.hippy.views.scroll.HippyHorizontalScrollView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.supportui.views.ScrollChecker;

public class TkdHorizontalScrollView extends HippyHorizontalScrollView implements TkdScrollView
{
	private int mPreloadDistance       = 0;
	private boolean mIsLoading         = false;
	private float mLastScrollX         = 0;

	public TkdHorizontalScrollView(Context context)
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
		setLoadMoreState(false);
	}

	private void setLoadMoreState(boolean isLoading) {
		mIsLoading = isLoading;
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
	public boolean onTouchEvent(MotionEvent event) {
		int action = event.getAction() & MotionEvent.ACTION_MASK;
		if (action == MotionEvent.ACTION_MOVE && !mIsLoading) {
			if (getScrollX() == 0) {
				if (mLastScrollX == 0) {
					mLastScrollX = event.getX();
				} else if (event.getX() > mLastScrollX) {
					TkdScrollViewEventHelper.emitScrollStartReachedEvent(this);
					setLoadMoreState(true);
					mLastScrollX = 0;
				}
			} else if (getChildCount() > 0) {
			    int contentWidth = getChildAt(0).getWidth();
                if ((getScrollX() + getWidth()) >= (contentWidth - 2)) {
                    if (mLastScrollX == 0) {
                        mLastScrollX = event.getX();
                    } else if (event.getX() < mLastScrollX) {
                        TkdScrollViewEventHelper.emitScrollEndReachedEvent(this);
						setLoadMoreState(true);
                        mLastScrollX = 0;
                    }
                }
            }
		}

		return super.onTouchEvent(event);
	}

	@Override
	protected void onScrollChanged(int x, int y, int oldX, int oldY)
	{
		super.onScrollChanged(x, y, oldX, oldY);
		if (mPreloadDistance > 0 && !mIsLoading) {
			if (shouldEmitEndReachedEvent(x, oldX)) {
				TkdScrollViewEventHelper.emitScrollEndReachedEvent(this);
				setLoadMoreState(true);
			} else if (shouldEmitStartReachedEvent(x, oldX)) {
				TkdScrollViewEventHelper.emitScrollStartReachedEvent(this);
				setLoadMoreState(true);
			}
		}
	}

	@Override
	public void callScrollToPosition(int distance, int duration, final Promise promise) {
		int offset = getScrollX() + distance;
		if (duration <= 0) {
			scrollTo(offset, 0);
			if (promise != null) {
				HippyMap resultMap = new HippyMap();
				resultMap.pushString("msg", "on scroll end!");
				promise.resolve(resultMap);
			}
		} else {
			ObjectAnimator xTranslate = ObjectAnimator.ofInt(this, "scrollX", offset);
			ObjectAnimator yTranslate = ObjectAnimator.ofInt(this, "scrollY", 0);

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

	private boolean shouldEmitStartReachedEvent(int x, int oldX) {
		if (x < oldX && x < mPreloadDistance) {
			return true;
		}

		return false;
	}

	private boolean shouldEmitEndReachedEvent(int x, int oldX) {
		int contentWidth = getWidth();
		int layoutWidth = getWidth();

		if (getChildCount() > 0) {
			contentWidth = getChildAt(0).getWidth();
		}

		if (contentWidth <= layoutWidth || contentWidth < mPreloadDistance) {
			return true;
		}

		int offset = x + layoutWidth;
		if (x > 0 && x > oldX && (offset >= (contentWidth - mPreloadDistance))) {
			return true;
		}

		return false;
	}
}
