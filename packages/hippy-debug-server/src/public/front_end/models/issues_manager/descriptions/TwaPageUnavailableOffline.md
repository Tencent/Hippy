# Trusted Web Activity does not work offline. In the future, your app may crash if the user’s device goes offline.

Navigation within the Trusted Web Activity leads to a page not available offline.

Offline capabilities are important to create a seamless user experience on par with Android apps. Your app should provide a custom offline page.

⚠️ In the future, your app may crash unless a proper offline handler is implemented using a ServiceWorker fetch handler.

To resolve this issue, handle offline resource requests using a ServiceWorker.
