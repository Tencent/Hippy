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


import android.content.Context;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.RecyclerView.RecycledViewPool.ScrapData;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.VelocityTracker;
import android.view.View;
import java.lang.reflect.Field;
import java.util.ArrayList;

public class EasyRecyclerView extends RecyclerView {

    protected OverPullHelper overPullHelper;
    protected OverPullListener overPullListener;
    protected VelocityTracker velocityTracker;

    public EasyRecyclerView(@NonNull Context context) {
        super(context);
        init();
    }

    public EasyRecyclerView(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public EasyRecyclerView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }

    protected void init() {
    }

    public int getOverPullState() {
        if (overPullHelper != null) {
            return overPullHelper.getOverPullState();
        }
        return OverPullHelper.OVER_PULL_NONE;
    }

    public boolean isOverPulling() {
        int pullState = getOverPullState();
        return pullState == OverPullHelper.OVER_PULL_DOWN_ING || pullState == OverPullHelper.OVER_PULL_UP_ING
                || pullState == OverPullHelper.OVER_PULL_SETTLING;
    }

    /**
     * 下拉的时候，返回值<0,表示顶部被下拉了一部分距离,顶部有空白
     */
    public int getOverPullUpOffset() {
        if (overPullHelper != null) {
            return overPullHelper.getOverPullUpOffset();
        }
        return 0;
    }

    /**
     * 上拉的时候，返回值>0,表示底部被上拉了一部分距离，底部有空白
     */
    public int getOverPullDownOffset() {
        if (overPullHelper != null) {
            return overPullHelper.getOverPullDownOffset();
        }
        return 0;
    }

    public void setOverPullListener(OverPullListener listener) {
        overPullListener = listener;
        if (overPullHelper != null) {
            overPullHelper.setOverPullListener(listener);
        }
    }

    public void setEnableOverPull(boolean enableOverDrag) {
        if (enableOverDrag) {
            if (overPullHelper == null) {
                overPullHelper = new OverPullHelper(this);
            }
            overPullHelper.setOverPullListener(overPullListener);
        } else {
            overPullHelper = null;
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        if (overPullHelper != null && overPullHelper.onTouchEvent(event)) {
            return true;
        }
        boolean handled = super.onTouchEvent(event);
        if (overPullHelper != null) {
            overPullHelper.handleEventUp(event);
        }
        return handled;
    }

    @Override
    public void requestLayout() {
        super.requestLayout();
    }

    public void recycleAndClearCachedViews() {
        mRecycler.recycleAndClearCachedViews();
    }

    public int getChildCountWithCaches() {
        return getCachedViewHolderCount() + getChildCount();
    }

    public View getChildAtWithCaches(int index) {
        ArrayList<ViewHolder> viewHolders = getCachedViewHolders();
        if (index < viewHolders.size()) {
            return viewHolders.get(index).itemView;
        } else {
            return getChildAt(index - viewHolders.size());
        }
    }

    private int getCachedViewHolderCount() {
        int count = mRecycler.mAttachedScrap.size() + mRecycler.mCachedViews.size();
        for (int i = 0; i < mRecycler.getRecycledViewPool().mScrap.size(); i++) {
            ScrapData scrapData = mRecycler.getRecycledViewPool().mScrap.valueAt(i);
            count += scrapData.mScrapHeap.size();
        }
        return count;
    }

    public ArrayList<ViewHolder> getCachedViewHolders() {
        ArrayList<ViewHolder> listViewHolder = new ArrayList<>();
        listViewHolder.addAll(mRecycler.mAttachedScrap);
        listViewHolder.addAll(mRecycler.mCachedViews);
        for (int i = 0; i < mRecycler.getRecycledViewPool().mScrap.size(); i++) {
            ScrapData scrapData = mRecycler.getRecycledViewPool().mScrap.valueAt(i);
            listViewHolder.addAll(scrapData.mScrapHeap);
        }
        return listViewHolder;
    }

    public boolean didStructureChange() {
        return mState.didStructureChange();
    }


    public int getFirstChildPosition() {
        return getChildLayoutPosition(getChildCount() > 0 ? getChildAt(0) : null);
    }

    public int getLashChildPosition() {
        return getChildLayoutPosition(getChildCount() > 0 ? getChildAt(getChildCount() - 1) : null);
    }

    /**
     * 通过位置获取一个ViewHolder，目前暂时提供给header使用
     */
    public ViewHolder getViewHolderForPosition(int position) {
        View view = mRecycler.getViewForPosition(position);
        if (view.getLayoutParams() instanceof LayoutParams) {
            return ((LayoutParams) view.getLayoutParams()).mViewHolder;
        }
        return null;
    }

    public ViewHolder getFistChildViewHolder() {
        View view = getChildAt(0);
        if (view != null && view.getLayoutParams() instanceof LayoutParams) {
            return ((LayoutParams) view.getLayoutParams()).mViewHolder;
        }
        return null;
    }

    /**
     * 改成public接口，主要用于hippy业务的特殊需求
     */
    @Override
    public void dispatchLayout() {
        super.dispatchLayout();
    }

    @Override
    public void invalidateGlows() {
        super.invalidateGlows();
    }

    /**
     * 反射获取滚动的VelocityTracker
     */
    public VelocityTracker getVelocityTracker() {
        if (velocityTracker == null) {
            try {
                Field velocityTrackerField = RecyclerView.class.getDeclaredField("mVelocityTracker");
                velocityTrackerField.setAccessible(true);
                velocityTracker = (VelocityTracker) velocityTrackerField.get(this);
            } catch (NoSuchFieldException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }
        }
        return velocityTracker;
    }

    /**
     * recyclerView的adapter状态已经变化，但是没有进行notify，导致state和adapter
     * 的itemCount对不齐，比如hippy场景，直接把recyclerView的renderNode删除了，adapter的itemCount直接变为0，
     * 由于没有notifyDatSetChange，state的itemCount不为0，这样就会出现validateViewHolderForOffsetPosition报
     * IndexOutOfBoundsException
     */
    public boolean isDataChangedWithoutNotify() {
        return getAdapter().getItemCount() != mState.getItemCount();
    }
}
