// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as ConsoleModule from './console.js';
self.Console = self.Console || {};
Console = Console || {};
/**
 * @constructor
 */
Console.ConsoleFilter = ConsoleModule.ConsoleFilter.ConsoleFilter;
/**
 * @constructor
 */
Console.ConsolePanel = ConsoleModule.ConsolePanel.ConsolePanel;
/**
 * @constructor
 */
Console.ConsolePanel.WrapperView = ConsoleModule.ConsolePanel.WrapperView;
/**
 * @implements {Common.Revealer}
 */
Console.ConsolePanel.ConsoleRevealer = ConsoleModule.ConsolePanel.ConsoleRevealer;
/**
 * @constructor
 */
Console.ConsolePin = ConsoleModule.ConsolePinPane.ConsolePin;
/**
 * @constructor
 */
Console.ConsolePrompt = ConsoleModule.ConsolePrompt.ConsolePrompt;
/**
 * @constructor
 */
Console.ConsoleSidebar = ConsoleModule.ConsoleSidebar.ConsoleSidebar;
/**
 * @constructor
 */
Console.ConsoleView = ConsoleModule.ConsoleView.ConsoleView;
/** @constructor */
Console.ConsoleViewFilter = ConsoleModule.ConsoleView.ConsoleViewFilter;
/**
 * @implements {UI.ActionDelegate}
 */
Console.ConsoleView.ActionDelegate = ConsoleModule.ConsoleView.ActionDelegate;
/**
 * @constructor
 */
Console.ConsoleGroup = ConsoleModule.ConsoleView.ConsoleGroup;
/**
 * @implements {Console.ConsoleViewportElement}
 * @constructor
 */
Console.ConsoleViewMessage = ConsoleModule.ConsoleViewMessage.ConsoleViewMessage;
/**
 * @type {function(number):void}
 */
Console.ConsoleViewMessage.setMaxTokenizableStringLength =
    ConsoleModule.ConsoleViewMessage.setMaxTokenizableStringLength;
/**
 * @type {function(number):void}
 */
Console.ConsoleViewMessage.setLongStringVisibleLength = ConsoleModule.ConsoleViewMessage.setLongStringVisibleLength;
/**
 * @constructor
 */
Console.ConsoleGroupViewMessage = ConsoleModule.ConsoleViewMessage.ConsoleGroupViewMessage;
/**
 * @constructor
 */
Console.ConsoleViewport = ConsoleModule.ConsoleViewport.ConsoleViewport;
/**
 * @interface
 */
Console.ConsoleViewportElement = ConsoleModule.ConsoleViewport.ConsoleViewportElement;
//# sourceMappingURL=console-legacy.js.map