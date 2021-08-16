// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { getPuppeteerConnection as getPuppeteerConnectionToCurrentPage } from './PuppeteerConnection.js';
import { assertAllStepTypesAreHandled } from './Steps.js';
export class RecordingPlayer {
    userFlow;
    constructor(userFlow) {
        this.userFlow = userFlow;
    }
    async play() {
        await SDK.TargetManager.TargetManager.instance().suspendAllTargets();
        const { page, browser } = await getPuppeteerConnectionToCurrentPage();
        if (!page) {
            throw new Error('could not find main page!');
        }
        try {
            page.setDefaultTimeout(5000);
            let isFirstSection = true;
            for (const section of this.userFlow.sections) {
                if (isFirstSection) {
                    await page.goto(section.url);
                    isFirstSection = false;
                }
                for (const step of section.steps) {
                    await this.step(browser, page, step);
                }
            }
        }
        catch (err) {
            console.error('ERROR', err.message);
        }
        finally {
            const pages = await browser.pages();
            for (const page of pages) {
                // @ts-ignore
                const client = page._client;
                await client.send('Network.disable');
                await client.send('Page.disable');
                await client.send('Log.disable');
                await client.send('Performance.disable');
                await client.send('Runtime.disable');
            }
            browser.disconnect();
            await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
        }
    }
    async getTargetPage(browser, page, step) {
        if (!('context' in step) || step.context.target === 'main') {
            return page;
        }
        const target = await browser.waitForTarget(t => t.url() === step.context.target);
        const targetPage = await target.page();
        if (!targetPage) {
            throw new Error('Could not find target page.');
        }
        return targetPage;
    }
    async getTargetPageAndFrame(browser, page, step) {
        const targetPage = await this.getTargetPage(browser, page, step);
        let frame = targetPage.mainFrame();
        if ('context' in step) {
            for (const index of step.context.path) {
                frame = frame.childFrames()[index];
            }
        }
        return { targetPage, frame };
    }
    async step(browser, page, step) {
        const { targetPage, frame } = await this.getTargetPageAndFrame(browser, page, step);
        let condition = null;
        if ('condition' in step && step.condition && step.condition.type === 'waitForNavigation') {
            condition = targetPage.waitForNavigation();
        }
        switch (step.type) {
            case 'click':
                {
                    const element = await frame.waitForSelector(step.selector);
                    if (!element) {
                        throw new Error('Could not find element: ' + step.selector);
                    }
                    await element.click();
                }
                break;
            case 'submit':
                {
                    const element = await frame.waitForSelector(step.selector);
                    if (!element) {
                        throw new Error('Could not find element: ' + step.selector);
                    }
                    await element.evaluate(form => form.submit());
                }
                break;
            case 'emulateNetworkConditions':
                {
                    await page.emulateNetworkConditions(step.conditions);
                }
                break;
            case 'keydown':
                {
                    await page.keyboard.down(step.key);
                    await page.waitForTimeout(100);
                }
                break;
            case 'keyup':
                {
                    await page.keyboard.up(step.key);
                    await page.waitForTimeout(100);
                }
                break;
            case 'close':
                {
                    await page.close();
                }
                break;
            case 'change':
                {
                    // TODO(alexrudenko): currently the change event is only supported for <select>s.
                    const element = await frame.waitForSelector(step.selector);
                    if (!element) {
                        throw new Error('Could not find element: ' + step.selector);
                    }
                    await element.select(step.value);
                    // We need blur and focus to make the select dropdown to close.
                    // Otherwise, it remains open until a blur event. This is not very
                    // nice because user actions don't actually generate those events.
                    await element.evaluate(e => e.blur());
                    await element.focus();
                }
                break;
            case 'viewport': {
                await targetPage.setViewport({
                    width: step.width,
                    height: step.height,
                });
                break;
            }
            default:
                assertAllStepTypesAreHandled(step);
        }
        await condition;
    }
}
//# sourceMappingURL=RecordingPlayer.js.map