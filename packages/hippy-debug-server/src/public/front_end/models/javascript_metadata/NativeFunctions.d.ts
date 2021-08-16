export const NativeFunctions: ({
    name: string;
    signatures: string[][];
    receiver: string;
    static?: undefined;
} | {
    name: string;
    signatures: string[][];
    receiver?: undefined;
    static?: undefined;
} | {
    name: string;
    signatures: string[][];
    static: boolean;
    receiver: string;
})[];
