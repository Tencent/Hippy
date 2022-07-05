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

package com.tencent.mtt.hippy.views.hippypager;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Scroller;
import androidx.annotation.NonNull;
import androidx.viewpager.widget.ViewPager;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.hippypager.transform.VerticalPageTransformer;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPagerItem;
import com.tencent.mtt.supportui.views.ScrollChecker;
import java.lang.reflect.Field;
import java.lang.reflect.Method;


public class HippyPager extends ViewPager implements HippyViewBase {

    private static final String TAG = "HippyViewPager";
    private final Handler handler = new Handler(Looper.getMainLooper());
    private NativeGestureDispatcher gestureDispatcher;
    private boolean scrollEnabled = true;
    private boolean firstUpdateChild = true;
    private Promise callBackPromise;
    private boolean isVertical = false;
    private Scroller scroller;
    private boolean ignoreCheck;
    private boolean dataUpdated = false;
    private boolean isFirstLayoutSucceed = false;
    private PageSelectNotifier pageSelectNotifier = new PageSelectNotifier();
    private Runnable measureAndLayout = () -> {
        if (readyToLayout()) {
            measure(MeasureSpec.makeMeasureSpec(getWidth(), MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(getHeight(), MeasureSpec.EXACTLY));
            layout(getLeft(), getTop(), getRight(), getBottom());
        }
    };


    public HippyPager(Context context, boolean isVertical) {
        super(context);
        this.isVertical = isVertical;
        init();
    }

    public HippyPager(Context context) {
        super(context);
        init();
    }

    private void init() {
        addOnPageChangeListener(new HippyPagerPageChangeListener(this));
        setAdapter(createAdapter());
        initViewPager();
        initScroller();
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        super.onLayout(changed, l, t, r, b);
        isFirstLayoutSucceed = readyToLayout();
    }

    /**
     * onLayout有效排版需要两个条件，两个条件都满足才算首次有效排版
     * 1、是dataUpdated 数据已经上屏
     * 2、有windowToken，表示viewPager排版上屏，已经有宽高
     */
    private boolean readyToLayout() {
        return dataUpdated && getWindowToken() != null;
    }

    @Override
    public void addOnPageChangeListener(@NonNull OnPageChangeListener listener) {
        super.addOnPageChangeListener(listener);
        pageSelectNotifier.addOnPageChangeListener(listener);
    }

    @Override
    public void removeOnPageChangeListener(@NonNull OnPageChangeListener listener) {
        super.removeOnPageChangeListener(listener);
        pageSelectNotifier.removeOnPageChangeListener(listener);
    }

    @Override
    public void clearOnPageChangeListeners() {
        super.clearOnPageChangeListeners();
        pageSelectNotifier.clearOnPageChangeListeners();
    }

    public int getCurrentPage() {
        return getCurrentItem();
    }


    protected void initViewPager() {
        if (isVertical) {
            setPageTransformer(true, new VerticalPageTransformer());
            // The easiest way to get rid of the overscroll drawing that happens on the left and right
            setOverScrollMode(OVER_SCROLL_NEVER);
        }
    }

    public int getPageCount() {
        return getAdapter() == null ? 0 : getAdapter().getCount();
    }

    public Object getCurrentItemView() {
        if (getAdapter() != null) {
            return getAdapter().getCurrentItemObj();
        }
        return null;
    }

    public void setCallBackPromise(Promise promise) {
        callBackPromise = promise;
    }

    public Promise getCallBackPromise() {
        return callBackPromise;
    }

    protected HippyPagerAdapter createAdapter() {
        return new HippyPagerAdapter(this);
    }

    public void setInitialPageIndex(final int index) {
        LogUtils.d(TAG, HippyPager.this.getClass().getName() + " " + "setInitialPageIndex=" + index);
        setCurrentItem(index);//可能不会生效，因为当前viewPager可能没有初始化数据
        setDefaultItem(index);
    }

    public void setChildCountAndUpdate(final int childCount) {
        LogUtils.d(TAG, "doUpdateInternal: " + hashCode() + ", childCount=" + childCount);
        dataUpdated = true;
        getAdapter().setChildSize(childCount);
        getAdapter().notifyDataSetChanged();
        triggerRequestLayout();
        if (firstUpdateChild) {
            //首次更新，ViewPager不会触发onPageSelected的分发通知，这里需要手动补一个首次事件
            pageSelectNotifier.notifyPageSelected(getCurrentItem());
            firstUpdateChild = false;
        }
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        //当viewPager重新挂着当时候，调用super.onAttachedToWindow 把mFirstLayout 设置为true
        //这样滑动viewPager，放手后，不会触发自动滚动，原因是mFirstLayout为true，setCurrentItemInternal,
        //走了requestLayout,这样会没有动画
        setFirstLayout(false);
        //onAttach可能在dataUpdated后面执行，onAttach的时候，需要check一下，是否需要再次触发triggerRequestLayout
        //如果这里不check一次triggerRequestLayout，那么前面setChildCountAndUpdate的那一次triggerRequestLayout
        //会因为viewPager没有上屏，宽高为0，而变得没有任何的作用，这样会出现白屏的的问题。
        if (!isFirstLayoutSucceed) {
            triggerRequestLayout();
        }
    }

    public void addViewToAdapter(HippyViewPagerItem view, int position) {
        HippyPagerAdapter adapter = getAdapter();
        if (adapter != null) {
            adapter.addView(view, position);
        }
    }

    protected int getAdapterViewSize() {
        HippyPagerAdapter adapter = getAdapter();
        if (adapter != null) {
            return adapter.getItemViewSize();
        }
        return 0;
    }

    protected void removeViewFromAdapter(HippyViewPagerItem view) {
        HippyPagerAdapter adapter = getAdapter();
        if (adapter != null) {
            adapter.removeView(view);
        }
    }

    public View getViewFromAdapter(int currentItem) {
        HippyPagerAdapter adapter = getAdapter();
        if (adapter != null) {
            return adapter.getViewAt(currentItem);
        }
        return null;
    }

    @Override
    public HippyPagerAdapter getAdapter() {
        return (HippyPagerAdapter) super.getAdapter();
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        resetIgnoreCheck(ev);
        if (!scrollEnabled) {
            return false;
        }
        if (isVertical) {
            boolean intercepted = super.onInterceptTouchEvent(swapXY(ev));
            swapXY(ev); // return touch coordinates to original reference frame for any child views
            return intercepted;
        }
        return super.onInterceptTouchEvent(ev);
    }

    @Override
    public boolean onTouchEvent(MotionEvent ev) {
        resetIgnoreCheck(ev);
        if (!scrollEnabled) {
            return false;
        }
        if (isVertical) {
            return super.onTouchEvent(swapXY(ev));
        }
        return super.onTouchEvent(ev);
    }

    private void resetIgnoreCheck(MotionEvent ev) {
        if (ev.getAction() == MotionEvent.ACTION_DOWN || ev.getAction() == MotionEvent.ACTION_UP
                || ev.getAction() == MotionEvent.ACTION_CANCEL) {
            ignoreCheck = false;
        }
    }

    public void switchToPage(int item, boolean animated) {
        if (getAdapter() == null || getAdapter().getCount() == 0) {
            //1、setChildCountAndUpdate 还没有调用前，ViewPager的Adapter还没有初始化，通过反射，修改viewPager的默认Item
            //当调用了setChildCountAndUpdate后，会不发一次onPageSelected给到前端
            setDefaultItem(item);
        } else {
            if (getCurrentItem() != item) {
                //2、执行正常的切换Item的操作，会正常回调onPageSelected事件给到前端
                stopAnimationAndScrollToFinal();
                setCurrentItem(item, animated);
            } else if (!firstUpdateChild) {
                //3、本身当前已经在item的这个位置，就不需要调用setCurrentItem，但是前端还是要求通知一次事件onPageSelected
                pageSelectNotifier.notifyPageSelected(item);
            }
        }
    }


    @Override
    public boolean canScrollHorizontally(int direction) {
        if (!scrollEnabled) {
            return false;
        }
        return super.canScrollHorizontally(direction);
    }

    @Override
    public boolean canScrollVertically(int direction) {
        if (!scrollEnabled) {
            return false;
        }
        return super.canScrollVertically(direction);
    }

    /**
     * 如果仍然在滑动中，重置一下状态，abortAnimation ,getScrollX 会处于mFinalX的状态，直接scrollTo到mFinalX
     */
    private void stopAnimationAndScrollToFinal() {
        if (!scroller.isFinished()) {
            invokeSetScrollingCacheEnabled(false);
            if (scroller != null) {
                scroller.abortAnimation();
                int oldX = getScrollX();
                int oldY = getScrollY();
                int x = scroller.getCurrX();
                int y = scroller.getCurrY();
                if (oldX != x || oldY != y) {
                    scrollTo(x, y);
                }
            }
            invokeSetScrollState(SCROLL_STATE_IDLE);
        }
    }

    public void setScrollEnabled(boolean scrollEnabled) {
        this.scrollEnabled = scrollEnabled;
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return gestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher nativeGestureDispatcher) {
        gestureDispatcher = nativeGestureDispatcher;
    }

    public void triggerRequestLayout() {
        //对象构造的时候，就会调用到这里，必须判空
        if (handler != null) {
            handler.removeCallbacks(measureAndLayout);
            handler.post(measureAndLayout);
        }
    }

    public void setOverflow(String overflow) {
        //robinsli Android 支持 overflow: visible，超出容器之外的属性节点也可以正常显示
        if (!TextUtils.isEmpty(overflow)) {
            switch (overflow) {
                case "visible":
                    setClipChildren(false); //可以超出父亲区域
                    break;
                case "hidden": {
                    setClipChildren(true); //默认值是false
                    break;
                }
            }
        }
        invalidate();
    }

    public void onOverScrollSuccess() {
        invokeSetIsUnableToDrag(false);
        ignoreCheck = true;
    }


    /**
     * viewpPager的孩子已经滚动到底了，已经不能继续滚动了，会触发通过onOverScroll事件，告诉
     * viewPager的进行继续，需要执行onOverScrollSuccess，让viewPager开始滚动
     * 会让mIsUnableToDrag设置为false，ignoreCheck 表示不在进行孩子的判断，有些孩子没有正确实现canScroll，
     * 用ignoreCheck的值来忽略孩子的滚动，这是一种兼容老代码的逻辑，按道理来说，ignoreCheck应该不需要
     */
    public boolean onOverScroll(int deltaX, int deltaY, int scrollX, int scrollY, int scrollRangeX,
            int scrollRangeY, int maxOverScrollX, int maxOverScrollY, boolean isTouchEvent) {
        if (isVertical) {
            if (((scrollY == 0 && deltaY < 0) || (scrollY == scrollRangeY && deltaY > 0))) {
                onOverScrollSuccess();
            }
        } else {
            if (((scrollX == 0 && deltaX < 0) || (scrollX == scrollRangeX && deltaX > 0))) {
                onOverScrollSuccess();
            }
        }
        return true;
    }

    /**
     * ViewPager 在滚动的时候，他的树下的孩子节点可能也会滚动，这里需要check一下孩子是否可以滚动
     * ScrollChecker.canScroll 是QQ浏览器里面非标准的做法
     */
    @Override
    protected boolean canScroll(View v, boolean checkV, int dx, int x, int y) {
        if (ignoreCheck) {
            return false;
        }
        return ScrollChecker.canScroll(v, checkV, isVertical, dx, x, y) || super.canScroll(v, checkV, dx, x, y);
    }

    private MotionEvent swapXY(MotionEvent ev) {
        float width = getWidth();
        float height = getHeight();
        float newX = (ev.getY() / height) * width;
        float newY = (ev.getX() / width) * height;
        ev.setLocation(newX, newY);
        return ev;
    }

    @Override
    public void requestLayout() {
        super.requestLayout();
        triggerRequestLayout();
    }

    /**
     * hook 方法，不建议调用，这里只是为了兼容,目的是为了触发一次firstLayout恢复状态
     */
    private void setFirstLayout(boolean isFirstLayout) {
        try {
            Field field = ViewPager.class.getDeclaredField("mFirstLayout");
            field.setAccessible(true);
            field.set(this, isFirstLayout);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    /**
     * 也是Hack方法，设置初始化index
     *
     * @param position
     */
    private void setDefaultItem(int position) {
        try {
            Field field = ViewPager.class.getDeclaredField("mCurItem");
            field.setAccessible(true);
            field.setInt(this, position);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void initScroller() {
        try {
            Field velocityTrackerField = ViewPager.class.getDeclaredField("mScroller");
            velocityTrackerField.setAccessible(true);
            scroller = (Scroller) velocityTrackerField.get(this);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    private void invokeSetIsUnableToDrag(boolean enabled) {
        try {
            Field field = ViewPager.class.getDeclaredField("mIsUnableToDrag");
            field.setAccessible(true);
            field.set(this, enabled);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    private void invokeSetScrollingCacheEnabled(boolean enabled) {
        try {
            Method method = ViewPager.class.getDeclaredMethod("setScrollingCacheEnabled", Boolean.class);
            method.setAccessible(true);
            method.invoke(this, enabled);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void invokeSetScrollState(int state) {
        try {
            Method method = ViewPager.class.getDeclaredMethod("setScrollState", Integer.class);
            method.setAccessible(true);
            method.invoke(this, state);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
