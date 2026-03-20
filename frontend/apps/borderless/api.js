// Built-in API functions

function changeParentWindowTitle(newTitle) {
    const message = {
        type: "setTitle",
        title: newTitle,
    };

    window.parent.postMessage(message, "*");
}

function setPosition(position_x, position_y) {
    const message = {
        type: "setPosition",
        position_x: position_x,
        position_y: position_y,
    };

    window.parent.postMessage(message, "*");
}

function setXPosition(position) {
    const message = {
        type: "setXPosition",
        position: position,
    };

    window.parent.postMessage(message, "*");
}

function setYPosition(position) {
    const message = {
        type: "setYPosition",
        position: position,
    };

    window.parent.postMessage(message, "*");
}

function setWidth(width) {
    const message = {
        type: "setWidth",
        width: width,
    };

    window.parent.postMessage(message, "*");
}

function setHeight(height) {
    const message = {
        type: "setHeight",
        height: height,
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