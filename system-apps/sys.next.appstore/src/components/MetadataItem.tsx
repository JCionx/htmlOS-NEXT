interface MetadataItemProps {
  children: React.ReactNode;
}

function MetadataItem({ children }: MetadataItemProps) {
  return <div className="metadata-item">{children}</div>;
}

export default MetadataItem;
