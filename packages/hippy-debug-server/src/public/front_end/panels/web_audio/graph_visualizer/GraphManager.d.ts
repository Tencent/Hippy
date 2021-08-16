import * as Common from '../../../core/common/common.js';
import { GraphView } from './GraphView.js';
export declare class GraphManager extends Common.ObjectWrapper.ObjectWrapper {
    _graphMapByContextId: Map<string, GraphView>;
    constructor();
    createContext(contextId: string): void;
    destroyContext(contextId: string): void;
    hasContext(contextId: string): boolean;
    clearGraphs(): void;
    /**
     * Get graph by contextId.
     * If the user starts listening for WebAudio events after the page has been running a context for awhile,
     * the graph might be undefined.
     */
    getGraph(contextId: string): GraphView | null;
    _notifyShouldRedraw(event: Common.EventTarget.EventTargetEvent<GraphView>): void;
}
