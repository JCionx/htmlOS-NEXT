interface TabContainerProps {
  children?: React.ReactNode;
}

function TabContainer({ children }: TabContainerProps) {
  return <div className="tabContainer">{children}</div>;
}

export default TabContainer;
