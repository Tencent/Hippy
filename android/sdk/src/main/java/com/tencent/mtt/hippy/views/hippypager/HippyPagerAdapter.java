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

import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.viewpager.widget.PagerAdapter;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPagerItem;
import java.util.ArrayList;
import java.util.List;

/**
 * Created  on 2021/7/23.
 */

public class HippyPagerAdapter extends PagerAdapter {

    protected final List<View> views = new ArrayList<>();
    protected final HippyPager viewPager;
    private int childSize = 0;
    private Object currentItemObj = null;

    public HippyPagerAdapter(HippyPager viewPager) {
        this.viewPager = viewPager;
    }

    public void setChildSize(int size) {
        childSize = size;
    }

    public Object getCurrentItemObj() {
        return currentItemObj;
    }


    protected void addView(HippyViewPagerItem view, int position) {
        if (view != null && position >= 0) {
            if (position >= views.size()) {
                views.add(view);
            } else {
                views.add(position, view);
            }
        }
    }

    protected void removeView(View view) {
        int size = views.size();
        int index = -1;
        for (int i = 0; i < size; i++) {
            View curr = getViewAt(i);
            if (curr == view) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            views.remove(index);
        }
    }

    protected View getViewAt(int index) {
        if (index < 0 || index >= views.size()) {
            return null;
        }
        return views.get(index);
    }

    protected int getItemViewSize() {
        return views.size();
    }

    @Override
    public int getCount() {
        return childSize;
    }

    @Override
    public int getItemPosition(Object object) {
        if (views.isEmpty()) {
            return POSITION_NONE;
        }
        int index = views.indexOf(object);
        if (index < 0) {
            return POSITION_NONE;
        }
        return index;
    }

    @NonNull
    @Override
    public Object instantiateItem(ViewGroup container, int position) {
        View pageItemView = getPageItemView(position);
        if (pageItemView.getParent() == null) {
            container.addView(pageItemView, new HippyPager.LayoutParams());
            viewPager.triggerRequestLayout();
        }
        return pageItemView;
    }

    protected View getPageItemView(int position) {
        View pageItemView = null;
        if (position >= 0 && position < views.size()) {
            pageItemView = views.get(position);
        }
        if (pageItemView == null) {
            throw new NullPointerException("Can not instantiateItem,position:" + position + ",size:" + views.size());
        }
        return pageItemView;
    }

    @Override
    public void destroyItem(ViewGroup container, int position, Object object) {
        if (object instanceof View) {
            View view = (View) object;
            view.layout(0, 0, 0, 0);
            container.removeView(view);
        }
    }

    @Override
    public void setPrimaryItem(@NonNull ViewGroup container, int position,
            @NonNull Object object) {
        super.setPrimaryItem(container, position, object);
        currentItemObj = object;
    }

    @Override
    public boolean isViewFromObject(@NonNull View view, @NonNull Object object) {
        return view == object;
    }
}
