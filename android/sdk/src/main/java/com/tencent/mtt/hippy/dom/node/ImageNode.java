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


import android.text.style.ImageSpan;

import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;

import java.util.ArrayList;

public class ImageNode extends StyleNode
{
  public static final String PROP_VERTICAL_ALIGNMENT = "verticalAlignment";
  
	private boolean	mIsVirtual;
	private HippyImageSpan mImageSpan = null;
	private int mVerticalAlignment = ImageSpan.ALIGN_BASELINE;
  
  private ArrayList<String>	mGestureTypes	= null;
	
	public ImageNode(boolean mIsVirtual) {
		this.mIsVirtual = mIsVirtual;
	}

	public void setImageSpan(HippyImageSpan imageSpan) {
    mImageSpan = imageSpan;
  }
	
	public int getVerticalAlignment() {
	  return mVerticalAlignment;
  }
	
	public boolean isVirtual()
	{
		return mIsVirtual;
	}
	
	public ArrayList<String> getGestureTypes() {
	  return mGestureTypes;
  }
  
  @HippyControllerProps(name = NodeProps.ON_CLICK, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
  public void clickEnable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_CLICK);
    }
  }
  
  @HippyControllerProps(name = NodeProps.ON_LONG_CLICK, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
  public void longClickEnable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_LONG_CLICK);
    }
  }
  
  @HippyControllerProps(name = NodeProps.ON_PRESS_IN, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
  public void pressInEnable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_PRESS_IN);
    }
  }
  
  @HippyControllerProps(name = NodeProps.ON_PRESS_OUT)
  public void pressOutEnable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_PRESS_OUT);
    }
  }
  
  @HippyControllerProps(name = NodeProps.ON_TOUCH_DOWN, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
  public void touchDownEnable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_DOWN);
    }
  }
  
  @HippyControllerProps(name = NodeProps.ON_TOUCH_MOVE, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
  public void touchUpEnable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_MOVE);
    }
  }
  
  @HippyControllerProps(name = NodeProps.ON_TOUCH_END, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
  public void touchEndEnable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_END);
    }
  }
  
  @HippyControllerProps(name = NodeProps.ON_TOUCH_CANCEL, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
  public void touchCancelable(boolean flag)
  {
    if (flag)
    {
      if (mGestureTypes == null)
      {
        mGestureTypes = new ArrayList<>();
      }
      mGestureTypes.add(NodeProps.ON_TOUCH_CANCEL);
    }
  }
  
  @HippyControllerProps(name = PROP_VERTICAL_ALIGNMENT, defaultType = HippyControllerProps.NUMBER, defaultNumber = ImageSpan.ALIGN_BASELINE)
  public void setVerticalAlignment(int verticalAlignment)
  {
    mVerticalAlignment = verticalAlignment;
  }
  
  @HippyControllerProps(name = "src", defaultType = HippyControllerProps.STRING, defaultString = "")
  public void setUrl(String url)
  {
    if (mImageSpan != null) {
      mImageSpan.setUrl(url);
    }
  }
}
