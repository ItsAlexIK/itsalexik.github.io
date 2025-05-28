import React, { useEffect, useState } from "react";
import { startSnow } from "./visuals/snow";
import { startStars } from "./visuals/stars";
import ChatModal from "./components/ChatModal";
import "./styles/App.css";

const formatElapsed = (milliseconds) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const App = () => {
  const [presence, setPresence] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    startSnow();
    startStars();

    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    let heartbeatInterval;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: 2,
          d: {
            subscribe_to_ids: ["551023598203043840"],
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.op === 1) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(() => {
          ws.send(JSON.stringify({ op: 3 }));
        }, message.d.heartbeat_interval);
      }
      if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
        if (message.d["551023598203043840"]) {
          setPresence({
            ...message.d["551023598203043840"],
            activities: [...(message.d["551023598203043840"].activities || [])],
          });
        } else {
          setPresence({
            ...message.d,
            activities: [...(message.d.activities || [])],
          });
        }
      }
    };

    return () => {
      ws.close();
      clearInterval(heartbeatInterval);
    };
  }, []);

  useEffect(() => {
    const spotifyActivity = presence?.activities?.find(
      (act) => act.name === "Spotify"
    );

    if (spotifyActivity?.timestamps?.start) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - spotifyActivity.timestamps.start;
        setCurrentTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [presence]);

  if (!presence) return null;

  const discord_user = presence?.discord_user || {};
  const discord_status = presence?.discord_status || "offline";

  const avatar = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`;
  const username = discord_user.global_name || discord_user.username;
  const tag =
    discord_user.discriminator !== "0" ? `#${discord_user.discriminator}` : "";

  const statusClass =
    {
      online: "online",
      idle: "idle",
      dnd: "dnd",
      offline: "offline",
      invisible: "offline",
      streaming: "streaming",
    }[discord_status] || "offline";

  const otherActivities =
    presence?.activities?.filter((act) => act.type !== 4) || [];

  return (
    <div className="app">
      <div className="card-container">
        <div className="profile-card">
          <div className="avatar-wrapper">
            <img src={avatar} alt="avatar" className="avatar" />
            <div className={`status-indicator ${statusClass}`} />
          </div>
          <div className="user-info">
            <h2>{username}</h2>
            <span className="tag">{tag}</span>

            {discord_user.primary_guild?.tag && discord_user.primary_guild?.badge && (
              <div className="clan-badge">
                <img
                  src={`https://cdn.discordapp.com/clan-badges/${discord_user.primary_guild.identity_guild_id}/${discord_user.primary_guild.badge}.png`}
                  alt={`[${discord_user.primary_guild.tag}]`}
                />
                <span>{discord_user.primary_guild.tag}</span>
              </div>
            )}

          </div>
          <button className="chat-button" onClick={() => setIsModalOpen(true)}>
            💬
          </button>
        </div>
        {otherActivities.length > 0 && (
          <div className="activities">
            {otherActivities.map((act, index) => {
              const isSpotify = act.name === "Spotify";
              const songDuration =
                isSpotify && act.timestamps?.end && act.timestamps?.start
                  ? act.timestamps.end - act.timestamps.start
                  : 0;

              const progressPercentage =
                isSpotify && songDuration > 0
                  ? ((Date.now() - act.timestamps.start) / songDuration) * 100
                  : 0;

              return (
                <div
                  className={`activity${isSpotify ? " spotify-activity" : ""}`}
                  key={index}
                  style={{
                    position: isSpotify ? "relative" : undefined,
                    display: isSpotify ? "flex" : undefined,
                    alignItems: isSpotify ? "center" : undefined,
                  }}
                >
                  {isSpotify && presence.spotify?.album_art_url && (
                    <img
                      className="spotify-bg-blur"
                      src={presence.spotify.album_art_url}
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                  {isSpotify && presence.spotify?.album_art_url && (
                    <img
                      className="spotify-album-art"
                      src={presence.spotify.album_art_url}
                      alt="album art"
                    />
                  )}
                  {!isSpotify && act.assets?.large_image && (
                    <img
                      src={
                        act.assets.large_image.startsWith("spotify:")
                          ? presence.spotify?.album_art_url
                          : `https://cdn.discordapp.com/app-assets/${act.application_id}/${act.assets.large_image}.png`
                      }
                      alt="activity"
                    />
                  )}
                  <div className="activity-content">
                    <strong>{act.name}</strong>
                    <div>{act.details || act.state}</div>
                    {isSpotify && (
                      <>
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="time-info">
                          <span>
                            {formatElapsed(Date.now() - act.timestamps.start)}
                          </span>
                          <span>{formatElapsed(songDuration)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <hr className="section-divider" />
        <div className="tech-stack">
          <h2>💻 Tech Stack</h2>
          <div className="tech-icons">
            <img
              src="https://skillicons.dev/icons?i=html,css,bootstrap,js,ts,php"
              alt="Tech Stack 1"
            />
            <img
              src="https://skillicons.dev/icons?i=mysql,java,cs,react,angular,dotnet"
              alt="Tech Stack 2"
              style={{ marginTop: "0.5rem" }}
            />
          </div>
        </div>
        <div className="social-links">
          <h2>🌐 Connect with Me</h2>
          <div className="links">
            <a
              href="https://discord.com/users/551023598203043840"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.shields.io/badge/Discord-itsa1ex-5865F2?style=flat-square&logo=discord&logoColor=white"
                alt="Discord"
              />
            </a>
            <a
              href="https://github.com/ItsAlexIK"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://img.shields.io/badge/GitHub-ItsAlexIK-181717?style=flat-square&logo=github&logoColor=white"
                alt="GitHub"
              />
            </a>
          </div>
        </div>
        <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />{" "}
        <footer className="copyright-footer">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://github.com/ItsAlexIK"
            target="_blank"
            rel="noopener noreferrer"
          >
            ItsAlexIK
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;
