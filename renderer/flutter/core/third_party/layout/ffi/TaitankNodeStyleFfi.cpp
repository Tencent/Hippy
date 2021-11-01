//
// Created by longquan on 2021/5/7.
//

#include "TaitankNodeStyleFfi.h"

static inline FlexValue* newFlexValue() {
  auto* value = new FlexValue();
  value->value = 0;
  value->unit = 0;
  return value;
}

TaitankNodeStyleFfi::TaitankNodeStyleFfi() = default;

TaitankNodeStyleFfi::~TaitankNodeStyleFfi() = default;

void TaitankNodeStyleFfi::set_flex_node_ffi(int64_t flexNode) {
  flex_node_ = (TaitankNodeFfi*) flexNode;
}

void TaitankNodeStyleFfi::FlexNodeStyleFreeFFI() {
  delete this;
}

#define FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI(type, name)	\
	type  TaitankNodeStyleFfi::get_flex_node_style_##name ()

#define FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI(type, name)	\
	void  TaitankNodeStyleFfi::set_flex_node_style_##name (type _##name)

#define FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI(type, name)	\
	void  TaitankNodeStyleFfi::set_flex_node_style_##name ()

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, direction) {
  TaitankLogd("#not#FlexNodeStyle::GetDirection" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.direction_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, direction) {
  TaitankLogd("FlexNodeStyle::SetDirection :%d" , _direction );
  set_taitank_node_style_direction(flex_node_->taitank_node_, (TaitankDirection)_direction);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, flex_direction) {
  TaitankLogd("#not#FlexNodeStyle::GetFlexDirection" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.flex_direction_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, flex_direction) {
  TaitankLogd("FlexNodeStyle::SetFlexDirection :%d" , _flex_direction );
  set_taitank_node_style_flex_direction(flex_node_->taitank_node_,
                              (FlexDirection) _flex_direction);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, justify_content) {
  TaitankLogd("#not#FlexNodeStyle::GetJustifyContent" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.justify_content_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, justify_content) {
  TaitankLogd("FlexNodeStyle::SetJustifyContent :%d" , _justify_content );
  set_taitank_node_style_justify_content(flex_node_->taitank_node_, (FlexAlign) _justify_content);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, align_items) {
  TaitankLogd("#not#FlexNodeStyle::GetAlignItems" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.align_items_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, align_items) {
  TaitankLogd("FlexNodeStyle::SetAlignItems :%d" , _align_items );
  set_taitank_node_style_align_items(flex_node_->taitank_node_, (FlexAlign) _align_items);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, align_self) {
  TaitankLogd("#not#FlexNodeStyle::GetAlignSelf" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.align_self_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, align_self) {
  TaitankLogd("FlexNodeStyle::SetAlignSelf :%d" , _align_self );
  set_taitank_node_style_align_self(flex_node_->taitank_node_, (FlexAlign) _align_self);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, align_content) {
  TaitankLogd("#not#FlexNodeStyle::GetAlignContent" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.align_content_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, align_content) {
  TaitankLogd("FlexNodeStyle::SetAlignContent:%d" , _align_content );
  set_taitank_node_style_align_content(flex_node_->taitank_node_, (FlexAlign) _align_content);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, position_type) {
  TaitankLogd("#not#FlexNodeStyle::GetPositionType" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.position_type_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, position_type) {
  TaitankLogd("FlexNodeStyle::SetPositionType:%d" , _position_type );
  set_taitank_node_style_position_type(flex_node_->taitank_node_, (PositionType) _position_type);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, flex_wrap) {
  TaitankLogd("#not#FlexNodeStyle::GetFlexWrap" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.flex_wrap_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, flex_wrap) {
  TaitankLogd("FlexNodeStyle::SetFlexWrap:%d" , _flex_wrap );
  set_taitank_node_style_flex_wrap(flex_node_->taitank_node_, (FlexWrapMode) _flex_wrap);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, overflow) {
  TaitankLogd("#not#FlexNodeStyle::GetOverflow" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.overflow_type_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, overflow) {
  TaitankLogd("FlexNodeStyle::SetOverflow:%d" , _overflow );
  set_taitank_node_style_overflow(flex_node_->taitank_node_, (OverflowType) _overflow);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( int32_t, display) {
  TaitankLogd("#not#FlexNodeStyle::GetDisplay" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.display_type_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, display) {
  TaitankLogd("FlexNodeStyle::SetDisplay:%d" , _display );
  set_taitank_node_style_display(flex_node_->taitank_node_, (DisplayType) _display);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, flex) {
  TaitankLogd("#not#FlexNodeStyle::GetFlex" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.flex_;
  }
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex) {
  TaitankLogd("#not#FlexNodeStyle::SetFlex:%.2f" , _flex );
  set_taitank_node_style_flex(flex_node_->taitank_node_, _flex);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, flex_grow) {
  TaitankLogd("#not#FlexNodeStyle::GetFlexGrow" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.flex_grow_;
  }
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_grow) {
  TaitankLogd("FlexNodeStyle::SetFlexGrow:%.2f" , _flex_grow );
  set_taitank_node_style_flex_grow(flex_node_->taitank_node_, _flex_grow);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, flex_shrink) {
  TaitankLogd("#not#FlexNodeStyle::GetFlexShrink" );
  if (flex_node_ && flex_node_->taitank_node_) {
    return flex_node_->taitank_node_->style_.flex_shrink_;
  }
  return 0;
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_shrink) {
  TaitankLogd("FlexNodeStyle::SetFlexShrink:%.2f" , _flex_shrink );
  set_taitank_node_style_flex_shrink(flex_node_->taitank_node_, _flex_shrink);
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, flex_basis){
  TaitankLogd("FlexNodeStyle::GetFlexBasis" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_basis) {
  TaitankLogd("FlexNodeStyle::SetFlexBasis:%.2f" , _flex_basis );
  set_taitank_node_style_flex_basis(flex_node_->taitank_node_, _flex_basis);
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, flex_basis_percent) {
  TaitankLogd("#not#FlexNodeStyle::SetFlexBasisPercent:%.2f" , _flex_basis_percent );
}

FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI( float, flex_basis_auto) {
  TaitankLogd("#not#FlexNodeStyle::SetFlexBasisAuto" );
}

FlexValue* TaitankNodeStyleFfi::FlexNodeStyleGetMargin(int32_t edge) {
  TaitankLogd("FlexNodeStyle::GetMargin" );
  return newFlexValue();
}

void TaitankNodeStyleFfi::FlexNodeStyleSetMargin(int32_t edge, float margin) {
  TaitankLogd("FlexNodeStyle::SetMargin:%.2f" , margin );
  set_taitank_node_style_margin(flex_node_->taitank_node_, (CSSDirection) edge, margin);
}

void TaitankNodeStyleFfi::FlexNodeStyleSetMarginPercent(int32_t edge,float percent) {
  TaitankLogd("#not#FlexNodeStyle::SetMarginPercent:%d, %.2f" , edge, percent );
}

void TaitankNodeStyleFfi::FlexNodeStyleSetMarginAuto(int32_t edge) {
  TaitankLogd("FlexNodeStyle::SetMarginAuto:%d", edge );
  set_taitank_node_style_margin_auto(flex_node_->taitank_node_, (CSSDirection) edge);
}

FlexValue* TaitankNodeStyleFfi::FlexNodeStyleGetPadding(int32_t edge) {
  TaitankLogd("FlexNodeStyle::GetPadding" );
  return newFlexValue();
}
void TaitankNodeStyleFfi::FlexNodeStyleSetPadding(int32_t edge,float padding) {
  TaitankLogd("FlexNodeStyle::SetPadding :%.2f" , padding );
  set_taitank_node_style_padding(flex_node_->taitank_node_, (CSSDirection) edge, padding);
}

void TaitankNodeStyleFfi::FlexNodeStyleSetPaddingPercent(int32_t edge, float percent) {
  TaitankLogd("#not#FlexNodeStyle::SetPaddingPercent : %d, %.2f" ,edge, percent );
}

FlexValue* TaitankNodeStyleFfi::FlexNodeStyleGetBorder(int32_t edge) {
  TaitankLogd("FlexNodeStyle::GetBorder " );
  return newFlexValue();
}

void TaitankNodeStyleFfi::FlexNodeStyleSetBorder(int32_t edge,
                                              float border) {
  TaitankLogd("FlexNodeStyle::SetBorder : %d, %.2f" ,edge, border );
  set_taitank_node_style_border(flex_node_->taitank_node_, (CSSDirection) edge, border);
}

FlexValue* TaitankNodeStyleFfi::FlexNodeStyleGetPosition(int32_t edge) {
  TaitankLogd("FlexNodeStyle::GetPosition" );
  return newFlexValue();
}

void TaitankNodeStyleFfi::FlexNodeStyleSetPosition(int32_t edge,float position) {
  TaitankLogd("FlexNodeStyle::SetPosition : %d, %.2f" ,edge, position );
  set_taitank_node_style_position(flex_node_->taitank_node_, (CSSDirection) edge, position);
}

void TaitankNodeStyleFfi::FlexNodeStyleSetPositionPercent(int32_t edge,float percent) {
  TaitankLogd("#not#FlexNodeStyle::SetPositionPercent : %d, %.2f" ,edge, percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, width){
  TaitankLogd("FlexNodeStyle::GetWidth" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, width) {
  TaitankLogd("FlexNodeStyle::SetWidth : %.2f" , _width );
  set_taitank_node_style_width(flex_node_->taitank_node_, _width);
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, width_percent) {
  TaitankLogd("#not#FlexNodeStyle::SetWidthPercent : %.2f" , _width_percent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI( float, width_auto) {
  TaitankLogd("#not#FlexNodeStyle::SetWidthAuto" );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, height){
  TaitankLogd("FlexNodeStyle::GetHeight" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, height) {
  TaitankLogd("FlexNodeStyle::SetHeight: %.2f" , _height );
  set_taitank_node_style_height(flex_node_->taitank_node_, _height);
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, height_percent) {
  TaitankLogd("#not#FlexNodeStyle::SetHeightPercent: %.2f" , _height_percent );
}
FLEX_NODE_STYLE_MEM_FUN_SET0_CPP_FFI( float, height_auto) {
  TaitankLogd("#not#FlexNodeStyle::SetHeightAuto" );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, min_width){
  TaitankLogd("FlexNodeStyle::GetMinWidth" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, min_width) {
  TaitankLogd("FlexNodeStyle::SetMinWidth: %d" , _min_width );
  set_taitank_node_style_min_width(flex_node_->taitank_node_, _min_width);
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( int32_t, min_width_percent) {
  TaitankLogd("#not#FlexNodeStyle::SetMinWidthPercent: %d" , _min_width_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, min_height){
  TaitankLogd("FlexNodeStyle::GetMinHeight" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, min_height) {
  TaitankLogd("FlexNodeStyle::SetMinHeight: %.2f" , _min_height );
  set_taitank_node_style_min_height(flex_node_->taitank_node_, _min_height);
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, min_height_percent) {
  TaitankLogd("#not#FlexNodeStyle::SetMinHeightPercent: %.2f" , _min_height_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( FlexValue*, max_width){
  TaitankLogd("FlexNodeStyle::GetMaxWidth" );
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_width) {
  TaitankLogd("FlexNodeStyle::SetMaxWidth: %.2f" , _max_width );
  set_taitank_node_style_max_width(flex_node_->taitank_node_, _max_width);
}
FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_width_percent) {
  TaitankLogd("#not#FlexNodeStyle::SetMaxWidthPercent: %.2f" , _max_width_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI(FlexValue*, max_height) {
  TaitankLogd("FlexNodeStyle::GetMaxHeight");
  return newFlexValue();
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_height) {
  TaitankLogd("FlexNodeStyle::SetMaxHeight: %.2f" , _max_height );
  set_taitank_node_style_max_height(flex_node_->taitank_node_, _max_height);
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, max_height_percent) {
  TaitankLogd("#not#FlexNodeStyle::SetMaxHeightPercent: %.2f" , _max_height_percent );
}

FLEX_NODE_STYLE_MEM_FUN_GET_CPP_FFI( float, aspect_ratio) {
  TaitankLogd("#not#FlexNodeStyle::GetAspectRatio" );
  return 0;
}

FLEX_NODE_STYLE_MEM_FUN_SET_CPP_FFI( float, aspect_ratio) {
  TaitankLogd("#not#FlexNodeStyle::SetAspectRatio: %.2f" , _aspect_ratio );
}
