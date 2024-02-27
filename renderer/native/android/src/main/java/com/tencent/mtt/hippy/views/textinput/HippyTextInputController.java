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

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Looper;
import android.os.MessageQueue;
import android.text.Editable;
import android.text.InputFilter;
import android.text.InputType;
import android.text.Layout;
import android.text.TextUtils;
import android.text.method.PasswordTransformationMethod;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;

import android.view.inputmethod.InputMethodManager;
import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.component.text.TextRenderSupplier;
import com.tencent.renderer.node.TextVirtualNode;
import com.tencent.renderer.utils.ArrayUtils;

import java.util.LinkedList;
import java.util.List;

import static com.tencent.renderer.NativeRenderException.ExceptionCode.HANDLE_CALL_UI_FUNCTION_ERR;

@HippyController(name = HippyTextInputController.CLASS_NAME, dispatchWithStandardType = true)
public class HippyTextInputController extends HippyViewController<HippyTextInput> {

    public static final String CLASS_NAME = "TextInput";
    public static final int DEFAULT_TEXT_COLOR = Color.BLACK;
    public static final int DEFAULT_PLACEHOLDER_TEXT_COLOR = Color.GRAY;
    private static final String TAG = "HippyTextInputControlle";
    private static final int INPUT_TYPE_KEYBOARD_NUMBERED =
            InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL
                    | InputType.TYPE_NUMBER_FLAG_SIGNED;
    private static final String KEYBOARD_TYPE_EMAIL_ADDRESS = "email";
    private static final String KEYBOARD_TYPE_NUMERIC = "numeric";
    private static final String KEYBOARD_TYPE_PHONE_PAD = "phone-pad";
    private static final String KEYBOARD_TYPE_PASS_WORD = "password";
    private static final String FUNC_CLEAR = "clear";
    private static final String FUNC_FOCUS = "focusTextInput";
    private static final String FUNC_BLUR = "blurTextInput";
    private static final String FUNC_IS_FOCUSED = "isFocused";
    private static final String FUNC_GET_VALUE = "getValue";
    private static final String FUNC_SET_VALUE = "setValue";
    private static final String FUNC_KEYBOARD_DISMISS = "dismiss";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyTextInput(context);
    }

    @Override
    protected void updateExtra(@NonNull View view, Object object) {
        super.updateExtra(view, object);

        if (object instanceof TextRenderSupplier) {
            TextRenderSupplier supplier = (TextRenderSupplier) object;
            HippyTextInput hippyTextInput = (HippyTextInput) view;
            hippyTextInput.setPadding((int) Math.ceil(supplier.leftPadding),
                    (int) Math.ceil(supplier.topPadding),
                    (int) Math.ceil(supplier.rightPadding),
                    (int) Math.ceil(supplier.bottomPadding));
        }
    }

    @HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER, defaultNumber = 14)
    public void setFontSize(HippyTextInput hippyTextInput, float fontSize) {
        hippyTextInput
                .setTextSize(TypedValue.COMPLEX_UNIT_PX,
                        (int) Math.ceil(PixelUtil.dp2px(fontSize)));
    }

    @HippyControllerProps(name = "defaultValue", defaultType = HippyControllerProps.STRING)
    public void setDefaultValue(HippyTextInput textInput, String defaultValue) {
        String text = "";
        if (textInput.getText() != null) {
            text = textInput.getText().toString();
        }
        if (!TextUtils.equals(text, defaultValue)) {
            textInput.setText(defaultValue);
            if (!TextUtils.isEmpty(defaultValue)) {
                textInput.setSelection(defaultValue.length());
            }
        }
    }

    @HippyControllerProps(name = "validator", defaultType = HippyControllerProps.STRING)
    public void setValidator(HippyTextInput hippyTextInput, String strValidator) {
        hippyTextInput.setValidator(strValidator);
    }

    @HippyControllerProps(name = "editable", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setEditable(HippyTextInput hippyTextInput, boolean editable) {
        hippyTextInput.setEnabled(editable);
    }

    /**
     * 设置输入光标颜色
     **/
    @HippyControllerProps(name = "caret-color", defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
    public void setCaretColor(HippyTextInput hippyTextInput, int cursorColor) {
        hippyTextInput.setCursorColor(cursorColor);
    }

    @HippyControllerProps(name = "multiline", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void multiLine(HippyTextInput hippyTextInput, boolean multiline) {
        int inputType = hippyTextInput.getInputType();
        if (multiline) {
            inputType = inputType | InputType.TYPE_TEXT_FLAG_MULTI_LINE;
        } else {
            inputType &= ~InputType.TYPE_TEXT_FLAG_MULTI_LINE;
        }
        hippyTextInput.setInputType(inputType);
        if (multiline) {
            hippyTextInput.setGravityVertical(Gravity.TOP);
        }
    }

    @HippyControllerProps(name = "returnKeyType")
    public void setReturnKeyType(HippyTextInput view, String returnKeyType) {

        int returnKeyFlag = EditorInfo.IME_ACTION_DONE;
        if (returnKeyType != null) {
            switch (returnKeyType) {
                case "go":
                    returnKeyFlag = EditorInfo.IME_ACTION_GO;
                    break;
                case "next":
                    returnKeyFlag = EditorInfo.IME_ACTION_NEXT;
                    break;
                case "none":
                    returnKeyFlag = EditorInfo.IME_ACTION_NONE;
                    break;
                case "previous":
                    returnKeyFlag = EditorInfo.IME_ACTION_PREVIOUS;
                    break;
                case "search":
                    returnKeyFlag = EditorInfo.IME_ACTION_SEARCH;
                    break;
                case "send":
                    returnKeyFlag = EditorInfo.IME_ACTION_SEND;
                    break;
                case "done":
                    returnKeyFlag = EditorInfo.IME_ACTION_DONE;
                    break;
            }
        }
        view.setImeOptions(returnKeyFlag | EditorInfo.IME_FLAG_NO_FULLSCREEN);
        view.refreshSoftInput();
    }

    @HippyControllerProps(name = "keyboardType", defaultType = HippyControllerProps.STRING)
    public void setKeyboardType(HippyTextInput hippyTextInput, String keyboardType) {
        int flagsToSet = InputType.TYPE_CLASS_TEXT;
        if (KEYBOARD_TYPE_NUMERIC.equalsIgnoreCase(keyboardType)) {
            flagsToSet = INPUT_TYPE_KEYBOARD_NUMBERED;
        } else if (KEYBOARD_TYPE_EMAIL_ADDRESS.equalsIgnoreCase(keyboardType)) {
            flagsToSet = InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS | InputType.TYPE_CLASS_TEXT;
        } else if (KEYBOARD_TYPE_PHONE_PAD.equalsIgnoreCase(keyboardType)) {
            flagsToSet = InputType.TYPE_CLASS_PHONE;
        } else if (KEYBOARD_TYPE_PASS_WORD.equalsIgnoreCase(keyboardType)) {
            flagsToSet = InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD;
            hippyTextInput.setTransformationMethod(PasswordTransformationMethod.getInstance());
        }
        boolean multiline = (hippyTextInput.getInputType() & InputType.TYPE_TEXT_FLAG_MULTI_LINE) != 0;
        if (multiline) {
            flagsToSet |= InputType.TYPE_TEXT_FLAG_MULTI_LINE;
        } else {
            flagsToSet &= ~InputType.TYPE_TEXT_FLAG_MULTI_LINE;
        }
        hippyTextInput.setInputType(flagsToSet);
        hippyTextInput.refreshSoftInput();
    }

    @HippyControllerProps(name = NodeProps.FONT_STYLE, defaultType = HippyControllerProps.STRING)
    public void setFontStyle(HippyTextInput view, String fontStyleString) {
        view.setFontStyle(fontStyleString);
    }

    @HippyControllerProps(name = NodeProps.FONT_WEIGHT, defaultType = HippyControllerProps.STRING)
    public void setFontWeight(HippyTextInput view, String fontWeightString) {
        view.setFontWeight(fontWeightString);
    }

    @HippyControllerProps(name = NodeProps.FONT_FAMILY, defaultType = HippyControllerProps.STRING)
    public void setFontFamily(HippyTextInput view, String fontFamily) {
        view.setFontFamily(fontFamily);
    }

    private static final InputFilter[] EMPTY_FILTERS = new InputFilter[0];

    @HippyControllerProps(name = "maxLength", defaultType = HippyControllerProps.NUMBER, defaultNumber = Integer.MAX_VALUE)
    public void maxLength(HippyTextInput view, int maxLength) {
        InputFilter[] currentFilters = view.getFilters();
        InputFilter[] newFilters = EMPTY_FILTERS;

        if (maxLength == -1) {
            if (currentFilters.length > 0) {
                LinkedList<InputFilter> list = new LinkedList<>();
                for (InputFilter currentFilter : currentFilters) {
                    if (!(currentFilter instanceof InputFilter.LengthFilter)) {
                        list.add(currentFilter);
                    }
                }
                if (!list.isEmpty()) {
                    //noinspection ToArrayCallWithZeroLengthArrayArgument
                    newFilters = list.toArray(new InputFilter[list.size()]);
                }
            }
        } else {
            if (currentFilters.length > 0) {
                newFilters = currentFilters;
                boolean replaced = false;
                for (int i = 0; i < currentFilters.length; i++) {
                    if (currentFilters[i] instanceof InputFilter.LengthFilter) {
                        currentFilters[i] = new InputFilter.LengthFilter(maxLength);
                        replaced = true;
                    }
                }
                if (!replaced) {
                    newFilters = new InputFilter[currentFilters.length + 1];
                    System.arraycopy(currentFilters, 0, newFilters, 0, currentFilters.length);
                    newFilters[currentFilters.length] = new InputFilter.LengthFilter(maxLength);
                }
            } else {
                newFilters = new InputFilter[1];
                newFilters[0] = new InputFilter.LengthFilter(maxLength);
            }
        }

        view.setFilters(newFilters);
    }

    @HippyControllerProps(name = "selectionchange", defaultType = "boolean")
    public void setOnSelectionChange(HippyTextInput hippyTextInput, boolean change) {
        hippyTextInput.setOnSelectListener(change);
    }

    @HippyControllerProps(name = "letterSpacing", defaultType = HippyControllerProps.NUMBER)
    public void setLetterSpacing(HippyTextInput view, float letterSpacing) {
        view.setLetterSpacing(PixelUtil.dp2px(letterSpacing));
    }

    @HippyControllerProps(name = "value", defaultType = HippyControllerProps.STRING)
    public void value(HippyTextInput view, String value) {
        int selectionStart = view.getSelectionStart();
        int selectionEnd = view.getSelectionEnd();
        LogUtils
                .d(TAG, String.format("setText: selectionStart:%s sEnd:%s", selectionStart,
                        selectionEnd));
        Editable editText = view.getEditableText();
        if (editText == null) {
            return;
        }
        String oldValue = editText.toString();
        String sub1 = oldValue.substring(0, selectionStart);
        String sub2 = oldValue.substring(selectionEnd);
        LogUtils.d(TAG, String.format("setText: sub1:[%s]  sub2:[%s]", sub1, sub2));

        if (selectionStart == selectionEnd && value.length() > oldValue.length() && value
                .startsWith(sub1) && value.endsWith(sub2)) {
            // 未选中状态 && insert
            String insertStr = value.substring(selectionStart, value.length() - sub2.length());
            LogUtils.d(TAG, String.format("setText: InsertStr: [%s]", insertStr));
            editText.insert(selectionStart, insertStr);
        } else if (selectionStart < selectionEnd && value.startsWith(sub1) && value
                .endsWith(sub2)) {
            // 选中状态 && replace选中部分
            String replaceStr = value.substring(selectionStart, value.length() - sub2.length());
            LogUtils.d(TAG, String.format("setText: ReplaceStr: [%s]", replaceStr));
            editText.replace(selectionStart, selectionEnd, replaceStr);
        } else if (selectionStart == selectionEnd && value.length() < oldValue.length() && value
                .endsWith(sub2)
                && value
                .startsWith(
                        sub1.substring(0, selectionStart - (oldValue.length() - value.length())))) {
            // 未选中状态 && delete
            int delLen = oldValue.length() - value.length();
            editText.delete(selectionEnd - delLen, selectionEnd);
        } else {
            editText.replace(0, editText.length(), value);
        }
    }


    @HippyControllerProps(name = "placeholder", defaultType = HippyControllerProps.STRING)
    public void placeHolder(HippyTextInput view, String placeholder) {
        view.setHint(placeholder);
    }

    @HippyControllerProps(name = "placeholderTextColor", defaultType = HippyControllerProps.NUMBER, defaultNumber =
            DEFAULT_PLACEHOLDER_TEXT_COLOR)
    public void setTextHitColor(HippyTextInput input, int color) {
        input.setHintTextColor(color);
    }

    @HippyControllerProps(name = "numberOfLines", defaultType = HippyControllerProps.NUMBER, defaultNumber = Integer.MAX_VALUE)
    public void setMaxLines(HippyTextInput input, int numberOfLine) {
        input.setMaxLines(numberOfLine);
    }

    @HippyControllerProps(name = "changetext", defaultType = HippyControllerProps.BOOLEAN)
    public void setOnChangeText(HippyTextInput hippyTextInput, boolean change) {
        hippyTextInput.setOnChangeListener(change);
    }

    @HippyControllerProps(name = "endediting", defaultType = HippyControllerProps.BOOLEAN)
    public void setEndEditing(HippyTextInput hippyTextInput, boolean change) {
        hippyTextInput.setOnEndEditingListener(change);
    }

    @HippyControllerProps(name = "focus", defaultType = HippyControllerProps.BOOLEAN)
    public void setOnFocus(HippyTextInput hippyTextInput, boolean enable) {
        hippyTextInput.setEventListener(enable, HippyTextInput.EVENT_FOCUS);
    }

    @HippyControllerProps(name = "blur", defaultType = HippyControllerProps.BOOLEAN)
    public void setBlur(HippyTextInput hippyTextInput, boolean enable) {
        hippyTextInput.setEventListener(enable, HippyTextInput.EVENT_BLUR);
    }

    @HippyControllerProps(name = "keyboardwillshow", defaultType = HippyControllerProps.BOOLEAN)
    public void setOnKeyboardWillShow(HippyTextInput hippyTextInput, boolean enable) {
        hippyTextInput.setEventListener(enable, HippyTextInput.EVENT_KEYBOARD_SHOW);
    }

    @HippyControllerProps(name = "keyboardwillhide", defaultType = HippyControllerProps.BOOLEAN)
    public void setOnKeyboardWillHide(HippyTextInput hippyTextInput, boolean enable) {
        hippyTextInput.setEventListener(enable, HippyTextInput.EVENT_KEYBOARD_HIDE);
    }

    @HippyControllerProps(name = "contentSizeChange", defaultType = HippyControllerProps.BOOLEAN)
    public void setOnContentSizeChange(HippyTextInput hippyTextInput, boolean contentSizeChange) {
        hippyTextInput.setOnContentSizeChange(contentSizeChange);
    }

    @HippyControllerProps(name = NodeProps.COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber =
            DEFAULT_TEXT_COLOR)
    public void setColor(HippyTextInput hippyTextInput, int change) {
        hippyTextInput.setTextColor(change);
    }

    @HippyControllerProps(name = NodeProps.TEXT_ALIGN, defaultType = HippyControllerProps.STRING)
    public void setTextAlign(HippyTextInput view, String textAlign) {
        if (textAlign == null || "auto".equals(textAlign)) {
            view.setGravityHorizontal(Gravity.NO_GRAVITY);
        } else if ("left".equals(textAlign)) {
            view.setGravityHorizontal(Gravity.LEFT);
        } else if ("right".equals(textAlign)) {
            view.setGravityHorizontal(Gravity.RIGHT);
        } else if ("center".equals(textAlign)) {
            view.setGravityHorizontal(Gravity.CENTER_HORIZONTAL);
        } else if ("justify".equals(textAlign)) {
            view.setGravityHorizontal(Gravity.LEFT);
        }
    }

    @HippyControllerProps(name = NodeProps.TEXT_ALIGN_VERTICAL)
    public void setTextAlignVertical(HippyTextInput view, String textAlignVertical) {
        if (textAlignVertical == null || "auto".equals(textAlignVertical)) {
            view.setGravityVertical(Gravity.NO_GRAVITY);
        } else if ("top".equals(textAlignVertical)) {
            view.setGravityVertical(Gravity.TOP);
        } else if ("bottom".equals(textAlignVertical)) {
            view.setGravityVertical(Gravity.BOTTOM);
        } else if ("center".equals(textAlignVertical)) {
            view.setGravityVertical(Gravity.CENTER_VERTICAL);
        }

    }

    @HippyControllerProps(name = NodeProps.BREAK_STRATEGY, defaultType = HippyControllerProps.STRING)
    public void setBreakStrategy(HippyTextInput view, String strategy) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            int strategyInt;
            switch (strategy) {
                case TextVirtualNode.STRATEGY_HIGH_QUALITY:
                    strategyInt = Layout.BREAK_STRATEGY_HIGH_QUALITY;
                    break;
                case TextVirtualNode.STRATEGY_BALANCED:
                    strategyInt = Layout.BREAK_STRATEGY_BALANCED;
                    break;
                case TextVirtualNode.STRATEGY_SIMPLE:
                default:
                    strategyInt = Layout.BREAK_STRATEGY_SIMPLE;
            }
            // noinspection WrongConstant
            view.setBreakStrategy(strategyInt);
        }
    }

    @Override
    public void dispatchFunction(@NonNull HippyTextInput textInput, @NonNull String functionName,
            @NonNull HippyArray params, @NonNull Promise promise) {
        dispatchFunction(textInput, functionName, params.getInternalArray(), promise);
    }

    @Override
    public void dispatchFunction(@NonNull final HippyTextInput textInput,
            @NonNull String functionName, @NonNull List params, @NonNull Promise promise) {
        if (promise == null) {
            return;
        }
        if (FUNC_GET_VALUE.equals(functionName)) {
            promise.resolve(textInput.jsGetValue());
        } else if (FUNC_IS_FOCUSED.equals(functionName)) {
            promise.resolve(textInput.jsIsFocused());
        }
    }

    @Override
    public void dispatchFunction(@NonNull HippyTextInput textInput, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(textInput, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(@NonNull HippyTextInput textInput,
            @NonNull String functionName, @NonNull List params) {
        super.dispatchFunction(textInput, functionName, params);
        switch (functionName) {
            case FUNC_SET_VALUE:
                handleSetValueFunction(textInput, params);
                break;
            case FUNC_CLEAR:
                textInput.jsSetValue("", 0);
                break;
            case FUNC_FOCUS:
                handleFocusFunction(textInput, params);
                break;
            case FUNC_KEYBOARD_DISMISS:
                textInput.hideInputMethod();
                break;
            case FUNC_BLUR:
                handleBlurFunction(textInput);
                break;
            default:
                LogUtils.e(TAG, "Unknown function name: " + functionName);
        }
    }

    private void handleSetValueFunction(@NonNull HippyTextInput textInput,
            @NonNull List<?> params) {
        try {
            Object element = params.get(0);
            if (element instanceof String) {
                int pos = (params.size() < 2) ? ((String) element).length()
                        : ((Number) params.get(1)).intValue();
                textInput.jsSetValue((String) element, pos);
            } else {
                throw new IllegalArgumentException(
                        "handleSetValueFunction: first element of params: " + element);
            }
        } catch (Exception e) {
            final NativeRender nativeRenderer = NativeRendererManager
                    .getNativeRenderer(textInput.getContext());
            if (nativeRenderer != null) {
                nativeRenderer.handleRenderException(
                        new NativeRenderException(HANDLE_CALL_UI_FUNCTION_ERR, e));
            }
        }
    }

    private void handleFocusFunction(@NonNull final HippyTextInput textInput,
            @NonNull final List params) {
        textInput.setFocusableInTouchMode(true);
        Looper.getMainLooper().myQueue().addIdleHandler(new MessageQueue.IdleHandler() {
            @Override
            public boolean queueIdle() {
                boolean result = textInput.requestFocusFromTouch();
                if (!result) {
                    textInput.requestFocus();
                }
                if (params.isEmpty() || ArrayUtils.getBooleanValue(params, 0)) {
                    textInput.showInputMethodManager();
                }
                return false;
            }
        });
    }

    private void handleBlurFunction(@NonNull HippyTextInput textInput) {
        NativeRender nativeRenderer = NativeRendererManager.getNativeRenderer(
                textInput.getContext());
        if (nativeRenderer == null) {
            return;
        }
        ViewGroup rootView = (ViewGroup) nativeRenderer.getRootView(textInput);
        int oldFocusability = 0;
        if (rootView != null) {
            oldFocusability = rootView.getDescendantFocusability();
            rootView.setDescendantFocusability(ViewGroup.FOCUS_BLOCK_DESCENDANTS);
        }
        textInput.hideInputMethod();
        textInput.clearFocus();
        if (rootView != null) {
            rootView.setDescendantFocusability(oldFocusability);
        }
    }
}
