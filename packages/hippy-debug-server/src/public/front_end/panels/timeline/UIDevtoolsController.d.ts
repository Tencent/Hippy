import type * as SDK from '../../core/sdk/sdk.js';
import type { Client } from './TimelineController.js';
import { TimelineController } from './TimelineController.js';
export declare class UIDevtoolsController extends TimelineController {
    constructor(target: SDK.Target.Target, client: Client);
}
