/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "HPConvert+HPLayout.h"

@implementation HPConvert (HPLayout)

HP_ENUM_CONVERTER(OverflowType, (@{
    @"hidden": @(OverflowHidden),
    @"visible": @(OverflowVisible),
    @"scroll": @(OverflowScroll),
}),
OverflowVisible, intValue)

HP_ENUM_CONVERTER(FlexDirection, (@{
    @"row": @(FLexDirectionRow),
    @"row-reverse": @(FLexDirectionRowReverse),
    @"column": @(FLexDirectionColumn),
    @"column-reverse": @(FLexDirectionColumnReverse)
}),
FLexDirectionColumn, intValue)

HP_ENUM_CONVERTER(FlexAlign, (@{
    @"auto": @(FlexAlignAuto),
    @"flex-start": @(FlexAlignStart),
    @"flex-end": @(FlexAlignEnd),
    @"center": @(FlexAlignCenter),
    @"space-between": @(FlexAlignSpaceBetween),
    @"stretch": @(FlexAlignStretch),
    @"baseline": @(FlexAlignBaseline),
    @"space-around": @(FlexAlignSpaceAround),
    @"space-evenly": @(FlexAlignSpaceEvenly)
}),
FlexAlignAuto, intValue)

HP_ENUM_CONVERTER(PositionType, (@{ @"absolute": @(PositionTypeAbsolute), @"relative": @(PositionTypeRelative) }), PositionTypeRelative, intValue)

HP_ENUM_CONVERTER(FlexWrapMode, (@{ @"wrap": @(FlexWrap), @"nowrap": @(FlexNoWrap), @"wrap-reverse": @(FlexWrapReverse) }), FlexNoWrap, intValue)

HP_ENUM_CONVERTER(
    DisplayType, (@{ @"flex": @(DisplayTypeFlex), @"block": @(DisplayTypeFlex), @"none": @(DisplayTypeNone) }), DisplayTypeFlex, intValue)

@end
