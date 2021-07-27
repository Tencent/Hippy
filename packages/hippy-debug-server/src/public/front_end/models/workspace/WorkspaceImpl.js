/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
import { UISourceCode } from './UISourceCode.js';
export class Project {
    rename(_uiSourceCode, _newName, _callback) {
    }
    excludeFolder(_path) {
    }
    deleteFile(_uiSourceCode) {
    }
    remove() {
    }
    indexContent(_progress) {
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum, @typescript-eslint/naming-convention
export var projectTypes;
(function (projectTypes) {
    projectTypes["Debugger"] = "debugger";
    projectTypes["Formatter"] = "formatter";
    projectTypes["Network"] = "network";
    projectTypes["FileSystem"] = "filesystem";
    projectTypes["ContentScripts"] = "contentscripts";
    projectTypes["Service"] = "service";
})(projectTypes || (projectTypes = {}));
export class ProjectStore {
    _workspace;
    _id;
    _type;
    _displayName;
    _uiSourceCodesMap;
    _uiSourceCodesList;
    _project;
    constructor(workspace, id, type, displayName) {
        this._workspace = workspace;
        this._id = id;
        this._type = type;
        this._displayName = displayName;
        this._uiSourceCodesMap = new Map();
        this._uiSourceCodesList = [];
        this._project = this;
    }
    id() {
        return this._id;
    }
    type() {
        return this._type;
    }
    displayName() {
        return this._displayName;
    }
    workspace() {
        return this._workspace;
    }
    createUISourceCode(url, contentType) {
        return new UISourceCode(this._project, url, contentType);
    }
    addUISourceCode(uiSourceCode) {
        const url = uiSourceCode.url();
        if (this.uiSourceCodeForURL(url)) {
            return false;
        }
        this._uiSourceCodesMap.set(url, { uiSourceCode: uiSourceCode, index: this._uiSourceCodesList.length });
        this._uiSourceCodesList.push(uiSourceCode);
        this._workspace.dispatchEventToListeners(Events.UISourceCodeAdded, uiSourceCode);
        return true;
    }
    removeUISourceCode(url) {
        const uiSourceCode = this.uiSourceCodeForURL(url);
        if (!uiSourceCode) {
            return;
        }
        const entry = this._uiSourceCodesMap.get(url);
        if (!entry) {
            return;
        }
        const movedUISourceCode = this._uiSourceCodesList[this._uiSourceCodesList.length - 1];
        this._uiSourceCodesList[entry.index] = movedUISourceCode;
        const movedEntry = this._uiSourceCodesMap.get(movedUISourceCode.url());
        if (movedEntry) {
            movedEntry.index = entry.index;
        }
        this._uiSourceCodesList.splice(this._uiSourceCodesList.length - 1, 1);
        this._uiSourceCodesMap.delete(url);
        this._workspace.dispatchEventToListeners(Events.UISourceCodeRemoved, entry.uiSourceCode);
    }
    removeProject() {
        this._workspace._removeProject(this._project);
        this._uiSourceCodesMap = new Map();
        this._uiSourceCodesList = [];
    }
    uiSourceCodeForURL(url) {
        const entry = this._uiSourceCodesMap.get(url);
        return entry ? entry.uiSourceCode : null;
    }
    uiSourceCodes() {
        return this._uiSourceCodesList;
    }
    renameUISourceCode(uiSourceCode, newName) {
        const oldPath = uiSourceCode.url();
        const newPath = uiSourceCode.parentURL() ? uiSourceCode.parentURL() + '/' + newName : newName;
        const value = this._uiSourceCodesMap.get(oldPath);
        this._uiSourceCodesMap.set(newPath, value);
        this._uiSourceCodesMap.delete(oldPath);
    }
}
let workspaceInstance;
export class WorkspaceImpl extends Common.ObjectWrapper.ObjectWrapper {
    _projects;
    _hasResourceContentTrackingExtensions;
    constructor() {
        super();
        this._projects = new Map();
        this._hasResourceContentTrackingExtensions = false;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!workspaceInstance || forceNew) {
            workspaceInstance = new WorkspaceImpl();
        }
        return workspaceInstance;
    }
    uiSourceCode(projectId, url) {
        const project = this._projects.get(projectId);
        return project ? project.uiSourceCodeForURL(url) : null;
    }
    uiSourceCodeForURL(url) {
        for (const project of this._projects.values()) {
            const uiSourceCode = project.uiSourceCodeForURL(url);
            if (uiSourceCode) {
                return uiSourceCode;
            }
        }
        return null;
    }
    uiSourceCodesForProjectType(type) {
        const result = [];
        for (const project of this._projects.values()) {
            if (project.type() === type) {
                result.push(...project.uiSourceCodes());
            }
        }
        return result;
    }
    addProject(project) {
        console.assert(!this._projects.has(project.id()), `A project with id ${project.id()} already exists!`);
        this._projects.set(project.id(), project);
        this.dispatchEventToListeners(Events.ProjectAdded, project);
    }
    _removeProject(project) {
        this._projects.delete(project.id());
        this.dispatchEventToListeners(Events.ProjectRemoved, project);
    }
    project(projectId) {
        return this._projects.get(projectId) || null;
    }
    projects() {
        return [...this._projects.values()];
    }
    projectsForType(type) {
        function filterByType(project) {
            return project.type() === type;
        }
        return this.projects().filter(filterByType);
    }
    uiSourceCodes() {
        const result = [];
        for (const project of this._projects.values()) {
            result.push(...project.uiSourceCodes());
        }
        return result;
    }
    setHasResourceContentTrackingExtensions(hasExtensions) {
        this._hasResourceContentTrackingExtensions = hasExtensions;
    }
    hasResourceContentTrackingExtensions() {
        return this._hasResourceContentTrackingExtensions;
    }
}
// TODO(crbug.com/1167717): Make this a const enum again
// eslint-disable-next-line rulesdir/const_enum
export var Events;
(function (Events) {
    Events["UISourceCodeAdded"] = "UISourceCodeAdded";
    Events["UISourceCodeRemoved"] = "UISourceCodeRemoved";
    Events["UISourceCodeRenamed"] = "UISourceCodeRenamed";
    Events["WorkingCopyChanged"] = "WorkingCopyChanged";
    Events["WorkingCopyCommitted"] = "WorkingCopyCommitted";
    Events["WorkingCopyCommittedByUser"] = "WorkingCopyCommittedByUser";
    Events["ProjectAdded"] = "ProjectAdded";
    Events["ProjectRemoved"] = "ProjectRemoved";
})(Events || (Events = {}));
//# sourceMappingURL=WorkspaceImpl.js.map