/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.smtt.flexbox;

import com.tencent.mtt.hippy.dom.flex.FlexAlign;
import com.tencent.mtt.hippy.dom.flex.FlexCSSDirection;
import com.tencent.mtt.hippy.dom.flex.FlexConstants;
import com.tencent.mtt.hippy.dom.flex.FlexDirection;
import com.tencent.mtt.hippy.dom.flex.FlexJustify;
import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.dom.flex.FlexNodeAPI;
import com.tencent.mtt.hippy.dom.flex.FlexOverflow;
import com.tencent.mtt.hippy.dom.flex.FlexPositionType;
import com.tencent.mtt.hippy.dom.flex.FlexWrap;
import com.tencent.mtt.hippy.dom.flex.FloatUtil;
import com.tencent.smtt.flexbox.FlexNodeStyle.Edge;

import java.util.ArrayList;
import java.util.List;

@SuppressWarnings({"JavaJniMissingFunction", "unused"})
public class FlexNode implements FlexNodeAPI<FlexNode> {
    private FlexNode mParent;
    private List<FlexNode> mChildren;
    private final long mNativeFlexNode;
    protected FlexNodeStyle mFlexNodeStyle;
    private final boolean mDirty = true;

    private final static int MARGIN = 1;
    private final static int PADDING = 2;
    private final static int BORDER = 4;


    private int mEdgeSetFlag = 0;
    private boolean mHasSetPosition = false;
    private float mWidth = Float.NaN;
    private float mHeight = Float.NaN;
    private float mTop = Float.NaN;
    private float mLeft = Float.NaN;
    private float mMarginLeft = 0;
    private float mMarginTop = 0;
    private float mMarginRight = 0;
    private float mMarginBottom = 0;
    private float mPaddingLeft = 0;
    private float mPaddingTop = 0;
    private float mPaddingRight = 0;
    private float mPaddingBottom = 0;
    private float mBorderLeft = 0;
    private float mBorderTop = 0;
    private float mBorderRight = 0;
    private float mBorderBottom = 0;
    private boolean mHasNewLayout = true;

    public FlexNodeStyle Style() {
        return mFlexNodeStyle;
    }

    @CalledByNative
    private long measureFunc(float width, int widthMode, float height, int heightMode) {
        return measure(width, widthMode, height, heightMode);
    }

    protected String resultToString() {
        return "layout: {" +
                "left: " + getLayoutX() + ", " +
                "top: " + getLayoutY() + ", " +
                "width: " + getLayoutWidth() + ", " +
                "height: " + getLayoutHeight() + ", " +
                "}";

    }

    protected void toStringWithIndentation(StringBuilder result, int level) {
        // Spaces and tabs are dropped by IntelliJ logcat integration, so rely on __ instead.
        StringBuilder indentation = new StringBuilder();
        for (int i = 0; i < level; ++i) {
            indentation.append("__");
        }

        result.append(indentation.toString());
        result.append(mFlexNodeStyle.toString());
        result.append(resultToString());

        if (getChildCount() == 0) {
            return;
        }

        result.append(", children: [\n");
        for (int i = 0; i < getChildCount(); i++) {
            getChildAt(i).toStringWithIndentation(result, level + 1);
            result.append("\n");
        }
        result.append(indentation + "]");
    }

    private native void nativeFlexNodeNodeSetHasBaselineFunc(long nativeFlexNode, boolean hasMeasureFunc);

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        this.toStringWithIndentation(sb, 0);
        return sb.toString();
    }

    private native long nativeFlexNodeNew();

    public FlexNode() {
        mNativeFlexNode = nativeFlexNodeNew();
        if (mNativeFlexNode == 0) {
            throw new IllegalStateException("Failed to allocate native memory");
        }
        mFlexNodeStyle = new FlexNodeStyle(mNativeFlexNode);
        reset();
    }

    private native void nativeFlexNodeFree(long nativeFlexNode);

    protected void finalize() throws Throwable {
        try {
            nativeFlexNodeFree(mNativeFlexNode);
            mFlexNodeStyle = null;
        } finally {
            super.finalize();
        }
    }

    private int TotalChildCount() {
        if (mChildren == null)
            return 0;

        int count = getChildCount();
        for (int i = 0; i < mChildren.size(); i++)
            count = count + mChildren.get(i).TotalChildCount();
        return count;
    }

    private int TotalDirtyChildCount() {
        if (mChildren == null)
            return 0;

        int count = getDirtyChildCount();
        for (int i = 0; i < mChildren.size(); i++)
            count = count + mChildren.get(i).TotalDirtyChildCount();
        return count;
    }

    public int getChildCount() {
        return mChildren == null ? 0 : mChildren.size();
    }

    public int getDirtyChildCount() {

        if (mChildren == null)
            return 0;

        int count = 0;
        for (int i = 0; i < mChildren.size(); i++) {
            if (mChildren.get(i).isDirty()) {
                count++;
            }
        }
        return count;

    }

    public FlexNode getChildAt(int i) {
        return mChildren.get(i);
    }

    private native void nativeFlexNodeInsertChild(long nativeFlexNode, long childPointer, int index);

    public void addChildAt(FlexNode child, int i) {
        if (child.mParent != null) {
            throw new IllegalStateException("Child already has a parent, it must be removed first.");
        }

        if (mChildren == null) {
            mChildren = new ArrayList<FlexNode>(4);
        }
        mChildren.add(i, child);
        child.mParent = this;
        nativeFlexNodeInsertChild(mNativeFlexNode, child.mNativeFlexNode, i);
    }

    private native void nativeFlexNodeRemoveChild(long nativeFlexNode, long childPointer);

    public FlexNode removeChildAt(int i) {

        final FlexNode child = mChildren.remove(i);
        child.mParent = null;
        nativeFlexNodeRemoveChild(mNativeFlexNode, child.mNativeFlexNode);
        return child;
    }

    public FlexNode getParent() {
        return mParent;
    }

    public int indexOf(FlexNode child) {
        return mChildren == null ? -1 : mChildren.indexOf(child);
    }

    private native void nativeFlexNodeCalculateLayout(long nativeFlexNode, float width, float height,
                                                      long[] nativeNodes, FlexNode[] nodes, int direction);

    public void calculateLayout(float width, float height, FlexDirection direction) {
        //long startTime = System.currentTimeMillis();
        //Log.e("layout", "3calculateLayout time start");
        long[] nativeNodes;
        FlexNode[] nodes;
        ArrayList<FlexNode> n = new ArrayList<>();
        n.add(this);
        for (int i = 0; i < n.size(); ++i) {
            List<FlexNode> children = n.get(i).mChildren;
            if (children != null) {
                n.addAll(children);
            }
        }
        nodes = n.toArray(new FlexNode[n.size()]);
        nativeNodes = new long[nodes.length];
        for (int i = 0; i < nodes.length; ++i) {
            nativeNodes[i] = nodes[i].mNativeFlexNode;
        }

        //Log.e("layout", "calculateLayout time:"+ (System.currentTimeMillis() - startTime));
        nativeFlexNodeCalculateLayout(mNativeFlexNode, width, height,
                nativeNodes, nodes, direction.ordinal());
    }

    private native float nativeFlexNodeGetWidth(long nativeFlexNode);

    private native void nativeFlexNodeSetWidth(long nativeFlexNode, float Width);

    private native float nativeFlexNodeGetHeight(long nativeFlexNode);

    private native void nativeFlexNodeSetHeight(long nativeFlexNode, float Height);


    private native float nativeFlexNodeGetTop(long nativeFlexNode);

    private native void nativeFlexNodeSetTop(long nativeFlexNode, float Top);


    private native float nativeFlexNodeGetLeft(long nativeFlexNode);

    private native void nativeFlexNodeSetLeft(long nativeFlexNode, float Left);


    private native float nativeFlexNodeGetRight(long nativeFlexNode);

    private native void nativeFlexNodeSetRight(long nativeFlexNode, float Right);


    private native float nativeFlexNodeGetBottom(long nativeFlexNode);

    private native void nativeFlexNodeSetBottom(long nativeFlexNode, float Bottom);

    private native float nativeFlexNodeGetMarginLeft(long nativeFlexNode);

    private native void nativeFlexNodeSetMarginLeft(long nativeFlexNode, float MarginLeft);


    private native float nativeFlexNodeGetMarginTop(long nativeFlexNode);

    private native void nativeFlexNodeSetMarginTop(long nativeFlexNode, float MarginTop);


    private native float nativeFlexNodeGetMarginRight(long nativeFlexNode);

    private native void nativeFlexNodeSetMarginRight(long nativeFlexNode, float MarginRight);

    private native float nativeFlexNodeGetMarginBottom(long nativeFlexNode);

    private native void nativeFlexNodeSetMarginBottom(long nativeFlexNode, float MarginBottom);


    private native float nativeFlexNodeGetPaddingLeft(long nativeFlexNode);

    private native void nativeFlexNodeSetPaddingLeft(long nativeFlexNode, float PaddingLeft);


    private native float nativeFlexNodeGetPaddingTop(long nativeFlexNode);

    private native void nativeFlexNodeSetPaddingTop(long nativeFlexNode, float PaddingTop);


    private native float nativeFlexNodeGetPaddingRight(long nativeFlexNode);

    private native void nativeFlexNodeSetPaddingRight(long nativeFlexNode, float PaddingRight);

    private native float nativeFlexNodeGetPaddingBottom(long nativeFlexNode);

    private native void nativeFlexNodeSetPaddingBottom(long nativeFlexNode, float PaddingBottom);


    private native float nativeFlexNodeGetBorderLeft(long nativeFlexNode);

    private native void nativeFlexNodeSetBorderLeft(long nativeFlexNode, float BorderLeft);


    private native float nativeFlexNodeGetBorderTop(long nativeFlexNode);

    private native void nativeFlexNodeSetBorderTop(long nativeFlexNode, float BorderTop);


    private native float nativeFlexNodeGetBorderRight(long nativeFlexNode);

    private native void nativeFlexNodeSetBorderRight(long nativeFlexNode, float BorderRight);


    private native float nativeFlexNodeGetBorderBottom(long nativeFlexNode);

    private native void nativeFlexNodeSetBorderBottom(long nativeFlexNode, float BorderBottom);


    private Object mData;

    public void setData(Object data) {
        mData = data;
    }

    public Object getData() {
        return mData;
    }

    private native void nativeFlexNodeNodeMarkDirty(long nativePointer);

    public void dirty() {
        nativeFlexNodeNodeMarkDirty(mNativeFlexNode);
    }

    private native boolean nativeFlexNodeNodeIsDirty(long nativePointer);

    public boolean isDirty() {
        return nativeFlexNodeNodeIsDirty(mNativeFlexNode);
    }

    private native void nativeFlexNodeNodeSetHasMeasureFunc(long nativePointer, boolean hasMeasureFunc);

    public final long measure(float width, int widthMode, float height, int heightMode) {
        if (!isMeasureDefined()) {
            throw new RuntimeException("Measure function isn't defined!");
        }

        return mMeasureFunction.measure(
                this,
                width,
                FlexMeasureMode.fromInt(widthMode),
                height,
                FlexMeasureMode.fromInt(heightMode));
    }

    public boolean isMeasureDefined() {
        return mMeasureFunction != null;
    }

    public float getLayoutX() {
        return mLeft;
    }

    public float getLayoutY() {
        return mTop;
    }

    public float getLayoutWidth() {
        return mWidth;
    }

    public float getLayoutHeight() {
        return mHeight;
    }

    private MeasureFunction mMeasureFunction = null;

    @Override
    public void setMeasureFunction(
            MeasureFunction measureFunction) {
        // TODO Auto-generated method stub
        mMeasureFunction = measureFunction;
        nativeFlexNodeNodeSetHasMeasureFunc(mNativeFlexNode, measureFunction != null);
    }

    @Override
    public void calculateLayout() {
        // TODO Auto-generated method stub
        // 1 == FlexDirection::LTR
        calculateLayout(FlexConstants.UNDEFINED, FlexConstants.UNDEFINED, getStyleDirection());
    }

    private native void nativeFlexNodemarkHasNewLayout(long nativeFlexNode);


    private native boolean nativeFlexNodehasNewLayout(long nativeFlexNode);

    @Override
    public boolean hasNewLayout() {
        // TODO Auto-generated method stub
        return mHasNewLayout;
    }

    private native void nativeFlexNodemarkLayoutSeen(long nativeFlexNode);

    @Override
    public void markLayoutSeen() {
        // TODO Auto-generated method stub
        mHasNewLayout = false;
        nativeFlexNodemarkLayoutSeen(mNativeFlexNode);
    }

    @Override
    public boolean valuesEqual(float f1, float f2) {
        // TODO Auto-generated method stub
        return FloatUtil.floatsEqual(f1, f2);
    }

    @Override
    public FlexDirection getStyleDirection() {
        // TODO Auto-generated method stub
        return Style().getDirection();
    }

    @Override
    public void setDirection(FlexDirection direction) {
        // TODO Auto-generated method stub
        Style().setDirection(direction);
    }

    public FlexDirection getDirection() {
        // TODO Auto-generated method stubnativeFlexNodereset
        return Style().getDirection();
    }

    @Override
    public FlexCSSDirection getFlexDirection() {
        // TODO Auto-generated method stub
        return Style().getFlexDirection();
    }

    @Override
    public void setFlexDirection(FlexCSSDirection flexDirection) {
        // TODO Auto-generated method stub
        Style().setFlexDirection(flexDirection);
    }

    @Override
    public FlexJustify getJustifyContent() {
        // TODO Auto-generated method stubnativeFlexNodereset
        return Style().getJustifyContent();
    }

    @Override
    public void setJustifyContent(FlexJustify justifyContent) {
        // TODO Auto-generated method stub
        Style().setJustifyContent(justifyContent);
    }

    @Override
    public FlexAlign getAlignItems() {
        // TODO Auto-generated method stub
        return Style().getAlignItems();
    }

    @Override
    public void setAlignItems(FlexAlign alignItems) {
        // TODO Auto-generated method stub
        Style().setAlignItems(alignItems);
    }

    @Override
    public FlexAlign getAlignSelf() {
        // TODO Auto-generated method stub
        return Style().getAlignSelf();
    }

    @Override
    public void setAlignSelf(FlexAlign alignSelf) {
        // TODO Auto-generated method stub
        Style().setAlignSelf(alignSelf);
    }

    @Override
    public FlexAlign getAlignContent() {
        // TODO Auto-generated method stub
        return Style().getAlignContent();
    }

    @Override
    public void setAlignContent(FlexAlign alignContent) {
        // TODO Auto-generated method stub
        Style().setAlignContent(alignContent);
    }

    @Override
    public FlexPositionType getPositionType() {
        // TODO Auto-generated method stub
        return Style().getPositionType();
    }

    @Override
    public void setPositionType(FlexPositionType positionType) {
        // TODO Auto-generated method stub
        Style().setPositionType(positionType);
    }

    @Override
    public void setWrap(FlexWrap flexWrap) {
        // TODO Auto-generated method stub
        Style().setWrap(flexWrap);
    }

    @Override
    public void setFlex(float flex) {
        // TODO Auto-generated method stubnativeFlexNodereset
        Style().setFlex(flex);
    }

    @Override
    public void setDisplay(FlexNodeStyle.Display display) {
        Style().setDisplay(display);
    }


    @Override
    public float getFlexGrow() {
        // TODO Auto-generated method stub
        return Style().getFlexGrow();
    }

    @Override
    public void setFlexGrow(float flexGrow) {
        // TODO Auto-generated method stub
        Style().setFlexGrow(flexGrow);
    }

    @Override
    public float getFlexShrink() {
        // TODO Auto-generated method stub		return;
        return Style().getFlexShrink();
    }

    @Override
    public void setFlexShrink(float flexShrink) {
        // TODO Auto-generated method stub
        Style().setFlexShrink(flexShrink);
    }

    @Override
    public float getFlexBasis() {
        // TODO Auto-generated method stub
        return Style().getFlexBasis().value();
    }

    @Override
    public void setFlexBasis(float flexBasis) {
        // TODO Auto-generated method stub
        Style().setFlexBasis(flexBasis);
    }

    @Override
    public float getMargin(int spacingType) {
        // TODO Auto-generated method stub
        switch (Edge.fromInt(spacingType)) {
            case EDGE_LEFT:
            case EDGE_START:
                return mMarginLeft;
            case EDGE_TOP:
                return mMarginTop;
            case EDGE_RIGHT:
            case EDGE_END:
                return mMarginRight;
            case EDGE_BOTTOM:
                return mMarginBottom;
            default:
                return Style().getMargin(Edge.fromInt(spacingType)).value();
        }
    }

    @Override
    public void setMargin(int spacingType, float margin) {
        // TODO Auto-generated method stub
        mEdgeSetFlag |= MARGIN;
        Style().setMargin(Edge.fromInt(spacingType), margin);
    }

    @Override
    public float getPadding(int spacingType) {
        // TODO Auto-generated method stub
        //we did not support RTL Layout for text,
        //so EDGE_START == EDGE_LEFT
        //EDGE_END == EDGE_RIGHT
        //ianwang 2018.3.8.
        switch (Edge.fromInt(spacingType)) {
            case EDGE_LEFT:
            case EDGE_START:
                return mPaddingLeft;
            case EDGE_TOP:
                return mPaddingTop;
            case EDGE_RIGHT:
            case EDGE_END:
                return mPaddingRight;
            case EDGE_BOTTOM:
                return mPaddingBottom;
            default:
                return Style().getPadding(Edge.fromInt(spacingType)).value();
        }
    }

    @Override
    public void setPadding(int spacingType, float padding) {
        // TODO Auto-generated method stub
        mEdgeSetFlag |= PADDING;
        Style().setPadding(Edge.fromInt(spacingType), padding);
    }

    @Override
    public float getBorder(int spacingType) {
        // TODO Auto-generated method stub
        switch (Edge.fromInt(spacingType)) {
            case EDGE_LEFT:
            case EDGE_START:
                return mBorderLeft;
            case EDGE_TOP:
                return mBorderTop;
            case EDGE_RIGHT:
            case EDGE_END:
                return mBorderRight;
            case EDGE_BOTTOM:
                return mBorderBottom;
            default:
                return Style().getBorder(Edge.fromInt(spacingType)).value();
        }
    }

    @Override
    public void setBorder(int spacingType, float border) {
        // TODO Auto-generated method stub
        mEdgeSetFlag |= BORDER;
        Style().setBorder(Edge.fromInt(spacingType), border);
    }

    @Override
    public float getPosition(int spacingType) {
        // TODO Auto-generated method stub
        return Style().getPosition(Edge.fromInt(spacingType)).value();
    }

    @Override
    public void setPosition(int spacingType, float position) {
        // TODO Auto-generated method stub
        mHasSetPosition = true;
        Style().setPosition(Edge.fromInt(spacingType), position);
    }

    @Override
    public float getStyleWidth() {
        // TODO Auto-generated method stub
        return Style().getWidth().value();
    }

    @Override
    public void setStyleWidth(float width) {
        // TODO Auto-generated method stub
        Style().setWidth(width);
    }

    @Override
    public float getStyleHeight() {
        // TODO Auto-generated method stub
        return Style().getHeight().value();
    }

    @Override
    public void setStyleHeight(float height) {
        // TODO Auto-generated method stub
        Style().setHeight(height);
    }

    @Override
    public float getStyleMaxWidth() {
        // TODO Auto-generated method stub
        return Style().getMaxWidth().value();
    }

    @Override
    public void setStyleMaxWidth(float maxWidth) {
        // TODO Auto-generated method stub
        Style().setMaxWidth(maxWidth);
    }

    @Override
    public float getStyleMinWidth() {
        // TODO Auto-generated method stub
        return Style().getMinWidth().value();
    }

    @Override
    public void setStyleMinWidth(float minWidth) {
        // TODO Auto-generated method stub
        Style().setMinWidth(minWidth);
    }

    @Override
    public float getStyleMaxHeight() {
        // TODO Auto-generated method stub
        return Style().getMaxHeight().value();
    }

    @Override
    public void setStyleMaxHeight(float maxHeight) {
        // TODO Auto-generated method stub
        Style().setMaxHeight(maxHeight);
    }

    @Override
    public float getStyleMinHeight() {
        // TODO Auto-generated method stub
        return Style().getMinHeight().value();
    }

    @Override
    public void setStyleMinHeight(float minHeight) {
        // TODO Auto-generated method stub
        Style().setMinHeight(minHeight);
    }

    @Override
    public FlexDirection getLayoutDirection() {
        // TODO Auto-generated method stub
        return Style().getDirection();
    }

    @Override
    public FlexOverflow getOverflow() {
        // TODO Auto-generated method stub
        return Style().getOverflow();
    }

    @Override
    public void setOverflow(FlexOverflow overflow) {
        // TODO Auto-generated method stub
        Style().setOverflow(overflow);
    }

    private native void nativeFlexNodereset(long nativeFlexNode);

    @Override
    public void reset() {
        // TODO Auto-generated method stub
        if (mParent != null || (mChildren != null && mChildren.size() > 0)) {
            return;
        }
        nativeFlexNodereset(mNativeFlexNode);
        this.setDirection(FlexDirection.LTR);
        this.setFlexDirection(FlexCSSDirection.COLUMN);
        this.setJustifyContent(FlexJustify.FLEX_START);
        this.setAlignContent(FlexAlign.FLEX_START);
        this.setAlignItems(FlexAlign.STRETCH);
        this.setAlignSelf(FlexAlign.AUTO);
        this.setPositionType(FlexPositionType.RELATIVE);
        this.setWrap(FlexWrap.NOWRAP);
        this.setOverflow(FlexOverflow.VISIBLE);
        this.setFlexGrow(0);
        this.setFlexShrink(0);
        this.setFlexBasis(FlexConstants.UNDEFINED);
        mMeasureFunction = null;

        mEdgeSetFlag = 0;
        mHasSetPosition = false;
        mHasNewLayout = true;

        mWidth = Float.NaN;
        mHeight = Float.NaN;
        mTop = Float.NaN;
        mLeft = Float.NaN;
        mMarginLeft = 0;
        mMarginTop = 0;
        mMarginRight = 0;
        mMarginBottom = 0;
        mPaddingLeft = 0;
        mPaddingTop = 0;
        mPaddingRight = 0;
        mPaddingBottom = 0;
        mBorderLeft = 0;
        mBorderTop = 0;
        mBorderRight = 0;
        mBorderBottom = 0;
    }
}
