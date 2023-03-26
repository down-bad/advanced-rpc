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

class AdvancedRpcFrontend {
  PLUGIN_NAME = "AdvancedRPC";
  SETTINGS_KEY = "settings";
  FRONTEND_KEY = "frontend";

  remoteData = null;
  versionData = null;
  installedVersion = "[VI]{version}[/VI]";
  changelog = undefined;
  unappliedSettings = false;
  updateInProgress = false;
  artworksUpdate = null;
  isDev = false;

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
      app.appRoute("plugin/advancedrpc");
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
    if (!settings.applySettings) settings["applySettings"] = "manually";
    if (settings.applySettings === "state")
      settings["applySettings"] = "manually";
    if (!settings.removePause) settings["removePause"] = "0";

    if (typeof settings.removeInvalidButtons === "undefined")
      settings["removeInvalidButtons"] = true;

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
        applySettings: "manually",
        removeInvalidButtons: true,
        removePause: "0",
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
          `https://${
            this.isDev ? "dev" : "arpc"
          }-api.imvasi.com/getRemoteData?src=${src}&version=${
            this.installedVersion
          }&theme=${frontend.theme}
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
              app.appRoute("plugin/advancedrpc");
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
        this.gettingRemoteData = false;
        return false;
      }
    }
  }

  async getColorsless(src) {
    if (!this.gettingColorsless) {
      this.gettingColorsless = true;
      try {
        const colorsless = await fetch(
          `https://${
            this.isDev ? "dev" : "arpc"
          }-api.imvasi.com/getColorsless?src=${src}&version=${
            this.installedVersion
          }
            `
        ).then(async (response) => {
          if (response.status === 200) return response.text();
          else return null;
        });
        if (colorsless)
          ipcRenderer.invoke(
            `plugin.${this.PLUGIN_NAME}.colorsless`,
            colorsless
          );
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

  async getChangelog() {
    if (!this.gettingChangelog) {
      this.gettingChangelog = true;
      try {
        const changelog = await fetch(
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
        if (this.remoteData?.animatedArtworks) {
          this.gettingAnimatedArtworks = true;
          let artworks = await fetch(
            `https://${
              this.isDev ? "dev" : "arpc"
            }-api.imvasi.com/getArtworks?src=${src}&version=${
              this.installedVersion
            }`,
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
      this.getChangelog(),
      this.getColorsless(src),
    ];

    await Promise.allSettled(promises);

    CiderFrontAPI.StyleSheets.Add("./plugins/gh_510140500/advancedrpc.less");
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

ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.itemChanged`, (e, data) => {
  const currentItem = localStorage.getItem("currentTrack");
  ipcRenderer.invoke(
    `plugin.${AdvancedRpc.PLUGIN_NAME}.currentItem`,
    currentItem
  );
});

ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.consoleLog`, (e, data) => {
  console.log(data);
});
