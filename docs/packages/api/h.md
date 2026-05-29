### `async getSettings(): Promise<any>`
Retrieves all system settings.

**Returns:**
- `Promise<any>` - Object containing all settings

**Example:**
```typescript
const settings = await getSettings();
console.log(settings.colorScheme);
```

### `async installApp(appConfig: AppInstallConfig, packageUrl: string): Promise<boolean>`
Installs a new app into htmlOS NEXT.

**Parameters:**
- `appConfig` (AppInstallConfig) - App configuration object:
  - `id` (string) - Unique app ID
  - `name` (string) - App display name
  - `version` (string) - App version
  - `packageUrl` (string) - URL to app package
  - `entryPoint` (string) - Entry point file/URL
  - `iconPath` (string) - Path to app icon
  - Additional properties allowed for permissions, etc.
- `packageUrl` (string) - URL where the app package is hosted

**Returns:**
- `Promise<boolean>` - True if installation successful

**Example:**
```typescript
const installed = await installApp(
  {
    id: 'com.example.myapp',
    name: 'My Example App',
    version: '1.0.0',
    packageUrl: 'https://example.com/myapp.zip',
    entryPoint: 'index.html',
    iconPath: 'assets/icon.png'
  },
  'https://example.com/myapp.zip'
);
```



### `async getInstalledApps(): Promise<any[]>`
Retrieves list of installed apps via postMessage.

**Returns:**
- `Promise<any[]>` - Array of installed app objects

**Example:**
```typescript
const apps = await getInstalledApps();
```




### `async getInstalledAppsList(): Promise<any[]>`
Retrieves list of installed apps via HTTP backend call.

**Returns:**
- `Promise<any[]>` - Array of installed app objects

**Example:**
```typescript
const apps = await getInstalledAppsList();
```






### `async uninstallApp(appId: string): Promise<boolean>`
Uninstalls an app from htmlOS NEXT.

**Parameters:**
- `appId` (string) - The app's unique ID

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const uninstalled = await uninstallApp('com.example.myapp');
```

---

## Settings & System Config

### `changeSetting(setting: string, value: string | boolean): void`
**⚠️ This function may not work from app iframes. Use SettingsContext instead (for system components only).**

Changes a system setting. This function sends a message to the parent window but may be restricted for security reasons.

**Parameters:**
- `setting` (string) - Setting key name
- `value` (string | boolean) - Setting value

**Example:**
```typescript
changeSetting('theme', 'dark');
```




These functions make direct HTTP calls to the htmlOS NEXT backend.

### `async getFileTypes(): Promise<any>`
Retrieves available file type associations.

**Returns:**
- `Promise<any>` - File types and their associations

**Example:**
```typescript
const fileTypes = await getFileTypes();
```





### `setDefaultApp(filetype: string, appId: string): Promise<any>`
Sets the default app for opening a specific file type.

**Parameters:**
- `filetype` (string) - File extension (e.g., '.txt')
- `appId` (string) - App ID to set as default

**Returns:**
- `Promise<any>` - Response from backend

**Example:**
```typescript
const result = await setDefaultApp('.txt', 'com.example.texteditor');
```

---

### `async changeUsername(newUsername: string): Promise<any>`
Changes the username of the current user.

**Parameters:**
- `newUsername` (string) - New username

**Returns:**
- `Promise<any>` - Response from backend

**Example:**
```typescript
const result = await changeUsername('mynewusername');
```

---

### `async changePassword(currentPassword: string, newPassword: string): Promise<any>`
Changes the password of the current user.

**Parameters:**
- `currentPassword` (string) - Current password (for verification)
- `newPassword` (string) - New password

**Returns:**
- `Promise<any>` - Response from backend

**Example:**
```typescript
const result = await changePassword('oldpass123', 'newpass456');
```



### `async uploadWallpaper(file: File): Promise<{ success: boolean; wallpaper: string }>`
Uploads an image file to be used as a desktop wallpaper.

**Parameters:**
- `file` (File) - Image file to upload

**Returns:**
- `Promise<{ success: boolean; wallpaper: string }>` - Success status and filename

**Example:**
```typescript
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
if (fileInput.files) {
  const result = await uploadWallpaper(fileInput.files[0]);
  console.log(`Wallpaper saved as: ${result.wallpaper}`);
}
```





### `async deleteWallpaper(filename: string): Promise<{ success: boolean }>`
Deletes a wallpaper file.

**Parameters:**
- `filename` (string) - Name of the wallpaper file to delete

**Returns:**
- `Promise<{ success: boolean }>` - Success status

**Example:**
```typescript
const result = await deleteWallpaper('1234567890_mywallpaper.jpg');
```
