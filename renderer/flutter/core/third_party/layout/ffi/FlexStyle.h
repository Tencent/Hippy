//
// Created by longquan on 2021/5/7.
//

#ifndef ANDROID_NATIVE_LAYOUT_FFI_FLEXSTYLE_H_
#define ANDROID_NATIVE_LAYOUT_FFI_FLEXSTYLE_H_

#include <stdint.h>

#define FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL(type, name)	\
	virtual type  get_flex_node_style_##name () = 0

#define FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL(type, name)	\
	virtual void  set_flex_node_style_##name (type name) = 0

#define FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI_VIRTUAL(type, name)	\
	virtual void  set_flex_node_style_##name () = 0

#define FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI(type, name)	\
	type  get_flex_node_style_##name ()

#define FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI(type, name)	\
	void  set_flex_node_style_##name (type name)

#define FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI(type, name)	\
	void  set_flex_node_style_##name ()

struct FlexValue
{
  float value;
  int32_t unit;
};

class FlexStyle {
 public:
  // Methods called from Java via JNI -----------------------------------------
  virtual void set_flex_node_ffi(int64_t flexnode) = 0;
  virtual void FlexNodeStyleFreeFFI() = 0;

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , direction);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , direction);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , flex_direction);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , flex_direction);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , justify_content);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , justify_content);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , align_items);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , align_items);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , align_self);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , align_self);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , align_content);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , align_content);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , position_type);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , position_type);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , flex_wrap);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , flex_wrap);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , overflow);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , overflow);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( int32_t , display);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , display);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( float , flex);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , flex);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( float , flex_grow);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , flex_grow);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( float , flex_shrink);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , flex_shrink);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( FlexValue*, flex_basis);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , flex_basis);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , flex_basis_percent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI_VIRTUAL( float , flex_basis_auto);

  virtual FlexValue* FlexNodeStyleGetMargin(int32_t edge) = 0;
  virtual void FlexNodeStyleSetMargin(int32_t edge ,float padding) = 0;
  virtual void FlexNodeStyleSetMarginPercent(int32_t edge ,float percent) = 0;
  virtual void FlexNodeStyleSetMarginAuto(int32_t edge) = 0;

  virtual FlexValue* FlexNodeStyleGetPadding(int32_t edge) = 0;
  virtual void FlexNodeStyleSetPadding(int32_t edge ,float margin) = 0;
  virtual void FlexNodeStyleSetPaddingPercent(int32_t edge ,float percent) = 0;

  virtual FlexValue* FlexNodeStyleGetBorder(int32_t edge) = 0;
  virtual void FlexNodeStyleSetBorder(int32_t edge ,float border) = 0;

  virtual FlexValue* FlexNodeStyleGetPosition(int32_t edge) = 0;
  virtual void FlexNodeStyleSetPosition(int32_t edge ,float position) = 0;
  virtual void FlexNodeStyleSetPositionPercent (int32_t edge ,float percent) = 0;

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( FlexValue*, width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , width_percent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI_VIRTUAL( float , width_auto);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL(FlexValue*, height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , height_percent);
  FLEX_NODE_STYLE_MEM_FUN_SET0_INCLUDE_FFI_VIRTUAL( float , height_auto);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( FlexValue*, min_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , min_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( int32_t , min_width_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( FlexValue*, min_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , min_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , min_height_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( FlexValue*, max_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , max_width);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , max_width_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( FlexValue*, max_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , max_height);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , max_height_percent);

  FLEX_NODE_STYLE_MEM_FUN_GET_INCLUDE_FFI_VIRTUAL( float , aspect_ratio);
  FLEX_NODE_STYLE_MEM_FUN_SET_INCLUDE_FFI_VIRTUAL( float , aspect_ratio);

  virtual ~FlexStyle() = default;
};
#endif //ANDROID_NATIVE_LAYOUT_FFI_FLEXSTYLE_H_
