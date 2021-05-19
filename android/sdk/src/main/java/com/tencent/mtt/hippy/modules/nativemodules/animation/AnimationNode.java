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

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;

import java.util.ArrayList;

@SuppressWarnings("deprecation")
public class AnimationNode {

  private final int mTagId;
  private final HippyRootView mRootView;
  private final ArrayList<Animation> mAnimations;
  private HippyMap mProps;

  public AnimationNode(int tagId, HippyRootView rootView) {
    mTagId = tagId;
    mRootView = rootView;
    mAnimations = new ArrayList<>();
  }

  public int getId() {
    return mTagId;
  }

  public HippyRootView getRootView() {
    return mRootView;
  }

  public HippyMap getProps() {
    return mProps;
  }

  public void setProps(HippyMap props) {
    this.mProps = props;
  }

  public void addAnimation(Animation animation) {
    if (!mAnimations.contains(animation)) {
      mAnimations.add(animation);
    }
  }

  public ArrayList<Animation> getAnimations() {
    return mAnimations;
  }

}
