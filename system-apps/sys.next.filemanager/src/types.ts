export interface ActionArgument {
  id: string;
  type: "number" | "text" | "bool";
  default: number | string | boolean;
  label?: string;
}

export interface ActionDefinition {
  id: string;
  title: string;
  description: string;
  warning?: string;
  code: {
    string: string;
    arguments: ActionArgument[];
    functionName: string;
  };
}
