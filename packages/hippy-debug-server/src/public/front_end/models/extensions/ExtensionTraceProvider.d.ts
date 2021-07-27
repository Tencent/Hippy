export declare class ExtensionTraceProvider {
    _extensionOrigin: string;
    _id: string;
    _categoryName: string;
    _categoryTooltip: string;
    constructor(extensionOrigin: string, id: string, categoryName: string, categoryTooltip: string);
    start(session: TracingSession): void;
    stop(): void;
    shortDisplayName(): string;
    longDisplayName(): string;
    persistentIdentifier(): string;
}
/**
 * @interface
 */
export interface TracingSession {
    complete(url: string, timeOffsetMicroseconds: number): void;
}
