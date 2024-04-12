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
package com.tencent.mtt.hippy.views.refresh;

import android.animation.Animator;
import android.animation.ObjectAnimator;
import android.content.Context;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.AccelerateInterpolator;

import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.common.ClipChildrenView;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewWrapper;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;
import com.tencent.renderer.utils.EventUtils;
import java.util.HashMap;
import java.util.Map;

@SuppressWarnings({"deprecation", "unused"})
public class RefreshWrapper extends HippyViewGroup implements ClipChildrenView {

    RefreshWrapperItemView mRefreshWrapperItemView;
    View mContentView;

    float mTansY = -1;
    float mStartTransY = 0;
    float mStartY = 0;
    float mStartDownY = -1;
    float mStartX = 0;

    RefreshState mState = RefreshState.Init;

    int mBounceTime = 300;
    protected boolean mScrollEventEnable = true;
    protected int mScrollEventThrottle = 400;  // 400ms最多回调一次
    private long mLastScrollEventTimeStamp = -1;

    public void refreshComplected() {
        bounceToHead(0);
        mState = RefreshState.Init;
    }

    public void setTime(int time) {
        this.mBounceTime = time;
    }

    enum RefreshState {
        Init,
        Loading,
    }

    public RefreshWrapper(Context context) {
        super(context);
        setClipChildren(true);
    }

    void setSTranslationY(float y) {
        if (mRefreshWrapperItemView != null) {
            mRefreshWrapperItemView.setTranslationY(y > 0 ? y : 0);
        }
        if (mContentView != null) {
            mContentView.setTranslationY(y > 0 ? y : 0);
        }
    }

    public void setOnScrollEventEnable(boolean enable) {
        mScrollEventEnable = enable;
    }

    public void setScrollEventThrottle(int scrollEventThrottle) {
        mScrollEventThrottle = scrollEventThrottle;
    }

    void bounceToHead(float toTransY) {
        if (mContentView != null && mRefreshWrapperItemView != null) {
            Animator contentAnimator = ObjectAnimator
                    .ofFloat(mContentView, "TranslationY", mContentView.getTranslationY(),
                            toTransY);
            contentAnimator.setDuration(mBounceTime);
            contentAnimator.setInterpolator(new AccelerateInterpolator());
            Animator wrapperAnimator = ObjectAnimator
                    .ofFloat(mRefreshWrapperItemView, "TranslationY",
                            mRefreshWrapperItemView.getTranslationY(),
                            toTransY);
            wrapperAnimator.setInterpolator(new AccelerateInterpolator());
            wrapperAnimator.setDuration(mBounceTime);
            contentAnimator.start();
            wrapperAnimator.start();
        }
    }


    float getCompactScrollY() {
        if (mContentView instanceof HippyRecyclerViewWrapper) {
            return ((HippyRecyclerViewWrapper) mContentView).getRecyclerView().getContentOffsetY();
        }
        return mContentView.getScrollY();
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        float nowMoveY = event.getRawY();
        float nowMoveX = event.getRawX();
        if (mContentView != null && mRefreshWrapperItemView != null) {
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    mStartY = event.getRawY();
                    mStartX = event.getRawX(); //记录首次DOWN的位置
                    mStartTransY = mRefreshWrapperItemView.getTranslationY();

                    break;
                case MotionEvent.ACTION_MOVE:

                    if (nowMoveY - mStartY > 0) {
                        float scrollY = getCompactScrollY();

                        if (scrollY == 0) {
                            if (mStartDownY == -1) {
                                mStartDownY = nowMoveY;
                            } else {
                                mTansY = (nowMoveY - mStartDownY) / 3;
                                setSTranslationY(mTansY + mStartTransY);
                                //把y的偏移值返回给js侧,这里把偏移值转换为负数，方便前端理解
                                sendOnScrollEvent(-mTansY);
                            }

                            //如果垂直滚动得比水平滚动得多，就认为当前用户手势是一个上下拉，RefreshWrapper就把事件吃掉，RefreshWrapper里面的孩子就收不到事件了
                            //否则RefreshWrapper里面的孩子能收到事件，ViewPager还能继续处理左右滚动事件。
                            if (Math.abs(nowMoveX - mStartX) < Math.abs((nowMoveY - mStartY))) {
                                return true;
                            }
                        }
                    } else {
                        if (mState == RefreshState.Loading) {
                            float dis = nowMoveY - mStartY;
                            if (mRefreshWrapperItemView.getTranslationY() > 0) {
                                setSTranslationY(mStartTransY + dis);
                                //如果垂直滚动得比水平滚动得多，就认为当前用户手势是一个上下拉，RefreshWrapper就把事件吃掉，RefreshWrapper里面的孩子就收不到事件了
                                //否则RefreshWrapper里面的孩子能收到事件，ViewPager还能继续处理左右滚动事件。
                                if (Math.abs(nowMoveX - mStartX) < Math.abs(dis)) {
                                    return true;
                                }
                            }
                        }
                    }
                    break;
                case MotionEvent.ACTION_UP:
                    if (mState == RefreshState.Init) {
                        if (mTansY < mRefreshWrapperItemView.getHeight()
                                && mRefreshWrapperItemView.getTranslationY() > 0) {
                            bounceToHead(0);
                            //如果是水平滚动，不发送cancle事件。
                            if (Math.abs(nowMoveX - mStartX) < Math.abs((nowMoveY - mStartY))) {
                                sendCancelEvent(event);
                            }
                        } else if (mTansY > mRefreshWrapperItemView.getHeight()) {
                            startRefresh();
                            //如果是水平滚动，不发送cancle事件。
                            if (Math.abs(nowMoveX - mStartX) < Math.abs((nowMoveY - mStartY))) {
                                sendCancelEvent(event);
                            }
                        }
                    } else if (mState == RefreshState.Loading) {
                        if (mRefreshWrapperItemView.getTranslationY() > mRefreshWrapperItemView
                                .getHeight()) {
                            startRefresh();
                            //如果是水平滚动，不发送cancle事件。
                            if (Math.abs(nowMoveX - mStartX) < Math.abs((nowMoveY - mStartY))) {
                                sendCancelEvent(event);
                            }
                        }
                    }
                    mStartDownY = -1;
                    break;
            }
        }
        return super.dispatchTouchEvent(event);
    }

    public void sendCancelEvent(MotionEvent event) {
        MotionEvent motionEvent = MotionEvent.obtain(event);
        motionEvent.setAction(MotionEvent.ACTION_CANCEL);
        mContentView.dispatchTouchEvent(motionEvent);
    }


    public void startRefresh() {
        mTansY = -1;
        bounceToHead(mRefreshWrapperItemView.getHeight());
        mState = RefreshState.Loading;
        EventUtils.sendComponentEvent(this, EventUtils.EVENT_REFRESH_WRAPPER_REFRESH, null);
    }

    public void sendOnScrollEvent(float y) {
        if (mScrollEventEnable) {
            long currTime = System.currentTimeMillis();
            if (currTime - mLastScrollEventTimeStamp < mScrollEventThrottle) {
                return;
            }
            EventUtils.sendComponentEvent(this, EventUtils.EVENT_REFRESH_WRAPPER_SCROLL, generateScrollEvent(y));
            mLastScrollEventTimeStamp = currTime;
        }
    }

    private Map<String, Object> generateScrollEvent(float y) {
        Map<String, Object> contentOffset = new HashMap<>();
        contentOffset.put("x", PixelUtil.px2dp(0));
        contentOffset.put("y", PixelUtil.px2dp(y));
        Map<String, Object> event = new HashMap<>();
        event.put("contentOffset", contentOffset);
        return event;
    }

    @Override
    public void addView(View child, int index) {
        if (child instanceof RefreshWrapperItemView) {
            mRefreshWrapperItemView = (RefreshWrapperItemView) child;
        } else {
            mContentView = child;
        }
        super.addView(child, index);
    }

}
