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
import android.os.SystemClock;
import android.text.TextUtils;
import android.util.SparseArray;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyEngineLifecycleEventListener;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.DomActionInterceptor;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@SuppressWarnings("deprecation")
@HippyNativeModule(name = "AnimationModule", thread = HippyNativeModule.Thread.DOM)
public class AnimationModule extends HippyNativeModuleBase implements DomActionInterceptor, Animation.AnimationListener, Handler.Callback,
		HippyEngineLifecycleEventListener
{
	public static final String			ANIMATION_ID				= "animationId";
	public static final String			TIMING						= "timing";
	public static final String			USE_ANIMATION				= "useAnimation";
	public static final String			HANDLE_MESSAGE_BY_ANIMATION	= "handleMessageByAnimation";
	public static final String			FOLLOW						= "follow";

	public static final String			EVENT_NAME_ANIMATION_START	= "onHippyAnimationStart";
	public static final String			EVENT_NAME_ANIMATION_END	= "onHippyAnimationEnd";
	public static final String			EVENT_NAME_ANIMATION_CANCEL	= "onHippyAnimationCancel";
	public static final String			EVENT_NAME_ANIMATION_REPEAT	= "onHippyAnimationRepeat";

	private static final int			ANIMATION_DELAY_TIME		= 16;
	private static final int			MSG_CHANGE_ANIMATION_STATUS	= 100;
	private static final int			MSG_UPDATE_ANIMATION_NODE	= 101;
	private SparseArray<Animation>		mAnimations;
	private SparseArray<AnimationNode>	mAnimationNodes;
	private Handler						mHandler;
	private long						mLastUpdateTime;
	private final Set<Integer>			mNeedUpdateAnimationNodes;
	private Set<AnimationNode>			mWaitUpdateAnimationNodes;


	public AnimationModule(HippyEngineContext context)
	{
		super(context);
		mNeedUpdateAnimationNodes = Collections.synchronizedSet(new HashSet<Integer>());
	}

	@Override
	public boolean handleMessage(Message msg)
	{
		int what = msg.what;
		switch (what)
		{
			case MSG_CHANGE_ANIMATION_STATUS:
			{
				if (!mHandler.hasMessages(MSG_UPDATE_ANIMATION_NODE))
				{
					long time = SystemClock.elapsedRealtime();
					if (time - mLastUpdateTime >= ANIMATION_DELAY_TIME)
					{
						doUpdateAnimationNodes();
					}
					else
					{

						mHandler.sendEmptyMessageDelayed(MSG_UPDATE_ANIMATION_NODE, time - mLastUpdateTime);
					}
				}
				break;
			}
			case MSG_UPDATE_ANIMATION_NODE:
			{
				doUpdateAnimationNodes();
				break;
			}
		}
		return true;
	}

	@Override
	public void initialize()
	{
		super.initialize();
		mContext.addEngineLifecycleEventListener(this);
		mHandler = new Handler(mContext.getThreadExecutor().getDomThread().getLooper(), this);
		mAnimations = new SparseArray<>();
		mAnimationNodes = new SparseArray<>();
		if (mContext.getDomManager() != null)
		{
			mContext.getDomManager().addActionInterceptor(this);
		}
	}

	@Override
	public void destroy()
	{
		mContext.removeEngineLifecycleEventListener(this);
		if (mContext.getDomManager() != null)
		{
			mContext.getDomManager().removeActionInterceptor(this);
		}
		super.destroy();
	}

	@Override
	public void onAnimationStart(Animation animation)
	{
		mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveNativeEvent(EVENT_NAME_ANIMATION_START, animation.getId());
	}

	@Override
	public void onAnimationEnd(Animation animation)
	{
		onAnimationUpdate(animation);
		mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveNativeEvent(EVENT_NAME_ANIMATION_END, animation.getId());
	}

	@Override
	public void onAnimationCancel(Animation animation)
	{
		mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveNativeEvent(EVENT_NAME_ANIMATION_CANCEL, animation.getId());
	}

	@Override
	public void onAnimationRepeat(Animation animation)
	{
		mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveNativeEvent(EVENT_NAME_ANIMATION_REPEAT, animation.getId());
	}

	@Override
	public void onAnimationUpdate(Animation animation)
	{
		if (animation == null)
		{
			return;
		}
		CopyOnWriteArrayList<Integer> nodeIds = animation.getAnimationNodes();
		if (nodeIds == null)
		{
			return;
		}

		mNeedUpdateAnimationNodes.addAll(nodeIds);

		if (!mHandler.hasMessages(MSG_CHANGE_ANIMATION_STATUS))
		{
			mHandler.sendEmptyMessage(MSG_CHANGE_ANIMATION_STATUS);
		}
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "createAnimation")
	public void createAnimation(int animationId, String mode, HippyMap params)
	{
		if (mAnimations.get(animationId) != null)
		{
			return;
		}
		if (TextUtils.isEmpty(mode))
		{
			mAnimations.put(animationId, null);
		}
		try
		{
			if (TextUtils.equals(mode, TIMING))
			{
				preprocessStartValue(params);
				TimingAnimation animation = new TimingAnimation(animationId);
				animation.addAnimationListener(this);
				animation.parseFromData(params);
				mAnimations.append(animationId, animation);
			}
		}
		catch (Throwable e)
		{
			e.printStackTrace();
		}
	}

	private void preprocessStartValue(HippyMap map)
	{
		if (map == null)
		{
			return;
		}

		if (map.containsKey("startValue"))
		{
			Object obj = map.get("startValue");
			if (obj instanceof HippyMap)
			{
				int startValueAnimationId = ((HippyMap) obj).getInt(ANIMATION_ID);
				map.remove("startValue");
				map.pushObject("startValue", mAnimations.get(startValueAnimationId).getAnimationSimpleValue());
			}
		}
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "updateAnimation")
	public void updateAnimation(int animationId, HippyMap params)
	{
		LogUtils.d("shit", Thread.currentThread().getName());
		Animation targetAnim = mAnimations.get(animationId);
		if (targetAnim == null || (targetAnim.getAnimator() != null && targetAnim.getAnimator().isRunning()))
		{
			LogUtils.d("AnimationModule", "trying to update a unexisted animation or the animation has started");
			return;
		}

		if (targetAnim instanceof TimingAnimation)
		{
			preprocessStartValue(params);
			((TimingAnimation) targetAnim).parseFromData(params);
			targetAnim.onAnimationUpdate(null);
		}

	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "createAnimationSet")
	public void createAnimationSet(int animationId, HippyMap mapParams)
	{
		AnimationSet animatorSet = new AnimationSet(animationId);

		animatorSet.addAnimationListener(this);
		try
		{
			if (mapParams != null)
			{
				if (mapParams.containsKey(NodeProps.REPEAT_COUNT))
				{
					animatorSet.setRepeatCount(mapParams.getInt(NodeProps.REPEAT_COUNT));
				}

				HippyArray params = mapParams.getArray("children");

				int size = params.size();
				HippyMap map;
				int childId;
				boolean follow = false;
				for (int i = 0; i < size; i++)
				{
					map = params.getMap(i);
					if (!map.containsKey(ANIMATION_ID))
					{
						break;
					}
					childId = map.getInt(ANIMATION_ID);
					if (i != 0 && map.containsKey(FOLLOW))
					{
						follow = map.getBoolean(FOLLOW);
					}
					animatorSet.addAnimation(mAnimations.get(childId), follow);
				}
			}
		}
		catch (Throwable e)
		{
			LogUtils.d("AnimationModule", "createAnimationSet: " + e.getMessage());
		}
		mAnimations.append(animationId, animatorSet);
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "startAnimation")
	public void startAnimation(int animationId)
	{
		Animation animation = mAnimations.get(animationId);
		if (animation != null)
		{
			animation.start();
		}
	}

	@HippyMethod(name = "stopAnimation")
	public void stopAnimation(int animationId)
	{
		Animation animation = mAnimations.get(animationId);
		if (animation != null)
		{
			animation.stop();
		}
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "pauseAnimation")
	public void pauseAnimation(int animationId)
	{
		Animation animation = mAnimations.get(animationId);
		if (animation != null)
		{
			animation.pause();
		}
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "resumeAnimation")
	public void resumeAnimation(int animationId)
	{
		Animation animation = mAnimations.get(animationId);
		if (animation != null)
		{
			animation.resume();
		}
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "destroyAnimation")
	public void destroyAnimation(int animationId)
	{
		stopAnimation(animationId);
		Animation animation = mAnimations.get(animationId);
		if (animation instanceof AnimationSet)
		{
			ArrayList<Integer> childIds = ((AnimationSet) animation).getChildAnimationIds();
			if (childIds != null)
			{
				for (int childId : childIds)
				{
					stopAnimation(childId);
					mAnimations.remove(childId);
				}
			}
		}
		mAnimations.remove(animationId);
	}

	@Override
	public HippyMap onCreateNode(int tagId, HippyRootView rootView, HippyMap props)
	{
		return onUpdateAnimationProperty(tagId, rootView, props);
	}

	@Override
	public HippyMap onUpdateNode(int tagId, HippyRootView rootView, HippyMap props)
	{
		return onUpdateAnimationProperty(tagId, rootView, props);
	}


	@Override
	public void onEngineResume()
	{
		if (mHandler != null)
		{
			mHandler.post(new Runnable()
			{
				@Override
				public void run()
				{
					if (mAnimations == null)
					{
						return;
					}
					int size = mAnimations.size();
					Animation animation;
					for (int i = 0; i < size; i++)
					{
						animation = mAnimations.valueAt(i);
						animation.resume();
					}
				}
			});
		}
	}

	@Override
	public void onEnginePause()
	{
		if (mHandler != null)
		{
			mHandler.post(new Runnable()
			{
				@Override
				public void run()
				{
					if (mAnimations == null)
					{
						return;
					}
					int size = mAnimations.size();
					Animation animation;
					for (int i = 0; i < size; i++)
					{
						animation = mAnimations.valueAt(i);
						animation.pause();
					}
				}
			});
		}
	}

	@Override
	public void onDeleteNode(int tagId)
	{
		dealAnimationNode(tagId, null, null, null);
	}

	private HippyMap onUpdateAnimationProperty(int tagId, HippyRootView rootView, HippyMap props)
	{
		//		LogUtils.d("AnimationModule","dom  updateNode node id : "+tagId+" onUpdateAnimationProperty width:" +props.get("width"));
		if (props == null)
		{
			return null;
		}
		if (props.containsKey(HANDLE_MESSAGE_BY_ANIMATION) && props.getBoolean(HANDLE_MESSAGE_BY_ANIMATION))
		{
			return props;
		}
		if (!props.containsKey(USE_ANIMATION))
		{
			dealAnimationNode(tagId, rootView, null, null);
			return props;
		}
		try
		{
			boolean useAnimation = props.getBoolean(USE_ANIMATION);
			if (!useAnimation)
			{
				dealAnimationNode(tagId, rootView, null, null);
				return props;
			}
			HippyMap newProps = new HippyMap();
			ArrayList<Integer> animations = new ArrayList<>();
			copyAndDealPropertys(tagId, props, newProps, animations);

			dealAnimationNode(tagId, rootView, props, animations);
			newProps.pushBoolean(HANDLE_MESSAGE_BY_ANIMATION, true);
			return newProps;
		}
		catch (Throwable e)
		{
			e.printStackTrace();
		}
		return props;
	}

	private void dealAnimationNode(int tagId, HippyRootView rootView, HippyMap newProps, ArrayList<Integer> newAnimationIds)
	{
		AnimationNode node = mAnimationNodes.get(tagId);
		if (node != null)
		{
			Iterator<Animation> iterator = node.getAnimations().iterator();
			Animation animation;
			while (iterator.hasNext())
			{
				animation = iterator.next();
				if (animation != null && (newAnimationIds == null || !newAnimationIds.contains(animation.mId)))
				{
					animation.removeAnimationNode(tagId);
					iterator.remove();
				}
			}
		}

		if (newAnimationIds == null || newAnimationIds.size() <= 0)
		{
			mAnimationNodes.remove(tagId);
		}
		else
		{
			if (node == null)
			{
				node = new AnimationNode(tagId, rootView);
				mAnimationNodes.append(tagId, node);
			}
			Animation animation;
			for (Integer animationId : newAnimationIds)
			{
				animation = mAnimations.get(animationId);
				if (animation != null)
				{
					node.addAnimation(animation);
					animation.addAnimationNode(tagId);
				}
			}
			node.setProps(newProps);
		}
	}

	private void copyAndDealPropertys(int tagId, HippyMap props, HippyMap newProps, ArrayList<Integer> animations)
	{
		if (props == null)
		{
			return;
		}

		Set<String> keys = props.keySet();
		Object value;
		for (String key : keys)
		{
			value = props.get(key);
			if (value instanceof HippyMap)
			{
				boolean flag = isAnimationPropertys((HippyMap) value);
				if (flag)
				{
					int animationId = ((HippyMap) value).getInt(ANIMATION_ID);
					if (animations != null)
					{
						animations.add(animationId);
					}
					Object animationValue = findAnimationValue(tagId, animationId);
					if (animationValue != null)
					{
						newProps.pushObject(key, animationValue);
					}
				}
				else
				{
					HippyMap newChildProps = new HippyMap();
					copyAndDealPropertys(tagId, (HippyMap) value, newChildProps, animations);
					newProps.pushMap(key, newChildProps);
				}
			}
			else if (value instanceof HippyArray)
			{
				HippyArray newChildProps = new HippyArray();
				copyAndDealPropertys(tagId, (HippyArray) value, newChildProps, animations);
				newProps.pushArray(key, newChildProps);
			}
			else
			{
				newProps.pushObject(key, value);
			}
		}
	}

	private void copyAndDealPropertys(int tagId, HippyArray props, HippyArray newProps, ArrayList<Integer> animations)
	{
		if (props == null)
		{
			return;
		}

		int size = props.size();
		Object value;
		for (int i = 0; i < size; i++)
		{
			value = props.get(i);
			if (value instanceof HippyMap)
			{
				boolean flag = isAnimationPropertys((HippyMap) value);
				if (flag)
				{
					int animationId = ((HippyMap) value).getInt(ANIMATION_ID);
					if (animations != null)
					{
						animations.add(animationId);
					}

					Object animationValue = findAnimationValue(tagId, animationId);
					if (animationValue != null)
					{
						newProps.pushObject(animationValue);
					}
				}
				else
				{
					HippyMap newChildProps = new HippyMap();
					copyAndDealPropertys(tagId, (HippyMap) value, newChildProps, animations);
					newProps.pushMap(newChildProps);
				}
			}
			else if (value instanceof HippyArray)
			{
				HippyArray newChildProps = new HippyArray();
				copyAndDealPropertys(tagId, (HippyArray) value, newChildProps, animations);
				newProps.pushArray(newChildProps);
			}
			else
			{
				newProps.pushObject(value);
			}
		}
	}

	private boolean isAnimationPropertys(HippyMap props)
	{
		if (props == null)
		{
			return false;
		}
		return props.containsKey(ANIMATION_ID) && props.size() == 1;
	}

	private Object findAnimationValue(int tagId, int animationId)
	{
		Animation anim = mAnimations.get(animationId);
		if (anim != null)
		{
			return anim.getAnimationValue();
		}

		AnimationNode node = mAnimationNodes.get(tagId);
		if (node != null)
		{
			ArrayList<Animation> animations = node.getAnimations();
			for (Animation animation : animations)
			{
				if (animation != null && animation.getId() == animationId)
				{
					return animation.getAnimationValue();
				}
			}
		}

		return Float.NaN;
	}

	private void doUpdateAnimationNodes()
	{
		mLastUpdateTime = SystemClock.elapsedRealtime();
		if (mWaitUpdateAnimationNodes == null)
		{
			mWaitUpdateAnimationNodes = new HashSet<>();
		}
		mWaitUpdateAnimationNodes.clear();
		synchronized (mNeedUpdateAnimationNodes)
		{
			Iterator<Integer> it = mNeedUpdateAnimationNodes.iterator();
			int nodeId;
			AnimationNode node;
			while (it.hasNext())
			{
				nodeId = it.next();
				node = mAnimationNodes.get(nodeId);
				mWaitUpdateAnimationNodes.add(node);
				it.remove();
			}
		}

		Iterator<AnimationNode> it = mWaitUpdateAnimationNodes.iterator();
		while (it.hasNext())
		{
			updateAnimationNodeProps(it.next());
			it.remove();
		}
		if (mContext != null && mContext.getDomManager() != null)
		{
			mContext.getDomManager().batchByAnimation();
		}
	}

	private void updateAnimationNodeProps(AnimationNode node) {
		if (node == null) {
			return;
		}
		try {
			HippyMap newProps = new HippyMap();
			copyAndDealPropertys(node.getId(), node.getProps(), newProps, null);
			newProps.pushBoolean(HANDLE_MESSAGE_BY_ANIMATION, true);

			mContext.getDomManager().updateNode(node.getId(), newProps, node.getRootView());
		} catch (Throwable e) {
			LogUtils.d("AnimationModule", "updateAnimationNodeProps: " + e.getMessage());
		}
	}

}
