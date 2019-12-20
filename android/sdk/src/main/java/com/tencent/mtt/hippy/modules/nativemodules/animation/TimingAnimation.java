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
import android.os.Build;
import android.text.TextUtils;
import android.view.animation.*;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;

/**
 * FileName: TimingAnimation
 * Description：
 * History：
 */
public class TimingAnimation extends Animation implements ValueAnimator.AnimatorUpdateListener, Animator.AnimatorListener
{

	private static final String	VALUE_TYPE_RAD				= "rad";
	private static final String	VALUE_TYPE_DEG				= "deg";
	private static final String	TIMING_FUNCTION_LINEAR		= "linear";
	private static final String	TIMING_FUNCTION_EASE_IN		= "ease-in";
	private static final String	TIMING_FUNCTION_EASE_OUT	= "ease-out";
	private static final String	TIMING_FUNCTION_EASE_IN_OUT	= "ease-in-out";
	private static final String	TIMING_FUNCTION_EASE_BEZIER	= "ease_bezier";
	protected float				mStartValue;
	protected float				mToValue;
	protected int				mDuration;
	protected String			mTimingFunction;
	protected ValueAnimator		mAnimator;
	protected String			mValueType;
	protected int				mRepeatCount				= 0;
	protected ValueTransformer	mValueTransformer;

	/**
	 * Animation delay time
	 */
	protected int				mDelay						= 0;
	private Object				mAnimationValue				= 0.0;

	public TimingAnimation(int id)
	{
		super(id);
		mAnimator = new ValueAnimator();
		mAnimator.addUpdateListener(this);
		mAnimator.addListener(this);
	}

	@Override
	public Animator getAnimator()
	{
		return mAnimator;
	}

	@Override
	public void start()
	{
		mAnimator.start();
	}

	@Override
	public void stop()
	{
		mAnimator.cancel();
	}

	@Override
	public Object getAnimationValue()
	{
		Object simpleValue = getAnimationSimpleValue();
		if ((simpleValue instanceof Number) && mValueTransformer != null)
		{
			Object transformValue = mValueTransformer.transform((Number) simpleValue);
			if (transformValue != null)
			{
				simpleValue = transformValue;
			}
		}
		if (TextUtils.equals(mValueType, VALUE_TYPE_RAD))
		{
			return simpleValue + "rad";
		}
		else if (TextUtils.equals(mValueType, VALUE_TYPE_DEG))
		{
			return simpleValue + "deg";
		}
		return simpleValue;
	}

	@Override
	public Object getAnimationSimpleValue()
	{
		return mAnimationValue;
	}

	@Override
	public void resume()
	{
		if (mAnimator != null)
		{
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT)
			{
				mAnimator.resume();
			}
		}
	}

	@Override
	public void pause()
	{
		if (mAnimator != null)
		{
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT)
			{
				mAnimator.pause();
			}
		}
	}

	@Override
	public void onAnimationUpdate(ValueAnimator animation)
	{
		if (animation != null)
		{
			mAnimationValue = mAnimator.getAnimatedValue();
		}

		super.onAnimationUpdate(animation);

	}

	public void parseFromData(HippyMap param)
	{
		if (param.containsKey("delay"))
		{
			mDelay = param.getInt("delay");
		}

		if (param.containsKey("startValue"))
		{
			mStartValue = (float) param.getDouble("startValue");
		}
		mAnimationValue = mStartValue;

		if (param.containsKey("toValue"))
		{
			mToValue = (float) param.getDouble("toValue");
		}

		if (param.containsKey("duration"))
		{
			mDuration = param.getInt("duration");
		}

		if (param.containsKey("valueType"))
		{
			mValueType = param.getString("valueType");
		}

		if (param.containsKey("timingFunction"))
		{
			mTimingFunction = param.getString("timingFunction");
		}

		if (param.containsKey(NodeProps.REPEAT_COUNT))
		{
			mRepeatCount = param.getInt(NodeProps.REPEAT_COUNT);
			/**
			 * 前端repeatCount的含义
			 * 小于0 		无限次
			 * 0 			1次 = (0+1)次
			 * n  			是n次
			 * bugFix:https://git.code.oa.com/hippy/hippy/issues/73
			 * */
			if(mRepeatCount > 0 )
				mRepeatCount = mRepeatCount - 1;
			mAnimator.setRepeatCount(mRepeatCount);
			mAnimator.setRepeatMode(ValueAnimator.RESTART);
		}

		if (param.containsKey("inputRange"))
		{
			HippyArray inputRange = param.getArray("inputRange");
			if (param.containsKey("outputRange"))
			{
				HippyArray outputRange = param.getArray("outputRange");
				mValueTransformer = new ValueTransformer(inputRange, outputRange);
			}
		}

		mAnimator.setFloatValues(mStartValue, mToValue);
		mAnimator.setDuration(mDuration);
		if (TextUtils.equals(TIMING_FUNCTION_EASE_IN, mTimingFunction))
		{
			mAnimator.setInterpolator(new AccelerateInterpolator());
		}
		else if (TextUtils.equals(TIMING_FUNCTION_EASE_OUT, mTimingFunction))
		{
			mAnimator.setInterpolator(new DecelerateInterpolator());
		}
		else if (TextUtils.equals(TIMING_FUNCTION_EASE_IN_OUT, mTimingFunction))
		{
			mAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
		}
		else if (TextUtils.equals(TIMING_FUNCTION_EASE_BEZIER, mTimingFunction))
		{
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP)
			{
				mAnimator.setInterpolator(new PathInterpolator(0.42f, 0, 1, 1));
			}
			else
			{
				mAnimator.setInterpolator(new BezierInterpolator(0.42f, 0, 1, 1));
			}
		}
		else
		{
			mAnimator.setInterpolator(new LinearInterpolator());
		}
		mAnimator.setStartDelay(mDelay);
	}
}
