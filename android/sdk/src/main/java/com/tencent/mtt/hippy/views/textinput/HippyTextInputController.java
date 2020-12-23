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
import android.graphics.PorterDuff;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Looper;
import android.os.MessageQueue;
import android.text.Editable;
import android.text.InputFilter;
import android.text.InputType;
import android.text.TextUtils;
import android.text.method.PasswordTransformationMethod;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.inputmethod.EditorInfo;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.dom.node.StyleNode;
import com.tencent.mtt.hippy.dom.node.TextExtra;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;

import java.util.LinkedList;

/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2017/12/19 20:31
 * @version: V1.0
 */

@HippyController(name = HippyTextInputController.CLASS_NAME)
public class HippyTextInputController extends HippyViewController<HippyTextInput>
{

	public static final String	CLASS_NAME						= "TextInput";
	private static final String	TAG								= "HippyTextInputControlle";

	private static final int	INPUT_TYPE_KEYBOARD_NUMBERED	= InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL
																		| InputType.TYPE_NUMBER_FLAG_SIGNED;

	private static final String	KEYBOARD_TYPE_EMAIL_ADDRESS		= "email";
	private static final String	KEYBOARD_TYPE_NUMERIC			= "numeric";
	private static final String	KEYBOARD_TYPE_PHONE_PAD			= "phone-pad";
	private static final String	KEYBOARD_TYPE_PASS_WORD			= "password";

	private static final String	CLEAR_FUNCTION					= "clear";
	public static final String	COMMAND_FOCUS					= "focusTextInput";
	public static final String	COMMAND_BLUR					= "blurTextInput";
	public static final String	COMMAND_getValue					= "getValue";
	public static final String	COMMAND_setValue					= "setValue";
	public static final String	COMMAND_KEYBOARD_DISMISS					= "dissmiss";

	@Override
	protected View createViewImpl(Context context)
	{
		HippyTextInput hippyTextInput = new HippyTextInput(context);
		return hippyTextInput;
	}

	@Override
	protected StyleNode createNode(boolean isVirtual)
	{
		return new TextInputNode(isVirtual);
	}

	@Override
	protected void updateExtra(View view, Object object)
	{
		super.updateExtra(view, object);

		if (object instanceof TextExtra)
		{
			TextExtra textExtra = (TextExtra) object;
			HippyTextInput hippyTextInput = (HippyTextInput) view;
			hippyTextInput.setPadding((int) Math.ceil(textExtra.mLeftPadding), (int) Math.ceil(textExtra.mTopPadding),
					(int) Math.ceil(textExtra.mRightPadding), (int) Math.ceil(textExtra.mBottomPadding));
		}
	}

	@HippyControllerProps(name = NodeProps.FONT_SIZE, defaultType = HippyControllerProps.NUMBER, defaultNumber = 14)
	public void setFontSize(HippyTextInput hippyTextInput, float fontSize)
	{
		hippyTextInput.setTextSize(TypedValue.COMPLEX_UNIT_PX, (int) Math.ceil(PixelUtil.dp2px(fontSize)));
	}

	@HippyControllerProps(name = "defaultValue", defaultType = HippyControllerProps.STRING, defaultString = "")
	public void setDefaultValue(HippyTextInput hippyTextInput, String defaultValue)
	{
		String strOld = hippyTextInput.getText().toString();
		if(!TextUtils.equals(strOld,defaultValue))
		{
		hippyTextInput.setText(defaultValue);
		if (!TextUtils.isEmpty(defaultValue))
			hippyTextInput.setSelection(defaultValue.length());
		}
	}
	@HippyControllerProps(name = "validator", defaultType = HippyControllerProps.STRING, defaultString = "")
	public void setValidator(HippyTextInput hippyTextInput, String strValidator)
	{
		hippyTextInput.setValidator(strValidator);
	}
	@HippyControllerProps(name = "editable", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
	public void setEditable(HippyTextInput hippyTextInput, boolean editable)
	{
		hippyTextInput.setEnabled(editable);
	}
	/** 设置输入光标颜色 **///RN 语法 caret-color
	@HippyControllerProps(name = "caret-color", defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setCaretColor(HippyTextInput hippyTextInput, int cursorColor)
	{
		hippyTextInput.setCursorColor(cursorColor);
	}
	/** 设置输入光标颜色 **/
	//For Vue.vue的前端语法，会把caret-color转化成caretColor
	@HippyControllerProps(name = "caretColor", defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setCaretColorAlias(HippyTextInput hippyTextInput, int cursorColor)
	{
		hippyTextInput.setCursorColor(cursorColor);
	}
	@HippyControllerProps(name = "multiline", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
	public void multiLine(HippyTextInput hippyTextInput, boolean multiline)
	{
		int inputType = hippyTextInput.getInputType();
		if (multiline)
		{
			inputType = inputType | InputType.TYPE_TEXT_FLAG_MULTI_LINE;
		}
		else
		{
			inputType &= ~InputType.TYPE_TEXT_FLAG_MULTI_LINE;
		}
		hippyTextInput.setInputType(inputType);
		if (multiline)
		{
			hippyTextInput.setGravityVertical(Gravity.TOP);
		}
	}

	@HippyControllerProps(name = "returnKeyType")
	public void setReturnKeyType(HippyTextInput view, String returnKeyType)
	{

		int returnKeyFlag = EditorInfo.IME_ACTION_DONE;
		if (returnKeyType != null)
		{
			switch (returnKeyType)
			{
				case "go":
					returnKeyFlag = EditorInfo.IME_ACTION_GO;
					break;
				case "next":
					returnKeyFlag = EditorInfo.IME_ACTION_NEXT;
					view.setSingleLine(true);
					break;
				case "none":
					returnKeyFlag = EditorInfo.IME_ACTION_NONE;
					break;
				case "previous":
					returnKeyFlag = EditorInfo.IME_ACTION_PREVIOUS;
					view.setSingleLine(true);
					break;
				case "search":
					returnKeyFlag = EditorInfo.IME_ACTION_SEARCH;
					view.setSingleLine(true);
					break;
				case "send":
					returnKeyFlag = EditorInfo.IME_ACTION_SEND;
					view.setSingleLine(true);
					break;
				case "done":
					returnKeyFlag = EditorInfo.IME_ACTION_DONE;
					view.setSingleLine(true);
					break;
			}
		}
		view.setImeOptions(returnKeyFlag | EditorInfo.IME_FLAG_NO_FULLSCREEN);
	}

	@HippyControllerProps(name = "keyboardType", defaultType = HippyControllerProps.STRING, defaultString = "")
	public void setKeyboardType(HippyTextInput hippyTextInput, String keyboardType)
	{
		int flagsToSet = InputType.TYPE_CLASS_TEXT;
		if (KEYBOARD_TYPE_NUMERIC.equalsIgnoreCase(keyboardType))
		{
			flagsToSet = INPUT_TYPE_KEYBOARD_NUMBERED;
		}
		else if (KEYBOARD_TYPE_EMAIL_ADDRESS.equalsIgnoreCase(keyboardType))
		{
			flagsToSet = InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS | InputType.TYPE_CLASS_TEXT;
		}
		else if (KEYBOARD_TYPE_PHONE_PAD.equalsIgnoreCase(keyboardType))
		{
			flagsToSet = InputType.TYPE_CLASS_PHONE;
		}
		else if (KEYBOARD_TYPE_PASS_WORD.equalsIgnoreCase(keyboardType))
		{
			flagsToSet = InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD;
			hippyTextInput.setTransformationMethod(PasswordTransformationMethod.getInstance());
		}

		hippyTextInput.setInputType(flagsToSet);
	}

	private static int parseFontWeight(String fontWeightString)
	{
		// This should be much faster than using regex to verify input and Integer.parseInt
		return fontWeightString.length() == 3 && fontWeightString.endsWith("00") && fontWeightString.charAt(0) <= '9'
				&& fontWeightString.charAt(0) >= '1' ? 100 * (fontWeightString.charAt(0) - '0') : -1;
	}

	@HippyControllerProps(name = NodeProps.FONT_STYLE, defaultType = HippyControllerProps.STRING, defaultString = "normal")
	public void setFontStyle(HippyTextInput view, String fontStyleString)
	{
		if (TextUtils.isEmpty(fontStyleString))
		{
			return;
		}
		int fontStyle = -1;
		if ("italic".equals(fontStyleString))
		{
			fontStyle = Typeface.ITALIC;
		}
		else if ("normal".equals(fontStyleString))
		{
			fontStyle = Typeface.NORMAL;
		}

		Typeface currentTypeface = view.getTypeface();
		if (currentTypeface == null)
		{
			currentTypeface = Typeface.DEFAULT;
		}
		if (fontStyle != currentTypeface.getStyle())
		{
			view.setTypeface(currentTypeface, fontStyle);
		}
	}

	@HippyControllerProps(name = NodeProps.FONT_WEIGHT, defaultType = HippyControllerProps.STRING, defaultString = "normal")
	public void setFontWeight(HippyTextInput view, String fontWeightString)
	{
		int fontWeightNumeric = fontWeightString != null ? parseFontWeight(fontWeightString) : -1;
		int fontWeight = -1;
		if (fontWeightNumeric >= 500 || "bold".equals(fontWeightString))
		{
			fontWeight = Typeface.BOLD;
		}
		else if ("normal".equals(fontWeightString) || (fontWeightNumeric != -1 && fontWeightNumeric < 500))
		{
			fontWeight = Typeface.NORMAL;
		}
		Typeface currentTypeface = view.getTypeface();
		if (currentTypeface == null)
		{
			currentTypeface = Typeface.DEFAULT;
		}
		if (fontWeight != currentTypeface.getStyle())
		{
			view.setTypeface(currentTypeface, fontWeight);
		}
	}

	@HippyControllerProps(name = NodeProps.FONT_FAMILY, defaultType = HippyControllerProps.STRING, defaultString = "normal")
	public void setFontFamily(HippyTextInput view, String fontFamily)
	{
		if (TextUtils.isEmpty(fontFamily))
		{
			return;
		}
		int style = Typeface.NORMAL;
		if (view.getTypeface() != null)
		{
			style = view.getTypeface().getStyle();
		}
		Typeface newTypeface = Typeface.create(fontFamily, style);
		view.setTypeface(newTypeface);
	}

	private static final InputFilter[]	EMPTY_FILTERS	= new InputFilter[0];

	@HippyControllerProps(name = "maxLength", defaultType = HippyControllerProps.NUMBER, defaultNumber = Integer.MAX_VALUE)
	public void maxLength(HippyTextInput view, int maxLength)
	{
		InputFilter[] currentFilters = view.getFilters();
		InputFilter[] newFilters = EMPTY_FILTERS;

		if (maxLength == -1)
		{
			if (currentFilters.length > 0)
			{
				LinkedList<InputFilter> list = new LinkedList<>();
				for (int i = 0; i < currentFilters.length; i++)
				{
					if (!(currentFilters[i] instanceof InputFilter.LengthFilter))
					{
						list.add(currentFilters[i]);
					}
				}
				if (!list.isEmpty())
				{
					newFilters = (InputFilter[]) list.toArray(new InputFilter[list.size()]);
				}
			}
		}
		else
		{
			if (currentFilters.length > 0)
			{
				newFilters = currentFilters;
				boolean replaced = false;
				for (int i = 0; i < currentFilters.length; i++)
				{
					if (currentFilters[i] instanceof InputFilter.LengthFilter)
					{
						currentFilters[i] = new InputFilter.LengthFilter(maxLength);
						replaced = true;
					}
				}
				if (!replaced)
				{
					newFilters = new InputFilter[currentFilters.length + 1];
					System.arraycopy(currentFilters, 0, newFilters, 0, currentFilters.length);
					currentFilters[currentFilters.length] = new InputFilter.LengthFilter(maxLength);
				}
			}
			else
			{
				newFilters = new InputFilter[1];
				newFilters[0] = new InputFilter.LengthFilter(maxLength);
			}
		}

		view.setFilters(newFilters);
	}

	@HippyControllerProps(name = "onSelectionChange", defaultType = "boolean")
	public void setOnSelectionChange(HippyTextInput hippyTextInput, boolean change)
	{
		hippyTextInput.setOnSelectListener(change);
	}

	@HippyControllerProps(name = "letterSpacing", defaultType = HippyControllerProps.NUMBER, defaultNumber = -1)
	public void letterSpacing(HippyTextInput view, float letterSpacing)
	{
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && letterSpacing != -1)
		{
			view.setLetterSpacing(PixelUtil.dp2px(letterSpacing));
		}
	}

	@HippyControllerProps(name = "value", defaultType = HippyControllerProps.STRING, defaultString = "")
	public void value(HippyTextInput view, String value)
	{
		int selectionStart = view.getSelectionStart();
		int selectionEnd = view.getSelectionEnd();
		LogUtils.d(TAG, String.format("setText: selectionStart:%s sEnd:%s", selectionStart, selectionEnd));
		Editable editText = view.getEditableText();
		if (editText == null)
			return;
		String oldValue = editText.toString();
		String sub1 = oldValue.substring(0, selectionStart);
		String sub2 = oldValue.substring(selectionEnd);
		LogUtils.d(TAG, String.format("setText: sub1:[%s]  sub2:[%s]", sub1, sub2));

		if (selectionStart == selectionEnd && value.length() > oldValue.length() && value.startsWith(sub1) && value.endsWith(sub2))
		{
			// 未选中状态 && insert
			String insertStr = value.substring(selectionStart, value.length() - sub2.length());
			LogUtils.d(TAG, String.format("setText: InsertStr: [%s]", insertStr));
			editText.insert(selectionStart, insertStr);
		}
		else if (selectionStart < selectionEnd && value.startsWith(sub1) && value.endsWith(sub2))
		{
			// 选中状态 && replace选中部分
			String replaceStr = value.substring(selectionStart, value.length() - sub2.length());
			LogUtils.d(TAG, String.format("setText: ReplaceStr: [%s]", replaceStr));
			editText.replace(selectionStart, selectionEnd, replaceStr);
		}
		else if (selectionStart == selectionEnd && value.length() < oldValue.length() && value.endsWith(sub2)
				&& value.startsWith(sub1.substring(0, selectionStart - (oldValue.length() - value.length()))))
		{
			// 未选中状态 && delete
			int delLen = oldValue.length() - value.length();
			editText.delete(selectionEnd - delLen, selectionEnd);
		}
		else
		{
			editText.replace(0, editText.length(), value);
		}
	}


	@HippyControllerProps(name = "placeholder", defaultType = HippyControllerProps.STRING)
	public void placeHolder(HippyTextInput view, String placeholder)
	{
		view.setHint(placeholder);
	}

	@HippyControllerProps(name = "placeholderTextColor", defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.GRAY)
	public void setTextHitColor(HippyTextInput input, int color)
	{
		input.setHintTextColor(color);
	}

	@HippyControllerProps(name = "numberOfLines", defaultType = HippyControllerProps.NUMBER, defaultNumber = Integer.MAX_VALUE)
	public void setMaxLines(HippyTextInput input, int numberOfLine)
	{
		input.setMaxLines(numberOfLine);
	}


	@HippyControllerProps(name = "underlineColorAndroid", defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
	public void setUnderlineColor(HippyTextInput view, Integer underlineColor)
	{
		if (underlineColor == null)
		{
			view.getBackground().clearColorFilter();
		}
		else
		{
			view.getBackground().setColorFilter(underlineColor, PorterDuff.Mode.SRC_IN);
		}
	}

	@HippyControllerProps(name = "onChangeText", defaultType = HippyControllerProps.BOOLEAN)
	public void setOnChangeText(HippyTextInput hippyTextInput, boolean change)
	{
		hippyTextInput.setOnChangeListener(change);
	}

	@HippyControllerProps(name = "onEndEditing", defaultType = HippyControllerProps.BOOLEAN)
	public void setEndEditing(HippyTextInput hippyTextInput, boolean change)
	{
		hippyTextInput.setOnEndEditingListener(change);
	}

	@HippyControllerProps(name = "onFocus", defaultType = HippyControllerProps.BOOLEAN)
	public void setOnFocus(HippyTextInput hippyTextInput, boolean change)
	{
		hippyTextInput.setBlurOrOnFocus(change);
	}

	@HippyControllerProps(name = "onBlur", defaultType = HippyControllerProps.BOOLEAN)
	public void setBlur(HippyTextInput hippyTextInput, boolean change)
	{
		hippyTextInput.setBlurOrOnFocus(change);
	}

	@HippyControllerProps(name = "onContentSizeChange", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
	public void setOnContentSizeChange(HippyTextInput hippyTextInput, boolean contentSizeChange)
	{
		hippyTextInput.setOnContentSizeChange(contentSizeChange);
	}

	@HippyControllerProps(name = NodeProps.COLOR, defaultType = HippyControllerProps.NUMBER)
	public void setColor(HippyTextInput hippyTextInput, int change)
	{
		hippyTextInput.setTextColor(change);
	}


	@HippyControllerProps(name = NodeProps.TEXT_ALIGN, defaultType = HippyControllerProps.STRING)
	public void setTextAlign(HippyTextInput view, String textAlign)
	{
		if (textAlign == null || "auto".equals(textAlign))
		{
			view.setGravityHorizontal(Gravity.NO_GRAVITY);
		}
		else if ("left".equals(textAlign))
		{
			view.setGravityHorizontal(Gravity.LEFT);
		}
		else if ("right".equals(textAlign))
		{
			view.setGravityHorizontal(Gravity.RIGHT);
		}
		else if ("center".equals(textAlign))
		{
			view.setGravityHorizontal(Gravity.CENTER_HORIZONTAL);
		}
		else if ("justify".equals(textAlign))
		{
			view.setGravityHorizontal(Gravity.LEFT);
		}
	}

	@HippyControllerProps(name = NodeProps.TEXT_ALIGN_VERTICAL)
	public void setTextAlignVertical(HippyTextInput view, String textAlignVertical)
	{
		if (textAlignVertical == null || "auto".equals(textAlignVertical))
		{
			view.setGravityVertical(Gravity.NO_GRAVITY);
		}
		else if ("top".equals(textAlignVertical))
		{
			view.setGravityVertical(Gravity.TOP);
		}
		else if ("bottom".equals(textAlignVertical))
		{
			view.setGravityVertical(Gravity.BOTTOM);
		}
		else if ("center".equals(textAlignVertical))
		{
			view.setGravityVertical(Gravity.CENTER_VERTICAL);
		}

	}

  @Override
  public void dispatchFunction(final HippyTextInput view, String functionName, HippyArray params, Promise promise)
  {
    switch (functionName)
    {
      case COMMAND_getValue:
        if (promise != null) {
          HippyMap resultMap = view.jsGetValue();
          promise.resolve(resultMap);
        }
        break;
    }
  }

	@Override
	public void dispatchFunction(final HippyTextInput view, String functionName, final HippyArray var)
	{
		switch (functionName)
		{
			case COMMAND_setValue:
				if(var != null && var.getString(0) !=null )
				{
					int pos = var.getInt(1);
					if(var.size()<2 )
						pos = var.getString(0).length();
					view.jsSetValue(var.getString(0),pos);
				}
				break;
			case CLEAR_FUNCTION:
				view.jsSetValue("",0);
				break;
			case COMMAND_FOCUS:
				view.setFocusableInTouchMode(true);
				Looper.getMainLooper().myQueue().addIdleHandler(new MessageQueue.IdleHandler()
				{
					@Override
					public boolean queueIdle()
					{
						boolean result = view.requestFocusFromTouch();
						LogUtils.d("InputText", " requestFocusFromTouch result:" + result);
						if (!result)
						{
							result = view.requestFocus();
							LogUtils.d("InputText", "requestFocus result:" + result);
						}
						if(var.getObject(0) == null || var.getBoolean(0) == true)
						{
						view.showInputMethodManager();
						}
						return false;
					}
				});
				break;
				case COMMAND_KEYBOARD_DISMISS:
					view.hideInputMethod();
					break;
			case COMMAND_BLUR:
				// view.setFocusableInTouchMode(false);
				/**
				 * This view will block any of its descendants from getting focus, even
				 * if they are focusable.
				 * public static final int FOCUS_BLOCK_DESCENDANTS = 0x60000;
				 * 
				 * 为了避免在clearFoucus过后,不要让HippyRootView的其他View获得焦点,先把HippyRootView的焦点屏蔽掉.
				 * https://git.code.oa.com/hippy/hippy/issues/41
				 */

				//find the HippyRootView
				ViewParent viewParent = view.getParent();
				while (viewParent != null)
				{
					if (viewParent instanceof HippyRootView)
						break;
					viewParent = viewParent.getParent();
				}
				int oldFoucusAbaility = 0;
				if (viewParent != null && viewParent instanceof HippyRootView)
				{
					oldFoucusAbaility = ((ViewGroup) viewParent).getDescendantFocusability(); //Get the current value
					((ViewGroup) viewParent).setDescendantFocusability(ViewGroup.FOCUS_BLOCK_DESCENDANTS);//Block the fouse.
				}
				view.hideInputMethod();
				view.clearFocus();
				if (viewParent != null && viewParent instanceof HippyRootView)
				{
					((ViewGroup) viewParent).setDescendantFocusability(oldFoucusAbaility);
				}
				break;
		}
		super.dispatchFunction(view, functionName, var);
	}
}
