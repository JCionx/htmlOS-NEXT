# API Reference

This document provides comprehensive documentation for all API calls available in the `@htmlos-next/api` package. These functions allow apps running in **htmlOS NEXT** to interact with the system, manage windows, files, and settings.

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
import { setPosition } from '@htmlos-next/api';
setPosition(100, 200, true);
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `setXPosition(position: number, animate?: boolean): void`
Sets only the X position of the window.

**Parameters:**
- `position` (number) - X coordinate (in pixels)
- `animate` (boolean, optional) - Whether to animate the movement (default: true)

**Example:**
```typescript
import { setXPosition } from '@htmlos-next/api';
setXPosition(150);
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `setYPosition(position: number, animate?: boolean): void`
Sets only the Y position of the window.

**Parameters:**
- `position` (number) - Y coordinate (in pixels)
- `animate` (boolean, optional) - Whether to animate the movement (default: true)

**Example:**
```typescript
import { setYPosition } from '@htmlos-next/api';
setYPosition(300);
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `setWidth(width: number, animate?: boolean): void`
Sets the width of the window.

**Parameters:**
- `width` (number) - Width in pixels
- `animate` (boolean, optional) - Whether to animate the resize (default: true)

**Example:**
```typescript
import { setWidth } from '@htmlos-next/api';
setWidth(800);
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `setHeight(height: number, animate?: boolean): void`
Sets the height of the window.

**Parameters:**
- `height` (number) - Height in pixels
- `animate` (boolean, optional) - Whether to animate the resize (default: true)

**Example:**
```typescript
import { setHeight } from '@htmlos-next/api';
setHeight(600);
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `setSize(width: number, height: number, animate?: boolean): void`
Sets both width and height of the window.

**Parameters:**
- `width` (number) - Width in pixels
- `height` (number) - Height in pixels
- `animate` (boolean, optional) - Whether to animate the resize (default: true)

**Example:**
```typescript
import { setSize } from '@htmlos-next/api';
setSize(1024, 768, true);
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `async getPosition(): Promise<Position>`
Retrieves the current position of the window.

**Returns:**
- `Promise<Position>` - Object containing `x` and `y` coordinates

**Example:**
```typescript
import { getPosition } from '@htmlos-next/api';
const position = await getPosition();
console.log(`Window at: ${position.x}, ${position.y}`);
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `spawnWindow(config: SpawnWindowConfig): void`
Opens a new window/app within htmlOS NEXT.

**Parameters:**
-  `config` (SpawnWindowConfig) - Configuration object with the following properties:
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
import { spawnWindow } from '@htmlos-next/api';
spawnWindow({
  id: 'my-app-instance-1',
  title: 'My New Window',
  url: 'https://example.com/app',
  defaultWidth: 800,
  defaultHeight: 600,
  icon: 'path/to/icon.png'
});
```

> [!INFO]
> This API requires the app to have the `windowSpawning` permission.

---

### `quit(): void`
Closes the current app window.

**Example:**
```typescript
import { quit } from '@htmlos-next/api';
quit();
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

### `toggleMaximize(): void`
Toggles the maximized state of the window.

**Example:**
```typescript
import { toggleMaximize } from '@htmlos-next/api';
toggleMaximize();
```

> [!INFO]
> This API requires the app to have the `positionManipulation` permission.

---

## Screen & Window Getters

### `getScreenWidth(): number`
Returns the total screen width in pixels.

**Example:**
```typescript
import { getScreenWidth } from '@htmlos-next/api';
const screenWidth = getScreenWidth();
```

---

### `getScreenHeight(): number`
Returns the total screen height in pixels.

**Example:**
```typescript
import { getScreenHeight } from '@htmlos-next/api';
const screenHeight = getScreenHeight();
```

---

### `getWindowWidth(): number`
Returns the current window's inner width in pixels.

**Example:**
```typescript
import { getWindowWidth } from '@htmlos-next/api';
const windowWidth = getWindowWidth();
```

---

### `getWindowHeight(): number`
Returns the current window's inner height in pixels.

**Example:**
```typescript
import { getWindowHeight } from '@htmlos-next/api';
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
import { loadFile } from '@htmlos-next/api';
const url = await loadFile('Downloads/file.txt');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

---

### `async selectFile(formats: string[]): Promise<string | null>`
Opens a file picker dialog for the user to select a file.

**Parameters:**
- `formats` (string[]) - Allowed file formats (e.g., ['.txt', '.pdf'])

**Returns:**
- `Promise<string | null>` - Blob URL of selected file, or null if cancelled

**Example:**
```typescript
import { selectFile } from '@htmlos-next/api';
const fileUrl = await selectFile(['.jpg', '.png', '.gif']);
if (fileUrl) {
  console.log('User selected file:', fileUrl);
}
```

---

### `async loadInternalFile(path: string): Promise<string>`
Loads a file from the app's internal storage and returns a blob URL.

**Parameters:**
- `path` (string) - Path to internal file

**Returns:**
- `Promise<string>` - Blob URL for the file

**Example:**
```typescript
import { loadInternalFile } from '@htmlos-next/api';
const url = await loadInternalFile('wallpapers/default.jpg');
```

---

### `async loadInternalFileAsText(path: string): Promise<string | undefined>`
Loads a file from the app's internal storage and returns its content as text.

**Parameters:**
- `path` (string) - Path to internal file

**Returns:**
- `Promise<string | undefined>` - File content as text, or undefined if error

**Example:**
```typescript
import { loadInternalFileAsText } from '@htmlos-next/api';
const content = await loadInternalFileAsText('config.json');
```

---

### `async saveInternalFile(path: string, content: any): Promise<boolean>`
Saves content to the app's internal storage.

**Parameters:**
- `path` (string) - Path where to save the file
- `content` (any) - Content to save (string, object, etc.)

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
import { saveInternalFile } from '@htmlos-next/api';
const success = await saveInternalFile('notes/mynote.txt', 'This is my note');
```

---

### `async deleteInternalFile(path: string): Promise<boolean>`
Deletes a file from the app's internal storage.

**Parameters:**
- `path` (string) - Path to file to delete

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
import { deleteInternalFile } from '@htmlos-next/api';
const deleted = await deleteInternalFile('temp/oldfile.txt');
```

---

### `async moveInternalFile(oldPath: string, newPath: string): Promise<boolean>`
Moves or renames a file in the app's internal storage.

**Parameters:**
- `oldPath` (string) - Current file path
- `newPath` (string) - New file path

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
import { moveInternalFile } from '@htmlos-next/api';
const moved = await moveInternalFile('notes/old.txt', 'notes/new.txt');
```

---

### `async listInternalDirectory(path: string): Promise<any[]>`
Lists the contents of a directory in the app's internal folder.

**Parameters:**
- `path` (string) - Directory path

**Returns:**
- `Promise<any[]>` - Array of directory contents (files and folders)

**Example:**
```typescript
import { listInternalDirectory } from '@htmlos-next/api';
const contents = await listInternalDirectory('Documents/');
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
import { listFiles } from '@htmlos-next/api';
const files = await listFiles('Documents/notes');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

---

### `async deleteFile(path: string): Promise<boolean>`
Deletes a user file from the file system.

**Parameters:**
- `path` (string) - File path

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
import { deleteFile } from '@htmlos-next/api';
const deleted = await deleteFile('Downloads/temp.txt');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

---

### `async createFolder(path: string): Promise<boolean>`
Creates a new directory.

**Parameters:**
- `path` (string) - Directory path to create

**Returns:**
- `Promise<boolean>` - True if successful

**Example:**
```typescript
import { createFolder } from '@htmlos-next/api';
const created = await createFolder('Documents/notes');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

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
import { moveFile } from '@htmlos-next/api';
const moved = await moveFile('Documents/old.txt', 'Documents/new.txt');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

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
import { copyFile } from '@htmlos-next/api';
const copied = await copyFile('Documents/original.txt', 'Documents/backup.txt');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

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
import { saveFile } from '@htmlos-next/api';
const saved = await saveFile('Documents/notes.txt', 'My notes here', 'utf8');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

---

### `async getDownloadUrl(path: string): Promise<string>`
Gets a downloadable URL for a file.

**Parameters:**
- `path` (string) - File path

**Returns:**
- `Promise<string>` - Download URL

**Example:**
```typescript
import { getDownloadUrl } from '@htmlos-next/api';
const downloadUrl = await getDownloadUrl('/home/user/document.pdf');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

---

### `async downloadFolder(path: string): Promise<string>`
Gets a downloadable URL for an entire folder (usually as a ZIP).

**Parameters:**
- `path` (string) - Folder path

**Returns:**
- `Promise<string>` - Download URL for the folder archive

**Example:**
```typescript
import { downloadFolder } from '@htmlos-next/api';
const folderUrl = await downloadFolder('/home/user/Documents/');
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

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
import { uploadFile } from '@htmlos-next/api';
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
if (fileInput.files) {
  const uploaded = await uploadFile(
    '/home/user/uploads/',
    fileInput.files[0],
    (percent) => console.log(`Upload: ${percent}%`)
  );
}
```

> [!INFO]
> This API requires the app to have the `diskAccess` permission.

---

## HTTP Backend Calls

### `async getCurrentUser(): Promise<any>`
Retrieves information about the currently logged-in user.

**Returns:**
- `Promise<any>` - User object containing username, etc.

**Example:**
```typescript
import { getCurrentUser } from '@htmlos-next/api';
const user = await getCurrentUser();
console.log(`Logged in as: ${user.username}`);
```

---

## Continuity

Continuity allows passing state between two devices.

### `startContinuity(data: object): void`
Initiates a continuity action, passing data to another app or the system.

**Parameters:**
- `data` (object) - Data object to pass to continuity

**Example:**
```typescript
import { startContinuity } from '@htmlos-next/api';
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
import { dismissContinuity } from '@htmlos-next/api';
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
import { getContinuityData } from '@htmlos-next/api';
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
import { onContinuityConsumed } from '@htmlos-next/api';
const unsubscribe = onContinuityConsumed((appId) => {
  console.log(`Continuity consumed by app: ${appId}`);
});

// Later, to unsubscribe:
unsubscribe();
```

## Notes

- All async functions return Promises and should be used with `await` or `.then()` syntax
- File paths in internal storage should not include leading slashes (e.g., 'notes/file.txt', not '/notes/file.txt')
- User file paths should include full paths (e.g., '/home/username/documents/file.txt')
