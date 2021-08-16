export interface OutputStream {
    write(data: string): Promise<void>;
    close(): Promise<void>;
}
export declare class StringOutputStream implements OutputStream {
    _data: string;
    constructor();
    write(chunk: string): Promise<void>;
    close(): Promise<void>;
    data(): string;
}
