//
// Created by longquan on 2020/9/2.
//

#include <map>
#include "FlexNodeFfi.h"
#include "FlexNodeFfiBridge.h"

#define FLEX_NODE_MEM_FUN_GET_CPP_FFI(type, name)    \
    type  FlexNodeFfi::get_flex_node_##name ()

#define FLEX_NODE_MEM_FUN_SET_CPP_FFI(type, name)    \
    void  FlexNodeFfi::set_flex_node_##name (type name)

#ifdef LAYOUT_TIME_ANALYZE
static int layout_analyze_measureCount = 0;
static double layout_analyze_measureTime = 0.0f;
static int newLayoutCount = 0;
#endif

static inline HPNodeRef _64int2HPNodeRef(int64_t address) {
  auto *native = reinterpret_cast<FlexNodeFfi *>(address);
  return native->mHPNode;
}

class LayoutContextFfi {
 public:
  LayoutContextFfi(int64_t *nativeNodes,
                   const int32_t nativeNodeLen) {
    //1.setup the map index of HPNodes and java nodes.
    int64_t *flexNodes = nativeNodes;
    int32_t size = nativeNodeLen;

    //__android_log_print(ANDROID_LOG_ERROR,  "LayoutContext", "node count %d", size);

    for (int i = 0; i < size; i++) {
      HPNodeRef hpNode = _64int2HPNodeRef(flexNodes[i]);
      ASSERT(hpNode != nullptr);
      node_ptr_index_map[hpNode] = i;
    }

    keepFlexNodes = flexNodes;
  }

  int64_t get(HPNodeRef node) {
    auto idx = node_ptr_index_map.find(node);
    if (idx == node_ptr_index_map.end()) {
      return 0;
    } else {
      return keepFlexNodes[idx->second];
    }
  }

  ~LayoutContextFfi() {
    delete keepFlexNodes;
  }

 private:
  std::map<HPNodeRef, size_t> node_ptr_index_map;
  int64_t *keepFlexNodes;
};

HPSize HPFFIMeasureFunc(HPNodeRef node, float width,
                               MeasureMode widthMode, float height,
                               MeasureMode heightMode, void *layoutContext) {
  ASSERT(layoutContext != nullptr);
  int64_t dartNodeId = ((LayoutContextFfi *) layoutContext)->get(node);

  if (dartNodeId) {
#ifdef LAYOUT_TIME_ANALYZE
    clock_t start = clock();
#endif

    int64_t measureResult = flexNodeMeasureFunc(dartNodeId,
                                                width, widthMode,
                                                height, heightMode);
    FLEX_NODE_LOG("FlexNode::HPFFIMeasureFunc:%lld", measureResult);

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
      return HPSize{(float) wBits, (float) hBits};

  }
  return HPSize{widthMode == 0 ? 0 : width, heightMode == 0 ? 0 : height,};

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

static void TransferLayoutOutputsRecursive(HPNodeRef node, void *layoutContext) {
  ASSERT(layoutContext != nullptr);
  int64_t dartNodeId = ((LayoutContextFfi *) layoutContext)->get(node);
  if (!dartNodeId) {
    return;
  }

  if (!HPNodeHasNewLayout(node)) {
#ifdef LAYOUT_TIME_ANALYZE
    float dartWidth = getNodeFloatFiled(dartNodeId, FiledType::WidthFiled);
    if(!isDefined(dartWidth)) {
      HPLog(LogLevelError, "cache width NAN  node's nodetype %d", node->style.nodeType);
    }
#endif
    return;
  }

#ifdef LAYOUT_TIME_ANALYZE
  newLayoutCount++;
#endif
  const int MARGIN = 1;
  const int PADDING = 2;
  const int BORDER = 4;

  const int hasEdgeSetFlag = getNodeIntFiled(dartNodeId, FiledType::EdgeSetFlagField);

  setNodeFloatFiled(dartNodeId, FiledType::WidthFiled, HPNodeLayoutGetWidth(node));
  setNodeFloatFiled(dartNodeId, FiledType::HeightField, HPNodeLayoutGetHeight(node));
  setNodeFloatFiled(dartNodeId, FiledType::LeftField, HPNodeLayoutGetLeft(node));
  setNodeFloatFiled(dartNodeId, FiledType::TopField, HPNodeLayoutGetTop(node));

  if ((hasEdgeSetFlag & MARGIN) == MARGIN) {
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginLeftField,
                      HPNodeLayoutGetMargin(node, CSSDirection::CSSLeft));
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginTopField,
                      HPNodeLayoutGetMargin(node, CSSDirection::CSSTop));
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginRightField,
                      HPNodeLayoutGetMargin(node, CSSDirection::CSSRight));
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginBottomField,
                      HPNodeLayoutGetMargin(node, CSSDirection::CSSBottom));
  }

  if ((hasEdgeSetFlag & PADDING) == PADDING) {
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingLeftField,
                      HPNodeLayoutGetPadding(node, CSSDirection::CSSLeft));
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingTopField,
                      HPNodeLayoutGetPadding(node, CSSDirection::CSSTop));
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingRightField,
                      HPNodeLayoutGetPadding(node, CSSDirection::CSSRight));
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingBottomField,
                      HPNodeLayoutGetPadding(node, CSSDirection::CSSBottom));
  }

  if ((hasEdgeSetFlag & BORDER) == BORDER) {
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderLeftField,
                      HPNodeLayoutGetBorder(node, CSSDirection::CSSLeft));
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderTopField,
                      HPNodeLayoutGetBorder(node, CSSDirection::CSSTop));
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderRightField,
                      HPNodeLayoutGetBorder(node, CSSDirection::CSSRight));
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderBottomField,
                      HPNodeLayoutGetBorder(node, CSSDirection::CSSBottom));
  }

  setNodeBooleanFiled(dartNodeId, FiledType::HasNewLayoutField, true);
  HPNodesetHasNewLayout(node, false);
#ifdef LAYOUT_TIME_ANALYZE
  node->fetchCount++;
#endif
  for (unsigned int i = 0; i < node->childCount(); i++) {
    TransferLayoutOutputsRecursive(node->getChild(i), layoutContext);
  }
}

void FlexNodeFfi::FlexNodeReset() {
  FLEX_NODE_LOG("#not#FlexNode::Reset:");
}

FlexNodeFfi::FlexNodeFfi() {
  mHPNode = HPNodeNew();
}

FlexNodeFfi::~FlexNodeFfi() {
  HPNodeFree(mHPNode);
}

void FlexNodeFfi::FlexNodeInsertChild(int64_t childPointer, int32_t index) {
  FLEX_NODE_LOG("FlexNode::InsertChild:%d", index);
  HPNodeInsertChild(mHPNode, _64int2HPNodeRef(childPointer), index);
}

void FlexNodeFfi::FlexNodeRemoveChild(int64_t childPointer) {
  FLEX_NODE_LOG("FlexNode::RemoveChild");
  HPNodeRemoveChild(mHPNode, _64int2HPNodeRef(childPointer));
}

void FlexNodeFfi::FlexNodeCalculateLayout(float width, float height,
                                          int64_t *childNativeNodes,
                                          const int32_t childNativeNodeLen,
                                          int32_t direction) {
  FLEX_NODE_LOG("FlexNode::CalculateLayout:%.2f,%.2f", width, height);
  ASSERT(childNativeNodes);
  LayoutContextFfi layoutContext(childNativeNodes, childNativeNodeLen);

#ifdef LAYOUT_TIME_ANALYZE
  // clock_t start =  clock();
  newLayoutCount = 0;
  struct timeval start ,end;
  gettimeofday(&start ,NULL);
  layout_analyze_measureCount = 0;
  layout_analyze_measureTime = 0.0f;
#endif
  if (direction < 0 || direction > 2) {
    direction = 1;//HPDirection::LTR
  }

  HPNodeDoLayout(mHPNode, width, height, (HPDirection) direction, (void *) &layoutContext);

#ifdef LAYOUT_TIME_ANALYZE
  gettimeofday(&end ,NULL);
  HPLog(LogLevelInfo, "HPNodeDoLayout %ld ms MeasureCount %d MeasureTime %lf ms",
  // (end - start)/(double) CLOCKS_PER_SEC * 1000,
      (1000*(end.tv_sec - start.tv_sec) + (end.tv_usec - start.tv_usec) /1000),
      layout_analyze_measureCount, layout_analyze_measureTime/(double) CLOCKS_PER_SEC* 1000);
#endif
  TransferLayoutOutputsRecursive(mHPNode, (void *) &layoutContext);
#ifdef LAYOUT_TIME_ANALYZE
  gettimeofday(&start ,NULL);
  HPLog(LogLevelInfo, "TransferLayoutOutputsRecursive %ld ms ", (1000*(start.tv_sec - end.tv_sec) + (start.tv_usec - end.tv_usec) /1000));
  HPLog(LogLevelInfo, "FlexNodeCount %d TransferLayoutOutputsRecursive newLayoutCount %d", FlexNodeCount(mHPNode), newLayoutCount);
#endif
  //HPNodePrint(mHPNode);
  // HPLog(LogLevelInfo, "end HPNodeDoLayout===========================================");
}

void FlexNodeFfi::FlexNodeNodeMarkDirty() {
  FLEX_NODE_LOG("FlexNode::MarkDirty");
  HPNodeMarkDirty(mHPNode);
}

bool FlexNodeFfi::FlexNodeNodeIsDirty() {
  FLEX_NODE_LOG("FlexNode::IsDirty");
  return HPNodeIsDirty(mHPNode);
}

void FlexNodeFfi::FlexNodeNodeSetHasMeasureFunc(bool hasMeasureFunc) {
  FLEX_NODE_LOG("FlexNode::SetHasMeasureFunc:%B", hasMeasureFunc);
  HPNodeSetMeasureFunc(mHPNode, hasMeasureFunc ? HPFFIMeasureFunc : NULL);
}

void FlexNodeFfi::FlexNodeNodeSetHasBaselineFunc(bool hasMeasureFunc) {
  FLEX_NODE_LOG("#not#FlexNode::SetHasBaselineFunc");
}

void FlexNodeFfi::FlexNodeMarkHasNewLayout() {
  FLEX_NODE_LOG("FlexNode::markHasNewLayout");
  HPNodesetHasNewLayout(mHPNode, true);
}

bool FlexNodeFfi::FlexNodeHasNewLayout() {
  FLEX_NODE_LOG("FlexNode::hasNewLayout");
  return HPNodeHasNewLayout(mHPNode);
}

void FlexNodeFfi::FlexNodeMarkLayoutSeen() {
  FLEX_NODE_LOG("FlexNode::markLayoutSeen");
  HPNodesetHasNewLayout(mHPNode, false);
}

void FlexNodeFfi::FlexNodeFree() {
  delete this;
}

void FlexNodeFfi::FlexNodeFreeRecursive() {
  FLEX_NODE_LOG("FlexNode::FreeRecursive" );
  HPNodeFreeRecursive(mHPNode);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, width) {
  FLEX_NODE_LOG("FlexNode::GetWidth");
  float value = HPNodeLayoutGetWidth(mHPNode);
//__android_log_print(ANDROID_LOG_INFO,  "TextNode", "width %f", value);
  return value;
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, width) {
  FLEX_NODE_LOG("#not#FlexNode::SetWidth:%.2f", width);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, height) {
  FLEX_NODE_LOG("FlexNode::GetHeight: %.2f", HPNodeLayoutGetHeight(mHPNode));
  return HPNodeLayoutGetHeight(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, height) {
  FLEX_NODE_LOG("#not#FlexNode::SetHeight:%.2f", height);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, left) {
  FLEX_NODE_LOG("FlexNode::GetLeft :%.2f", HPNodeLayoutGetLeft(mHPNode));
  return HPNodeLayoutGetLeft(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, left) {
  FLEX_NODE_LOG("#not#FlexNode::SetLeft:%.2f", left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, top) {
  FLEX_NODE_LOG("FlexNode::GetTop:%.2f ", HPNodeLayoutGetTop(mHPNode));
  return HPNodeLayoutGetTop(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, top) {
  FLEX_NODE_LOG("#not#FlexNode::SetTop:%.2f", top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, right) {
  FLEX_NODE_LOG("FlexNode::GetRight:%.2f", HPNodeLayoutGetRight(mHPNode));
  return HPNodeLayoutGetRight(mHPNode);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, right) {
  FLEX_NODE_LOG("#not#FlexNode::SetRight:%.2f", right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, bottom) {
  FLEX_NODE_LOG("FlexNode::GetBottom:%.2f", HPNodeLayoutGetBottom(mHPNode));
  return HPNodeLayoutGetBottom(mHPNode);
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, bottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetBottom:%.2f", bottom);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_left) {
  FLEX_NODE_LOG("FlexNode::GetMarginLeft");
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSLeft);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_left) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginLeft:%.2f", margin_left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_top) {
  FLEX_NODE_LOG("FlexNode::GetMarginTop");
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSTop);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_top) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginTop:%.2f", margin_top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_right) {
  FLEX_NODE_LOG("FlexNode::GetMarginRight");
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSRight);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_right) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginRight:%.2f", margin_right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_bottom) {
  FLEX_NODE_LOG("FlexNode::GetMarginBottom");
  return HPNodeLayoutGetMargin(mHPNode, CSSDirection::CSSBottom);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_bottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetMarginBottom:%.2f", margin_bottom);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_left) {
  FLEX_NODE_LOG("FlexNode::GetPaddingLeft");
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSLeft);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_left) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingLeft:%.2f", padding_left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_top) {
  FLEX_NODE_LOG("FlexNode::GetPaddingTop");
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSTop);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_top) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingTop:%.2f", padding_top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_right) {
  FLEX_NODE_LOG("FlexNode::GetPaddingRight");
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSRight);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_right) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingRight:%.2f", padding_right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_bottom) {
  FLEX_NODE_LOG("FlexNode::GetPaddingBottom");
  return HPNodeLayoutGetPadding(mHPNode, CSSDirection::CSSBottom);
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_bottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetPaddingBottom:%.2f", padding_bottom);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_left) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderLeft");
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_left) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderLeft:%.2f", border_left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_top) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderTop");
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_top) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderTop:%.2f", border_top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_right) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderRight");
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_right) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderRight:%.2f", border_right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_bottom) {
  FLEX_NODE_LOG("#not#FlexNode::GetBorderBottom");
  return 0;
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_bottom) {
  FLEX_NODE_LOG("#not#FlexNode::SetBorderBottom:%.2f", border_bottom);
}

