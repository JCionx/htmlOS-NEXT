# htmlOS NEXT API Documentation

This document provides comprehensive documentation for all API calls available in the `@htmlos-next/api` package. These functions allow apps running in htmlOS NEXT to interact with the system, manage windows, files, and settings.

## Table of Contents

1. [Window Management](#window-management)
2. [Screen & Window Getters](#screen--window-getters)
3. [File & Directory Operations](#file--directory-operations)
4. [System & App Management](#system--app-management)
5. [Settings & System Config](#settings--system-config)
6. [HTTP Backend Calls](#http-backend-calls)
7. [Continuity](#continuity)

---

## Window Management

### `changeParentWindowTitle(newTitle: string): void`
Changes the title of the app window.

**Parameters:**
- `newTitle` (string) - The new title to display in the window's title bar

**Example:**
```typescript
import { changeParentWindowTitle } from '@htmlos-next/api';
changeParentWindowTitle('My App - Editing File.txt');
```

---

### `setPosition(position_x: number, position_y: number, animate?: boolean): void`
Sets the position of the window on the screen.

**Parameters:**
- `position_x` (number) - X coordinate (in pixels)
- `position_y` (number) - Y coordinate (in pixels)
- `animate` (boolean, optional) - Whether to animate the movement (default: true)

**Example:**
```typescript
setPosition(100, 200, true);
```

---

### `setXPosition(position: number, animate?: boolean): void`
Sets only the X position of the window.

**Parameters:**
- `position` (number) - X coordinate (in pixels)
- `animate` (boolean, optional) - Whether to animate the movement (default: true)

**Example:**
```typescript
setXPosition(150);
```

---

### `setYPosition(position: number, animate?: boolean): void`
Sets only the Y position of the window.

**Parameters:**
- `position` (number) - Y coordinate (in pixels)
- `animate` (boolean, optional) - Whether to animate the movement (default: true)

**Example:**
```typescript
setYPosition(300);
```

---

### `setWidth(width: number, animate?: boolean): void`
Sets the width of the window.

**Parameters:**
- `width` (number) - Width in pixels
- `animate` (boolean, optional) - Whether to animate the resize (default: true)

**Example:**
```typescript
setWidth(800);
```

---

### `setHeight(height: number, animate?: boolean): void`
Sets the height of the window.

**Parameters:**
- `height` (number) - Height in pixels
- `animate` (boolean, optional) - Whether to animate the resize (default: true)

**Example:**
```typescript
setHeight(600);
```

---

### `setSize(width: number, height: number, animate?: boolean): void`
Sets both width and height of the window.

**Parameters:**
- `width` (number) - Width in pixels
- `height` (number) - Height in pixels
- `animate` (boolean, optional) - Whether to animate the resize (default: true)

**Example:**
```typescript
setSize(1024, 768, true);
```

---

### `async getPosition(): Promise<Position>`
Retrieves the current position of the window.

**Returns:**
- `Promise<Position>` - Object containing `x` and `y` coordinates

**Example:**
```typescript
const position = await getPosition();
console.log(`Window at: ${position.x}, ${position.y}`);
```

---

### `spawnWindow(config: SpawnWindowConfig): void`
Opens a new window/app within htmlOS NEXT.

**Parameters:**
- `config` (SpawnWindowConfig) - Configuration object with the following properties:
  - `id` (string) - Unique app ID
  - `title` (string) - Window title
  - `url` (string) - URL to load in the window
  - `icon?` (string) - Icon path or URL
  - `defaultX?` (number) - Default X position
  - `defaultY?` (number) - Default Y position
  - `borderless?` (boolean) - Show window decorations
  - `defaultWidth?` (number) - Default window width
  - `defaultHeight?` (number) - Default window height
  - `minWidth?` (number) - Minimum allowed width
  - `minHeight?` (number) - Minimum allowed height
  - `maxWidth?` (number) - Maximum allowed width
  - `maxHeight?` (number) - Maximum allowed height
  - `allowResize?` (boolean) - Allow user to resize
  - `allowMaximize?` (boolean) - Allow user to maximize

**Example:**
```typescript
spawnWindow({
  id: 'my-app-instance-1',
  title: 'My New Window',
  url: 'https://example.com/app',
  defaultWidth: 800,
  defaultHeight: 600,
  icon: 'path/to/icon.png'
});
```

---

### `quit(): void`
Closes the current app window.

**Example:**
```typescript
quit();
```

---

### `toggleMaximize(): void`
Toggles the maximized state of the window.

**Example:**
```typescript
toggleMaximize();
```

---

## Screen & Window Getters

### `getScreenWidth(): number`
Returns the total screen width in pixels.

**Example:**
```typescript
const screenWidth = getScreenWidth();
```

---

### `getScreenHeight(): number`
Returns the total screen height in pixels.

**Example:**
```typescript
const screenHeight = getScreenHeight();
```

---

### `getWindowWidth(): number`
Returns the current window's inner width in pixels.

**Example:**
```typescript
const windowWidth = getWindowWidth();
```

---

### `getWindowHeight(): number`
Returns the current window's inner height in pixels.

**Example:**
```typescript
const windowHeight = getWindowHeight();
```

---

## File & Directory Operations

### `async loadFile(path: string): Promise<string>`
Loads a file from the user's file system and returns a blob URL.

**Parameters:**
- `path` (string) - File path

**Returns:**
- `Promise<string>` - Blob URL for the file

**Example:**
```typescript
const url = await loadFile('/home/user/documents/file.txt');
```

---

### `async selectFile(formats: string[]): Promise<string | null>`
Opens a file picker dialog for the user to select a file.

**Parameters:**
- `formats` (string[]) - Allowed file formats (e.g., ['.txt', '.pdf'])

**Returns:**
- `Promise<string | null>` - Blob URL of selected file, or null if cancelled

**Example:**
```typescript
const fileUrl = await selectFile(['.jpg', '.png', '.gif']);
if (fileUrl) {
  console.log('User selected file:', fileUrl);
}
```

---

### `async loadInternalFile(path: string): Promise<string>`
Loads a file from htmlOS NEXT's internal storage and returns a blob URL.

**Parameters:**
- `path` (string) - Path to internal file

**Returns:**
- `Promise<string>` - Blob URL for the file

**Example:**
```typescript
const url = await loadInternalFile('wallpapers/default.jpg');
```

---

### `async loadInternalFileAsText(path: string): Promise<string | undefined>`
Loads a file from internal storage and returns its content as text.

**Parameters:**
- `path` (string) - Path to internal file

**Returns:**
- `Promise<string | undefined>` - File content as text, or undefined if error

**Example:**
```typescript
const content = await loadInternalFileAsText('config.json');
```

---

### `async saveInternalFile(path: string, content: any): Promise<boolean>`
Saves content to htmlOS NEXT's internal storage.

**Parameters:**
- `path` (string) - Path where to save the file
- `content` (any) - Content to save (string, object, etc.)

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const success = await saveInternalFile('notes/mynote.txt', 'This is my note');
```

---

### `async deleteInternalFile(path: string): Promise<boolean>`
Deletes a file from internal storage.

**Parameters:**
- `path` (string) - Path to file to delete

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const deleted = await deleteInternalFile('temp/oldfile.txt');
```

---

### `async moveInternalFile(oldPath: string, newPath: string): Promise<boolean>`
Moves or renames a file in internal storage.

**Parameters:**
- `oldPath` (string) - Current file path
- `newPath` (string) - New file path

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const moved = await moveInternalFile('notes/old.txt', 'notes/new.txt');
```

---

### `async listInternalDirectory(path: string): Promise<any[]>`
Lists the contents of a directory in internal storage.

**Parameters:**
- `path` (string) - Directory path

**Returns:**
- `Promise<any[]>` - Array of directory contents (files and folders)

**Example:**
```typescript
const contents = await listInternalDirectory('documents/');
```

---

### `async listFiles(path: string): Promise<any[]>`
Lists files in a user-accessible directory.

**Parameters:**
- `path` (string) - Directory path

**Returns:**
- `Promise<any[]>` - Array of directory contents

**Example:**
```typescript
const files = await listFiles('/home/user/downloads/');
```

---

### `async deleteFile(path: string): Promise<boolean>`
Deletes a user file from the file system.

**Parameters:**
- `path` (string) - File path

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const deleted = await deleteFile('/home/user/temp.txt');
```

---

### `async createFolder(path: string): Promise<boolean>`
Creates a new directory.

**Parameters:**
- `path` (string) - Directory path to create

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const created = await createFolder('/home/user/mynewfolder');
```

---

### `async moveFile(oldPath: string, newPath: string): Promise<boolean>`
Moves or renames a file.

**Parameters:**
- `oldPath` (string) - Current file path
- `newPath` (string) - New file path

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const moved = await moveFile('/home/user/old.txt', '/home/user/Documents/new.txt');
```

---

### `async copyFile(oldPath: string, newPath: string): Promise<boolean>`
Copies a file to a new location.

**Parameters:**
- `oldPath` (string) - Source file path
- `newPath` (string) - Destination file path

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const copied = await copyFile('/home/user/original.txt', '/home/user/backup.txt');
```

---

### `async saveFile(path: string, content: string, encoding?: 'utf8' | 'base64'): Promise<boolean>`
Saves content to a user-accessible file.

**Parameters:**
- `path` (string) - File path
- `content` (string) - File content
- `encoding` (optional) - 'utf8' (default) or 'base64'

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const saved = await saveFile('/home/user/notes.txt', 'My notes here', 'utf8');
```

---

### `async getDownloadUrl(path: string): Promise<string>`
Gets a downloadable URL for a file.

**Parameters:**
- `path` (string) - File path

**Returns:**
- `Promise<string>` - Download URL

**Example:**
```typescript
const downloadUrl = await getDownloadUrl('/home/user/document.pdf');
```

---

### `async downloadFolder(path: string): Promise<string>`
Gets a downloadable URL for an entire folder (usually as a ZIP).

**Parameters:**
- `path` (string) - Folder path

**Returns:**
- `Promise<string>` - Download URL for the folder archive

**Example:**
```typescript
const folderUrl = await downloadFolder('/home/user/Documents/');
```

---

### `async uploadFile(path: string, file: File, onProgress?: (percent: number) => void): Promise<boolean>`
Uploads a file to a specified location.

**Parameters:**
- `path` (string) - Destination path
- `file` (File) - The File object to upload
- `onProgress?` (callback) - Progress callback (0-100)

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
if (fileInput.files) {
  const uploaded = await uploadFile(
    '/home/user/uploads/',
    fileInput.files[0],
    (percent) => console.log(`Upload: ${percent}%`)
  );
}
```

---

## System & App Management

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

---

### `refreshAppList(): void`
Refreshes the list of installed apps in the system.

**Example:**
```typescript
refreshAppList();
```

---

### `async getInstalledApps(): Promise<any[]>`
Retrieves list of installed apps via postMessage.

**Returns:**
- `Promise<any[]>` - Array of installed app objects

**Example:**
```typescript
const apps = await getInstalledApps();
```

---

### `async getInstalledAppsList(): Promise<any[]>`
Retrieves list of installed apps via HTTP backend call.

**Returns:**
- `Promise<any[]>` - Array of installed app objects

**Example:**
```typescript
const apps = await getInstalledAppsList();
```

---

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

---

### `async getSettings(): Promise<any>`
Retrieves all system settings.

**Returns:**
- `Promise<any>` - Object containing all settings

**Example:**
```typescript
const settings = await getSettings();
console.log(settings.colorScheme);
```

---

## HTTP Backend Calls

These functions make direct HTTP calls to the htmlOS NEXT backend.

### `async getFileTypes(): Promise<any>`
Retrieves available file type associations.

**Returns:**
- `Promise<any>` - File types and their associations

**Example:**
```typescript
const fileTypes = await getFileTypes();
```

---

### `async setDefaultApp(filetype: string, appId: string): Promise<any>`
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

### `async getCurrentUser(): Promise<any>`
Retrieves information about the currently logged-in user.

**Returns:**
- `Promise<any>` - User object containing username, etc.

**Example:**
```typescript
const user = await getCurrentUser();
console.log(`Logged in as: ${user.username}`);
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

---

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

---

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

---

## Continuity

Continuity allows passing data between apps or from the system to an app.

### `startContinuity(data: object): void`
Initiates a continuity action, passing data to another app or the system.

**Parameters:**
- `data` (object) - Data object to pass to continuity

**Example:**
```typescript
startContinuity({
  action: 'open-file',
  path: '/home/user/document.txt'
});
```

---

### `dismissContinuity(): void`
Dismisses/closes the current continuity session.

**Example:**
```typescript
dismissContinuity();
```

---

### `getContinuityData<T>(): T | null`
Retrieves continuity data passed to the current app.

**Generic Type:**
- `T` - The expected shape of the continuity data

**Returns:**
- `T | null` - Parsed continuity data, or null if none

**Example:**
```typescript
interface ContinuityData {
  action: string;
  path: string;
}

const data = getContinuityData<ContinuityData>();
if (data) {
  console.log(`Received continuity action: ${data.action}`);
}
```

---

### `onContinuityConsumed(callback: (appId: string | null) => void): () => void`
Registers a callback to be called when continuity data is consumed by another app.

**Parameters:**
- `callback` - Function called with the consuming app's ID (or null)

**Returns:**
- `() => void` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = onContinuityConsumed((appId) => {
  console.log(`Continuity consumed by app: ${appId}`);
});

// Later, to unsubscribe:
unsubscribe();
```

---

## Notes

- All async functions return Promises and should be used with `await` or `.then()` syntax
- File paths in internal storage should not include leading slashes (e.g., 'notes/file.txt', not '/notes/file.txt')
- User file paths should include full paths (e.g., '/home/username/documents/file.txt')
- Some functions like `changeSetting` may be restricted for security when called from app iframes; use SettingsContext for system components instead
- All HTTP calls include credentials for authentication

---

## Security & Permissions

- Apps running in iframes have limited access to system functions for security
- File access is restricted to paths the user has access to
- Settings changes may require special permissions or only work from system components
- Window manipulation is restricted to the app's own window
