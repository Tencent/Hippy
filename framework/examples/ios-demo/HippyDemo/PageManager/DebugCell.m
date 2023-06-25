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

#import "DebugCell.h"
#import "IconUtils.h"

@interface DebugCell () {
    BOOL _debugMode;
}

@end

@implementation DebugCell

- (void)awakeFromNib {
    [super awakeFromNib];
    // Initialization code
    self.summaryImageView.image = [UIImage imageFromIconName:@"debug_icon"];
    self.typeLabel.text = @"Debug Mode";
    self.debugSwitch.on = NO;
    
    self.splitLine.hidden = YES;
    self.textField.hidden = YES;
    [self.debugSwitch addTarget:self action:@selector(switchControlStatusChanged:) forControlEvents:UIControlEventValueChanged];
    self.backgroundColor = [UIColor whiteColor];
    self.contentView.backgroundColor = [UIColor whiteColor];
}

- (void)switchControlStatusChanged:(UISwitch *)switchControl {
    if (self.switchAction) {
        self.switchAction(switchControl.on);
    }
}

- (void)setDebugMode:(BOOL)debugMode {
    _debugMode = debugMode;
    self.splitLine.hidden = !debugMode;
    self.textField.hidden = !debugMode;
}

- (BOOL)isDebugMode {
    return _debugMode;
}

- (void)setDefaultDebugURLString:(NSString *)string {
    self.textField.placeholder = string;
}

- (NSString *)debugURLString {
    NSString *text = self.textField.text;
    return [text length] > 0?text:self.textField.placeholder;
}

@end
