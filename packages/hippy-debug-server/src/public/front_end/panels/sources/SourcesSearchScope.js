/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
export class SourcesSearchScope {
    _searchId;
    _searchResultCandidates;
    _searchResultCallback;
    _searchFinishedCallback;
    _searchConfig;
    constructor() {
        // FIXME: Add title once it is used by search controller.
        this._searchId = 0;
        this._searchResultCandidates = [];
        this._searchResultCallback = null;
        this._searchFinishedCallback = null;
        this._searchConfig = null;
    }
    static _filesComparator(uiSourceCode1, uiSourceCode2) {
        if (uiSourceCode1.isDirty() && !uiSourceCode2.isDirty()) {
            return -1;
        }
        if (!uiSourceCode1.isDirty() && uiSourceCode2.isDirty()) {
            return 1;
        }
        const isFileSystem1 = uiSourceCode1.project().type() === Workspace.Workspace.projectTypes.FileSystem &&
            !Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode1);
        const isFileSystem2 = uiSourceCode2.project().type() === Workspace.Workspace.projectTypes.FileSystem &&
            !Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode2);
        if (isFileSystem1 !== isFileSystem2) {
            return isFileSystem1 ? 1 : -1;
        }
        const url1 = uiSourceCode1.url();
        const url2 = uiSourceCode2.url();
        if (url1 && !url2) {
            return -1;
        }
        if (!url1 && url2) {
            return 1;
        }
        return Platform.StringUtilities.naturalOrderComparator(uiSourceCode1.fullDisplayName(), uiSourceCode2.fullDisplayName());
    }
    performIndexing(progress) {
        this.stopSearch();
        const projects = this._projects();
        const compositeProgress = new Common.Progress.CompositeProgress(progress);
        for (let i = 0; i < projects.length; ++i) {
            const project = projects[i];
            const projectProgress = compositeProgress.createSubProgress(project.uiSourceCodes().length);
            project.indexContent(projectProgress);
        }
    }
    _projects() {
        const searchInAnonymousAndContentScripts = Common.Settings.Settings.instance().moduleSetting('searchInAnonymousAndContentScripts').get();
        return Workspace.Workspace.WorkspaceImpl.instance().projects().filter(project => {
            if (project.type() === Workspace.Workspace.projectTypes.Service) {
                return false;
            }
            if (!searchInAnonymousAndContentScripts && project.isServiceProject() &&
                project.type() !== Workspace.Workspace.projectTypes.Formatter) {
                return false;
            }
            if (!searchInAnonymousAndContentScripts && project.type() === Workspace.Workspace.projectTypes.ContentScripts) {
                return false;
            }
            return true;
        });
    }
    performSearch(searchConfig, progress, searchResultCallback, searchFinishedCallback) {
        this.stopSearch();
        this._searchResultCandidates = [];
        this._searchResultCallback = searchResultCallback;
        this._searchFinishedCallback = searchFinishedCallback;
        this._searchConfig = searchConfig;
        const promises = [];
        const compositeProgress = new Common.Progress.CompositeProgress(progress);
        const searchContentProgress = compositeProgress.createSubProgress();
        const findMatchingFilesProgress = new Common.Progress.CompositeProgress(compositeProgress.createSubProgress());
        for (const project of this._projects()) {
            const weight = project.uiSourceCodes().length;
            const findMatchingFilesInProjectProgress = findMatchingFilesProgress.createSubProgress(weight);
            const filesMathingFileQuery = this._projectFilesMatchingFileQuery(project, searchConfig);
            const promise = project
                .findFilesMatchingSearchRequest(searchConfig, filesMathingFileQuery, findMatchingFilesInProjectProgress)
                .then(this._processMatchingFilesForProject.bind(this, this._searchId, project, searchConfig, filesMathingFileQuery));
            promises.push(promise);
        }
        Promise.all(promises).then(this._processMatchingFiles.bind(this, this._searchId, searchContentProgress, this._searchFinishedCallback.bind(this, true)));
    }
    _projectFilesMatchingFileQuery(project, searchConfig, dirtyOnly) {
        const result = [];
        const uiSourceCodes = project.uiSourceCodes();
        for (let i = 0; i < uiSourceCodes.length; ++i) {
            const uiSourceCode = uiSourceCodes[i];
            if (!uiSourceCode.contentType().isTextType()) {
                continue;
            }
            const binding = Persistence.Persistence.PersistenceImpl.instance().binding(uiSourceCode);
            if (binding && binding.network === uiSourceCode) {
                continue;
            }
            if (dirtyOnly && !uiSourceCode.isDirty()) {
                continue;
            }
            if (searchConfig.filePathMatchesFileQuery(uiSourceCode.fullDisplayName())) {
                result.push(uiSourceCode.url());
            }
        }
        result.sort(Platform.StringUtilities.naturalOrderComparator);
        return result;
    }
    _processMatchingFilesForProject(searchId, project, searchConfig, filesMathingFileQuery, files) {
        if (searchId !== this._searchId && this._searchFinishedCallback) {
            this._searchFinishedCallback(false);
            return;
        }
        files.sort(Platform.StringUtilities.naturalOrderComparator);
        files = Platform.ArrayUtilities.intersectOrdered(files, filesMathingFileQuery, Platform.StringUtilities.naturalOrderComparator);
        const dirtyFiles = this._projectFilesMatchingFileQuery(project, searchConfig, true);
        files = Platform.ArrayUtilities.mergeOrdered(files, dirtyFiles, Platform.StringUtilities.naturalOrderComparator);
        const uiSourceCodes = [];
        for (const file of files) {
            const uiSourceCode = project.uiSourceCodeForURL(file);
            if (!uiSourceCode) {
                continue;
            }
            const script = Bindings.DefaultScriptMapping.DefaultScriptMapping.scriptForUISourceCode(uiSourceCode);
            if (script && !script.isAnonymousScript()) {
                continue;
            }
            uiSourceCodes.push(uiSourceCode);
        }
        uiSourceCodes.sort(SourcesSearchScope._filesComparator);
        this._searchResultCandidates = Platform.ArrayUtilities.mergeOrdered(this._searchResultCandidates, uiSourceCodes, SourcesSearchScope._filesComparator);
    }
    _processMatchingFiles(searchId, progress, callback) {
        if (searchId !== this._searchId && this._searchFinishedCallback) {
            this._searchFinishedCallback(false);
            return;
        }
        const files = this._searchResultCandidates;
        if (!files.length) {
            progress.done();
            callback();
            return;
        }
        progress.setTotalWork(files.length);
        let fileIndex = 0;
        const maxFileContentRequests = 20;
        let callbacksLeft = 0;
        for (let i = 0; i < maxFileContentRequests && i < files.length; ++i) {
            scheduleSearchInNextFileOrFinish.call(this);
        }
        function searchInNextFile(uiSourceCode) {
            if (uiSourceCode.isDirty()) {
                contentLoaded.call(this, uiSourceCode, uiSourceCode.workingCopy());
            }
            else {
                uiSourceCode.requestContent().then(deferredContent => {
                    contentLoaded.call(this, uiSourceCode, deferredContent.content || '');
                });
            }
        }
        function scheduleSearchInNextFileOrFinish() {
            if (fileIndex >= files.length) {
                if (!callbacksLeft) {
                    progress.done();
                    callback();
                    return;
                }
                return;
            }
            ++callbacksLeft;
            const uiSourceCode = files[fileIndex++];
            setTimeout(searchInNextFile.bind(this, uiSourceCode), 0);
        }
        function contentLoaded(uiSourceCode, content) {
            function matchesComparator(a, b) {
                return a.lineNumber - b.lineNumber;
            }
            progress.worked(1);
            let matches = [];
            const searchConfig = this._searchConfig;
            const queries = searchConfig.queries();
            if (content !== null) {
                for (let i = 0; i < queries.length; ++i) {
                    const nextMatches = TextUtils.TextUtils.performSearchInContent(content, queries[i], !searchConfig.ignoreCase(), searchConfig.isRegex());
                    matches = Platform.ArrayUtilities.mergeOrdered(matches, nextMatches, matchesComparator);
                }
            }
            if (matches && this._searchResultCallback) {
                const searchResult = new FileBasedSearchResult(uiSourceCode, matches);
                this._searchResultCallback(searchResult);
            }
            --callbacksLeft;
            scheduleSearchInNextFileOrFinish.call(this);
        }
    }
    stopSearch() {
        ++this._searchId;
    }
}
export class FileBasedSearchResult {
    _uiSourceCode;
    _searchMatches;
    constructor(uiSourceCode, searchMatches) {
        this._uiSourceCode = uiSourceCode;
        this._searchMatches = searchMatches;
    }
    label() {
        return this._uiSourceCode.displayName();
    }
    description() {
        return this._uiSourceCode.fullDisplayName();
    }
    matchesCount() {
        return this._searchMatches.length;
    }
    matchLineContent(index) {
        return this._searchMatches[index].lineContent;
    }
    matchRevealable(index) {
        const match = this._searchMatches[index];
        return this._uiSourceCode.uiLocation(match.lineNumber, undefined);
    }
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matchLabel(index) {
        return this._searchMatches[index].lineNumber + 1;
    }
}
//# sourceMappingURL=SourcesSearchScope.js.map