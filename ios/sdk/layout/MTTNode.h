/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2017-12-25
 */

#ifndef MTTNODE_H_
#define MTTNODE_H_

#include <vector>
#include "MTTUtil.h"

#include "MTTFlex.h"
#include "MTTTStyle.h"
#include "MTTFlexLine.h"
#include "MTTLayoutCache.h"
using namespace std;

class MTTNode;
typedef MTTNode *MTTNodeRef;
typedef MTTSize (*MTTMeasureFunc)(MTTNodeRef node, float width, MeasureMode widthMeasureMode, float height, MeasureMode heightMeasureMode);
typedef void (*MTTDirtiedFunc)(MTTNodeRef node);

class MTTNode {
public:
    MTTNode();
    virtual ~MTTNode();
    void initLayoutResult();
    bool reset();
    void printNode(uint32_t indent = 0);
    MTTStyle getStyle();
    void setStyle(const MTTStyle &st);
    bool setMeasureFunc(MTTMeasureFunc _measure);
    void setParent(MTTNodeRef _parent);
    MTTNodeRef getParent();
    void addChild(MTTNodeRef item);
    bool insertChild(MTTNodeRef item, uint32_t index);
    MTTNodeRef getChild(uint32_t index);
    bool removeChild(MTTNodeRef child);
    bool removeChild(uint32_t index);
    uint32_t childCount();

    void setDisplayType(DisplayType displayType);
    void setHasNewLayout(bool hasNewLayoutOrNot);
    bool hasNewLayout();
    void markAsDirty();
    void setDirty(bool dirtyOrNot);
    void setDirtiedFunc(MTTDirtiedFunc _dirtiedFunc);

    void setContext(void *_context);
    void *getContext();

    float getStartBorder(FlexDirection axis);
    float getEndBorder(FlexDirection axis);
    float getStartPaddingAndBorder(FlexDirection axis);
    float getEndPaddingAndBorder(FlexDirection axis);
    float getPaddingAndBorder(FlexDirection axis);
    float getMargin(FlexDirection axis);
    float getStartMargin(FlexDirection axis);
    float getEndMargin(FlexDirection axis);
    bool isAutoStartMargin(FlexDirection axis);
    bool isAutoEndMargin(FlexDirection axis);

    void setLayoutStartMargin(FlexDirection axis, float value);
    void setLayoutEndMargin(FlexDirection axis, float value);
    float getLayoutMargin(FlexDirection axis);
    float getLayoutStartMargin(FlexDirection axis);
    float getLayoutEndMargin(FlexDirection axis);

    float resolveRelativePosition(FlexDirection axis, bool forAxisStart);
    void setLayoutStartPosition(FlexDirection axis, float value, bool addRelativePosition = true);
    void setLayoutEndPosition(FlexDirection axis, float value, bool addRelativePosition = true);
    float getLayoutStartPosition(FlexDirection axis);
    float getLayoutEndPosition(FlexDirection axis);

    FlexDirection getCrossAxis();
    FlexDirection getMainAxis();
    float boundAxis(FlexDirection axis, float value);
    void layout(float parentWidth, float parentHeight);
    float getMainAxisDim();
    float getLayoutDim(FlexDirection axis);
    bool isLayoutDimDefined(FlexDirection axis);
    void setLayoutDim(FlexDirection axis, float value);
    FlexAlign getNodeAlign(MTTNodeRef item);

protected:
    void layoutFixedItems(MTTSizeMode measureMode);
    void resolveStyleValues();
    void resetLayoutRecursive(bool isDisplayNone = true);
    void cacheLayoutOrMeasureResult(MTTSize availableSize, MTTSizeMode measureMode, FlexLayoutAction layoutAction);
    void layoutSingleNode(
        float availableWidth, MeasureMode widthMeasureMode, float availableHeight, MeasureMode heightMeasureMode, FlexLayoutAction layoutAction);
    void layoutImpl(float parentWidth, float parentHeight, FlexLayoutAction layoutAction);
    void calculateItemsFlexBasis(MTTSize availableSize);
    bool collectFlexLines(vector<FlexLine *> &flexLines, MTTSize availableSize);
    void determineItemsMainAxisSize(vector<FlexLine *> &flexLines, FlexLayoutAction layoutAction);
    float determineCrossAxisSize(vector<FlexLine *> &flexLines, MTTSize availableSize, FlexLayoutAction layoutAction);
    void mainAxisAlignment(vector<FlexLine *> &flexLines);
    void crossAxisAlignment(vector<FlexLine *> &flexLines);
    void convertLayoutResult(float absLeft, float absTop);

public:
    MTTLayoutCache layoutCache;
    MTTStyle style;
    MTTLayout result;
    vector<MTTNodeRef> children;
    void *context;
    MTTNodeRef parent;
    MTTMeasureFunc measure;
    MTTDirtiedFunc dirtiedFunc;

    bool isFrozen;
    bool isDirty;
    bool _hasNewLayout;

    // cache layout or measure positions, used if conditions are met
    // layout result is in initial state or not
    bool inInitailState;  // 1
};

#endif
