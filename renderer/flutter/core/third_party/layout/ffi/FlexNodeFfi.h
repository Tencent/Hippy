//
// Created by longquan on 2020/9/2.
//

#ifndef ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFI_H_
#define ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFI_H_

#include "../engine/Hippy.h"
#include "FlexNode.h"

class FlexNodeFfi : public FlexNode {
 public:
  HPNodeRef mHPNode;
  FlexNodeFfi();
  void FlexNodeReset();

  // Methods called from Java via JNI -----------------------------------------
  void FlexNodeFree();
  void FlexNodeFreeRecursive();

  void FlexNodeInsertChild(int64_t childPointer, int32_t index);
  void FlexNodeRemoveChild(int64_t childPointer);
  void FlexNodeCalculateLayout(float width, float height,
                               int64_t *childNativeNodes,
                               const int32_t childNativeNodeLen,
                               int32_t direction);

  void FlexNodeNodeMarkDirty();
  bool FlexNodeNodeIsDirty();
  void FlexNodeNodeSetHasMeasureFunc(bool hasMeasureFunc);
  void FlexNodeNodeSetHasBaselineFunc(bool hasMeasureFunc);
  void FlexNodeMarkHasNewLayout();
  bool FlexNodeHasNewLayout();
  void FlexNodeMarkLayoutSeen();

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , width);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , width);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , height);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , height);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , left);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , left);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , top);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , top);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , right);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , right);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , bottom);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , bottom);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , margin_left);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , margin_left);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , margin_top);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , margin_top);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , margin_right);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , margin_right);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , margin_bottom);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , margin_bottom);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , padding_left);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , padding_left);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , padding_top);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , padding_top);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , padding_right);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , padding_right);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , padding_bottom);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , padding_bottom);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , border_left);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , border_left);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , border_top);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , border_top);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , border_right);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , border_right);

  FLEX_NODE_MEM_FUN_GET_INCLUDE_FFI_OVERRIDE(float , border_bottom);
  FLEX_NODE_MEM_FUN_SET_INCLUDE_FFI_OVERRIDE(float , border_bottom);

 private:
  virtual ~FlexNodeFfi();
};


HPSize HPFFIMeasureFunc(HPNodeRef node, float width,
                               MeasureMode widthMode, float height,
                               MeasureMode heightMode, void *layoutContext);


#endif //ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFI_H_
