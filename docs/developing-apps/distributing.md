# Distributing

You can distribute your **htmlOS NEXT** using one of two methods:
1. **Sideloading from your website**
2. **Publishing to the App Store**

## 1. Sideloading from your website

You can publish your app on your own website for anyone to install. To do that, you need your app to be packaged already. You need to host the app package, and the app icon on your website or CDN. Then, you need to build a manifest file for your app. To do that, you can read the [Manifest](./manifest) guide.

After you've got your manifest ready, you need to add one more key to it:
```json
{
	...
    "previewIcon": "https://example.com/app-icon.png",
    ...
}
```

This makes sure that the users can see your app icon during the installation.

In your website, you need to host your manifest and a small script that initiates the installation process. Your website can look like this:

```html
<!doctype html>
<html lang="en">
	<head>
		<title>My App Website</title>
	</head>
	<body>
		<button id="triggerInstall">Install My App</button>
		<script>
			const app_manifest = {
				"id": "com.example.myapp",
				"name": "My App",
				"previewIcon": "https://example.com/app-icon.png",
				"version": "1.0.0",
				"packageUrl": "https://example.com/package.zip",
				"entryPoint": "index.html",
				"iconPath": "icon.png",
			};
			
			document.getElementById("triggerInstall").addEventListener("click", () => {
				window.parent.postMessage({
					type: "installApp",
					app: app_manifest,
				}, "*");
			});
		</script>
	</body>
</html>
```

This simple page, when loaded on the **htmlOS NEXT** Browser app, will display a button labeled `Install My App`. Upon pressing that button, the operating system will ask the user for confirmation about installing your app.

## 2. Publishing to the App Store

If you want to publish your app to the **htmlOS NEXT** App Store, your app needs to follow certain rules:
- Your app needs to be useful
- Your app can't do any malicious activity
- Your app's source code must be available
- Your app needs to be personally verified by me

If you want to proceed with publishing your app to the App Store, you need to build a store manifest, containing your app manifest:

```json
{
      "author": "MyName",
      "description": "Unofficial YouTube App for htmlOS NEXT.",
      "storeIcon": "https://example.com/app-icon.png",
      "screenshots": [
        "https://example.com/screenshots/1.jpeg",
        "https://example.com/screenshots/2.jpeg",
        "https://example.com/screenshots/3.jpeg"
      ],
      "app": {
        "id": "com.example.myapp",
        "name": "My App",
        "version": "1.0.0",
        "packageUrl": "https://example.com/package.zip",
        "entryPoint": "index.html",
        "iconPath": "icon.png"
    }
}
```

These are the fields you should have in your store manifest:

- **`author`:** Your name or username.
- **`description`:** Clear description of what your app does, and features.
- **`storeIcon`:** URL to your app icon to be displayed in the App Store.
- **`screenshots`:** Array of URLs to screenshots to be displayed in the App Store.
- **`app`:** Your app manifest.

After you've got that done, contact me personally to verify your app at [jcionx0@gmail.com](mailto:jcionx0@gmail.com).