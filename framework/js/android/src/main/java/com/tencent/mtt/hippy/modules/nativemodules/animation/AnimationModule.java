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
package com.tencent.mtt.hippy.modules.nativemodules.animation;

import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyEngineLifecycleEventListener;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.RenderProcessInterceptor;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.serialization.recommend.Serializer;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@HippyNativeModule(name = "AnimationModule")
public class AnimationModule extends HippyNativeModuleBase implements RenderProcessInterceptor,
        Animation.AnimationListener, Handler.Callback, HippyEngineLifecycleEventListener {

    private static final String ANIMATION_ID = "animationId";
    private static final String ANIMATION_PROPERTY_NAME = "animationKey";
    private static final String ANIMATION_PROPERTY_VALUE = "animationValue";
    private static final String NODE_ID = "nodeId";
    private static final String TIMING = "timing";
    private static final String USE_ANIMATION = "useAnimation";
    private static final String FOLLOW = "follow";
    private static final String EVENT_NAME_ANIMATION_START = "onHippyAnimationStart";
    private static final String EVENT_NAME_ANIMATION_END = "onHippyAnimationEnd";
    private static final String EVENT_NAME_ANIMATION_CANCEL = "onHippyAnimationCancel";
    private static final String EVENT_NAME_ANIMATION_REPEAT = "onHippyAnimationRepeat";
    private static final int ANIMATION_DELAY_TIME = 16;
    private static final int MSG_UPDATE_ANIMATION_NODE = 101;
    private Handler mHandler;
    private ConcurrentHashMap<Integer, Animation> mAnimations;
    private ConcurrentHashMap<Integer, AnimationNode> mAnimationNodes;
    private final ArrayList<JSObject> mNeedUpdateList;
    private SafeHeapWriter mSafeHeapWriter;
    private Serializer mRecommendSerializer;

    public AnimationModule(HippyEngineContext context) {
        super(context);
        mNeedUpdateList = new ArrayList<>();
    }

    @Override
    public boolean handleMessage(Message msg) {
        if (msg.what == MSG_UPDATE_ANIMATION_NODE) {
            doUpdateAnimationNodes();
        }
        return true;
    }

    @Override
    public void initialize() {
        super.initialize();
        mRecommendSerializer = new Serializer();
        mHandler = new Handler(mContext.getThreadExecutor().getModuleThread().getLooper(), this);
        mAnimations = new ConcurrentHashMap<>();
        mAnimationNodes = new ConcurrentHashMap<>();
        mContext.addRenderProcessInterceptor(this);
        mContext.addEngineLifecycleEventListener(this);
    }

    @Override
    public void destroy() {
        super.destroy();
        mContext.removeEngineLifecycleEventListener(this);
        mContext.removeRenderProcessInterceptor(this);
        mAnimations.clear();
        mAnimationNodes.clear();
    }

    @Override
    public void onAnimationStart(Animation animation) {
        mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
                .receiveNativeEvent(EVENT_NAME_ANIMATION_START, animation.getId());
    }

    @Override
    public void onAnimationEnd(Animation animation) {
        onAnimationUpdate(animation);
        mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
                .receiveNativeEvent(EVENT_NAME_ANIMATION_END, animation.getId());
    }

    @Override
    public void onAnimationCancel(Animation animation) {
        mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
                .receiveNativeEvent(EVENT_NAME_ANIMATION_CANCEL, animation.getId());
    }

    @Override
    public void onAnimationRepeat(Animation animation) {
        mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
                .receiveNativeEvent(EVENT_NAME_ANIMATION_REPEAT, animation.getId());
    }

    @Override
    public void onAnimationUpdate(Animation animation) {
        if (animation.getAnimationNodes() == null) {
            return;
        }
        ArrayList<JSObject> updateList = new ArrayList<>();
        for (Integer nodeId : animation.getAnimationNodes()) {
            Object value = animation.getAnimationValue();
            if (value != null) {
                JSObject jsObject = new JSObject();
                jsObject.set(ANIMATION_ID, animation.getId());
                jsObject.set(NODE_ID, nodeId);
                jsObject.set(ANIMATION_PROPERTY_NAME, animation.mAnimationProperty);
                jsObject.set(ANIMATION_PROPERTY_VALUE, value);
                updateList.add(jsObject);
            }
        }
        synchronized (mNeedUpdateList) {
            mNeedUpdateList.addAll(updateList);
            if (!mHandler.hasMessages(MSG_UPDATE_ANIMATION_NODE) && mNeedUpdateList.size() > 0) {
                mHandler.sendEmptyMessageDelayed(MSG_UPDATE_ANIMATION_NODE, ANIMATION_DELAY_TIME);
            }
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "createAnimation")
    public void createAnimation(int animationId, String mode, HippyMap params) {
        if (mAnimations.get(animationId) != null || !TextUtils.equals(mode, TIMING)) {
            return;
        }
        try {
            preprocessStartValue(params);
            TimingAnimation animation = new TimingAnimation(animationId);
            animation.addAnimationListener(this);
            animation.parseFromData(params);
            mAnimations.put(animationId, animation);
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    private void preprocessStartValue(HippyMap map) {
        if (map == null) {
            return;
        }

        if (map.containsKey("startValue")) {
            Object obj = map.get("startValue");
            if (obj instanceof HippyMap) {
                int startValueAnimationId = ((HippyMap) obj).getInt(ANIMATION_ID);
                map.remove("startValue");
                map.pushObject("startValue",
                        mAnimations.get(startValueAnimationId).getAnimationSimpleValue());
            }
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "updateAnimation")
    public void updateAnimation(int animationId, HippyMap params) {
        Animation animation = mAnimations.get(animationId);
        if (animation == null || (animation.getAnimator() != null && animation.getAnimator()
                .isRunning())) {
            return;
        }
        if (animation instanceof TimingAnimation) {
            preprocessStartValue(params);
            ((TimingAnimation) animation).parseFromData(params);
            animation.onAnimationUpdate(null);
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "createAnimationSet")
    public void createAnimationSet(int animationId, HippyMap mapParams) {
        AnimationSet animatorSet = new AnimationSet(animationId);

        animatorSet.addAnimationListener(this);
        try {
            if (mapParams != null) {
                if (mapParams.containsKey(NodeProps.REPEAT_COUNT)) {
                    animatorSet.setRepeatCount(mapParams.getInt(NodeProps.REPEAT_COUNT));
                }

                HippyArray params = mapParams.getArray("children");

                int size = params.size();
                HippyMap map;
                int childId;
                boolean follow = false;
                for (int i = 0; i < size; i++) {
                    map = params.getMap(i);
                    if (!map.containsKey(ANIMATION_ID)) {
                        break;
                    }
                    childId = map.getInt(ANIMATION_ID);
                    if (i != 0 && map.containsKey(FOLLOW)) {
                        follow = map.getBoolean(FOLLOW);
                    }
                    animatorSet.addAnimation(mAnimations.get(childId), follow);
                }
            }
        } catch (Throwable e) {
            LogUtils.d("AnimationModule", "createAnimationSet: " + e.getMessage());
        }
        mAnimations.put(animationId, animatorSet);
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "startAnimation")
    public void startAnimation(int animationId) {
        Animation animation = mAnimations.get(animationId);
        if (animation != null) {
            animation.start();
        }
    }

    @HippyMethod(name = "stopAnimation")
    public void stopAnimation(int animationId) {
        Animation animation = mAnimations.get(animationId);
        if (animation != null) {
            animation.stop();
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "pauseAnimation")
    public void pauseAnimation(int animationId) {
        Animation animation = mAnimations.get(animationId);
        if (animation != null) {
            animation.pause();
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "resumeAnimation")
    public void resumeAnimation(int animationId) {
        Animation animation = mAnimations.get(animationId);
        if (animation != null) {
            animation.resume();
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "destroyAnimation")
    public void destroyAnimation(int animationId) {
        stopAnimation(animationId);
        Animation animation = mAnimations.get(animationId);
        if (animation instanceof AnimationSet) {
            ArrayList<Integer> childIds = ((AnimationSet) animation).getChildAnimationIds();
            if (childIds != null) {
                for (int childId : childIds) {
                    stopAnimation(childId);
                    mAnimations.remove(childId);
                }
            }
        }
        mAnimations.remove(animationId);
    }

    @Override
    public void onEngineResume() {
        if (mHandler == null) {
            return;
        }
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                if (mAnimations == null) {
                    return;
                }
                for (Animation animation : mAnimations.values()) {
                    if (animation != null) {
                        animation.resume();
                    }
                }
            }
        });
    }

    @Override
    public void onEnginePause() {
        if (mHandler == null) {
            return;
        }
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                if (mAnimations == null) {
                    return;
                }
                for (Animation animation : mAnimations.values()) {
                    if (animation != null) {
                        animation.pause();
                    }
                }
            }
        });
    }

    @Override
    public void onCreateNode(int nodeId, @NonNull final Map<String, Object> props) {
        resetPropsIfNeeded(nodeId, props);
    }

    @Override
    public void onUpdateNode(int nodeId, @NonNull final Map<String, Object> props) {
        resetPropsIfNeeded(nodeId, props);
    }

    @Override
    public void onDeleteNode(int nodeId) {
        removeAnimationFromNode(nodeId, true);
    }

    @Override
    public void onEndBatch() {
        synchronized (mNeedUpdateList) {
            if (mHandler != null && !mHandler.hasMessages(MSG_UPDATE_ANIMATION_NODE)
                    && mNeedUpdateList.size() > 0) {
                mHandler.sendEmptyMessage(MSG_UPDATE_ANIMATION_NODE);
            }
        }
    }

    private void resetPropsIfNeeded(int nodeId, @NonNull final Map<String, Object> props) {
        if (!props.containsKey(USE_ANIMATION)) {
            removeAnimationFromNode(nodeId, true);
            return;
        }
        final Map<Integer, String> animations = new HashMap<>();
        checkMapProps(nodeId, props, animations);
        if (animations.isEmpty()) {
            return;
        }
        AnimationNode node = mAnimationNodes.get(nodeId);
        if (node != null) {
            // If animation node already exists, remove animation from node before bind
            // new animation, for previous animation id may changed by js.
            removeAnimationFromNode(nodeId, false);
        } else {
            node = new AnimationNode(nodeId);
            mAnimationNodes.put(nodeId, node);
        }
        for (Map.Entry<Integer, String> entry : animations.entrySet()) {
            Animation animation = mAnimations.get(entry.getKey());
            if (animation != null) {
                node.addAnimation(animation);
                animation.addAnimationNode(nodeId);
                animation.setAnimationProperty(entry.getValue());
            }
        }
    }

    private void resetAnimationProperty(int nodeId, String key,
            @NonNull Map<String, Object> outer,
            @NonNull Map<String, Object> inner,
            @NonNull final Map<Integer, String> animations) {
        Object value = inner.get(ANIMATION_ID);
        if (!(value instanceof Number)) {
            return;
        }
        final Integer animationId = ((Number) value).intValue();
        animations.put(animationId, key);
        value = findAnimationValue(nodeId, animationId);
        if (value != null) {
            outer.put(key, value);
            JSObject jsObject = new JSObject();
            jsObject.set(ANIMATION_ID, animationId);
            jsObject.set(NODE_ID, nodeId);
            jsObject.set(ANIMATION_PROPERTY_NAME, key);
            jsObject.set(ANIMATION_PROPERTY_VALUE, value);
            synchronized (mNeedUpdateList) {
                mNeedUpdateList.add(jsObject);
            }
        }
    }

    private void checkMapProps(int nodeId, @NonNull Map<String, Object> props,
            @NonNull final Map<Integer, String> animations) {
        Set<String> keys = props.keySet();
        for (String key : keys) {
            Object value = props.get(key);
            if (value instanceof Map) {
                boolean hasAnimationId = checkAnimationId((Map) value);
                if (hasAnimationId) {
                    resetAnimationProperty(nodeId, key, props, (Map) value, animations);
                } else {
                    checkMapProps(nodeId, (Map) value, animations);
                }
            } else if (value instanceof ArrayList) {
                checkArrayProps(nodeId, (ArrayList) value, animations);
            }
        }
    }

    private void checkArrayProps(int nodeId, @NonNull ArrayList<Object> props,
            @NonNull final Map<Integer, String> animations) {
        for (int i = 0; i < props.size(); i++) {
            Object value = props.get(i);
            if (value instanceof Map) {
                checkMapProps(nodeId, (Map) value, animations);
            } else if (value instanceof ArrayList) {
                checkArrayProps(nodeId, (ArrayList) value, animations);
            }
        }
    }

    private void removeAnimationFromNode(int nodeId, boolean deleteNode) {
        AnimationNode node = mAnimationNodes.get(nodeId);
        if (node != null) {
            node.clearAnimation();
            if (deleteNode) {
                mAnimationNodes.remove(nodeId);
            }
        }
    }

    private boolean checkAnimationId(@NonNull Map props) {
        return props.containsKey(ANIMATION_ID) && props.size() == 1;
    }

    @Nullable
    private Object findAnimationValue(int nodeId, int animationId) {
        Animation animation = mAnimations.get(animationId);
        if (animation != null) {
            return animation.getAnimationValue();
        }
        AnimationNode node = mAnimationNodes.get(nodeId);
        if (node != null) {
            for (Animation value : node.getAnimations()) {
                animation = value;
                if (animation != null && animation.getId() == animationId) {
                    return animation.getAnimationValue();
                }
            }
        }
        return null;
    }

    private void doUpdateAnimationNodes() {
        JSDenseArray jsArray = new JSDenseArray();
        synchronized (mNeedUpdateList) {
            if (mNeedUpdateList.size() <= 0) {
                return;
            }
            for (int i = 0; i < mNeedUpdateList.size(); i++) {
                jsArray.push(mNeedUpdateList.get(i));
            }
            mNeedUpdateList.clear();
        }
        try {
            if (mSafeHeapWriter == null) {
                mSafeHeapWriter = new SafeHeapWriter();
            } else {
                mSafeHeapWriter.reset();
            }
            mRecommendSerializer.setWriter(mSafeHeapWriter);
            mRecommendSerializer.reset();
            mRecommendSerializer.writeHeader();
            mRecommendSerializer.writeValue(jsArray);
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }
        ByteBuffer buffer = mSafeHeapWriter.chunked();
        int offset = buffer.arrayOffset() + buffer.position();
        int length = buffer.limit() - buffer.position();
        mContext.updateAnimationNode(buffer.array(), offset, length);
    }
}
