import 'jest';
import {
  getDomNodeBounds,
  getRenderNodeBounds,
  marginOrPaddingNormalize,
  borderNormalize,
  HippyFlexSpacing,
} from '@chrome-devtools-extensions/utils/hippy-flex-normalize';
import { parseRenderNodeProperty } from '@chrome-devtools-extensions/utils/ui-tree';
import {
  MOCK_RENDER_NODE_DETAIL_PROPERTY,
  EXPECTED_CONVERTED_RENDER_NODE_DETAIL,
  MOCK_RENDER_NODE,
  EXPECTED_RENDER_NODE_BOUNDS,
  MOCK_DOM_NODE,
  EXPECTED_DOM_NODE_BOUNDS,
  ROOT_WIDTH,
  ROOT_HEIGHT,
  IMG_WIDTH,
  IMG_HEIGHT,
  EXPECTED_NO_NODE_BOUNDS,
  FLEX_SPACING_ALL,
  EXPECTED_CONVERTED_ALL,
  FLEX_SPACING_HORIZONTAL,
  EXPECTED_CONVERTED_HORIZONTAL,
  FLEX_SPACING_VERTICAL,
  EXPECTED_CONVERTED_VERTICAL,
} from '../../__mocks__/ui-inspector-bounds';
import TDFInspector = ProtocolTdf.TDFInspector;

describe('hippy flex normallize', () => {
  it('dom node normalize', () => {
    const domNodeBounds = getDomNodeBounds(MOCK_DOM_NODE as unknown as TDFInspector.ITree, {
      rootWidth: ROOT_WIDTH,
      rootHeight: ROOT_HEIGHT,
      imgWidth: IMG_WIDTH,
      imgHeight: IMG_HEIGHT,
    });
    expect(domNodeBounds).toEqual(EXPECTED_DOM_NODE_BOUNDS);
  });

  it('dom node normalize, empty node input', () => {
    const domNodeBounds = getDomNodeBounds({} as unknown as TDFInspector.ITree, {
      rootWidth: ROOT_WIDTH,
      rootHeight: ROOT_HEIGHT,
      imgWidth: IMG_WIDTH,
      imgHeight: IMG_HEIGHT,
    });
    expect(domNodeBounds).toEqual(EXPECTED_NO_NODE_BOUNDS);
  });

  it('render node normalize', () => {
    const renderNodeBounds = getRenderNodeBounds(MOCK_RENDER_NODE as unknown as TDFInspector.RTree, {
      rootWidth: ROOT_WIDTH,
      rootHeight: ROOT_HEIGHT,
      imgWidth: IMG_WIDTH,
      imgHeight: IMG_HEIGHT,
    });
    expect(renderNodeBounds).toEqual(EXPECTED_RENDER_NODE_BOUNDS);
  });
  it('render node normalize, empty node input', () => {
    const renderNodeBounds = getRenderNodeBounds({} as unknown as TDFInspector.RTree, {
      rootWidth: ROOT_WIDTH,
      rootHeight: ROOT_HEIGHT,
      imgWidth: IMG_WIDTH,
      imgHeight: IMG_HEIGHT,
    });
    expect(renderNodeBounds).toEqual(EXPECTED_NO_NODE_BOUNDS);
  });
});

describe('select render node', () => {
  it('render node detail propertity', () => {
    const renderNodeProperty = parseRenderNodeProperty(MOCK_RENDER_NODE_DETAIL_PROPERTY);
    expect(renderNodeProperty).toEqual(EXPECTED_CONVERTED_RENDER_NODE_DETAIL);
  });
});

describe('bounds normalize', () => {
  describe('margin or padding normalize', () => {
    it('margin or padding transfrom with all flag', () => {
      const transfromed = marginOrPaddingNormalize(FLEX_SPACING_ALL as unknown as HippyFlexSpacing);
      expect(transfromed).toEqual(EXPECTED_CONVERTED_ALL);
    });
    it('margin or padding transfrom with horizontal tag', () => {
      const transfromed = marginOrPaddingNormalize(FLEX_SPACING_HORIZONTAL as unknown as HippyFlexSpacing);
      expect(transfromed).toEqual(EXPECTED_CONVERTED_HORIZONTAL);
    });
    it('margin or padding transfrom with vertical tag', () => {
      const transfromed = marginOrPaddingNormalize(FLEX_SPACING_VERTICAL as unknown as HippyFlexSpacing);
      expect(transfromed).toEqual(EXPECTED_CONVERTED_VERTICAL);
    });
  });
  describe('border normalize', () => {
    it('border transfrom with all flag', () => {
      const transfromed = borderNormalize(FLEX_SPACING_ALL as unknown as HippyFlexSpacing);
      expect(transfromed).toEqual(EXPECTED_CONVERTED_ALL);
    });
  });
});
