import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import * as api from "@htmlos-next/api";
import type { ActionDefinition, ActionArgument } from "../types";

interface ContentProps {
  expanded?: boolean;
  action?: ActionDefinition;
  isMobile?: boolean;
}

export interface ContentHandlers {
  copy: () => void;
  run: () => Promise<void>;
}

const Content = forwardRef<ContentHandlers, ContentProps>(
  ({ expanded = false, action, isMobile }, ref) => {
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [result, setResult] = useState<string | null>(null);

    // Initialize form values from action defaults
    useEffect(() => {
      if (action) {
        const initialValues: Record<string, any> = {};
        action.code.arguments.forEach((arg) => {
          initialValues[arg.id] = arg.default;
        });
        setFormValues(initialValues);
        setResult(null);
      }
    }, [action]);

    const handleInputChange = (argId: string, value: any) => {
      setFormValues((prev) => ({ ...prev, [argId]: value }));
    };

    const generateCodeString = () => {
      if (!action) return "";
      let codeString = action.code.string;
      action.code.arguments.forEach((arg) => {
        const value = formValues[arg.id];
        let replacement = "";
        if (arg.type === "text") {
          replacement = `"${value}"`;
        } else if (arg.type === "bool") {
          replacement = String(value);
        } else {
          replacement = String(value);
        }
        codeString = codeString.replace(`<${arg.id}>`, replacement);
      });
      return codeString + ";";
    };

    const handleRun = async () => {
      if (!action) return;

      const args = action.code.arguments.map((arg) => {
        let value = formValues[arg.id];
        // Convert empty strings or 0 to null for nullable fields in spawn-window
        if (
          action.id === "spawn-window" &&
          value === 0 &&
          (arg.label?.includes("max") || arg.label?.includes("min"))
        ) {
          return null;
        }
        if (
          action.id === "spawn-window" &&
          value === "" &&
          arg.label === "icon"
        ) {
          return null;
        }
        return value;
      });

      try {
        const apiFunction = (api as any)[action.code.functionName];
        if (apiFunction) {
          const res = await apiFunction(...args);
          if (res !== undefined) {
            setResult(JSON.stringify(res, null, 2));
          }
        }
      } catch (error) {
        console.error("Error running action:", error);
      }
    };

    // Expose handlers to parent via ref
    useImperativeHandle(ref, () => ({
      copy: () => {
        navigator.clipboard.writeText(generateCodeString());
      },
      run: handleRun,
    }));

    const renderCodePreview = () => {
      if (!action) return null;

      let codeString = action.code.string;
      const parts: React.JSX.Element[] = [];
      let currentIndex = 0;
      let partKey = 0;

      action.code.arguments.forEach((arg, argIndex) => {
        const placeholder = `<${arg.id}>`;
        const placeholderIndex = codeString.indexOf(placeholder, currentIndex);

        if (placeholderIndex !== -1) {
          // Add text before the placeholder
          if (placeholderIndex > currentIndex) {
            const beforeText = codeString.substring(
              currentIndex,
              placeholderIndex,
            );
            // Check if this contains the label (allow optional opening quote after =)
            const labelMatch = beforeText.match(/(\w+)\s*=\s*["']?\s*$/);
            if (labelMatch) {
              const beforeLabel = beforeText.substring(
                0,
                beforeText.lastIndexOf(labelMatch[0]),
              );

              // For the first argument, add opening paren and line break
              if (argIndex === 0) {
                const openParen = beforeLabel.substring(
                  0,
                  beforeLabel.indexOf("(") + 1,
                );
                parts.push(<span key={partKey++}>{openParen + "\n    "}</span>);
              } else {
                // For subsequent arguments, the beforeLabel contains comma from previous arg
                const commaIndex = beforeLabel.lastIndexOf(",");
                if (commaIndex !== -1) {
                  parts.push(<span key={partKey++}>{",\n    "}</span>);
                }
              }

              parts.push(
                <span key={partKey++} className="gray">
                  {labelMatch[0]}
                </span>,
              );
            } else {
              parts.push(<span key={partKey++}>{beforeText}</span>);
            }
          }

          // Add the input for this argument
          parts.push(renderInput(arg, partKey++));

          currentIndex = placeholderIndex + placeholder.length;
        }
      });

      // Add remaining text (closing paren and semicolon)
      if (currentIndex < codeString.length) {
        const remaining = codeString.substring(currentIndex);
        // Add line break before closing paren if there are arguments
        if (action.code.arguments.length > 0) {
          parts.push(<span key={partKey++}>{"\n" + remaining}</span>);
        } else {
          parts.push(<span key={partKey++}>{remaining}</span>);
        }
      }

      // Highlight function name in the first part
      const firstPart = parts[0];
      if (firstPart && typeof firstPart.props.children === "string") {
        const text = firstPart.props.children as string;
        const parenIndex = text.indexOf("(");
        if (parenIndex !== -1) {
          const functionName = text.substring(0, parenIndex);
          const rest = text.substring(parenIndex);
          parts[0] = (
            <span key={0}>
              <span className="orange">{functionName}</span>
              {rest}
            </span>
          );
        }
      }

      return parts;
    };

    const renderInput = (
      arg: ActionArgument,
      key: number,
    ): React.JSX.Element => {
      const value = formValues[arg.id];

      if (arg.type === "text") {
        return (
          <span key={key}>
            "
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(arg.id, e.target.value)}
              placeholder={arg.label}
            />
            "
          </span>
        );
      } else if (arg.type === "number") {
        return (
          <input
            key={key}
            type="number"
            value={value}
            onChange={(e) =>
              handleInputChange(arg.id, parseInt(e.target.value) || 0)
            }
            placeholder={arg.label}
          />
        );
      } else {
        // arg.type === "bool"
        return (
          <input
            key={key}
            type="checkbox"
            checked={value}
            onChange={(e) => handleInputChange(arg.id, e.target.checked)}
          />
        );
      }
    };

    return (
      <div
        className={`content-container ${
          expanded ? "content-container-expanded" : ""
        } ${isMobile ? "content-mobile" : ""}`}
      >
        {!action ? (
          <div className="no-content">
            <h3>No action selected</h3>
            <p>Please choose an API action in the sidebar.</p>
          </div>
        ) : (
          <div className="action-content">
            <p>{action.description}</p>
            <div className="code">
              <pre>
                <code>{renderCodePreview()}</code>
              </pre>
            </div>
            {action.warning && (
              <div className="info">
                <strong>Note:</strong> {action.warning}
              </div>
            )}
            {result && (
              <div className="info">
                <strong>Result:</strong>
                <pre>{result}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

Content.displayName = "Content";

export default Content;
