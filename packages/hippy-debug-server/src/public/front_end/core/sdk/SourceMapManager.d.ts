import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import type { FrameAssociated } from './FrameAssociated.js';
import type { Target } from './Target.js';
import type { SourceMap } from './SourceMap.js';
export declare class SourceMapManager<T extends FrameAssociated> extends Common.ObjectWrapper.ObjectWrapper {
    _target: Target;
    _isEnabled: boolean;
    _relativeSourceURL: Map<T, string>;
    _relativeSourceMapURL: Map<T, string>;
    _resolvedSourceMapId: Map<T, string>;
    _sourceMapById: Map<string, SourceMap>;
    _sourceMapIdToLoadingClients: Platform.MapUtilities.Multimap<string, T>;
    _sourceMapIdToClients: Platform.MapUtilities.Multimap<string, T>;
    constructor(target: Target);
    setEnabled(isEnabled: boolean): void;
    _inspectedURLChanged(event: Common.EventTarget.EventTargetEvent): void;
    sourceMapForClient(client: T): SourceMap | null;
    clientsForSourceMap(sourceMap: SourceMap): T[];
    _getSourceMapId(sourceURL: string, sourceMapURL: string): string;
    _resolveRelativeURLs(sourceURL: string, sourceMapURL: string): {
        sourceURL: string;
        sourceMapURL: string;
        sourceMapId: string;
    } | null;
    attachSourceMap(client: T, relativeSourceURL: string | undefined, relativeSourceMapURL: string | undefined): void;
    detachSourceMap(client: T): void;
    _sourceMapLoadedForTest(): void;
    dispose(): void;
}
export declare const Events: {
    SourceMapWillAttach: symbol;
    SourceMapFailedToAttach: symbol;
    SourceMapAttached: symbol;
    SourceMapDetached: symbol;
};
