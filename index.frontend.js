/* Version: 1.4.1 - November 3, 2022 01:32:49 */
'use strict';

class AdvancedRpcFrontend {
  PLUGIN_NAME = "AdvancedRPC";
  SETTINGS_KEY = "settings";
  FRONTEND_KEY = "frontend";
  remoteData = null;
  installedVersion = "1.4.1";
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
    ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.initSettings`, this.getSettings());
    this.checkForUpdates(this.init = true);
  }
  getSettings() {
    try {
      const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`);
      if (!data) {
        this.setDefaultSettings();
        return this.getSettings();
      } else return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  setSettings(data) {
    localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`, JSON.stringify(data));
  }
  initSettings() {
    let settings = this.getSettings();
    if (typeof settings.play.smallImage == "boolean") {
      settings.play.smallImage = settings.play.smallImage ? "custom" : "disabled";
    }
    if (typeof settings.pause.smallImage == "boolean") {
      settings.pause.smallImage = settings.pause.smallImage ? "custom" : "disabled";
    }
    if (!settings.imageSize) settings["imageSize"] = 1024;
    if (!settings.play.fallbackImage) settings["play"]["fallbackImage"] = "applemusic";
    if (!settings.pause.fallbackImage) settings["pause"]["fallbackImage"] = "applemusic";
    if (!settings.applySettings) settings["applySettings"] = "state";
    if (typeof settings.removeInvalidButtons === "undefined") settings["removeInvalidButtons"] = true;
    if (!settings.podcasts) settings["podcasts"] = {
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
      }
    };
    if (!settings.videos) settings["videos"] = {
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
      }
    };
    if (!settings.radio) settings["radio"] = {
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
        url: "{appleMusicUrl}"
      },
      button2: {
        label: "",
        url: ""
      }
    };
    this.setSettings(settings);
  }
  setDefaultSettings() {
    localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`, JSON.stringify({
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
        }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
        }
      },
      imageSize: 1024,
      applySettings: "state",
      removeInvalidButtons: true
    }));
  }
  getFrontendData() {
    try {
      const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`);
      if (!data) {
        localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`, JSON.stringify({
          sidebar: "general"
        }));
        return this.getFrontendData();
      } else return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  setFrontendData(data) {
    localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`, JSON.stringify(data));
  }
  async checkForUpdates(init) {
    try {
      const {
        version
      } = await fetch("https://raw.githubusercontent.com/down-bad/advanced-rpc/main/package.json").then(response => response.json());
      if (init && version > this.installedVersion) {
        const updateNotyf = notyf.error({
          message: "There is a new AdvancedRPC version available!",
          icon: false,
          background: "#5865f2",
          duration: "5000",
          dismissible: true
        });
        updateNotyf.on("click", ({
          target,
          event
        }) => {
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
      if (init) this.changelog = "Fetching changelog...";
      this.changelog = await fetch("https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/changelog.html").then(response => response.text());
    } catch (e) {
      this.changelog = "Failed to fetch changelog";
    }
    if (init) {
      try {
        this.remoteData = await fetch("https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/data.json").then(response => response.json());
      } catch (e) {}
    }
  }
}
window.AdvancedRpc = new AdvancedRpcFrontend();
