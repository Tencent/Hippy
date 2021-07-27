import type * as puppeteer from '../../third_party/puppeteer/puppeteer.js';
import type { Step, UserFlow } from './Steps.js';
export declare class RecordingPlayer {
    userFlow: UserFlow;
    constructor(userFlow: UserFlow);
    play(): Promise<void>;
    getTargetPage(browser: puppeteer.Browser, page: puppeteer.Page, step: Step): Promise<puppeteer.Page>;
    getTargetPageAndFrame(browser: puppeteer.Browser, page: puppeteer.Page, step: Step): Promise<{
        targetPage: puppeteer.Page;
        frame: puppeteer.Frame;
    }>;
    step(browser: puppeteer.Browser, page: puppeteer.Page, step: Step): Promise<void>;
}
