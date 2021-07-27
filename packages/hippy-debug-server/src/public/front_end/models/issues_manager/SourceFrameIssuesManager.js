// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as Marked from '../../third_party/marked/marked.js';
import { ContentSecurityPolicyIssue, trustedTypesPolicyViolationCode, trustedTypesSinkViolationCode } from './ContentSecurityPolicyIssue.js';
import { toZeroBasedLocation } from './Issue.js';
import * as IssuesManager from './IssuesManager.js';
import { findTitleFromMarkdownAst, getMarkdownFileContent } from './MarkdownIssueDescription.js';
export class SourceFrameIssuesManager {
    issuesManager;
    locationPool = new Bindings.LiveLocation.LiveLocationPool();
    issueMessages = new Array();
    constructor(issuesManager) {
        this.issuesManager = issuesManager;
        this.issuesManager.addEventListener(IssuesManager.Events.IssueAdded, this.onIssueAdded, this);
        this.issuesManager.addEventListener(IssuesManager.Events.FullUpdateRequired, this.onFullUpdateRequired, this);
    }
    onIssueAdded(event) {
        const { issue } = 
        /** @type {!{issue: !Issue}} */ (event.data);
        this.addIssue(issue);
    }
    addIssue(issue) {
        if (!this.isTrustedTypeIssue(issue)) {
            return;
        }
        const issuesModel = issue.model();
        if (!issuesModel) {
            return;
        }
        const debuggerModel = issuesModel.target().model(SDK.DebuggerModel.DebuggerModel);
        const srcLocation = toZeroBasedLocation(issue.details().sourceCodeLocation);
        if (srcLocation && debuggerModel) {
            const rawLocation = debuggerModel.createRawLocationByURL(srcLocation.url, srcLocation.lineNumber, srcLocation.columnNumber);
            if (rawLocation) {
                this.addIssueMessageToScript(issue, rawLocation);
            }
        }
    }
    onFullUpdateRequired() {
        this.resetMessages();
        const issues = this.issuesManager.issues();
        for (const issue of issues) {
            this.addIssue(issue);
        }
    }
    async getIssueTitleFromMarkdownDescription(description) {
        const rawMarkdown = await getMarkdownFileContent(description.file);
        const markdownAst = Marked.Marked.lexer(rawMarkdown);
        return findTitleFromMarkdownAst(markdownAst);
    }
    async addIssueMessageToScript(issue, rawLocation) {
        const description = issue.getDescription();
        if (description) {
            const title = await this.getIssueTitleFromMarkdownDescription(description);
            if (title) {
                const clickHandler = () => {
                    Common.Revealer.reveal(issue);
                };
                this.issueMessages.push(new IssueMessage(title, issue.getKind(), rawLocation, this.locationPool, clickHandler));
            }
        }
    }
    isTrustedTypeIssue(issue) {
        return issue instanceof ContentSecurityPolicyIssue && issue.code() === trustedTypesSinkViolationCode ||
            issue.code() === trustedTypesPolicyViolationCode;
    }
    resetMessages() {
        for (const message of this.issueMessages) {
            message.dispose();
        }
        this.issueMessages = [];
        this.locationPool.disposeAll();
    }
}
export class IssueMessage extends Workspace.UISourceCode.Message {
    uiSourceCode = undefined;
    kind;
    constructor(title, kind, rawLocation, locationPool, clickHandler) {
        super(Workspace.UISourceCode.Message.Level.Issue, title, clickHandler);
        this.kind = kind;
        Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createLiveLocation(rawLocation, this.updateLocation.bind(this), locationPool);
    }
    async updateLocation(liveLocation) {
        if (this.uiSourceCode) {
            this.uiSourceCode.removeMessage(this);
        }
        const uiLocation = await liveLocation.uiLocation();
        if (!uiLocation) {
            return;
        }
        this._range = TextUtils.TextRange.TextRange.createFromLocation(uiLocation.lineNumber, uiLocation.columnNumber || 0);
        this.uiSourceCode = uiLocation.uiSourceCode;
        this.uiSourceCode.addMessage(this);
    }
    getIssueKind() {
        return this.kind;
    }
    dispose() {
        if (this.uiSourceCode) {
            this.uiSourceCode.removeMessage(this);
        }
    }
}
//# sourceMappingURL=SourceFrameIssuesManager.js.map