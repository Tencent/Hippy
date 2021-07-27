import type * as Acorn from '../../third_party/acorn/acorn.js';
export declare class ESTreeWalker {
    _beforeVisit: (arg0: Acorn.ESTree.Node) => (Object | undefined);
    _afterVisit: Function;
    _walkNulls: boolean;
    constructor(beforeVisit: (arg0: Acorn.ESTree.Node) => (Object | undefined), afterVisit?: ((arg0: Acorn.ESTree.Node) => void));
    static get SkipSubtree(): Object;
    setWalkNulls(value: boolean): void;
    walk(ast: Acorn.ESTree.Node): void;
    _innerWalk(node: Acorn.ESTree.Node, parent: Acorn.ESTree.Node | null): void;
    _walkArray(nodeArray: Acorn.ESTree.Node[], parentNode: Acorn.ESTree.Node | null): void;
}
