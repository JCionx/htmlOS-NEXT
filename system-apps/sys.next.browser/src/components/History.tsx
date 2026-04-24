import { Button, ListItem, EmptyView } from "@htmlos-next/ui";
import { Clock } from "lucide-react";

interface HistoryProps {
  history: { title: string; url: string }[];
  onClearHistory: () => void;
  navigateTo: (url: string) => void;
  visible: boolean;
  isMobile: boolean;
}

function fetchWebsiteIcon(url: string, size: number) {
  if (!url || url.startsWith("about:")) {
    return "";
  }

  try {
    const domain = new URL(url).hostname;
    return `https://favicone.com/${domain}?s=${size}`;
  } catch (e) {
    return "";
  }
}

function History({
  history,
  onClearHistory,
  navigateTo,
  visible,
  isMobile,
}: HistoryProps) {
  return (
    <div
      className="historyContainer"
      style={visible ? {} : { display: "none" }}
    >
      {history.length === 0 ? (
        <EmptyView icon={Clock} label="No history data" />
      ) : (
        <>
          <h2>History</h2>
          <Button onClick={onClearHistory}>Clear History</Button>
          <div className="historyList">
            {history.map((entry) => (
              <ListItem
                key={entry.url}
                onClick={() => {
                  navigateTo(entry.url);
                }}
              >
                <img
                  src={fetchWebsiteIcon(entry.url, isMobile ? 24 : 18)}
                  alt={`${entry.title} icon`}
                  className="historyIcon"
                  style={{
                    minWidth: isMobile ? 24 : 18,
                    minHeight: isMobile ? 24 : 18,
                    maxWidth: isMobile ? 24 : 18,
                    maxHeight: isMobile ? 24 : 18,
                  }}
                />
                <span>{entry.title}</span>
              </ListItem>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default History;
