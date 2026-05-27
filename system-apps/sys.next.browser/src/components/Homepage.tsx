import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ContextMenu, Icon, SidebarItem } from "@htmlos-next/ui";

interface HomepageProps {
  favorites: { title: string; url: string }[];
  navigateTo: (url: string) => void;
  visible: boolean;
  onRemoveFavorite?: (url: string) => void;
}

function fetchWebsiteIcon(url: string, size: number = 64) {
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

function Homepage({
  favorites,
  navigateTo,
  visible,
  onRemoveFavorite,
}: HomepageProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedFavoriteUrl, setSelectedFavoriteUrl] = useState<string | null>(
    null,
  );

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement>,
    favUrl: string,
  ) => {
    e.preventDefault();
    setSelectedFavoriteUrl(favUrl);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  const handleRemoveFavorite = () => {
    if (selectedFavoriteUrl && onRemoveFavorite) {
      onRemoveFavorite(selectedFavoriteUrl);
    }
    setContextMenuOpen(false);
    setSelectedFavoriteUrl(null);
  };

  return (
    <div
      className="homepageContainer"
      style={visible ? {} : { display: "none" }}
      onClick={() => {
        if (contextMenuOpen) {
          setContextMenuOpen(false);
        }
      }}
    >
      <div className="homepage">
        {favorites.length !== 0 && (
          <>
            <h2>Favorites</h2>
            <div className="favoritesList">
              {favorites.map((fav) => (
                <div
                  key={fav.url}
                  className="favoriteItem"
                  onClick={() => {
                    navigateTo(fav.url);
                  }}
                  onContextMenu={(e) => handleContextMenu(e, fav.url)}
                >
                  <img
                    src={fetchWebsiteIcon(fav.url)}
                    alt={`${fav.title} icon`}
                    className="favoriteIcon"
                  />
                  <p>{fav.title}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <ContextMenu
        open={contextMenuOpen}
        x={contextMenuPosition.x}
        y={contextMenuPosition.y}
      >
        <SidebarItem onClick={handleRemoveFavorite}>
          <Icon icon={Trash2} />
          Remove from Favorites
        </SidebarItem>
      </ContextMenu>
    </div>
  );
}

export default Homepage;
