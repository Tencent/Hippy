import * as Common from '../../core/common/common.js';
import * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class OpenedWindowDetailsView extends UI.ThrottledWidget.ThrottledWidget {
    _targetInfo: Protocol.Target.TargetInfo;
    _isWindowClosed: boolean;
    _reportView: UI.ReportView.ReportView;
    _documentSection: UI.ReportView.Section;
    _URLFieldValue: HTMLElement;
    _securitySection: UI.ReportView.Section;
    _openerElementField: HTMLElement;
    _hasDOMAccessValue: HTMLElement;
    constructor(targetInfo: Protocol.Target.TargetInfo, isWindowClosed: boolean);
    doUpdate(): Promise<void>;
    maybeDisplayOpenerFrame(): Promise<void>;
    buildTitle(): string;
    setIsWindowClosed(isWindowClosed: boolean): void;
    setTargetInfo(targetInfo: Protocol.Target.TargetInfo): void;
}
export declare class WorkerDetailsView extends UI.ThrottledWidget.ThrottledWidget {
    _targetInfo: Protocol.Target.TargetInfo;
    _reportView: UI.ReportView.ReportView;
    _documentSection: UI.ReportView.Section;
    _URLFieldValue: HTMLElement;
    _isolationSection: UI.ReportView.Section;
    _coepPolicy: HTMLElement;
    constructor(targetInfo: Protocol.Target.TargetInfo);
    workerTypeToString(type: string): Common.UIString.LocalizedString;
    _updateCoopCoepStatus(): Promise<void>;
    _fillCrossOriginPolicy(field: HTMLElement, isEnabled: (arg0: (Protocol.Network.CrossOriginEmbedderPolicyValue | Protocol.Network.CrossOriginOpenerPolicyValue)) => boolean, info: Protocol.Network.CrossOriginEmbedderPolicyStatus | Protocol.Network.CrossOriginOpenerPolicyStatus | null | undefined): void;
    doUpdate(): Promise<void>;
}
