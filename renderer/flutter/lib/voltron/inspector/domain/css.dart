import '../../../engine/engine_context.dart';
import '../domain.dart';
import '../inspector.dart';
import '../model/model.dart';

String kCssDomainName = 'CSS';

class CssDomain extends InspectDomain {
  CssDomain(Inspector inspector) : super(inspector);

  @override
  String get name => kCssDomainName;

  @override
  void receiveFromFrontend(EngineContext context, int id, String method,
      Map<String, dynamic> params) {
    final strategyMap = {
      'getMatchedStylesForNode': _handleGetMatchedStylesForNode,
      'getComputedStyleForNode': _handleGetComputedStyleForNode,
      'getInlineStylesForNode': _handleGetInlineStylesForNode,
      'setStyleTexts': _handleSetStyleTexts,
    };

    strategyMap[method]?.call(context, id, params);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#method-getMatchedStylesForNode
  /// Returns requested styles for a DOM node identified by nodeId.
  void _handleGetMatchedStylesForNode(
      EngineContext context, int id, Map<String, dynamic> params) {
    final int nodeId = params['nodeId'];
    final matchedStyles = MatchedStyles(context, nodeId);
    sendToFrontend(context, id, matchedStyles);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#method-getComputedStyleForNode
  /// Returns the computed style for a DOM node identified by nodeId.
  void _handleGetComputedStyleForNode(
      EngineContext context, int id, Map<String, dynamic> params) {
    final int nodeId = params['nodeId'];
    final computedStyle = ComputedStyle(context, nodeId);
    sendToFrontend(context, id, computedStyle);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#method-getInlineStylesForNode
  /// Returns the styles defined inline (explicitly in the "style" attribute and implicitly, using DOM attributes) for a DOM node identified by nodeId.
  void _handleGetInlineStylesForNode(
      EngineContext context, int id, Map<String, dynamic> params) {
    final int nodeId = params['nodeId'];
    final inlineStyles = InlineStyles(context, nodeId);
    sendToFrontend(context, id, inlineStyles);
  }

  /// https://chromedevtools.github.io/devtools-protocol/tot/CSS/#method-setStyleTexts
  /// Applies specified style edits one after another in the given order.
  void _handleSetStyleTexts(
      EngineContext context, int id, Map<String, dynamic> params) {
    List edits = params['edits'];
    final styleTexts = StyleTexts(context, edits);
    sendToFrontend(context, id, styleTexts);
  }
}
