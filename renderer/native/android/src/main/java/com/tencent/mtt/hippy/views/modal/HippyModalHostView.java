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

package com.tencent.mtt.hippy.views.modal;

import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.DialogInterface;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.view.DisplayCutoutCompat;

import com.openhippy.renderer.R;
import com.tencent.mtt.hippy.HippyInstanceLifecycleEventListener;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;

import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;

public class HippyModalHostView extends HippyViewGroup implements
        HippyInstanceLifecycleEventListener {

    public enum AnimationStyleTheme {
        STYLE_THEME_FULL_SCREEN_DIALOG,
        STYLE_THEME_ANIMATED_FADE_DIALOG,
        STYLE_THEME_ANIMATED_SLIDE_DIALOG,
        STYLE_THEME_ANIMATED_SLIDE_FADE_DIALOG
    }

    private static final String ANIMATION_TYPE_FADE = "fade";
    private static final String ANIMATION_TYPE_SLIDE = "slide";
    private static final String ANIMATION_TYPE_SLIDE_FADE = "slide_fade";
    private static final String ANIMATION_PROPERTY_ALPHA = "alpha";
    private static final String ANIMATION_PROPERTY_TRANSLATION_Y = "translationY";
    private boolean mAutoHideStatusBar = false;
    private boolean mAutoHideNavigationBar = false;
    private boolean mEnterImmersionStatusBar = false;
    private boolean mStatusBarTextDarkColor = false;
    private boolean mTransparent = true;
    private boolean mNewDialogRequired = false;
    @NonNull
    private final DialogRootView mDialogRootView;
    @Nullable
    private HippyModalDialogView mDialog;
    @Nullable
    private View mContentView;
    @Nullable
    private DialogInterface.OnShowListener mOnShowListener;
    @Nullable
    private OnRequestCloseListener mOnRequestCloseListener;
    @Nullable
    private String mAnimationType;
    private AnimationStyleTheme mAnimationStyleTheme;
    @Nullable
    private final NativeRender mNativeRenderer;

    public HippyModalHostView(Context context) {
        super(context);
        mAnimationStyleTheme = AnimationStyleTheme.STYLE_THEME_FULL_SCREEN_DIALOG;
        mNativeRenderer = NativeRendererManager.getNativeRenderer(context);
        if (mNativeRenderer != null) {
            mNativeRenderer.addInstanceLifecycleEventListener(this);
        }
        mDialogRootView = new DialogRootView(context);
    }

    @Override
    public void onInstanceLoad(int rootId) {
        showOrUpdate();
    }

    @Override
    public void onInstanceResume() {
        showOrUpdate();
    }

    @Override
    public void onInstancePause() {
        dismiss();
    }

    @Override
    public void onInstanceDestroy(int rootId) {
        if (mNativeRenderer != null) {
            mNativeRenderer.removeInstanceLifecycleEventListener(this);
        }
        dismiss();
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        // No-op since Titan layout engine handles actually laying out children.
    }

    @Override
    public void addView(View child, int index) {
        mDialogRootView.addView(child, index);
    }

    @Override
    public int getChildCount() {
        return mDialogRootView.getChildCount();
    }

    @Override
    public View getChildAt(int index) {
        return mDialogRootView.getChildAt(index);
    }

    @Override
    public void removeView(View child) {
        mDialogRootView.removeView(child);
    }

    @Override
    public void removeViewAt(int index) {
        View child = getChildAt(index);
        mDialogRootView.removeView(child);
    }

    @Override
    public boolean dispatchPopulateAccessibilityEvent(AccessibilityEvent event) {
        return false;
    }

    private void dismiss() {
        if (isActivityFinishing() || mDialog == null) {
            return;
        }
        mDialog.dismiss();
        mDialog = null;
        ViewGroup parent = (ViewGroup) mDialogRootView.getParent();
        if (parent != null) {
            parent.removeViewAt(0);
        }
    }

    public void setOnRequestCloseListener(@NonNull OnRequestCloseListener listener) {
        mOnRequestCloseListener = listener;
    }

    public void setOnShowListener(@NonNull DialogInterface.OnShowListener listener) {
        mOnShowListener = listener;
    }

    protected void setTransparent(boolean transparent) {
        mTransparent = transparent;
    }

    public void requestClose() {
        if (mOnRequestCloseListener != null) {
            mOnRequestCloseListener.onRequestClose(mDialog);
        }
    }

    protected void setAnimationType(@Nullable String animationType) {
        if (animationType == null) {
            return;
        }
        switch (animationType) {
            case ANIMATION_TYPE_FADE:
                mAnimationStyleTheme = AnimationStyleTheme.STYLE_THEME_ANIMATED_FADE_DIALOG;
                break;
            case ANIMATION_TYPE_SLIDE:
                mAnimationStyleTheme = AnimationStyleTheme.STYLE_THEME_ANIMATED_SLIDE_DIALOG;
                break;
            case ANIMATION_TYPE_SLIDE_FADE:
                mAnimationStyleTheme = AnimationStyleTheme.STYLE_THEME_ANIMATED_SLIDE_FADE_DIALOG;
                break;
            default:
                mAnimationStyleTheme = AnimationStyleTheme.STYLE_THEME_FULL_SCREEN_DIALOG;
        }
        mAnimationType = animationType;
        mNewDialogRequired = true;
    }

    protected String getAnimationType() {
        return mAnimationType;
    }

    protected void autoHideStatusBar(boolean hide) {
        mAutoHideStatusBar = hide;
    }

    protected void autoHideNavigationBar(boolean hide) {
        mAutoHideNavigationBar = hide;
    }

    protected void setEnterImmersionStatusBar(boolean fullScreen) {
        mEnterImmersionStatusBar = fullScreen;
    }

    protected void setImmersionStatusBarTextDarkColor(boolean darkColor) {
        mStatusBarTextDarkColor = darkColor;
    }

    public Dialog getDialog() {
        return mDialog;
    }

    protected void setDialogBar(boolean isDarkIcon) {
        if (mDialog == null) {
            return;
        }
        try {
            Window window = mDialog.getWindow();
            if (window == null) {
                return;
            }
            int sysUI = window.getDecorView().getSystemUiVisibility();

            if (mAutoHideStatusBar && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                WindowManager.LayoutParams lp = window.getAttributes();
                lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                window.setAttributes(lp);
                sysUI = sysUI | View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
            } else if (mEnterImmersionStatusBar) {
                sysUI = sysUI & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                sysUI = sysUI & ~View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
                int extra;
                if (isDarkIcon) {
                    extra = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                } else {
                    extra = View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
                }
                sysUI = sysUI | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | extra;
                window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
                window.setStatusBarColor(Color.TRANSPARENT);
            }

            if (mAutoHideNavigationBar) {
                sysUI = sysUI | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION;
            }

            window.getDecorView().setSystemUiVisibility(sysUI);
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

    private boolean isActivityFinishing() {
        Context context = ((ContextWrapper) getContext()).getBaseContext();
        if (context instanceof Activity) {
            return ((Activity) context).isFinishing();
        }
        return true;
    }

    private void initDialog() {
        if (mDialog == null) {
            return;
        }
        if (mDialog.getWindow() != null) {
            setDialogBar(mStatusBarTextDarkColor);
        }
        switch (mAnimationStyleTheme) {
            case STYLE_THEME_ANIMATED_FADE_DIALOG:
                mDialog.getWindow().setWindowAnimations(R.style.modal_style_theme_animated_fade);
                break;
            case STYLE_THEME_ANIMATED_SLIDE_DIALOG:
                mDialog.getWindow().setWindowAnimations(R.style.modal_style_theme_animated_slide);
                break;
            case STYLE_THEME_ANIMATED_SLIDE_FADE_DIALOG:
                mDialog.getWindow().setWindowAnimations(R.style.modal_style_theme_animated_slide_fade);
                break;
            default:
        }

        mDialog.setOnShowListener(new DialogInterface.OnShowListener() {
            @Override
            public void onShow(DialogInterface dialogInterface) {
                if (mOnShowListener != null) {
                    mOnShowListener.onShow(dialogInterface);
                }
            }
        });
        mDialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(DialogInterface dialogInterface) {
            }
        });
        mDialog.setOnKeyListener(new DialogInterface.OnKeyListener() {
            @Override
            public boolean onKey(DialogInterface dialog, int keyCode, KeyEvent event) {
                if (event.getAction() != KeyEvent.ACTION_UP) {
                    return false;
                }
                if (keyCode == KeyEvent.KEYCODE_BACK) {
                    if (mOnRequestCloseListener != null) {
                        mOnRequestCloseListener.onRequestClose(dialog);
                    }
                    return true;
                } else {
                    Context context = ((ContextWrapper) getContext()).getBaseContext();
                    if (context instanceof Activity) {
                        ((Activity) context).onKeyUp(keyCode, event);
                    }
                }
                return false;
            }
        });
        mDialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
    }

    protected void showOrUpdate() {
        if (isActivityFinishing()) {
            return;
        }
        if (mDialog != null) {
            if (mNewDialogRequired) {
                dismiss();
            } else {
                updateProperties();
                return;
            }
        }
        mNewDialogRequired = false;
        mDialog = createDialog(getContext());
        mDialogRootView.setId(getId());
        mContentView = createContentView(mDialogRootView);
        mDialog.setContentView(mContentView);
        updateProperties();
        initDialog();
        mDialog.show();
    }

    @NonNull
    protected HippyModalDialogView createDialog(@NonNull Context context) {
        int themeResId = android.R.style.Theme_Translucent_NoTitleBar;
        return new HippyModalDialogView(context, themeResId, this);
    }

    @NonNull
    protected View createContentView(View hostView) {
        FrameLayout frameLayout = new FrameLayout(getContext()) {
            @Override
            protected void dispatchDraw(Canvas canvas) {
                super.dispatchDraw(canvas);
                int statusBarHeight = DimensionsUtil.getStatusBarHeight();
                if (mEnterImmersionStatusBar && statusBarHeight != -1
                        && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT
                        && Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                    canvas.save();
                    canvas.clipRect(0, 0, getMeasuredWidth(), statusBarHeight);
                    canvas.drawColor(0x40000000);
                    canvas.restore();
                }
            }
        };
        frameLayout.addView(hostView);
        frameLayout.setFitsSystemWindows(false);
        return frameLayout;
    }

    private void updateProperties() {
        if (mDialog == null) {
            return;
        }
        if (mTransparent) {
            mDialog.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        } else {
            mDialog.getWindow().setDimAmount(0.5f);
            mDialog.getWindow().setFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND,
                    WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        }
    }

    protected interface OnRequestCloseListener {

        void onRequestClose(DialogInterface dialog);
    }

    private static class DialogRootView extends HippyViewGroup {

        public DialogRootView(Context context) {
            super(context);
            setFitsSystemWindows(false);
            setClipChildren(true);
        }

        @Override
        protected void onSizeChanged(final int w, final int h, int oldw, int oldh) {
            super.onSizeChanged(w, h, oldw, oldh);
            if (getContext() instanceof NativeRenderContext) {
                NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(getContext());
                if (nativeRenderer != null && getChildCount() > 0) {
                    final int id = getChildAt(0).getId();
                    final int rootId = ((NativeRenderContext) getContext()).getRootId();
                    nativeRenderer.onSizeChanged(rootId, id, w, h, false);
                }
            }
        }

        @Override
        public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {

        }
    }
}
