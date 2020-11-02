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

import static com.tencent.mtt.hippy.uimanager.HippyViewController.DT_EBLID;

import android.text.TextUtils;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * @author: edsheng
 * @date: 2017/12/7 15:01
 * @version: V1.0
 */

public class DiffUtils
{

	public static ArrayList<PatchType> diff(RenderNode from, RenderNode toNoe)
	{
		ArrayList<PatchType> patchTypes = new ArrayList<>();
		if (from.getId() == toNoe.getId())
		{
			//when first create view  form eq toNode
			return patchTypes;
		}

		try
		{
			diffFromNode(from, toNoe, patchTypes);
			diffToNode(from, toNoe, patchTypes);
		}
		catch (Throwable e)
		{

		}

		return patchTypes;
	}

	private static void diffToNode(RenderNode from, RenderNode toNoe, ArrayList<PatchType> patchTypes)
	{
		if (from == null || toNoe == null)
		{
			return;
		}

		for (int i = 0; i < toNoe.getChildCount(); i++)
		{
			if (i >= from.getChildCount())
			{
				RenderNode toNoeChild = toNoe.getChildAt(i);
				patchTypes.add(new PatchType(Patch.TYPE_CREATE, new CreatePatch(toNoeChild)));
				if (TextUtils.equals(toNoeChild.getClassName(), NodeProps.TEXT_CLASS_NAME))
				{
					patchTypes.add(new PatchType(Patch.TYPE_EXTRA, new ExtraPatch(toNoeChild.mId, toNoeChild.mTextExtra, toNoeChild.getClassName())));
				}

				patchTypes.add(new PatchType(Patch.TYPE_LAYOUT, new LayoutPatch(toNoeChild.mX, toNoeChild.mY, toNoeChild.mHeight, toNoeChild
						.getWidth(), toNoeChild.mId, toNoeChild.mParent.mId, toNoeChild.mClassName)));
			}
			else
			{
				diffToNode(from.getChildAt(i), toNoe.getChildAt(i), patchTypes);
			}

		}
	}


	private static void diffFromNode(RenderNode from, RenderNode toNode, ArrayList<PatchType> patchTypes)
	{
		if (TextUtils.equals(from.getClassName(), toNode.getClassName()))
		{
			patchTypes.add(new PatchType(Patch.TYPE_REPLACE_ID, new ReplacePatch(from.getId(), toNode.getId())));


			HippyMap updateProps = diffProps(from.getProps(), toNode.getProps(), 0);
			if (updateProps != null && updateProps.size() >= 1)
			{
				patchTypes.add(new PatchType(Patch.TYPE_PROPS, new PropsPatch(updateProps, toNode.getId(), toNode.getClassName())));
			}

			LayoutPatch lp = diffLayout(from, toNode);
			if (lp != null)
			{
				patchTypes.add(new PatchType(Patch.TYPE_LAYOUT, lp));
			}

			ExtraPatch extraPatch = diffExtra(from, toNode);
			if (extraPatch != null)
			{
				patchTypes.add(new PatchType(Patch.TYPE_EXTRA, extraPatch));
			}
		}

		for (int i = 0; i < from.getChildCount(); i++)
		{
			RenderNode fromChild = from.getChildAt(i);
			RenderNode toChild = null;
			if (i < toNode.getChildCount())
			{
				toChild = toNode.getChildAt(i);
			}
			if (toChild != null && TextUtils.equals(fromChild.getClassName(), toChild.getClassName()))
			{
				diffFromNode(fromChild, toChild, patchTypes);
			}
			else
			{
				if (toChild != null)
				{
					patchTypes.add(new PatchType(Patch.TYPE_CREATE, new CreatePatch(toChild)));
					if (TextUtils.equals(toChild.getClassName(), NodeProps.TEXT_CLASS_NAME))
					{
						patchTypes.add(new PatchType(Patch.TYPE_EXTRA, new ExtraPatch(toChild.mId, toChild.mTextExtra, toChild.getClassName())));
					}

					patchTypes.add(new PatchType(Patch.TYPE_LAYOUT, new LayoutPatch(toChild.mX, toChild.mY, toChild.mHeight, toChild.getWidth(),
							toChild.mId, toChild.mParent.mId, toChild.mClassName)));
				}

				patchTypes.add(new PatchType(Patch.TYPE_DELETE_CHILDREN, new DeletePatch(fromChild.getId(), fromChild.getParent().getId(), fromChild
						.getParent().getClassName())));
			}
		}


	}

	private static ExtraPatch diffExtra(RenderNode from, RenderNode toNode)
	{
		if (from.mTextExtra != null && toNode.mTextExtra != null && !TextUtils.equals(from.mTextExtra.toString(), toNode.mTextExtra.toString()))
		{
			return new ExtraPatch(toNode.getId(), toNode.mTextExtra, toNode.getClassName());
		}

		return null;
	}

	private static LayoutPatch diffLayout(RenderNode fromNode, RenderNode toNode)
	{
		if (fromNode == null || fromNode.getX() != toNode.getX() || fromNode.getY() != toNode.getY() || fromNode.getWidth() != toNode.getWidth()
				|| fromNode.getHeight() != toNode.getHeight())
		{
			return new LayoutPatch(toNode.getX(), toNode.getY(), toNode.getHeight(), toNode.getWidth(), toNode.getId(), toNode.mParent.getId(),
					toNode.getClassName());
		}
		return null;
	}



	public static HippyMap diffProps(HippyMap from, HippyMap to, int diffLevel)
	{
		if (from == null)
		{
			return to;
		}
		HippyMap updateProps = new HippyMap();
		Set<String> fromKeys = from.keySet();
		for (String fromKey : fromKeys)
		{
			if (fromKey.equals(DT_EBLID)) {
				continue;
			}

			Object fromValue = from.get(fromKey);
			Object toValue = to.get(fromKey);
			if (fromValue instanceof Boolean)
			{
				boolean fromBool = (boolean) fromValue;
				if (toValue != null && fromBool == (boolean) toValue)
				{
					continue;
				}
				else
				{
					updateProps.pushObject(fromKey, toValue);
				}
			}
			else if (fromValue instanceof Number)
			{
				boolean isSame = false;
				double fromDoubleValue = ((Number) fromValue).doubleValue();
				if (toValue instanceof Number)
				{
					double toDoubleValue = ((Number) toValue).doubleValue();
					isSame = (fromDoubleValue == toDoubleValue);
				}
				// if toValue is null, push null to trigger default value
				if (!isSame)
				{
					updateProps.pushObject(fromKey, toValue);
				}
			}
			else if (fromValue instanceof String)
			{
				if (toValue != null && TextUtils.equals( fromValue.toString(), toValue.toString()))
				{
					continue;
				}
				else
				{
					updateProps.pushObject(fromKey, toValue);
				}
			}
			else if (fromValue instanceof HippyArray)
			{
				if (toValue != null && (toValue instanceof HippyArray))
				{
					HippyArray diffResult = diffArray((HippyArray) fromValue, (HippyArray) toValue, diffLevel + 1);
					//tintColor复用的时候必须要强制更新
					if (fromKey.equals("tintColors") || fromKey.equals("tintColor")) {
						diffResult = (HippyArray)toValue;
					}
					//这里diffResult == null标识属性没有更新
					if (diffResult != null /* && diffResult.size() > 0*/)
					{
						updateProps.pushObject(fromKey, toValue);
					}
				}
				else
				{ // toValue(Array)没有的时候，要给个默认值
					updateProps.pushObject(fromKey, null);
				}
			}
			else if (fromValue instanceof HippyMap)
			{
				if (toValue != null && (toValue instanceof HippyMap))
				{

					HippyMap diffResult = diffProps((HippyMap) fromValue, (HippyMap) toValue, diffLevel + 1);
					if (diffResult != null && diffResult.size() > 0)
					{
						if (diffLevel == 0 && fromKey.equals(NodeProps.STYLE))
						{
							updateProps.pushObject(fromKey, diffResult);
						}
						else
						{
							updateProps.pushObject(fromKey, toValue);
						}
					}
				}
				else if (diffLevel == 0 && fromKey.equals(NodeProps.STYLE))
				{
					//style is null
					HippyMap diffResult = diffProps((HippyMap) fromValue, new HippyMap(), diffLevel + 1);
					updateProps.pushMap(fromKey, diffResult);
				}
				else
				{ // toValue没有的时候，要给个默认值
					updateProps.pushObject(fromKey, null);
				}
			}
		}

		// new has prop, but old doesn't
		// so we push these props directly

		Set<String> tos = to.keySet();

		for (String toKey : tos)
		{

			if (from.get(toKey) != null || toKey.equals(DT_EBLID))
			{
				continue;
			}
			Object toValue = to.get(toKey);
			updateProps.pushObject(toKey, toValue);
		}

		return updateProps;
	}


	private static HippyArray diffArray(HippyArray fromValue, HippyArray toValue, int diffLevel)
	{

		if (fromValue.size() != toValue.size())
		{
			return toValue;
		}
		int size = fromValue.size();

		for (int i = 0; i < size; i++)
		{
			Object from = fromValue.getObject(i);
			Object to = toValue.getObject(i);
			// 这里默认from & to的类型相同
			if (from instanceof Boolean)
			{
				if ((boolean) from != (boolean) to)
				{
					return toValue;
				}
			}
			else if (from instanceof Number)
			{

				boolean isSame = false;

				double fromDoubleValue = ((Number) from).doubleValue();
				if (to instanceof Number)
				{
					double toDoubleValue = ((Number) to).doubleValue();
					isSame = (fromDoubleValue == toDoubleValue);
				}
				// if to is null, push null to trigger default value

				if (!isSame)
				{
					return toValue;
				}

			}
			else if (from instanceof String)
			{
				if (!TextUtils.equals((String) from, (String) to))
				{
					return toValue;
				}
			}
			else if (from instanceof HippyArray)
			{
				if (to instanceof HippyArray) {
					HippyArray diffResult = diffArray((HippyArray) from, (HippyArray) to, diffLevel);
					if (diffResult != null)
					{
						return toValue;
					}
				}
			}
			else if (from instanceof HippyMap)
			{
				if (to instanceof HippyMap) {
					HippyMap diffResult = diffProps((HippyMap) from, (HippyMap) to, diffLevel);
					if (diffResult != null) {
						return toValue;
					}
				}
			}
		}
		return null;
	}


	public static class CreatePatch extends Patch
	{
		@Override
		public String toString()
		{
			//			return "CreatePatch";
			return "CreatePatch id :" + renderNode.mId;
		}

		public CreatePatch(RenderNode renderNode)
		{
			this.renderNode = renderNode;
		}

		RenderNode	renderNode;

	}

	public static class ReplacePatch extends Patch
	{
		@Override
		public String toString()
		{
			return "ReplacePatch oldId:" + oldId + " newId:" + newId;
		}

		public ReplacePatch(int oldId, int newId)
		{
			this.oldId = oldId;
			this.newId = newId;
		}

		int	oldId;
		int	newId;
	}

	public static class PropsPatch extends Patch
	{
		HippyMap	mPropsToUpdate;
		int			mId;
		String		mClassName;

		public PropsPatch(HippyMap array, int tag, String className)
		{
			this.mPropsToUpdate = array;
			this.mId = tag;
			this.mClassName = className;
		}

		@Override
		public String toString()
		{
			return "PropsPatch";
		}
	}

	public static class ExtraPatch extends Patch
	{
		public ExtraPatch(int mID, Object mText, String className)
		{
			this.mID = mID;
			this.mText = mText;
			this.mClassName = className;
		}

		@Override
		public String toString()
		{
			return "ExtraPatch";
		}

		String	mClassName;
		int		mID;
		Object	mText;
	}

	public static class DeletePatch extends Patch
	{
		int		mId;
		int		mPid;
		String	mPClassName;

		@Override
		public String toString()
		{
			//			return "DeletePatch";
			return "DeletePatch  Id " + mId;

		}

		public DeletePatch(int id, int pId, String className)
		{
			this.mId = id;
			this.mPid = pId;
			this.mPClassName = className;
		}
	}

	public static class LayoutPatch extends Patch
	{
		int		mX;
		int		mY;
		int		mHeight;
		int		mWidth;
		int		mId;
		int		mParentId;
		String	mClassName;

		@Override
		public String toString()
		{
			return "LayoutPatch";
			//			return "mid" + mId + " x " + mX + " y " + mY + " width " + mWidth + " height " + mHeight;
		}

		public LayoutPatch(int mX, int mY, int mHeight, int mWidth, int mID, int mParentId, String mClassName)
		{

			this.mX = mX;
			this.mY = mY;
			this.mHeight = mHeight;
			this.mWidth = mWidth;
			this.mId = mID;
			this.mParentId = mParentId;
			this.mClassName = mClassName;
		}
	}

	public static class PatchType
	{
		public int		mType	= -1;
		public Patch	mPatch;

		public PatchType(int type, Patch p)
		{
			mPatch = p;
			mType = type;
		}
	}

	public static class Patch
	{
		public static final int	TYPE_DELETE_CHILDREN	= 0;
		public static final int	TYPE_PROPS				= 1;
		public static final int	TYPE_LAYOUT				= 2;
		public static final int	TYPE_EXTRA				= 3;
		public static final int	TYPE_REPLACE_ID			= 4;
		public static final int	TYPE_CREATE				= 5;
	}

	public static void deleteViews(ControllerManager controllerManager, List<PatchType> patchTypes)
	{

		for (int i = patchTypes.size() - 1; i >= 0; i--)
		{
			PatchType patchType = patchTypes.get(i);
			if (patchType.mType == Patch.TYPE_DELETE_CHILDREN)
			{
				DeletePatch deletePatch = (DeletePatch) patchType.mPatch;
				controllerManager.deleteChild(deletePatch.mPid, deletePatch.mId);
				patchTypes.remove(patchType);
			}
		}
	}

	public static void replaceIds(ControllerManager controllerManager, List<PatchType> patchTypes)
	{

		for (int i = patchTypes.size() - 1; i >= 0; i--)
		{
			PatchType patchType = patchTypes.get(i);
			if (patchType.mType == Patch.TYPE_REPLACE_ID)
			{
				ReplacePatch replacePatch = (ReplacePatch) patchType.mPatch;
				controllerManager.replaceID(replacePatch.oldId, replacePatch.newId);
				patchTypes.remove(patchType);
			}

		}

	}

	public static void createView(ControllerManager controllerManager, List<PatchType> patchTypes)
	{
		for (int i = 0; i < patchTypes.size(); i++)
		{
			PatchType patchType = patchTypes.get(i);
			if (patchType.mType == Patch.TYPE_CREATE)
			{
				CreatePatch createPatch = (CreatePatch) patchType.mPatch;
				createPatch.renderNode.createViewRecursive();
				if (createPatch.renderNode.mParent != null)
				{
					createPatch.renderNode.mParent.update();
				}
				createPatch.renderNode.updateViewRecursive();
			}
		}
	}

	public static void doPatch(ControllerManager controllerManager, List<PatchType> patches)
	{
		for (PatchType pt : patches)
		{
			if (pt.mType == Patch.TYPE_PROPS)
			{
				PropsPatch propsPatch = (PropsPatch) pt.mPatch;
				HippyMap propsToUpdate = propsPatch.mPropsToUpdate;
				if (propsToUpdate.containsKey(DT_EBLID)) {
					propsToUpdate.remove(DT_EBLID);
				}
				controllerManager.updateView(propsPatch.mId, propsPatch.mClassName, propsPatch.mPropsToUpdate);
			}
			else if (pt.mType == Patch.TYPE_LAYOUT)
			{
				LayoutPatch layoutPatch = (LayoutPatch) pt.mPatch;

				controllerManager.updateLayout(layoutPatch.mClassName, layoutPatch.mId, layoutPatch.mX, layoutPatch.mY, layoutPatch.mWidth,
						layoutPatch.mHeight);
			}
			else if (pt.mType == Patch.TYPE_EXTRA)
			{
				ExtraPatch extraPatch = (ExtraPatch) pt.mPatch;

				controllerManager.updateExtra(extraPatch.mID, extraPatch.mClassName, extraPatch.mText);
			}


			//			else if (pt.mType == Patch.TYPE_CREATE)
			//			{
			//				CreatePatch createPatch = (CreatePatch) pt.mPatch;
			//				controllerManager.createView(createPatch.renderNode.mRootView, createPatch.renderNode.mId, createPatch.renderNode.mPid,
			//						createPatch.renderNode.mIndex, createPatch.renderNode.mClassName, createPatch.renderNode.mPropsToUpdate);
			//			}
		}
	}
}
