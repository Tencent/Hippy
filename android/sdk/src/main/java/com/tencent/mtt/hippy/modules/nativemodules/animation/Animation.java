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

import android.animation.Animator;
import android.animation.ValueAnimator;

import java.util.Iterator;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * FileName: Animation
 * Description：
 * History：
 */
public abstract class Animation implements ValueAnimator.AnimatorUpdateListener, Animator.AnimatorListener
{
	protected final int							mId;

	protected CopyOnWriteArrayList<Integer>	mAnimationNodes;

	protected CopyOnWriteArrayList<AnimationListener> mAnimationListeners;


	public Animation(int id)
	{
		this.mId = id;
	}

	public abstract Animator getAnimator();

	public abstract void start();

	public abstract void stop();

	public int getId()
	{
		return mId;
	}

	public void addAnimationNode(int tagId)
	{
		if (mAnimationNodes == null)
		{
			mAnimationNodes = new CopyOnWriteArrayList<>();
		}
		if (!mAnimationNodes.contains(tagId))
		{
			mAnimationNodes.add(tagId);
		}
	}

	public void removeAnimationNode(int tagId)
	{
		if (mAnimationNodes != null)
		{
			mAnimationNodes.remove(Integer.valueOf(tagId));
		}
	}

	public CopyOnWriteArrayList<Integer> getAnimationNodes()
	{
		return mAnimationNodes;
	}

	public void addAnimationListener(AnimationListener listener)
	{
		if(mAnimationListeners == null)
		{
			mAnimationListeners = new CopyOnWriteArrayList<AnimationListener>();
		}
		mAnimationListeners.add(listener);
	}

	@Override
	public void onAnimationUpdate(ValueAnimator animation)
	{
		if(mAnimationListeners == null)
		{
			return;
		}
		Iterator<AnimationListener> it = mAnimationListeners.iterator();
		while (it.hasNext())
		{
			it.next().onAnimationUpdate(this);
		}
	}

	@Override
	public void onAnimationStart(Animator animation, boolean isReverse) {
		onAnimationStart(animation);
	}

	@Override
	public void onAnimationEnd(Animator animation, boolean isReverse) {
		onAnimationEnd(animation);
	}
	
	@Override
	public void onAnimationStart(Animator animation)
	{
		if(mAnimationListeners == null)
		{
			return;
		}
		Iterator<AnimationListener> it = mAnimationListeners.iterator();
		while (it.hasNext())
		{
			it.next().onAnimationStart(this);
		}
	}

	@Override
	public void onAnimationEnd(Animator animation)
	{
		if(mAnimationListeners == null)
		{
			return;
		}
		Iterator<AnimationListener> it = mAnimationListeners.iterator();
		while (it.hasNext())
		{
			it.next().onAnimationEnd(this);
		}

	}

	@Override
	public void onAnimationCancel(Animator animation)
	{
		if(mAnimationListeners == null)
		{
			return;
		}
		Iterator<AnimationListener> it = mAnimationListeners.iterator();
		while (it.hasNext())
		{
			it.next().onAnimationCancel(this);
		}
	}

	@Override
	public void onAnimationRepeat(Animator animation)
	{
		if(mAnimationListeners == null)
		{
			return;
		}
		Iterator<AnimationListener> it = mAnimationListeners.iterator();
		while (it.hasNext())
		{
			it.next().onAnimationRepeat(this);
		}
	}

	public abstract Object getAnimationValue();

	public abstract Object getAnimationSimpleValue();

	public abstract void resume();

	public abstract void pause();

	public interface AnimationListener
	{
		void onAnimationStart(Animation animation);

		void onAnimationEnd(Animation animation);

		void onAnimationCancel(Animation animation);

		void onAnimationRepeat(Animation animation);

		void onAnimationUpdate(Animation animation);
	}
}
