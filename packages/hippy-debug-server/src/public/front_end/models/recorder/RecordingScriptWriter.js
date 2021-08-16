// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assertAllStepTypesAreHandled } from './Steps.js';
export class RecordingScriptWriter {
    indentation;
    script = [];
    currentIndentation = 0;
    constructor(indentation) {
        this.indentation = indentation;
    }
    appendLineToScript(line) {
        this.script.push(line ? this.indentation.repeat(this.currentIndentation) + line.trimRight() : '');
    }
    appendTarget(target) {
        if (target === 'main') {
            this.appendLineToScript('const targetPage = page;');
        }
        else {
            this.appendLineToScript(`const target = await browser.waitForTarget(t => t.url === ${JSON.stringify(target)});`);
            this.appendLineToScript('const targetPage = await target.page();');
        }
    }
    appendFrame(path) {
        this.appendLineToScript('let frame = targetPage.mainFrame();');
        for (const index of path) {
            this.appendLineToScript(`frame = frame.childFrames()[${index}];`);
        }
    }
    appendContext(step) {
        this.appendTarget(step.context.target);
        this.appendFrame(step.context.path);
    }
    appendClickStep(step) {
        this.appendLineToScript(`const element = await frame.waitForSelector(${JSON.stringify(step.selector)});`);
        this.appendLineToScript('await element.click();');
    }
    appendChangeStep(step) {
        this.appendLineToScript(`const element = await frame.waitForSelector(${JSON.stringify(step.selector)});`);
        this.appendLineToScript(`await element.type(${JSON.stringify(step.value)});`);
    }
    appendSubmitStep(step) {
        this.appendLineToScript(`const element = await frame.waitForSelector(${JSON.stringify(step.selector)});`);
        this.appendLineToScript('await element.evaluate(form => form.submit());');
    }
    appendEmulateNetworkConditionsStep(step) {
        this.appendLineToScript('await page.emulateNetworkConditions({');
        this.appendLineToScript(`  offline: ${!step.conditions.download && !step.conditions.upload},`);
        this.appendLineToScript(`  downloadThroughput: ${step.conditions.download},`);
        this.appendLineToScript(`  uploadThroughput: ${step.conditions.upload},`);
        this.appendLineToScript(`  latency: ${step.conditions.latency},`);
        this.appendLineToScript('});');
    }
    appendKeyDownStep(step) {
        this.appendLineToScript(`await targetPage.keyboard.down(${JSON.stringify(step.key)});`);
    }
    appendKeyUpStep(step) {
        this.appendLineToScript(`await targetPage.keyboard.up(${JSON.stringify(step.key)});`);
    }
    appendCloseStep(_step) {
        this.appendLineToScript('await targetPage.close()');
    }
    appendViewportStep(step) {
        this.appendLineToScript(`await targetPage.setViewport(${JSON.stringify({ width: step.width, height: step.height })}})`);
    }
    appendStepType(step) {
        switch (step.type) {
            case 'click':
                return this.appendClickStep(step);
            case 'change':
                return this.appendChangeStep(step);
            case 'submit':
                return this.appendSubmitStep(step);
            case 'emulateNetworkConditions':
                return this.appendEmulateNetworkConditionsStep(step);
            case 'keydown':
                return this.appendKeyDownStep(step);
            case 'keyup':
                return this.appendKeyUpStep(step);
            case 'close':
                return this.appendCloseStep(step);
            case 'viewport':
                return this.appendViewportStep(step);
            default:
                return assertAllStepTypesAreHandled(step);
        }
    }
    appendStep(step) {
        this.appendLineToScript('{');
        this.currentIndentation += 1;
        if ('condition' in step && step.condition && step.condition.type === 'waitForNavigation') {
            this.appendLineToScript('const promise = targetPage.waitForNavigation();');
        }
        if ('context' in step) {
            this.appendContext(step);
        }
        this.appendStepType(step);
        if ('condition' in step) {
            this.appendLineToScript('await promise;');
        }
        this.currentIndentation -= 1;
        this.appendLineToScript('}');
    }
    getCurrentScript() {
        // Scripts should end with a final blank line.
        return this.script.join('\n') + '\n';
    }
    getScript(recording) {
        this.script = [];
        this.appendLineToScript('const puppeteer = require(\'puppeteer\');');
        this.appendLineToScript('');
        this.appendLineToScript('(async () => {');
        this.currentIndentation += 1;
        this.appendLineToScript('const browser = await puppeteer.launch();');
        this.appendLineToScript('const page = await browser.newPage();');
        this.appendLineToScript('');
        for (const section of recording.sections) {
            for (const step of section.steps) {
                this.appendStep(step);
            }
        }
        this.appendLineToScript('');
        this.appendLineToScript('await browser.close();');
        this.currentIndentation -= 1;
        this.appendLineToScript('})();');
        // Scripts should end with a final blank line.
        return this.getCurrentScript();
    }
}
//# sourceMappingURL=RecordingScriptWriter.js.map