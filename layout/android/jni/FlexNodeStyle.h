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

#pragma once

#include "FlexNode.h"
#include "scoped_java_ref.h"

#define FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(type, name) \
  type FlexNodeStyleGet##name(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj)

#define FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(type, name)                                     \
  void FlexNodeStyleSet##name(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, \
                              type name)

#define FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE(type, name) \
  void FlexNodeStyleSet##name(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj)

class FlexNodeStyle {
 public:
  FlexNodeStyle(JNIEnv* env, jobject obj);

  // Methods called from Java via JNI -----------------------------------------
  void SetFlexNode(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jlong flexnode);
  void FlexNodeStyleFree(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, Direction);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, Direction);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, FlexDirection);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, FlexDirection);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, JustifyContent);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, JustifyContent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, AlignItems);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, AlignItems);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, AlignSelf);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, AlignSelf);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, AlignContent);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, AlignContent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, PositionType);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, PositionType);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, FlexWrap);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, FlexWrap);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, Overflow);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, Overflow);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jint, Display);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, Display);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jfloat, Flex);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, Flex);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jfloat, FlexGrow);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, FlexGrow);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jfloat, FlexShrink);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, FlexShrink);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(base::android::ScopedJavaLocalRef<jobject>, FlexBasis);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, FlexBasis);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, FlexBasisPercent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE(jfloat, FlexBasisAuto);

  base::android::ScopedJavaLocalRef<jobject>
  FlexNodeStyleGetMargin(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge);
  void FlexNodeStyleSetMargin(JNIEnv* env,
                              const base::android::JavaParamRef<jobject>& obj,
                              jint edge,
                              jfloat padding);
  void FlexNodeStyleSetMarginPercent(JNIEnv* env,
                                     const base::android::JavaParamRef<jobject>& obj,
                                     jint edge,
                                     jfloat percent);
  void FlexNodeStyleSetMarginAuto(JNIEnv* env,
                                  const base::android::JavaParamRef<jobject>& obj,
                                  jint edge);

  base::android::ScopedJavaLocalRef<jobject>
  FlexNodeStyleGetPadding(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge);
  void FlexNodeStyleSetPadding(JNIEnv* env,
                               const base::android::JavaParamRef<jobject>& obj,
                               jint edge,
                               jfloat margin);
  void FlexNodeStyleSetPaddingPercent(JNIEnv* env,
                                      const base::android::JavaParamRef<jobject>& obj,
                                      jint edge,
                                      jfloat percent);

  base::android::ScopedJavaLocalRef<jobject>
  FlexNodeStyleGetBorder(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge);
  void FlexNodeStyleSetBorder(JNIEnv* env,
                              const base::android::JavaParamRef<jobject>& obj,
                              jint edge,
                              jfloat border);

  base::android::ScopedJavaLocalRef<jobject>
  FlexNodeStyleGetPosition(JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge);
  void FlexNodeStyleSetPosition(JNIEnv* env,
                                const base::android::JavaParamRef<jobject>& obj,
                                jint edge,
                                jfloat position);
  void FlexNodeStyleSetPositionPercent(JNIEnv* env,
                                       const base::android::JavaParamRef<jobject>& obj,
                                       jint edge,
                                       jfloat percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(base::android::ScopedJavaLocalRef<jobject>, Width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, Width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, WidthPercent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE(jfloat, WidthAuto);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(base::android::ScopedJavaLocalRef<jobject>, Height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, Height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, HeightPercent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE(jfloat, HeightAuto);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(base::android::ScopedJavaLocalRef<jobject>, MinWidth);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, MinWidth);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jint, MinWidthPercent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(base::android::ScopedJavaLocalRef<jobject>, MinHeight);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, MinHeight);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, MinHeightPercent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(base::android::ScopedJavaLocalRef<jobject>, MaxWidth);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, MaxWidth);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, MaxWidthPercent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(base::android::ScopedJavaLocalRef<jobject>, MaxHeight);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, MaxHeight);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, MaxHeightPercent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE(jfloat, AspectRatio);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE(jfloat, AspectRatio);

 private:
  virtual ~FlexNodeStyle();
  FlexNode* mFlexNode;

  // DISALLOW_COPY_AND_ASSIGN(FlexNodeStyle);
};

bool RegisterFlexNodeStyle(JNIEnv* env);
