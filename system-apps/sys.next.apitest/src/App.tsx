import { useState, useLayoutEffect, useEffect } from "react";
import * as api from "@htmlos-next/api";
import type { ActionDefinition, ActionArgument } from "./types";
import { Copy, Play, Terminal } from "lucide-react";

import {
  Sidebar,
  SidebarItem,
  SidebarTitle,
  AppShell,
  Toolbar,
  ToolbarActions,
  ToolbarButton,
  ToolbarTitle,
  ToolbarExpandSidebarButton,
  Icon,
  Content,
  EmptyView,
} from "@htmlos-next/ui";

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedActionId, setSelectedActionId] = useState<string | undefined>(
    undefined,
  );
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [result, setResult] = useState<string | null>(null);

  // Your actions array remains the same...
  const actions: ActionDefinition[] = [
    {
      id: "set-window-title",
      title: "Set window title",
      description: "Changes the title of the current window.",
      code: {
        string: "changeParentWindowTitle(newTitle = <a>)",
        functionName: "changeParentWindowTitle",
        arguments: [
          { id: "a", type: "text", default: "new title", label: "newTitle" },
        ],
      },
    },
    {
      id: "set-position",
      title: "Set position",
      description: "Changes the position of the current window.",
      warning:
        'This function requires the "positionManipulation" permission to work.',
      code: {
        string:
          "setPosition(position_x = <a>, position_y = <b>, animate = <c>)",
        functionName: "setPosition",
        arguments: [
          { id: "a", type: "number", default: 300, label: "position_x" },
          { id: "b", type: "number", default: 400, label: "position_y" },
          { id: "c", type: "bool", default: true, label: "animate" },
        ],
      },
    },
    {
      id: "set-x-position",
      title: "Set X position",
      description: "Changes the X position of the current window.",
      warning:
        'This function requires the "positionManipulation" permission to work.',
      code: {
        string: "setXPosition(position = <a>, animate = <b>)",
        functionName: "setXPosition",
        arguments: [
          { id: "a", type: "number", default: 300, label: "position" },
          { id: "b", type: "bool", default: true, label: "animate" },
        ],
      },
    },
    {
      id: "set-y-position",
      title: "Set Y position",
      description: "Changes Y position of the current window.",
      warning:
        'This function requires the "positionManipulation" permission to work.',
      code: {
        string: "setYPosition(position = <a>, animate = <b>)",
        functionName: "setYPosition",
        arguments: [
          { id: "a", type: "number", default: 400, label: "position" },
          { id: "b", type: "bool", default: true, label: "animate" },
        ],
      },
    },
    {
      id: "set-width",
      title: "Set width",
      description: "Changes window width.",
      warning:
        'This function requires the "positionManipulation" permission to work.',
      code: {
        string: "setWidth(width = <a>, animate = <b>)",
        functionName: "setWidth",
        arguments: [
          { id: "a", type: "number", default: 800, label: "width" },
          { id: "b", type: "bool", default: true, label: "animate" },
        ],
      },
    },
    {
      id: "set-height",
      title: "Set height",
      description: "Changes window height.",
      warning:
        'This function requires the "positionManipulation" permission to work.',
      code: {
        string: "setHeight(height = <a>, animate = <b>)",
        functionName: "setHeight",
        arguments: [
          { id: "a", type: "number", default: 600, label: "height" },
          { id: "b", type: "bool", default: true, label: "animate" },
        ],
      },
    },
    {
      id: "set-size",
      title: "Set size",
      description: "Changes window size.",
      warning:
        'This function requires the "positionManipulation" permission to work.',
      code: {
        string: "setSize(width = <a>, height = <b>, animate = <c>)",
        functionName: "setSize",
        arguments: [
          { id: "a", type: "number", default: 800, label: "width" },
          { id: "b", type: "number", default: 600, label: "height" },
          { id: "c", type: "bool", default: true, label: "animate" },
        ],
      },
    },
    {
      id: "get-position",
      title: "Get position",
      description: "Gets the current window position.",
      code: {
        string: "getPosition()",
        functionName: "getPosition",
        arguments: [],
      },
    },
    {
      id: "spawn-window",
      title: "Spawn window",
      description: "Spawns a new window.",
      code: {
        string:
          "spawnWindow(id = <a>, title = <b>, url = <c>, icon = <d>, defaultX = <e>, defaultY = <f>, borderless = <g>, defaultWidth = <h>, defaultHeight = <i>, minWidth = <j>, minHeight = <k>, maxWidth = <l>, maxHeight = <m>, allowResize = <n>, allowMaximize = <o>)",
        functionName: "spawnWindow",
        arguments: [
          { id: "a", type: "text", default: "example-window", label: "id" },
          { id: "b", type: "text", default: "Example Window", label: "title" },
          {
            id: "c",
            type: "text",
            default: "https://example.com",
            label: "url",
          },
          { id: "d", type: "text", default: "", label: "icon" },
          { id: "e", type: "number", default: 200, label: "defaultX" },
          { id: "f", type: "number", default: 200, label: "defaultY" },
          { id: "g", type: "bool", default: false, label: "borderless" },
          { id: "h", type: "number", default: 600, label: "defaultWidth" },
          { id: "i", type: "number", default: 400, label: "defaultHeight" },
          { id: "j", type: "number", default: 0, label: "minWidth" },
          { id: "k", type: "number", default: 0, label: "minHeight" },
          { id: "l", type: "number", default: 0, label: "maxWidth" },
          { id: "m", type: "number", default: 0, label: "maxHeight" },
          { id: "n", type: "bool", default: true, label: "allowResize" },
          { id: "o", type: "bool", default: true, label: "allowMaximize" },
        ],
      },
    },
  ];

  const currentAction = actions.find((a) => a.id === selectedActionId);

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const theme = urlParams.get("theme") === "dark" ? "dark" : "light";
    const deviceType =
      urlParams.get("mobile") === "true" ? "mobile" : "desktop";

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("device-type", deviceType);
    setIsMobile(deviceType === "mobile");
  }, []);

  // Sync form defaults when action changes
  useEffect(() => {
    if (currentAction) {
      const initialValues: Record<string, any> = {};
      currentAction.code.arguments.forEach((arg) => {
        initialValues[arg.id] = arg.default;
      });
      setFormValues(initialValues);
      setResult(null);
    }
  }, [selectedActionId]);

  const selectAction = (actionId: string) => {
    setSelectedActionId(actionId);
    if (isMobile) setSidebarOpen(false);
  };

  const handleInputChange = (argId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [argId]: value }));
  };

  const generateCodeString = () => {
    if (!currentAction) return "";
    let codeString = currentAction.code.string;
    currentAction.code.arguments.forEach((arg) => {
      const value = formValues[arg.id];
      const replacement = arg.type === "text" ? `"${value}"` : String(value);
      codeString = codeString.replace(`<${arg.id}>`, replacement);
    });
    return codeString + ";";
  };

  const handleRun = async () => {
    if (!currentAction) return;
    const args = currentAction.code.arguments.map((arg) => formValues[arg.id]);

    try {
      const apiFunction = (api as any)[currentAction.code.functionName];
      if (apiFunction) {
        const res = await apiFunction(...args);
        if (res !== undefined) setResult(JSON.stringify(res, null, 2));
      }
    } catch (error) {
      console.error("Error running action:", error);
    }
  };

  const renderInput = (arg: ActionArgument) => {
    const value = formValues[arg.id];
    if (arg.type === "text") {
      return (
        <span className="code-input-wrapper">
          "
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleInputChange(arg.id, e.target.value)}
          />
          "
        </span>
      );
    } else if (arg.type === "number") {
      return (
        <input
          type="number"
          value={value || 0}
          onChange={(e) =>
            handleInputChange(arg.id, parseInt(e.target.value) || 0)
          }
        />
      );
    }
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => handleInputChange(arg.id, e.target.checked)}
      />
    );
  };

  // Helper to render the live code preview with inline inputs
  const renderCodePreview = () => {
    if (!currentAction) return null;
    const codeString = currentAction.code.string;
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    currentAction.code.arguments.forEach((arg) => {
      const placeholder = `<${arg.id}>`;
      const placeholderIndex = codeString.indexOf(placeholder, currentIndex);
      if (placeholderIndex !== -1) {
        parts.push(codeString.substring(currentIndex, placeholderIndex));
        parts.push(renderInput(arg));
        currentIndex = placeholderIndex + placeholder.length;
      }
    });
    parts.push(codeString.substring(currentIndex));
    return parts;
  };

  return (
    <AppShell
      isMobile={isMobile}
      sidebarOpen={sidebarOpen}
      sidebar={
        <Sidebar open={sidebarOpen}>
          <SidebarTitle>API Actions</SidebarTitle>
          {actions.map((action) => (
            <SidebarItem
              key={action.id}
              selected={selectedActionId === action.id}
              onClick={() => selectAction(action.id)}
            >
              {action.title}
            </SidebarItem>
          ))}
        </Sidebar>
      }
    >
      <Toolbar expanded={!sidebarOpen}>
        <ToolbarExpandSidebarButton
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          expanded={!sidebarOpen}
        />
        {currentAction && (
          <ToolbarTitle>{currentAction.title || "API Explorer"}</ToolbarTitle>
        )}
        {!!selectedActionId && (
          <ToolbarActions>
            <ToolbarButton
              onClick={() =>
                navigator.clipboard.writeText(generateCodeString())
              }
            >
              <Icon icon={Copy} />
            </ToolbarButton>
            <ToolbarButton onClick={handleRun}>
              <Icon icon={Play} />
            </ToolbarButton>
          </ToolbarActions>
        )}
      </Toolbar>

      <Content expanded={!sidebarOpen}>
        {!currentAction ? (
          <EmptyView icon={Terminal} label="No action selected" />
        ) : (
          <div className="action-view">
            <p className="description">{currentAction.description}</p>
            <div className="code-editor">
              <pre>
                <code>{renderCodePreview()}</code>
              </pre>
            </div>
            {currentAction.warning && (
              <div className="warning-box">
                <strong>Note:</strong> {currentAction.warning}
              </div>
            )}
            {result && (
              <div className="result-box">
                <strong>Result:</strong>
                <pre>{result}</pre>
              </div>
            )}
          </div>
        )}
      </Content>
    </AppShell>
  );
}

export default App;
