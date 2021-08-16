import type * as UI from '../../ui/legacy/legacy.js';
import type * as Protocol from '../../generated/protocol.js';
export declare function parseBrandsList(stringForm: string, parseErrorString: string, structErrorString: string): Protocol.Emulation.UserAgentBrandVersion[] | string;
export declare function serializeBrandsList(brands: Protocol.Emulation.UserAgentBrandVersion[]): string;
export declare function validateAsStructuredHeadersString(value: string, errorString: string): UI.ListWidget.ValidatorResult;
