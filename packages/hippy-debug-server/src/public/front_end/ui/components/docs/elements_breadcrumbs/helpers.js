let id = 0;
export const makeCrumb = (overrides = {}) => {
    const attributes = overrides.attributes || {};
    const newCrumb = {
        nodeType: Node.ELEMENT_NODE,
        id: id++,
        pseudoType: '',
        parentNode: null,
        shadowRootType: '',
        nodeName: 'body',
        nodeNameNicelyCased: 'body',
        legacyDomNode: {},
        highlightNode: () => { },
        clearHighlight: () => { },
        getAttribute: (x) => attributes[x] || '',
        ...overrides,
    };
    return newCrumb;
};
//# sourceMappingURL=helpers.js.map