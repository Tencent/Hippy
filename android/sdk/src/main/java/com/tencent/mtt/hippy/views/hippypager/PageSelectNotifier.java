package com.tencent.mtt.hippy.views.hippypager;

import androidx.annotation.NonNull;
import androidx.viewpager.widget.ViewPager.OnPageChangeListener;
import java.util.ArrayList;
import java.util.List;

/**
 * ViewPager目前的onPageSelected事件通知不满足Hippy的需求，比如首次通知，相同page的通知，需要补充通知一次
 * 这个和ViewPager的通知是互斥的，ViewPager如果有通知，这里是不会再通知的
 */
class PageSelectNotifier {

    private List<OnPageChangeListener> onPageChangeListeners;

    void notifyPageSelected(int position) {
        if (onPageChangeListeners != null) {
            for (int i = 0, z = onPageChangeListeners.size(); i < z; i++) {
                OnPageChangeListener listener = onPageChangeListeners.get(i);
                if (listener != null) {
                    listener.onPageSelected(position);
                }
            }
        }
    }

    void addOnPageChangeListener(@NonNull OnPageChangeListener listener) {
        if (onPageChangeListeners == null) {
            onPageChangeListeners = new ArrayList<>();
        }
        if (!onPageChangeListeners.contains(listener)) {
            onPageChangeListeners.add(listener);
        }
    }

    void removeOnPageChangeListener(@NonNull OnPageChangeListener listener) {
        if (onPageChangeListeners != null) {
            onPageChangeListeners.remove(listener);
        }
    }

    public void clearOnPageChangeListeners() {
        if (onPageChangeListeners != null) {
            onPageChangeListeners.clear();
        }
    }
}
