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
import android.animation.AnimatorSet;
import android.os.Build;

import java.util.ArrayList;

@SuppressWarnings({"unused"})
public class AnimationSet extends Animation implements Animator.AnimatorListener {

  private static final int ANIMATION_SET_STATUS_NONE = -1;
  private static final int ANIMATION_SET_STATUS_START = 0;
  private static final int ANIMATION_SET_STATUS_REPEATING = 1;
  private static final int ANIMATION_SET_STATUS_END = 2;

  private final AnimatorSet mAnimatorSet;

  private AnimatorSet.Builder mLastBuilder;

  private Animation mLastPlayAnimation;

  private ArrayList<Integer> mChildAnimationIds;

  private Animation mCurrentAnimation = null;

  private int mRepeatCount = 0;

  private int mCurrentRepeatCount = 0;

  private int mCurrAnimationStatus = ANIMATION_SET_STATUS_NONE;


  private final Animation.AnimationListener mChildAnimationListener = new AnimationListener() {
    @Override
    public void onAnimationStart(Animation animation) {

    }

    @Override
    public void onAnimationEnd(Animation animation) {

    }

    @Override
    public void onAnimationCancel(Animation animation) {

    }

    @Override
    public void onAnimationRepeat(Animation animation) {

    }

    @Override
    public void onAnimationUpdate(Animation animation) {
      mCurrentAnimation = animation;
      if (mAnimationListeners == null) {
        return;
      }
      for (AnimationListener mAnimationListener : mAnimationListeners) {
        mAnimationListener
            .onAnimationUpdate(
                AnimationSet.this);
      }
    }
  };

  @SuppressWarnings("unused")
  public AnimationSet(int id) {
    super(id);
    mAnimatorSet = new AnimatorSet();
    mAnimatorSet.addListener(this);
  }

  @Override
  public Animator getAnimator() {
    return mAnimatorSet;
  }

  @Override
  public void start() {
    if (mCurrAnimationStatus == ANIMATION_SET_STATUS_NONE
        || mCurrAnimationStatus == ANIMATION_SET_STATUS_END) {
      mCurrentRepeatCount = 0;
      mCurrAnimationStatus = ANIMATION_SET_STATUS_START;
      mAnimatorSet.start();
    }
  }

  @Override
  public void stop() {
    int lastStatus = mCurrAnimationStatus;
    mCurrAnimationStatus = ANIMATION_SET_STATUS_END;

    //如果调stop的时候刚好需要重复的动画已经结束了，但尚未开始，需要补一个事件
    if (!mAnimatorSet.isStarted() && lastStatus == ANIMATION_SET_STATUS_REPEATING) {
      onAnimationEnd(mAnimatorSet);
    }
    mAnimatorSet.cancel();
  }

  @Override
  public Object getAnimationValue() {
    if (mCurrentAnimation != null) {
      return mCurrentAnimation.getAnimationValue();
    }
    return 0;

  }

  @Override
  public Object getAnimationSimpleValue() {
    if (mCurrentAnimation != null) {
      return mCurrentAnimation.getAnimationSimpleValue();
    }
    return 0;
  }

  @Override
  public void resume() {
    if (mAnimatorSet != null) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        mAnimatorSet.resume();
      }
    }
  }

  @Override
  public void pause() {
    if (mAnimatorSet != null) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
        mAnimatorSet.pause();
      }
    }
  }

  public void setRepeatCount(int repeatCount) {
    mRepeatCount = repeatCount;
    mCurrentRepeatCount = 0;
  }


  @Override
  public void onAnimationStart(Animator animation) {
    if (mCurrAnimationStatus < ANIMATION_SET_STATUS_REPEATING) {
      super.onAnimationStart(animation);
    } else {
      onAnimationRepeat(animation);
    }
  }

  @Override
  public void onAnimationEnd(Animator animation) {
    if (mCurrAnimationStatus == ANIMATION_SET_STATUS_END) {
      super.onAnimationEnd(animation);
      return;
    }

    if (mRepeatCount == -1 || (mRepeatCount > 0 && mCurrentRepeatCount < mRepeatCount - 1)) {
      mCurrAnimationStatus = ANIMATION_SET_STATUS_REPEATING;
      mCurrentRepeatCount++;
      mAnimatorSet.start();
    } else {
      mCurrAnimationStatus = ANIMATION_SET_STATUS_END;
      super.onAnimationEnd(animation);
    }

  }


  public void addAnimation(Animation animation, boolean follow) {
    if (animation == null || animation.getAnimator() == null) {
      return;
    }
    animation.addAnimationListener(mChildAnimationListener);
    if (mCurrentAnimation == null) {
      mCurrentAnimation = animation;
    }
    if (mChildAnimationIds == null) {
      mChildAnimationIds = new ArrayList<>();
    }
    mChildAnimationIds.add(animation.getId());

    if (mLastPlayAnimation == null) {
      mLastBuilder = mAnimatorSet.play(animation.getAnimator());
      mLastPlayAnimation = animation;
    } else if (!follow) {
      mLastBuilder.with(animation.getAnimator());
    } else {
      mLastBuilder = mAnimatorSet.play(animation.getAnimator())
          .after(mLastPlayAnimation.getAnimator());
      mLastPlayAnimation = animation;
    }
  }

  public ArrayList<Integer> getChildAnimationIds() {
    return mChildAnimationIds;
  }
}
