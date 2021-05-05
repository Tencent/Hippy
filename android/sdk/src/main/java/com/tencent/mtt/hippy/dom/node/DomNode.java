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
package com.tencent.mtt.hippy.dom.node;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.smtt.flexbox.FlexNode;

@SuppressWarnings("deprecation")
public class DomNode extends FlexNode
{

	private int				mID;
	private String			mViewClassName;
	private boolean			mNodeUpdated	= true;

	private boolean			mIsJustLayout	= false;

	float					mLastX, mLastY, mLastWidth, mLastHeight;

	HippyMap				mTotalProps		= null;


	boolean					mIsLazy			= false;

	public void setLazy(boolean lazy)
	{
		this.mIsLazy = lazy;
	}

	public boolean isLazy()
	{
		return mIsLazy;
	}


	public boolean shouldUpdateLayout(float x, float y)
	{

		boolean res = !(mLastX == x && mLastY == y && mLastWidth == getLayoutWidth() && mLastHeight == getLayoutHeight());

		if (res)
		{
			mLastX = x;
			mLastY = y;
			mLastWidth = getLayoutWidth();
			mLastHeight = getLayoutHeight();
		}

		return res;
	}

	protected void toStringWithIndentation(StringBuilder result, int level)
	{
		// Spaces and tabs are dropped by IntelliJ logcat integration, so rely on __ instead.
		StringBuilder indentation = new StringBuilder();
		for (int i = 0; i < level; ++i)
		{
			indentation.append("__");
		}

		result.append(indentation.toString());
		result.append("id:").append(getId());
		result.append(" className:").append(getViewClass()).append(" ");
		//		result.append(mFlexNodeStyle.toString());
		result.append(resultToString());

		if (getChildCount() == 0)
		{
			return;
		}

		result.append(", children: [\n");
		for (int i = 0; i < getChildCount(); i++)
		{
			getChildAt(i).toStringWithIndentation(result, level + 1);
			result.append("\n");
		}
		result.append(indentation).append("]");
	}

	public String toString()
	{
		StringBuilder sb = new StringBuilder();
		this.toStringWithIndentation(sb, 0);
		return sb.toString();
	}

	@Override
	public DomNode getParent()
	{
		return (DomNode) super.getParent();
	}

	public HippyMap getTotalProps()
	{
		return mTotalProps;
	}

	public void setProps(HippyMap props)
	{
		mTotalProps = props;
	}

	@Override
	public void dirty()
	{
		if (!isVirtual())
		{
			super.dirty();
		}
	}

	@SuppressWarnings("BooleanMethodIsAlwaysInverted")
	public boolean isVirtual()
	{
		return false;
	}

	@Override
	public DomNode getChildAt(int i)
	{
		return (DomNode) super.getChildAt(i);
	}

	public final String getViewClass()
	{
		return mViewClassName;
	}


	public final boolean hasUpdates()
	{
		return mNodeUpdated || hasNewLayout() || isDirty();
	}

	public final void markUpdateSeen()
	{
		mNodeUpdated = false;
		if (hasNewLayout())
		{
			markLayoutSeen();
		}
	}

	public void markUpdated()
	{
		if (mNodeUpdated)
		{
			return;
		}
		mNodeUpdated = true;
		DomNode parent = getParent();
		if (parent != null)
		{
			parent.markUpdated();
		}
	}

	public void setDefaultPadding(int spacingType, float padding)
	{
		super.setPadding(spacingType, padding);
	}

	@Override
	public void addChildAt(FlexNode child, int i)
	{
		super.addChildAt(child, i);
		markUpdated();
	}

	@Override
	public DomNode removeChildAt(int i)
	{
		DomNode removed = (DomNode) super.removeChildAt(i);
		markUpdated();

		return removed;
	}

	public void setIsJustLayout(boolean mIsLayOutOnly)
	{
		this.mIsJustLayout = mIsLayOutOnly;
	}

	public boolean isJustLayout()
	{
		return this.mIsJustLayout;
	}


	public void layoutBefore(HippyEngineContext context)
	{
	}

	public void layoutAfter(HippyEngineContext context)
	{
	}

	public final int getId()
	{
		return mID;
	}

	public void setId(int id)
	{
		mID = id;
	}

	public void setViewClassName(String viewClassName)
	{
		mViewClassName = viewClassName;
	}

	public void updateProps(HippyMap props)
	{
	}

	public boolean shouldNotifyOnLayout()
	{
		return mShouldNotifyOnlayout;
	}

	boolean	mShouldNotifyOnlayout	= false;

	@SuppressWarnings("unused")
	public void setShouldNotifyOnLayout(boolean shouldNotifyOnLayout)
	{
		this.mShouldNotifyOnlayout = shouldNotifyOnLayout;
	}
}
