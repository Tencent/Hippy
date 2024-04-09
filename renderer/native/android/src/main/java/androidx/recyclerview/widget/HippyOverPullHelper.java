/* Tencent is pleased to support the open source community by making easy-recyclerview-helper available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company. All rights reserved.
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

package androidx.recyclerview.widget;

import static android.view.View.OVER_SCROLL_NEVER;

import android.animation.Animator;
import android.animation.ValueAnimator;
import android.view.MotionEvent;
import android.view.ViewConfiguration;
import android.view.animation.DecelerateInterpolator;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView.OnScrollListener;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerView;
import com.tencent.mtt.hippy.views.hippylist.RecyclerViewEventHelper;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.AnimatorListenerBase;
import com.tencent.mtt.hippy.views.waterfall.HippyWaterfallView;

/**
 * Created on 2021/3/15. Description 原生recyclerView是不支持拉到最顶部，还可以继续拉动，要实现继续拉动，并且松手回弹的效果
 * recyclerView上拉回弹和下拉回弹的效果实现
 */
public class HippyOverPullHelper {

    private static final int DURATION = 150;
    private final OnScrollListener listener;
    protected float lastRawY = -1;
    protected float downRawY = -1;

    private int overPullState = OVER_PULL_NONE;
    public static final int OVER_PULL_NONE = 0;
    public static final int OVER_PULL_DOWN_ING = 1;
    public static final int OVER_PULL_UP_ING = 2;
    public static final int OVER_PULL_NORMAL = 3;
    public static final int OVER_PULL_SETTLING = 4;

    private ValueAnimator animator;
    private boolean enableOverDrag = true;
    private int lastOverScrollMode = -1;
    private boolean isRollBacking = false;
    private HippyOverPullListener overPullListener = null;
    private RecyclerViewBase recyclerView;
    private int scrollState;
    private boolean enableOverPullUp = true;
    private boolean enableOverPullDown = true;

    public HippyOverPullHelper(RecyclerViewBase recyclerView) {
        this.recyclerView = recyclerView;
        lastOverScrollMode = recyclerView.getOverScrollMode();
        listener = new OnScrollListener() {
            @Override
            public void onScrollStateChanged(@NonNull RecyclerView recyclerView, int newState) {
                if (scrollState != newState && newState == RecyclerView.SCROLL_STATE_IDLE) {
                    rollbackToBottomOrTop();
                }
                scrollState = newState;
            }
        };
        recyclerView.addOnScrollListener(listener);
    }

    public void destroy() {
        recyclerView.removeOnScrollListener(listener);
    }

    private int getTouchSlop() {
        final ViewConfiguration vc = ViewConfiguration.get(recyclerView.getContext());
        return vc.getScaledTouchSlop();
    }

    public void setOverPullListener(HippyOverPullListener overPullListener) {
        this.overPullListener = overPullListener;
    }

    private boolean isMoving(MotionEvent event) {
        return lastRawY > 0 && Math.abs(event.getRawY() - downRawY) > getTouchSlop();
    }

    public boolean onTouchEvent(MotionEvent event) {
        if (isRollBacking) {
            return true;
        }
        if (checkOverDrag(event)) {
            return true;
        }
        return false;
    }

    /**
     * 检测是否处于顶部过界拉取，或者顶部过界拉取
     */
    private boolean checkOverDrag(MotionEvent event) {
        if (!enableOverDrag) {
            return false;
        }
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                lastRawY = event.getRawY();
                downRawY = event.getRawY();
                break;
            case MotionEvent.ACTION_MOVE:
                int offset = recyclerView.computeVerticalScrollOffset();
                boolean overPullDown = isOverPullDown(event, offset);
                boolean overScrollUp = isOverPullUp(event, offset);
                if ((overPullDown || overScrollUp)) {
                    recyclerView.setOverScrollMode(OVER_SCROLL_NEVER);
                    recyclerView.invalidateGlows();
                    if (overPullDown) {
                        setOverPullState(OVER_PULL_DOWN_ING);
                    } else {
                        setOverPullState(OVER_PULL_UP_ING);
                    }
                    Number deltaY = (event.getRawY() - lastRawY) / 3.0f;
                    LogUtils.e("maxli", "checkOverDrag: deltaY " + deltaY + ", offset " + offset);
                    recyclerView.offsetChildrenVertical(deltaY.intValue());
                    if (overPullListener != null) {
                        overPullListener.onOverPullStateChanged(overPullState, overPullState,
                                getOverPullOffset());
                    }
                } else {
                    setOverPullState(OVER_PULL_NORMAL);
                }
                lastRawY = event.getRawY();
                if (overPullState == OVER_PULL_DOWN_ING || overPullState == OVER_PULL_UP_ING) {
                    return true;
                }
                break;
            default:
                reset();
        }
        return false;
    }

    /**
     * 在松开手后， 1、如果当前处于fling状态，scrollState的值是SCROLL_STATE_SETTLING，先不做rollbackToBottomOrTop
     * 等到onScrollStateChanged 变成 IDLE的时候，再做rollbackToBottomOrTop
     * 2、如果当前处于非fling状态，scrollState的值不是SCROLL_STATE_SETTLING，就立即做rollbackToBottomOrTop
     */
    public void handleEventUp(MotionEvent event) {
        if (isActionUpOrCancel(event)) {
            revertOverScrollMode();
            if (recyclerView.getScrollState() != RecyclerView.SCROLL_STATE_SETTLING) {
                rollbackToBottomOrTop();
            }
        }
    }

    private void revertOverScrollMode() {
        if (lastOverScrollMode != -1) {
            recyclerView.setOverScrollMode(lastOverScrollMode);
        }
    }

    private int getOverPullOffset() {
        if (overPullState == OVER_PULL_DOWN_ING) {
            return getOverPullDownOffset();
        } else if (overPullState == OVER_PULL_UP_ING) {
            return getOverPullUpOffset();
        }
        return 0;
    }

    void setOverPullState(int newOverPullState) {
        if (overPullListener != null) {
            overPullListener.onOverPullStateChanged(overPullState, newOverPullState,
                    getOverPullOffset());
        }
        overPullState = newOverPullState;
    }

    /**
     * 因为可能出现越界拉取，松手后需要回退到原来的位置，要么回到顶部，要么回到底部
     */
    void rollbackToBottomOrTop() {
        int distanceToTop = recyclerView.computeVerticalScrollOffset();
        if (distanceToTop < 0) {
            //顶部空出了一部分，需要回滚上去
            rollbackTo(distanceToTop, 0);
        } else {
            //底部空出一部分，需要混滚下去
            int overPullUpOffset = getOverPullUpOffset();
            if (overPullUpOffset != 0) {
                rollbackTo(overPullUpOffset, 0);
            }
        }
    }

    /**
     * 计算底部被overPull的偏移，需要向下回滚的距离 要么出现底部内容顶满distanceToBottom，要么出现顶部内容顶满distanceToTop，取最小的那一个
     *
     * @return
     */
    public int getOverPullUpOffset() {
        int contentOffset = recyclerView.computeVerticalScrollOffset();
        int verticalScrollRange = recyclerView.computeVerticalScrollRange();
        int blankHeightToBottom = contentOffset + recyclerView.getHeight() - verticalScrollRange;
        if (blankHeightToBottom > 0 && contentOffset > 0) {
            return Math.min(blankHeightToBottom, contentOffset);
        }
        return 0;
    }

    private boolean isActionUpOrCancel(MotionEvent event) {
        return event.getAction() == MotionEvent.ACTION_UP
                || event.getAction() == MotionEvent.ACTION_CANCEL;
    }

    private void endAnimation() {
        if (animator != null) {
            animator.removeAllListeners();
            animator.removeAllUpdateListeners();
            animator.end();
            animator = null;
        }
        isRollBacking = false;
    }

    /**
     * 回弹动画的接口
     */
    private void rollbackTo(int from, int to) {
        endAnimation();
        animator = ValueAnimator.ofInt(from, to);
        animator.setInterpolator(new DecelerateInterpolator());
        animator.addUpdateListener(new RollbackUpdateListener(from));
        animator.addListener(new AnimatorListenerBase() {
            @Override
            public void onAnimationEnd(Animator animation) {
                if (overPullListener != null) {
                    overPullListener.onOverPullAnimationUpdate(true);
                }
                setOverPullState(OVER_PULL_NONE);
                isRollBacking = false;
            }
        });
        isRollBacking = true;
        animator.setDuration(DURATION).start();
    }

    private void reset() {
        revertOverScrollMode();
        lastRawY = -1;
        downRawY = -1;
    }

    /**
     * 顶部是否可以越界下拉，拉出一段空白区域，越界的部分最多不能超过RecyclerView高度+1
     */
    private boolean isOverPullDown(MotionEvent event, int offset) {
        if (!enableOverPullDown) {
            return false;
        }
        //常规情况，内容在顶部offset为0，异常情况，内容被完全拉到最底部，看不见内容的时候，offset也为0
        int dy = Math.abs((int) (event.getRawY() - lastRawY)) + 1;
        //不能把内容完全拉得看不见
        if (Math.abs(offset) + dy < recyclerView.getHeight()) {
            return isMoving(event) && isPullDownAction(event, offset) && !canOverPullDown();
        }
        return false;
    }

    /**
     * 底部是否可以越界上拉，拉出一段空白区域，越界的部分最多不能超过RecyclerView高度的一般
     */
    private boolean isOverPullUp(MotionEvent event, int offset) {
        if (!enableOverPullUp) {
            return false;
        }
        int dy = Math.abs((int) (event.getRawY() - lastRawY)) + 1;
        //不能让内容完全被滚出屏幕，否则computeVerticalScrollOffset为0是一个无效的值
        int distanceToBottom =
                offset + recyclerView.getHeight() - recyclerView.computeVerticalScrollRange();
        if (distanceToBottom + dy < recyclerView.getHeight()) {
            return isMoving(event) && isPullUpAction(event, offset) && !canOverPullUp();
        }
        return false;
    }

    boolean isPullDownAction(MotionEvent event, int offset) {
        if (overPullState == OVER_PULL_DOWN_ING && offset < 0
                && recyclerView instanceof HippyWaterfallView) {
            return true;
        }
        return event.getRawY() - lastRawY > 0;
    }

    boolean isPullUpAction(MotionEvent event, int offset) {
        if (overPullState == OVER_PULL_UP_ING && offset > 0
                && recyclerView instanceof HippyWaterfallView) {
            return true;
        }
        return event.getRawY() - lastRawY <= 0;
    }

    /**
     * 顶部还有内容，还可以向下拉到
     */
    boolean canOverPullDown() {
        return recyclerView.canScrollVertically(-1);
    }

    /**
     * 底部还有内容，还可以向上拉动
     */
    boolean canOverPullUp() {
        return recyclerView.canScrollVertically(1);
    }

    public int getOverPullState() {
        return overPullState;
    }

    /**
     * 下拉的时候，返回值<0,表示顶部被下拉了一部分距离
     */
    public int getOverPullDownOffset() {
        if (overPullState == OVER_PULL_DOWN_ING) {
            return recyclerView.computeVerticalScrollOffset();
        }
        return 0;
    }

    private class RollbackUpdateListener implements ValueAnimator.AnimatorUpdateListener {

        int currentValue;
        int totalConsumedY;

        RollbackUpdateListener(int fromValue) {
            currentValue = fromValue;
        }

        @Override
        public void onAnimationUpdate(ValueAnimator animation) {
            if (recyclerView.isDataChangedWithoutNotify()) {
                //由于动画是一个异步操作，做动画的时候，recyclerView的adapter状态已经变化，但是没有进行notify，导致state和adapter
                //的itemCount对不齐，比如hippy场景，直接把recyclerView的renderNode删除了，adapter的itemCount直接变为0，
                //由于没有notifyDatSetChange，state的itemCount不为0，这样就会出现validateViewHolderForOffsetPosition报
                //IndexOutOfBoundsException
                return;
            }
            int value = (int) animation.getAnimatedValue();
            int[] consumed = new int[2];
            int dy = value - currentValue;
            //dy>0 上回弹，列表内容向上滚动，慢慢显示底部的内容;dy<0 下回弹，列表内容向下滚动，慢慢显示顶部的内容
            recyclerView.scrollStep(0, dy, consumed);
            int consumedY = consumed[1];
            totalConsumedY += consumedY;
            //consumedY是排版view消耗的Y的距离,没有内容填充，即consumedY为0，需要强行offsetChildrenVertical
            int leftOffset = consumedY - dy;
            if (leftOffset != 0) {
                //leftOffset<0 向上回弹，leftOffset>0  向下回弹
                recyclerView.offsetChildrenVertical(leftOffset);
            }
            if (overPullListener != null) {
                overPullListener.onOverPullAnimationUpdate(false);
            }
            setOverPullState(OVER_PULL_SETTLING);
            currentValue = value;
        }
    }

    public void enableOverPullUp(boolean enable) {
        this.enableOverPullUp = enable;
    }

    public void enableOverPullDown(boolean enable) {
        this.enableOverPullDown = enable;
    }
}
