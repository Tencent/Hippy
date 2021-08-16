export declare const enum Category {
    Layout = "Layout",
    Text = "Text",
    Appearance = "Appearance",
    Animation = "Animation",
    Grid = "Grid",
    Flex = "Flex",
    Table = "Table",
    CSSVariables = "CSS Variables",
    GeneratedContent = "Generated Content",
    Other = "Other"
}
export declare const DefaultCategoryOrder: Category[];
/**
 * Categorize a given property name to one or more categories.
 *
 * It matches against the static CategoriesByPropertyName first. It then
 * matches against several dynamic rules. It then tries to use the canonical
 * name's shorthands for matching. If nothing matches, it returns the "Other"
 * category.
 */
export declare const categorizePropertyName: (propertyName: string) => Category[];
