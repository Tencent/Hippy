/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2018-01-03
 */

#ifndef MTTSTYLE_H_
#define MTTSTYLE_H_
#include "MTTFlex.h"
#include "MTTUtil.h"
#include <string>
using namespace std;

class MTTStyle {
public:
	MTTStyle();
	virtual ~MTTStyle();
	string toString();
	bool setMargin(CSSDirection dir, float value);
	bool setPadding(CSSDirection dir, float value);
	bool setBorder(CSSDirection dir, float value);
	bool isDimensionAuto(FlexDirection axis);
	bool hasAutoMargin(FlexDirection axis);
	bool isAutoStartMargin(FlexDirection axis);
	bool isAutoEndMargin(FlexDirection axis);
	void  setDim(FlexDirection axis, float value);
	float getDim(FlexDirection axis);
	void  setDim(Dimension dimension, float value);
	float getDim(Dimension dimension);
	bool isOverflowScroll();
	float getFlexBasis();
public:
	  NodeType nodeType;
	  FlexDirection flexDirection;
	  FlexAlign justifyContent;
	  FlexAlign alignContent;
	  FlexAlign alignItems;
	  FlexAlign alignSelf;
	  FlexWrapMode flexWrap;
	  PositionType positionType;
	  DisplayType displayType;
	  OverflowType overflowType;

	  float flexBasis;
	  float flexGrow;
	  float flexShrink;
	  float flex;

	  float margin[4];
	  CSSDirection marginFrom[4];
	  float padding[4];
	  CSSDirection paddingFrom[4];
	  float border[4];
	  CSSDirection borderFrom[4];
	  float position[4];

	  float dim[2];
	  float minDim[2];
	  float maxDim[2];

	  float itemSpace;
	  float lineSpace;
};

#endif /* MTTSTYLE_H_ */
