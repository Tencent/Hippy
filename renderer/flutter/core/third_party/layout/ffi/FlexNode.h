//
// Created by longquan on 2021/5/7.
//

#ifndef ANDROID_NATIVE_LAYOUT_FFI_FLEXNODE_H_
#define ANDROID_NATIVE_LAYOUT_FFI_FLEXNODE_H_

#include <stdint.h>

#define FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(type, name)	\
	virtual type  get_flex_node_##name ()

#define FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(type, name)	\
	virtual void  set_flex_node_##name (type name)

#define FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(type, name)	\
	type  get_flex_node_##name ()

#define FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(type, name)	\
	void  set_flex_node_##name (type name)



class FlexNode {
 public:
  virtual ~FlexNode() = default;
  virtual void FlexNodeReset() = 0;

  // Methods called from Java via JNI -----------------------------------------
  virtual void FlexNodeFree() = 0;
  virtual void FlexNodeFreeRecursive() = 0;

  virtual void FlexNodeInsertChild(int64_t childPointer, int32_t index) = 0;
  virtual void FlexNodeRemoveChild(int64_t childPointer) = 0;
  virtual void FlexNodeCalculateLayout(float width, float height,
                               int64_t *childNativeNodes,
                               const int32_t childNativeNodeLen,
                               int32_t direction) = 0;

  virtual void FlexNodeNodeMarkDirty() = 0;
  virtual bool FlexNodeNodeIsDirty() = 0;
  virtual void FlexNodeNodeSetHasMeasureFunc(bool hasMeasureFunc) = 0;
  virtual void FlexNodeNodeSetHasBaselineFunc(bool hasMeasureFunc) = 0;
  virtual void FlexNodeMarkHasNewLayout() = 0;
  virtual bool FlexNodeHasNewLayout() = 0;
  virtual void FlexNodeMarkLayoutSeen() = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , width) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , width) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , height) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , height) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , left) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , left) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , top) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , top) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , right) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , right) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , bottom) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , bottom) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , margin_left) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , margin_left) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , margin_top) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , margin_top) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , margin_right) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , margin_right) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , margin_bottom) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , margin_bottom) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , padding_left) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , padding_left) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , padding_top) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , padding_top) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , padding_right) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , padding_right) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , padding_bottom) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , padding_bottom) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , border_left) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , border_left) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , border_top) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , border_top) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , border_right) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , border_right) = 0;

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI(float , border_bottom) = 0;
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI(float , border_bottom) = 0;

};

#endif //ANDROID_NATIVE_LAYOUT_FFI_FLEXNODE_H_
