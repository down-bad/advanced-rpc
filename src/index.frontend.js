import Frontend from "./components/frontend-vue.js";
import Bubble from "./components/bubble.js";
import Changelog from "./components/changelog.js";
import ExpandButton from "./components/expand-button.js";
import CloseButton from "./components/close-button.js";
import Variables from "./components/variables.js";
import Sidebar from "./components/sidebar.js";
import ConfirmModal from "./components/confirm-modal.js";
import General from "./components/settings-general.js";
import Podcasts from "./components/settings-podcasts.js";
import Videos from "./components/settings-videos.js";
import Radio from "./components/settings-radio.js";
import Spinner from "./components/spinner.js";
import ExitButton from "./components/exit-button.js";
import CustomModal from "./components/custom-modal.js";

// To remove "import not used" warnings
Frontend;
Bubble;
Changelog;
ExpandButton;
CloseButton;
Variables;
Sidebar;
ConfirmModal;
General;
Podcasts;
Videos;
Radio;
Spinner;
ExitButton;
CustomModal;

let cachedArtwork = {
  url: "",
  id: "",
};

let cachedCustomArtwork = {
  url: "",
  id: "",
};

class AdvancedRpcFrontend {
  PLUGIN_NAME = "AdvancedRPC";
  SETTINGS_KEY = "settings";
  FRONTEND_KEY = "frontend";

  remoteData = null;
  versionData = null;
  installedVersion = "[VI]{version}[/VI]";
  versionDate = "[VI]{date}[/VI]";
  changelog = undefined;
  unappliedSettings = false;
  updateInProgress = false;
  artworksUpdate = null;
  colorslessUpdate = null;
  isDev = false;
  devUrl = "http://localhost:8123";
  prodUrl = "https://arpc-api.imvasi.com";

  checkingForUpdate = false;
  gettingRemoteData = false;
  gettingChangelog = false;
  gettingAnimatedArtworks = false;
  gettingColorsless = false;

  constructor() {
    console.log(`[Plugin][${this.PLUGIN_NAME}] Frontend established.`);

    CiderFrontAPI.StyleSheets.Add("./plugins/gh_510140500/advancedrpc.less");
    const menuEntry = new CiderFrontAPI.Objects.MenuEntry();
    menuEntry.id = window.uuidv4();
    menuEntry.name = "AdvancedRPC";
    menuEntry.onClick = () => {
      // app.appRoute("plugin/advancedrpc");
      app.pluginPages.page = "plugin.advancedrpc";
      window.location.hash = "plugin-renderer";
    };
    CiderFrontAPI.AddMenuEntry(menuEntry);

    this.initSettings();
    ipcRenderer.invoke(
      `plugin.${this.PLUGIN_NAME}.initSettings`,
      this.getSettings()
    );
    this.checkForUpdates("startup");
  }

  // Gets settings from localStorage or sets default settings if none are found
  getSettings() {
    try {
      const data = localStorage.getItem(
        `plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`
      );
      if (!data) {
        this.setDefaultSettings();
        return this.getSettings();
      } else {
        const arpcSettings = JSON.parse(data);
        if (arpcSettings.videos.pause.button2.url === "%DEVMODE%")
          this.isDev = true;
        else this.isDev = false;
        return arpcSettings;
      }
    } catch (error) {
      return null;
    }
  }

  // Sets settings in localStorage
  setSettings(data) {
    localStorage.setItem(
      `plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`,
      JSON.stringify(data)
    );
  }

  // Check if user's settings are up to date with AdvancedRPC updates
  initSettings() {
    let settings = this.getSettings();

    if (typeof settings.play.smallImage == "boolean") {
      settings.play.smallImage = settings.play.smallImage
        ? "custom"
        : "disabled";
    }

    if (typeof settings.pause.smallImage == "boolean") {
      settings.pause.smallImage = settings.pause.smallImage
        ? "custom"
        : "disabled";
    }

    if (!settings.imageSize) settings["imageSize"] = "1024";
    if (!settings.play.fallbackImage)
      settings["play"]["fallbackImage"] = "applemusic";
    if (!settings.pause.fallbackImage)
      settings["pause"]["fallbackImage"] = "applemusic";
    if (!settings.removePause) settings["removePause"] = "0";

    if (typeof settings.removeInvalidButtons === "undefined")
      settings["removeInvalidButtons"] = true;

    if (typeof settings.icloudArtworks === "undefined")
      settings["icloudArtworks"] = true;

    if (!settings.podcasts)
      settings["podcasts"] = {
        play: {
          enabled: true,
          usePlayConfig: false,
          details: "{title}",
          state: "{artist}",
          timestamp: "remaining",
          largeImage: "cover",
          largeImageKey: "podcasts",
          largeImageText: "Episode {episodeNumber}",
          smallImage: "custom",
          smallImageKey: "play",
          smallImageText: "Playing",
          buttons: true,
          button1: {
            label: "Listen to this podcast",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
        pause: {
          enabled: true,
          usePauseConfig: false,
          details: "{title}",
          state: "{artist}",
          largeImage: "cover",
          largeImageKey: "podcasts",
          largeImageText: "Episode {episodeNumber}",
          smallImage: "custom",
          smallImageKey: "play",
          smallImageText: "Playing",
          buttons: true,
          usePlayButtons: true,
          button1: {
            label: "Listen to this podcast",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
      };

    if (!settings.videos)
      settings["videos"] = {
        play: {
          enabled: true,
          usePlayConfig: false,
          details: "{title}",
          state: "{artist}",
          timestamp: "remaining",
          largeImage: "cover",
          largeImageKey: "applemusic",
          largeImageText: "{album}",
          smallImage: "custom",
          smallImageKey: "play",
          smallImageText: "Playing",
          buttons: true,
          button1: {
            label: "Watch on Apple Music",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
        pause: {
          enabled: true,
          usePauseConfig: false,
          details: "{title}",
          state: "{artist}",
          largeImage: "cover",
          largeImageKey: "applemusic",
          largeImageText: "{album}",
          smallImage: "custom",
          smallImageKey: "pause",
          smallImageText: "Paused",
          buttons: true,
          usePlayButtons: true,
          button1: {
            label: "Watch on Apple Music",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
      };

    if (!settings.radio)
      settings["radio"] = {
        enabled: true,
        usePlayConfig: false,
        details: "{title}",
        state: "{artist}",
        timestamp: "elapsed",
        largeImage: "cover",
        largeImageKey: "applemusic",
        largeImageText: "{album}",
        smallImage: "custom",
        smallImageKey: "live",
        smallImageText: "Live",
        buttons: true,
        usePlayButtons: false,
        button1: {
          label: "Listen on Apple Music",
          url: "{radioUrl}",
        },
        button2: {
          label: "",
          url: "",
        },
      };

    this.setSettings(settings);
  }

  // Sets default settings in localStorage
  setDefaultSettings() {
    localStorage.setItem(
      `plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`,
      JSON.stringify({
        appId: "927026912302362675",
        enabled: true,
        respectPrivateSession: true,
        play: {
          enabled: true,
          details: "{title}",
          state: "{artist}",
          timestamp: "remaining",
          largeImage: "cover",
          largeImageKey: "applemusic",
          largeImageText: "{album}",
          smallImage: "custom",
          smallImageKey: "play",
          smallImageText: "Playing",
          fallbackImage: "applemusic",
          buttons: true,
          button1: {
            label: "Listen on Apple Music",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
        pause: {
          enabled: true,
          details: "{title}",
          state: "{artist}",
          largeImage: "cover",
          largeImageKey: "applemusic",
          largeImageText: "{album}",
          smallImage: "custom",
          smallImageKey: "pause",
          smallImageText: "Paused",
          fallbackImage: "applemusic",
          buttons: true,
          usePlayButtons: true,
          button1: {
            label: "Listen on Apple Music",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
        radio: {
          enabled: true,
          usePlayConfig: false,
          details: "{title}",
          state: "{artist}",
          timestamp: "elapsed",
          largeImage: "cover",
          largeImageKey: "applemusic",
          largeImageText: "{album}",
          smallImage: "custom",
          smallImageKey: "live",
          smallImageText: "Live",
          buttons: true,
          usePlayButtons: false,
          button1: {
            label: "Listen on Apple Music",
            url: "{radioUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
        podcasts: {
          play: {
            enabled: true,
            usePlayConfig: false,
            details: "{title}",
            state: "{artist}",
            timestamp: "remaining",
            largeImage: "cover",
            largeImageKey: "podcasts",
            largeImageText: "Episode {episodeNumber}",
            smallImage: "custom",
            smallImageKey: "play",
            smallImageText: "Playing",
            buttons: true,
            button1: {
              label: "Listen to this podcast",
              url: "{applePodcastsUrl}",
            },
            button2: {
              label: "",
              url: "",
            },
          },
          pause: {
            enabled: true,
            usePauseConfig: false,
            details: "{title}",
            state: "{artist}",
            largeImage: "cover",
            largeImageKey: "podcasts",
            largeImageText: "Episode {episodeNumber}",
            smallImage: "custom",
            smallImageKey: "pause",
            smallImageText: "Paused",
            buttons: true,
            usePlayButtons: true,
            button1: {
              label: "Listen to this podcast",
              url: "{applePodcastsUrl}",
            },
            button2: {
              label: "",
              url: "",
            },
          },
        },
        videos: {
          play: {
            enabled: true,
            usePlayConfig: false,
            details: "{title}",
            state: "{artist}",
            timestamp: "remaining",
            largeImage: "cover",
            largeImageKey: "applemusic",
            largeImageText: "{album}",
            smallImage: "custom",
            smallImageKey: "play",
            smallImageText: "Playing",
            buttons: true,
            button1: {
              label: "Watch on Apple Music",
              url: "{appleMusicUrl}",
            },
            button2: {
              label: "",
              url: "",
            },
          },
          pause: {
            enabled: true,
            usePauseConfig: false,
            details: "{title}",
            state: "{artist}",
            largeImage: "cover",
            largeImageKey: "applemusic",
            largeImageText: "{album}",
            smallImage: "custom",
            smallImageKey: "pause",
            smallImageText: "Paused",
            buttons: true,
            usePlayButtons: true,
            button1: {
              label: "Watch on Apple Music",
              url: "{appleMusicUrl}",
            },
            button2: {
              label: "",
              url: "",
            },
          },
        },
        imageSize: "1024",
        removeInvalidButtons: true,
        removePause: "0",
        icloudArtworks: true,
      })
    );
  }

  // Gets frontend data from localStorage or sets default values if none are found
  getFrontendData() {
    try {
      const data = localStorage.getItem(
        `plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`
      );
      if (!data) {
        localStorage.setItem(
          `plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`,
          JSON.stringify({
            sidebar: "general",
            theme: "dark",
            bubblesExpanded: true,
            scale: "100",
            pageStates: {
              general: "play",
              videos: "play",
              podcasts: "play",
            },
          })
        );
        return this.getFrontendData();
      } else return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  // Sets frontend data to localStorage
  setFrontendData(data) {
    localStorage.setItem(
      `plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`,
      JSON.stringify(data)
    );
  }

  async getRemoteData(src) {
    if (!this.gettingRemoteData) {
      this.gettingRemoteData = true;
      const frontend = await this.getFrontendData();
      try {
        this.remoteData = await fetch(
          `${
            this.isDev ? this.devUrl : this.prodUrl
          }/getRemoteData?src=${src}&version=${this.installedVersion}&theme=${
            frontend.theme
          }
            `
        ).then((response) => {
          if (response.status === 200) return response.json();
          else return null;
        });
        ipcRenderer.invoke(
          `plugin.${this.PLUGIN_NAME}.remoteData`,
          this.remoteData
        );

        if (this.remoteData?.versionData) {
          this.versionData = this.remoteData.versionData;
          this.artworksUpdate = this.remoteData.versionData.artworksUpdate;

          if (
            this.versionData.updateAvailable &&
            this.versionData.updateNotif
          ) {
            const updateNotyf = notyf.error({
              message:
                this.versionData.updateNotif.message ||
                "There is a new AdvancedRPC version available!",
              icon: false,
              background: this.versionData.updateNotif.color || "#5865f2",
              duration: this.versionData.updateNotif.duration || "5000",
              dismissible: true,
            });
            updateNotyf.on("click", ({ target, event }) => {
              // app.appRoute("plugin/advancedrpc");
              app.pluginPages.page = "plugin.advancedrpc";
              window.location.hash = "plugin-renderer";
            });
          }
        } else {
          this.versionData = null;
        }

        this.gettingRemoteData = false;
        return true;
      } catch (e) {
        console.log(
          `[Plugin][${this.PLUGIN_NAME}] Error fetching remote data. Some features may not work.`
        );
        console.log(e);
        this.remoteData = null;
        this.versionData = null;
        this.artworksUpdate = null;
        this.colorslessUpdate = null;
        this.gettingRemoteData = false;
        ipcRenderer.invoke(
          `plugin.${this.PLUGIN_NAME}.remoteData`,
          this.remoteData
        );
        return false;
      }
    }
  }

  async getColorsless(src) {
    if (
      !this.gettingColorsless &&
      this.versionData?.colorslessUpdate !== this.colorslessUpdate
    ) {
      this.gettingColorsless = true;
      try {
        const colorsless = await fetch(
          `${
            this.isDev ? this.devUrl : this.prodUrl
          }/getColorsless?src=${src}&version=${this.installedVersion}
            `
        ).then(async (response) => {
          if (response.status === 200) return response.text();
          else return null;
        });
        if (colorsless) {
          ipcRenderer.invoke(
            `plugin.${this.PLUGIN_NAME}.colorsless`,
            colorsless
          );
        }
        this.colorslessUpdate = this.versionData?.colorslessUpdate;
        this.gettingColorsless = false;
        return true;
      } catch (e) {
        console.log(
          `[Plugin][${this.PLUGIN_NAME}] Error getting theme styles.`
        );
        console.log(e);
        this.gettingColorsless = false;
        return false;
      }
    }
  }

  async getChangelog(src) {
    if (!this.gettingChangelog && src === "changelog") {
      this.gettingChangelog = true;
      try {
        const changelog = await fetch(
          this.remoteData?.versionData?.changelogUrl ??
            "https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/changelog.html"
        ).then(async (response) => response.text());
        this.changelog = changelog;
        this.gettingChangelog = false;
        return true;
      } catch (e) {
        console.log(`[Plugin][${this.PLUGIN_NAME}] Error fetching changelog.`);
        console.log(e);
        this.changelog = "Failed to fetch changelog";
        this.gettingChangelog = false;
        return false;
      }
    }
  }

  async getAnimatedArtworks(src) {
    if (!this.gettingAnimatedArtworks) {
      try {
        if (
          this.remoteData?.flags?.animatedArtworks &&
          !this.remoteData?.animatedArtworksv2?.enabled
        ) {
          this.gettingAnimatedArtworks = true;
          let artworks = await fetch(
            `${
              this.isDev ? this.devUrl : this.prodUrl
            }/getArtworks?src=${src}&version=${this.installedVersion}`,
            {
              cache: "no-store",
            }
          ).then((response) => {
            if (response.status === 200) {
              this.artworksUpdate = response.headers.get("Last-Modified");
              return response.json();
            } else return null;
          });

          this.gettingAnimatedArtworks = false;
          if (artworks) {
            ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.artworks`, artworks);
            return true;
          }
        }
      } catch (e) {
        console.log(
          `[Plugin][${this.PLUGIN_NAME}] Error fetching animated artworks.`
        );
        console.log(e);
        this.gettingAnimatedArtworks = false;
        return false;
      }
    }
  }

  async checkForUpdates(src) {
    this.checkingForUpdate = true;
    await this.getRemoteData(src);

    const promises = [
      this.getAnimatedArtworks(src),
      this.getChangelog(src),
      this.getColorsless(src),
    ];

    await Promise.allSettled(promises);
  }

  async update() {
    AdvancedRpc.updateInProgress = true;
    ipcRenderer.once("plugin-installed", (event, arg) => {
      if (arg.success) {
        ipcRenderer.invoke("relaunchApp");
      } else {
        notyf.error("Error updating AdvancedRPC");
        AdvancedRpc.updateInProgress = false;
      }
    });
    ipcRenderer.invoke(
      "get-github-plugin",
      "https://github.com/down-bad/advanced-rpc"
    );
  }
}

window.AdvancedRpc = new AdvancedRpcFrontend();

ipcRenderer.on(
  `plugin.${AdvancedRpc.PLUGIN_NAME}.itemChanged`,
  async (
    e,
    enabled,
    cover,
    icloudSetting,
    kind,
    songId,
    artworkUrl,
    update
  ) => {
    const animatedArtworksv2 = AdvancedRpc.remoteData?.animatedArtworksv2,
      icloudArtworks = AdvancedRpc.remoteData?.icloudArtworks,
      isDev = AdvancedRpc.isDev;

    let currentItem = localStorage.getItem("currentTrack");
    currentItem =
      currentItem && currentItem !== "undefined"
        ? JSON.parse(currentItem)
        : null;

    if (!currentItem || currentItem === "undefined") return;

    // Get animated artwork
    if (
      enabled &&
      !songId?.startsWith("i.") &&
      animatedArtworksv2?.enabled &&
      cover &&
      kind
    ) {
      let artwork = await getAnimatedArtwork(
        currentItem?._assets?.[0]?.metadata?.playlistId,
        animatedArtworksv2
      );

      if (artwork === "fetching") {
        isDev && notyf.error("Return becauce fetching!!");
        return;
      }

      if (!artwork) artwork = currentItem?.attributes?.artwork?.url;

      currentItem = {
        ...currentItem,
        artwork,
      };
    }

    // Get custom iCloud artwork
    if (
      enabled &&
      icloudSetting &&
      songId?.startsWith("i.") &&
      icloudArtworks?.enabled &&
      artworkUrl
    ) {
      if (artworkUrl.length <= 256) return artworkUrl;

      let artwork = await getArtworkUrl(songId, artworkUrl, icloudArtworks);

      if (artwork === "fetching") {
        isDev && notyf.error("Return becauce fetching!!");
        return;
      }

      isDev && notyf.success(artwork?.url);

      if (artwork) {
        currentItem = {
          ...currentItem,
          artwork: artwork.url,
        };
      }
    }

    try {
      currentItem = JSON.stringify(currentItem);
      await ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.currentItem`,
        currentItem,
        update
      );
    } catch (error) {
      console.log(error);
    }
  }
);

/* 
We are not fetching on the backend because:
1. messes with Cider, makes it skip songs rapidly at random times,
2. fetching seems to be slower,
3. requires axios, which makes the plugin bigger (fetch/node fetch does not work)
*/
async function getAnimatedArtwork(albumId, animatedArtworksv2) {
  if (!albumId) return null;
  const isDev = AdvancedRpc.isDev;

  if (cachedArtwork.id === albumId && cachedArtwork.url === "fetching") {
    return "fetching";
  } else if (cachedArtwork.id === albumId && cachedArtwork.url) {
    isDev && notyf.success("Using cached animated artwork.");
    return cachedArtwork.url;
  } else if (cachedArtwork.id === albumId && !cachedArtwork.url) {
    return null;
  }

  cachedArtwork.id = albumId;
  cachedArtwork.url = "fetching";

  try {
    isDev && notyf.success("Fetching animated artwork.");
    const now1 = Date.now();
    const timeout = new Promise((resolve, reject) => {
      setTimeout(
        reject,
        animatedArtworksv2?.timeout ?? 5000,
        "Animated artwork fetching timed out."
      );
    });

    let request, refId;
    if (animatedArtworksv2?.stats) {
      refId = window.uuidv4();
      request = fetch(`https://arpc-api.imvasi.com/animartwork/${albumId} `, {
        headers: {
          "X-Ref-Id": refId,
        },
      });
    } else {
      request = fetch(`https://arpc-api.imvasi.com/animartwork/${albumId}`);
    }
    // const request = fetch(`https://arpc-api.imvasi.com/animartwork/${albumId}`);

    const response = await Promise.race([request, timeout]);

    if (response.status !== 200) {
      isDev && notyf.error("Animated artwork fetch failed.");
      return null;
    }

    const url = await response.json();

    isDev && console.log(url);

    if (!url) return null;

    if (url === "404") {
      isDev && notyf.error("Animated artwork not found.");
      cachedArtwork.id = albumId;
      cachedArtwork.url = null;
      return null;
    }

    const now2 = Date.now();

    isDev && notyf.success(`Animated artwork took ${now2 - now1}ms.`);

    if (animatedArtworksv2.stats) {
      stats(now2 - now1, "animartwork", refId);
    }

    cachedArtwork.url = url;
    cachedArtwork.id = albumId;
    return url;
  } catch (error) {
    console.log(error);
    cachedArtwork.id = albumId;
    cachedArtwork.url = null;
    stats("ERROR", "animartwork");
    return null;
  }
}

async function getArtworkUrl(songId, customArtwork, icloudArtworks) {
  if (!customArtwork) return null;
  const isDev = AdvancedRpc.isDev;

  if (
    cachedCustomArtwork.id === songId &&
    cachedCustomArtwork.url === "fetching"
  ) {
    return "fetching";
  } else if (cachedCustomArtwork.id === songId && cachedCustomArtwork.url) {
    isDev && notyf.success("Using cached custom artwork.");
    return cachedCustomArtwork.url;
  } else if (cachedCustomArtwork.id === songId && !cachedCustomArtwork.url) {
    return null;
  }

  cachedCustomArtwork.id = songId;
  cachedCustomArtwork.url = "fetching";

  try {
    isDev && notyf.success("Fetching custom artwork.");
    const now1 = Date.now();
    const timeout = new Promise((resolve, reject) => {
      setTimeout(
        reject,
        icloudArtworks?.timeout ?? 5000,
        "Custom artwork fetching timed out."
      );
    });

    let request, refId;
    if (icloudArtworks?.stats) {
      refId = window.uuidv4();
      request = fetch(`https://arpc-api.imvasi.com/artwork/`, {
        method: "POST",
        body: JSON.stringify({ imageUrl: customArtwork }),
        headers: {
          "Content-Type": "application/json",
          "X-Ref-Id": refId,
        },
      });
    } else {
      request = fetch(`https://arpc-api.imvasi.com/artwork/`, {
        method: "POST",
        body: JSON.stringify({ imageUrl: customArtwork }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const response = await Promise.race([request, timeout]);

    if (response.status !== 200) {
      isDev && notyf.error("Custom artwork fetch failed.");
      return null;
    }

    const url = await response.json();

    isDev && console.log(url);

    if (!url) return null;

    const now2 = Date.now();

    isDev && notyf.success(`Custom artwork took ${now2 - now1}ms.`);

    if (icloudArtworks.stats) {
      stats(now2 - now1, "artwork", refId);
    }

    cachedCustomArtwork.url = url;
    cachedCustomArtwork.id = songId;
    return url;
  } catch (error) {
    console.log(error);
    cachedCustomArtwork.id = songId;
    cachedCustomArtwork.url = null;
    stats("ERROR", "artwork");
    return null;
  }
}

ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.consoleLog`, (e, data) => {
  console.log(data);
});

ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.setcss`, (e, data) => {
  CiderFrontAPI.StyleSheets.Add("./plugins/gh_510140500/advancedrpc.less");
});

async function stats(ms, type, refId) {
  await fetch(`https://arpc-api.imvasi.com/stats/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ref-Id": refId,
    },
    body: JSON.stringify({
      ms,
    }),
  });
}
