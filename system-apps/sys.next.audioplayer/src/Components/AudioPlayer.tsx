import { useState, useEffect } from "react";
import * as mm from "music-metadata";
import icon from "/icon.png";

import { useTranslation } from "react-i18next";

interface AudioPlayerProps {
  audioUrl: string;
}

interface Metadata {
  title?: string;
  artist?: string;
  album?: string;
  picture?: string;
}

function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [metadata, setMetadata] = useState<Metadata>({});

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchMetadata = async () => {
      try {
        const response = await fetch(audioUrl);
        if (!response.body) return;

        const tag = await mm.parseWebStream(response.body, {
          mimeType: response.headers.get("Content-Type") || "audio/mpeg",
          size: Number(response.headers.get("Content-Length")),
        });

        const { common } = tag;

        let pictureUrl = "";
        if (common.picture && common.picture.length > 0) {
          const pic = common.picture[0];
          const blob = new Blob([new Uint8Array(pic.data)], {
            type: pic.format,
          });
          objectUrl = URL.createObjectURL(blob);
          pictureUrl = objectUrl;
        }

        setMetadata({
          title: common.title,
          artist: common.artist,
          album: common.album,
          picture: pictureUrl,
        });
      } catch (e) {
        console.error("Error fetching audio for metadata:", e);
      }
    };

    setMetadata({});
    fetchMetadata();

    // Cleanup function to prevent memory leaks with ObjectURLs
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [audioUrl]);

  const { t } = useTranslation();

  return (
    <div className="player-container">
      <div className="player-art-container">
        <img
          src={metadata.picture || icon}
          alt="Album Art"
          className="player-art"
        />
      </div>

      <h2 className="player-title">
        {metadata.title || t("player.unkownTitle")}
      </h2>
      <p className="player-artist">
        {metadata.artist || t("player.unkownArtist")}
      </p>
      <p className="player-album">
        {metadata.album || t("player.unkownAlbum")}
      </p>

      <audio src={audioUrl} controls autoPlay className="player-audio" />
    </div>
  );
}

export default AudioPlayer;
