import { createContext, useContext } from "react";

export const DeviceContext = createContext({ isMobile: false });

export const useDevice = () => useContext(DeviceContext);
