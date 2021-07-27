export function _executeTestScript(): Promise<void>;
export { TestRunner };
/**
 * @implements {SDK.TargetManager.Observer}
 */
export class _TestObserver implements SDK.TargetManager.Observer {
    /**
     * @param {!SDK.Target} target
     * @override
     */
    override targetAdded(target: any): void;
    /**
     * @param {!SDK.Target} target
     * @override
     */
    override targetRemoved(target: any): void;
}
import * as TestRunner from "./TestRunner.js";
