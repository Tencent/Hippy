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

#include <memory>
#include <iostream>
#include <map>
#include <android/log.h>
#include <time.h>
#include "FlexNode.h"
#include "FlexNodeStyle.h"
#include "FlexNodeJni.h"

static inline HPNodeRef _jlong2HPNodeRef(jlong addr) {
  return ((FlexNode*) addr)->mHPNode;
}

#ifdef LAYOUT_TIME_ANALYZE
static int layout_analyze_measureCount = 0;
static double layout_analyze_measureTime = 0.0f;
static int newLayoutCount = 0;
#endif

static jclass clazz;

static jfieldID widthField;
static jfieldID heightField;
static jfieldID leftField;
static jfieldID topField;

static jfieldID marginLeftField;
static jfieldID marginTopField;
static jfieldID marginRightField;
static jfieldID marginBottomField;

static jfieldID paddingLeftField;
static jfieldID paddingTopField;
static jfieldID paddingRightField;
static jfieldID paddingBottomField;

static jfieldID borderLeftField;
static jfieldID borderTopField;
static jfieldID borderRightField;
static jfieldID borderBottomField;

static jfieldID edgeSetFlagField;
static jfieldID hasNewLayoutField;


class LayoutContext {
 public:
  LayoutContext(jlongArray nativeNodes, jobjectArray javaNodes) {
    //1.setup the map index of HPNodes and java nodes.
    jboolean isCopy = JNI_FALSE;
    JNIEnv* env = GetJNIEnv();
    jlong* flexNodes = env->GetLongArrayElements(nativeNodes, &isCopy);
    jsize size = env->GetArrayLength(nativeNodes);

    //__android_log_print(ANDROID_LOG_ERROR,  "LayoutContext", "node count %d", size);

    for (int i = 0; i < size; i++) {
      HPNodeRef hpNode = _jlong2HPNodeRef(flexNodes[i]);
      ASSERT(hpNode != nullptr);
      node_ptr_index_map[hpNode] = i;
    }
    env->ReleaseLongArrayElements(nativeNodes, flexNodes, 0);

    //2.holds java object array
    ASSERT(size == env->GetArrayLength(javaNodes));
    jnode_arr = javaNodes;
  }

  base::android::ScopedJavaLocalRef<jobject> get(HPNodeRef node) {
    JNIEnv* env = GetJNIEnv();
    auto idx = node_ptr_index_map.find(node);
    if (idx == node_ptr_index_map.end()) {
      return base::android::ScopedJavaLocalRef<jobject>();
    } else {
      jobject java_object = env->GetObjectArrayElement(jnode_arr, idx->second);
      return base::android::ScopedJavaLocalRef<jobject>(env, java_object);
    }
  }

 private:
  std::map<HPNodeRef, size_t> node_ptr_index_map;
  jobjectArray jnode_arr;
};

static HPSize HPJNIMeasureFunc(HPNodeRef node, float width,
                               MeasureMode widthMode, float height,
                               MeasureMode heightMode, void * layoutContext) {
  ASSERT(layoutContext != nullptr);
  base::android::ScopedJavaLocalRef<jobject> jnode =
      ((LayoutContext*) layoutContext)->get(node);

  if (!jnode.is_null()) {
#ifdef LAYOUT_TIME_ANALYZE
    clock_t start = clock();
#endif
    const auto measureResult = Java_FlexNode_measureFunc(GetJNIEnv(), jnode.obj(),
                                                         width, widthMode,
                                                         height, heightMode);
#ifdef LAYOUT_TIME_ANALYZE
    clock_t end = clock();
    layout_analyze_measureTime += (end - start);
    layout_analyze_measureCount++;
#endif
    static_assert(sizeof(measureResult) == 8,
        "Expected measureResult to be 8 bytes, or two 32 bit ints");

    int32_t wBits = 0xFFFFFFFF & (measureResult >> 32);
    int32_t hBits = 0xFFFFFFFF & measureResult;
    //__android_log_print(ANDROID_LOG_INFO,  "TextNode2", "in FlexNode widthMode %d width %f, heightMode %d height %f, result :width %d, height %d",widthMode,width,heightMode, height, wBits, hBits);
    return HPSize { (float) wBits, (float) hBits };
  } else {
    return HPSize { widthMode == 0 ? 0 : width, heightMode == 0 ? 0 : height, };
  }
}

static jlong FlexNodeNew(JNIEnv* env,
                         const base::android::JavaParamRef<jobject>& jcaller) {

  FlexNode* flex_node = new FlexNode(env, jcaller);
  return reinterpret_cast<intptr_t>(flex_node);

}

#ifdef LAYOUT_TIME_ANALYZE
static int FlexNodeCount(HPNodeRef node) {
  int allCount = node->childCount();
  for (unsigned int i = 0; i < node->childCount(); i++) {
    allCount += FlexNodeCount( node->getChild(i));
  }
  return allCount;
}
#endif

static void TransferLayoutOutputsRecursive(HPNodeRef node, void * layoutContext) {

  ASSERT(layoutContext != nullptr);
  base::android::ScopedJavaLocalRef<jobject> jnode =
      ((LayoutContext*) layoutContext)->get(node);
  if (jnode.is_null()) {
    return;
  }

  JNIEnv* env = GetJNIEnv();
  jobject java_node=jnode.obj();

  if (!HPNodeHasNewLayout(node)) {
#ifdef LAYOUT_TIME_ANALYZE
//    if (weakRef && ( localRef = GetJNIEnv()->NewLocalRef( weakRef) ) !=NULL ) {
//      JNIEnv* env = GetJNIEnv();
    static jclass clazz = env->FindClass(kFlexNodeClassPath);
    static jfieldID widthField = env->GetFieldID( clazz, "mWidth", "F");
    float javaWidth = env->GetFloatField(java_node, widthField );
//static jfieldID hasNewLayoutField = env->GetFieldID( clazz, "mHasNewLayout",  "Z");
//hasNewLayout = env->GetBooleanField(weakRef ,hasNewLayoutField );
    if(!isDefined(javaWidth)) {
      __android_log_print(ANDROID_LOG_ERROR, "HippyLayoutTime", "cache width NAN  node's fetchCount %d nodetype %d", node->fetchCount, node->style.nodeType);
    }
//      GetJNIEnv()->DeleteLocalRef( localRef );
//    }
#endif 
    return;
  }

#ifdef LAYOUT_TIME_ANALYZE
  newLayoutCount++;
#endif
    const int MARGIN = 1;
    const int PADDING = 2;
    const int BORDER = 4;

    int hasEdgeSetFlag = env->GetIntField(java_node, edgeSetFlagField);

    env->SetFloatField(java_node, widthField, HPNodeLayoutGetWidth(node));
    env->SetFloatField(java_node, heightField, HPNodeLayoutGetHeight(node));
    env->SetFloatField(java_node, leftField, HPNodeLayoutGetLeft(node));
    env->SetFloatField(java_node, topField, HPNodeLayoutGetTop(node));

    if ((hasEdgeSetFlag & MARGIN) == MARGIN) {
      env->SetFloatField(java_node, marginLeftField,
                         HPNodeLayoutGetMargin(node, CSSDirection::CSSLeft));
      env->SetFloatField(java_node, marginTopField,
                         HPNodeLayoutGetMargin(node, CSSDirection::CSSTop));
      env->SetFloatField(java_node, marginRightField,
                         HPNodeLayoutGetMargin(node, CSSDirection::CSSRight));
      env->SetFloatField(java_node, marginBottomField,
                         HPNodeLayoutGetMargin(node, CSSDirection::CSSBottom));
    }

    if ((hasEdgeSetFlag & PADDING) == PADDING) {
      env->SetFloatField(java_node, paddingLeftField,
                         HPNodeLayoutGetPadding(node, CSSDirection::CSSLeft));
      env->SetFloatField(java_node, paddingTopField,
                         HPNodeLayoutGetPadding(node, CSSDirection::CSSTop));
      env->SetFloatField(java_node, paddingRightField,
                         HPNodeLayoutGetPadding(node, CSSDirection::CSSRight));
      env->SetFloatField(java_node, paddingBottomField,
                         HPNodeLayoutGetPadding(node, CSSDirection::CSSBottom));

    }

    if ((hasEdgeSetFlag & BORDER) == BORDER) {
      env->SetFloatField(java_node, borderLeftField,
                         HPNodeLayoutGetBorder(node, CSSDirection::CSSLeft));
      env->SetFloatField(java_node, borderTopField,
                         HPNodeLayoutGetBorder(node, CSSDirection::CSSTop));
      env->SetFloatField(java_node, borderRightField,
                         HPNodeLayoutGetBorder(node, CSSDirection::CSSRight));
      env->SetFloatField(java_node, borderBottomField,
                         HPNodeLayoutGetBorder(node, CSSDirection::CSSBottom));

    }

    env->SetBooleanField(java_node, hasNewLayoutField, true);
    HPNodesetHasNewLayout(node, false);
#ifdef LAYOUT_TIME_ANALYZE
    node->fetchCount++;
#endif
    for (unsigned int i = 0; i < node->childCount(); i++) {
      TransferLayoutOutputsRecursive(node->getChild(i), layoutContext);
    }
}

FlexNode::FlexNode(JNIEnv* env,
                   const base::android::JavaParamRef<jobject>& jcaller) {
  mHPNode = HPNodeNew();
//  jobject jnode = env->NewWeakGlobalRef(jcaller.obj());
//  mHPNode->setContext(jnode);
}

FlexNode::~FlexNode() {

//  jobject weakRef = (jobject) mHPNode->getContext();
  HPNodeFree(mHPNode);
//  if (weakRef) {
//    GetJNIEnv()->DeleteWeakGlobalRef(weakRef);
//  }

}

void FlexNode::FlexNodeReset(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& jcaller) {
  FLEX_NODE_LOG("#not#FlexNode::Reset:" );

}
void FlexNode::FlexNodeInsertChild(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj,
    jlong childPointer, jint index) {
  FLEX_NODE_LOG("FlexNode::InsertChild:%d" , index );
  HPNodeInsertChild(mHPNode, _jlong2HPNodeRef(childPointer), index);
}
void FlexNode::FlexNodeRemoveChild(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj,
    jlong childPointer) {
  FLEX_NODE_LOG("FlexNode::RemoveChild" );
  HPNodeRemoveChild(mHPNode, _jlong2HPNodeRef(childPointer));
}
void FlexNode::FlexNodeCalculateLayout(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jfloat width,
    jfloat height,
    const base::android::JavaParamRef<jlongArray>& nativeNodes,
    const base::android::JavaParamRef<jobjectArray>& javaNodes,
    jint direction) {
  FLEX_NODE_LOG("FlexNode::CalculateLayout:%.2f,%.2f" , width , height );

  ASSERT(!nativeNodes.is_null());
  ASSERT(!javaNodes.is_null());
  LayoutContext layoutContext(nativeNodes, javaNodes);

  //__android_log_print(ANDROID_LOG_INFO,  "HippyLayout", "start HPNodeDoLayout===========================================");
#ifdef LAYOUT_TIME_ANALYZE
  // clock_t start =  clock();
  newLayoutCount = 0;
  struct timeval start ,end;
  gettimeofday(&start ,NULL);
  layout_analyze_measureCount = 0;
  layout_analyze_measureTime = 0.0f;
#endif
  if(direction < 0 || direction > 2) {
    direction = 1;//HPDirection::LTR
  }

  HPNodeDoLayout(mHPNode, width, height, (HPDirection)direction, (void *)&layoutContext);

#ifdef LAYOUT_TIME_ANALYZE
  //clock_t end = clock();
  gettimeofday(&end ,NULL);
  __android_log_print(ANDROID_LOG_INFO, "HippyLayoutTime", "HPNodeDoLayout %ld ms MeasureCount %d MeasureTime %lf ms",
  // (end - start)/(double) CLOCKS_PER_SEC * 1000,
      (1000*(end.tv_sec - start.tv_sec) + (end.tv_usec - start.tv_usec) /1000),
      layout_analyze_measureCount, layout_analyze_measureTime/(double) CLOCKS_PER_SEC* 1000);
#endif
  TransferLayoutOutputsRecursive(mHPNode, (void *)&layoutContext);
#ifdef LAYOUT_TIME_ANALYZE
  gettimeofday(&start ,NULL);
  __android_log_print(ANDROID_LOG_INFO, "HippyLayoutTime", "TransferLayoutOutputsRecursive %ld ms ", (1000*(start.tv_sec - end.tv_sec) + (start.tv_usec - end.tv_usec) /1000));
  __android_log_print(ANDROID_LOG_INFO, "HippyLayoutTime", "FlexNodeCount %d TransferLayoutOutputsRecursive newLayoutCount %d", FlexNodeCount(mHPNode), newLayoutCount);
#endif
  //HPNodePrint(mHPNode);
  // __android_log_print(ANDROID_LOG_INFO,  "HippyLayout", "end HPNodeDoLayout===========================================");
}

void FlexNode::FlexNodeNodeMarkDirty(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj) {
  FLEX_NODE_LOG("FlexNode::MarkDirty" );
  HPNodeMarkDirty(mHPNode);

}

bool FlexNode::FlexNodeNodeIsDirty(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj) {
  FLEX_NODE_LOG("FlexNode::IsDirty" );
  return HPNodeIsDirty(mHPNode);
}

void FlexNode::FlexNodeNodeSetHasMeasureFunc(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj,
    jboolean hasMeasureFunc) {
  FLEX_NODE_LOG("FlexNode::SetHasMeasureFunc:%d " ,hasMeasureFunc);
  HPNodeSetMeasureFunc(mHPNode, hasMeasureFunc ? HPJNIMeasureFunc : NULL);
}

void FlexNode::FlexNodeNodeSetHasBaselineFunc(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj,
    jboolean hasMeasureFunc) {
  FLEX_NODE_LOG("#not#FlexNode::SetHasBaselineFunc" );
}

void FlexNode::FlexNodemarkHasNewLayout(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj) {
  FLEX_NODE_LOG("FlexNode::markHasNewLayout" );
  HPNodesetHasNewLayout(mHPNode, true);
}

bool FlexNode::FlexNodehasNewLayout(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj) {
  FLEX_NODE_LOG("FlexNode::hasNewLayout" );
  return HPNodeHasNewLayout(mHPNode);
}

void FlexNode::FlexNodemarkLayoutSeen(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj) {
  FLEX_NODE_LOG("FlexNode::markLayoutSeen" );

  HPNodesetHasNewLayout(mHPNode, false);

}

#define FLEX_NODE_MEM_FUN_GET_CPP(type, name)	\
	type  FlexNode::FlexNodeGet##name ( JNIEnv* env, const base::android::JavaParamRef<jobject>& obj ) 

#define FLEX_NODE_MEM_FUN_SET_CPP(type, name)	\
	void  FlexNode::FlexNodeSet##name ( JNIEnv* env, const base::android::JavaParamRef<jobject>& obj ,  type name) 

void FlexNode::FlexNodeFree(JNIEnv* env,
                            const base::android::JavaParamRef<jobject>& obj) {
  delete this;
}

void FlexNode::FlexNodeFreeRecursive(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj) {
  FLEX_NODE_LOG("FlexNode::FreeRecursive" );
  HPNodeFreeRecursive(mHPNode);
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , Width) {
  FLEX_NODE_LOG("FlexNode::GetWidth" );
  float value = HPNodeLayoutGetWidth(mHPNode);
  //__android_log_print(ANDROID_LOG_INFO,  "TextNode", "width %f", value);
  return value;
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , Width) {
  FLEX_NODE_LOG("#not#FlexNode::SetWidth:%.2f" ,Width );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , Height) {
  FLEX_NODE_LOG("FlexNode::GetHeight: %.2f" ,HPNodeLayoutGetHeight(mHPNode) );
  return HPNodeLayoutGetHeight(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , Height) {
  FLEX_NODE_LOG("#not#FlexNode::SetHeight:%.2f" ,Height );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , Left) {
  FLEX_NODE_LOG("FlexNode::GetLeft :%.2f" , HPNodeLayoutGetLeft(mHPNode) );
  return HPNodeLayoutGetLeft(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , Left) {
  FLEX_NODE_LOG("#not#FlexNode::SetLeft:%.2f" ,Left );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , Top) {
  FLEX_NODE_LOG("FlexNode::GetTop:%.2f ", HPNodeLayoutGetTop(mHPNode) );
  return HPNodeLayoutGetTop(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , Top) {
  FLEX_NODE_LOG("#not#FlexNode::SetTop:%.2f" ,Top );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , Right) {
  FLEX_NODE_LOG("FlexNode::GetRight:%.2f", HPNodeLayoutGetRight(mHPNode) );
  return HPNodeLayoutGetRight(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , Right) {
  FLEX_NODE_LOG("#not#FlexNode::SetRight:%.2f" ,Right );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , Bottom) {
  FLEX_NODE_LOG("FlexNode::GetBottom:%.2f" , HPNodeLayoutGetBottom(mHPNode));
  return HPNodeLayoutGetBottom(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , Bottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetBottom:%.2f" ,Bottom );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , MarginLeft) {
  FLEX_NODE_LOG("FlexNode::GetMarginLeft" );
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSLeft);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , MarginLeft) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginLeft:%.2f" ,MarginLeft );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , MarginTop) {
  FLEX_NODE_LOG("FlexNode::GetMarginTop" );
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSTop);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , MarginTop) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginTop:%.2f" ,MarginTop );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , MarginRight) {
  FLEX_NODE_LOG("FlexNode::GetMarginRight" );
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSRight);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , MarginRight) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginRight:%.2f" ,MarginRight );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , MarginBottom) {
  FLEX_NODE_LOG("FlexNode::GetMarginBottom" );
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSBottom);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , MarginBottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginBottom:%.2f" ,MarginBottom );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , PaddingLeft) {
  FLEX_NODE_LOG("FlexNode::GetPaddingLeft" );
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSLeft);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , PaddingLeft) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingLeft:%.2f" ,PaddingLeft );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , PaddingTop) {
  FLEX_NODE_LOG("FlexNode::GetPaddingTop" );
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSTop);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , PaddingTop) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingTop:%.2f" ,PaddingTop );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , PaddingRight) {
  FLEX_NODE_LOG("FlexNode::GetPaddingRight" );
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSRight);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , PaddingRight) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingRight:%.2f" ,PaddingRight );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , PaddingBottom) {
  FLEX_NODE_LOG("FlexNode::GetPaddingBottom" );
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSBottom);
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , PaddingBottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingBottom:%.2f" ,PaddingBottom );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , BorderLeft) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderLeft" );
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , BorderLeft) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderLeft:%.2f" ,BorderLeft );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , BorderTop) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderTop" );
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , BorderTop) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderTop:%.2f" ,BorderTop );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , BorderRight) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderRight" );
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , BorderRight) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderRight:%.2f" ,BorderRight );
}

FLEX_NODE_MEM_FUN_GET_CPP(jfloat , BorderBottom) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderBottom" );
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP(jfloat , BorderBottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderBottom:%.2f" ,BorderBottom );
}

bool RegisterFlexNode(JNIEnv* env) {
  return RegisterNativesImpl(env);
}

JavaVM* g_jvm = NULL;
jint JNI_OnLoad(JavaVM* vm, void *) {

  JNIEnv* env = NULL;
  g_jvm = vm;
  //  __android_log_print(ANDROID_LOG_INFO, "FlexBox", "JNI_OnLoad start:%p" , vm);

  if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_4) != JNI_OK) {
    //  __android_log_print(ANDROID_LOG_INFO, "FlexBox", "JNI_OnLoad ERROR");
    return -1;
  }
//delete vlock;
  RegisterFlexNode(env);
  RegisterFlexNodeStyle(env);
  //DemoDocument();
  //__android_log_print(ANDROID_LOG_INFO, "FlexBox", "JNI_OnLoad Sucess");

  clazz = env->FindClass(kFlexNodeClassPath);

  widthField = env->GetFieldID(clazz, "mWidth", "F");
  heightField = env->GetFieldID(clazz, "mHeight", "F");
  leftField = env->GetFieldID(clazz, "mLeft", "F");
  topField = env->GetFieldID(clazz, "mTop", "F");

  marginLeftField = env->GetFieldID(clazz, "mMarginLeft", "F");
  marginTopField = env->GetFieldID(clazz, "mMarginTop", "F");
  marginRightField = env->GetFieldID(clazz, "mMarginRight", "F");
  marginBottomField = env->GetFieldID(clazz, "mMarginBottom", "F");

  paddingLeftField = env->GetFieldID(clazz, "mPaddingLeft", "F");
  paddingTopField = env->GetFieldID(clazz, "mPaddingTop", "F");
  paddingRightField = env->GetFieldID(clazz, "mPaddingRight", "F");
  paddingBottomField = env->GetFieldID(clazz, "mPaddingBottom", "F");

  borderLeftField = env->GetFieldID(clazz, "mBorderLeft", "F");
  borderTopField = env->GetFieldID(clazz, "mBorderTop", "F");
  borderRightField = env->GetFieldID(clazz, "mBorderRight", "F");
  borderBottomField = env->GetFieldID(clazz, "mBorderBottom", "F");

  edgeSetFlagField = env->GetFieldID(clazz, "mEdgeSetFlag", "I");
  hasNewLayoutField = env->GetFieldID(clazz, "mHasNewLayout", "Z");

  return JNI_VERSION_1_4;
}

void JNI_OnUnLoad(JavaVM* vm, void *) {
// __android_log_print(ANDROID_LOG_INFO, "FlexBox", "JNI_OnUnLoad Sucess");
}

JNIEnv* GetJNIEnv() {
  JNIEnv* env = NULL;
  g_jvm->AttachCurrentThread(&env, NULL);
  return env;
}
