//
// Created by longquan on 2020/9/2.
//

#include <memory>
#include "FlexNodeStyleFfi.h"
#include "FlexNodeFfi.h"
#include "FlexNodeFfiUtil.h"

static inline FlexValue* newFlexValue() {
  auto* value = new FlexValue();
  value->value = 0;
  value->unit = 0;
  return value;
}

FlexNodeStyleFfi::FlexNodeStyleFfi() = default;

FlexNodeStyleFfi::~FlexNodeStyleFfi() = default;

void FlexNodeStyleFfi::set_flex_node_ffi(int64_t flexNode) {
  mFlexNode = (FlexNodeFfi*) flexNode;
}

void FlexNodeStyleFfi::FlexNodeStyleFreeFFI() {
  delete this;
}

#define FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI(type, name)	\
	type  FlexNodeStyleFfi::get_flex_node_style_##name ()

#define FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI(type, name)	\
	void  FlexNodeStyleFfi::set_flex_node_style_##name (type _##name)

#define FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI(type, name)	\
	void  FlexNodeStyleFfi::set_flex_node_style_##name ()

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, direction) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetDirection" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.direction;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, direction) {
  FLEX_NODE_LOG("FlexNodeStyle::SetDirection :%d" , _direction );
  HPNodeStyleSetDirection(mFlexNode->mHPNode, (HPDirection)_direction);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, flex_direction) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexDirection" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.flexDirection;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, flex_direction) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexDirection :%d" , _flex_direction );
  HPNodeStyleSetFlexDirection(mFlexNode->mHPNode,
                              (FlexDirection) _flex_direction);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, justify_content) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetJustifyContent" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.justifyContent;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, justify_content) {
  FLEX_NODE_LOG("FlexNodeStyle::SetJustifyContent :%d" , _justify_content );
  HPNodeStyleSetJustifyContent(mFlexNode->mHPNode, (FlexAlign) _justify_content);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, align_items) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAlignItems" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.alignItems;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, align_items) {
  FLEX_NODE_LOG("FlexNodeStyle::SetAlignItems :%d" , _align_items );
  HPNodeStyleSetAlignItems(mFlexNode->mHPNode, (FlexAlign) _align_items);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, align_self) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAlignSelf" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.alignSelf;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, align_self) {
  FLEX_NODE_LOG("FlexNodeStyle::SetAlignSelf :%d" , _align_self );
  HPNodeStyleSetAlignSelf(mFlexNode->mHPNode, (FlexAlign) _align_self);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, align_content) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAlignContent" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.alignContent;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, align_content) {
  FLEX_NODE_LOG("FlexNodeStyle::SetAlignContent:%d" , _align_content );
  HPNodeStyleSetAlignContent(mFlexNode->mHPNode, (FlexAlign) _align_content);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, position_type) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetPositionType" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.positionType;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, position_type) {
  FLEX_NODE_LOG("FlexNodeStyle::SetPositionType:%d" , _position_type );
  HPNodeStyleSetPositionType(mFlexNode->mHPNode, (PositionType) _position_type);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, flex_wrap) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexWrap" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.flexWrap;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, flex_wrap) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexWrap:%d" , _flex_wrap );
  HPNodeStyleSetFlexWrap(mFlexNode->mHPNode, (FlexWrapMode) _flex_wrap);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, overflow) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetOverflow" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.overflowType;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, overflow) {
  FLEX_NODE_LOG("FlexNodeStyle::SetOverflow:%d" , _overflow );
  HPNodeStyleSetOverflow(mFlexNode->mHPNode, (OverflowType) _overflow);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, display) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetDisplay" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.displayType;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, display) {
  FLEX_NODE_LOG("FlexNodeStyle::SetDisplay:%d" , _display );
  HPNodeStyleSetDisplay(mFlexNode->mHPNode, (DisplayType) _display);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, flex) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlex" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.flex;
  }
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetFlex:%.2f" , _flex );
  HPNodeStyleSetFlex(mFlexNode->mHPNode, _flex);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, flex_grow) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexGrow" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.flexGrow;
  }
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_grow) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexGrow:%.2f" , _flex_grow );
  HPNodeStyleSetFlexGrow(mFlexNode->mHPNode, _flex_grow);

}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, flex_shrink) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetFlexShrink" );
  if (mFlexNode && mFlexNode->mHPNode) {
    return mFlexNode->mHPNode->style.flexShrink;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_shrink) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexShrink:%.2f" , _flex_shrink );
  HPNodeStyleSetFlexShrink(mFlexNode->mHPNode, _flex_shrink);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, flex_basis){
  FLEX_NODE_LOG("FlexNodeStyle::GetFlexBasis" );
  return newFlexValue();
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_basis) {
  FLEX_NODE_LOG("FlexNodeStyle::SetFlexBasis:%.2f" , _flex_basis );
  HPNodeStyleSetFlexBasis(mFlexNode->mHPNode, _flex_basis);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_basis_percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetFlexBasisPercent:%.2f" , _flex_basis_percent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI( float, flex_basis_auto) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetFlexBasisAuto" );
}

FlexValue* FlexNodeStyleFfi::FlexNodeStyleGetMargin(int32_t edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetMargin" );
  return newFlexValue();
}
void FlexNodeStyleFfi::FlexNodeStyleSetMargin(int32_t edge, float margin) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMargin:%.2f" , margin );
  HPNodeStyleSetMargin(mFlexNode->mHPNode, (CSSDirection) edge, margin);
}

void FlexNodeStyleFfi::FlexNodeStyleSetMarginPercent(int32_t edge,float percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMarginPercent:%d, %.2f" , edge, percent );
}

void FlexNodeStyleFfi::FlexNodeStyleSetMarginAuto(int32_t edge) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMarginAuto:%d", edge );
  HPNodeStyleSetMarginAuto(mFlexNode->mHPNode, (CSSDirection) edge);
}

FlexValue* FlexNodeStyleFfi::FlexNodeStyleGetPadding(int32_t edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetPadding" );
  return newFlexValue();
}
void FlexNodeStyleFfi::FlexNodeStyleSetPadding(int32_t edge,float padding) {
  FLEX_NODE_LOG("FlexNodeStyle::SetPadding :%.2f" , padding );
  HPNodeStyleSetPadding(mFlexNode->mHPNode, (CSSDirection) edge, padding);
}
void FlexNodeStyleFfi::FlexNodeStyleSetPaddingPercent(int32_t edge, float percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetPaddingPercent : %d, %.2f" ,edge, percent );
}

FlexValue* FlexNodeStyleFfi::FlexNodeStyleGetBorder(int32_t edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetBorder " );
  return newFlexValue();
}

void FlexNodeStyleFfi::FlexNodeStyleSetBorder(int32_t edge,
    float border) {
  FLEX_NODE_LOG("FlexNodeStyle::SetBorder : %d, %.2f" ,edge, border );
  HPNodeStyleSetBorder(mFlexNode->mHPNode, (CSSDirection) edge, border);
}

FlexValue* FlexNodeStyleFfi::FlexNodeStyleGetPosition(int32_t edge) {
  FLEX_NODE_LOG("FlexNodeStyle::GetPosition" );
  return newFlexValue();
}

void FlexNodeStyleFfi::FlexNodeStyleSetPosition(int32_t edge,float position) {
  FLEX_NODE_LOG("FlexNodeStyle::SetPosition : %d, %.2f" ,edge, position );
  HPNodeStyleSetPosition(mFlexNode->mHPNode, (CSSDirection) edge, position);
}

void FlexNodeStyleFfi::FlexNodeStyleSetPositionPercent(int32_t edge,float percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetPositionPercent : %d, %.2f" ,edge, percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, width){
  FLEX_NODE_LOG("FlexNodeStyle::GetWidth" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, width) {
  FLEX_NODE_LOG("FlexNodeStyle::SetWidth : %.2f" , _width );
  HPNodeStyleSetWidth(mFlexNode->mHPNode, _width);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, width_percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetWidthPercent : %.2f" , _width_percent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI( float, width_auto) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetWidthAuto" );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, height){
  FLEX_NODE_LOG("FlexNodeStyle::GetHeight" );
  return newFlexValue();
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, height) {
  FLEX_NODE_LOG("FlexNodeStyle::SetHeight: %.2f" , _height );
  HPNodeStyleSetHeight(mFlexNode->mHPNode, _height);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, height_percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetHeightPercent: %.2f" , _height_percent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI( float, height_auto) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetHeightAuto" );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, min_width){
  FLEX_NODE_LOG("FlexNodeStyle::GetMinWidth" );
  return newFlexValue();
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, min_width) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMinWidth: %d" , _min_width );
  HPNodeStyleSetMinWidth(mFlexNode->mHPNode, _min_width);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, min_width_percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMinWidthPercent: %d" , _min_width_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, min_height){
  FLEX_NODE_LOG("FlexNodeStyle::GetMinHeight" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, min_height) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMinHeight: %.2f" , _min_height );
  HPNodeStyleSetMinHeight(mFlexNode->mHPNode, _min_height);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, min_height_percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMinHeightPercent: %.2f" , _min_height_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, max_width){
  FLEX_NODE_LOG("FlexNodeStyle::GetMaxWidth" );
  return newFlexValue();
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_width) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMaxWidth: %.2f" , _max_width );
  HPNodeStyleSetMaxWidth(mFlexNode->mHPNode, _max_width);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_width_percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMaxWidthPercent: %.2f" , _max_width_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI(FlexValue*, max_height) {
  FLEX_NODE_LOG("FlexNodeStyle::GetMaxHeight");
  return newFlexValue();
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_height) {
  FLEX_NODE_LOG("FlexNodeStyle::SetMaxHeight: %.2f" , _max_height );
  HPNodeStyleSetMaxHeight(mFlexNode->mHPNode, _max_height);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_height_percent) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetMaxHeightPercent: %.2f" , _max_height_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, aspect_ratio) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::GetAspectRatio" );
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, aspect_ratio) {
  FLEX_NODE_LOG("#not#FlexNodeStyle::SetAspectRatio: %.2f" , _aspect_ratio );
}

