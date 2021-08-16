import type * as Elements from '../../../../panels/elements/components/components.js';
interface CrumbOverrides extends Partial<Elements.ElementsBreadcrumbsUtils.DOMNode> {
    attributes?: {
        [x: string]: string | undefined;
    };
}
export declare const makeCrumb: (overrides?: CrumbOverrides) => Elements.ElementsBreadcrumbsUtils.DOMNode;
export {};
