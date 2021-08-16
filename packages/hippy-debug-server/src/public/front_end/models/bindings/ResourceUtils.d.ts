import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
export declare function resourceForURL(url: string): SDK.Resource.Resource | null;
export declare function displayNameForURL(url: string): string;
export declare function metadataForURL(target: SDK.Target.Target, frameId: string, url: string): Workspace.UISourceCode.UISourceCodeMetadata | null;
export declare function resourceMetadata(resource: SDK.Resource.Resource | null): Workspace.UISourceCode.UISourceCodeMetadata | null;
