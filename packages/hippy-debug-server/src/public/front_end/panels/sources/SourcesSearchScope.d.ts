import * as Common from '../../core/common/common.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import type * as Search from '../search/search.js';
export declare class SourcesSearchScope implements Search.SearchConfig.SearchScope {
    _searchId: number;
    _searchResultCandidates: Workspace.UISourceCode.UISourceCode[];
    _searchResultCallback: ((arg0: Search.SearchConfig.SearchResult) => void) | null;
    _searchFinishedCallback: ((arg0: boolean) => void) | null;
    _searchConfig: Workspace.Workspace.ProjectSearchConfig | null;
    constructor();
    static _filesComparator(uiSourceCode1: Workspace.UISourceCode.UISourceCode, uiSourceCode2: Workspace.UISourceCode.UISourceCode): number;
    performIndexing(progress: Common.Progress.Progress): void;
    _projects(): Workspace.Workspace.Project[];
    performSearch(searchConfig: Workspace.Workspace.ProjectSearchConfig, progress: Common.Progress.Progress, searchResultCallback: (arg0: Search.SearchConfig.SearchResult) => void, searchFinishedCallback: (arg0: boolean) => void): void;
    _projectFilesMatchingFileQuery(project: Workspace.Workspace.Project, searchConfig: Workspace.Workspace.ProjectSearchConfig, dirtyOnly?: boolean): string[];
    _processMatchingFilesForProject(searchId: number, project: Workspace.Workspace.Project, searchConfig: Workspace.Workspace.ProjectSearchConfig, filesMathingFileQuery: string[], files: string[]): void;
    _processMatchingFiles(searchId: number, progress: Common.Progress.Progress, callback: () => void): void;
    stopSearch(): void;
}
export declare class FileBasedSearchResult implements Search.SearchConfig.SearchResult {
    _uiSourceCode: Workspace.UISourceCode.UISourceCode;
    _searchMatches: TextUtils.ContentProvider.SearchMatch[];
    constructor(uiSourceCode: Workspace.UISourceCode.UISourceCode, searchMatches: TextUtils.ContentProvider.SearchMatch[]);
    label(): string;
    description(): string;
    matchesCount(): number;
    matchLineContent(index: number): string;
    matchRevealable(index: number): Object;
    matchLabel(index: number): any;
}
