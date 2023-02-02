import Frontend from "./components/frontend-vue.js";
import Bubble from "./components/bubble.js";
import Changelog from "./components/changelog.js";
import ExpandButton from "./components/expand-button.js";
import CloseButton from "./components/close-button.js";
import Variables from "./components/variables.js";
import Sidebar from "./components/sidebar.js";
import ConfirmModal from "./components/confirm-modal.js";

// To remove "import not used" warnings
Frontend;
Bubble;
Changelog;
ExpandButton;
CloseButton;
Variables;
Sidebar;
ConfirmModal;

class AdvancedRpcFrontend {
  PLUGIN_NAME = "AdvancedRPC";
  SETTINGS_KEY = "settings";
  FRONTEND_KEY = "frontend";

  remoteData = null;
  installedVersion = "[VI]{version}[/VI]";
  latestVersion = undefined;
  changelog = undefined;
  unappliedSettings = false;
  updateInProgress = false;

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
    this.checkForUpdates((this.init = true));
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
      } else return JSON.parse(data);
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

    if (!settings.imageSize) settings["imageSize"] = 1024;
    if (!settings.play.fallbackImage)
      settings["play"]["fallbackImage"] = "applemusic";
    if (!settings.pause.fallbackImage)
      settings["pause"]["fallbackImage"] = "applemusic";
    if (!settings.applySettings) settings["applySettings"] = "manually";
    if (settings.applySettings === "state")
      settings["applySettings"] = "manually";

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
          url: "{appleMusicUrl}",
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
            url: "{appleMusicUrl}",
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
        imageSize: 1024,
        applySettings: "manually",
        removeInvalidButtons: true,
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

  async checkForUpdates(init) {
    try {
      this.remoteData = await fetch(
        "https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/data.json"
      ).then((response) => response.json());

      ipcRenderer.invoke(
        `plugin.${this.PLUGIN_NAME}.remoteData`,
        this.remoteData
      );
    } catch (e) {}

    try {
      const { version } = await fetch(
        "https://raw.githubusercontent.com/down-bad/advanced-rpc/main/package.json"
      ).then((response) => response.json());
      if (init && version > this.installedVersion) {
        const updateNotyf = notyf.error({
          message: "There is a new AdvancedRPC version available!",
          icon: false,
          background: "#5865f2",
          duration: "5000",
          dismissible: true,
        });
        updateNotyf.on("click", ({ target, event }) => {
          app.appRoute("plugin/advancedrpc");
        });
      }
      this.latestVersion = version;
    } catch (e) {
      console.log(`[Plugin][${this.PLUGIN_NAME}] Error checking for updates.`);
      console.log(e);
      this.latestVersion = null;
    }

    try {
      if (this.remoteData.animatedArtworks) {
        const artworks = await fetch(
          "https://files.imvasi.com/arpc/artworks.json",
          { cache: "reload" }
        ).then((response) => response.json());

        ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.artworks`, artworks);
      }
    } catch {}

    try {
      if (init) this.changelog = "Fetching changelog...";

      this.changelog = await fetch(
        "https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/changelog.html"
      ).then((response) => response.text());
    } catch (e) {
      this.changelog = "Failed to fetch changelog";
    }
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
