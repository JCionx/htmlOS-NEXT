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
    })
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
        type: "quit"
    };

    window.parent.postMessage(message, "*");
}

function toggleMaximize() {
    const message = {
        type: "toggleMaximize"
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

// Opens a file picker dialog and returns a URL to the selected file; Doesn't require diskAccess permission
function selectFile(formats) {
  return new Promise((resolve) => {
    const message = { type: "selectFile", formats };

    function handler(event) {
      const data = event.data;
      if (data?.type === "file" && data.url) {
        if (data.url === "cancel") {
            resolve(null);
            return;
        }
        window.removeEventListener("message", handler);
        resolve(data.url);
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

function saveInternalFile(path, dataBuffer){
  return new Promise((resolve) => {
    const message = { type: "saveInternalFile", path: path, content: dataBuffer };

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
function moveInternalFile(oldPath, newPath){
  return new Promise((resolve) => {
    const message = { type: "moveInternalFile", oldPath: oldPath, newPath: newPath };

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
function deleteInternalFile(path){
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