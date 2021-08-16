export interface QuickInputOptions {
    prompt: string;
    placeHolder?: string;
    value?: string;
    valueSelection?: number[];
}
export declare class QuickInput {
    private constructor();
    static show(options: QuickInputOptions): Promise<string | undefined>;
}
