// Copyright (c) 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { FileSystemWorkspaceBinding } from './FileSystemWorkspaceBinding.js';
import { PersistenceBinding, PersistenceImpl } from './PersistenceImpl.js';
let networkPersistenceManagerInstance;
export class NetworkPersistenceManager extends Common.ObjectWrapper.ObjectWrapper {
    _bindings;
    _originalResponseContentPromises;
    _savingForOverrides;
    _savingSymbol;
    _enabledSetting;
    _workspace;
    _networkUISourceCodeForEncodedPath;
    _interceptionHandlerBound;
    _updateInterceptionThrottler;
    _project;
    _activeProject;
    _active;
    _enabled;
    _eventDescriptors;
    constructor(workspace) {
        super();
        this._bindings = new WeakMap();
        this._originalResponseContentPromises = new WeakMap();
        this._savingForOverrides = new WeakSet();
        this._savingSymbol = Symbol('SavingForOverrides');
        this._enabledSetting = Common.Settings.Settings.instance().moduleSetting('persistenceNetworkOverridesEnabled');
        this._enabledSetting.addChangeListener(this._enabledChanged, this);
        this._workspace = workspace;
        this._networkUISourceCodeForEncodedPath = new Map();
        this._interceptionHandlerBound = this._interceptionHandler.bind(this);
        this._updateInterceptionThrottler = new Common.Throttler.Throttler(50);
        this._project = null;
        this._activeProject = null;
        this._active = false;
        this._enabled = false;
        this._workspace.addEventListener(Workspace.Workspace.Events.ProjectAdded, event => {
            this._onProjectAdded(event.data);
        });
        this._workspace.addEventListener(Workspace.Workspace.Events.ProjectRemoved, event => {
            this._onProjectRemoved(event.data);
        });
        PersistenceImpl.instance().addNetworkInterceptor(this._canHandleNetworkUISourceCode.bind(this));
        this._eventDescriptors = [];
        this._enabledChanged();
    }
    static instance(opts = { forceNew: null, workspace: null }) {
        const { forceNew, workspace } = opts;
        if (!networkPersistenceManagerInstance || forceNew) {
            if (!workspace) {
                throw new Error('Missing workspace for NetworkPersistenceManager');
            }
            networkPersistenceManagerInstance = new NetworkPersistenceManager(workspace);
        }
        return networkPersistenceManagerInstance;
    }
    active() {
        return this._active;
    }
    project() {
        return this._project;
    }
    originalContentForUISourceCode(uiSourceCode) {
        const binding = this._bindings.get(uiSourceCode);
        if (!binding) {
            return null;
        }
        const fileSystemUISourceCode = binding.fileSystem;
        return this._originalResponseContentPromises.get(fileSystemUISourceCode) || null;
    }
    async _enabledChanged() {
        if (this._enabled === this._enabledSetting.get()) {
            return;
        }
        this._enabled = this._enabledSetting.get();
        if (this._enabled) {
            this._eventDescriptors = [
                Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.UISourceCodeRenamed, event => {
                    this._uiSourceCodeRenamedListener(event);
                }),
                Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, event => {
                    this._uiSourceCodeAdded(event);
                }),
                Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.UISourceCodeRemoved, event => {
                    this._uiSourceCodeRemovedListener(event);
                }),
                Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.WorkingCopyCommitted, event => this._onUISourceCodeWorkingCopyCommitted(event.data.uiSourceCode)),
            ];
            await this._updateActiveProject();
        }
        else {
            Common.EventTarget.EventTarget.removeEventListeners(this._eventDescriptors);
            await this._updateActiveProject();
        }
    }
    async _uiSourceCodeRenamedListener(event) {
        const uiSourceCode = event.data.uiSourceCode;
        await this._onUISourceCodeRemoved(uiSourceCode);
        await this._onUISourceCodeAdded(uiSourceCode);
    }
    async _uiSourceCodeRemovedListener(event) {
        await this._onUISourceCodeRemoved(event.data);
    }
    async _uiSourceCodeAdded(event) {
        await this._onUISourceCodeAdded(event.data);
    }
    async _updateActiveProject() {
        const wasActive = this._active;
        this._active =
            Boolean(this._enabledSetting.get() && SDK.TargetManager.TargetManager.instance().mainTarget() && this._project);
        if (this._active === wasActive) {
            return;
        }
        if (this._active && this._project) {
            await Promise.all(this._project.uiSourceCodes().map(uiSourceCode => this._filesystemUISourceCodeAdded(uiSourceCode)));
            const networkProjects = this._workspace.projectsForType(Workspace.Workspace.projectTypes.Network);
            for (const networkProject of networkProjects) {
                await Promise.all(networkProject.uiSourceCodes().map(uiSourceCode => this._networkUISourceCodeAdded(uiSourceCode)));
            }
        }
        else if (this._project) {
            await Promise.all(this._project.uiSourceCodes().map(uiSourceCode => this._filesystemUISourceCodeRemoved(uiSourceCode)));
            this._networkUISourceCodeForEncodedPath.clear();
        }
        PersistenceImpl.instance().refreshAutomapping();
    }
    _encodedPathFromUrl(url) {
        if (!this._active || !this._project) {
            return '';
        }
        let urlPath = Common.ParsedURL.ParsedURL.urlWithoutHash(url.replace(/^https?:\/\//, ''));
        if (urlPath.endsWith('/') && urlPath.indexOf('?') === -1) {
            urlPath = urlPath + 'index.html';
        }
        let encodedPathParts = encodeUrlPathToLocalPathParts(urlPath);
        const projectPath = FileSystemWorkspaceBinding.fileSystemPath(this._project.id());
        const encodedPath = encodedPathParts.join('/');
        if (projectPath.length + encodedPath.length > 200) {
            const domain = encodedPathParts[0];
            const encodedFileName = encodedPathParts[encodedPathParts.length - 1];
            const shortFileName = encodedFileName ? encodedFileName.substr(0, 10) + '-' : '';
            const extension = Common.ParsedURL.ParsedURL.extractExtension(urlPath);
            const extensionPart = extension ? '.' + extension.substr(0, 10) : '';
            encodedPathParts = [
                domain,
                'longurls',
                shortFileName + Platform.StringUtilities.hashCode(encodedPath).toString(16) + extensionPart,
            ];
        }
        return encodedPathParts.join('/');
        function encodeUrlPathToLocalPathParts(urlPath) {
            const encodedParts = [];
            for (const pathPart of fileNamePartsFromUrlPath(urlPath)) {
                if (!pathPart) {
                    continue;
                }
                // encodeURI() escapes all the unsafe filename characters except /:?*
                let encodedName = encodeURI(pathPart).replace(/[\/:\?\*]/g, match => '%' + match[0].charCodeAt(0).toString(16));
                // Windows does not allow a small set of filenames.
                if (RESERVED_FILENAMES.has(encodedName.toLowerCase())) {
                    encodedName = encodedName.split('').map(char => '%' + char.charCodeAt(0).toString(16)).join('');
                }
                // Windows does not allow the file to end in a space or dot (space should already be encoded).
                const lastChar = encodedName.charAt(encodedName.length - 1);
                if (lastChar === '.') {
                    encodedName = encodedName.substr(0, encodedName.length - 1) + '%2e';
                }
                encodedParts.push(encodedName);
            }
            return encodedParts;
        }
        function fileNamePartsFromUrlPath(urlPath) {
            urlPath = Common.ParsedURL.ParsedURL.urlWithoutHash(urlPath);
            const queryIndex = urlPath.indexOf('?');
            if (queryIndex === -1) {
                return urlPath.split('/');
            }
            if (queryIndex === 0) {
                return [urlPath];
            }
            const endSection = urlPath.substr(queryIndex);
            const parts = urlPath.substr(0, urlPath.length - endSection.length).split('/');
            parts[parts.length - 1] += endSection;
            return parts;
        }
    }
    _decodeLocalPathToUrlPath(path) {
        try {
            return unescape(path);
        }
        catch (e) {
            console.error(e);
        }
        return path;
    }
    async _unbind(uiSourceCode) {
        const binding = this._bindings.get(uiSourceCode);
        if (binding) {
            this._bindings.delete(binding.network);
            this._bindings.delete(binding.fileSystem);
            await PersistenceImpl.instance().removeBinding(binding);
        }
    }
    async _bind(networkUISourceCode, fileSystemUISourceCode) {
        if (this._bindings.has(networkUISourceCode)) {
            await this._unbind(networkUISourceCode);
        }
        if (this._bindings.has(fileSystemUISourceCode)) {
            await this._unbind(fileSystemUISourceCode);
        }
        const binding = new PersistenceBinding(networkUISourceCode, fileSystemUISourceCode);
        this._bindings.set(networkUISourceCode, binding);
        this._bindings.set(fileSystemUISourceCode, binding);
        await PersistenceImpl.instance().addBinding(binding);
        const uiSourceCodeOfTruth = this._savingForOverrides.has(networkUISourceCode) ? networkUISourceCode : fileSystemUISourceCode;
        const [{ content }, encoded] = await Promise.all([uiSourceCodeOfTruth.requestContent(), uiSourceCodeOfTruth.contentEncoded()]);
        PersistenceImpl.instance().syncContent(uiSourceCodeOfTruth, content || '', encoded);
    }
    _onUISourceCodeWorkingCopyCommitted(uiSourceCode) {
        this.saveUISourceCodeForOverrides(uiSourceCode);
    }
    canSaveUISourceCodeForOverrides(uiSourceCode) {
        return this._active && uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Network &&
            !this._bindings.has(uiSourceCode) && !this._savingForOverrides.has(uiSourceCode);
    }
    async saveUISourceCodeForOverrides(uiSourceCode) {
        if (!this.canSaveUISourceCodeForOverrides(uiSourceCode)) {
            return;
        }
        this._savingForOverrides.add(uiSourceCode);
        let encodedPath = this._encodedPathFromUrl(uiSourceCode.url());
        const content = (await uiSourceCode.requestContent()).content || '';
        const encoded = await uiSourceCode.contentEncoded();
        const lastIndexOfSlash = encodedPath.lastIndexOf('/');
        const encodedFileName = encodedPath.substr(lastIndexOfSlash + 1);
        encodedPath = encodedPath.substr(0, lastIndexOfSlash);
        if (this._project) {
            await this._project.createFile(encodedPath, encodedFileName, content, encoded);
        }
        this._fileCreatedForTest(encodedPath, encodedFileName);
        this._savingForOverrides.delete(uiSourceCode);
    }
    _fileCreatedForTest(_path, _fileName) {
    }
    _patternForFileSystemUISourceCode(uiSourceCode) {
        const relativePathParts = FileSystemWorkspaceBinding.relativePath(uiSourceCode);
        if (relativePathParts.length < 2) {
            return '';
        }
        if (relativePathParts[1] === 'longurls' && relativePathParts.length !== 2) {
            return 'http?://' + relativePathParts[0] + '/*';
        }
        return 'http?://' + this._decodeLocalPathToUrlPath(relativePathParts.join('/'));
    }
    async _onUISourceCodeAdded(uiSourceCode) {
        await this._networkUISourceCodeAdded(uiSourceCode);
        await this._filesystemUISourceCodeAdded(uiSourceCode);
    }
    _canHandleNetworkUISourceCode(uiSourceCode) {
        return this._active && !uiSourceCode.url().startsWith('snippet://');
    }
    async _networkUISourceCodeAdded(uiSourceCode) {
        if (uiSourceCode.project().type() !== Workspace.Workspace.projectTypes.Network ||
            !this._canHandleNetworkUISourceCode(uiSourceCode)) {
            return;
        }
        const url = Common.ParsedURL.ParsedURL.urlWithoutHash(uiSourceCode.url());
        this._networkUISourceCodeForEncodedPath.set(this._encodedPathFromUrl(url), uiSourceCode);
        const project = this._project;
        const fileSystemUISourceCode = project.uiSourceCodeForURL(project.fileSystemPath() + '/' + this._encodedPathFromUrl(url));
        if (fileSystemUISourceCode) {
            await this._bind(uiSourceCode, fileSystemUISourceCode);
        }
    }
    async _filesystemUISourceCodeAdded(uiSourceCode) {
        if (!this._active || uiSourceCode.project() !== this._project) {
            return;
        }
        this._updateInterceptionPatterns();
        const relativePath = FileSystemWorkspaceBinding.relativePath(uiSourceCode);
        const networkUISourceCode = this._networkUISourceCodeForEncodedPath.get(relativePath.join('/'));
        if (networkUISourceCode) {
            await this._bind(networkUISourceCode, uiSourceCode);
        }
    }
    _updateInterceptionPatterns() {
        this._updateInterceptionThrottler.schedule(innerUpdateInterceptionPatterns.bind(this));
        function innerUpdateInterceptionPatterns() {
            if (!this._active || !this._project) {
                return SDK.NetworkManager.MultitargetNetworkManager.instance().setInterceptionHandlerForPatterns([], this._interceptionHandlerBound);
            }
            const patterns = new Set();
            const indexFileName = 'index.html';
            for (const uiSourceCode of this._project.uiSourceCodes()) {
                const pattern = this._patternForFileSystemUISourceCode(uiSourceCode);
                patterns.add(pattern);
                if (pattern.endsWith('/' + indexFileName)) {
                    patterns.add(pattern.substr(0, pattern.length - indexFileName.length));
                }
            }
            return SDK.NetworkManager.MultitargetNetworkManager.instance().setInterceptionHandlerForPatterns(Array.from(patterns).map(pattern => ({ urlPattern: pattern, interceptionStage: "HeadersReceived" /* HeadersReceived */ })), this._interceptionHandlerBound);
        }
    }
    async _onUISourceCodeRemoved(uiSourceCode) {
        await this._networkUISourceCodeRemoved(uiSourceCode);
        await this._filesystemUISourceCodeRemoved(uiSourceCode);
    }
    async _networkUISourceCodeRemoved(uiSourceCode) {
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Network) {
            await this._unbind(uiSourceCode);
            this._networkUISourceCodeForEncodedPath.delete(this._encodedPathFromUrl(uiSourceCode.url()));
        }
    }
    async _filesystemUISourceCodeRemoved(uiSourceCode) {
        if (uiSourceCode.project() !== this._project) {
            return;
        }
        this._updateInterceptionPatterns();
        this._originalResponseContentPromises.delete(uiSourceCode);
        await this._unbind(uiSourceCode);
    }
    async _setProject(project) {
        if (project === this._project) {
            return;
        }
        if (this._project) {
            await Promise.all(this._project.uiSourceCodes().map(uiSourceCode => this._filesystemUISourceCodeRemoved(uiSourceCode)));
        }
        this._project = project;
        if (this._project) {
            await Promise.all(this._project.uiSourceCodes().map(uiSourceCode => this._filesystemUISourceCodeAdded(uiSourceCode)));
        }
        await this._updateActiveProject();
        this.dispatchEventToListeners(Events.ProjectChanged, this._project);
    }
    async _onProjectAdded(project) {
        if (project.type() !== Workspace.Workspace.projectTypes.FileSystem ||
            FileSystemWorkspaceBinding.fileSystemType(project) !== 'overrides') {
            return;
        }
        const fileSystemPath = FileSystemWorkspaceBinding.fileSystemPath(project.id());
        if (!fileSystemPath) {
            return;
        }
        if (this._project) {
            this._project.remove();
        }
        await this._setProject(project);
    }
    async _onProjectRemoved(project) {
        if (project === this._project) {
            await this._setProject(null);
        }
    }
    async _interceptionHandler(interceptedRequest) {
        const method = interceptedRequest.request.method;
        if (!this._active || (method !== 'GET' && method !== 'POST')) {
            return;
        }
        const proj = this._project;
        const path = proj.fileSystemPath() + '/' + this._encodedPathFromUrl(interceptedRequest.request.url);
        const fileSystemUISourceCode = proj.uiSourceCodeForURL(path);
        if (!fileSystemUISourceCode) {
            return;
        }
        let mimeType = '';
        if (interceptedRequest.responseHeaders) {
            const responseHeaders = SDK.NetworkManager.NetworkManager.lowercaseHeaders(interceptedRequest.responseHeaders);
            mimeType = responseHeaders['content-type'];
        }
        if (!mimeType) {
            const expectedResourceType = Common.ResourceType.resourceTypes[interceptedRequest.resourceType] || Common.ResourceType.resourceTypes.Other;
            mimeType = fileSystemUISourceCode.mimeType();
            if (Common.ResourceType.ResourceType.fromMimeType(mimeType) !== expectedResourceType) {
                mimeType = expectedResourceType.canonicalMimeType();
            }
        }
        const project = fileSystemUISourceCode.project();
        this._originalResponseContentPromises.set(fileSystemUISourceCode, interceptedRequest.responseBody().then(response => {
            if (response.error || response.content === null) {
                return null;
            }
            if (response.encoded) {
                const text = atob(response.content);
                const data = new Uint8Array(text.length);
                for (let i = 0; i < text.length; ++i) {
                    data[i] = text.charCodeAt(i);
                }
                return new TextDecoder('utf-8').decode(data);
            }
            return response.content;
        }));
        const blob = await project.requestFileBlob(fileSystemUISourceCode);
        if (blob) {
            interceptedRequest.continueRequestWithContent(new Blob([blob], { type: mimeType }));
        }
    }
}
const RESERVED_FILENAMES = new Set([
    'con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7',
    'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9',
]);
export const Events = {
    ProjectChanged: Symbol('ProjectChanged'),
};
//# sourceMappingURL=NetworkPersistenceManager.js.map