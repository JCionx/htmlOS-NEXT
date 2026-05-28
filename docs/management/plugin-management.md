You can manage plugins in **htmlOS NEXT** by using the `cli.js` tool.
Before executing any command in this tool, you first need to be in it's container and/or directory.

To do that, first follow the instructions under: [Getting inside the backend directory](./getting-inside-the-backend-directory.md)

> [!DANGER]
> Enabled plugins can run arbitrary code in your server! Make sure you trust the source where you downloaded the plugin from.

## Enable a plugin
To enable a plugin, run:
```bash
node cli.js plugin enable <app_id>
```

## Disable a plugin
To disable a plugin, run:
```bash
node cli.js disable enable <app_id>
```

---

> [!INFO]
> After enabling or disabling a plugin, you need to restart your backend.
