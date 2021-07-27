import type * as Common from '../../../../core/common/common.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import { ResourceSourceFrame } from './ResourceSourceFrame.js';
export declare class BinaryResourceViewFactory {
    _base64content: string;
    _contentUrl: string;
    _resourceType: Common.ResourceType.ResourceType;
    _arrayPromise: Promise<Uint8Array> | null;
    _hexPromise: Promise<TextUtils.ContentProvider.DeferredContent> | null;
    _utf8Promise: Promise<TextUtils.ContentProvider.DeferredContent> | null;
    constructor(base64content: string, contentUrl: string, resourceType: Common.ResourceType.ResourceType);
    _fetchContentAsArray(): Promise<Uint8Array>;
    hex(): Promise<TextUtils.ContentProvider.DeferredContent>;
    base64(): Promise<TextUtils.ContentProvider.DeferredContent>;
    utf8(): Promise<TextUtils.ContentProvider.DeferredContent>;
    createBase64View(): ResourceSourceFrame;
    createHexView(): ResourceSourceFrame;
    createUtf8View(): ResourceSourceFrame;
    static uint8ArrayToHexString(uint8Array: Uint8Array): string;
    static numberToHex(number: number, padding: number): string;
    static uint8ArrayToHexViewer(array: Uint8Array): string;
}
