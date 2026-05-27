export interface WindowConfig {
  id: string;
  title?: string;
  url?: string;
  icon?: string;
  version?: string;
  defaultX?: number;
  defaultY?: number;
  borderless?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  allowResize?: boolean;
  allowMaximize?: boolean;
  permissions?: {
    positionManipulation: boolean;
    windowSpawning: boolean;
    cameraAccess: boolean;
    microphoneAccess: boolean;
    diskAccess: boolean;
  };
  nameLocale?: Record<string, string>;
  fileInput?: {
    path: string;
    url: string;
  };
}
