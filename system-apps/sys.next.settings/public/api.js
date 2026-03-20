// Built-in API functions

function changeParentWindowTitle(newTitle) {
  const message = {
    type: "setTitle",
    title: newTitle,
  };

  window.parent.postMessage(message, "*");
}

function setPosition(position_x, position_y, animate = true) {
  const message = {
    type: "setPosition",
    position_x: position_x,
    position_y: position_y,
    animate: animate,
  };

  window.parent.postMessage(message, "*");
}

function setXPosition(position, animate = true) {
  const message = {
    type: "setXPosition",
    position: position,
    animate: animate,
  };

  window.parent.postMessage(message, "*");
}

function setYPosition(position, animate = true) {
  const message = {
    type: "setYPosition",
    position: position,
    animate: animate,
  };

  window.parent.postMessage(message, "*");
}

function setWidth(width, animate = true) {
  const message = {
    type: "setWidth",
    width: width,
    animate: animate,
  };

  window.parent.postMessage(message, "*");
}

function setHeight(height, animate = true) {
  const message = {
    type: "setHeight",
    height: height,
    animate: animate,
  };

  window.parent.postMessage(message, "*");
}

function setSize(width, height, animate = true) {
  const message = {
    type: "setSize",
    width: width,
    height: height,
    animate: animate,
  };

  window.parent.postMessage(message, "*");
}

function getPosition() {
  position = null;

  return new Promise((resolve) => {
    const message = {
      type: "getPosition",
    };

    function handler(event) {
      const data = event.data;
      if (data && typeof data === "object" && data.type === "position") {
        window.removeEventListener("message", handler);
        resolve(data.position);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

function spawnWindow(
  id,
  title,
  url,
  icon,
  defaultX,
  defaultY,
  borderless,
  defaultWidth,
  defaultHeight,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  allowResize,
  allowMaximize,
) {
  const message = {
    type: "spawnWindow",
    id: id,
    title: title,
    url: url,
    icon: icon,
    defaultX: defaultX,
    defaultY: defaultY,
    borderless: borderless,
    defaultWidth: defaultWidth,
    defaultHeight: defaultHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    maxWidth: maxWidth,
    maxHeight: maxHeight,
    allowResize: allowResize,
    allowMaximize: allowMaximize,
  };

  window.parent.postMessage(message, "*");
}

function quit() {
  const message = {
    type: "quit",
  };

  window.parent.postMessage(message, "*");
}

function toggleMaximize() {
  const message = {
    type: "toggleMaximize",
  };

  window.parent.postMessage(message, "*");
}

function getScreenWidth() {
  return window.outerWidth;
}

function getScreenHeight() {
  return window.outerHeight;
}

function getWindowWidth() {
  return window.innerWidth;
}

function getWindowHeight() {
  return window.innerHeight;
}

// Returns a URL to the file; Requires diskAccess permission
function loadFile(path) {
  return new Promise((resolve) => {
    const message = { type: "loadFile", path };

    function handler(event) {
      const data = event.data;
      if (data?.type === "file" && data.url) {
        window.removeEventListener("message", handler);

        resolve(data.url);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

// Returns the files and directories inside a directory; Requires diskAccess permission
function listInternalDirectory(path) {
  return new Promise((resolve) => {
    const message = { type: "listDirectory", path: path };

    function handler(event) {
      const data = event.data;
      if (data?.type === "directoryListing" && data.contents) {
        window.removeEventListener("message", handler);

        resolve(data.contents);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

// Opens a file picker dialog and returns the selected file as a File object
function selectFile(formats) {
  return new Promise((resolve) => {
    console.log("[selectFile] Opening file picker for formats:", formats);
    const message = { type: "selectFile", formats };

    function handler(event) {
      const data = event.data;
      console.log("[selectFile] Received message:", data);
      if (data?.type === "file" && data.url) {
        if (data.url === "cancel") {
          window.removeEventListener("message", handler);
          console.log("[selectFile] File selection canceled");
          resolve(null);
          return;
        }
        // Fetch the file from the temp URL and convert to File object
        (async () => {
          try {
            console.log("[selectFile] Fetching file from temp URL:", data.url);
            const response = await fetch(data.url);
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob();
            const filename = data.url.split("/").pop() || "file";
            const file = new File([blob], filename, { type: blob.type });
            console.log(
              "[selectFile] Created File object:",
              filename,
              "Type:",
              blob.type,
              "Size:",
              blob.size,
            );
            window.removeEventListener("message", handler);
            resolve(file);
          } catch (err) {
            console.error("[selectFile] Error:", err);
            window.removeEventListener("message", handler);
            resolve(null);
          }
        })();
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

// Returns a URL to the internal file
function loadInternalFile(path) {
  return new Promise((resolve) => {
    const message = { type: "loadInternalFile", path };

    function handler(event) {
      const data = event.data;
      if (data?.type === "file" && data.url) {
        window.removeEventListener("message", handler);

        resolve(data.url);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

async function loadInternalFileAsText(path) {
  const url = await loadInternalFile(path);
  if (url) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.text();
      } else {
        console.error("Failed to fetch internal file:", response.statusText);
      }
    } catch (err) {
      console.error("Error fetching internal file:", err);
    }
  }
}

function saveInternalFile(path, dataBuffer) {
  return new Promise((resolve) => {
    const message = {
      type: "saveInternalFile",
      path: path,
      content: dataBuffer,
    };

    function handler(event) {
      const data = event.data;
      if (data?.type === "saveSuccess" && data.path === path) {
        window.removeEventListener("message", handler);
        resolve(true);
      }
      if (data?.type === "saveError" && data.path === path) {
        window.removeEventListener("message", handler);
        reject(data.error);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

// Moves an internal file
function moveInternalFile(oldPath, newPath) {
  return new Promise((resolve) => {
    const message = {
      type: "moveInternalFile",
      oldPath: oldPath,
      newPath: newPath,
    };

    function handler(event) {
      const data = event.data;
      if (data?.type === "moveSuccess" && data.oldPath === oldPath) {
        window.removeEventListener("message", handler);
        resolve(true);
      }
      if (data?.type === "moveError" && data.oldPath === oldPath) {
        window.removeEventListener("message", handler);
        reject(data.error);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

// Deletes an internal file
function deleteInternalFile(path) {
  return new Promise((resolve) => {
    const message = { type: "deleteInternalFile", path: path };

    function handler(event) {
      const data = event.data;
      if (data?.type === "deleteSuccess" && data.path === path) {
        window.removeEventListener("message", handler);
        resolve(true);
      }
      if (data?.type === "deleteError" && data.path === path) {
        window.removeEventListener("message", handler);
        reject(data.error);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

// Returns the files and directories inside an internal directory
function listInternalDirectory(path) {
  return new Promise((resolve) => {
    const message = { type: "listInternalDirectory", path: path };

    function handler(event) {
      const data = event.data;
      if (data?.type === "directoryListing" && data.contents) {
        window.removeEventListener("message", handler);

        resolve(data.contents);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

window.addEventListener("message", (event) => {
  const data = event.data;
  if (data && typeof data === "object") {
    switch (data.type) {
      case "position":
        position = data.position;
        break;
    }
  }
});

function changeSetting(setting, value) {
  const message = {
    type: "changeSetting",
    setting: setting,
    value: value,
  };

  window.parent.postMessage(message, "*");
}

function getSettings() {
  return new Promise((resolve) => {
    const message = {
      type: "getSettings",
    };

    function handler(event) {
      const data = event.data;
      if (data && typeof data === "object" && data.type === "settings") {
        window.removeEventListener("message", handler);
        resolve(data.settings);
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

function getInstalledApps() {
  return new Promise((resolve, reject) => {
    const message = {
      type: "getInstalledApps",
    };

    function handler(event) {
      const data = event.data;
      if (data && typeof data === "object") {
        if (data.type === "installedApps") {
          window.removeEventListener("message", handler);
          resolve(data.apps);
        } else if (data.type === "installedAppsError") {
          window.removeEventListener("message", handler);
          reject(new Error(data.error));
        }
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

function uninstallApp(appId) {
  return new Promise((resolve, reject) => {
    const message = {
      type: "uninstallApp",
      appId: appId,
    };

    function handler(event) {
      const data = event.data;
      if (data && typeof data === "object") {
        if (data.type === "uninstallSuccess" && data.appId === appId) {
          window.removeEventListener("message", handler);
          resolve();
        } else if (data.type === "uninstallError" && data.appId === appId) {
          window.removeEventListener("message", handler);
          reject(new Error(data.error));
        }
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

async function getFileTypes() {
  const backendAddress =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : window.location.origin;

  const response = await fetch(`${backendAddress}/apps/filetypes`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch filetypes");
  }

  return response.json();
}

async function setDefaultApp(filetype, appId) {
  const backendAddress =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : window.location.origin;

  const response = await fetch(`${backendAddress}/apps/filetypes/set-default`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filetype, appId }),
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to set default app");
  }

  return response.json();
}

async function getInstalledAppsList() {
  const backendAddress =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : window.location.origin;

  const response = await fetch(`${backendAddress}/apps/list`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch apps list");
  }

  return response.json();
}

async function getCurrentUser() {
  const backendAddress =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : window.location.origin;

  const response = await fetch(`${backendAddress}/auth/user`, {
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to fetch user");
  }

  return response.json();
}

async function changeUsername(newUsername) {
  const backendAddress =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : window.location.origin;

  const response = await fetch(`${backendAddress}/auth/change-username`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newUsername }),
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to change username");
  }

  return response.json();
}

async function changePassword(currentPassword, newPassword) {
  const backendAddress =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : window.location.origin;

  const response = await fetch(`${backendAddress}/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to change password");
  }

  return response.json();
}

async function uploadWallpaper(file) {
  if (!file) {
    throw new Error("No file provided");
  }

  console.log("[uploadWallpaper] Starting upload for:", file.name);

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Convert ArrayBuffer to base64
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64Content = btoa(binary);

  // Create filename with timestamp to avoid conflicts
  const filename = `${Date.now()}_${file.name}`;
  console.log("[uploadWallpaper] Generated filename:", filename);

  // Save to internal directory with base64 encoding
  return await new Promise((resolve, reject) => {
    const message = {
      type: "saveInternalFile",
      path: `wallpapers/${filename}`,
      content: base64Content,
      encoding: "base64",
    };

    console.log("[uploadWallpaper] Posting saveInternalFile message");

    function handler(event) {
      const data = event.data;
      console.log("[uploadWallpaper] Received message:", data);
      if (
        data?.type === "saveSuccess" &&
        data.path === `wallpapers/${filename}`
      ) {
        window.removeEventListener("message", handler);
        console.log("[uploadWallpaper] Save successful");
        resolve({
          success: true,
          wallpaper: filename,
        });
      }
      if (
        data?.type === "saveError" &&
        data.path === `wallpapers/${filename}`
      ) {
        window.removeEventListener("message", handler);
        console.log("[uploadWallpaper] Save error:", data.error);
        reject(new Error(data.error));
      }
    }

    window.addEventListener("message", handler);
    window.parent.postMessage(message, "*");
  });
}

async function deleteWallpaper(filename) {
  if (!filename) {
    throw new Error("No filename provided");
  }

  console.log("[deleteWallpaper] Deleting wallpaper:", filename);

  try {
    await deleteInternalFile(`wallpapers/${filename}`);
    console.log("[deleteWallpaper] Wallpaper deleted successfully");
    return { success: true };
  } catch (err) {
    console.error("[deleteWallpaper] Error:", err);
    throw err;
  }
}

// Expose API functions to window object
window.changeParentWindowTitle = changeParentWindowTitle;
window.setPosition = setPosition;
window.setXPosition = setXPosition;
window.setYPosition = setYPosition;
window.setWidth = setWidth;
window.setHeight = setHeight;
window.setSize = setSize;
window.getPosition = getPosition;
window.spawnWindow = spawnWindow;
window.quit = quit;
window.toggleMaximize = toggleMaximize;
window.getScreenWidth = getScreenWidth;
window.getScreenHeight = getScreenHeight;
window.getWindowWidth = getWindowWidth;
window.getWindowHeight = getWindowHeight;
window.loadFile = loadFile;
window.listInternalDirectory = listInternalDirectory;
window.selectFile = selectFile;
window.loadInternalFile = loadInternalFile;
window.loadInternalFileAsText = loadInternalFileAsText;
window.saveInternalFile = saveInternalFile;
window.moveInternalFile = moveInternalFile;
window.deleteInternalFile = deleteInternalFile;
window.changeSetting = changeSetting;
window.getSettings = getSettings;
window.getInstalledApps = getInstalledApps;
window.uninstallApp = uninstallApp;
window.getFileTypes = getFileTypes;
window.setDefaultApp = setDefaultApp;
window.getInstalledAppsList = getInstalledAppsList;
window.getCurrentUser = getCurrentUser;
window.changeUsername = changeUsername;
window.changePassword = changePassword;
window.uploadWallpaper = uploadWallpaper;
window.deleteWallpaper = deleteWallpaper;
