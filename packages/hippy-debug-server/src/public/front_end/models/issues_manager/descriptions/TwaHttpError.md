# Trusted Web Activity navigations must succeed or be handled by the ServiceWorker. Your app may crash in the future.

Dead link (404) or 5xx status code encountered when navigating within the verified origin.

In order to provide a seamless experience on par with Android apps, it is important for navigations within the verified origin in a Trusted Web Activity not result in broken links or internal errors.

⚠️ In the future, your app may crash if the user navigates to a page and gets a 404 or 50x error. Ensure that all links on your origin are correct, or use a service worker to handle these errors gracefully.

Please make sure your app doesn’t have 404 or 5xx errors, or use a service worker fetch event fallback response to handle the errors.