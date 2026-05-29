# 2. Setting up your environment

Let's create your project folder first. Open a terminal where you want your project folder to be created, and run

```bash
npm create vite@latest
```

You will be asked the name of the project. You can name it `stopwatch-app`, or anything you want. You will also be asked to choose a framework and variant, so make sure to select `React` and `TypeScript`.

Your terminal should look like this:
```
│
◇  Project name:
│  stopwatch-app
│
◇  Select a framework:
│  React
│
◇  Select a variant:
│  TypeScript
│
◇  Install with npm and start now?
│  No
│
◇  Scaffolding project in /Users/jcionx/Desktop/stopwatch-app...
│
└  Done. Now run:

  cd stopwatch-app
  npm install
  npm run dev
```

You can now go inside the project folder and install the necessary dependencies:

```bash
cd stopwatch-app
npm install
```

By default Vite uses absolute paths for loading assets, and **htmlOS NEXT** apps are incompatible with that behavior. To fix that issue, we must tell Vite to use relative paths instead. Open your `vite.config.ts` file, and edit it to look like this:

```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
	base: "",
	plugins: [react()],
})
```

Now you need an icon for your app. You can download this pre-made icon. Right-click the following link, and select **Save Link As...**/**Download Linked File As...** and save the icon to `public/icon.png` on your project folder.

[Stopwatch Icon](./images/icon.png)

Before you try to install your app in your **htmlOS NEXT** instance, you need to add this line to the environment section on your backend container (if using Docker Compose), or to the `.env` file in your `backend` directory (if running manually):

- **`ALLOW_UNSECURE_INSTALLS=true`**

Restart your backend afterwards. Now your backend will allow installing apps from HTTP servers, like the development server we will run.

Let's create a tiny server to host out app package.

Inside the `stopwatch-app` folder, create a new folder called `installer`:

```bash
mkdir installer
```

Inside that folder, create a file called `index.html`:

```html
<html lang="en">
	<head>
		<title>My App Website</title>
	</head>
	<body>
		<button id="triggerInstall">Install My App</button>
		<script>
			const app_manifest = {
				"id": "com.example.stopwatchapp",
				"name": "Stopwatch",
				"previewIcon": "http://localhost:3000/icon.png",
				"version": "1.0.0",
				"packageUrl": "http://localhost:3000/package.zip",
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

(if you are not developing this project on the same machine as the **htmlOS NEXT** server, you might need to change the URLs in the manifest to point to the machine where you're developing the app)

Make a copy of the previously downloaded icon, to `installer/public/icon.png`.

Inside the `installer` folder, run:

```bash
npx serve
```

That will start serving your installer file locally on port 3000. You should see something like this:

```
┌───────────────────────────────────────────┐
│                                           │
│   Serving!                                │
│                                           │
│   - Local:    http://localhost:3000       │
│   - Network:  http://X.X.X.X:3000         │
│                                           │
│   Copied local address to clipboard!      │
│                                           │
└───────────────────────────────────────────┘
```

One last step before installing, we need to pack the app into a zip file, and place it on the installer folder. We can automate that inside the `package.json` file. Edit your `package.json` file to add this line under scripts:

```json
{
	...
	"scripts": {
		...,
		"pack": "npm run build && cd dist && zip -r ../installer/package.zip ."
	}
	...
}
```

Now, run this command:

```bash
npm run pack
```

That command built the app, compressed it into a zip file, and put the zip file in the expected `installer/package.zip` path.

Finally, open the Browser inside **htmlOS NEXT**, and open this URL on there: 
`http://localhost:3000` (or the address where you're developing the app)

There, click the `Install My App` button. You will now see a system popup to confirm the installation, and you can click `Install`.

Now you should be able to open the app `Stopwatch`. After you open it, you will see the default Vite screen, which means that everything is working as expected.

But every time you want to test out a change in your app, it's a hassle to pack it, start the installation server, uninstall the app, and install it again. To get around this, we can just tap directly into the app directory in the backend. First, let's add one more script to our `package.json` file:

```json
{
	...
	"scripts": {
		...,
		"watch": "vite build --watch"
	}
	...
}
```

And finally, add a `symlink` between the `dist` folder, and the app folder in your backend. The Stopwatch app folder in your backend should be under `data/<user_id>/Applications/com.example.stopwatchapp`.

Run this inside your project folder:

```bash
ln -sf "$(pwd)/dist" <path_to_stopwatch_app_in_backend>
```

Now, you just need to keep a shell running this command in the project folder:

```bash
npm run watch
```

And whenever you make a change to your app's source code, the changes will be ready to be tested.

> [!TIP]
> Enable `Show Developer Options` in `System` settings, and enable `Show Reload Button` in `Developer Options`. This will add a refresh button to the titlebar on windows, so you can easily refresh to see your changes.

