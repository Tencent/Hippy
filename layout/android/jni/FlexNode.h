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

#ifndef TENCENT_FLEX_NODE_H_
#define TENCENT_FLEX_NODE_H_

#include "scoped_java_ref.h"
#include "../../engine/Hippy.h"
#include <jni.h>
#define FLEX_NODE_MEM_FUN_GET_INCLUDE(type, name)	\
	type  FlexNodeGet##name ( JNIEnv* env, const base::android::JavaParamRef<jobject>& obj ) 

#define FLEX_NODE_MEM_FUN_SET_INCLUDE(type, name)	\
	void  FlexNodeSet##name ( JNIEnv* env, const base::android::JavaParamRef<jobject>& obj ,  type name) 

class FlexNode {
 public:
  HPNodeRef mHPNode;
  FlexNode(JNIEnv* env, const base::android::JavaParamRef<jobject>& jcaller);
  void FlexNodeReset(JNIEnv* env,
                     const base::android::JavaParamRef<jobject>& jcaller);

  // Methods called from Java via JNI -----------------------------------------
  void FlexNodeFree(JNIEnv* env,
                    const base::android::JavaParamRef<jobject>& obj);
  void FlexNodeFreeRecursive(JNIEnv* env,
                             const base::android::JavaParamRef<jobject>& obj);

  void FlexNodeInsertChild(JNIEnv* env,
                           const base::android::JavaParamRef<jobject>& obj,
                           jlong childPointer, jint indext);
  void FlexNodeRemoveChild(JNIEnv* env,
                           const base::android::JavaParamRef<jobject>& obj,
                           jlong childPointer);
  void FlexNodeCalculateLayout(JNIEnv* env,
                               const base::android::JavaParamRef<jobject>& obj,
                               jfloat width, jfloat height,
                               const base::android::JavaParamRef<jlongArray>& nativeNodes,
                               const base::android::JavaParamRef<jobjectArray>& javaNodes,
                               jint direction);

  void FlexNodeNodeMarkDirty(JNIEnv* env,
                             const base::android::JavaParamRef<jobject>& obj);
  bool FlexNodeNodeIsDirty(JNIEnv* env,
                           const base::android::JavaParamRef<jobject>& obj);
  void FlexNodeNodeSetHasMeasureFunc(
      JNIEnv* env, const base::android::JavaParamRef<jobject>& obj,
      jboolean hasMeasureFunc);
  void FlexNodeNodeSetHasBaselineFunc(
      JNIEnv* env, const base::android::JavaParamRef<jobject>& obj,
      jboolean hasMeasureFunc);
  void FlexNodemarkHasNewLayout(
      JNIEnv* env, const base::android::JavaParamRef<jobject>& obj);
  bool FlexNodehasNewLayout(JNIEnv* env,
                            const base::android::JavaParamRef<jobject>& obj);
  void FlexNodemarkLayoutSeen(JNIEnv* env,
                              const base::android::JavaParamRef<jobject>& obj);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , Width);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , Width);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , Height);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , Height);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , Left);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , Left);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , Top);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , Top);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , Right);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , Right);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , Bottom);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , Bottom);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , MarginLeft);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , MarginLeft);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , MarginTop);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , MarginTop);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , MarginRight);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , MarginRight);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , MarginBottom);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , MarginBottom);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , PaddingLeft);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , PaddingLeft);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , PaddingTop);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , PaddingTop);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , PaddingRight);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , PaddingRight);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , PaddingBottom);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , PaddingBottom);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , BorderLeft);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , BorderLeft);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , BorderTop);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , BorderTop);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , BorderRight);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , BorderRight);

  FLEX_NODE_MEM_FUN_GET_INCLUDE(jfloat , BorderBottom);FLEX_NODE_MEM_FUN_SET_INCLUDE(jfloat , BorderBottom);

 private:
  virtual ~FlexNode();
  //DISALLOW_COPY_AND_ASSIGN(FlexNode);
};

bool RegisterFlexNode(JNIEnv* env);

JNIEnv* GetJNIEnv();
#endif
