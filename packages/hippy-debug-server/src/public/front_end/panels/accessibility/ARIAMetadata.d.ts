export interface AttributeConfig {
    name: string;
    type: string;
    enum?: string[];
}
export interface RoleConfig {
    name: string;
}
export interface Config {
    attributes: AttributeConfig[];
    roles: RoleConfig[];
}
export declare class ARIAMetadata {
    _attributes: Map<string, Attribute>;
    _roleNames: string[];
    constructor(config: Config | null);
    _initialize(config: Config): void;
    valuesForProperty(property: string): string[];
}
export declare function ariaMetadata(): ARIAMetadata;
export declare class Attribute {
    _enum: string[];
    constructor(config: AttributeConfig);
    getEnum(): string[];
}
