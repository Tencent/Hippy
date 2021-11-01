//
// Created by longquan on 2020/9/2.
//

#ifndef ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFIBRIDGE_H_
#define ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFIBRIDGE_H_

#include <cstdint>
#include "FlexNodeFfiUtil.h"

// 注意这里的枚举改动以后，要同步修改dart中的枚举
enum FiledType {
  EdgeSetFlagField,
  HasNewLayoutField,
  WidthFiled,
  HeightField,
  LeftField,
  TopField,
  RightFiled,
  BottomFiled,
  MarginLeftField,
  MarginTopField,
  MarginRightField,
  MarginBottomField,
  PaddingLeftField,
  PaddingTopField,
  PaddingRightField,
  PaddingBottomField,
  BorderLeftField,
  BorderTopField,
  BorderRightField,
  BorderBottomField,
};

// 注意这里的枚举改动以后，要同步修改dart中的枚举
enum ExportFunctionType {
  MeasureFunc,
  FloatFiledGetter,
  FloatFiledSetter,
  IntFiledGetter,
  IntFiledSetter
};



// 计算text的size
typedef int64_t (*DartFlexNodeMeasureFunc)(int64_t nodeId,
                                               float width,
                                               int32_t widthMode,
                                               float height,
                                               int32_t heightMode);
typedef float (*NodeFloatFiledGetter)(int64_t nodeId, int32_t filedType);
typedef void (*NodeFloatFiledSetter)(int64_t nodeId, int32_t filedType, float value);
typedef int (*NodeIntFiledGetter)(int64_t nodeId, int32_t filedType);
typedef void (*NodeIntFiledSetter)(int64_t nodeId, int32_t filedType, int32_t value);

#ifdef __cplusplus
extern "C" {
#endif

FLEX_EXPORT FLEX_USED int32_t registerExportFunction(int32_t type, void *func);

FLEX_USED float getNodeFloatFiled(int64_t nodeId, FiledType filedType);

FLEX_USED void setNodeFloatFiled(int64_t nodeId, FiledType filedType, float value);

FLEX_USED bool getNodeBooleanFiled(int64_t nodeId, FiledType filedType);

FLEX_USED void setNodeBooleanFiled(int64_t nodeId, FiledType filedType, bool value);

FLEX_USED int getNodeIntFiled(int64_t nodeId, FiledType filedType);

FLEX_USED void setNodeIntFiled(int64_t nodeId, FiledType filedType, int value);

FLEX_USED int64_t flexNodeMeasureFunc(int64_t nodeId,
                                float width,
                                int32_t widthMode,
                                float height,
                                int32_t heightMode);

FLEX_USED static int64_t flexNodeFFINew();

FLEX_EXPORT FLEX_USED int64_t newNativeFlexNode();

FLEX_EXPORT FLEX_USED void freeNativeFlexNode(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void insertNativeFlexNodeChild(int64_t nativeFlexNode,
                                                     int64_t childPointer,
                                                     int32_t index);

FLEX_EXPORT FLEX_USED void removeNativeFlexNodeChild(int64_t nativeFlexNode,
                                                     int64_t childPointer);

FLEX_EXPORT FLEX_USED void calculateNativeFlexNodeLayout(int64_t nativeFlexNode,
                                                         float width,
                                                         float height,
                                                         int64_t* childNativeNodes,
                                                         int32_t childNativeNodesLen,
                                                         int32_t direction);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeWidth(int64_t nativeFlexNode) ;

FLEX_EXPORT FLEX_USED void setNativeFlexNodeWidth(int64_t nativeFlexNode,
                            float width);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeHeight(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeHeight(int64_t nativeFlexNode,
                            float height);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeTop(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeTop(int64_t nativeFlexNode,
                             float top);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeLeft(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeLeft(int64_t nativeFlexNode,
                          float left);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeRight(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeRight(int64_t nativeFlexNode,
                           float right);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBottom(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBottom(int64_t nativeFlexNode,
                            float bottom);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginTop(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginTop(int64_t nativeFlexNode,
                          float marginTop);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginLeft(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginLeft(int64_t nativeFlexNode,
                           float marginLeft);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginRight(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginRight(int64_t nativeFlexNode,
                            float marginRight);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeMarginBottom(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeMarginBottom(int64_t nativeFlexNode,
                             float marginBottom);

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingTop(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingTop(int64_t nativeFlexNode,
                                float paddingTop);

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingLeft(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingLeft(int64_t nativeFlexNode,
                                 float paddingLeft);

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingRight(int64_t nativeFlexNode) ;

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingRight(int64_t nativeFlexNode,
                                  float paddingRight);

FLEX_EXPORT FLEX_USED float getNativeFlexNodePaddingBottom(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodePaddingBottom(int64_t nativeFlexNode,
                                   float paddingBottom);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderTop(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderTop(int64_t nativeFlexNode,
                                 float borderTop);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderLeft(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderLeft(int64_t nativeFlexNode,
                                  float borderLeft);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderRight(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderRight(int64_t nativeFlexNode,
                                   float borderRight);

FLEX_EXPORT FLEX_USED float getNativeFlexNodeBorderBottom(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeBorderBottom(int64_t nativeFlexNode,
                                                          float borderBottom);

FLEX_EXPORT FLEX_USED void markNativeFlexNodeNodeDirty(
    int64_t nativePointer);

FLEX_EXPORT FLEX_USED int32_t isNativeFlexNodeDirty(int64_t nativePointer);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeHasMeasureFunc(int64_t nativePointer,
                                                               int32_t hasMeasureFunc);

FLEX_EXPORT FLEX_USED void setNativeFlexNodeHasBaselineFunc(int64_t nativePointer,
                                                                int32_t hasMeasureFunc);

FLEX_EXPORT FLEX_USED void nativeFlexNodeMarkHasNewLayout(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED int32_t hasNativeFlexNodeNewLayout(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED void nativeFlexNodeMarkLayoutSeen(int64_t nativeFlexNode);

FLEX_EXPORT FLEX_USED  void resetNativeFlexNode(int64_t nativeFlexNode);


#ifdef __cplusplus
}
#endif


#endif //ANDROID_DEMO_LAYOUT_FFI_FLEXNODEFFIBRIDGE_H_
