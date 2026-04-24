interface HomepageProps {
  favorites: { title: string; url: string }[];
  navigateTo: (url: string) => void;
  visible: boolean;
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

function Homepage({ favorites, navigateTo, visible }: HomepageProps) {
  return (
    <div
      className="homepageContainer"
      style={visible ? {} : { display: "none" }}
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
    </div>
  );
}

export default Homepage;
