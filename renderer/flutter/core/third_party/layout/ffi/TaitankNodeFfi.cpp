//
// Created by longquan on 2021/5/6.
//

#include <map>

#include "TaitankNodeFfi.h"
#include "FlexNodeFfiBridge.h"

#define FLEX_NODE_MEM_FUN_GET_CPP_FFI(type, name)    \
    type  TaitankNodeFfi::get_flex_node_##name ()

#define FLEX_NODE_MEM_FUN_SET_CPP_FFI(type, name)    \
    void  TaitankNodeFfi::set_flex_node_##name (type name)


#ifdef LAYOUT_TIME_ANALYZE
static int layout_analyze_measureCount = 0;
static double layout_analyze_measureTime = 0.0f;
static int newLayoutCount = 0;
#endif

static inline TaitankNodeRef _64int2TaitankNodeRef(int64_t address) {
  auto *native = reinterpret_cast<TaitankNodeFfi *>(address);
  return native->taitank_node_;
}

class LayoutContextTaitankFfi {
 public:
  LayoutContextTaitankFfi(int64_t *nativeNodes,
                   const int32_t nativeNodeLen) {
    //1.setup the map index of HPNodes and java nodes.
    int64_t *flexNodes = nativeNodes;
    int32_t size = nativeNodeLen;

    for (int i = 0; i < size; i++) {
      TaitankNodeRef taitankNode = _64int2TaitankNodeRef(flexNodes[i]);
      ASSERT(taitankNode != nullptr);
      node_ptr_index_map[taitankNode] = i;
    }

    keepFlexNodes = flexNodes;
  }

  int64_t get(TaitankNodeRef node) {
    auto idx = node_ptr_index_map.find(node);
    if (idx == node_ptr_index_map.end()) {
      return 0;
    } else {
      return keepFlexNodes[idx->second];
    }
  }

  ~LayoutContextTaitankFfi() {
    delete keepFlexNodes;
  }

 private:
  std::map<TaitankNodeRef, size_t> node_ptr_index_map;
  int64_t *keepFlexNodes;
};

TaitankSize TaitankFFIMeasureFunc(TaitankNodeRef node, float width,
                                  MeasureMode widthMode, float height,
                                  MeasureMode heightMode, void *layoutContext) {
  ASSERT(layoutContext != nullptr);
  int64_t dartNodeId = ((LayoutContextTaitankFfi *) layoutContext)->get(node);

  if (dartNodeId) {
#ifdef LAYOUT_TIME_ANALYZE
    clock_t start = clock();
#endif

    int64_t measureResult = flexNodeMeasureFunc(dartNodeId,
                                                width, widthMode,
                                                height, heightMode);
    TaitankLogd("FlexNode::HPFFIMeasureFunc:%lld", measureResult);

#ifdef LAYOUT_TIME_ANALYZE
    clock_t end = clock();
    layout_analyze_measureTime += (end - start);
    layout_analyze_measureCount++;
#endif
    static_assert(sizeof(measureResult) == 8,
                  "Expected measureResult to be 8 bytes, or two 32 bit ints");

    int32_t wBits = 0xFFFFFFFF & (measureResult >> 32);
    int32_t hBits = 0xFFFFFFFF & measureResult;
    return TaitankSize{(float) wBits, (float) hBits};

  }
  return TaitankSize{widthMode == 0 ? 0 : width, heightMode == 0 ? 0 : height,};

}

#ifdef LAYOUT_TIME_ANALYZE
static int FlexNodeCount(TaitankNodeRef node) {
  int allCount = node->child_count();
  for (unsigned int i = 0; i < node->child_count(); i++) {
    allCount += FlexNodeCount(node->get_child(i));
  }
  return allCount;
}
#endif

static void TransferLayoutOutputsRecursive(TaitankNodeRef node, void *layoutContext) {
  ASSERT(layoutContext != nullptr);
  int64_t dartNodeId = ((LayoutContextTaitankFfi *) layoutContext)->get(node);
  if (!dartNodeId) {
    return;
  }

  if (!get_taitank_node_has_new_layout(node)) {
#ifdef LAYOUT_TIME_ANALYZE
    float javaWidth = getNodeFloatFiled(dartNodeId, FiledType::WidthFiled);
    if(!isDefined(javaWidth)) {
      TaitankLog(LogLevelError, "cache width NAN  node's node type %d", node->style_.node_type_);
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

  setNodeFloatFiled(dartNodeId, FiledType::WidthFiled, get_taitank_node_layout_width(node));
  setNodeFloatFiled(dartNodeId, FiledType::HeightField, get_taitank_node_layout_height(node));
  setNodeFloatFiled(dartNodeId, FiledType::LeftField, get_taitank_node_layout_left(node));
  setNodeFloatFiled(dartNodeId, FiledType::TopField, get_taitank_node_layout_top(node));

  if ((hasEdgeSetFlag & MARGIN) == MARGIN) {
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginLeftField,
                      get_taitank_node_layout_margin(node, CSSDirection::CSS_LEFT));
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginTopField,
                      get_taitank_node_layout_margin(node, CSSDirection::CSS_TOP));
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginRightField,
                      get_taitank_node_layout_margin(node, CSSDirection::CSS_RIGHT));
    setNodeFloatFiled(dartNodeId,
                      FiledType::MarginBottomField,
                      get_taitank_node_layout_margin(node, CSSDirection::CSS_BOTTOM));
  }

  if ((hasEdgeSetFlag & PADDING) == PADDING) {
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingLeftField,
                      get_taitank_node_layout_padding(node, CSSDirection::CSS_LEFT));
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingTopField,
                      get_taitank_node_layout_padding(node, CSSDirection::CSS_TOP));
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingRightField,
                      get_taitank_node_layout_padding(node, CSSDirection::CSS_RIGHT));
    setNodeFloatFiled(dartNodeId,
                      FiledType::PaddingBottomField,
                      get_taitank_node_layout_padding(node, CSSDirection::CSS_BOTTOM));
  }

  if ((hasEdgeSetFlag & BORDER) == BORDER) {
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderLeftField,
                      get_taitank_node_layout_border(node, CSSDirection::CSS_LEFT));
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderTopField,
                      get_taitank_node_layout_border(node, CSSDirection::CSS_TOP));
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderRightField,
                      get_taitank_node_layout_border(node, CSSDirection::CSS_RIGHT));
    setNodeFloatFiled(dartNodeId,
                      FiledType::BorderBottomField,
                      get_taitank_node_layout_border(node, CSSDirection::CSS_BOTTOM));
  }

  setNodeBooleanFiled(dartNodeId, FiledType::HasNewLayoutField, true);
  set_taitank_node_has_new_layout(node, false);
#ifdef LAYOUT_TIME_ANALYZE
  node->fetchCount++;
#endif
  for (unsigned int i = 0; i < node->child_count(); i++) {
    TransferLayoutOutputsRecursive(node->get_child(i), layoutContext);
  }
}


TaitankNodeFfi::TaitankNodeFfi() {
  taitank_node_ = TaitankNodeCreate();
}

void TaitankNodeFfi::FlexNodeReset() {
  TaitankLogd("#not#FlexNode::Reset:");
  TaitankNodeReset(taitank_node_);
}

void TaitankNodeFfi::FlexNodeFree() {
  delete this;
}

void TaitankNodeFfi::FlexNodeFreeRecursive() {
  TaitankLogd("FlexNode::FreeRecursive" );
  TaitankNodeFreeRecursive(taitank_node_);
}

void TaitankNodeFfi::FlexNodeInsertChild(int64_t childPointer, int32_t index) {
  TaitankLogd("FlexNode::InsertChild:%d", index);
  TaitankNodeInsertChild(taitank_node_, _64int2TaitankNodeRef(childPointer), index);
}

void TaitankNodeFfi::FlexNodeRemoveChild(int64_t childPointer) {
  TaitankLogd("FlexNode::RemoveChild");
  TaitankNodeRemoveChild(taitank_node_, _64int2TaitankNodeRef(childPointer));
}

void TaitankNodeFfi::FlexNodeCalculateLayout(float width,
                                             float height,
                                             int64_t *childNativeNodes,
                                             const int32_t childNativeNodeLen,
                                             int32_t direction) {
  TaitankLogd("FlexNode::CalculateLayout:%.2f,%.2f", width, height);
  ASSERT(childNativeNodes);
  LayoutContextTaitankFfi layoutContext(childNativeNodes, childNativeNodeLen);

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

  TaitankNodeDoLayout(taitank_node_, width, height, (TaitankDirection) direction, (void *) &layoutContext);

#ifdef LAYOUT_TIME_ANALYZE
  gettimeofday(&end ,NULL);
  TaitankLog(LogLevelInfo, "HPNodeDoLayout %ld ms MeasureCount %d MeasureTime %lf ms",
      // (end - start)/(double) CLOCKS_PER_SEC * 1000,
        (1000*(end.tv_sec - start.tv_sec) + (end.tv_usec - start.tv_usec) /1000),
        layout_analyze_measureCount, layout_analyze_measureTime/(double) CLOCKS_PER_SEC* 1000);
#endif
  TransferLayoutOutputsRecursive(taitank_node_, (void *) &layoutContext);
#ifdef LAYOUT_TIME_ANALYZE
  gettimeofday(&start ,NULL);
  TaitankLog(LogLevelInfo, "TransferLayoutOutputsRecursive %ld ms ", (1000*(start.tv_sec - end.tv_sec) + (start.tv_usec - end.tv_usec) /1000));
  TaitankLog(LogLevelInfo, "FlexNodeCount %d TransferLayoutOutputsRecursive newLayoutCount %d", FlexNodeCount(taitank_node_), newLayoutCount);
#endif
}

void TaitankNodeFfi::FlexNodeNodeMarkDirty() {
  TaitankLogd("FlexNode::MarkDirty");
  TaitankNodeMarkDirty(taitank_node_);
}

bool TaitankNodeFfi::FlexNodeNodeIsDirty() {
  TaitankLogd("FlexNode::IsDirty");
  return TaitankNodeIsDirty(taitank_node_);
}

void TaitankNodeFfi::FlexNodeNodeSetHasMeasureFunc(bool hasMeasureFunc) {
  TaitankLogd("FlexNode::SetHasMeasureFunc:%B", hasMeasureFunc);
  set_taitank_node_measure_function(taitank_node_, hasMeasureFunc ? TaitankFFIMeasureFunc : NULL);
}

void TaitankNodeFfi::FlexNodeNodeSetHasBaselineFunc(bool hasMeasureFunc) {
  TaitankLogd("#not#FlexNode::SetHasBaselineFunc");
}

void TaitankNodeFfi::FlexNodeMarkHasNewLayout() {
  TaitankLogd("FlexNode::markHasNewLayout");
  set_taitank_node_has_new_layout(taitank_node_, true);
}

bool TaitankNodeFfi::FlexNodeHasNewLayout() {
  TaitankLogd("FlexNode::hasNewLayout");
  return get_taitank_node_has_new_layout(taitank_node_);
}

void TaitankNodeFfi::FlexNodeMarkLayoutSeen() {
  TaitankLogd("FlexNode::markLayoutSeen");
  set_taitank_node_has_new_layout(taitank_node_, false);
}

TaitankNodeFfi::~TaitankNodeFfi() {
  TaitankNodeFree(taitank_node_);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, width) {
  float value = get_taitank_node_layout_width(taitank_node_);
  TaitankLogd("FlexNode::GetWidth: %.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, width) {
  TaitankLogd("#not#FlexNode::SetWidth:%.2f", width);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, height) {
  float value = get_taitank_node_layout_height(taitank_node_);
  TaitankLogd("FlexNode::GetHeight: %.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, height) {
  TaitankLogd("#not#FlexNode::SetHeight:%.2f", height);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, left) {
  float value = get_taitank_node_layout_left(taitank_node_);
  TaitankLogd("FlexNode::GetLeft :%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, left) {
  TaitankLogd("#not#FlexNode::SetLeft:%.2f", left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, top) {
  float value = get_taitank_node_layout_top(taitank_node_);
  TaitankLogd("FlexNode::GetTop:%.2f ", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, top) {
  TaitankLogd("#not#FlexNode::SetTop:%.2f", top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, right) {
  float value = get_taitank_node_layout_right(taitank_node_);
  TaitankLogd("FlexNode::GetRight:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, right) {
  TaitankLogd("#not#FlexNode::SetRight:%.2f", right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, bottom) {
  float value = get_taitank_node_layout_bottom(taitank_node_);
  TaitankLogd("FlexNode::GetBottom:%.2f", value);
  return value;
}
FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, bottom) {
  TaitankLogd("#not#FlexNode::SetBottom:%.2f", bottom);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_left) {
  float value = get_taitank_node_layout_margin(taitank_node_, CSSDirection::CSS_LEFT);
  TaitankLogd("FlexNode::GetMarginLeft:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_left) {
  TaitankLogd("#not#FlexNode::SetMarginLeft:%.2f", margin_left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_top) {
  float value = get_taitank_node_layout_margin(taitank_node_, CSSDirection::CSS_TOP);
  TaitankLogd("FlexNode::GetMarginTop:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_top) {
  TaitankLogd("#not#FlexNode::SetMarginTop:%.2f", margin_top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_right) {
  float value = get_taitank_node_layout_margin(taitank_node_, CSSDirection::CSS_RIGHT);
  TaitankLogd("FlexNode::GetMarginRight:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_right) {
  TaitankLogd("#not#FlexNode::SetMarginRight:%.2f", margin_right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, margin_bottom) {
  float value = get_taitank_node_layout_margin(taitank_node_, CSSDirection::CSS_BOTTOM);
  TaitankLogd("FlexNode::GetMarginBottom:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, margin_bottom) {
  TaitankLogd("#not#FlexNode::SetMarginBottom:%.2f", margin_bottom);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_left) {
  float value = get_taitank_node_layout_padding(taitank_node_, CSSDirection::CSS_LEFT);
  TaitankLogd("FlexNode::GetPaddingLeft:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_left) {
  TaitankLogd("#not#FlexNode::SetPaddingLeft:%.2f", padding_left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_top) {
  float value = get_taitank_node_layout_padding(taitank_node_, CSSDirection::CSS_TOP);
  TaitankLogd("FlexNode::GetPaddingTop:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_top) {
  TaitankLogd("#not#FlexNode::SetPaddingTop:%.2f", padding_top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_right) {
  float value = get_taitank_node_layout_padding(taitank_node_, CSSDirection::CSS_RIGHT);
  TaitankLogd("FlexNode::GetPaddingRight:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_right) {
  TaitankLogd("#not#FlexNode::SetPaddingRight:%.2f", padding_right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, padding_bottom) {
  float value = get_taitank_node_layout_padding(taitank_node_, CSSDirection::CSS_BOTTOM);
  TaitankLogd("FlexNode::GetPaddingBottom:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, padding_bottom) {
  TaitankLogd("#not#FlexNode::SetPaddingBottom:%.2f", padding_bottom);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_left){
  float value = get_taitank_node_layout_border(taitank_node_, CSSDirection::CSS_LEFT);
  TaitankLogd("FlexNode::GetBorderLeft:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_left){
  TaitankLogd("#not#FlexNode::SetBorderLeft:%.2f", border_left);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_top) {
  float value = get_taitank_node_layout_border(taitank_node_, CSSDirection::CSS_TOP);
  TaitankLogd("FlexNode::GetBorderTop:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_top) {
  TaitankLogd("#not#FlexNode::SetBorderTop:%.2f", border_top);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_right) {
  float value = get_taitank_node_layout_border(taitank_node_, CSSDirection::CSS_RIGHT);
  TaitankLogd("FlexNode::GetBorderRight:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_right) {
  TaitankLogd("#not#FlexNode::SetBorderRight:%.2f", border_right);
}

FLEX_NODE_MEM_FUN_GET_CPP_FFI(float, border_bottom) {
  float value = get_taitank_node_layout_border(taitank_node_, CSSDirection::CSS_BOTTOM);
  TaitankLogd("FlexNode::GetBorderBottom:%.2f", value);
  return value;
}

FLEX_NODE_MEM_FUN_SET_CPP_FFI(float, border_bottom) {
  TaitankLogd("#not#FlexNode::SetBorderBottom:%.2f", border_bottom);
}
