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

import android.content.Context;
import android.view.View;
import android.view.accessibility.AccessibilityEvent;
import androidx.annotation.Nullable;
import androidx.core.view.AccessibilityDelegateCompat;
import androidx.core.view.ViewCompat;
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat;
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat.RangeInfoCompat;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.R;
import com.tencent.mtt.hippy.adapter.thirdparty.HippyThirdPartyAdapter;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.HashMap;
import java.util.Map;

public class HippyAccessibilityDelegate extends AccessibilityDelegateCompat {
  private static final String TAG = "HippyAccessibilityDelegate";
  public static final String STATE_CHECKED = "checked";
  public static final String STATE_BUSY = "busy";
  public static final String STATE_EXPANDED = "expanded";
  public static final String STATE_MIXED = "mixed";
  public static final String STATE_DISABLED = "disabled";
  public static final String STATE_SELECTED = "selected";

  public enum AccessibilityRole {
    NONE,
    EDIT_TEXT,
    TEXT,
    IMAGE,
    LIST,
    PAGER,
    VIEW_GROUP,
    WEB_VIEW,
    TOAST,
    SCROLL_VIEW,
    HORIZONTAL_SCROLL_VIEW;

    public static String getValue(AccessibilityRole role) {
      switch (role) {
        case EDIT_TEXT:
          return "android.widget.EditText";
        case TEXT:
          return "android.widget.TextView";
        case IMAGE:
          return "android.widget.ImageView";
        case LIST:
          return "androidx.recyclerview.widget.RecyclerView";
        case PAGER:
          return "androidx.viewpager.widget.ViewPager";
        case VIEW_GROUP:
          return "android.view.ViewGroup";
        case WEB_VIEW:
          return "android.webkit.WebView";
        case TOAST:
          return "android.app.Dialog";
        case SCROLL_VIEW:
          return "android.widget.ScrollView";
        case HORIZONTAL_SCROLL_VIEW:
          return "android.widget.HorizontalScrollView";
        default:
          return "android.view.View";
      }
    }

    public static AccessibilityRole fromValue(@Nullable String value) {
      for (AccessibilityRole role : AccessibilityRole.values()) {
        if (role.name().equalsIgnoreCase(value)) {
          return role;
        }
      }
      return NONE;
    }
  }

  protected void setRole(AccessibilityNodeInfoCompat nodeInfo, AccessibilityRole role) {
    if (role == null) {
      role = AccessibilityRole.NONE;
    }
    nodeInfo.setClassName(AccessibilityRole.getValue(role));
    nodeInfo.setRoleDescription(role.name());
  }

  @Override
  public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfoCompat info) {
    super.onInitializeAccessibilityNodeInfo(host, info);
    final AccessibilityRole accessibilityRole =
        (AccessibilityRole) host.getTag(R.id.hippy_accessibility_role);
    if (accessibilityRole != null) {
      setRole(info, accessibilityRole);
    }

    final HashMap<String, Object> accessibilityState =
        (HashMap<String, Object>) host.getTag(R.id.hippy_accessibility_state);
    if (accessibilityState != null) {
      setState(info, accessibilityState);
    }

    final HashMap<String, Object> accessibilityValue =
        (HashMap<String, Object>) host.getTag(R.id.hippy_accessibility_value);
    if (accessibilityValue != null
        && accessibilityValue.containsKey("min")
        && accessibilityValue.containsKey("now")
        && accessibilityValue.containsKey("max")) {
      final Object minObj = accessibilityValue.get("min");
      final Object nowObj = accessibilityValue.get("now");
      final Object maxObj = accessibilityValue.get("max");
      if (minObj instanceof Number && nowObj instanceof Number && maxObj instanceof Number) {
        final int min = ((Number) minObj).intValue();
        final int now = ((Number) nowObj).intValue();
        final int max = ((Number) maxObj).intValue();
        if (max > min && now >= min && max >= now) {
          info.setRangeInfo(RangeInfoCompat.obtain(RangeInfoCompat.RANGE_TYPE_INT, min, max, now));
        }
      }
    }
  }

  @Override
  public void onInitializeAccessibilityEvent(View host, AccessibilityEvent event) {
    super.onInitializeAccessibilityEvent(host, event);

    final HashMap<String, Object> accessibilityValue =
        (HashMap<String, Object>) host.getTag(R.id.hippy_accessibility_value);
    if (accessibilityValue != null
        && accessibilityValue.containsKey("min")
        && accessibilityValue.containsKey("now")
        && accessibilityValue.containsKey("max")) {
      final Object minObj = accessibilityValue.get("min");
      final Object nowObj = accessibilityValue.get("now");
      final Object maxObj = accessibilityValue.get("max");
      if (minObj instanceof Number && nowObj instanceof Number && maxObj instanceof Number) {
        final int min = ((Number) minObj).intValue();
        final int now = ((Number) nowObj).intValue();
        final int max = ((Number) maxObj).intValue();
        if (max > min && now >= min && max >= now) {
          event.setItemCount(max - min);
          event.setCurrentItemIndex(now);
        }
      }
    }
  }

  protected void setState(
      AccessibilityNodeInfoCompat info, HashMap<String, Object> accessibilityState) {
    for (Map.Entry<String, Object> entry : accessibilityState.entrySet()) {
      String state = entry.getKey();
      Object valueObj = entry.getValue();
      if (!(valueObj instanceof Boolean)) {
        continue;
      }
      boolean value = ((Boolean)valueObj).booleanValue();

      switch (state) {
        case STATE_SELECTED:
          info.setSelected(value);
          break;
        case STATE_DISABLED:
          info.setEnabled(!value);
          break;
        case STATE_CHECKED:
          info.setCheckable(true);
          info.setChecked(value);
          break;
        default:
          LogUtils.d(TAG, "Unknown accessibility state:" + state);
      }
    }
  }

  public static void setDelegate(final View view) {
    if (!ViewCompat.hasAccessibilityDelegate(view)
        && (view.getTag(R.id.hippy_accessibility_role) != null
        || view.getTag(R.id.hippy_accessibility_state) != null)) {
      AccessibilityDelegateCompat delegate = null;
      Context context = view.getContext();
      if (context instanceof HippyInstanceContext) {
        HippyEngineContext engineContext = ((HippyInstanceContext)context).getEngineContext();
        HippyThirdPartyAdapter adapter = engineContext.getThirdPartyAdapter();
        if (adapter != null) {
          delegate = adapter.getAccessibilityDelegate();
        }
      }

      if (delegate == null) {
        delegate = new HippyAccessibilityDelegate();
      }
      ViewCompat.setAccessibilityDelegate(view, delegate);
    }
  }
}
