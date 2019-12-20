package com.tencent.mtt.supportui.views.recyclerview;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public class ScrollInterpolator
{
	private float	mVelocity			= 2500;
	private float	mPhysicsTimeStep	= 1 / 120f;
	private float	mSpringTightness	= 7;
	private float	mSpringDampening	= 15;
	private float	mMinStep			= 1.5f;

	private float Spring(float velocity, int position, int restPosition, float tightness, float dampening)
	{
		float d = position - restPosition;
		if (d < 0)
		{
			d = -d;
		}
		return (-tightness * d) - (dampening * velocity);
	}

	public int getStep(int current, int distance, int toPosition)
	{
		if (distance == 0)
		{
			return 0;
		}
		float F = Spring(mVelocity, current, toPosition, mSpringTightness, mSpringDampening);
		mVelocity += F * mPhysicsTimeStep;
		float step = mVelocity / 50;
		if (step < mMinStep)
		{
			step = mMinStep;
		}
		return (int) step;
	}

	public void initVelocity(int distance)
	{
		mVelocity = Math.abs(distance) * 8;
	}
}

