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
package com.tencent.mtt.hippy.uimanager;

import android.text.TextUtils;
import android.util.SparseArray;
import android.view.View;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.*;

@SuppressWarnings({"deprecation","unused"})
public class RenderNode
{
	final int mId;
	int mX;
	int mY;
	int mWidth;
	int mHeight;

	boolean				mHasUpdateLayout		= false;
	HippyMap			mProps					= null;
	HippyMap			mPropsToUpdate;
	final String				mClassName;
	final List<RenderNode>	mChildren				= new ArrayList<>();

	List<MoveHolder>	mMoveHolders			= null;

	SparseArray<Integer> mDeletedIdIndexMap;

	List<Promise>		mMeasureInWindows		= null;
	Object				mTextExtra;
	Object				mTextExtraUpdate;

	HippyRootView		mRootView;

	final ControllerManager	mComponentManager;


	RenderNode			mParent					= null;

	boolean				mIsDelete				= false;
	boolean				mIsRootHasDelete		= false;


	boolean				mIsLazyLoad				= false;

	boolean				mNotifyManageChildren	= false;

	public boolean      mHasSetDteblId          = false;

	List<UIFunction>	mUIFunction				= null;

	public RenderNode getParent()
	{
		return mParent;
	}

	int indexFromParent()
	{
		if (mParent != null)
		{
			return mParent.mChildren.indexOf(this);
		}
		return 0;
	}

	@Override
	public String toString()
	{
		StringBuilder stringBuilder = new StringBuilder();
		printChild(this, stringBuilder);
		return stringBuilder.toString();
	}

	void printChild(RenderNode renderNode, StringBuilder stringBuilder)
	{
		stringBuilder.append(" [Id:").append(renderNode.getId()).append(renderNode.mClassName);
		for (RenderNode child : renderNode.mChildren)
		{
			printChild(child, stringBuilder);
		}
		stringBuilder.append("]");
	}

	public RenderNode(int mId, HippyMap mPropsToUpdate, String className, HippyRootView rootView, ControllerManager componentManager,
			boolean isLazyLoad)
	{
		this.mId = mId;
		this.mPropsToUpdate = mPropsToUpdate;
		this.mClassName = className;
		this.mRootView = rootView;
		this.mComponentManager = componentManager;
		this.mIsLazyLoad = isLazyLoad;
		this.mProps = mPropsToUpdate;
	}

	public void addDeleteId(int id, RenderNode node)
	{
		if (shouldUpdateView())
		{
			if (mDeletedIdIndexMap == null)
				mDeletedIdIndexMap = new SparseArray<>();
			mDeletedIdIndexMap.put(id, mChildren.indexOf(node));
		}
	}

	public int getId()
	{
		return mId;
	}


	public View createViewRecursive()
	{
		View view = createView();
		mHasUpdateLayout = true;
		mTextExtraUpdate = mTextExtra;
		for (RenderNode renderNode : mChildren)
		{
			renderNode.createViewRecursive();
		}
		return view;
	}

	public void updateViewRecursive()
	{
		update();

		for (RenderNode renderNode : mChildren)
		{
			renderNode.updateViewRecursive();
		}
	}


	public boolean removeChild(RenderNode uiNode)
	{
		uiNode.mParent = null;
		return mChildren.remove(uiNode);
	}

	void addChild(RenderNode uiNode, int index)
	{
		mChildren.add(index, uiNode);
		uiNode.mParent = this;
	}

	void setLazy(RenderNode node, boolean isLazy)
	{
		node.mIsLazyLoad = isLazy;
		for (int i = 0; i < node.getChildCount(); i++)
		{
			setLazy(node.getChildAt(i), isLazy);
		}
	}

	public void setLazy(boolean isLazy)
	{
		setLazy(this, isLazy);
	}

	public void remove(int index)
	{
		RenderNode uiNode = mChildren.remove(index);
		uiNode.mParent = null;
	}

	public RenderNode getChildAt(int index)
	{
		if (0 <= index && index < getChildCount())
		{
			return mChildren.get(index);
		}
		return null;
	}

	public int getChildCount()
	{
		return mChildren.size();
	}

	public RenderNode(int id, String className, ControllerManager componentManager)
	{
		this.mId = id;
		this.mClassName = className;
		this.mComponentManager = componentManager;
	}

	public void updateNode(HippyMap map)
	{
		if (mPropsToUpdate != null)
		{
			//mProps do not syc to UI
			HippyMap hippyMap = DiffUtils.diffProps(mPropsToUpdate, map, 0);
			if (hippyMap != null && hippyMap.size() > 0)
			{
				Set<String> sets = hippyMap.keySet();
				for (String key : sets)
				{
					if (TextUtils.equals(NodeProps.STYLE, key))
					{
						HippyMap styles = hippyMap.getMap(key);
						if (styles != null)
						{
							HippyMap stylesToUpdate = mPropsToUpdate.getMap(key);
							if (stylesToUpdate == null)
							{
								stylesToUpdate = new HippyMap();
							}
							Set<String> styleKeys = styles.keySet();
							for (String styleKey : styleKeys)
							{
								stylesToUpdate.pushObject(styleKey, styles.get(styleKey));
							}

							mPropsToUpdate.pushObject(key, stylesToUpdate);
						}
					}
					else
					{
						mPropsToUpdate.pushObject(key, hippyMap.get(key));
					}

				}
			}
		}
		else
		{
			mPropsToUpdate = DiffUtils.diffProps(mProps, map, 0);
		}

		mProps = map;
	}

	public HippyMap getProps()
	{
		return mProps;
	}

	private boolean shouldCreateView()
	{
		return !mIsLazyLoad && !mComponentManager.hasView(mId);
	}

	public String getClassName()
	{
		return mClassName;
	}

	public int getX()
	{
		return mX;
	}

	public int getY()
	{
		return mY;
	}

	public int getWidth()
	{
		return mWidth;
	}

	public int getHeight()
	{
		return mHeight;
	}

	final List<RenderNode>	mChildPendingList	= new ArrayList<>();

	public View createView()
	{
		//delete is first  when js call delete  and create the same node  if delete is not call the ui cannot create
		if (mDeletedIdIndexMap != null && mDeletedIdIndexMap.size() > 0)
		{
			for (int i = 0; i < mDeletedIdIndexMap.size(); i++) {
				int key = mDeletedIdIndexMap.keyAt(i);
				mComponentManager.deleteChild(mId, mDeletedIdIndexMap.keyAt(i), mDeletedIdIndexMap.get(key));
			}
			mDeletedIdIndexMap.clear();
			mNotifyManageChildren = true;
		}

		if (mIsDelete && TextUtils.equals(NodeProps.ROOT_NODE, mClassName) && !mIsRootHasDelete)
		{
			mIsRootHasDelete = true;
			mComponentManager.deleteRootView(mId);
		}
		if (shouldCreateView() && !TextUtils.equals(NodeProps.ROOT_NODE, mClassName) && mParent != null)
		{
			mPropsToUpdate = null;
			mParent.addChildToPendingList(this);
			return mComponentManager.createView(mRootView, mId, mClassName, mProps);

		}
		return null;
	}

	private boolean shouldUpdateView()
	{
		return mComponentManager.hasView(mId);
	}


	protected void addChildToPendingList(RenderNode renderNode)
	{
		mChildPendingList.add(renderNode);
	}

	public void update()
	{
		LogUtils.d("UINode", "mId" + mId + " updateStyle");

		//		long time = System.currentTimeMillis();
		if (shouldUpdateView())
		{
			if (mChildPendingList.size() > 0)
			{
				Collections.sort(mChildPendingList, new Comparator<RenderNode>()
				{
					@Override
					public int compare(RenderNode o1, RenderNode o2)
					{
						return o1.indexFromParent() < o2.indexFromParent() ? -1 : 0;
					}
				});
				for (int i = 0; i < mChildPendingList.size(); i++)
				{
					RenderNode renderNode = mChildPendingList.get(i);
					mComponentManager.addChild(mId, renderNode.getId(), renderNode.indexFromParent());
				}
				mChildPendingList.clear();
				mNotifyManageChildren = true;
			}
			if (mPropsToUpdate != null)
			{
				mComponentManager.updateView(mId, mClassName, mPropsToUpdate);
				mPropsToUpdate = null;
			}
			if (mMoveHolders != null)
			{
				for (MoveHolder moveHolder : mMoveHolders)
				{
					Collections.sort(moveHolder.mMoveIds, new Comparator<RenderNode>()
					{
						@Override
						public int compare(RenderNode o1, RenderNode o2)
						{
							return o1.indexFromParent() < o2.indexFromParent() ? -1 : 0;
						}
					});

					for (int j = 0; j < moveHolder.mMoveIds.size(); j++)
					{
						RenderNode moveId = moveHolder.mMoveIds.get(j);
						mComponentManager.move(moveId.getId(), moveHolder.mMove2Id, moveId.indexFromParent());
					}
				}
				mMoveHolders = null;
			}

			if (mHasUpdateLayout && !TextUtils.equals(NodeProps.ROOT_NODE, mClassName))
			{
				mComponentManager.updateLayout(mClassName, mId, mX, mY, mWidth, mHeight);
				LogUtils.d("UINode", "mId" + mId + " updateLayout");
				mHasUpdateLayout = false;
			}
			if (mTextExtraUpdate != null)
			{
				mComponentManager.updateExtra(mId, mClassName, mTextExtraUpdate);
				mTextExtraUpdate = null;
			}

			if (mUIFunction != null && mUIFunction.size() > 0)
			{
				for (int i = 0; i < mUIFunction.size(); i++)
				{
					UIFunction uiFunction = mUIFunction.get(i);
					mComponentManager.dispatchUIFunction(mId, mClassName, uiFunction.mFunctionName, uiFunction.mParameter, uiFunction.mPromise);
				}
				mUIFunction.clear();
				mUIFunction = null;
			}
			if (mMeasureInWindows != null && mMeasureInWindows.size() > 0)
			{
				for (int i = 0; i < mMeasureInWindows.size(); i++)
				{
					Promise promise = mMeasureInWindows.get(i);
					mComponentManager.measureInWindow(mId, promise);
				}
				mMeasureInWindows.clear();
				mMeasureInWindows = null;

			}
			if (mNotifyManageChildren)
			{
				manageChildrenComplete();
				mNotifyManageChildren = false;
			}

		}
		LogUtils.d("UINode", "mId" + mId + " end updateStyle");
	}



	public void updateLayout(int x, int y, int w, int h)
	{
		this.mX = x;
		this.mY = y;
		this.mWidth = w;
		this.mHeight = h;
		mHasUpdateLayout = true;
	}

	public void measureInWindow(Promise promise)
	{
		if (mMeasureInWindows == null)
		{
			mMeasureInWindows = new ArrayList<>();
		}
		mMeasureInWindows.add(promise);
	}


	static class MoveHolder
	{

		public MoveHolder(List<RenderNode> moveRenders, int mMove2Id)
		{
			this.mMoveIds = moveRenders;
			this.mMove2Id = mMove2Id;
		}

		final List<RenderNode>	mMoveIds;
		final int					mMove2Id;
	}

	public void move(List<RenderNode> moveIds, int move2Id)
	{
		if (shouldUpdateView())
		{
			if (mMoveHolders == null)
			{
				mMoveHolders = new ArrayList<>();
			}
			mMoveHolders.add(new MoveHolder(moveIds, move2Id));
		}
	}

	public void updateExtra(Object object)
	{
		mTextExtra = object;
		mTextExtraUpdate = object;
	}


	public void setDelete(boolean b)
	{
		mIsDelete = b;
	}

	public boolean isDelete()
	{
		return mIsDelete;
	}

	public void batchComplete()
	{
		if (!mIsLazyLoad && !mIsDelete)
		{
			mComponentManager.onBatchComplete(mClassName, mId);
		}
	}

	public void manageChildrenComplete()
	{
		if (!mIsLazyLoad && !mIsDelete)
		{
			mComponentManager.onManageChildComplete(mClassName, mId);
		}
	}

	static class UIFunction
	{
		public UIFunction(String functionName, HippyArray parameter, Promise promise)
		{
			this.mFunctionName = functionName;
			this.mParameter = parameter;
			this.mPromise = promise;
		}

		final String		mFunctionName;
		final HippyArray	mParameter;
		final Promise 	mPromise;
	}


	public void dispatchUIFunction(String functionName, HippyArray parameter, Promise promise)
	{
		if (mUIFunction == null)
		{
			mUIFunction = new ArrayList<>();
		}
		mUIFunction.add(new UIFunction(functionName, parameter, promise));
	}
}
