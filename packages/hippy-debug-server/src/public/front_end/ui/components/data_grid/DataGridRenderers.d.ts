import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import type { CellValue } from './DataGridUtils.js';
export declare const primitiveRenderer: (value: CellValue) => LitHtml.TemplateResult;
export declare const codeBlockRenderer: (value: CellValue) => LitHtml.TemplateResult | typeof LitHtml.nothing;
