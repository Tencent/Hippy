//
// Created by longquan on 2020/9/3.
//

#include "FlexNodeFfiBridge.h"

#ifdef USE_TAITANK
#include "TaitankNodeFfi.h"
#else
#include "FlexNodeFfi.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

DartFlexNodeMeasureFunc dartFlexNodeMeasureFunc = nullptr;
NodeFloatFiledGetter nodeFloatFiledGetter = nullptr;
NodeFloatFiledSetter nodeFloatFiledSetter = nullptr;
NodeIntFiledGetter nodeIntFiledGetter = nullptr;
NodeIntFiledSetter nodeIntFiledSetter = nullptr;


FLEX_EXPORT FLEX_USED int32_t registerExportFunction(int32_t type, void *func) {
  if (type == ExportFunctionType::FloatFiledGetter) {
    nodeFloatFiledGetter = reinterpret_cast<NodeFloatFiledGetter>(func);
    return true;
  } else if (type == ExportFunctionType::FloatFiledSetter) {
    nodeFloatFiledSetter = reinterpret_cast<NodeFloatFiledSetter>(func);
    return true;
  } else if (type == ExportFunctionType::IntFiledGetter) {
    nodeIntFiledGetter = reinterpret_cast<NodeIntFiledGetter>(func);
    return true;
  } else if (type == ExportFunctionType::IntFiledSetter) {
    nodeIntFiledSetter = reinterpret_cast<NodeIntFiledSetter>(func);
    return true;
  } else if (type == ExportFunctionType::MeasureFunc) {
    dartFlexNodeMeasureFunc = reinterpret_cast<DartFlexNodeMeasureFunc>(func);
    return true;
  }
  return false;
}

FLEX_USED float getNodeFloatFiled(int64_t nodeId, FiledType filedType) {
  if (nodeFloatFiledGetter) {
    return nodeFloatFiledGetter(nodeId, filedType);
  }
  return 0;
}

FLEX_USED void setNodeFloatFiled(int64_t nodeId, FiledType filedType, float value) {
  if (nodeFloatFiledSetter) {
    nodeFloatFiledSetter(nodeId, filedType, value);
  }
}

FLEX_USED bool getNodeBooleanFiled(int64_t nodeId, FiledType filedType) {
  if (nodeIntFiledGetter) {
    return nodeIntFiledGetter(nodeId, filedType) == 1;
  }
  return false;
}

FLEX_USED void setNodeBooleanFiled(int64_t nodeId, FiledType filedType, bool value) {
  if (nodeIntFiledSetter) {
    nodeIntFiledSetter(nodeId, filedType, value);
  }
}

FLEX_USED int getNodeIntFiled(int64_t nodeId, FiledType filedType) {
  if (nodeIntFiledGetter) {
    return nodeIntFiledGetter(nodeId, filedType);
  }
  return 0;
}

FLEX_USED void setNodeIntFiled(int64_t nodeId, FiledType filedType, int value) {
  if (nodeIntFiledSetter) {
    nodeIntFiledSetter(nodeId, filedType, value);
  }
}

FLEX_USED int64_t flexNodeMeasureFunc(int64_t nodeId,
                                      float width,
                                      int32_t widthMode,
                                      float height,
                                      int32_t heightMode) {
  if (dartFlexNodeMeasureFunc) {
    return dartFlexNodeMeasureFunc(nodeId, width, widthMode, height, heightMode);
  }
  return 0;
}

static int64_t FlexNodeFFINew() {
#ifdef USE_TAITANK
  auto *flex_node = new TaitankNodeFfi();
  return reinterpret_cast<int64_t>(flex_node);
#else
  auto *flex_node = new FlexNodeFfi();
    return reinterpret_cast<int64_t>(flex_node);
#endif
}

FLEX_EXPORT FLEX_USED int64_t newNativeFlexNode() {
  return FlexNodeFFINew();
}

FLEX_EXPORT FLEX_USED void freeNativeFlexNode(int64_t nativeFlexNode) {
  auto* native = reinterpret_cast<FlexNode*>(nativeFlexNode);
  return native->FlexNodeFree();
}

FLEX_EXPORT FLEX_USED void insertNativeFlexNodeChild(int64_t nativeFlexNode,
                                                     int64_t childPointer,
                                                     int32_t index) {
  auto* native = reinterpret_cast<FlexNode*>(nativeFlexNode);
  return native->FlexNodeInsertChild(childPointer, index);
}

FLEX_EXPORT FLEX_USED void removeNativeFlexNodeChild(int64_t nativeFlexNode,
                                                     int64_t childPointer) {
  auto* native = reinterpret_cast<FlexNode*>(nativeFlexNode);
  return native->FlexNodeRemoveChild(childPointer);
}

FLEX_EXPORT FLEX_USED void calculateNativeFlexNodeLayout(int64_t nativeFlexNode,
                                                         float width,
                                                         float height,
                                                         int64_t* childNativeNodes,
                                                         int32_t childNativeNodesLen,
                                                         int32_t direction) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->FlexNodeCalculateLayout(
      width,
      height,
      childNativeNodes,
      childNativeNodesLen,
      direction);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeWidth(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_width();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeWidth(int64_t nativeFlexNode,
                                                  float width) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_width(width);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeHeight(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_height();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeHeight(int64_t nativeFlexNode,
                                                   float height) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_height(height);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeTop(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_top();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeTop(int64_t nativeFlexNode,
                                                float top) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_top(top);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeLeft(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_left();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeLeft(int64_t nativeFlexNode,
                                                 float left) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_left(left);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeRight(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_right();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeRight(int64_t nativeFlexNode,
                                                  float right) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_right(right);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBottom(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_bottom();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBottom(int64_t nativeFlexNode,
                                                   float bottom) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_bottom(bottom);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginTop(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_margin_top();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginTop(int64_t nativeFlexNode,
                                                      float marginTop) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_margin_top(marginTop);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginLeft(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_margin_left();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginLeft(int64_t nativeFlexNode,
                                                       float marginLeft) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_margin_left(marginLeft);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginRight(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_margin_right();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginRight(int64_t nativeFlexNode,
                                                        float marginRight) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_margin_right(marginRight);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginBottom(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_margin_bottom();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginBottom(int64_t nativeFlexNode,
                                                         float marginBottom) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_margin_bottom(marginBottom);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingTop(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_padding_top();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingTop(int64_t nativeFlexNode,
                                                       float paddingTop) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_padding_top(paddingTop);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingLeft(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_padding_left();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingLeft(int64_t nativeFlexNode,
                                                        float paddingLeft) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_padding_left(paddingLeft);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingRight(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_padding_right();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingRight(int64_t nativeFlexNode,
                                                         float paddingRight) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_padding_right(paddingRight);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingBottom(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_padding_bottom();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingBottom(int64_t nativeFlexNode,
                                                          float paddingBottom) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_padding_bottom(paddingBottom);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderTop(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_border_top();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderTop(int64_t nativeFlexNode,
                                                      float borderTop) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_border_top(borderTop);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderLeft(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_border_left();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderLeft(int64_t nativeFlexNode,
                                                       float borderLeft) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_border_left(borderLeft);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderRight(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_border_right();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderRight(int64_t nativeFlexNode,
                                                        float borderRight) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_border_right(borderRight);
}

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderBottom(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->get_flex_node_border_bottom();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderBottom(int64_t nativeFlexNode,
                                                         float borderBottom) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->set_flex_node_border_bottom(borderBottom);
}

FLEX_EXPORT FLEX_USED void markNativeFlexNodeNodeDirty(
    int64_t nativePointer) {
  auto *native = reinterpret_cast<FlexNode *>(nativePointer);
  return native->FlexNodeNodeMarkDirty();
}

FLEX_EXPORT FLEX_USED int32_t isNativeFlexNodeDirty(int64_t nativePointer) {
  auto *native = reinterpret_cast<FlexNode *>(nativePointer);
  return native->FlexNodeNodeIsDirty();
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeHasMeasureFunc(int64_t nativePointer,
                                         int32_t hasMeasureFunc) {
  auto *native = reinterpret_cast<FlexNode *>(nativePointer);
  native->FlexNodeNodeSetHasMeasureFunc(hasMeasureFunc);
}

FLEX_EXPORT FLEX_USED void setNativeFlexNodeHasBaselineFunc(int64_t nativePointer,
                                          int32_t hasMeasureFunc) {
  auto *native = reinterpret_cast<FlexNode *>(nativePointer);
  native->FlexNodeNodeSetHasBaselineFunc(hasMeasureFunc);
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeMarkHasNewLayout(int64_t nativeFlexNode) {
  auto* native = reinterpret_cast<FlexNode*>(nativeFlexNode);
  native->FlexNodeMarkHasNewLayout();
}

FLEX_EXPORT FLEX_USED int32_t hasNativeFlexNodeNewLayout(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->FlexNodeHasNewLayout();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeMarkLayoutSeen(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->FlexNodeMarkLayoutSeen();
}

FLEX_EXPORT FLEX_USED  void resetNativeFlexNode(int64_t nativeFlexNode) {
  auto *native = reinterpret_cast<FlexNode *>(nativeFlexNode);
  return native->FlexNodeReset();
}

#ifdef __cplusplus
}
#endif
