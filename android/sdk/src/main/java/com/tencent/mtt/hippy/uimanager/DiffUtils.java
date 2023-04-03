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

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static com.tencent.mtt.hippy.views.custom.HippyCustomPropsController.DT_EBLID;


@SuppressWarnings("deprecation")
public class DiffUtils {

  public static ArrayList<PatchType> diff(RenderNode from, RenderNode toNoe) {
    ArrayList<PatchType> patchTypes = new ArrayList<>();
    if (from.getId() == toNoe.getId()) {
      //when first create view  form eq toNode
      return patchTypes;
    }

    try {
      diffFromNode(from, toNoe, patchTypes);
      diffToNode(from, toNoe, patchTypes);
    } catch (Throwable e) {
      LogUtils.d("DiffUtils", "diff: " + e.getMessage());
    }

    return patchTypes;
  }

  private static void diffToNode(RenderNode from, RenderNode toNoe,
      ArrayList<PatchType> patchTypes) {
    if (from == null || toNoe == null) {
      return;
    }

    for (int i = 0; i < toNoe.getChildCount(); i++) {
      if (i >= from.getChildCount()) {
        RenderNode toNoeChild = toNoe.getChildAt(i);
        patchTypes.add(new PatchType(Patch.TYPE_CREATE, new CreatePatch(toNoeChild)));
        if (TextUtils.equals(toNoeChild.getClassName(), NodeProps.TEXT_CLASS_NAME)) {
          patchTypes.add(new PatchType(Patch.TYPE_EXTRA,
              new ExtraPatch(toNoeChild.mId, toNoeChild.mTextExtra, toNoeChild.getClassName())));
        }

        patchTypes.add(new PatchType(Patch.TYPE_LAYOUT,
            new LayoutPatch(toNoeChild.mX, toNoeChild.mY, toNoeChild.mHeight, toNoeChild
                .getWidth(), toNoeChild.mId, toNoeChild.mParent.mId, toNoeChild.mClassName)));
      } else {
        diffToNode(from.getChildAt(i), toNoe.getChildAt(i), patchTypes);
      }

    }
  }


  private static void diffFromNode(RenderNode from, RenderNode toNode,
      ArrayList<PatchType> patchTypes) {
    if (TextUtils.equals(from.getClassName(), toNode.getClassName())) {
      patchTypes.add(
          new PatchType(Patch.TYPE_REPLACE_ID, new ReplacePatch(from.getId(), toNode.getId())));

      HippyMap updateProps = diffProps(from.getProps(), toNode.getProps(), 0);
      if (updateProps != null && updateProps.size() >= 1) {
        patchTypes.add(new PatchType(Patch.TYPE_PROPS,
            new PropsPatch(updateProps, toNode.getId(), toNode.getClassName())));
      }

      LayoutPatch lp = diffLayout(from, toNode);
      if (lp != null) {
        patchTypes.add(new PatchType(Patch.TYPE_LAYOUT, lp));
      }

      ExtraPatch extraPatch = diffExtra(from, toNode);
      if (extraPatch != null) {
        patchTypes.add(new PatchType(Patch.TYPE_EXTRA, extraPatch));
      }
    }

    for (int i = 0; i < from.getChildCount(); i++) {
      RenderNode fromChild = from.getChildAt(i);
      RenderNode toChild = null;
      if (i < toNode.getChildCount()) {
        toChild = toNode.getChildAt(i);
      }
      if (toChild != null && TextUtils.equals(fromChild.getClassName(), toChild.getClassName())) {
        diffFromNode(fromChild, toChild, patchTypes);
      } else {
        if (toChild != null) {
          patchTypes.add(new PatchType(Patch.TYPE_CREATE, new CreatePatch(toChild)));
          if (TextUtils.equals(toChild.getClassName(), NodeProps.TEXT_CLASS_NAME)) {
            patchTypes.add(new PatchType(Patch.TYPE_EXTRA,
                new ExtraPatch(toChild.mId, toChild.mTextExtra, toChild.getClassName())));
          }

          patchTypes.add(new PatchType(Patch.TYPE_LAYOUT,
              new LayoutPatch(toChild.mX, toChild.mY, toChild.mHeight, toChild.getWidth(),
                  toChild.mId, toChild.mParent.mId, toChild.mClassName)));
        }

        patchTypes.add(new PatchType(Patch.TYPE_DELETE_CHILDREN,
            new DeletePatch(fromChild.getId(), fromChild.getParent().getId(), fromChild
                .getParent().getClassName())));
      }
    }


  }

  private static ExtraPatch diffExtra(RenderNode from, RenderNode toNode) {
    if (from.mTextExtra != null && toNode.mTextExtra != null && !TextUtils
        .equals(from.mTextExtra.toString(), toNode.mTextExtra.toString())) {
      return new ExtraPatch(toNode.getId(), toNode.mTextExtra, toNode.getClassName());
    }

    return null;
  }

  private static LayoutPatch diffLayout(RenderNode fromNode, RenderNode toNode) {
    if (fromNode == null || fromNode.getX() != toNode.getX() || fromNode.getY() != toNode.getY()
        || fromNode.getWidth() != toNode.getWidth()
        || fromNode.getHeight() != toNode.getHeight()) {
      return new LayoutPatch(toNode.getX(), toNode.getY(), toNode.getHeight(), toNode.getWidth(),
          toNode.getId(), toNode.mParent.getId(),
          toNode.getClassName());
    }
    return null;
  }


  public static HippyMap diffProps(HippyMap from, HippyMap to, int diffLevel) {
    if (from == null) {
      return to;
    }
    HippyMap updateProps = new HippyMap();
    Set<String> fromKeys = from.keySet();
    for (String fromKey : fromKeys) {
      if (fromKey.equals(DT_EBLID)) {
        continue;
      }

      Object fromValue = from.get(fromKey);
      Object toValue = to.get(fromKey);
      if (fromValue instanceof Boolean) {
        if (!equalsBoolean((Boolean) fromValue, toValue)) {
          updateProps.pushObject(fromKey, toValue);
        }
      } else if (fromValue instanceof Number) {
        if (!equalsNumber((Number) fromValue, toValue)) {
          updateProps.pushObject(fromKey, toValue);
        }
      } else if (fromValue instanceof String) {
        if (toValue == null || !equalsString((String) fromValue, toValue.toString())) {
          updateProps.pushObject(fromKey, toValue);
        }
      } else if (fromValue instanceof HippyArray) {
        //tintColor复用的时候必须要强制更新
        if (fromKey.equals("tintColors") || fromKey.equals("tintColor") ||
            !equalsArray((HippyArray) fromValue, toValue)) {
          updateProps.pushObject(fromKey, toValue);
        }
      } else if (fromValue instanceof HippyMap) {
        if (diffLevel == 0 && fromKey.equals(NodeProps.STYLE)) {
          if (!(toValue instanceof HippyMap)) {
            toValue = new HippyMap();
          }
          HippyMap diffResult = diffProps((HippyMap) fromValue, (HippyMap) toValue, diffLevel + 1);
          updateProps.pushMap(fromKey, diffResult);
        } else if (!equalsMap((HippyMap) fromValue, toValue)) {
          updateProps.pushObject(fromKey, toValue);
        }
      }
    }

    // new has prop, but old doesn't
    // so we push these props directly

    Set<String> tos = to.keySet();

    for (String toKey : tos) {

      if (from.get(toKey) != null || toKey.equals(DT_EBLID)) {
        continue;
      }
      Object toValue = to.get(toKey);
      updateProps.pushObject(toKey, toValue);
    }

    return updateProps;
  }

  private static boolean equalsBoolean(Boolean from, Object to) {
      return from.equals(to);
  }

  private static boolean equalsNumber(Number from, Object to) {
      return to instanceof Number && from.doubleValue() == ((Number) to).doubleValue();
  }

  private static boolean equalsString(String from, Object to) {
      return from.equals(to);
  }

  private static boolean equalsObject(Object from, Object to) {
      if (from == to) {
          return true;
      }
      if (from instanceof Boolean) {
          return equalsBoolean((Boolean) from, to);
      } else if (from instanceof Number) {
          return equalsNumber((Number) from, to);
      } else if (from instanceof String) {
          return equalsString((String) from, to);
      } else if (from instanceof HippyArray) {
          return equalsArray((HippyArray) from, to);
      } else if (from instanceof HippyMap) {
          return equalsMap((HippyMap) from, to);
      }
      return false;
  }

  private static boolean equalsArray(HippyArray from, Object to) {
    if (from == to) {
      return true;
    }
    int size = from.size();
    if (!(to instanceof HippyArray) || size != ((HippyArray) to).size()) {
      return false;
    }

    for (int i = 0; i < size; i++) {
      Object fromValue = from.getObject(i);
      Object toValue = ((HippyArray) to).getObject(i);
      if (!equalsObject(fromValue, toValue)) {
        return false;
      }
    }
    return true;
  }

  private static boolean equalsMap(HippyMap from, Object to) {
    if (from == to) {
      return true;
    }
    if (!(to instanceof HippyMap) || from.size() != ((HippyMap) to).size()) {
      return false;
    }
    for (String fromKey : from.keySet()) {
      Object fromValue = from.get(fromKey);
      Object toValue = ((HippyMap) to).get(fromKey);
      if (!equalsObject(fromValue, toValue)) {
        return false;
      }
      if (fromValue == null && !((HippyMap) to).containsKey(fromKey)) {
        // since null could be either a null value or a non-existent key,
        // let's confirm that it's the former case.
        return false;
      }
    }
    return true;
  }

  public static class CreatePatch extends Patch {

    @Override
    public String toString() {
      //			return "CreatePatch";
      return "CreatePatch id :" + renderNode.mId;
    }

    public CreatePatch(RenderNode renderNode) {
      this.renderNode = renderNode;
    }

    final RenderNode renderNode;

  }

  public static class ReplacePatch extends Patch {

    @Override
    public String toString() {
      return "ReplacePatch oldId:" + oldId + " newId:" + newId;
    }

    public ReplacePatch(int oldId, int newId) {
      this.oldId = oldId;
      this.newId = newId;
    }

    final int oldId;
    final int newId;
  }

  public static class PropsPatch extends Patch {

    final HippyMap mPropsToUpdate;
    final int mId;
    final String mClassName;

    public PropsPatch(HippyMap array, int tag, String className) {
      this.mPropsToUpdate = array;
      this.mId = tag;
      this.mClassName = className;
    }

    @Override
    public String toString() {
      return "PropsPatch";
    }
  }

  public static class ExtraPatch extends Patch {

    public ExtraPatch(int mID, Object mText, String className) {
      this.mID = mID;
      this.mText = mText;
      this.mClassName = className;
    }

    @Override
    public String toString() {
      return "ExtraPatch";
    }

    final String mClassName;
    final int mID;
    final Object mText;
  }

  @SuppressWarnings("unused")
  public static class DeletePatch extends Patch {

    final int mId;
    final int mPid;
    final String mPClassName;

    @Override
    public String toString() {
      //			return "DeletePatch";
      return "DeletePatch  Id " + mId;

    }

    public DeletePatch(int id, int pId, String className) {
      this.mId = id;
      this.mPid = pId;
      this.mPClassName = className;
    }
  }

  @SuppressWarnings("unused")
  public static class LayoutPatch extends Patch {

    final int mX;
    final int mY;
    final int mHeight;
    final int mWidth;
    final int mId;
    final int mParentId;
    final String mClassName;

    @Override
    public String toString() {
      return "LayoutPatch";
      //			return "mid" + mId + " x " + mX + " y " + mY + " width " + mWidth + " height " + mHeight;
    }

    public LayoutPatch(int mX, int mY, int mHeight, int mWidth, int mID, int mParentId,
        String mClassName) {

      this.mX = mX;
      this.mY = mY;
      this.mHeight = mHeight;
      this.mWidth = mWidth;
      this.mId = mID;
      this.mParentId = mParentId;
      this.mClassName = mClassName;
    }
  }

  public static class PatchType {

    public final int mType;
    public final Patch mPatch;

    public PatchType(int type, Patch p) {
      mPatch = p;
      mType = type;
    }
  }

  public static class Patch {

    public static final int TYPE_DELETE_CHILDREN = 0;
    public static final int TYPE_PROPS = 1;
    public static final int TYPE_LAYOUT = 2;
    public static final int TYPE_EXTRA = 3;
    public static final int TYPE_REPLACE_ID = 4;
    public static final int TYPE_CREATE = 5;
  }

  public static void deleteViews(ControllerManager controllerManager, List<PatchType> patchTypes) {

    for (int i = patchTypes.size() - 1; i >= 0; i--) {
      PatchType patchType = patchTypes.get(i);
      if (patchType.mType == Patch.TYPE_DELETE_CHILDREN) {
        DeletePatch deletePatch = (DeletePatch) patchType.mPatch;
        controllerManager.deleteChild(deletePatch.mPid, deletePatch.mId);
        patchTypes.remove(patchType);
      }
    }
  }

  public static void replaceIds(ControllerManager controllerManager, List<PatchType> patchTypes) {

    for (int i = patchTypes.size() - 1; i >= 0; i--) {
      PatchType patchType = patchTypes.get(i);
      if (patchType.mType == Patch.TYPE_REPLACE_ID) {
        ReplacePatch replacePatch = (ReplacePatch) patchType.mPatch;
        controllerManager.replaceID(replacePatch.oldId, replacePatch.newId);
        patchTypes.remove(patchType);
      }

    }

  }

  public static void createView(List<PatchType> patchTypes) {
    for (int i = 0; i < patchTypes.size(); i++) {
      PatchType patchType = patchTypes.get(i);
      if (patchType.mType == Patch.TYPE_CREATE) {
        CreatePatch createPatch = (CreatePatch) patchType.mPatch;
        createPatch.renderNode.createViewRecursive();
        if (createPatch.renderNode.mParent != null) {
          createPatch.renderNode.mParent.update();
        }
        createPatch.renderNode.updateViewRecursive();
      }
    }
  }

  public static void doPatch(ControllerManager controllerManager, List<PatchType> patches) {
    HippyEngineContext hippyContext = controllerManager.mContext;

    for (PatchType pt : patches) {
      if (pt.mType == Patch.TYPE_PROPS) {
        PropsPatch propsPatch = (PropsPatch) pt.mPatch;
        HippyMap propsToUpdate = propsPatch.mPropsToUpdate;
        RenderNode node = hippyContext.getRenderManager().getRenderNode(propsPatch.mId);
        if (node != null) {
          HippyMap props = node.getProps();
          if (node.mHasSetDteblId) {
            if (propsToUpdate.containsKey(DT_EBLID)) {
              propsToUpdate.remove(DT_EBLID);
            }
          } else if (props != null && props.containsKey(DT_EBLID)) {
            propsToUpdate.pushString(DT_EBLID, props.getString(DT_EBLID));
          }
        }

        controllerManager.updateView(propsPatch.mId, propsPatch.mClassName, propsToUpdate);
      } else if (pt.mType == Patch.TYPE_LAYOUT) {
        LayoutPatch layoutPatch = (LayoutPatch) pt.mPatch;

        controllerManager
            .updateLayout(layoutPatch.mClassName, layoutPatch.mId, layoutPatch.mX, layoutPatch.mY,
                layoutPatch.mWidth,
                layoutPatch.mHeight);
      } else if (pt.mType == Patch.TYPE_EXTRA) {
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
