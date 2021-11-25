package com.tencent.mtt.supportui.utils.struct;

/**
 * Created by leonardgong on 2018/2/9 0009.
 */

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Iterator;

/**
 * 弱引用事件Hub
 * @param <T> Event
 */
public final class WeakEventHub<T> {
    private static final String TAG = "WeakEventHub";

    private final ArrayList<WeakReference<T>> mListeners = new ArrayList<WeakReference<T>>();

    /**
     * 注册观察者
     *
     * @param listener 观察者
     */
    public void registerListener(T listener) {
        if (listener == null) {
            return;
        }
        synchronized (mListeners) {
            Iterator<WeakReference<T>> iterator = mListeners.iterator();
            while (iterator.hasNext()) {
                WeakReference<T> weak = iterator.next();
                T item = weak.get();
                if (item == null) {
                    iterator.remove(); //如果弱引用已经销毁删除
                } else if (item == listener) {
                    return;
                }
            }
            mListeners.add(new WeakReference<T>(listener));
        }
    }

    /**
     * 移除观察者
     *
     * @param listener 观察者对象
     */
    public void unregisterListener(T listener) {
        synchronized (mListeners) {
            if (listener != null) {
                Iterator<WeakReference<T>> iterator = mListeners.iterator();
                while ((iterator.hasNext())) {
                    WeakReference<T> weakReference = iterator.next();
                    if (weakReference != null) {
                        T item = weakReference.get();
                        if (item == null || item == listener) {
                            iterator.remove();//如果弱引用已经销毁也删除
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取需要通知的列表
     *
     * @return 存活的对象引用列表
     */
    public Iterable<T> getNotifyListeners() {
        ArrayList<T> tmp = new ArrayList<T>(mListeners.size());
        synchronized (mListeners) {
            Iterator<WeakReference<T>> iterator = mListeners.iterator();
            while ((iterator.hasNext())) {
                WeakReference<T> weakReference = iterator.next();
                if (weakReference != null) {
                    T item = weakReference.get();
                    if (item == null) {
                        iterator.remove(); //如果弱引用已经销毁删除
                    } else {
                        tmp.add(item);
                    }
                }
            }
        }
        return tmp;
    }

    public int size()
    {
        return mListeners.size();
    }
}