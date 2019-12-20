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
package com.tencent.mtt.hippy.dom.flex;
public enum FlexAlign {
	AUTO,
	FLEX_START,
	CENTER,
	FLEX_END,
	STRETCH,
	BASELINE,
	SPACE_BETWEEN,
	SPACE_AROUND,;
  public static FlexAlign fromInt(int value) {
	    switch (value) {
	      case 0: return AUTO;
	      case 1: return FLEX_START;
	      case 2: return CENTER;
	      case 3: return FLEX_END;
	      case 4: return STRETCH;
	      case 5: return BASELINE;
	      case 6: return SPACE_BETWEEN;
	      case 7: return SPACE_AROUND;
	      default: throw new IllegalArgumentException("Unknown enum value: " + value);
	    }
	  } 
 
}
