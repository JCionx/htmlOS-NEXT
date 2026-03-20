export function changeParentWindowTitle(newTitle: string) {
  const message = {
    type: "setTitle",
    title: newTitle,
  };
  (window.parent as Window).postMessage(message, "*");
}

export function setPosition(
  position_x: number,
  position_y: number,
  animate: boolean = true,
) {
  const message = {
    type: "setPosition",
    position_x,
    position_y,
    animate,
  };
  (window.parent as Window).postMessage(message, "*");
}

export function setXPosition(position: number, animate: boolean = true) {
  const message = {
    type: "setXPosition",
    position,
    animate,
  };
  (window.parent as Window).postMessage(message, "*");
}

export function setYPosition(position: number, animate: boolean = true) {
  const message = {
    type: "setYPosition",
    position,
    animate,
  };
  (window.parent as Window).postMessage(message, "*");
}

export function setWidth(width: number, animate: boolean = true) {
  const message = {
    type: "setWidth",
    width,
    animate,
  };
  (window.parent as Window).postMessage(message, "*");
}

export function setHeight(height: number, animate: boolean = true) {
  const message = {
    type: "setHeight",
    height,
    animate,
  };
  (window.parent as Window).postMessage(message, "*");
}

export function setSize(
  width: number,
  height: number,
  animate: boolean = true,
) {
  const message = {
    type: "setSize",
    width,
    height,
    animate,
  };
  (window.parent as Window).postMessage(message, "*");
}

export function getPosition(): Promise<{ x: number; y: number }> {
  return new Promise((resolve) => {
    const message = { type: "getPosition" };

    function handler(event: MessageEvent) {
      const data = (event as any).data;
      if (
        data &&
        typeof data === "object" &&
        data.type === "position" &&
        data.position
      ) {
        window.removeEventListener("message", handler as any);
        resolve(data.position);
      }
    }

    window.addEventListener("message", handler as any);
    (window.parent as Window).postMessage(message, "*");
  });
}

export function spawnWindow(
  id: string,
  title: string,
  url: string,
  icon: string | null,
  defaultX: number,
  defaultY: number,
  borderless: boolean,
  defaultWidth: number,
  defaultHeight: number,
  minWidth: number | null,
  minHeight: number | null,
  maxWidth: number | null,
  maxHeight: number | null,
  allowResize: boolean,
  allowMaximize: boolean,
) {
  const message = {
    type: "spawnWindow",
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
  };
  (window.parent as Window).postMessage(message, "*");
}

export function toggleMaximize() {
  const message = { type: "toggleMaximize" };
  (window.parent as Window).postMessage(message, "*");
}

export function quit() {
  const message = { type: "quit" };
  (window.parent as Window).postMessage(message, "*");
}

export function getScreenWidth(): number {
  return window.outerWidth;
}

export function getScreenHeight(): number {
  return window.outerHeight;
}

export function selectFile(formats: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    const message = { type: "selectFile", formats };

    function handler(event: MessageEvent) {
      const data = (event as any).data;
      if (data?.type === "file" && data.url) {
        if (data.url === "cancel") {
          resolve(null);
          return;
        }
        window.removeEventListener("message", handler as any);
        resolve(data.url);
      }
    }

    window.addEventListener("message", handler as any);
    (window.parent as Window).postMessage(message, "*");
  });
}
