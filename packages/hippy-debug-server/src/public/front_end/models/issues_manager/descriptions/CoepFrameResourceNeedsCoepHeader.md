# Specify a Cross-Origin Embedder Policy to prevent this frame from being blocked

Because your site has the Cross-Origin Embedder Policy (COEP) enabled, each embedded iframe must also specify this policy.
This behavior protects private data from being exposed to untrusted third party sites.

To solve this, add the following to the embedded frame’s HTML response header: `Cross-Origin-Embedder-Policy: require-corp`
