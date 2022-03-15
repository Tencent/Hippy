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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.concurrent.CopyOnWriteArrayList;

public class AnimationNode {

    private final int mNodeId;
    @NonNull
    private final CopyOnWriteArrayList<Animation> mAnimations;

    public AnimationNode(int nodeId) {
        mNodeId = nodeId;
        mAnimations = new CopyOnWriteArrayList<>();
    }

    public int getId() {
        return mNodeId;
    }

    public void addAnimation(Animation animation) {
        if (!mAnimations.contains(animation)) {
            mAnimations.add(animation);
        }
    }

    public void clearAnimation() {
        for (Animation animation : mAnimations) {
            if (animation != null) {
                animation.removeAnimationNode(mNodeId);
            }
        }
        mAnimations.clear();
    }

    public CopyOnWriteArrayList<Animation> getAnimations() {
        return mAnimations;
    }
}
