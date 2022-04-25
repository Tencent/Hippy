export const ROOT_WIDTH = 392;
export const ROOT_HEIGHT = 800;
export const IMG_WIDTH = 784;
export const IMG_HEIGHT = 1600;

export const MOCK_RENDER_NODE_DETAIL_PROPERTY = [
  {
    name: 'id_',
    type: 'GetTypeNam',
    value: '273',
  },
  {
    name: 'is_clip_to_bounds_',
    type: 'G',
    value: '0',
  },
  {
    name: 'offset_',
    type: 'GetT',
    value: '{"x":0,"y":0}',
  },
  {
    name: 'size_',
    type: 'Get',
    value: '{"w":392,"h":800}',
  },
];

export const EXPECTED_CONVERTED_RENDER_NODE_DETAIL = {
  id_: 273,
  is_clip_to_bounds_: 0,
  offset_: {
    x: 0,
    y: 0,
  },
  size_: {
    w: 392,
    h: 800,
  },
};

export const MOCK_RENDER_NODE = {
  bounds: {
    bottom: 800,
    left: 0,
    right: 392,
    top: 0,
  },
  id: 273,
  isRepaintBoundary: false,
  name: 'tdf::core::MultiChildRenderObject',
  needsCompositing: false,
};

export const EXPECTED_RENDER_NODE_BOUNDS = {
  marginBounds: {},
  borderBounds: {},
  paddingBounds: {},
  contentBounds: {
    left: '0%',
    right: '100%',
    top: '0%',
    bottom: '100%',
    width: '100%',
    height: '100%',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderTopWidth: '0px',
    borderBottomWidth: '0px',
  },
};

export const EXPECTED_NO_NODE_BOUNDS = {
  marginBounds: {},
  borderBounds: {},
  paddingBounds: {},
  contentBounds: {},
};

export const MOCK_DOM_NODE = {
  bgColor: 0,
  borderColor: 0,
  bounds: {
    bottom: 117,
    left: 0,
    right: 392,
    top: 60,
  },
  domRelativeRenderId: -1,
  flexNodeStyle: {
    alignItems: 'stretch',
    border: [0, 0, 0, 5, 0, 0, 0, 0, 0],
    flex: 0,
    flexDirection: 'row',
    height: 0,
    hpdDirection: 'LTR',
    justifyContent: 'start',
    margin: [0, 0, 0, 30, 0, 0, 0, 0, 0],
    padding: [0, 10, 0, 10, 0, 0, 0, 0, 0],
    width: 0,
  },
  height: 57,
  id: 16,
  left: 0,
  nodeType: 'groupNode',
  top: 0,
  totalProps: {
    attributes: {
      class: '',
      id: 'version-info',
    },
    style: {
      borderBottomColor: 4292664540,
      borderBottomStyle: 'solid',
      borderBottomWidth: 5,
      marginBottom: 30,
      paddingBottom: 10,
      paddingTop: 10,
    },
    text: '',
  },
  width: 392,
  text: '',
  base64: '',
  child: [],
};

export const EXPECTED_DOM_NODE_BOUNDS = {
  marginBounds: {
    left: '0%',
    right: '100%',
    top: '7.5%',
    bottom: '18.375%',
    width: '100%',
    height: '10.875%',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderTopWidth: '0px',
    borderBottomWidth: '60px',
    boxSizing: 'border-box',
  },
  borderBounds: {
    left: '0%',
    right: '100%',
    top: '7.5%',
    bottom: '14.625%',
    width: '100%',
    height: '7.125%',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderTopWidth: '0px',
    borderBottomWidth: '10px',
    boxSizing: 'border-box',
  },
  paddingBounds: {
    left: '0%',
    right: '100%',
    top: '7.5%',
    bottom: '14%',
    width: '100%',
    height: '6.5%',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderTopWidth: '20px',
    borderBottomWidth: '20px',
    boxSizing: 'border-box',
  },
  contentBounds: {
    left: '0%',
    right: '100%',
    top: '8.75%',
    bottom: '12.75%',
    width: '100%',
    height: '4%',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderTopWidth: '0px',
    borderBottomWidth: '0px',
  },
};

export const FLEX_SPACING_ALL = [0, 0, 0, 0, 0, 0, 0, 0, 2];
export const EXPECTED_CONVERTED_ALL = {
  left: 2,
  right: 2,
  top: 2,
  bottom: 2,
};

export const FLEX_SPACING_HORIZONTAL = [0, 0, 0, 0, 0, 0, 2, 0, 0];
export const EXPECTED_CONVERTED_HORIZONTAL = {
  left: 2,
  right: 2,
  top: 0,
  bottom: 0,
};
export const FLEX_SPACING_VERTICAL = [0, 0, 0, 0, 0, 0, 0, 2, 0];
export const EXPECTED_CONVERTED_VERTICAL = {
  left: 0,
  right: 0,
  top: 2,
  bottom: 2,
};
