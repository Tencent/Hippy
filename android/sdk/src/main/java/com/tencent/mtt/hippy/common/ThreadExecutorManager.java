package com.tencent.mtt.hippy.common;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.ArrayList;
import java.util.HashMap;

public class ThreadExecutorManager implements ThreadExecutor.UncaughtExceptionHandler{
    private static ThreadExecutorManager sInstance;
    private final HashMap<Integer, ThreadExecutor> mThreadExecutorMap = new HashMap<Integer, ThreadExecutor>();
    private final HashMap<Integer, ArrayList<Integer>> mEngineMap = new HashMap<Integer, ArrayList<Integer>>();

    private ThreadExecutorManager() {

    }

    public static ThreadExecutorManager getInstance() {
        if (sInstance == null) {
            synchronized (ThreadExecutorManager.class) {
                if (sInstance == null) {
                    sInstance = new ThreadExecutorManager();
                }
            }
        }

        return sInstance;
    }

    public synchronized void add(HippyEngine engine) {
        Integer groupId = engine.getGroupId();
        if (groupId < 0) {
            return;
        }

        try {
            ThreadExecutor threadExecutor = mThreadExecutorMap.get(groupId);
            if (threadExecutor == null) {
                threadExecutor = new ThreadExecutor(groupId);
                threadExecutor.setUncaughtExceptionHandler(this);
                mThreadExecutorMap.put(groupId, threadExecutor);
            }

            Integer engineId = engine.getId();
            ArrayList<Integer> engineList = mEngineMap.get(groupId);
            if (engineList == null) {
                engineList = new ArrayList<Integer>();
                engineList.add(engineId);
                mEngineMap.put(groupId, engineList);
            } else if (!engineList.contains(engineId)) {
                engineList.add(engineId);
            } else {
                LogUtils.e("Hippy", "add same engine twice");
            }
        } catch (Exception e) {
            LogUtils.d("ThreadExecutorManager", "add: " + e.getMessage());
        }
    }

    public synchronized ThreadExecutor getThreadExecutor(int groupId) {
        return mThreadExecutorMap.get(groupId);
    }

    private void destroyThreadExecutor(Integer groupId) {
        if (mThreadExecutorMap.containsKey(groupId)) {
            ThreadExecutor threadExecutor = mThreadExecutorMap.get(groupId);
            if (threadExecutor != null) {
                threadExecutor.destroy();
            }
            mThreadExecutorMap.remove(groupId);
        }
    }

    public synchronized void remove(HippyEngine engine) {
        Integer groupId = engine.getGroupId();
        if (groupId < 0) {
            return;
        }
        try {
            ArrayList<Integer> engineList = mEngineMap.get(groupId);
            if (engineList == null) {
                destroyThreadExecutor(groupId);
                return;
            }

            Integer engineId = engine.getId();
            engineList.remove(engineId);

            if (engineList.size() <= 0) {
                mEngineMap.remove(groupId);
                destroyThreadExecutor(groupId);
            }
        } catch (Exception e) {
            LogUtils.d("ThreadExecutorManager", "remove: " + e.getMessage());
        }
    }

    private synchronized void handleExceptionImpl(Thread t, Throwable e, Integer groupId) {
        if (groupId < 0) {
            return;
        }

        destroyThreadExecutor(groupId);
        mEngineMap.remove(groupId);
    }

    @Override
    public void handleThreadUncaughtException(Thread t, Throwable e, Integer groupId)
    {
        handleExceptionImpl(t, e, groupId);
    }
}
