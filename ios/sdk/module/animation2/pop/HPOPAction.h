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

/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.
 
 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#ifndef POPACTION_H
#define POPACTION_H

#import <QuartzCore/CATransaction.h>

#import "HPOPDefines.h"

#ifdef __cplusplus

namespace HPOP {
  
  /**
   @abstract Disables Core Animation actions using RAII.
   @discussion The disablement of actions is scoped to the current transaction.
   */
  class ActionDisabler
  {
    BOOL state;
    
  public:
    ActionDisabler() POP_NOTHROW
    {
      state = [CATransaction disableActions];
      [CATransaction setDisableActions:YES];
    }
    
    ~ActionDisabler()
    {
      [CATransaction setDisableActions:state];
    }
  };
  
  /**
   @abstract Enables Core Animation actions using RAII.
   @discussion The enablement of actions is scoped to the current transaction.
   */
  class ActionEnabler
  {
    BOOL state;
    
  public:
    ActionEnabler() POP_NOTHROW
    {
      state = [CATransaction disableActions];
      [CATransaction setDisableActions:NO];
    }
    
    ~ActionEnabler()
    {
      [CATransaction setDisableActions:state];
    }
  };

}

#endif /* __cplusplus */

#endif /* POPACTION_H */
