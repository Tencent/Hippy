# Specify a Cross-Origin Resource Policy to prevent a resource from being blocked

Because your site has the Cross-Origin Embedder Policy (COEP) enabled, each resource must specify a suitable Cross-Origin Resource Policy (CORP).
This behavior prevents a document from loading cross-origin resources which don’t explicitly grant permission to be loaded.

To solve this, add the following to the resource’s response header:
* `Cross-Origin-Resource-Policy: same-site` if the resource and your site are served from the same site.
* `Cross-Origin-Resource-Policy: cross-origin` if the resource is served from another location than your website. ⚠️If you set this header, any website can embed this resource.
