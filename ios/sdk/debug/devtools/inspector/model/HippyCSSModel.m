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

#import "HippyCSSModel.h"
#import "HippyCSSPropsDefine.h"
#import "HippyLog.h"
#import "HippyUtils.h"

typedef NSDictionary<NSString *, NSArray<NSString *> *> HippyStyleEnumMap;

// CSS JSON Key Define
NSString *const HippyCSSKeyComputedStyle = @"computedStyle";
NSString *const HippyCSSKeyInlineStyleKey = @"inlineStyle";
NSString *const HippyCSSKeyCSSProperties = @"cssProperties";
NSString *const HippyCSSKeyShorthandEntries = @"shorthandEntries";
NSString *const HippyCSSKeyCSSText = @"cssText";
NSString *const HippyCSSKeyRange = @"range";
NSString *const HippyCSSKeyName = @"name";
NSString *const HippyCSSKeyValue = @"value";
NSString *const HippyCSSKeyImportant = @"important";
NSString *const HippyCSSKeyImplicit = @"implicit";
NSString *const HippyCSSKeyText = @"text";
NSString *const HippyCSSKeyParsedOK = @"parsedOk";
NSString *const HippyCSSKeyDisabled = @"disabled";
NSString *const HippyCSSKeyStartLine = @"startLine";
NSString *const HippyCSSKeyStartColumn = @"startColumn";
NSString *const HippyCSSKeyEndLine = @"endLine";
NSString *const HippyCSSKeyEndColumn = @"endColumn";
NSString *const HippyCSSKeyStyleSheetId = @"styleSheetId";

// Default value
NSString *const HippyCSSDefaultLength = @"0";
NSString *const HippyCSSDefaultDisplay = @"block";
NSString *const HippyCSSDefaultPosition = @"relative";

@interface HippyCSSModel ()

@property (nonatomic, strong) HippyStyleEnumMap *styleEnumMap;
@property (nonatomic, strong) NSSet<NSString *> *styleNumberSet;
@property (nonatomic, strong) NSDictionary<NSString *, NSString *> *boxModelRequireMap;

@end

@implementation HippyCSSModel

#pragma mark - initialize method
- (instancetype)init {
    self = [super init];
    if (self) {
        [self initializeStyleEnumMap];
        [self initializeStyleNumberSet];
        [self initializeBoxModelRequireMap];
    }
    return self;
}

#pragma mark - CSS Protocol
- (NSDictionary *)matchedStyleJSONWithNode:(HippyVirtualNode *)node {
    if (!node || node.props.count <= 0) {
        HippyLogWarn(@"CSS Model, matched style, node is nil or props is empty");
        return @{};
    }
    NSDictionary *cssStyleDic = [self assemblyCSSStyleJSONWithProps:node.props nodeId:node.hippyTag];
    return @{
        HippyCSSKeyInlineStyleKey : cssStyleDic
    };
}

- (NSDictionary *)computedStyleJSONWithNode:(HippyVirtualNode *)node {
    if (!node || node.props.count <= 0) {
        HippyLogWarn(@"CSS Model, computed style, node is nil or props is empty");
        return @{};
    }
    NSArray *computedStyles = [self assemblyComputedStyleJSONWithProps:node.props
                                                                 width:@(node.frame.size.width)
                                                                height:@(node.frame.size.height)];
    return @{
        HippyCSSKeyComputedStyle : computedStyles
    };
}

- (NSDictionary *)inlineStyleJSONWithNode:(HippyVirtualNode *)node {
    return @{};
}

- (NSDictionary *)styleTextJSONWithNode:(HippyVirtualNode *)node{
    if (!node || node.props.count <= 0) {
        HippyLogWarn(@"CSS Model, style text json, node is nil or props is empty");
        return @{};
    }
    return @{};
}

#pragma mark - private method
- (NSDictionary *)assemblyCSSStyleJSONWithProps:(NSDictionary *)props
                                         nodeId:(NSNumber *)nodeId {
    if (props.count <= 0) {
        return @{};
    }
    NSMutableArray *cssProps = [NSMutableArray array];
    NSMutableString *allOfCSSText = [NSMutableString string];
    for (NSString *propKey in props) {
        if (![self canHandleStyle:propKey]) {
            continue;
        }
        NSString *cssName = [self unCamelize:propKey];
        NSString *cssValue = [NSString stringWithFormat:@"%@", props[propKey]];
        NSString *cssPropStr = [NSString stringWithFormat:@"%@:%@", cssName, cssValue];
        NSDictionary *rangeDic = [self assemblyRangeJSONWithStartLine:0
                                                          startColumn:allOfCSSText.length
                                                              endLine:0
                                                            endColumn:allOfCSSText.length + cssPropStr.length + 1];
        NSDictionary *cssPropDic = [self assemblyCSSPropertyWithName:cssName
                                                               value:cssValue
                                                           rangeJSON:rangeDic];
        [cssProps addObject:cssPropDic];
        [allOfCSSText appendFormat:@"%@;", cssPropStr];
    }
    NSMutableDictionary *resultDictionary = [NSMutableDictionary dictionary];
    resultDictionary[HippyCSSKeyStyleSheetId] = nodeId;
    resultDictionary[HippyCSSKeyCSSProperties] = cssProps;
    resultDictionary[HippyCSSKeyShorthandEntries] = @{};
    resultDictionary[HippyCSSKeyCSSText] = allOfCSSText;
    resultDictionary[HippyCSSKeyRange] = [self assemblyRangeJSONWithStartLine:0
                                                                  startColumn:0
                                                                      endLine:0
                                                                    endColumn:allOfCSSText.length];
    return resultDictionary;
}

- (NSArray *)assemblyComputedStyleJSONWithProps:(NSDictionary *)props
                                               width:(NSNumber *)width
                                              height:(NSNumber *)height {
    if (props.count <= 0) {
        return @[];
    }
    NSMutableArray *computedStyles = [NSMutableArray array];
    for (NSString *propKey in props) {
        if (![self canHandleStyle:propKey] ||
            [propKey isEqualToString:HippyDevtoolsCSSPropWidth] ||
            [propKey isEqualToString:HippyDevtoolsCSSPropHeight]) {
            continue;
        }
        NSString *cssName = [self unCamelize:propKey];
        NSString *cssValue = [NSString stringWithFormat:@"%@", props[propKey]];
        NSDictionary *cssProp = [self assemblyStylePropertyWithName:cssName value:cssValue];
        [computedStyles addObject:cssProp];
    }
    for (NSString *boxModelKey in self.boxModelRequireMap) {
        if ([props.allKeys containsObject:boxModelKey]) {
            continue;
        }
        NSString *boxModelName = [self unCamelize:boxModelKey];
        NSString *boxModelValue = [NSString stringWithFormat:@"%@", self.boxModelRequireMap[boxModelKey]];
        NSDictionary *boxModelDic = [self assemblyStylePropertyWithName:boxModelName value:boxModelValue];
        [computedStyles addObject:boxModelDic];
    }
    [computedStyles addObject:[self assemblyStylePropertyWithName:[self unCamelize:HippyDevtoolsCSSPropWidth]
                                                            value:[width stringValue]]];
    [computedStyles addObject:[self assemblyStylePropertyWithName:[self unCamelize:HippyDevtoolsCSSPropHeight]
                                                            value:[height stringValue]]];
    return [computedStyles copy];
}

- (NSDictionary *)assemblyRangeJSONWithStartLine:(NSInteger)startLine
                                     startColumn:(NSInteger)startColumn
                                         endLine:(NSInteger)endLine
                                       endColumn:(NSInteger)endColumn {
    return @{
        HippyCSSKeyStartLine : @(startLine),
        HippyCSSKeyStartColumn : @(startColumn),
        HippyCSSKeyEndLine : @(endLine),
        HippyCSSKeyEndColumn : @(endColumn)
    };
}

- (NSDictionary *)assemblyCSSPropertyWithName:(NSString *)name
                                        value:(NSString *)value
                                    rangeJSON:(NSDictionary *)rangeJSON {
    return @{
        HippyCSSKeyName : name != nil ? name : @"",
        HippyCSSKeyValue : value != nil ? value : @"",
        HippyCSSKeyImportant : @(NO),
        HippyCSSKeyImplicit : @(NO),
        HippyCSSKeyText : @"",
        HippyCSSKeyParsedOK : @(YES),
        HippyCSSKeyDisabled : @(NO),
        HippyCSSKeyRange : rangeJSON != nil ? rangeJSON : @{}
    };
}

- (NSDictionary *)assemblyStylePropertyWithName:(NSString *)name
                                          value:(NSString *)value {
    return @{
        HippyCSSKeyName : name != nil ? name : @"",
        HippyCSSKeyValue : value != nil ? value : @""
    };
}

/**
 * a-b to aB
 */
- (NSString *)camelize:(NSString *)originStr {
    if (originStr.length <= 0) {
        HippyLogInfo(@"CSS Model, camelize, origin string is empty");
        return @"";
    }
    NSArray<NSString *> *splitStrings = [originStr componentsSeparatedByString:@"-"];
    NSMutableString *resultString = [NSMutableString stringWithString:@""];
    BOOL isHeadString = true;
    for (NSString *tempStr in splitStrings) {
        if (isHeadString) {
            [resultString appendString:tempStr];
            isHeadString = false;
            continue;
        }
        [resultString appendString:[tempStr capitalizedString]];
    }
    return resultString;
}

/**
 * aB to a-b
 */
- (NSString *)unCamelize:(NSString *)originStr {
    if (originStr.length <= 0) {
        HippyLogInfo(@"CSS Model, unCamelize, origin string is empty");
        return @"";
    }
    NSMutableString *resultString = [NSMutableString stringWithString:@""];
    NSString *regularString = @"[A-Z]";
    NSString *tempOriginStr = [originStr copy];
    NSRange range = [tempOriginStr rangeOfString:regularString options:NSRegularExpressionSearch];
    while (range.location != NSNotFound) {
        if (range.location != 0) {
            [resultString appendFormat:@"%@-", [[tempOriginStr substringToIndex:range.location] lowercaseString]];
            tempOriginStr = [tempOriginStr substringFromIndex:range.location];
        }
        tempOriginStr = [tempOriginStr stringByReplacingCharactersInRange:NSMakeRange(0, 1)
                                                               withString:[[tempOriginStr substringToIndex:1] lowercaseString]];
        range = [tempOriginStr rangeOfString:regularString options:NSRegularExpressionSearch];
    }
    [resultString appendString:tempOriginStr];
    return resultString;
}

- (BOOL)canHandleStyle:(NSString *)obj {
    return [self.styleNumberSet containsObject:obj] || [self.styleEnumMap.allKeys containsObject:obj];
}

- (void)initializeStyleNumberSet {
    self.styleNumberSet = [NSSet setWithArray:@[
        HippyDevtoolsCSSPropFlex,
        HippyDevtoolsCSSPropFlexGrow,
        HippyDevtoolsCSSPropFlexShrink,
        HippyDevtoolsCSSPropFlexBasis,
        HippyDevtoolsCSSPropWidth,
        HippyDevtoolsCSSPropHeight,
        HippyDevtoolsCSSPropMaxWidth,
        HippyDevtoolsCSSPropMinWidth,
        HippyDevtoolsCSSPropMaxHeight,
        HippyDevtoolsCSSPropMinHeight,
        HippyDevtoolsCSSPropMarginTop,
        HippyDevtoolsCSSPropMarginLeft,
        HippyDevtoolsCSSPropMarginRight,
        HippyDevtoolsCSSPropMarginBottom,
        HippyDevtoolsCSSPropPaddingTop,
        HippyDevtoolsCSSPropPaddingLeft,
        HippyDevtoolsCSSPropPaddingRight,
        HippyDevtoolsCSSPropPaddingBottom,
        HippyDevtoolsCSSPropBorderWidth,
        HippyDevtoolsCSSPropBorderTopWidth,
        HippyDevtoolsCSSPropBorderLeftWidth,
        HippyDevtoolsCSSPropBorderRightWidth,
        HippyDevtoolsCSSPropBorderBottomWidth,
        HippyDevtoolsCSSPropBorderRadius,
        HippyDevtoolsCSSPropBorderTopLeftRadius,
        HippyDevtoolsCSSPropBorderTopRightRadius,
        HippyDevtoolsCSSPropBorderBottomLeftRadius,
        HippyDevtoolsCSSPropBorderBottomRightRadius,
        HippyDevtoolsCSSPropTop,
        HippyDevtoolsCSSPropLeft,
        HippyDevtoolsCSSPropRight,
        HippyDevtoolsCSSPropBottom,
        HippyDevtoolsCSSPropZIndex,
        HippyDevtoolsCSSPropOpacity,
        HippyDevtoolsCSSPropFontSize,
        HippyDevtoolsCSSPropLineHeight
    ]];
}

- (void)initializeStyleEnumMap {
    self.styleEnumMap = @{
        HippyDevtoolsCSSPropDisplay : @[HippyDevtoolsCSSPropValueDisplayFlex,
                                        HippyDevtoolsCSSPropValueDisplayNone],
        HippyDevtoolsCSSPropFlexDirection : @[HippyDevtoolsCSSPropValueColumn,
                                              HippyDevtoolsCSSPropValueColumnReverse,
                                              HippyDevtoolsCSSPropValueRow,
                                              HippyDevtoolsCSSPropValueRowReverse],
        HippyDevtoolsCSSPropFlexWrap : @[HippyDevtoolsCSSPropValueNowrap,
                                         HippyDevtoolsCSSPropValueWrap,
                                         HippyDevtoolsCSSPropValueWrapReverse],
        HippyDevtoolsCSSPropAlignItems : @[HippyDevtoolsCSSPropValueFlexStart,
                                           HippyDevtoolsCSSPropCenter,
                                           HippyDevtoolsCSSPropValueFlexEnd,
                                           HippyDevtoolsCSSPropValueStretch,
                                           HippyDevtoolsCSSPropValueBaseline],
        HippyDevtoolsCSSPropAlignSelf : @[HippyDevtoolsCSSPropValueAuto,
                                          HippyDevtoolsCSSPropValueFlexStart,
                                          HippyDevtoolsCSSPropCenter,
                                          HippyDevtoolsCSSPropValueFlexEnd,
                                          HippyDevtoolsCSSPropValueStretch,
                                          HippyDevtoolsCSSPropValueBaseline],
        HippyDevtoolsCSSPropJustifyContent : @[HippyDevtoolsCSSPropValueFlexStart,
                                               HippyDevtoolsCSSPropCenter,
                                               HippyDevtoolsCSSPropValueFlexEnd,
                                               HippyDevtoolsCSSPropValueSpaceBetween,
                                               HippyDevtoolsCSSPropValueSpaceAround,
                                               HippyDevtoolsCSSPropValueSpaceEvenly],
        HippyDevtoolsCSSPropOverFlow : @[HippyDevtoolsCSSPropValueHidden,
                                         HippyDevtoolsCSSPropValueVisible,
                                         HippyDevtoolsCSSPropValueScroll],
        HippyDevtoolsCSSPropPosition : @[HippyDevtoolsCSSPropValueRelative,
                                         HippyDevtoolsCSSPropValueAbsolute],
        HippyDevtoolsCSSPropBackgroundSize : @[HippyDevtoolsCSSPropValueAuto,
                                               HippyDevtoolsCSSPropValueContain,
                                               HippyDevtoolsCSSPropValueCover,
                                               HippyDevtoolsCSSPropValueBackgroundSizeFit],
        HippyDevtoolsCSSPropBackgroundPositionX : @[HippyDevtoolsCSSPropLeft,
                                                    HippyDevtoolsCSSPropCenter,
                                                    HippyDevtoolsCSSPropRight],
        HippyDevtoolsCSSPropBackgroundPositionY : @[HippyDevtoolsCSSPropTop,
                                                    HippyDevtoolsCSSPropCenter,
                                                    HippyDevtoolsCSSPropBottom],
        HippyDevtoolsCSSPropFontStyle : @[HippyDevtoolsCSSPropValueNormal,
                                          HippyDevtoolsCSSPropValueItalic],
        HippyDevtoolsCSSPropFontWeight : @[HippyDevtoolsCSSPropValueNormal,
                                           HippyDevtoolsCSSPropValueBold,
                                           HippyDevtoolsCSSPropValueFontWeight100,
                                           HippyDevtoolsCSSPropValueFontWeight200,
                                           HippyDevtoolsCSSPropValueFontWeight300,
                                           HippyDevtoolsCSSPropValueFontWeight400,
                                           HippyDevtoolsCSSPropValueFontWeight500,
                                           HippyDevtoolsCSSPropValueFontWeight600,
                                           HippyDevtoolsCSSPropValueFontWeight700,
                                           HippyDevtoolsCSSPropValueFontWeight800,
                                           HippyDevtoolsCSSPropValueFontWeight900],
        HippyDevtoolsCSSPropTextAlign : @[HippyDevtoolsCSSPropLeft, HippyDevtoolsCSSPropCenter,
                                          HippyDevtoolsCSSPropRight],
        HippyDevtoolsCSSPropResizeMode : @[HippyDevtoolsCSSPropValueCover, HippyDevtoolsCSSPropValueContain,
                                           HippyDevtoolsCSSPropValueStretch, HippyDevtoolsCSSPropValueRepeat,
                                           HippyDevtoolsCSSPropCenter]
    };
}

- (void)initializeBoxModelRequireMap {
    self.boxModelRequireMap = @{
        HippyDevtoolsCSSPropPaddingTop : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropPaddingLeft : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropPaddingRight : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropPaddingBottom : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropBorderLeftWidth : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropBorderRightWidth : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropBorderTopWidth : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropBorderBottomWidth : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropMarginTop : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropMarginLeft : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropMarginRight : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropMarginBottom : HippyCSSDefaultLength,
        HippyDevtoolsCSSPropDisplay : HippyCSSDefaultDisplay,
        HippyDevtoolsCSSPropPosition : HippyCSSDefaultPosition
    };
}

@end
