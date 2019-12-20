/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2018-01-03
 */

#include "MTTTStyle.h"
#include <string.h>
#include <iostream>

typedef float float4[4];
typedef CSSDirection CSSFrom[4];

const char flex_direction_str[][20] = {
		"row",
		"row-reverse",
		"column",
		"column-reverse"
};

const char flex_wrap[][20] {
    "nowrap",
    "wrap",
    "wrap-reverse",
};


//	flex-start | flex-end | center | baseline | stretch
const char FlexAlignString[][40] = {
	"Auto",
	"flex-start",
	"center",
	"flex-end",
	"stretch",
	"baseline",
	"space-between",
	"space-around ",
	"space-evenly"
};

const char PositionTypeString[][20] = {
	  "relative",
	  "absolute"
};


//not used
//const char OverflowTypeString[][20] {
//  "visible",
//  "hidden",
//  "scroll"
//};


MTTStyle::MTTStyle() {
	nodeType = NodeTypeDefault;
	flexDirection = FLexDirectionColumn;//but web initial value: FLexDirectionRow
	alignSelf = FlexAlignAuto;
	alignItems = FlexAlignStretch;//initial value: stretch
	alignContent = FlexAlignStart;//but web initial value: stretch
	justifyContent = FlexAlignStart;
	positionType = PositionTypeRelative;
	displayType = DisplayTypeFlex;
	overflowType = OverflowVisible;

	dim[DimWidth] = VALUE_UNDEFINED;//initial value :	auto
	dim[DimHeight] = VALUE_UNDEFINED;
	minDim[DimWidth] = VALUE_UNDEFINED;
	minDim[DimHeight] = VALUE_UNDEFINED;
	maxDim[DimWidth] = VALUE_UNDEFINED;
	maxDim[DimHeight] = VALUE_UNDEFINED;

	position[CSSLeft] = VALUE_AUTO;
	position[CSSRight] = VALUE_AUTO;
	position[CSSTop] = VALUE_AUTO;
	position[CSSBottom] = VALUE_AUTO;

	//CSS margin default value is 0
	memset((void *)margin, 0, sizeof(float) * 4);
	memset((void *)marginFrom, 0xFF, sizeof(CSSDirection) * 4);
	memset((void *)padding,0,sizeof(float) * 4);
	memset((void *)paddingFrom, 0xFF, sizeof(CSSDirection) * 4);
	memset((void *)border,0,sizeof(float) * 4);
	memset((void *)borderFrom, 0xFF, sizeof(CSSDirection) * 4);


	flexWrap = FlexNoWrap;
	flexGrow = 0;   //no grow
	flexShrink = 0; //no shrink, but web initial value 1
	flex = VALUE_UNDEFINED;
	flexBasis = VALUE_AUTO;//initial auto
	itemSpace = 0;
	lineSpace = 0;
}

MTTStyle::~MTTStyle() {
	// TODO Auto-generated destructor stub
}

string edge2String(int type, float4& edges, CSSFrom& edgesFrom) {

	string prefix = "";
	if(type == 0 ) { // margin
		prefix = "margin";
	} else if (type == 1) {
		prefix = "padding";
	} else if (type ==2) {
		prefix = "border";
	}

	string styles;
	char str[60]={0};
	bool hasHorizontal = false;
	bool hasVertical = false;
	for(int i = CSSLeft; i <= CSSBottom; i++) {
		memset(str,0, sizeof(str));
		if(edgesFrom[i] == CSSLeft && !hasHorizontal) {
			snprintf(str, 50, "-left:%0.f; ", edges[i]);
			styles += prefix;
			styles += str;
		}

		if(edgesFrom[i] == CSSRight && !hasHorizontal) {
			snprintf(str, 50, "-right:%0.f; ", edges[i]);
			styles += prefix;
			styles += str;
		}

		if(edgesFrom[i] == CSSTop && !hasVertical) {
			snprintf(str, 50, "-top:%0.f; ", edges[i]);
			styles += prefix;
			styles += str;
		}

		if(edgesFrom[i] == CSSBottom && !hasVertical) {
			snprintf(str, 50, "-bottom:%0.f; ", edges[i]);
			styles += prefix;
			styles += str;
		}


		if(edgesFrom[i] == CSSHorizontal && !hasHorizontal) {
			snprintf(str, 50, "-horizontal:%0.f; ", edges[i]);
			styles += prefix;
			styles += str;
			hasHorizontal = true;
		}

		if(edgesFrom[i] == CSSVertical  && !hasVertical) {
			snprintf(str, 50, "-vertical:%0.f; ", edges[i]);
			styles += prefix;
			styles += str;
			hasVertical = true;
		}

		if(edgesFrom[i] == CSSAll) {
			snprintf(str, 50, ":%0.f; ", edges[i]);
			styles += prefix;
			styles += str;
			break;
		}
	}

	return styles;
}

string MTTStyle::toString() {
	string styles;
	char str[60]={0};
	if(flexDirection != FLexDirectionColumn) {
		snprintf(str, 50, "flex-direction:%s; ", flex_direction_str[flexDirection]);
		styles += str;
	}

	//flexWrap
	memset(str,0, sizeof(str));
	if(flexWrap != FlexNoWrap) {
		snprintf(str, 50, "flex-wrap:%s; ",flex_wrap[flexWrap]);
		styles += str;
	}

	//flexBasis
	memset(str,0, sizeof(str));
	if(isDefined(flexBasis)) {
		snprintf(str, 50, "flex-basis:%0.f; ",flexBasis);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(flexGrow != 0) {
		snprintf(str, 50, "flex-grow %0.f; ",flexGrow);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(flexShrink != 0) {
		snprintf(str, 50, "flex-shrink %0.f; ",flexShrink);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(positionType != PositionTypeRelative) {
		snprintf(str, 50, "position:%s; ", PositionTypeString[positionType]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(position[CSSLeft])) {
		snprintf(str, 50, "left:%0.f; ", position[CSSLeft]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(position[CSSTop])) {
		snprintf(str, 50, "top:%0.f; ", position[CSSTop]);
		styles += str;
	}
	memset(str,0, sizeof(str));
	if(isDefined(position[CSSRight])) {
		snprintf(str, 50, "right:%0.f; ", position[CSSRight]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(position[CSSBottom])) {
		snprintf(str, 50, "bottom:%0.f; ", position[CSSBottom]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(dim[DimWidth])) {
		snprintf(str, 50, "width:%0.f; ", dim[DimWidth]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(dim[DimHeight])) {
		snprintf(str, 50, "height:%0.f; ", dim[DimHeight]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(minDim[DimWidth])) {
		snprintf(str, 50, "min-width:%0.f; ", minDim[DimWidth]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(minDim[DimHeight])) {
		snprintf(str, 50, "min-height:%0.f; ", minDim[DimHeight]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(maxDim[DimWidth])) {
		snprintf(str, 50, "max-width:%0.f; ", maxDim[DimWidth]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(isDefined(maxDim[DimHeight])) {
		snprintf(str, 50, "max-height:%0.f; ", maxDim[DimHeight]);
		styles += str;
	}

	styles += edge2String(0, margin, marginFrom);
	styles += edge2String(1, padding, paddingFrom);
	styles += edge2String(2, border, borderFrom);

	memset(str,0, sizeof(str));
	if(alignSelf != FlexAlignAuto /*&& alignSelf != FlexAlignStretch*/) {
		snprintf(str, 50, "align-self:%s; ", FlexAlignString[alignSelf]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(alignItems != FlexAlignStretch) {
		snprintf(str, 50, "align-items:%s; ", FlexAlignString[alignItems]);
		styles += str;
	}

	memset(str,0, sizeof(str));
	if(alignContent != FlexAlignStart) {
		snprintf(str, 50, "align-content:%s; ", FlexAlignString[alignContent]);
		styles += str;
	}


	memset(str,0, sizeof(str));
	if(justifyContent != FlexAlignStart) {
		snprintf(str, 50, "justify-content:%s; ", FlexAlignString[justifyContent]);
		styles += str;
	}

	if(nodeType == NodeTypeText) {
		styles += "nodeType:text;";
	}

	return styles;
}

/*
 * priority:
 *[CSSTop,CSSLeft,CSSBottom,CSSRight] > [CSSHorizontal, CSSVertical] > CSSAll > CSSNONE
 */
bool setEdges(CSSDirection dir, float value, float4& edges, CSSFrom& edgesFrom) {
	bool hasSet = false;
	if(dir >= CSSLeft && dir <= CSSBottom) {
		edgesFrom[dir] = dir;
		if(!FloatIsEqual(edges[dir], value)) {
			edges[dir] = value;
			hasSet =true;
		}

	} else if (dir == CSSHorizontal) {
		if(edgesFrom[CSSLeft] != CSSLeft ) {
			edgesFrom[CSSLeft] = CSSHorizontal;
			if(!FloatIsEqual(edges[CSSLeft], value)) {
				edges[CSSLeft] = value;
				hasSet = true;
			}
		}

		if(edgesFrom[CSSRight] != CSSRight) {
			edgesFrom[CSSRight] = CSSHorizontal;
			if(!FloatIsEqual(edges[CSSRight], value)) {
				edges[CSSRight] = value;
				hasSet = true;
			}
		}

	} else if(dir == CSSVertical) {
		if(edgesFrom[CSSTop] != CSSTop) {
			edgesFrom[CSSTop] = CSSVertical;
			if(!FloatIsEqual(edges[CSSTop], value)) {
				edges[CSSTop] = value;
				hasSet = true;
			}
		}
		if(edgesFrom[CSSBottom] != CSSBottom) {
			edgesFrom[CSSBottom] = CSSVertical;
			if(!FloatIsEqual(edges[CSSBottom], value)) {
				edges[CSSBottom] = value;
				hasSet = true;
			}
		}
	} else if(dir == CSSAll) {
		for(int i = CSSLeft ; i <= CSSBottom; i++) {
			if(edgesFrom[i] == CSSNONE) {
				edges[i] = value;
				edgesFrom[i] = CSSAll;
				hasSet = true;
			} else if(edgesFrom[i] == CSSAll && !FloatIsEqual(edges[i], value)) {
				edges[i] = value;
				hasSet = true;
			}
		}
	}

	return hasSet;
}


bool MTTStyle::setMargin(CSSDirection dir, float value) {
	return setEdges(dir, value, margin, marginFrom);
}

bool MTTStyle::setPadding(CSSDirection dir, float value) {
	return setEdges(dir, value, padding, paddingFrom);
}

bool MTTStyle::setBorder(CSSDirection dir, float value) {
	return setEdges(dir, value, border, borderFrom);
}


void  MTTStyle::setDim(Dimension dimension, float value) {
	dim[dimension] = value;
}

float MTTStyle::getDim(Dimension dimension) {
	return dim[dimension];
}

void  MTTStyle::setDim(FlexDirection axis, float value) {
	setDim(axisDim[axis], value);
}

float MTTStyle::getDim(FlexDirection axis) {
	return dim[axisDim[axis]];
}

bool MTTStyle::isDimensionAuto(FlexDirection axis) {
	return isUndefined(dim[axisDim[axis]]);
}

bool MTTStyle::isAutoStartMargin(FlexDirection axis) {
	return isUndefined(margin[axisStart[axis]]);
}

bool MTTStyle::isAutoEndMargin(FlexDirection axis) {
	return isUndefined(margin[axisEnd[axis]]);
}

bool MTTStyle::hasAutoMargin(FlexDirection axis) {
	return isAutoStartMargin(axis) || isAutoEndMargin(axis);
}

bool MTTStyle::isOverflowScroll () {
	return overflowType == OverflowScroll;
}

float MTTStyle::getFlexBasis() {
	if(isDefined(flexBasis)) {
		return flexBasis;
	} else if(isDefined(flex) && flex > 0.0f) {
		return 0.0f;
	}

	return VALUE_AUTO;
}


