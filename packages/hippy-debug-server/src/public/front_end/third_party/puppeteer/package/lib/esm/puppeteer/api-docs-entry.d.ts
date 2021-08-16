/**
 * Copyright 2020 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Browser } from './common/Browser.js';
import { BrowserConnectOptions } from './common/BrowserConnector.js';
import { DevicesMap } from './common/DeviceDescriptors.js';
import { PuppeteerErrors } from './common/Errors.js';
import { PredefinedNetworkConditions } from './common/NetworkConditions.js';
import { Product } from './common/Product.js';
import { ConnectOptions } from './common/Puppeteer.js';
import { CustomQueryHandler } from './common/QueryHandler.js';
import { BrowserLaunchArgumentOptions , LaunchOptions} from './node/LaunchOptions.js';

export * from './common/Accessibility.js';
export * from './common/Browser.js';
export * from './node/BrowserFetcher.js';
export * from './node/Puppeteer.js';
export * from './common/Coverage.js';
export * from './common/Connection.js';
export * from './common/ConsoleMessage.js';
export * from './common/Coverage.js';
export * from './common/DeviceDescriptors.js';
export * from './common/Dialog.js';
export * from './common/DOMWorld.js';
export * from './common/JSHandle.js';
export * from './common/ExecutionContext.js';
export * from './common/EventEmitter.js';
export * from './common/FileChooser.js';
export * from './common/FrameManager.js';
export * from './common/PuppeteerViewport.js';
export * from './common/Input.js';
export * from './common/Page.js';
export * from './common/Product.js';
export * from './common/Puppeteer.js';
export * from './common/BrowserConnector.js';
export * from './node/Launcher.js';
export * from './node/LaunchOptions.js';
export * from './common/HTTPRequest.js';
export * from './common/HTTPResponse.js';
export * from './common/SecurityDetails.js';
export * from './common/Target.js';
export * from './common/Errors.js';
export * from './common/Tracing.js';
export * from './common/NetworkManager.js';
export * from './common/WebWorker.js';
export * from './common/USKeyboardLayout.js';
export * from './common/EvalTypes.js';
export * from './common/PDFOptions.js';
export * from './common/TimeoutSettings.js';
export * from './common/LifecycleWatcher.js';
export * from './common/QueryHandler.js';
export * from './common/NetworkConditions.js';
export * from 'devtools-protocol/types/protocol';
/**
 * @public
 * {@inheritDoc PuppeteerNode.launch}
 */
export declare function launch(options?: LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions & {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
}): Promise<Browser>;
/**
 * @public
 * {@inheritDoc PuppeteerNode.connect}
 */
export declare function connect(options: ConnectOptions): Promise<Browser>;
/**
 * @public
 * {@inheritDoc Puppeteer.devices}
 */
export declare let devices: DevicesMap;
/**
 * @public
 */
export declare let errors: PuppeteerErrors;
/**
 * @public
 */
export declare let networkConditions: PredefinedNetworkConditions;
/**
 * @public
 * {@inheritDoc Puppeteer.registerCustomQueryHandler}
 */
export declare function registerCustomQueryHandler(name: string, queryHandler: CustomQueryHandler): void;
/**
 * @public
 * {@inheritDoc Puppeteer.unregisterCustomQueryHandler}
 */
export declare function unregisterCustomQueryHandler(name: string): void;
/**
 * @public
 * {@inheritDoc Puppeteer.customQueryHandlerNames}
 */
export declare function customQueryHandlerNames(): string[];
/**
 * @public
 * {@inheritDoc Puppeteer.clearCustomQueryHandlers}
 */
export declare function clearCustomQueryHandlers(): void;
//# sourceMappingURL=api-docs-entry.d.ts.map