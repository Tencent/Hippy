/*
 * Copyright (C) 2020 Google Inc. All rights reserved.
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
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as WasmParser from '../../third_party/wasmparser/wasmparser.js';
export function dissambleWASM(params, 
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
postMessage) {
    try {
        const dataBuffer = Common.Base64.decode(params.content);
        let parser = new WasmParser.WasmParser.BinaryReader();
        parser.setData(dataBuffer, 0, dataBuffer.byteLength);
        const nameGenerator = new WasmParser.WasmDis.DevToolsNameGenerator();
        nameGenerator.read(parser);
        const data = new Uint8Array(dataBuffer);
        parser = new WasmParser.WasmParser.BinaryReader();
        const dis = new WasmParser.WasmDis.WasmDisassembler();
        dis.addOffsets = true;
        dis.exportMetadata = nameGenerator.getExportMetadata();
        dis.nameResolver = nameGenerator.getNameResolver();
        const lines = [];
        const offsets = [];
        const functionBodyOffsets = [];
        const MAX_LINES = 1000 * 1000;
        let chunkSize = 128 * 1024;
        let buffer = new Uint8Array(chunkSize);
        let pendingSize = 0;
        let offsetInModule = 0;
        for (let i = 0; i < data.length;) {
            if (chunkSize > data.length - i) {
                chunkSize = data.length - i;
            }
            const bufferSize = pendingSize + chunkSize;
            if (buffer.byteLength < bufferSize) {
                const newBuffer = new Uint8Array(bufferSize);
                newBuffer.set(buffer);
                buffer = newBuffer;
            }
            while (pendingSize < bufferSize) {
                buffer[pendingSize++] = data[i++];
            }
            parser.setData(buffer.buffer, 0, bufferSize, i === data.length);
            // The disassemble will attemp to fetch the data as much as possible.
            const finished = dis.disassembleChunk(parser, offsetInModule);
            const result = dis.getResult();
            for (const line of result.lines) {
                lines.push(line);
            }
            for (const offset of result.offsets) {
                offsets.push(offset);
            }
            for (const functionBodyOffset of result.functionBodyOffsets) {
                functionBodyOffsets.push(functionBodyOffset);
            }
            if (lines.length > MAX_LINES) {
                lines[MAX_LINES] = ';; .... text is truncated due to size';
                lines.splice(MAX_LINES + 1);
                if (offsets) {
                    offsets.splice(MAX_LINES + 1);
                }
                break;
            }
            if (finished) {
                break;
            }
            if (parser.position === 0) {
                // Parser did not consume anything, needs more data.
                pendingSize = bufferSize;
                continue;
            }
            // Shift the data to the beginning of the buffer.
            const pending = parser.data.subarray(parser.position, parser.length);
            pendingSize = pending.length;
            buffer.set(pending);
            offsetInModule += parser.position;
            const percentage = Math.floor((offsetInModule / data.length) * 100);
            postMessage({ event: 'progress', params: { percentage } });
        }
        postMessage({ event: 'progress', params: { percentage: 99 } });
        const source = lines.join('\n');
        postMessage({ event: 'progress', params: { percentage: 100 } });
        postMessage({ method: 'disassemble', result: { source, offsets, functionBodyOffsets } });
    }
    catch (error) {
        postMessage({ method: 'disassemble', error });
    }
}
//# sourceMappingURL=WasmParserWorker.js.map