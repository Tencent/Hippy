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
package com.tencent.mtt.hippy.dom;


import android.text.Layout;
import android.text.TextUtils;
import android.util.SparseBooleanArray;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.DomDomainData;
import com.tencent.mtt.hippy.dom.flex.FlexSpacing;
import com.tencent.mtt.hippy.dom.node.*;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.DiffUtils;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.UIThreadUtils;

import com.tencent.renderer.NativeRender;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;

@SuppressWarnings({"deprecation", "unused", "UnusedReturnValue", "rawtypes"})
public class DomManager {

  private static final String TAG = "DomManager";
  protected final DispatchUIFrameCallback mDispatchUIFrameCallback;
  private final SparseBooleanArray mTagsWithLayoutVisited = new SparseBooleanArray();
  protected volatile boolean mIsDispatchUIFrameCallbackEnqueued;
  protected boolean mRenderBatchStarted = false;
  final DomNodeRegistry mNodeRegistry;
  final ArrayList<IDomExecutor> mUITasks;
  final ArrayList<IDomExecutor> mPaddingNulUITasks;
  final ArrayList<IDomExecutor> mDispatchRunnable = new ArrayList<>();
  final Object mDispatchLock = new Object();
  final DomUpdateManager mDomStyleUpdateManager = new DomUpdateManager();
  final RenderManager mRenderManager;
  volatile CopyOnWriteArrayList<DomActionInterceptor> mActionInterceptors;
  final LayoutHelper mLayoutHelper;
  private final WeakReference<NativeRender> nativeRendererWeakReference;
  private volatile boolean mIsDestroyed = false;
  private volatile boolean mEnginePaused = false;
  private BatchListener mBatchListener;

  public DomManager(NativeRender context) {
    nativeRendererWeakReference = new WeakReference<>(context);
    mNodeRegistry = new DomNodeRegistry();

    mUITasks = new ArrayList<>();
    //noinspection unchecked
    mPaddingNulUITasks = new ArrayList();

    mRenderManager = context.getRenderManager();
    mDispatchUIFrameCallback = new DispatchUIFrameCallback();
    mLayoutHelper = new LayoutHelper();

  }

  private static boolean jsJustLayout(HippyMap props) {
    if (props == null) {
      return true;
    }

    if (props.get(NodeProps.COLLAPSABLE) != null && !((Boolean) props
        .get(NodeProps.COLLAPSABLE))) {
      return false;
    }

    Set<String> sets = props.keySet();

    for (String key : sets) {
      if (!NodeProps.isJustLayout(props, key)) {
        return false;
      }
    }
    return true;
  }

  public void addActionInterceptor(DomActionInterceptor interceptor) {
    if (mActionInterceptors == null) {
      synchronized (DomManager.class) {
        if (mActionInterceptors == null) {
          mActionInterceptors = new CopyOnWriteArrayList<>();
        }
      }
    }
    mActionInterceptors.add(interceptor);
  }

  public void removeActionInterceptor(DomActionInterceptor interceptor) {
    if (mActionInterceptors != null) {
      mActionInterceptors.remove(interceptor);
    }
  }

  public void createRootNode(int id, int width, int height) {
    DomNode node = new StyleNode();
    node.setId(id);
    node.setViewClassName(NodeProps.ROOT_NODE);
    node.setStyleWidth(width);
    node.setStyleHeight(height);
    addRootNode(node);
    mRenderManager.createRootNode(id);
  }

  public void onResume() {
    mEnginePaused = false;
  }

  public void onPause() {
    mEnginePaused = true;
  }

  public void destroy() {
    mIsDestroyed = true;
    if (mNodeRegistry != null) {
      mNodeRegistry.clear();
    }
    mLayoutHelper.release();
    mUITasks.clear();
    mPaddingNulUITasks.clear();

    mIsDispatchUIFrameCallbackEnqueued = false;
    if (UIThreadUtils.isOnUiThread()) {
      HippyChoreographer.getInstance().removeFrameCallback(mDispatchUIFrameCallback);
    } else {
      UIThreadUtils.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          HippyChoreographer.getInstance().removeFrameCallback(mDispatchUIFrameCallback);
        }
      });
    }
  }

  private void markTextNodeDirty(DomNode domNode) {
    if (domNode != null) {
      int childCount = domNode.getChildCount();
      for (int i = 0; i < childCount; i++) {
        markTextNodeDirty(domNode.getChildAt(i));
      }
      if (domNode instanceof TextNode) {
        TextNode textNode = (TextNode) domNode;
        if (textNode.enableScale()) {
          textNode.dirty();
        }
      }
    }
  }

  public void forceUpdateNode(int rootId) {
    DomNode node = mNodeRegistry.getNode(rootId);
    markTextNodeDirty(node);
    if (!mRenderBatchStarted) {
      batch();
    }
  }

  public void updateNodeSize(int rootId, int width, int height) {
    DomNode node = mNodeRegistry.getNode(rootId);

    if (node != null) {

      node.setStyleWidth(width);
      node.setStyleHeight(height);
      if (!mRenderBatchStarted) {
        batch();
      }
    }
  }

  public void addRootNode(DomNode node) {
    mNodeRegistry.addRootNode(node);
  }

  public void renderBatchStart() {
    LogUtils.d(TAG, "renderBatchStart");
    mRenderBatchStarted = true;
  }

  public void renderBatchEnd() {
    LogUtils.d(TAG, "renderBatchEnd");
    mRenderBatchStarted = false;
    batch();
  }

  public void batchByAnimation() {
    if (!mRenderBatchStarted) {
      batch(true);
    }
  }

  public DomNode getNode(final int id) {
    return mNodeRegistry.getNode(id);
  }

  public int getRootNodeId() {
    int count = mNodeRegistry.getRootNodeCount();
    return count >= 1 ? mNodeRegistry.getRootTag(0) : 0;
  }

  public void createNode(final ViewGroup hippyRootView, int rootId, final int id, int pid, int index,
      final String className, String tagName, HippyMap map) {
    if (nativeRendererWeakReference.get() == null) {
      return;
    }

    final DomNode parentNode = mNodeRegistry.getNode(pid);
    if (parentNode != null) {
      if (mActionInterceptors != null) {
        for (DomActionInterceptor interceptor : mActionInterceptors) {
          map = interceptor.onCreateNode(id, hippyRootView, map);
        }
      }
      HippyMap props = map;

      boolean isVirtual = false;
      if (TextUtils.equals(parentNode.getViewClass(), NodeProps.TEXT_CLASS_NAME)) {
        isVirtual = true;
      }

      DomNode node = nativeRendererWeakReference.get().getRenderManager()
          .createStyleNode(className, isVirtual, id, hippyRootView.getId());

      node.setLazy(parentNode.isLazy() || nativeRendererWeakReference.get().getRenderManager().getControllerManager()
          .isControllerLazy(className));
      node.setProps(map);

//      if (nativeRendererWeakReference.get().isDebugMode()) {
//        node.setDomainData(new DomDomainData(id, rootId, pid, className, tagName, map));
//      }

      boolean isLayoutOnly =
          (NodeProps.VIEW_CLASS_NAME.equals(node.getViewClass())) && jsJustLayout(
              (HippyMap) props.get(NodeProps.STYLE))
              && !isTouchEvent(props);
      LogUtils.d(TAG,
          "dom create node id: " + id + " mClassName " + className + " pid " + pid + " mIndex:"
              + index + " isJustLayout :"
              + isLayoutOnly + " isVirtual " + isVirtual);
      //updateProps
      node.updateProps(props);
      //noinspection unchecked
      mDomStyleUpdateManager.updateStyle(node, props);

      //add to parent
      int realIndex = index;
      if (realIndex > parentNode.getChildCount()) {
        realIndex = parentNode.getChildCount();
        LogUtils.d("DomManager", "createNode  addChild  error index > parent.size");
      }
      parentNode.addChildAt(node, realIndex);

      //add to registry
      mNodeRegistry.addNode(node);

      node.setIsJustLayout(isLayoutOnly);

      if (!isLayoutOnly && !node.isVirtual()) {
        final DomNode nativeParentNode = findNativeViewParent(node);
        final ViewIndex childIndex = findNativeViewIndex(nativeParentNode, node, 0);
        final HippyMap newProps = map;

        //this is create view ahead  in every doframe
        if (!node.isLazy()) {
          synchronized (mDispatchLock) {
            addDispatchTask(new IDomExecutor() {
              @Override
              public void exec() {
                mRenderManager
                    .createPreView(hippyRootView, id, nativeParentNode.getId(), childIndex.mIndex,
                        className, newProps);
              }
            });
          }
        }

//        addUITask(new IDomExecutor() {
//          @Override
//          public void exec() {
//            mRenderManager
//                .createNode(hippyRootView, id, nativeParentNode.getId(), childIndex.mIndex,
//                    className, newProps);
//          }
//        });
      }
    } else {
      LogUtils.d("DomManager", "Create Node DomManager Parent IS Null");
    }

  }

  private boolean isTouchEvent(HippyMap props) {
    if (props == null) {
      return false;
    }
    Set<String> sets = props.keySet();
    for (String key : sets) {
      if (NodeProps.isTouchEventProp(key)) {
        return true;
      }
    }
    return false;
  }

  public void postWarmLayout(Layout layout) {
    if (mLayoutHelper != null) {
      mLayoutHelper.postWarmLayout(layout);
    }
  }

  private ViewIndex findNativeViewIndex(DomNode nativeParentNode, DomNode node, int index) {

    for (int i = 0; i < nativeParentNode.getChildCount(); i++) {
      DomNode childNode = nativeParentNode.getChildAt(i);
      if (childNode == node) {
        return new ViewIndex(true, index);
      }

      if (childNode.isJustLayout()) {
        ViewIndex viewIndex = findNativeViewIndex(childNode, node, index);
        if (viewIndex.mResult) {
          return viewIndex;
        } else {
          index = viewIndex.mIndex;
        }
      } else {
        index++;
      }
    }
    return new ViewIndex(false, index);
  }

  DomNode findNativeViewParent(DomNode domNode) {
    DomNode nativeParent = domNode.getParent();
    while (nativeParent.isJustLayout()) {
      nativeParent = nativeParent.getParent();
    }
    return nativeParent;
  }

  @SuppressWarnings("unused")
  public void removeRootNode(int tag) {
    mNodeRegistry.removeRootNode(tag);
  }

  @SuppressWarnings("unused")
  public boolean existNode(int tag) {
    return mNodeRegistry.getNode(tag) != null;
  }

  public void updateNode(final int id, HippyMap map, ViewGroup hippyRootView) {

  }

  private void changeJustLayout2View(final DomNode node, final HippyMap hippyMap,
      final ViewGroup hippyRootView) {

    //step1: create child
    final DomNode reallyParent = findNativeViewParent(node);

    final ViewIndex viewIndex = findNativeViewIndex(reallyParent, node, 0);

//    if (!node.isVirtual()) {
//      addUITask(new IDomExecutor() {
//        @Override
//        public void exec() {
//          mRenderManager
//              .createNode(hippyRootView, node.getId(), reallyParent.getId(), viewIndex.mIndex,
//                  node.getViewClass(),
//                  hippyMap);
//        }
//      });
//    }
    //step2: move child
    final ArrayList<Integer> moveIds = new ArrayList<>();
    node.markUpdated();
    findMoveChildren(node, moveIds);
    node.setIsJustLayout(false);

    if (!node.isVirtual()) {
      addUITask(new IDomExecutor() {
        @Override
        public void exec() {
          mRenderManager.moveNode(moveIds, reallyParent.getId(), node.getId());
        }
      });
    }
    //step3:updateStyle Layout
    applyLayoutUpdateRecursive(node);
    mTagsWithLayoutVisited.clear();

  }

  private void findMoveChildren(DomNode node, ArrayList<Integer> remove) {

    for (int i = 0; i < node.getChildCount(); i++) {
      DomNode childNode = node.getChildAt(i);

      if (childNode.isJustLayout()) {
        findMoveChildren(childNode, remove);
      } else {
        childNode.markUpdated();
        remove.add(childNode.getId());
      }

    }
  }

  void deleteNode(DomNode node) {
    //这里来拦截所有deleteNode(包括它的子node)操作
    if (mActionInterceptors != null) {
      for (DomActionInterceptor interceptor : mActionInterceptors) {
        interceptor.onDeleteNode(node.getId());
      }
    }

    int count = node.getChildCount();
    for (int i = 0; i < count; i++) {
      deleteNode(node.getChildAt(i));
    }
    if (TextUtils.equals(NodeProps.ROOT_NODE, node.getViewClass())) {
      mNodeRegistry.removeRootNode(node.getId());
    }
    mNodeRegistry.removeNode(node.getId());
    LogUtils.d(TAG, "dom deleteNode  remove form mNodeRegistry node.getId() " + node.getId());
  }

  public void deleteNode(final int id) {
    DomNode node = mNodeRegistry.getNode(id);
    LogUtils.d(TAG, "dom  deleteNode delete  node.getId() " + id);
    if (node != null) {
      if (node.isJustLayout()) {
        deleteJustLayoutChild(node);
      } else {
        if (!node.isVirtual()) {
          addUITask(new IDomExecutor() {
            @Override
            public void exec() {
              mRenderManager.deleteNode(id);
            }
          });
        }
      }
      DomNode parentNode = node.getParent();
      if (parentNode != null) {
        int index = parentNode.indexOf(node);
        parentNode.removeChildAt(index);
      }
      deleteNode(node);
    } else {
      LogUtils.e(TAG, "dom  deleteNode delete   node is null node.getId() " + id);
    }


  }

  private void deleteJustLayoutChild(DomNode node) {
    for (int i = 0; i < node.getChildCount(); i++) {
      final DomNode childNode = node.getChildAt(i);
      if (childNode.isJustLayout()) {
        deleteJustLayoutChild(childNode);
      } else {
        if (!childNode.isVirtual()) {
          addUITask(new IDomExecutor() {
            @Override
            public void exec() {
              mRenderManager.deleteNode(childNode.getId());
            }
          });

        }
      }
    }
  }

  private void addUITask(IDomExecutor executor) {
    mUITasks.add(executor);
  }

  private void addNulUITask(IDomExecutor executor) {

    if (mRenderBatchStarted) {
      mPaddingNulUITasks.add(executor);
    } else {
      synchronized (mDispatchLock) {
        addDispatchTask(executor);
      }
    }
  }

  private void addDispatchTask(IDomExecutor executor) {

    if (mIsDestroyed) {
      return;
    }

    mDispatchRunnable.add(executor);

    if (!mIsDispatchUIFrameCallbackEnqueued) {
      mIsDispatchUIFrameCallbackEnqueued = true;
      if (UIThreadUtils.isOnUiThread()) {
        HippyChoreographer.getInstance().postFrameCallback(mDispatchUIFrameCallback);
      } else {
        UIThreadUtils.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            HippyChoreographer.getInstance().postFrameCallback(mDispatchUIFrameCallback);
          }
        });
      }
    }
  }

  private void applyLayoutUpdateRecursive(final DomNode domStyle) {
    if (domStyle.hasUpdates()) {
      for (int i = 0; i < domStyle.getChildCount(); i++) {
        applyLayoutUpdateRecursive(domStyle.getChildAt(i));
      }

      if (domStyle.getData() != null) {
        final TextNode textNode = (TextNode) domStyle;
        if (!domStyle.isVirtual()) {
          addUITask(new IDomExecutor() {
            @Override
            public void exec() {
              mRenderManager.updateExtra(domStyle.getId(),
                  new TextExtra(domStyle.getData(), textNode.getPadding(FlexSpacing.START),
                      textNode.getPadding(FlexSpacing.END),
                      textNode.getPadding(FlexSpacing.BOTTOM),
                      textNode.getPadding(FlexSpacing.TOP)));
            }
          });
        }
      }

      if (!TextUtils.equals(NodeProps.ROOT_NODE, domStyle.getViewClass())) {
        applyLayout(domStyle);
      }
      if (domStyle.shouldNotifyOnLayout()) {
        notifyLayout(domStyle);
      }
      domStyle.markUpdateSeen();
    }
  }

  private void notifyLayout(DomNode domStyle) {
    if (!Float.isNaN(domStyle.getLayoutX()) && !Float.isNaN(domStyle.getLayoutY()) && !Float
        .isNaN(domStyle.getLayoutWidth())
        && !Float.isNaN(domStyle.getLayoutHeight())) {
      HippyMap onLayoutMap = new HippyMap();
      onLayoutMap.pushObject("x", (int) PixelUtil.px2dp(domStyle.getLayoutX()));
      onLayoutMap.pushObject("y", (int) PixelUtil.px2dp(domStyle.getLayoutY()));
      onLayoutMap.pushObject("width", (int) PixelUtil.px2dp(domStyle.getLayoutWidth()));
      onLayoutMap.pushObject("height", (int) PixelUtil.px2dp(domStyle.getLayoutHeight()));

      HippyMap event = new HippyMap();

      event.pushMap("layout", onLayoutMap);
      event.pushInt("target", domStyle.getId());

      if (nativeRendererWeakReference.get() != null) {
        nativeRendererWeakReference.get().dispatchUIComponentEvent(domStyle.getId(), "onLayout", event);
      }
    }
  }

  private void applyLayout(DomNode domStyle) {

    int tag = domStyle.getId();
    if (mTagsWithLayoutVisited.get(tag)) {
      return;
    }
    mTagsWithLayoutVisited.put(tag, true);

    float x = domStyle.getLayoutX();
    float y = domStyle.getLayoutY();

    DomNode parent = domStyle.getParent();
    while (parent != null && parent.isJustLayout()) {
      x += parent.getLayoutX();
      y += parent.getLayoutY();
      parent = parent.getParent();
    }

    applyLayoutXY(domStyle, x, y);

  }

  private void applyLayoutXY(final DomNode domStyle, final float x, final float y) {
    if (!domStyle.isJustLayout() && !domStyle.isVirtual()) {
      //			final int pos[] = findReallyXY(domStyle);
      if (domStyle.shouldUpdateLayout(x, y)) {
        addUITask(new IDomExecutor() {
          @Override
          public void exec() {

            int newLeft = Math.round(x);
            int newTop = Math.round(y);
            int newRight = Math.round(x + domStyle.getLayoutWidth());
            int newBottom = Math.round(y + domStyle.getLayoutHeight());

            int newWidth = newRight - newLeft;

            int newHeight = newBottom - newTop;

            mRenderManager.updateLayout(domStyle.getId(), newLeft, newTop, newWidth, newHeight);
          }
        });
      }
      return;
    }

    for (int i = 0; i < domStyle.getChildCount(); i++) {
      DomNode child = domStyle.getChildAt(i);
      int childTag = child.getId();
      if (mTagsWithLayoutVisited.get(childTag)) {
        continue;
      }
      mTagsWithLayoutVisited.put(childTag, true);

      float childX = child.getLayoutX();
      float childY = child.getLayoutY();

      childX += x;
      childY += y;

      applyLayoutXY(child, childX, childY);
    }
  }

  void applyLayoutBefore(DomNode domNode) {
    if (domNode != null && domNode.hasUpdates()) {
      for (int i = 0; i < domNode.getChildCount(); i++) {
        applyLayoutBefore(domNode.getChildAt(i));
      }
      domNode.layoutBefore(nativeRendererWeakReference.get());
    }
  }

  void applyLayoutAfter(DomNode domNode) {
    if (domNode != null && domNode.hasUpdates()) {
      for (int i = 0; i < domNode.getChildCount(); i++) {
        applyLayoutAfter(domNode.getChildAt(i));
      }
      domNode.layoutAfter(nativeRendererWeakReference.get());
    }
  }

  public void batch() {
    batch(false);
  }

  public void batch(boolean isAnimation) {
    int rootNodeCount = mNodeRegistry.getRootNodeCount();

    for (int i = 0; i < rootNodeCount; i++) {
      int rootTag = mNodeRegistry.getRootTag(i);
      DomNode rootNode = mNodeRegistry.getNode(rootTag);
      if (rootNode != null) {
        applyLayoutBefore(rootNode);

        LogUtils.d(TAG, " dom start  calculateLayout");

        rootNode.calculateLayout();

        applyLayoutAfter(rootNode);

        applyLayoutUpdateRecursive(rootNode);

        LogUtils.d(TAG, "dom end  calculateLayout");
        //				LogUtils.l(TAG, rootNode.toString());
      }
    }

    mTagsWithLayoutVisited.clear();
    LogUtils.d(TAG, "dom batch complete");

    synchronized (mDispatchLock) {
      for (int i = 0; i < mUITasks.size(); i++) {
        addDispatchTask(mUITasks.get(i));
      }

      for (int i = 0; i < mPaddingNulUITasks.size(); i++) {
        addDispatchTask(mPaddingNulUITasks.get(i));
      }

    }
    mPaddingNulUITasks.clear();
    mUITasks.clear();

    if (mBatchListener != null) {
      mBatchListener.onBatch(isAnimation);
    }
  }

  void flushPendingBatches() {

    if (mEnginePaused) {
      mIsDispatchUIFrameCallbackEnqueued = false;
    } else {
      HippyChoreographer.getInstance().postFrameCallback(mDispatchUIFrameCallback);
    }

    synchronized (mDispatchLock) {
      Iterator<IDomExecutor> iterator = mDispatchRunnable.iterator();
      boolean shouldBatch = mDispatchRunnable.size() > 0;
      long startTime = System.currentTimeMillis();
      while (iterator.hasNext()) {
        IDomExecutor iDomExecutor = iterator.next();
        if (iDomExecutor != null && !mIsDestroyed) {
          try {
            iDomExecutor.exec();
          } catch (RuntimeException e) {
            e.printStackTrace();
          }
        }
        iterator.remove();
        if (mIsDispatchUIFrameCallbackEnqueued) {
          if (System.currentTimeMillis() - startTime > 500) {
            break;
          }
        }
      }
      if (shouldBatch) {
        mRenderManager.batch();
      }
    }

  }

  public void dispatchUIFunction(final int id, final String functionName, final HippyArray array,
      final Promise promise) {
    addNulUITask(new IDomExecutor() {
      @Override
      public void exec() {
        //mRenderManager.dispatchUIFunction(id, functionName, array, promise);
      }
    });
  }

  public void measureInWindow(final int id, final Promise promise) {
    addNulUITask(new IDomExecutor() {
      @Override
      public void exec() {
        mRenderManager.measureInWindow(id, promise);
      }
    });
  }

  static class ViewIndex {

    public final boolean mResult;
    public final int mIndex;

    public ViewIndex(boolean mResult, int mIndex) {
      this.mResult = mResult;
      this.mIndex = mIndex;
    }
  }

  @SuppressWarnings("unused")
  private class DispatchUIFrameCallback implements HippyChoreographer.FrameCallback {

    @Override
    public void doFrame(long frameTimeNanos) {
      flushPendingBatches();
    }
  }

	public void setOnBatchListener(BatchListener listener) {
		mBatchListener = listener;
	}

	public interface BatchListener {

		void onBatch(boolean isAnimation);
	}

}
