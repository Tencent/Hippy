import * as Protocol from '../../../../generated/protocol.js';
export declare function uiLabelForNetworkPriority(priority: Protocol.Network.ResourcePriority): string;
export declare function uiLabelToNetworkPriority(priorityLabel: string): string;
export declare function priorityUILabelMap(): Map<Protocol.Network.ResourcePriority, string>;
export declare function networkPriorityWeight(priority: Protocol.Network.ResourcePriority): number;
