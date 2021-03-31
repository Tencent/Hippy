/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2017-12-30
 */

#ifndef FLEXLINE_H_
#define FLEXLINE_H_
#include <vector>

#include "MTTFlex.h"
using namespace std;

class MTTNode;
typedef MTTNode *MTTNodeRef;

enum FlexSign {
    PositiveFlexibility,
    NegativeFlexibility,
};

class FlexLine {
public:
    FlexLine(MTTNodeRef container);
    void addItem(MTTNodeRef item);
    bool isEmpty();
    FlexSign Sign() const {
        return sumHypotheticalMainSize < containerMainInnerSize ? PositiveFlexibility : NegativeFlexibility;
    }
    void SetContainerMainInnerSize(float size) {
        containerMainInnerSize = size;
    }
    void FreezeViolations(vector<MTTNode *> &violations);
    void FreezeInflexibleItems(FlexLayoutAction layoutAction);
    bool ResolveFlexibleLengths();
    void alignItems();

public:
    vector<MTTNodeRef> items;
    MTTNodeRef flexContainer;
    // inner size in container main axis
    float containerMainInnerSize;
    // container main axis
    FlexDirection mainAxis;

    // accumulate item's Hypothetical MainSize in this line(include item's margin)
    float sumHypotheticalMainSize;
    // accumulate flex grow of items in this line
    float totalFlexGrow;
    float totalFlexShrink;
    // accumulate item's flexShrink * item 's mainSize
    float totalWeightedFlexShrink;

    // this line's cross size:if this is a single line, may be determined by container's style
    // otherwise  determined by the largest item 's cross size.
    float lineCrossSize;

    // init in FreezeInflexibleItems...
    float initialFreeSpace;
    float remainingFreeSpace;
};
#endif
