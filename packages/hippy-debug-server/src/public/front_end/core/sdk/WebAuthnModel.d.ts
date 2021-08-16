import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import type { Target } from './Target.js';
import { SDKModel } from './SDKModel.js';
export declare class WebAuthnModel extends SDKModel {
    _agent: ProtocolProxyApi.WebAuthnApi;
    constructor(target: Target);
    setVirtualAuthEnvEnabled(enable: boolean): Promise<Object>;
    addAuthenticator(options: Protocol.WebAuthn.VirtualAuthenticatorOptions): Promise<string>;
    removeAuthenticator(authenticatorId: string): Promise<void>;
    setAutomaticPresenceSimulation(authenticatorId: string, enabled: boolean): Promise<void>;
    getCredentials(authenticatorId: string): Promise<Protocol.WebAuthn.Credential[]>;
    removeCredential(authenticatorId: string, credentialId: string): Promise<void>;
}
