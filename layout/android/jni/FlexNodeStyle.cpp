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
#include "FlexNodeStyle.h"
#include "FlexNode.h"
#include "FlexNodeStyleJni.h"
#include "FlexNodeUtil.h"
#include <android/log.h>
static jlong FlexNodeStyleNew(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& jcaller) {
  FlexNodeStyle* flex_node = new FlexNodeStyle(env, jcaller);
  return reinterpret_cast<intptr_t>(flex_node);
}

FlexNodeStyle::FlexNodeStyle(JNIEnv* env, jobject obj) {

}

FlexNodeStyle::~FlexNodeStyle() {

}
void FlexNodeStyle::SetFlexNode(JNIEnv* env,
                                const base::android::JavaParamRef<jobject>& obj,
                                jlong flexnode) {
  mFlexNode = (FlexNode*) flexnode;
}
void FlexNodeStyle::FlexNodeStyleFree(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj) {
  delete this;
}

#define FLEX_NODE_STYLE_MEM_FUN_GET_CPP(type, name)	\
	type  FlexNodeStyle::FlexNodeStyleGet##name ( JNIEnv* env, const base::android::JavaParamRef<jobject>& obj ) 

#define FLEX_NODE_STYLE_MEM_FUN_SET_CPP(type, name)	\
	void  FlexNodeStyle::FlexNodeStyleSet##name ( JNIEnv* env, const base::android::JavaParamRef<jobject>& obj ,  type _##name)

#define FLEX_NODE_STYLE_MEM_FUN_SET0_CPP(type, name)	\
	void  FlexNodeStyle::FlexNodeStyleSet##name ( JNIEnv* env, const base::android::JavaParamRef<jobject>& obj ) 

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, Direction) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetDirection" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, Direction) {
  FLEX_NODE_LOG("FlexNodeStyle::SetDirection :%d" , _Direction );
  HPNodeStyleSetDirection(mFlexNode->mHPNode, (HPDirection)_Direction);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, FlexDirection) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexDirection" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, FlexDirection) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexDirection :%d" , _FlexDirection );
  HPNodeStyleSetFlexDirection(mFlexNode->mHPNode,
                              (FlexDirection) _FlexDirection);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, JustifyContent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetJustifyContent" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, JustifyContent) {
  FLEX_NODE_LOG("FlexNodeStyle::SetJustifyContent :%d" , _JustifyContent );
  HPNodeStyleSetJustifyContent(mFlexNode->mHPNode, (FlexAlign) _JustifyContent);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, AlignItems) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAlignItems" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, AlignItems) {
  FLEX_NODE_LOG("FlexNodeStyle::SetAlignItems :%d" , _AlignItems );
  HPNodeStyleSetAlignItems(mFlexNode->mHPNode, (FlexAlign) _AlignItems);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, AlignSelf) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAlignSelf" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, AlignSelf) {
  FLEX_NODE_LOG("FlexNodeStyle::SetAlignSelf :%d" , _AlignSelf );
  HPNodeStyleSetAlignSelf(mFlexNode->mHPNode, (FlexAlign) _AlignSelf);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, AlignContent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAlignContent" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, AlignContent) {
  FLEX_NODE_LOG("FlexNodeStyle::SetAlignContent:%d" , _AlignContent );
  HPNodeStyleSetAlignContent(mFlexNode->mHPNode, (FlexAlign) _AlignContent);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, PositionType) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetPositionType" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, PositionType) {
  FLEX_NODE_LOG("FlexNodeStyle::SetPositionType:%d" , _PositionType );
  HPNodeStyleSetPositionType(mFlexNode->mHPNode, (PositionType) _PositionType);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, FlexWrap) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexWrap" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, FlexWrap) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexWrap:%d" , _FlexWrap );
  HPNodeStyleSetFlexWrap(mFlexNode->mHPNode, (FlexWrapMode) _FlexWrap);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, Overflow) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetOverflow" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, Overflow) {
  FLEX_NODE_LOG("FlexNodeStyle::SetOverflow:%d" , _Overflow );
  HPNodeStyleSetOverflow(mFlexNode->mHPNode, (OverflowType) _Overflow);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jint, Display) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetDisplay" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, Display) {
  FLEX_NODE_LOG("FlexNodeStyle::SetDisplay:%d" , _Display );
  HPNodeStyleSetDisplay(mFlexNode->mHPNode, (DisplayType) _Display);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jfloat, Flex) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlex" );
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, Flex) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetFlex:%.2f" , _Flex );
  HPNodeStyleSetFlex(mFlexNode->mHPNode, _Flex);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jfloat, FlexGrow) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexGrow" );
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, FlexGrow) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexGrow:%.2f" , _FlexGrow );
  HPNodeStyleSetFlexGrow(mFlexNode->mHPNode, _FlexGrow);

}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jfloat, FlexShrink) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexShrink" );
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, FlexShrink) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexShrink:%.2f" , _FlexShrink );
  HPNodeStyleSetFlexShrink(mFlexNode->mHPNode, _FlexShrink);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( base::android::ScopedJavaLocalRef<jobject>, FlexBasis){
FLEX_NODE_LOG("FlexNodeStyle::GetFlexBasis" );
JNIEnv* env_ = GetJNIEnv();
base::android::ScopedJavaLocalRef<jobject> FlexValue =
Java_FlexNodeStyle_createFlexValue(env_ , 0, 0);
return FlexValue;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, FlexBasis) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexBasis:%.2f" , _FlexBasis );
  HPNodeStyleSetFlexBasis(mFlexNode->mHPNode, _FlexBasis);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, FlexBasisPercent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetFlexBasisPercent:%.2f" , _FlexBasisPercent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP( jfloat, FlexBasisAuto) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetFlexBasisAuto" );
}

base::android::ScopedJavaLocalRef<jobject> FlexNodeStyle::FlexNodeStyleGetMargin(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetMargin" );
  JNIEnv* env_ = GetJNIEnv();
  base::android::ScopedJavaLocalRef<jobject> FlexValue =
      Java_FlexNodeStyle_createFlexValue(env_, 0, 0);
  return FlexValue;
}
void FlexNodeStyle::FlexNodeStyleSetMargin(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge,
    jfloat margin) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMargin:%.2f" , margin );
  HPNodeStyleSetMargin(mFlexNode->mHPNode, (CSSDirection) edge, margin);
}
void FlexNodeStyle::FlexNodeStyleSetMarginPercent(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge,
    jfloat percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMarginPercent:%d, %.2f" , edge, percent );
}
void FlexNodeStyle::FlexNodeStyleSetMarginAuto(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMarginAuto:%d" , edge );
  HPNodeStyleSetMarginAuto(mFlexNode->mHPNode, (CSSDirection) edge);
}

base::android::ScopedJavaLocalRef<jobject> FlexNodeStyle::FlexNodeStyleGetPadding(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetPadding" );
  JNIEnv* env_ = GetJNIEnv();
  base::android::ScopedJavaLocalRef<jobject> FlexValue =
      Java_FlexNodeStyle_createFlexValue(env_, 0, 0);
  return FlexValue;
}
void FlexNodeStyle::FlexNodeStyleSetPadding(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge,
    jfloat padding) {
  FLEX_NODE_LOG("FlexNodeStyle::SetPadding :%.2f" , padding );
  HPNodeStyleSetPadding(mFlexNode->mHPNode, (CSSDirection) edge, padding);
}
void FlexNodeStyle::FlexNodeStyleSetPaddingPercent(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge,
    jfloat percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetPaddingPercent : %d, %.2f" ,edge, percent );
}

base::android::ScopedJavaLocalRef<jobject> FlexNodeStyle::FlexNodeStyleGetBorder(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetBorder " );
  JNIEnv* env_ = GetJNIEnv();
  base::android::ScopedJavaLocalRef<jobject> FlexValue =
      Java_FlexNodeStyle_createFlexValue(env_, 0, 0);
  return FlexValue;
}

void FlexNodeStyle::FlexNodeStyleSetBorder(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge,
    jfloat border) {
  FLEX_NODE_LOG("FlexNodeStyle::SetBorder : %d, %.2f" ,edge, border );
  HPNodeStyleSetBorder(mFlexNode->mHPNode, (CSSDirection) edge, border);
}

base::android::ScopedJavaLocalRef<jobject> FlexNodeStyle::FlexNodeStyleGetPosition(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetPosition" );
  JNIEnv* env_ = GetJNIEnv();
  base::android::ScopedJavaLocalRef<jobject> FlexValue =
      Java_FlexNodeStyle_createFlexValue(env_, 0, 0);
  return FlexValue;
}
void FlexNodeStyle::FlexNodeStyleSetPosition(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge,
    jfloat position) {
  FLEX_NODE_LOG("FlexNodeStyle::SetPosition : %d, %.2f" ,edge, position );
  HPNodeStyleSetPosition(mFlexNode->mHPNode, (CSSDirection) edge, position);
}
void FlexNodeStyle::FlexNodeStyleSetPositionPercent(
    JNIEnv* env, const base::android::JavaParamRef<jobject>& obj, jint edge,
    jfloat percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetPositionPercent : %d, %.2f" ,edge, percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( base::android::ScopedJavaLocalRef<jobject>, Width){
FLEX_NODE_LOG("FlexNodeStyle::GetWidth" );
JNIEnv* env_ = GetJNIEnv();
base::android::ScopedJavaLocalRef<jobject> FlexValue =
Java_FlexNodeStyle_createFlexValue(env_ , 0, 0);
return FlexValue;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, Width) {
  FLEX_NODE_LOG("FlexNodeStyle::SetWidth : %.2f" , _Width );
  HPNodeStyleSetWidth(mFlexNode->mHPNode, _Width);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, WidthPercent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetWidthPercent : %.2f" , _WidthPercent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP( jfloat, WidthAuto) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetWidthAuto" );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( base::android::ScopedJavaLocalRef<jobject>, Height){
FLEX_NODE_LOG("FlexNodeStyle::GetHeight" );
JNIEnv* env_ = GetJNIEnv();
base::android::ScopedJavaLocalRef<jobject> FlexValue =
Java_FlexNodeStyle_createFlexValue(env_ , 0, 0);
return FlexValue;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, Height) {
  FLEX_NODE_LOG("FlexNodeStyle::SetHeight: %.2f" , _Height );
  HPNodeStyleSetHeight(mFlexNode->mHPNode, _Height);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, HeightPercent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetHeightPercent: %.2f" , _HeightPercent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP( jfloat, HeightAuto) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetHeightAuto" );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( base::android::ScopedJavaLocalRef<jobject>, MinWidth){
FLEX_NODE_LOG("FlexNodeStyle::GetMinWidth" );
JNIEnv* env_ = GetJNIEnv();
base::android::ScopedJavaLocalRef<jobject> FlexValue =
Java_FlexNodeStyle_createFlexValue(env_ , 0, 0);
return FlexValue;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, MinWidth) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMinWidth: %d" , _MinWidth );
  HPNodeStyleSetMinWidth(mFlexNode->mHPNode, _MinWidth);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jint, MinWidthPercent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMinWidthPercent: %d" , _MinWidthPercent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( base::android::ScopedJavaLocalRef<jobject>, MinHeight){
FLEX_NODE_LOG("FlexNodeStyle::GetMinHeight" );
JNIEnv* env_ = GetJNIEnv();
base::android::ScopedJavaLocalRef<jobject> FlexValue =
Java_FlexNodeStyle_createFlexValue(env_ , 0, 0);
return FlexValue;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, MinHeight) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMinHeight: %.2f" , _MinHeight );
  HPNodeStyleSetMinHeight(mFlexNode->mHPNode, _MinHeight);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, MinHeightPercent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMinHeightPercent: %.2f" , _MinHeightPercent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( base::android::ScopedJavaLocalRef<jobject>, MaxWidth){
FLEX_NODE_LOG("FlexNodeStyle::GetMaxWidth" );
JNIEnv* env_ = GetJNIEnv();
base::android::ScopedJavaLocalRef<jobject> FlexValue =
Java_FlexNodeStyle_createFlexValue(env_ , 0, 0);
return FlexValue;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, MaxWidth) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMaxWidth: %.2f" , _MaxWidth );
  HPNodeStyleSetMaxWidth(mFlexNode->mHPNode, _MaxWidth);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, MaxWidthPercent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMaxWidthPercent: %.2f" , _MaxWidthPercent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( base::android::ScopedJavaLocalRef<jobject>, MaxHeight){
FLEX_NODE_LOG("FlexNodeStyle::GetMaxHeight" );
JNIEnv* env_ = GetJNIEnv();
base::android::ScopedJavaLocalRef<jobject> FlexValue =
Java_FlexNodeStyle_createFlexValue(env_ , 0, 0);
return FlexValue;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, MaxHeight) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMaxHeight: %.2f" , _MaxHeight );
  HPNodeStyleSetMaxHeight(mFlexNode->mHPNode, _MaxHeight);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, MaxHeightPercent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMaxHeightPercent: %.2f" , _MaxHeightPercent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP( jfloat, AspectRatio) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAspectRatio" );
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP( jfloat, AspectRatio) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetAspectRatio: %.2f" , _AspectRatio );
}

bool RegisterFlexNodeStyle(JNIEnv* env) {
  return RegisterNativesImpl(env);
}
