/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2017-12-25
 */

#include "MTTNode.h"
#include <algorithm>
#include <string.h> // for memset
#include <string>

//the layout progress refer https://www.w3.org/TR/css-flexbox-1/#layout-algorithm

string getIndentString(int indent) {
	string str;
	for (int i=0; i<indent; i++) {
		str += " ";
	}
	return str;
}

string toString(float value) {
	if(isUndefined(value)){
		return "NAN";
	}
	else {
        char str[10] = {0};
        snprintf(str, 9, "%0.f", PixelRoundInt(value));
		return str;
	}
}

void MTTNode::printNode(uint32_t indent) {
	string indentStr = getIndentString(indent);
	string startStr;
	startStr = indentStr + "<div layout=\"width:%s; height:%s; left:%s; top:%s;\" style=\"%s\">\n";
	MTTLogd(startStr.c_str(),
			toString(result.dim[0]).c_str(),
			toString(result.dim[1]).c_str(),
			toString(result.position[0]).c_str(),
			toString(result.position[1]).c_str(),
			style.toString().c_str());

	vector<MTTNodeRef>& items = children;
	for (size_t i = 0 ; i < items.size(); i++) {
		MTTNodeRef item = items[i];
		item->printNode(indent+4);
	}
	string endStr = indentStr + "</div>\n";
	MTTLogd(endStr.c_str());
}


MTTNode::MTTNode() {
	context = nullptr;
	parent = nullptr;
	measure = nullptr;
    dirtiedFunc = nullptr;

    initLayoutResult();
    inInitailState = true;
}

MTTNode::~MTTNode() {
	//remove from parent
	if (parent != nullptr) {
		parent->removeChild(this);
		parent = nullptr;
	}

	//set child's parent as null
	for (size_t i = 0 ; i < children.size(); i++) {
		MTTNodeRef item = children[i];
		if(item != nullptr) {
			item->setParent(nullptr);
		}
	}

	children.clear();
}

void MTTNode::initLayoutResult() {
	isFrozen = false;
	isDirty = true;
	_hasNewLayout = false;
	result.dim[DimWidth] = 0;
	result.dim[DimHeight] = 0;

	memset((void *)result.position, 0, sizeof(float) * 4);
	memset((void *)result.cachedPosition, 0, sizeof(float) * 4);
	memset((void *)result.margin, 0, sizeof(float) * 4);
	memset((void *)result.padding, 0, sizeof(float) * 4);
	memset((void *)result.border, 0, sizeof(float) * 4);

	result.hadOverflow = false;
}

bool MTTNode::reset() {
	if(childCount() != 0 ||getParent() != nullptr)
		return false;
	children.clear();
	children.shrink_to_fit();
	initLayoutResult();
    inInitailState = true;
    return true;
}

void MTTNode::resetLayoutRecursive(bool isDisplayNone) {
	if(inInitailState && isDisplayNone) {
		return;
	}
	initLayoutResult();
	if(!isDisplayNone) {//see MTTNode::removeChild
		//set result as undefined.see MTTNodeChildTest.cpp
		//in tests/folder
		result.dim[DimWidth] = VALUE_UNDEFINED;
		result.dim[DimHeight] = VALUE_UNDEFINED;
	} else {
		inInitailState = true;//prevent resetLayoutRecursive run many times in recursive
		//in DisplayNone state, set hasNewLayout as true;
		//set dirty false;
		setHasNewLayout(true);
		setDirty(false);
	}
	//if just because parent's display type change,
	//not to clear child layout cache, can be reused.
	layoutCache.clearCache();
	for(size_t i = 0 ; i < children.size() ; i++) {
		MTTNodeRef item = children[i];
		item->resetLayoutRecursive(isDisplayNone);
	}
}

MTTStyle MTTNode::getStyle() {
	return style;
}

void MTTNode::setStyle(const MTTStyle& st) {
	style = st;
	//TODO:: layout if needed???
}

bool MTTNode::setMeasureFunc(MTTMeasureFunc _measure) {
	if(measure == _measure) {
		return true;
	}

	//not leaf node , not set measure
	if(childCount() > 0) {
		return false;
	}

	measure = _measure;
	style.nodeType = _measure? NodeTypeText:NodeTypeDefault;
	markAsDirty();
	return true;
}

void MTTNode::setParent(MTTNodeRef _parent) {
	parent = _parent;
}

MTTNodeRef MTTNode::getParent() {
	return parent;
}

void  MTTNode::addChild(MTTNodeRef item) {
	if(item == nullptr) {
		return;
	}
	item->setParent(this);
	children.push_back(item);
	markAsDirty();
}

bool MTTNode::insertChild(MTTNodeRef item, uint32_t index) {
	//measure node cannot have child.
	if(item == nullptr || measure != nullptr) {
		return false;
	}
	item->setParent(this);
	children.insert(children.begin() + index, item);
	markAsDirty();
	return true;
}

MTTNodeRef MTTNode::getChild(uint32_t index) {
	if(index > children.size() - 1 ) {
		return nullptr;
	}
	return children[index];
}

bool MTTNode::removeChild(MTTNodeRef child) {
  vector<MTTNodeRef>::iterator p =
		  std::find(children.begin(), children.end(), child);
  if (p != children.end()) {
		children.erase(p);
		child->setParent(nullptr);
		child->resetLayoutRecursive(false);
		markAsDirty();
		return true;
  }
  return false;
}

bool MTTNode::removeChild(uint32_t index) {
	if(index > children.size() -1 ) {
		return false;
	}
	MTTNodeRef child = getChild(index);
	if(child != nullptr) {
		child->setParent(nullptr);
		child->resetLayoutRecursive(false);
	}
	children.erase(children.begin() + index);
	markAsDirty();
	return true;
}

uint32_t MTTNode::childCount() {
	return (uint32_t)children.size();
}

void MTTNode::setDisplayType(DisplayType displayType) {
	if(style.displayType == displayType)
			return;
	style.displayType = displayType;
    isDirty = false;//force following markAsDirty did effect to its parents
	markAsDirty();
}

void MTTNode::markAsDirty() {
	if(!isDirty) {
		setDirty(true);
		if(parent) {
			parent->markAsDirty();
		}
	}
}

void MTTNode::setHasNewLayout(bool hasNewLayoutOrNot) {
	_hasNewLayout = hasNewLayoutOrNot;
}

bool MTTNode::hasNewLayout() {
	return _hasNewLayout;
}

void MTTNode::setDirty(bool dirtyOrNot) {
	if(isDirty == dirtyOrNot) {
		return;
	}
	isDirty = dirtyOrNot;
	if(isDirty) {
		//if is dirty, reset frozen.
		isFrozen = false;
		//if is dirty, layout cache muse be in clear state.
		layoutCache.clearCache();
		if(dirtiedFunc != nullptr) {
			dirtiedFunc(this);
		}
	}
}

void MTTNode::setDirtiedFunc(MTTDirtiedFunc _dirtiedFunc) {
	dirtiedFunc = _dirtiedFunc;
}

void MTTNode::setContext(void * _context) {
	context = _context;
}

void * MTTNode::getContext() {
	return context;
}

bool MTTNode::isLayoutDimDefined(FlexDirection axis) {
	return isDefined(result.dim[axisDim[axis]]);
}

void MTTNode::setLayoutDim(FlexDirection axis, float value) {
	result.dim[axisDim[axis]] = value;
}

float MTTNode::getLayoutDim(FlexDirection axis) {
	if(!isLayoutDimDefined(axis)){
		return VALUE_UNDEFINED;
	}
	return result.dim[axisDim[axis]];
}

float MTTNode::getMainAxisDim() {
	FlexDirection mainAxis = style.flexDirection;
	if(!isLayoutDimDefined(mainAxis)){
			return VALUE_UNDEFINED;
		}
	return result.dim[axisDim[mainAxis]];
}

float MTTNode::getStartBorder(FlexDirection axis) {
	if(isDefined(style.border[axisStart[axis]])) {
		return style.border[axisStart[axis]];
	}
	return 0.0f;
}

float MTTNode::getEndBorder(FlexDirection axis) {
	if(isDefined(style.border[axisEnd[axis]])) {
		return style.border[axisEnd[axis]];
	}
	return 0.0f;
}

float MTTNode::getStartPaddingAndBorder(FlexDirection axis) {
	float value = 0;
	if(isDefined(style.padding[axisStart[axis]])) {
		value += style.padding[axisStart[axis]];
	}

	if(isDefined(style.border[axisStart[axis]])) {
		value += style.border[axisStart[axis]];
	}

	return value;
}

float  MTTNode::getEndPaddingAndBorder(FlexDirection axis) {
	float value = 0;
	if(isDefined(style.padding[axisEnd[axis]])) {
		value += style.padding[axisEnd[axis]];
	}

	if(isDefined(style.border[axisEnd[axis]])) {
		value += style.border[axisEnd[axis]];
	}

	return value;
}

float MTTNode:: getPaddingAndBorder(FlexDirection axis) {
	return getStartPaddingAndBorder(axis) + getEndPaddingAndBorder(axis);
}

float MTTNode::getStartMargin(FlexDirection axis) {
	return isDefined(style.margin[axisStart[axis]]) ? style.margin[axisStart[axis]] : 0;
}

float MTTNode::getEndMargin(FlexDirection axis) {
	return isDefined(style.margin[axisEnd[axis]]) ? style.margin[axisEnd[axis]] : 0;
}

float MTTNode::getMargin(FlexDirection axis) {
	return getStartMargin(axis) + getEndMargin(axis);
}

bool  MTTNode::isAutoStartMargin(FlexDirection axis) {
	return style.isAutoStartMargin(axis);
}

bool  MTTNode::isAutoEndMargin(FlexDirection axis) {
	return style.isAutoEndMargin(axis);
}

void MTTNode::setLayoutStartMargin(FlexDirection axis, float value) {
	result.margin[axisStart[axis]] = value;
}

void  MTTNode::setLayoutEndMargin(FlexDirection axis, float value) {
	result.margin[axisEnd[axis]] = value;
}


float MTTNode::getLayoutMargin(FlexDirection axis) {
	return getLayoutStartMargin(axis) + getLayoutEndMargin(axis);
}

float  MTTNode::getLayoutStartMargin(FlexDirection axis) {
	return isDefined(result.margin[axisStart[axis]]) ? result.margin[axisStart[axis]] : 0;
}

float MTTNode::getLayoutEndMargin(FlexDirection axis) {
	return isDefined(result.margin[axisEnd[axis]]) ? result.margin[axisEnd[axis]] : 0;
}

/* If both axisStart and axisEnd are defined,
 * then use axisStart. Otherwise use which is defined.
 * @param axis flex direction
 * @param forAxisStart
 * 		  true  get relative value for axis start
 * 		  false get relative value for axis end
 */
float MTTNode::resolveRelativePosition(FlexDirection axis, bool forAxisStart) {
	if(style.positionType != PositionTypeRelative) {
		return 0.0f;
	}

	if(isDefined(style.position[axisStart[axis]])) {
		float value =  style.position[axisStart[axis]];
		return forAxisStart ? value : -value;
	} else if(isDefined(style.position[axisEnd[axis]]))  {
	    float value =  style.position[axisEnd[axis]];
		return forAxisStart ? -value : value;
	}

	return 0.0f;
}

void MTTNode::setLayoutStartPosition(FlexDirection axis, float value, bool addRelativePosition) {
	if(addRelativePosition && style.positionType == PositionTypeRelative) {
		value += resolveRelativePosition(axis, true);
	}

	if(!FloatIsEqual(result.cachedPosition[axisStart[axis]], value)) {
		result.cachedPosition[axisStart[axis]] = value;
		setHasNewLayout(true);
	}

	result.position[axisStart[axis]] = value;
}

void MTTNode::setLayoutEndPosition(FlexDirection axis, float value, bool addRelativePosition) {
	if(addRelativePosition && style.positionType == PositionTypeRelative) {
			value += resolveRelativePosition(axis, false);
	}

	if(!FloatIsEqual(result.cachedPosition[axisEnd[axis]], value)) {
		result.cachedPosition[axisEnd[axis]] = value;
		setHasNewLayout(true);
	}

	result.position[axisEnd[axis]] = value;
}

float MTTNode::getLayoutStartPosition(FlexDirection axis) {
	return result.position[axisStart[axis]];
}

float MTTNode::getLayoutEndPosition(FlexDirection axis) {
	return result.position[axisEnd[axis]];
}

/* resolve cross axis's direction
 * determine cross start & cross end 's direction
 * use this method when cross axis alignment
*/
FlexDirection MTTNode::getCrossAxis() {
	FlexDirection mainAxis = style.flexDirection;
	FlexDirection crossAxis;
	//cross axis's direction rely on flex wrap mode.
	if (isRowDirection(mainAxis)) {
		if (style.flexWrap == FlexWrapReverse) {
			crossAxis = FLexDirectionColumnReverse;
		} else {
			crossAxis = FLexDirectionColumn;
		}
	} else {
		if (style.flexWrap == FlexWrapReverse) {
			crossAxis = FLexDirectionRowReverse;
		} else {
			crossAxis = FLexDirectionRow;
		}
	}

	return crossAxis;
}

FlexDirection MTTNode::getMainAxis() {
	FlexDirection mainAxis = style.flexDirection;
	return mainAxis;
}

FlexAlign MTTNode::getNodeAlign(MTTNodeRef item) {
	ASSERT(item != nullptr);
	if(item->style.alignSelf == FlexAlignAuto) {
		return style.alignItems;
	}
	return item->style.alignSelf;
}

float MTTNode::boundAxis(FlexDirection axis, float value) {
  float min = style.minDim[axisDim[axis]];
  float max = style.maxDim[axisDim[axis]];
  float boundValue = value;
  if (!isUndefined(max) && max >= 0.0 && boundValue > max) {
    boundValue = max;
  }
  if (!isUndefined(min) && min >= 0.0 && boundValue < min) {
    boundValue = min;
  }
  return boundValue;
}

void MTTNode::resolveStyleValues() {
	if(!isDirty) {
		return;
	}
	//TODO:: add percent support, needed??
	//resolveStyleValues travels child in Recursive
	result.margin[0] = style.margin[0];
	result.margin[1] = style.margin[1];
	result.margin[2] = style.margin[2];
	result.margin[3] = style.margin[3];

	result.padding[0] = style.padding[0];
	result.padding[1] = style.padding[1];
	result.padding[2] = style.padding[2];
	result.padding[3] = style.padding[3];

	result.border[0] = style.border[0];
	result.border[1] = style.border[1];
	result.border[2] = style.border[2];
	result.border[3] = style.border[3];

	vector<MTTNodeRef>& items = children;
	for (size_t i = 0 ; i < items.size(); i++) {
		MTTNodeRef item = items[i];
		item->resolveStyleValues();
	}
}

#ifdef  LAYOUT_TIME_ANALYZE
static int layoutCount = 0;
static int layoutCacheCount = 0;
static int measureCount = 0;
static int measureCacheCount = 0;
#endif

void MTTNode::layout(float parentWidth, float parentHeight) {
#ifdef  LAYOUT_TIME_ANALYZE
	layoutCount = 0;
	layoutCacheCount = 0;
	measureCount = 0;
	measureCacheCount = 0;
#endif
	if(isUndefined(style.flexBasis) && !isUndefined(style.dim[axisDim[style.flexDirection]])) {
		style.flexBasis = style.dim[axisDim[style.flexDirection]];
	}

	resolveStyleValues();

	//if container not set itself width and parent width is set,
	//set container width  as parentWidth subtract margin
	bool styleWidthReset = false;
	if(isUndefined(style.dim[DimWidth]) && isDefined(parentWidth)) {
		float containerWidth  = parentWidth - getMargin(FLexDirectionRow) ;
		style.setDim(DimWidth, containerWidth > 0.0f ? containerWidth : 0.0f);
		styleWidthReset = true;
	}

	bool styleHeightReset = false;
	if(isUndefined(style.dim[DimHeight]) && isDefined(parentHeight)) {
		float containerHeight  = parentHeight - getMargin(FLexDirectionColumn) ;
		style.setDim(DimHeight, containerHeight > 0.0f ? containerHeight : 0.0f);
		styleHeightReset = true;
	}
	layoutImpl(parentWidth, parentHeight, LayoutActionLayout);
	if(styleWidthReset) {
		style.setDim(DimWidth, VALUE_UNDEFINED);
	}
	if(styleHeightReset) {
		style.setDim(DimHeight, VALUE_UNDEFINED);
	}

	//set container's position
	if(isDefined(style.position[0])) {
		result.position[0] = style.position[0];
	}
	if(isDefined(style.position[1])) {
		result.position[1] = style.position[1];
	}
	if(isDefined(style.margin[0])) {
		result.position[0] += style.margin[0];
	}
	if(isDefined(style.margin[1])) {
		result.position[1] += style.margin[1];
	}

	//node 's layout is complete
	//convert its and its descendants position and size to a integer value.
#ifndef ANDROID
  //这段代码会将0.5四舍五入为0，导致feeds分割线消失。
  //HippyShadowView已进行数字运算，无需排版引擎计算
//  convertLayoutResult(0.0f, 0.0f);//layout result convert has been taken in java . 3.8.2018. ianwang..
#endif

#ifdef  LAYOUT_TIME_ANALYZE
	MTTLog(LogLevelDebug,"HippyLayoutTime layout: count %d cache %d, measure: count %d cache %d",
			layoutCount,layoutCacheCount,measureCount,measureCacheCount);
#endif
}


//3.Determine the flex base size and hypothetical main size of each item
void MTTNode::calculateItemsFlexBasis(MTTSize availableSize) {
	FlexDirection mainAxis = style.flexDirection;
	vector<MTTNodeRef>& items = children;
	for (size_t i = 0 ; i < items.size(); i++) {
		MTTNodeRef item = items[i];
		//for display none item, reset its and its descendants layout result.
		if(item->style.displayType == DisplayTypeNone) {
			item->resetLayoutRecursive();
			continue;
		}
		//https://stackoverflow.com/questions/34352140/what-are-the-differences-between-flex-basis-and-width
		//flex-basis has no effect on absolutely-positioned flex items. width and height properties
		//would be necessary.
		//Absolutely-positioned flex items do not participate in flex layout.
		if(item->style.positionType == PositionTypeAbsolute) {
			continue;
		}
		//3.Determine the flex base size and hypothetical main size of each item:
		//3.1 If the item has a definite used flex basis, that's the flex base size.
		if(isDefined(item->style.getFlexBasis()) && isDefined(style.dim[axisDim[mainAxis]])) {
				item->result.flexBaseSize = item->style.getFlexBasis();
		} else if(isDefined(item->style.dim[axisDim[mainAxis]])) {
			//flex-basis:auto:
			//When specified on a flex item, the auto keyword retrieves the value
			//of the main size property as the used flex-basis.
			//If that value is itself auto, then the used value is content.
			item->result.flexBaseSize = item->style.dim[axisDim[mainAxis]];
		} else {
			//3.2 Otherwise, size the item into the available space using its used flex basis
			//in place of its main size,
			float oldMainDim = item->style.getDim(mainAxis);
			//item->style.flexBasis is auto value
			item->style.setDim(mainAxis, item->style.flexBasis);
			item->layoutImpl(availableSize.width, availableSize.height, isRowDirection(mainAxis) ?
							 LayoutActionMeasureWidth : LayoutActionMeasureHeight);
			item->style.setDim(mainAxis, oldMainDim);

			item->result.flexBaseSize = isDefined(item->result.dim[axisDim[mainAxis]]) ? item->result.dim[axisDim[mainAxis]] : 0;
		}

		//item->result.dim[axisDim[mainAxis]] = item->boundAxis(mainAxis, item->result.flexBasis);
		//The hypothetical main size is the item's flex base size clamped
		//according to its min and max main size properties (and flooring the content box size at zero).
		item->result.hypotheticalMainAxisSize =  item->boundAxis(mainAxis, item->result.flexBaseSize);
		item->result.hypotheticalMainAxisMarginBoxSize = item->result.hypotheticalMainAxisSize
															+  item->getMargin(mainAxis);
	}
}

bool MTTNode::collectFlexLines(vector<FlexLine *> & flexLines,  MTTSize availableSize) {
	vector<MTTNodeRef>& items = children;
	bool sumHypotheticalMainSizeOverflow = false;
	float availableWidth = axisDim[style.flexDirection] == DimWidth ?
		                   availableSize.width :availableSize.height;
	if(isUndefined(availableWidth)) {
		availableWidth = INFINITY;
	}

	FlexLine * line = nullptr;
	long itemsSize = items.size();
	int i = 0;
	while(i < itemsSize) {
		MTTNodeRef item = items[i];
		if(item->style.positionType == PositionTypeAbsolute ||
		   item->style.displayType == DisplayTypeNone) {
			//see HippyTest.dirty_mark_all_children_as_dirty_when_display_changes
			//when display changes.
			if(i == itemsSize - 1 && line != nullptr) {
				flexLines.push_back(line);
				break;
			}
			//
			i++;
			continue;
		}

		if(line == nullptr) {
			line = new FlexLine(this);
		}

		float leftSpace = availableWidth -
						  (line->sumHypotheticalMainSize +
						   item->result.hypotheticalMainAxisMarginBoxSize);
		if(leftSpace < 0) {
			//may be line wrap happened
			sumHypotheticalMainSizeOverflow = true;
		}

		if(style.flexWrap == FlexNoWrap ) {
			line->addItem(item);
			if(i == itemsSize - 1) {
				flexLines.push_back(line);
				break;
			}
			i++;
		} else {
			if(leftSpace >= 0 || line->isEmpty()) {
				line->addItem(item);
				if(i == itemsSize-1) {
					flexLines.push_back(line);
					line = nullptr;
				}
				i++;
			} else {

				flexLines.push_back(line);
				line = nullptr;
			}
	   }
	}

	return sumHypotheticalMainSizeOverflow;
}

void  MTTNode::cacheLayoutOrMeasureResult(MTTSize availableSize,MTTSizeMode measureMode,
										 FlexLayoutAction layoutAction) {

	MTTSize resultSize = {result.dim[DimWidth], result.dim[DimHeight]};
	layoutCache.cacheResult(availableSize, resultSize, measureMode, layoutAction);
	if(layoutAction == LayoutActionLayout) {
		setDirty(false);
		setHasNewLayout(true);
		inInitailState = false;
	}
}

/*
 * availableWidth/availableHeight  has subtract its margin and padding.
 */
void MTTNode::layoutSingleNode(float availableWidth, MeasureMode widthMeasureMode,
    					  	  float availableHeight, MeasureMode heightMeasureMode,
							  FlexLayoutAction layoutAction) {

	if(widthMeasureMode == MeasureModeExactly && heightMeasureMode == MeasureModeExactly) {
		result.dim[DimWidth] = availableWidth + getPaddingAndBorder(FLexDirectionRow);
		result.dim[DimHeight] = availableHeight +getPaddingAndBorder(FLexDirectionColumn);
	} else  {
		//measure text, image etc. content node;
		MTTSize dim = {0,0};
		bool needMeasure = true;
		if(style.flexGrow > 0 && style.flexShrink > 0 && parent && parent->childCount() == 1
				&& !parent->style.isDimensionAuto(FLexDirectionRow)
				&& !parent->style.isDimensionAuto(FLexDirectionColumn)){
			//don't measure single grow shrink child
			//see MTTMeasureTest.cpp dont_measure_single_grow_shrink_child
			needMeasure = false;
		}

		if(!needMeasure) {
			dim.width = availableWidth;
			dim.height = availableHeight;
		} else if(measure != nullptr && needMeasure) {
			dim = measure(this, availableWidth, widthMeasureMode, availableHeight, heightMeasureMode);
		}

		result.dim[DimWidth] = boundAxis(FLexDirectionRow, widthMeasureMode == MeasureModeExactly ?
												(availableWidth + getPaddingAndBorder(FLexDirectionRow)):
												(dim.width + getPaddingAndBorder(FLexDirectionRow)));

		result.dim[DimHeight] = boundAxis(FLexDirectionColumn, heightMeasureMode == MeasureModeExactly ?
										 (availableHeight +getPaddingAndBorder(FLexDirectionColumn)) :
										 (dim.height + getPaddingAndBorder(FLexDirectionColumn)));
	}

	MTTSize availableSize = {availableWidth, availableHeight};
	MTTSizeMode measureMode = { widthMeasureMode, heightMeasureMode};
	cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
}


//reference: https://www.w3.org/TR/css-flexbox-1/#layout-algorithm
void MTTNode::layoutImpl(float parentWidth, float parentHeight,  FlexLayoutAction layoutAction) {
#ifdef  LAYOUT_TIME_ANALYZE
	if(layoutAction == LayoutActionLayout) {
		layoutCount++;
	} else {
		measureCount++;
	}
#endif
	FlexDirection mainAxis = style.flexDirection;
	bool performLayout = layoutAction == LayoutActionLayout;
	if(isDefined(parentWidth)) {
		parentWidth -= getMargin(FLexDirectionRow);
		parentWidth = parentWidth >=0.0f ? parentWidth : 0.0f;
	}

	if(isDefined(parentHeight)) {
		parentHeight -= getMargin(FLexDirectionColumn);
		parentHeight = parentHeight >=0.0f ? parentHeight: 0.0f;
	}

    //get node dim from style
	float nodeWidth = isDefined(style.dim[DimWidth])?
					  boundAxis(FLexDirectionRow, style.dim[DimWidth]) : VALUE_UNDEFINED;

	float nodeHeight = isDefined(style.dim[DimHeight])?
					  boundAxis(FLexDirectionColumn, style.dim[DimHeight]) : VALUE_UNDEFINED;

	//layoutMeasuredWidth  layoutMeasuredHeight used in
	//"Determine the flex base size and hypothetical main size of each item"
	if(layoutAction == LayoutActionMeasureWidth && isDefined(nodeWidth)) {
#ifdef  LAYOUT_TIME_ANALYZE
		measureCacheCount++;
#endif
		result.dim[DimWidth] = nodeWidth;
		return;
	} else if(layoutAction == LayoutActionMeasureHeight && isDefined(nodeHeight)) {
#ifdef  LAYOUT_TIME_ANALYZE
		measureCacheCount++;
#endif
		result.dim[DimHeight] = nodeHeight;
		return;
	}

	//9.2.Line Length Determination
	//Determine the available main and cross space for the flex items.
	//For each dimension, if that dimension of the flex container's content box is a definite size,
	//use that; if that dimension of the flex container is being sized under a min or max-content constraint,
	//the available space in that dimension is that constraint;
	//otherwise, subtract the flex container's margin, border, and padding
	//from the space available to the flex container in that dimension and use that value.
	//This might result in an infinite value.

	//get available size for layout or measure
	float availableWidth = VALUE_UNDEFINED;
	if(isDefined(nodeWidth)) {
		availableWidth = nodeWidth - getPaddingAndBorder(FLexDirectionRow);
	} else if(isDefined(parentWidth)) {
		availableWidth = parentWidth - getPaddingAndBorder(FLexDirectionRow);
	}

	float availableHeight = VALUE_UNDEFINED;
	if(isDefined(nodeHeight)) {
		availableHeight = nodeHeight - getPaddingAndBorder(FLexDirectionColumn);
	} else if(isDefined(parentHeight)) {
		availableHeight = parentHeight - getPaddingAndBorder(FLexDirectionColumn);
	}

	if(isDefined(style.maxDim[DimWidth])) {
		if(FloatIsEqual(style.maxDim[DimWidth], style.minDim[DimWidth])) {
			style.dim[DimWidth] =  style.minDim[DimWidth];
		}
		float maxDimWidth = style.maxDim[DimWidth] - getPaddingAndBorder(FLexDirectionRow);
		if(maxDimWidth >= 0.0f && maxDimWidth < NanAsINF(availableWidth)) {
			availableWidth = maxDimWidth;
		}
	}

	if(isDefined(style.maxDim[DimHeight])) {
		if(FloatIsEqual(style.maxDim[DimHeight], style.minDim[DimHeight])) {
				style.dim[DimHeight] =  style.minDim[DimHeight];
		}
		float maxDimHeight = style.maxDim[DimHeight] - getPaddingAndBorder(FLexDirectionColumn);
		if(maxDimHeight >= 0.0f && maxDimHeight < NanAsINF(availableHeight)) {
			availableHeight = maxDimHeight;
		}
	}

	//available size to layout...
	availableWidth = availableWidth < 0.0f ? 0.0f : availableWidth;
	availableHeight = availableHeight < 0.0f ? 0.0f : availableHeight;

	MeasureMode widthMeasureMode = MeasureModeUndefined;
	if(isDefined(style.dim[DimWidth])) {
		widthMeasureMode = MeasureModeExactly;
	} else if(isDefined(availableWidth)) {
		if(parent && parent->style.isOverflowScroll()
				  && isRowDirection(parent->style.flexDirection)) {
			widthMeasureMode = MeasureModeUndefined;
			availableWidth = VALUE_AUTO;
		} else {
			widthMeasureMode = MeasureModeAtMost;
		}
	}

	MeasureMode heightMeasureMode = MeasureModeUndefined;
	if(isDefined(style.dim[DimHeight])) {
		heightMeasureMode = MeasureModeExactly;
	} else if(isDefined(availableHeight)) {
		if(parent && parent->style.isOverflowScroll()
				&& isColumnDirection(parent->style.flexDirection)) {
			heightMeasureMode = MeasureModeUndefined;
			availableHeight = VALUE_AUTO;
		} else {
			heightMeasureMode = MeasureModeAtMost;
		}
	}

	MTTSize availableSize = {availableWidth,availableHeight};
	MTTSizeMode measureMode = { widthMeasureMode, heightMeasureMode};
	MeasureResult* cacheResult = layoutCache.getCachedMeasureResult(availableSize, measureMode,
																	layoutAction, measure != nullptr);
	if(cacheResult != nullptr) {
		//set Result....
		switch (layoutAction) {
			case LayoutActionMeasureWidth:
#ifdef  LAYOUT_TIME_ANALYZE
				measureCacheCount++;
#endif
				ASSERT(isDefined(cacheResult->resultSize.width));
				result.dim[DimWidth] = cacheResult->resultSize.width;
				break;
			case LayoutActionMeasureHeight:
#ifdef  LAYOUT_TIME_ANALYZE
				measureCacheCount++;
#endif
				ASSERT(isDefined(cacheResult->resultSize.height));
				result.dim[DimHeight] = cacheResult->resultSize.height;
				break;
			case LayoutActionLayout:

				//do nothing..
				//layoutCache.cachedLayout object is last layout result.
				//used to determine need layout or not.

				//it's same with current result value before convertLayoutResult called
				//result.dim === layoutCache.cachedLayout.resultSize
//				ASSERT(FloatIsEqual(result.dim[0], cacheResult->resultSize.width));
//				ASSERT(FloatIsEqual(result.dim[1], cacheResult->resultSize.height));

				//if it's a measure node and cache result cached by LayoutActionMeasureWidth or LayoutActionMeasureHeight
				//so this is first layout for current Measure Node, set hasNewLayout as true,
				//if not, this node's layout result value has been fetched to java and set hasNewLayout false in FlexNode.cc
				//so not set hasNewLayout as true to avoid JNI call again in FLexNode.cc
				if(cacheResult->layoutAction != LayoutActionLayout && measure != nullptr) {
					//need assign result size if layoutAction is different 3.14.2018
					result.dim[DimWidth] = cacheResult->resultSize.width;
					result.dim[DimHeight] = cacheResult->resultSize.height;
					cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
				} else {
#ifdef  LAYOUT_TIME_ANALYZE
				layoutCacheCount++;
#endif
				}
//				setHasNewLayout(true);
				//if it's a measure node , layout could be cache by LayoutActionMeasureWidth or LayoutActionMeasureHeight
				//so in this case, we need set dirty as false;
				setDirty(false);
				break;
			default:
				break;
		}
		return;
	}
	//before layout set result's hadOverflow as false.
	if(layoutAction == LayoutActionLayout) {
		result.hadOverflow = false;
	}
	//single element measure width and height
	if((children.size() == 0)) {
		layoutSingleNode(availableWidth, widthMeasureMode,
						 availableHeight, heightMeasureMode, layoutAction);
		return;
	}
	//3.Determine the flex base size and hypothetical main size of each item
	calculateItemsFlexBasis(availableSize);
	//9.3. Main Size Determination
	// 5. Collect flex items into flex lines:
	vector<FlexLine *> flexLines;
	bool sumHypotheticalMainSizeOverflow = collectFlexLines(flexLines, availableSize);

	//get max line's  main size
	float maxSumItemsMainSize = 0;
	for (size_t i=0; i < flexLines.size(); i++) {
		if (flexLines[i]->sumHypotheticalMainSize > maxSumItemsMainSize) {
			maxSumItemsMainSize = flexLines[i]->sumHypotheticalMainSize;
		}
	}

	// 4. Determine the main size of the flex container using the rules of the formatting context
	//in which it participates. For this computation, auto margins on flex items are treated as 0.
	//TODO:: if has set , what to do for next run in determineCrossAxisSize's  layoutImpl
	float containerInnerMainSize = 0.0f;
	if(isDefined(style.dim[axisDim[mainAxis]])) {
		//MeasureModeExactly
		containerInnerMainSize = style.dim[axisDim[mainAxis]] -  getPaddingAndBorder(mainAxis);
	} else {
		if(sumHypotheticalMainSizeOverflow) {//MeasureModeAtMost
			//if sum of hypothetical MainSize > available size;
			float mainInnerSize = axisDim[mainAxis] == DimWidth ?
				                   availableSize.width :availableSize.height;

			if(maxSumItemsMainSize > mainInnerSize && !style.isOverflowScroll()) {
				if(parent&& parent->getNodeAlign(this) == FlexAlignStretch
					&& axisDim[mainAxis] == axisDim[parent->getCrossAxis()]
					&& style.positionType != PositionTypeAbsolute) {
					//it this node has text child and node main axis(width) is stretch
					//,cross axis length(height) is undefined
					//text can has multi-line, text's height can affect parent's height
					//in this situation, use availableSize if possible
					containerInnerMainSize = mainInnerSize;
				} else {
					containerInnerMainSize = maxSumItemsMainSize;
				}
			} else {
				containerInnerMainSize = mainInnerSize ;
			}
		} else {
			containerInnerMainSize = maxSumItemsMainSize ;
		}
	}
	result.dim[axisDim[mainAxis]] = boundAxis(mainAxis, containerInnerMainSize + getPaddingAndBorder(mainAxis));
	//return if its just in measure
    if ((layoutAction == LayoutActionMeasureWidth && isRowDirection(mainAxis)) ||
    	(layoutAction == LayoutActionMeasureHeight && isColumnDirection(mainAxis))) {
    	//cache layout result & state...
        cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
    	//free flexLines, allocate in collectFlexLines.
    	//TODO:: opt.
    	for (size_t i=0; i < flexLines.size(); i++) {
    		delete flexLines[i];
    	}
        return;
    }

    //6. Resolving Flexible Lengths
    //To resolve the flexible lengths of the items within a flex line:
    //TODO:://this's the only place that confirm child items main axis size, see item->setLayoutDim
    determineItemsMainAxisSize(flexLines, layoutAction);

    //9.4. Cross Size Determination
	//calculate line's cross size in flexLines
    //TODO:: The real place that Determine
    //the flex container's used cross size is at step 15.

    float sumLinesCrossSize = determineCrossAxisSize(flexLines, availableSize, layoutAction);

    if(!performLayout) {
    	//TODO::for measure, I put the calculate of flex container's cross size in here..
    	//TODO::why must in step 15 in W3 flex layout algorithm
    	//noted by ianwang 12.30.2017.

    	//15.Determine the flex container's used cross size:
    	//If the cross size property is a definite size, use that,
    	//clamped by the min and max cross size properties of the flex container.
    	//Otherwise, use the sum of the flex lines' cross sizes,
    	//clamped by the min and max cross size properties of the flex container.
    	FlexDirection crossAxis = getCrossAxis();
    	float crossDimSize;
		if(isDefined(style.dim[axisDim[crossAxis]])) {
			crossDimSize = style.dim[axisDim[crossAxis]];
		} else {
			crossDimSize = (sumLinesCrossSize + getPaddingAndBorder(crossAxis));
		}
    	result.dim[axisDim[crossAxis]] = boundAxis(crossAxis,crossDimSize);
    	//cache layout result & state...
    	cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);

		//free flexLines, allocate in collectFlexLines.
		for (size_t i=0; i < flexLines.size(); i++) {
			delete flexLines[i];
		}
		return;
    }

    //9.5. Main-Axis Alignment
	mainAxisAlignment(flexLines);

	//9.6. Cross-Axis Alignment
	//if contianer's innerCross size not defined,
	//then it will be determined in step 15 of crossAxisAlignment
	crossAxisAlignment(flexLines);

	//free flexLines, allocate in collectFlexLines.
	for (size_t i=0; i < flexLines.size(); i++) {
		delete flexLines[i];
	}

	//cache layout result & state...
	cacheLayoutOrMeasureResult(availableSize, measureMode, layoutAction);
	//layout fixed elements...
	layoutFixedItems(measureMode);

	return;
}

//9.4. Cross Size Determination
float MTTNode::determineCrossAxisSize(vector<FlexLine*>& flexLines, MTTSize availableSize, FlexLayoutAction layoutAction) {
	FlexDirection mainAxis = style.flexDirection;
	FlexDirection crossAxis = getCrossAxis();
	float sumLinesCrossSize = 0;
	for (size_t i=0; i < flexLines.size(); i++) {
		FlexLine * line = flexLines[i];
		float maxItemCrossSize = 0;
		for(size_t j=0; j < line->items.size(); j++) {
			MTTNodeRef  item = line->items[j];
			//item's main axis size has been determined.
			//try to calculate the hypothetical cross size of each item
			//that would be stored in result.dim[crossAxis]
			//align stretch may be modify this value in the later step.

			//WARNING TODO::this is the only place that the Recursive flex layout happen.
			//7.Determine the hypothetical cross size of each item by performing layout with
			//the used main size and the available space, treating auto as fit-content.
			FlexLayoutAction oldLayoutAction = layoutAction;
			if(getNodeAlign(item) == FlexAlignStretch &&
							item->style.isDimensionAuto(crossAxis) &&
							!item->style.hasAutoMargin(crossAxis) &&
							layoutAction == LayoutActionLayout) {
				//Delay layout for stretch item, do layout later in step 11.
				layoutAction = axisDim[crossAxis] == DimWidth ? LayoutActionMeasureWidth : LayoutActionMeasureHeight;
			}
			float oldMainDim = item->style.getDim(mainAxis);
			item->style.setDim(mainAxis, item->getLayoutDim(mainAxis));
			item->layoutImpl(availableSize.width, availableSize.height, layoutAction);
			item->style.setDim(mainAxis, oldMainDim);
			layoutAction = oldLayoutAction;
			//if child item had overflow , then transfer this state to its parent.
			//see HippyTest_HadOverflowTests.spacing_overflow_in_nested_nodes in ./tests/MTTHadOverflowTest.cpp
			result.hadOverflow = result.hadOverflow | item->result.hadOverflow;

			//TODO:: if need support baseline  add here
			//8.Calculate the cross size of each flex line.
			//1)Collect all the flex items whose inline-axis is parallel to the main-axis,
			//whose align-self is baseline, and whose cross-axis margins are both non-auto.
			//Find the largest of the distances between each item's baseline and its hypothetical
			//outer cross-start edge, and the largest of the distances between each item's baseline
			//and its hypothetical outer cross-end edge, and sum these two values.
			//2)Among all the items not collected by the previous step, find the largest outer
			//hypothetical cross size.
			//3)The used cross-size of the flex line is the largest of the numbers found
			//in the previous two steps and zero.

			//Max item cross size
			float itemOutCrossSize = item->getLayoutDim(crossAxis) + item->getMargin(crossAxis);
			if(itemOutCrossSize > maxItemCrossSize) {
				maxItemCrossSize = itemOutCrossSize;
			}
		}

		//8.Calculate the cross size of each flex line.
		//clip current container cross axis size..
		maxItemCrossSize = boundAxis(crossAxis, maxItemCrossSize);
		line->lineCrossSize = maxItemCrossSize;
		sumLinesCrossSize += maxItemCrossSize;

		//single line , set line height as container inner height
		if( flexLines.size() == 1 && isDefined(style.dim[axisDim[crossAxis]])) {
			//if following assert is true, means front-end's style is in unsuitable state ..
			//such as main axis is undefined but set flex-wrap as FlexWrap.
			//ASSERT(style.flexWrap == FlexNoWrap);
			float innerCrossSize = boundAxis(crossAxis, style.dim[axisDim[crossAxis]]) -
								   getPaddingAndBorder(crossAxis);

			line->lineCrossSize = innerCrossSize;
			sumLinesCrossSize = innerCrossSize;
		}
	}

	//9.Handle 'align-content: stretch' for lines
	if(isDefined(style.dim[axisDim[crossAxis]]) && style.alignContent == FlexAlignStretch) {

		float innerCrossSize = boundAxis(crossAxis, style.dim[axisDim[crossAxis]]) - getPaddingAndBorder(crossAxis);
		if(sumLinesCrossSize < innerCrossSize ) {
			for (size_t i=0; i < flexLines.size(); i++) {
				FlexLine * line = flexLines[i];
				line->lineCrossSize += (innerCrossSize - sumLinesCrossSize) / flexLines.size();
			}
		}
	}

	//11.Determine the used cross size of each flex item
	//Think about item align-self: stretch
	for (size_t i=0; i < flexLines.size(); i++) {
		FlexLine * line = flexLines[i];
		for(size_t j=0; j<  line->items.size(); j++) {
			MTTNodeRef  item = line->items[j];

			//1): If a flex item has align-self: stretch, its computed cross size property is auto,
			//    and neither of its cross-axis margins are auto, the used outer cross size is the used
			//    cross size of its flex line, clamped according to the item's
			//    min and max cross size properties.
			//2):Otherwise,the used cross size is the item's hypothetical cross size.
			if(getNodeAlign(item) == FlexAlignStretch &&
					item->style.isDimensionAuto(crossAxis) &&
					!item->style.hasAutoMargin(crossAxis)) {

				item->result.dim[axisDim[crossAxis]] = item->boundAxis(crossAxis,
													   line->lineCrossSize - item->getMargin(crossAxis));
				//If the flex item has align-self: stretch, redo layout for its contents,
				//treating this used size as its definite cross size
				//so that percentage-sized children can be resolved.
				float oldMainDim = item->style.getDim(mainAxis);
				float oldCrossDim = item->style.getDim(crossAxis);
				item->style.setDim(mainAxis, item->getLayoutDim(mainAxis));
				item->style.setDim(crossAxis, item->getLayoutDim(crossAxis));
				item->layoutImpl(availableSize.width, availableSize.height, layoutAction);
				item->style.setDim(mainAxis, oldMainDim);
				item->style.setDim(crossAxis, oldCrossDim);

			} else {
				//Otherwise, the used cross size is the item's hypothetical cross size.
				//see the step7.
				//item's hypothetical cross size. has been set in result.dim[axisDim[crossAxis]].
			}
		}
	}

	//TODO::Why Determine  the flex container's used cross size in step 15.
	return sumLinesCrossSize;
}

//See  9.7 Resolving Flexible Lengths.
void MTTNode::determineItemsMainAxisSize(vector<FlexLine *> & flexLines, FlexLayoutAction layoutAction) {
	FlexDirection mainAxis = style.flexDirection;
	float mainAxisContentSize = result.dim[axisDim[mainAxis]] - getPaddingAndBorder(mainAxis);
	// 6. Resolve the flexible lengths of all the flex items to find their used main size (see section 9.7.)
	for (size_t i=0; i< flexLines.size(); i++) {
		FlexLine * line = flexLines[i];
		line->SetContainerMainInnerSize(mainAxisContentSize);
		line->FreezeInflexibleItems(layoutAction);
		while (!line->ResolveFlexibleLengths()) {
			ASSERT(line->totalFlexGrow >= 0);
			ASSERT(line->totalFlexGrow >= 0);
		}

		if(layoutAction == LayoutActionLayout && line->remainingFreeSpace < 0 ) {
			result.hadOverflow = true;
		}
	}
}

//9.5 Main-Axis Alignment
void MTTNode::mainAxisAlignment(vector<FlexLine *> & flexLines) {
	// 12. Distribute any remaining free space. For each flex line:
	FlexDirection mainAxis = style.flexDirection;
	float mainAxisContentSize = getLayoutDim(mainAxis) - getPaddingAndBorder(mainAxis);
	for (size_t i=0; i< flexLines.size(); i++) {
		FlexLine * line = flexLines[i];
		line->SetContainerMainInnerSize(mainAxisContentSize);
		line->alignItems();
	}
}

//9.6 Cross-Axis Alignment
void MTTNode::crossAxisAlignment(vector<FlexLine *> & flexLines) {
	FlexDirection crossAxis = getCrossAxis();
	float sumLinesCrossSize = 0;
	long linesCount = flexLines.size();
	for (int i=0; i< linesCount; i++) {
		FlexLine * line = flexLines[i];
		sumLinesCrossSize += line->lineCrossSize;
		for(size_t j=0; j< line->items.size(); j++) {
			MTTNodeRef item = line->items[j];
			//13.Resolve cross-axis auto margins. If a flex item has auto cross-axis margins:
			float remainingFreeSpace = line->lineCrossSize - item->result.dim[axisDim[crossAxis]] -
															item->getMargin(crossAxis);
			if (remainingFreeSpace > 0) {
				//If its outer cross size (treating those auto margins as zero) is less than
				//the cross size of its flex line, distribute the difference
				//in those sizes equally to the auto margins.
				if( item->isAutoStartMargin(crossAxis) &&
					item->isAutoEndMargin(crossAxis)) {
					item->setLayoutStartMargin(crossAxis, remainingFreeSpace/2);
					item->setLayoutEndMargin(crossAxis, remainingFreeSpace/2);
				} else if (item->isAutoStartMargin(crossAxis)) {
					item->setLayoutStartMargin(crossAxis, remainingFreeSpace);
				} else if (item->isAutoEndMargin(crossAxis)) {
					item->setLayoutEndMargin(crossAxis, remainingFreeSpace);
				} else {
					//For margin:: assign style value to result value at this place..
					item->setLayoutStartMargin(crossAxis, item->getStartMargin(crossAxis));
					item->setLayoutEndMargin(crossAxis, item->getEndMargin(crossAxis));
				}
			} else {
				//Otherwise, if the block-start or inline-start margin
				//(whichever is in the cross axis) is auto, set it to zero.
				//Set the opposite margin so that the outer cross size of the
				//item equals the cross size of its flex line.
				item->setLayoutStartMargin(crossAxis, item->getStartMargin(crossAxis));
				item->setLayoutEndMargin(crossAxis, item->getEndMargin(crossAxis));
//				if (item->isAutoStartMargin(crossAxis)) {
//					item->setLayoutStartMargin(crossAxis, 0);
//				} else {
//					item->setLayoutStartMargin(crossAxis, item->getStartMargin(crossAxis));
//				}
//
//				if (item->isAutoEndMargin(crossAxis)) {
//					item->setLayoutEndMargin(crossAxis, 0);
//				} else {
//					item->setLayoutEndMargin(crossAxis, item->getEndMargin(crossAxis));
//				}
			}

			//14.Align all flex items along the cross-axis per align-self,
			//if neither of the item's cross-axis margins are auto.
			//calculate item's offset in its line by style align-self
			remainingFreeSpace = line->lineCrossSize - item->result.dim[axisDim[crossAxis]] -
														item->getLayoutMargin(crossAxis);
			float offset = item->getLayoutStartMargin(crossAxis);
			switch (getNodeAlign(item)) { //when align self is auto , it overwrite by align items
				case FlexAlignStart:
					break;
				case FlexAlignCenter:
					offset += remainingFreeSpace / 2;
					break;
				case FlexAlignEnd:
					offset += remainingFreeSpace;
					break;
				//TODO:: case baseline alignment
				default:
					break;
			}
			//include (axisStart[crossAxis] == CSSTop) and (axisStart[crossAxis] == CSSBottom)
			//For temporary store. use false parameter
			item->setLayoutStartPosition(crossAxis, offset, false);
//			item->setLayoutEndPosition(crossAxis,
//					(line->lineCrossSize - item->getLayoutDim(crossAxis) - offset), false);
		}
	}

	//15.Determine  the flex container's used cross size:
    //If the cross size property is a definite size, use that,
	//clamped by the min and max cross size properties of the flex container.
	//Otherwise, use the sum of the flex lines' cross sizes,
	//clamped by the min and max cross size properties of the flex container.

   	float crossDimSize;
	if(isDefined(style.dim[axisDim[crossAxis]])) {
		crossDimSize = style.dim[axisDim[crossAxis]];
	} else {
		crossDimSize = (sumLinesCrossSize + getPaddingAndBorder(crossAxis));
	}
	result.dim[axisDim[crossAxis]] = boundAxis(crossAxis,crossDimSize);

	//when container's cross size determined align all flex lines by align-content
	//16.Align all flex lines per align-content
	float innerCrossSize = result.dim[axisDim[crossAxis]]- getPaddingAndBorder(crossAxis);
	float remainingFreeSpace = innerCrossSize - sumLinesCrossSize;
	float offset = getStartPaddingAndBorder(crossAxis);
	float space = 0;
    switch (style.alignContent) {
		case FlexAlignStart:
			break;
		case FlexAlignCenter:
			offset += remainingFreeSpace / 2;
			break;
		case FlexAlignEnd:
			offset += remainingFreeSpace;
			break;
		case FlexAlignSpaceBetween:
			space = remainingFreeSpace / (linesCount - 1);
			break;
		case FlexAlignSpaceAround:
			space = remainingFreeSpace / linesCount;
			offset += space / 2;
			break;
		default:
			break;
    }

    //flex-end::
    //The cross-end margin edge of the flex item is placed flush with the cross-end edge of the line.
    //crossAxisPostionStart calculated along the cross axis direction.
    float crossAxisPostionStart = offset;
    for (int i=0; i< linesCount; i++) {
		FlexLine * line = flexLines[i];
		for(size_t j=0; j< line->items.size(); j++) {
			MTTNodeRef item = line->items[j];
			//include (axisStart[crossAxis] == CSSTop) and (axisStart[crossAxis] == CSSBottom)
			//getLayoutStartPosition set in step 14.
			item->setLayoutStartPosition(crossAxis,
					crossAxisPostionStart + item->getLayoutStartPosition(crossAxis));
			//layout start position has use relative ,so end position not use it ,use false parameter.
			item->setLayoutEndPosition(crossAxis, (getLayoutDim(crossAxis) -
												  item->getLayoutStartPosition(crossAxis) -
												  item->getLayoutDim(crossAxis)), false);

		}

		crossAxisPostionStart += line->lineCrossSize + space;
    }
}

//4.1. Absolutely-Positioned Flex Children
//As it is out-of-flow, an absolutely-positioned child of a flex container
//does not participate in flex layout.
//The static position of an absolutely-positioned child of a flex container
//is determined such that the child is positioned as if it were the sole flex item in the flex container,
//assuming both the child and the flex container were fixed-size boxes of their used size.
//For this purpose, auto margins are treated as zero.
void MTTNode::layoutFixedItems(__unused MTTSizeMode measureMode) {
	FlexDirection mainAxis = style.flexDirection;
	FlexDirection crossAxis = getCrossAxis();
	vector<MTTNodeRef>& items = children;
	for (size_t i = 0 ; i < items.size(); i++) {
		MTTNodeRef item = items[i];
		//for display none item, reset its layout result.
		if(item->style.displayType == DisplayTypeNone) {
			item->resetLayoutRecursive();
			continue;
		}
		if(item->style.positionType != PositionTypeAbsolute) {
			continue;
		}

		float parentWidth = getLayoutDim(FLexDirectionRow) - getPaddingAndBorder(FLexDirectionRow);
		float parentHeight = getLayoutDim(FLexDirectionColumn) - getPaddingAndBorder(FLexDirectionColumn);

		float itemOldStyleDimWidth = item->style.getDim(DimWidth);
		float itemOldStyleDimHeight = item->style.getDim(DimHeight);
		if(isUndefined(itemOldStyleDimWidth) &&
			isDefined(item->style.position[CSSLeft]) &&
			isDefined(item->style.position[CSSRight])) {

			item->style.setDim(DimWidth,(getLayoutDim(FLexDirectionRow) -
												 style.border[CSSLeft] - style.border[CSSRight] -
												 item->style.position[CSSLeft] -
												 item->style.position[CSSRight] -
												 item->getMargin(FLexDirectionRow)));
		}
		if(isUndefined(itemOldStyleDimHeight) &&
			isDefined(item->style.position[CSSTop]) &&
			isDefined(item->style.position[CSSBottom])) {

			item->style.setDim(DimHeight, (getLayoutDim(FLexDirectionColumn) -
					 	 	 	 	 	 	 	   style.border[CSSTop] - style.border[CSSBottom] -
												   item->style.position[CSSTop] -
												   item->style.position[CSSBottom] -
												   item->getMargin(FLexDirectionColumn)));
		}
		item->layoutImpl(parentWidth, parentHeight, LayoutActionLayout);
		//recover item's previous style value
		item->style.setDim(DimWidth, itemOldStyleDimWidth);
		item->style.setDim(DimHeight, itemOldStyleDimHeight);

		//set margin value
		//auto margins are treated as zero. else assign style margin to result margin
		item->setLayoutStartMargin(FLexDirectionRow , item->getStartMargin(FLexDirectionRow));
		item->setLayoutEndMargin(FLexDirectionRow , item->getEndMargin(FLexDirectionRow));
		item->setLayoutStartMargin(FLexDirectionColumn , item->getStartMargin(FLexDirectionColumn));
		item->setLayoutEndMargin(FLexDirectionColumn , item->getEndMargin(FLexDirectionColumn));

		//set position
		//1) for main axis
		if(isDefined(item->style.position[axisStart[mainAxis]])) {
			item->setLayoutStartPosition(mainAxis, getStartBorder(mainAxis) +
					                                     item->getLayoutStartMargin(mainAxis) +
														 item->style.position[axisStart[mainAxis]]);
			item->setLayoutEndPosition(mainAxis, getLayoutDim(mainAxis) -
													   item->getLayoutStartPosition(mainAxis) -
													   item->getLayoutDim(mainAxis));

		} else if (isDefined(item->style.position[axisEnd[mainAxis]])) {
			item->setLayoutEndPosition(mainAxis, getEndBorder(mainAxis) +
													   item->getLayoutEndMargin(mainAxis) +
													   item->style.position[axisEnd[mainAxis]]);
			item->setLayoutStartPosition(mainAxis, getLayoutDim(mainAxis) -
														 item->getLayoutEndPosition(mainAxis) -
														 item->getLayoutDim(mainAxis));

		} else {
			float remainingFreeSpace = getLayoutDim(mainAxis) - getPaddingAndBorder(mainAxis) -
																item->getLayoutDim(mainAxis);
			float offset = getStartPaddingAndBorder(mainAxis);
			switch (style.justifyContent) {
				case FlexAlignStart:
					break;
				case FlexAlignCenter:
					offset += remainingFreeSpace / 2;
					break;
				case FlexAlignEnd:
					offset += remainingFreeSpace;
					break;
				default:
					break;
			}

			item->setLayoutStartPosition(mainAxis, getStartPaddingAndBorder(mainAxis) +
													 item->getLayoutStartMargin(mainAxis) +
													 offset);
			item->setLayoutEndPosition(mainAxis, getLayoutDim(mainAxis) -
													   item->getLayoutStartPosition(mainAxis) -
													   item->getLayoutDim(mainAxis));
		}

		//2)for cross axis
		if(isDefined(item->style.position[axisStart[crossAxis]])) {
			item->setLayoutStartPosition(crossAxis, getStartBorder(crossAxis) +
														  item->getLayoutStartMargin(crossAxis) +
														  item->style.position[axisStart[crossAxis]]);
			item->setLayoutEndPosition(crossAxis, getLayoutDim(crossAxis) -
					                                    item->getLayoutStartPosition(crossAxis) -
														item->getLayoutDim(crossAxis));

		} else if (isDefined(item->style.position[axisEnd[crossAxis]])) {
			item->setLayoutEndPosition(crossAxis, getEndBorder(crossAxis) +
														item->getLayoutEndMargin(crossAxis) +
														item->style.position[axisEnd[crossAxis]]);
			item->setLayoutStartPosition(crossAxis, getLayoutDim(crossAxis) -
														  item->getLayoutEndPosition(crossAxis) -
														  item->getLayoutDim(crossAxis));
		} else {
			float remainingFreeSpace = getLayoutDim(crossAxis) - getPaddingAndBorder(crossAxis) -
										item->getLayoutDim(crossAxis);
			float offset = getStartPaddingAndBorder(crossAxis);
		    switch (getNodeAlign(item)) {
				case FlexAlignStart:
					break;
				case FlexAlignCenter:
					offset += remainingFreeSpace / 2;
					break;
				case FlexAlignEnd:
					offset += remainingFreeSpace;
					break;
				default:
					break;
		    }

			item->setLayoutStartPosition(crossAxis, getStartPaddingAndBorder(crossAxis) +
												    item->getLayoutStartMargin(crossAxis) +
												    offset);
			item->setLayoutEndPosition(crossAxis, getLayoutDim(crossAxis) -
												  item->getLayoutStartPosition(crossAxis) -
												  item->getLayoutDim(crossAxis));

		}
	}
}

//convert position and dimension values to integer value..
//absLeft, absTop is mainly think about the influence of parent's Fraction offset
//for example: if parent's Fraction offset is 0.3
//and current child offset is 0.4
//then the child's absolute offset  is 0.7.
//if use roundf , roundf(0.7) == 1
//so we need absLeft, absTop  parameter
void MTTNode::convertLayoutResult(float absLeft, float absTop) {
	if(!hasNewLayout()) {
		return;
	}
	const float left = result.position[CSSLeft];
	const float top = result.position[CSSTop];
	const float width = result.dim[DimWidth];
	const float height = result.dim[DimHeight];

	absLeft += left;
	absTop  += top;
	bool isTextNode = style.nodeType == NodeTypeText;
	result.position[CSSLeft] = MTTRoundValueToPixelGrid(left, false, isTextNode);
	result.position[CSSTop] = MTTRoundValueToPixelGrid(top, false, isTextNode);

	const bool hasFractionalWidth = !FloatIsEqual(fmodf(width , 1.0), 0) &&
									!FloatIsEqual(fmodf(width , 1.0), 1.0);
	const bool hasFractionalHeight = !FloatIsEqual(fmodf(height, 1.0), 0) &&
								     !FloatIsEqual(fmodf(height, 1.0), 1.0);

	const float absRight = absLeft + width;
	const float absBottom = absTop + height;
	result.dim[DimWidth] = MTTRoundValueToPixelGrid(absRight, (isTextNode && hasFractionalWidth),
												  (isTextNode && !hasFractionalWidth)) -
						   MTTRoundValueToPixelGrid(absLeft, false, isTextNode);

	result.dim[DimHeight] = MTTRoundValueToPixelGrid(absBottom, (isTextNode && hasFractionalHeight),
												   (isTextNode && !hasFractionalHeight)) -
						    MTTRoundValueToPixelGrid(absTop, false, isTextNode);
	vector<MTTNodeRef>& items = children;
	for (size_t i = 0 ; i < items.size(); i++) {
		MTTNodeRef item = items[i];
		item->convertLayoutResult(absLeft, absTop);
	}
}
