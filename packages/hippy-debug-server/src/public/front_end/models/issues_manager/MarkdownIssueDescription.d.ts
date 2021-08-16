import * as Marked from '../../third_party/marked/marked.js';
/**
 * The description that subclasses of `Issue` use define the issue appearance:
 * `file` specifies the markdown file, substitutions can be used to replace
 * placeholders with, e.g. URLs. The `links` property is used to specify the
 * links at the bottom of the issue.
 */
export interface MarkdownIssueDescription {
    file: string;
    substitutions?: Map<string, string>;
    links: {
        link: string;
        linkTitle: string;
    }[];
}
export interface LazyMarkdownIssueDescription {
    file: string;
    substitutions?: Map<string, () => string>;
    links: {
        link: string;
        linkTitle: () => string;
    }[];
}
/**
 * A lazy version of the description. Allows to specify a description as a
 * constant and at the same time delays resolution of the substitutions
 * and/or link titles to allow localization.
 */
export declare function resolveLazyDescription(lazyDescription: LazyMarkdownIssueDescription): MarkdownIssueDescription;
/**
 * A loaded and parsed issue description. This is usually obtained by loading
 * a `MarkdownIssueDescription` via `createIssueDescriptionFromMarkdown`.
 */
export interface IssueDescription {
    title: string;
    markdown: Marked.Marked.Token[];
    links: {
        link: string;
        linkTitle: string;
    }[];
}
export declare function getFileContent(url: URL): Promise<string>;
export declare function getMarkdownFileContent(filename: string): Promise<string>;
export declare function createIssueDescriptionFromMarkdown(description: MarkdownIssueDescription): Promise<IssueDescription>;
/**
 * This function is exported separately for unit testing.
 */
export declare function createIssueDescriptionFromRawMarkdown(markdown: string, description: MarkdownIssueDescription): IssueDescription;
/**
 * Replaces placeholders in markdown text with a string provided by the
 * `substitutions` map. To keep mental overhead to a minimum, the same
 * syntax is used as for l10n placeholders. Please note that the
 * placeholders require a mandatory 'PLACEHOLDER_' prefix.
 *
 * Example:
 *   const str = "This is markdown with `code` and two placeholders, namely {PLACEHOLDER_PH1} and {PLACEHOLDER_PH2}".
 *   const result = substitePlaceholders(str, new Map([['PLACEHOLDER_PH1', 'foo'], ['PLACEHOLDER_PH2', 'bar']]));
 *
 * Exported only for unit testing.
 */
export declare function substitutePlaceholders(markdown: string, substitutions?: Map<string, string>): string;
export declare function findTitleFromMarkdownAst(markdownAst: Marked.Marked.Token[]): string | null;
