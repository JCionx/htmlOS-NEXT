# Manifest

The app manifest instructs the system on how your app should run. It tells the operating system where the entry point of your app is, where the icon is and even what's the app name.

Your manifest points to one or more file URLs. Those files need to be stored in a CDN or server, that is capable of serving those files with a single static address.

## Essential options
Here's a simple app manifest file:
```json
{
	"id": "com.app.id",
    "name": "name",
	"version": "1.0.1",
    "packageUrl": "https://example.com/package.zip",
    "entryPoint": "index.html",
    "iconPath": "icon.png",
}
```

It includes important information, like:
- **`id`:** The unique package ID of your app. Usually defined as `com.author.appname`.
- **`name`:** The name of your app.
- **`version`:** The semantic version of your app.
- **`packageUrl`:** The URL of your packaged app.
- **`entryPoint`:** The path of the entry HTML file from within the extracted package.
- **`entryPoint`:** The path of the app icon file from within the extracted package.

## Name locale

You should include localized names in your app if possible. Here's how you can do that:

```json
{
	...
	"locale": {
	    "en": "Music Player",
        "pt": "Reprodutor de Música",
	    "es": "Reproductor de música",
        "de": "Musikplayer",
        "zh": "音乐播放器",
        "fr": "Lecteur de musique"
    }
}

```
## App permissions

If your app requires any permissions, add those in the manifest file:

```json
{
	...
    "permissions": [
	    "positionManipulation",
	    "windowSpawning",
	    "diskAccess",
	    "cameraAccess",
	    "microphoneAccess"
    ]
}
```

Before installing your app, the user will be informed of the permissions your app needs.

## Additional options

If your app requires the use of a backend plugin, you need these two keys:
- **`pluginUrl` (string)**: The URL of your compiled JS plugin.
- **`pluginHash` (string)**: SHA 256 hash of your plugin.

Before installing your app, the user will be informed that your app requires a server plugin. If the user installs your app, the plugin will remain disabled until a server administrator enables the plugin manually.

Some other options you can add in your app manifest, that are completely optional, are:
- **`allowResize` (bool):** If your app's window can be resized by the user. Default: `true`.
- **`allowMaximize` (bool):** If your app's window can be maximized by the user. Default: `true`.
- **`defaultWidth` (int):** Starting width of your app's window in pixels. Default: `600`.
- **`defaultHeight` (int):** Starting height of your app's window in pixels. Default: `400`.
- **`minWidth` (int):** Minimum width of your app's window in pixels. Default: `300`.
- **`minHeight` (int):** Minimum height of your app's window in pixels. Default: `200`.
- **`maxWidth` (int):** Maximum width of your app's window in pixels. Default: `window.innerWidth`.
- **`maxHeight` (int):** Maximum height of your app's window in pixels. Default: `window.innerHeight`.
- **`defaultX` (int):** Starting X position of your app's window in pixels. Default: `30`.
- **`defaultY` (int):** Starting Y position of your app's window in pixels. Default: `30`.
- **`borderless` (bool):** If your app's window is borderless. Default: `false`.