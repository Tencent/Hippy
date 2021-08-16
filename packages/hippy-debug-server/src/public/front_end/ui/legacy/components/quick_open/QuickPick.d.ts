export interface QuickPickItem {
    label: string;
    description?: string;
    detail?: string;
}
export interface QuickPickOptions {
    placeHolder: string;
    matchOnDescription?: boolean;
    matchOnDetail?: boolean;
}
export declare class QuickPick {
    private constructor();
    static show(items: QuickPickItem[], options: QuickPickOptions): Promise<QuickPickItem | undefined>;
}
