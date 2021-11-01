//
// Created by longquan on 2020/9/2.
//

#ifndef ANDROID_DEMO_LAYOUT_FFI_FLEXNODESTYLEFFI_H_
#define ANDROID_DEMO_LAYOUT_FFI_FLEXNODESTYLEFFI_H_

#include "FlexStyle.h"
#include "FlexNodeFfi.h"

class FlexNodeStyleFfi : public FlexStyle {
 public:
  FlexNodeStyleFfi();

  // Methods called from Java via JNI -----------------------------------------
  void set_flex_node_ffi(int64_t flexnode);
  void FlexNodeStyleFreeFFI();

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , direction);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , direction);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , flex_direction);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , flex_direction);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , justify_content);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , justify_content);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , align_items);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , align_items);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , align_self);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , align_self);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , align_content);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , align_content);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , position_type);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , position_type);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , flex_wrap);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , flex_wrap);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , overflow);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , overflow);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( int32_t , display);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , display);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( float , flex);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , flex);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( float , flex_grow);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , flex_grow);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( float , flex_shrink);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , flex_shrink);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( FlexValue*, flex_basis);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , flex_basis);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , flex_basis_percent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI( float , flex_basis_auto);

  FlexValue* FlexNodeStyleGetMargin(int32_t edge);
  void FlexNodeStyleSetMargin(int32_t edge ,float padding);
  void FlexNodeStyleSetMarginPercent(int32_t edge ,float percent);
  void FlexNodeStyleSetMarginAuto(int32_t edge);

  FlexValue* FlexNodeStyleGetPadding(int32_t edge);
  void FlexNodeStyleSetPadding(int32_t edge ,float margin);
  void FlexNodeStyleSetPaddingPercent(int32_t edge ,float percent);

  FlexValue* FlexNodeStyleGetBorder(int32_t edge);
  void FlexNodeStyleSetBorder(int32_t edge ,float border);

  FlexValue* FlexNodeStyleGetPosition(int32_t edge);
  void FlexNodeStyleSetPosition(int32_t edge ,float position);
  void FlexNodeStyleSetPositionPercent (int32_t edge ,float percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( FlexValue*, width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , width_percent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI( float , width_auto);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI(FlexValue*, height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , height_percent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI( float , height_auto);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( FlexValue*, min_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , min_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( int32_t , min_width_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( FlexValue*, min_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , min_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , min_height_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( FlexValue*, max_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , max_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , max_width_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( FlexValue*, max_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , max_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , max_height_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI( float , aspect_ratio);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI( float , aspect_ratio);

 private:
  virtual ~FlexNodeStyleFfi();
  FlexNodeFfi *mFlexNode{};
};

#endif //ANDROID_DEMO_LAYOUT_FFI_FLEXNODESTYLEFFI_H_
