import type * as Protocol from '../../generated/protocol.js';
import type { Target } from './Target.js';
export declare class ProfileNode {
    callFrame: Protocol.Runtime.CallFrame;
    callUID: string;
    self: number;
    total: number;
    id: number;
    parent: ProfileNode | null;
    children: ProfileNode[];
    depth: number;
    deoptReason: string | null;
    constructor(callFrame: Protocol.Runtime.CallFrame);
    get functionName(): string;
    get scriptId(): string;
    get url(): string;
    get lineNumber(): number;
    get columnNumber(): number;
}
export declare class ProfileTreeModel {
    _target: Target | null;
    root: ProfileNode;
    total: number;
    maxDepth: number;
    constructor(target?: Target | null);
    initialize(root: ProfileNode): void;
    _assignDepthsAndParents(): void;
    _calculateTotals(root: ProfileNode): number;
    target(): Target | null;
}
