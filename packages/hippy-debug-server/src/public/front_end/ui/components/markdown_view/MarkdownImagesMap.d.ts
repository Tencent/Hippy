export interface ImageData {
    src: string;
    isIcon: boolean;
    color?: string;
    width?: string;
    height?: string;
}
export declare const markdownImages: Map<string, ImageData>;
export declare const getMarkdownImage: (key: string) => ImageData;
