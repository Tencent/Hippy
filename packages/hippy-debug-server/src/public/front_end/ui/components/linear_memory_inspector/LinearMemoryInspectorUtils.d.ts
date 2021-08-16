export declare const HEXADECIMAL_REGEXP: RegExp;
export declare const DECIMAL_REGEXP: RegExp;
export declare function toHexString(data: {
    number: number;
    pad: number;
    prefix: boolean;
}): string;
export declare function formatAddress(address: number): string;
export declare function parseAddress(address: string): number | undefined;
