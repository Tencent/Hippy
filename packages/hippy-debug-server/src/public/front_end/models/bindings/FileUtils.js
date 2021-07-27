/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Workspace from '../workspace/workspace.js';
export class ChunkedFileReader {
    _file;
    _fileSize;
    _loadedSize;
    _streamReader;
    _chunkSize;
    _chunkTransferredCallback;
    _decoder;
    _isCanceled;
    _error;
    _transferFinished;
    _output;
    _reader;
    constructor(file, chunkSize, chunkTransferredCallback) {
        this._file = file;
        this._fileSize = file.size;
        this._loadedSize = 0;
        this._chunkSize = chunkSize;
        this._chunkTransferredCallback = chunkTransferredCallback;
        this._decoder = new TextDecoder();
        this._isCanceled = false;
        this._error = null;
        this._streamReader = null;
    }
    async read(output) {
        if (this._chunkTransferredCallback) {
            this._chunkTransferredCallback(this);
        }
        if (this._file?.type.endsWith('gzip')) {
            const stream = this._decompressStream(this._file.stream());
            this._streamReader = stream.getReader();
        }
        else {
            this._reader = new FileReader();
            this._reader.onload = this._onChunkLoaded.bind(this);
            this._reader.onerror = this._onError.bind(this);
        }
        this._output = output;
        this._loadChunk();
        return new Promise(resolve => {
            this._transferFinished = resolve;
        });
    }
    cancel() {
        this._isCanceled = true;
    }
    loadedSize() {
        return this._loadedSize;
    }
    fileSize() {
        return this._fileSize;
    }
    fileName() {
        if (!this._file) {
            return '';
        }
        return this._file.name;
    }
    error() {
        return this._error;
    }
    // Decompress gzip natively thanks to https://wicg.github.io/compression/
    _decompressStream(stream) {
        const ds = new DecompressionStream('gzip');
        const decompressionStream = stream.pipeThrough(ds);
        return decompressionStream;
    }
    _onChunkLoaded(event) {
        if (this._isCanceled) {
            return;
        }
        const eventTarget = event.target;
        if (eventTarget.readyState !== FileReader.DONE) {
            return;
        }
        if (!this._reader) {
            return;
        }
        const buffer = this._reader.result;
        this._loadedSize += buffer.byteLength;
        const endOfFile = this._loadedSize === this._fileSize;
        this._decodeChunkBuffer(buffer, endOfFile);
    }
    async _decodeChunkBuffer(buffer, endOfFile) {
        if (!this._output) {
            return;
        }
        const decodedString = this._decoder.decode(buffer, { stream: !endOfFile });
        await this._output.write(decodedString);
        if (this._isCanceled) {
            return;
        }
        if (this._chunkTransferredCallback) {
            this._chunkTransferredCallback(this);
        }
        if (endOfFile) {
            this._finishRead();
            return;
        }
        this._loadChunk();
    }
    _finishRead() {
        if (!this._output) {
            return;
        }
        this._file = null;
        this._reader = null;
        this._output.close();
        this._transferFinished(!this._error);
    }
    async _loadChunk() {
        if (!this._output || !this._file) {
            return;
        }
        if (this._streamReader) {
            const { value, done } = await this._streamReader.read();
            if (done || !value) {
                return this._finishRead();
            }
            this._decodeChunkBuffer(value.buffer, false);
        }
        if (this._reader) {
            const chunkStart = this._loadedSize;
            const chunkEnd = Math.min(this._fileSize, chunkStart + this._chunkSize);
            const nextPart = this._file.slice(chunkStart, chunkEnd);
            this._reader.readAsArrayBuffer(nextPart);
        }
    }
    _onError(event) {
        const eventTarget = event.target;
        this._error = eventTarget.error;
        this._transferFinished(false);
    }
}
export class FileOutputStream {
    _writeCallbacks;
    _fileName;
    _closed;
    constructor() {
        this._writeCallbacks = [];
    }
    async open(fileName) {
        this._closed = false;
        /** @type {!Array<function():void>} */
        this._writeCallbacks = [];
        this._fileName = fileName;
        const saveResponse = await Workspace.FileManager.FileManager.instance().save(this._fileName, '', true);
        if (saveResponse) {
            Workspace.FileManager.FileManager.instance().addEventListener(Workspace.FileManager.Events.AppendedToURL, this._onAppendDone, this);
        }
        return Boolean(saveResponse);
    }
    write(data) {
        return new Promise(resolve => {
            this._writeCallbacks.push(resolve);
            Workspace.FileManager.FileManager.instance().append(this._fileName, data);
        });
    }
    async close() {
        this._closed = true;
        if (this._writeCallbacks.length) {
            return;
        }
        Workspace.FileManager.FileManager.instance().removeEventListener(Workspace.FileManager.Events.AppendedToURL, this._onAppendDone, this);
        Workspace.FileManager.FileManager.instance().close(this._fileName);
    }
    _onAppendDone(event) {
        if (event.data !== this._fileName) {
            return;
        }
        const writeCallback = this._writeCallbacks.shift();
        if (writeCallback) {
            writeCallback();
        }
        if (this._writeCallbacks.length) {
            return;
        }
        if (!this._closed) {
            return;
        }
        Workspace.FileManager.FileManager.instance().removeEventListener(Workspace.FileManager.Events.AppendedToURL, this._onAppendDone, this);
        Workspace.FileManager.FileManager.instance().close(this._fileName);
    }
}
//# sourceMappingURL=FileUtils.js.map