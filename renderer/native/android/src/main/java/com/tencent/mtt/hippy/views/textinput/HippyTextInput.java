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

package com.tencent.mtt.hippy.views.textinput;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.BlendMode;
import android.graphics.BlendModeColorFilter;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.view.WindowInsets;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.TextView;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatEditText;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.text.FontAdapter;
import com.tencent.renderer.component.text.TypeFaceUtil;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.utils.EventUtils;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@SuppressWarnings({"deprecation", "unused"})
public class HippyTextInput extends AppCompatEditText implements HippyViewBase,
        TextView.OnEditorActionListener, View.OnFocusChangeListener {

    private static final String TAG = "HippyTextInput";
    static final int EVENT_FOCUS = 1;
    static final int EVENT_BLUR = 1 << 1;
    static final int EVENT_KEYBOARD_SHOW = 1 << 2;
    static final int EVENT_KEYBOARD_HIDE = 1 << 3;
    static final int MASK_FOCUS = EVENT_FOCUS | EVENT_BLUR | EVENT_KEYBOARD_SHOW;
    static final int MASK_KEYBOARD = EVENT_KEYBOARD_SHOW | EVENT_KEYBOARD_HIDE;
    boolean mHasAddWatcher = false;
    private String mPreviousText = "";
    TextWatcher mTextWatcher = null;
    boolean mHasSetOnSelectListener = false;

    private final int mDefaultGravityHorizontal;
    private final int mDefaultGravityVertical;
    private final ViewTreeObserver.OnGlobalLayoutListener mKeyboardEventObserver = this::checkSendKeyboardEvent;
    private boolean mIsKeyBoardShow = false;    //键盘是否在显示
    private boolean mIsKeyBoardShowBySelf = false;
    private int mListenerFlag = 0;
    private ReactContentSizeWatcher mReactContentSizeWatcher = null;
    private boolean mItalic = false;
    private int mFontWeight = TypeFaceUtil.WEIGHT_NORMAL;
    @Nullable
    private String mFontFamily;
    private Paint mTextPaint;

    public HippyTextInput(Context context) {
        super(context);
        setFocusable(true);
        setFocusableInTouchMode(true);
        setOverScrollMode(View.OVER_SCROLL_IF_CONTENT_SCROLLS);

        mDefaultGravityHorizontal =
                getGravity() & (Gravity.HORIZONTAL_GRAVITY_MASK
                        | Gravity.RELATIVE_HORIZONTAL_GRAVITY_MASK);
        mDefaultGravityVertical = Gravity.CENTER_VERTICAL;
        // 临时规避一下EditTextView重设hint不生效的问题
        setLayoutParams(new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        setPadding(0, 0, 0, 0);
        setGravityVertical(Gravity.CENTER_VERTICAL);
        setHintTextColor(HippyTextInputController.DEFAULT_PLACEHOLDER_TEXT_COLOR);
        setTextColor(HippyTextInputController.DEFAULT_TEXT_COLOR);
        setBackground(null);
    }

    @Override
    public void onEditorAction(int actionCode) {
        HippyMap hippyMap = new HippyMap();
        hippyMap.pushInt("actionCode", actionCode);
        hippyMap.pushString("text", getText().toString());
        switch (actionCode) {
            case EditorInfo.IME_ACTION_GO:
                hippyMap.pushString("actionName", "go");
                break;
            case EditorInfo.IME_ACTION_NEXT:
                hippyMap.pushString("actionName", "next");
                break;
            case EditorInfo.IME_ACTION_NONE:
                hippyMap.pushString("actionName", "none");
                break;
            case EditorInfo.IME_ACTION_PREVIOUS:
                hippyMap.pushString("actionName", "previous");
                break;
            case EditorInfo.IME_ACTION_SEARCH:
                hippyMap.pushString("actionName", "search");
                break;
            case EditorInfo.IME_ACTION_SEND:
                hippyMap.pushString("actionName", "send");
                break;
            case EditorInfo.IME_ACTION_DONE:
                hippyMap.pushString("actionName", "done");
                break;
            default:
                hippyMap.pushString("actionName", "unknown");
                break;
        }
        EventUtils.sendComponentEvent(this, "onEditorAction", hippyMap);
        super.onEditorAction(actionCode);
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (getRootView() != null) {
            getRootView().getViewTreeObserver().addOnGlobalLayoutListener(mKeyboardEventObserver);
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        if (getRootView() != null) {
            getRootView().getViewTreeObserver().removeOnGlobalLayoutListener(mKeyboardEventObserver);
        }
    }

    void setGravityHorizontal(int gravityHorizontal) {
        if (gravityHorizontal == 0) {
            gravityHorizontal = mDefaultGravityHorizontal;
        }
        setGravity((getGravity() & ~Gravity.HORIZONTAL_GRAVITY_MASK
                & ~Gravity.RELATIVE_HORIZONTAL_GRAVITY_MASK) | gravityHorizontal);
    }

    void setGravityVertical(int gravityVertical) {
        if (gravityVertical == 0) {
            gravityVertical = mDefaultGravityVertical;
        }
        setGravity((getGravity() & ~Gravity.VERTICAL_GRAVITY_MASK) | gravityVertical);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        RenderNode node = RenderManager.getRenderNode(this);
        if (node != null) {
            Component component = node.getComponent();
            if (component != null) {
                component.onDraw(canvas, 0, 0, getRight() - getLeft(), getBottom() - getTop());
            }
        }
        super.onDraw(canvas);
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        if (mReactContentSizeWatcher != null) {
            mReactContentSizeWatcher.onLayout();
        }
    }

    @Override
    protected void onTextChanged(CharSequence text, int start, int lengthBefore, int lengthAfter) {
        super.onTextChanged(text, start, lengthBefore, lengthAfter);
        if (mReactContentSizeWatcher != null) {
            mReactContentSizeWatcher.onLayout();
        }
    }

    public class ReactContentSizeWatcher {

        private final EditText mEditText;
        private int mPreviousContentWidth = 0;
        private int mPreviousContentHeight = 0;

        public ReactContentSizeWatcher(EditText editText) {
            mEditText = editText;
        }

        public void onLayout() {
            int contentWidth = mEditText.getWidth();
            int contentHeight = mEditText.getHeight();

            // Use instead size of text content within EditText when available
            if (mEditText.getLayout() != null) {
                contentWidth =
                        mEditText.getCompoundPaddingLeft() + mEditText.getLayout().getWidth() < 0
                                ? 0
                                : mEditText.getLayout().getWidth() +
                                        mEditText.getCompoundPaddingRight();
                contentHeight =
                        mEditText.getCompoundPaddingTop() + mEditText.getLayout().getHeight() < 0
                                ? 0
                                : mEditText.getLayout().getHeight() +
                                        mEditText.getCompoundPaddingBottom();
            }

            if (contentWidth != mPreviousContentWidth || contentHeight != mPreviousContentHeight) {
                mPreviousContentHeight = contentHeight;
                mPreviousContentWidth = contentWidth;
                HippyMap contentSize = new HippyMap();
                contentSize.pushDouble("width", mPreviousContentWidth);
                contentSize.pushDouble("height", mPreviousContentWidth);
                HippyMap eventData = new HippyMap();
                eventData.pushMap("contentSize", contentSize);
                EventUtils.sendComponentEvent(mEditText, "onContentSizeChange", eventData);
            }
        }
    }

    public void setOnContentSizeChange(boolean contentSizeChange) {
        if (contentSizeChange) {
            mReactContentSizeWatcher = new ReactContentSizeWatcher(this);
        } else {
            mReactContentSizeWatcher = null;
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        return super.onTouchEvent(event);
    }

    public InputMethodManager getInputMethodManager() {
        return (InputMethodManager) this.getContext()
                .getSystemService(Context.INPUT_METHOD_SERVICE);
    }

    public void hideInputMethod() {
        InputMethodManager imm = this.getInputMethodManager();
        if (imm != null && imm.isActive()) {
            try {
                imm.hideSoftInputFromWindow(this.getWindowToken(), 0);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

    }

    private static boolean sVisibleRectReflectionFetched = false;
    private static Method sGetViewRootImplMethod;
    private static Field sVisibleInsetsField;
    private static Field sAttachInfoField;

    private static Field sViewAttachInfoField;
    private static Field sStableInsets;
    private static Field sContentInsets;

    @SuppressLint({ "PrivateApi", "SoonBlockedPrivateApi" }) // PrivateApi is only accessed below SDK 30
    private static void loadReflectionField() {
        try {
            sGetViewRootImplMethod = View.class.getDeclaredMethod("getViewRootImpl");
            Class<?> sAttachInfoClass = Class.forName("android.view.View$AttachInfo");
            sVisibleInsetsField = sAttachInfoClass.getDeclaredField("mVisibleInsets");
            Class<?> viewRootImplClass = Class.forName("android.view.ViewRootImpl");
            sAttachInfoField = viewRootImplClass.getDeclaredField("mAttachInfo");
            sVisibleInsetsField.setAccessible(true);
            sAttachInfoField.setAccessible(true);
        } catch (ReflectiveOperationException e) {
            LogUtils.e(TAG, "Failed to get visible insets. (Reflection error). " + e.getMessage(), e);
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            try {
                sViewAttachInfoField = View.class.getDeclaredField("mAttachInfo");
                sViewAttachInfoField.setAccessible(true);
                Class<?> sAttachInfoClass = Class.forName("android.view.View$AttachInfo");
                sStableInsets = sAttachInfoClass.getDeclaredField("mStableInsets");
                sStableInsets.setAccessible(true);
                sContentInsets = sAttachInfoClass.getDeclaredField("mContentInsets");
                sContentInsets.setAccessible(true);
            } catch (ReflectiveOperationException e) {
                LogUtils.w(TAG, "Failed to get visible insets from AttachInfo " + e.getMessage());
            }
        }

        sVisibleRectReflectionFetched = true;
    }

    /**
     * Get the software keyboard height. This code is migrated from androidx, in case we are running in a lower version
     * androidx library, feel free to use androidx directly in the future.
     *
     * @see androidx.core.view.ViewCompat#getRootWindowInsets(View)
     * @see androidx.core.view.WindowInsetsCompat#isVisible(int)
     * @see androidx.core.view.WindowInsetsCompat#getInsets(int)
     * @see androidx.core.view.WindowInsetsCompat.Type#ime()
     */
    private int getImeHeight(View view) {
        final WindowInsets insets = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? getRootWindowInsets() : null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            return insets == null ? 0 : insets.getInsets(WindowInsets.Type.ime()).bottom;
        }

        final View rootView = getRootView();
        int systemWindowBottom = 0;
        int rootStableBottom = 0;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (insets == null) {
                return 0;
            }
            systemWindowBottom = insets.getSystemWindowInsetBottom();
            rootStableBottom = insets.getStableInsetBottom();
        } else {
            if (!rootView.isAttachedToWindow()) {
                return 0;
            }
            if (!sVisibleRectReflectionFetched) {
                loadReflectionField();
            }
            if (sViewAttachInfoField != null && sStableInsets != null && sContentInsets != null) {
                try {
                    Object attachInfo = sViewAttachInfoField.get(rootView);
                    if (attachInfo != null) {
                        Rect stableInsets = (Rect) sStableInsets.get(attachInfo);
                        Rect visibleInsets = (Rect) sContentInsets.get(attachInfo);
                        if (stableInsets != null && visibleInsets != null) {
                            systemWindowBottom = visibleInsets.bottom;
                            rootStableBottom = stableInsets.bottom;
                        }
                    }
                } catch (IllegalAccessException e) {
                    LogUtils.w(TAG, "Failed to get insets from AttachInfo. " + e.getMessage());
                }
            }
        }
        if (systemWindowBottom > rootStableBottom) {
            return systemWindowBottom;
        }

        if (!sVisibleRectReflectionFetched) {
            loadReflectionField();
        }
        if (sGetViewRootImplMethod != null && sAttachInfoField != null && sVisibleInsetsField != null) {
            try {
                Object viewRootImpl = sGetViewRootImplMethod.invoke(rootView);
                if (viewRootImpl != null) {
                    Object mAttachInfo = sAttachInfoField.get(viewRootImpl);
                    Rect visibleRect = (Rect) sVisibleInsetsField.get(mAttachInfo);
                    int visibleRectBottom = visibleRect != null ? visibleRect.bottom : 0;
                    if (visibleRectBottom > rootStableBottom) {
                        return visibleRectBottom;
                    }
                }
            } catch (ReflectiveOperationException e) {
                LogUtils.e(TAG,
                        "Failed to get visible insets. (Reflection error). " + e.getMessage(), e);
            }
        }
        return 0;
    }

    private void checkSendKeyboardEvent() {
        if ((mListenerFlag & MASK_KEYBOARD) == 0) {
            return;
        }
        final int imeHeight = getImeHeight(this);
        if (imeHeight > 0) {
            mIsKeyBoardShow = true;
            boolean bySelf = hasFocus();
            if (bySelf != mIsKeyBoardShowBySelf) {
                mIsKeyBoardShowBySelf = bySelf;
                if (bySelf && (mListenerFlag & EVENT_KEYBOARD_SHOW) != 0) {
                    Map<String, Object> keyboardHeightMap = new HashMap<>();
                    keyboardHeightMap.put("keyboardHeight", Math.round(PixelUtil.px2dp(imeHeight)));
                    EventUtils.sendComponentEvent(HippyTextInput.this, "keyboardWillShow", keyboardHeightMap);
                }
            }
        } else if (mIsKeyBoardShow) {
            mIsKeyBoardShow = mIsKeyBoardShowBySelf = false;
            if ((mListenerFlag & EVENT_KEYBOARD_HIDE) != 0) {
                EventUtils.sendComponentEvent(HippyTextInput.this, "keyboardWillHide", null);
            }
        }
    }

    public void showInputMethodManager() {

        InputMethodManager imm = this.getInputMethodManager();

        try {
            imm.showSoftInput(this, 0, null);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }


    private String mValidator = "";    //这则表达式,前端传入,要比较小心导致的crash
    private String sRegrexValidBefore = "";
    private String sRegrexValidRepeat = "";    //如果有无效的正则输入,会设置.

    public void setValidator(String validator) {
        mValidator = validator;
    }

    //changeListener == true 代表前端监听了 onTextChagne.
    //所以如果
    public void setOnChangeListener(boolean changeListener) {
        if (changeListener) //需要监听文字的通知
        {
            if (mHasAddWatcher) //如果已经注册过了，直接退出。
            {
                return;
            }
            //第一次才注册。
            mTextWatcher = new TextWatcher() {
                @Override
                public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                    sRegrexValidBefore = s.toString();//在文本变化前,记录一下当前输入框的文本值.也就是说现在肯定是符合正则表达式的.
                }

                @Override
                public void onTextChanged(CharSequence s, int start, int before, int count) {

                }

                @Override
                public void afterTextChanged(Editable s) {
                    HippyTextInput.this
                            .layout(HippyTextInput.this.getLeft(), HippyTextInput.this.getTop(),
                                    HippyTextInput.this.getRight(),
                                    HippyTextInput.this.getBottom());

                    if (TextUtils.isEmpty((mValidator))) //如果没有正则匹配
                    {
                        //如果文本输入过,判断是否两次相同
                        if (TextUtils.equals(s.toString(), mPreviousText)) {
                            return;
                        }
                        //这里为什么不用sRegrexValidBefore,sRegrexValidBefore是每次有词汇变化就会被回调设置.
                        mPreviousText = s.toString();
                        if (!bUserSetValue) //如果是前端设置下来的值,不再需要回调给前端.
                        {
                            HippyMap hippyMap = new HippyMap();
                            hippyMap.pushString("text", s.toString());
                            EventUtils.sendComponentEvent(HippyTextInput.this, "changetext", hippyMap);
                        }
                    } else //如果设置了正则表达式
                    {
                        try {
                            //如果当前的内容不匹配正则表达式
                            if (!s.toString().matches(mValidator) && !"".equals(s.toString())) {
                                //丢弃当前的内容,回退到上一次的值.上一次的值检查过,肯定是符合正则表达式的.
                                setText(sRegrexValidBefore);
                                //上一步的setText,将触发新一轮的beforeTextChanged,onTextChanged,afterTextChanged
                                //为了避免前端收到两次内容同样的通知.记录一下正则匹配设置回去的值.
                                sRegrexValidRepeat = sRegrexValidBefore;
                                setSelection(getText().toString().length()); // TODO这里不应该通知
                            } else {
                                //如果文本输入过,判断是否两次相同
                                if (TextUtils.equals(s.toString(), mPreviousText)) {
                                    return;
                                }
                                mPreviousText = s.toString();
                                if (!bUserSetValue //如果是前端设置的一定不通知
                                        && (TextUtils.isEmpty(sRegrexValidRepeat) //如果没有,输入过无效的内容
                                        || !TextUtils.equals(sRegrexValidRepeat,
                                        mPreviousText) //如果本次输入的内容是上一次重复的蓉蓉
                                )) {
                                    HippyMap hippyMap = new HippyMap();
                                    hippyMap.pushString("text", s.toString());
                                    EventUtils.sendComponentEvent(HippyTextInput.this, "changetext", hippyMap);
                                    sRegrexValidRepeat = "";
                                }
                            }
                        } catch (Throwable error) {
                            // 不知道外部的正则表达式,最好保护住
                        }
                    }
                }
            };

            //注册。并标记
            mHasAddWatcher = true;
            addTextChangedListener(mTextWatcher);

        } else //不需要需要监听文字的通知
        {
            mHasAddWatcher = false;
            removeTextChangedListener(mTextWatcher);
        }
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return null;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {

    }


    public void setOnEndEditingListener(boolean onEndEditingLIstener) {
        if (onEndEditingLIstener) {
            setOnEditorActionListener(this);
        } else {
            setOnEditorActionListener(null);
        }
    }

    @Override
    public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
        if ((actionId & EditorInfo.IME_MASK_ACTION) > 0 || actionId == EditorInfo.IME_NULL) {
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushString("text", getText().toString());
            EventUtils.sendComponentEvent(v, "endediting", hippyMap);
        }
        return false;
    }

    public Map<String, Object> jsIsFocused() {
        Map<String, Object> result = new HashMap<>();
        result.put("value", hasFocus());
        return result;
    }

    public void setEventListener(boolean enable, int flag) {
        final boolean oldHasFocusListener = (mListenerFlag & MASK_FOCUS) != 0;
        if (enable) {
            mListenerFlag |= flag;
        } else {
            mListenerFlag &= ~flag;
        }
        boolean newHasFocusListener = (mListenerFlag & MASK_FOCUS) != 0;
        if (oldHasFocusListener != newHasFocusListener) {
            setOnFocusChangeListener(newHasFocusListener ? this : null);
        }
    }

    @Override
    public void onFocusChange(View v, boolean hasFocus) {
        HippyMap hippyMap = new HippyMap();
        hippyMap.pushString("text", getText().toString());
        if (hasFocus) {
            EventUtils.sendComponentEvent(v, "focus", hippyMap);
            checkSendKeyboardEvent();
        } else {
            EventUtils.sendComponentEvent(v, "blur", hippyMap);
            mIsKeyBoardShowBySelf = false;
        }
    }

    @Override
    protected void onSelectionChanged(int selStart, int selEnd) {
        super.onSelectionChanged(selStart, selEnd);
        if (mHasSetOnSelectListener) {
            HippyMap selection = new HippyMap();
            selection.pushInt("start", selStart);
            selection.pushInt("end", selEnd);
            HippyMap hippyMap = new HippyMap();
            hippyMap.pushMap("selection", selection);
            EventUtils.sendComponentEvent(this, "selectionchange", hippyMap);
        }
    }

    public Map<String, Object> jsGetValue() {
        Map<String, Object> result = new HashMap<>();
        result.put("text", getText().toString());
        return result;
    }

    public boolean bUserSetValue = false;

    public void jsSetValue(String value, int pos) {
        bUserSetValue = true;
        setText(value);
        if (value != null) {
            if (pos < 0) {
                pos = value.length();
            }
            if (pos >= value.length()) {
                pos = value.length();
            }
            setSelection(pos);
        }
        bUserSetValue = false;
    }

    public void setOnSelectListener(boolean change) {
        mHasSetOnSelectListener = change;
    }

    @SuppressWarnings("JavaReflectionMemberAccess")
    public void setCursorColor(int color) {
        if (Build.VERSION.SDK_INT == Build.VERSION_CODES.P) {
            // Pre-Android 10, there was no supported API to change the cursor color programmatically.
            // In Android 9.0, they changed the underlying implementation,
            // but also "dark greylisted" the new field, rendering it unusable.
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            Drawable cursorDrawable = getTextCursorDrawable();
            if (cursorDrawable != null) {
                cursorDrawable.setColorFilter(new BlendModeColorFilter(color, BlendMode.SRC_IN));
                setTextCursorDrawable(cursorDrawable);
            }
        } else {
            try {
                Field field = TextView.class.getDeclaredField("mCursorDrawableRes");
                field.setAccessible(true);
                int drawableResId = field.getInt(this);
                field = TextView.class.getDeclaredField("mEditor");
                field.setAccessible(true);
                Object editor = field.get(this);
                Drawable drawable = null;
                final int version = Build.VERSION.SDK_INT;
                if (version >= 21) {
                    drawable = this.getContext().getDrawable(drawableResId);
                } else if (version >= 16) {
                    drawable = this.getContext().getResources().getDrawable(drawableResId);
                }
                if (drawable == null) {
                    return;
                }
                drawable.setColorFilter(color, PorterDuff.Mode.SRC_IN);
                assert editor != null;
                Class<?> editorClass = editor
                        .getClass(); //有的ROM自己复写了，Editor类，所以之类里面没有mDrawableForCursor，这里需要遍历
                while (editorClass != null) {
                    try {
                        if (version >= 28) {
                            field = editorClass
                                    .getDeclaredField("mDrawableForCursor");//mCursorDrawable
                            field.setAccessible(true);
                            field.set(editor, drawable);
                        } else {
                            Drawable[] drawables = {drawable, drawable};
                            field = editorClass
                                    .getDeclaredField("mCursorDrawable");//mCursorDrawable
                            field.setAccessible(true);
                            field.set(editor, drawables);
                        }
                        break;
                    } catch (Throwable e) {
                        LogUtils.d(TAG, "setCursorColor: " + e.getMessage());
                    }
                    editorClass = editorClass.getSuperclass(); //继续往上反射父亲
                }
            } catch (Throwable e) {
                LogUtils.d(TAG, "setCursorColor: " + e.getMessage());
            }
        }
    }

    public void refreshSoftInput() {
        InputMethodManager imm = getInputMethodManager();
        if (imm.isActive(this)) { // refresh the showing soft keyboard
            try {
                imm.hideSoftInputFromWindow(getWindowToken(), 0);
                imm.restartInput(this);
                imm.showSoftInput(this, 0, null);
            } catch (Exception e) {
                LogUtils.e(TAG, "refreshSoftInput error", e);
            }
        }
    }

    public void setFontStyle(String style) {
        if (TypeFaceUtil.TEXT_FONT_STYLE_ITALIC.equals(style) != mItalic) {
            mItalic = !mItalic;
            updateTypeface();
        }
    }

    public void setFontFamily(String family) {
        if (!Objects.equals(mFontFamily, family)) {
            mFontFamily = family;
            updateTypeface();
        }
    }

    public void setFontWeight(String weight) {
        int fontWeight;
        if (TextUtils.isEmpty(weight) || TypeFaceUtil.TEXT_FONT_STYLE_NORMAL.equals(weight)) {
            // case normal
            fontWeight = TypeFaceUtil.WEIGHT_NORMAL;
        } else if (TypeFaceUtil.TEXT_FONT_STYLE_BOLD.equals(weight)) {
            // case bold
            fontWeight = TypeFaceUtil.WEIGHT_BOLE;
        } else {
            // case number
            try {
                fontWeight = Math.min(Math.max(1, Integer.parseInt(weight)), 1000);
            } catch (NumberFormatException ignored) {
                fontWeight = TypeFaceUtil.WEIGHT_NORMAL;
            }
        }
        if (fontWeight != mFontWeight) {
            mFontWeight = fontWeight;
            updateTypeface();
        }
    }

    private void updateTypeface() {
        if (mTextPaint == null) {
            mTextPaint = new Paint();
        } else {
            mTextPaint.reset();
        }
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(getContext());
        FontAdapter fontAdapter = nativeRenderer == null ? null : nativeRenderer.getFontAdapter();
        TypeFaceUtil.apply(mTextPaint, mItalic, mFontWeight, mFontFamily, fontAdapter);
        setTypeface(mTextPaint.getTypeface(), mTextPaint.isFakeBoldText() ? Typeface.BOLD : Typeface.NORMAL);
    }

}
