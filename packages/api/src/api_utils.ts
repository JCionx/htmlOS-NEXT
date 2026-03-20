/**
 * Utility to send formatted messages to the parent OS window.
 * @param type The action/type identifier for the parent window to process.
 * @param payload The rest of the data required for the action.
 */
export function sendMessage(
  type: string,
  payload: Record<string, any> = {},
): void {
  const message = {
    type,
    ...payload,
  };
  window.parent.postMessage(message, "*");
}

/**
 * Utility to wait for a specific one-time response from the parent OS window.
 * @param expectedType The `type` string to listen for in the return message.
 * @returns A Promise containing the full data payload from the parent.
 */
export function listenForOnce(expectedType: string): Promise<any> {
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      const data = event.data;

      // Check if it's a valid object and matches the type we are waiting for
      if (data && typeof data === "object" && data.type === expectedType) {
        window.removeEventListener("message", handler);
        resolve(data);
      }
    };

    window.addEventListener("message", handler);
  });
}
