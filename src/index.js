const { AutoClient } = require("discord-auto-rpc");
const { ipcMain } = require("electron");
const { join } = require("path");

module.exports = class AdvancedRpcBackend {
  constructor(env) {
    this._env = env;
    this._store = env.utils.getStore();

    this.name = "AdvancedRPC";
    this.description = "Fully customizable Discord Rich Presence for Cider";
    this.version = "1.0.0";
    this.author = "down-bad (Vasilis#1517)";

    this._settings = {};
    this._prevSettings = {};
    this.init = false;

    this._utils = env.utils;
    this._attributes = undefined;
    this.ready = false;

    this._client = null;
    this.activityCache = {
      details: "",
      state: "",
      largeImageKey: "",
      largeImageText: "",
      smallImageKey: "",
      smallImageText: "",
      instance: false,
    };
  }

  /*******************************************************************************************
   * Public Methods
   * ****************************************************************************************/

  /**
   * Runs on app ready
   */
  onReady(_win) {
    console.log(`[Plugin][${this.name}] Ready.`);

    ipcMain.on("reloadAdvancedRpc", () => {
      console.log(`[Plugin][${this.name}][reload] Reloading ${this.name}.`);
      this._client.clearActivity();
      this._client.destroy();

      this._client
        .endlessLogin({
          clientId: this._settings.appId,
        })
        .then(() => {
          this.ready = true;
          this._utils
            .getWindow()
            .webContents.send("rpcReloaded", this._client.user);
          if (this._activityCache) {
            console.info(
              `[Plugin][${this.name}][reload] Restoring activity cache.`
            );
            this._client.setActivity(this._activityCache);
          }
        })
        .catch((e) => console.error(`[Plugin][${this.name}][reload] ${e}`));
    });
  }

  async onRendererReady(_win) {
    try {
      ipcMain.handle(`plugin.${this.name}.setting`, (_event, settings) => {
        if (!settings) return;
        this._prevSettings = this._settings;
        this._settings = settings;

        if (this._prevSettings.appId === this._settings.appId)
          this.setActivity(this._attributes);

        if (!this.init) {
          this.init = true;
          this.connect();
        }
      });
    } catch {}

    this._env.utils.loadJSFrontend(join(this._env.dir, "index.frontend.js"));
  }

  /**
   * Runs on app stop
   */
  onBeforeQuit() {
    console.debug(`[Plugin][${this.name}] Stopped.`);
  }

  /**
   * Runs on playback State Change
   * @param attributes Music Attributes (attributes.status = current state)
   */
  onPlaybackStateDidChange(attributes) {
    this._attributes = attributes;
    this.setActivity(attributes);
  }

  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  onNowPlayingItemDidChange(attributes) {
    this._attributes = attributes;
    this.setActivity(attributes);
  }

  /*******************************************************************************************
   * Private Methods
   * ****************************************************************************************/

  /**
   * Connect to Discord RPC
   * @private
   */
  connect() {
    // Create the client
    this._client = new AutoClient({ transport: "ipc" });

    // Runs on Ready
    this._client.once("ready", () => {
      console.info(
        `[Plugin][${this.name}][connect] Successfully Connected to Discord. Authed for user: ${this._client.user.id}.`
      );

      if (this._activityCache) {
        console.info(
          `[Plugin][${this.name}][connect] Restoring activity cache.`
        );
        this._client.setActivity(this._activityCache);
      }
    });

    // Login to Discord
    this._client
      .endlessLogin({
        clientId: this._settings.appId,
      })
      .then(() => {
        this.ready = true;
      })
      .catch((e) => console.error(`[Plugin][${this.name}][connect] ${e}`));
  }

  /**
   * Sets the activity
   * @param attributes Music Attributes
   */
  setActivity(attributes) {
    if (!this._client) return;

    if (
      this._utils.getStoreValue("general.discordrpc.enabled") ||
      this._utils.getStoreValue("connectivity.discord_rpc.enabled") ||
      !this._settings.enabled ||
      (this._settings.respectPrivateSession &&
        this._utils.getStoreValue("general.privateEnabled"))
    ) {
      this._client.clearActivity();
      return;
    }

    let activity = {
      instance: false,
    };

    const settings = attributes.status
      ? this._settings.play
      : this._settings.pause;

    activity.details = settings.details;
    activity.state = settings.state;
    activity.largeImageText = settings.largeImageText;

    if (settings.largeImage === "cover") {
      activity.largeImageKey = attributes.artwork?.url
        ?.replace("{w}", "1024")
        .replace("{h}", "1024");
    } else if (settings.largeImage === "custom") {
      activity.largeImageKey = settings.largeImageKey;
    }

    if (settings.smallImage) {
      activity.smallImageKey = settings.smallImageKey;
      activity.smallImageText = settings.smallImageText;
    }

    activity.buttons = [];

    if (
      !attributes.status &&
      this._settings.play.enabled &&
      this._settings.play.buttons &&
      this._settings.pause.enabled &&
      this._settings.pause.buttons &&
      this._settings.pause.usePlayButtons
    ) {
      if (
        this._settings.play.button1.label &&
        this._settings.play.button1.url
      ) {
        activity.buttons.push({
          label: this._settings.play.button1.label,
          url: this._settings.play.button1.url,
        });
      }
      if (
        this._settings.play.button2.label &&
        this._settings.play.button2.url
      ) {
        activity.buttons.push({
          label: this._settings.play.button2.label,
          url: this._settings.play.button2.url,
        });
      }
    } else if (settings.buttons) {
      if (settings.button1.label && settings.button1.url) {
        activity.buttons.push({
          label: settings.button1.label,
          url: settings.button1.url,
        });
      }
      if (settings.button2.label && settings.button2.url) {
        activity.buttons.push({
          label: settings.button2.label,
          url: settings.button2.url,
        });
      }
    }

    // Filter the activity
    activity = this.filterActivity(activity, attributes);

    if (!this.ready) {
      this._activityCache = activity;
      return;
    }

    if (
      (attributes.status && !this._settings.play.enabled) ||
      (!attributes.status && !this._settings.pause.enabled)
    ) {
      this._client.clearActivity();
    } else if (activity && this._activityCache !== activity) {
      this._client.setActivity(activity);
    }
    this._activityCache = activity;
  }

  /**
   * Filter the Discord activity object
   */
  filterActivity(activity, attributes) {
    // Add timestamp
    if (this._settings.play.timestamp !== "disabled" && attributes.status) {
      activity.startTimestamp =
        Date.now() - (attributes.durationInMillis - attributes.remainingTime);
      if (this._settings.play.timestamp === "remaining")
        activity.endTimestamp = attributes.endTime;
    }

    const rpcTextVars = {
        artist: attributes.artistName,
        composer: attributes.composerName,
        title: attributes.name,
        album: attributes.albumName,
        trackNumber: attributes.trackNumber,
      },
      rpcUrlVars = {
        appleMusicUrl: attributes.url.appleMusic,
        ciderUrl: attributes.url.cider,
      };

    // Apply text variables
    Object.keys(rpcTextVars).forEach((key) => {
      if (activity.details?.includes(`{${key}}`)) {
        activity.details = activity.details.replace(
          `{${key}}`,
          rpcTextVars[key]
        );
      }
      if (activity.state?.includes(`{${key}}`)) {
        activity.state = activity.state.replace(`{${key}}`, rpcTextVars[key]);
      }
      if (activity.largeImageText?.includes(`{${key}}`)) {
        activity.largeImageText = activity.largeImageText.replace(
          `{${key}}`,
          rpcTextVars[key]
        );
      }
      if (activity.smallImageText?.includes(`{${key}}`)) {
        activity.smallImageText = activity.smallImageText.replace(
          `{${key}}`,
          rpcTextVars[key]
        );
      }
      if (activity.buttons) {
        if (activity.buttons[0]?.label?.includes(`{${key}}`)) {
          activity.buttons[0].label = activity.buttons[0].label.replace(
            `{${key}}`,
            rpcTextVars[key]
          );
        }
        if (activity.buttons[1]?.label?.includes(`{${key}}`)) {
          activity.buttons[1].label = activity.buttons[1].label.replace(
            `{${key}}`,
            rpcTextVars[key]
          );
        }
      }
    });

    // Apply URL variables
    if (activity.buttons) {
      Object.keys(rpcUrlVars).forEach((key) => {
        if (activity.buttons[0]?.url?.includes(`{${key}}`)) {
          activity.buttons[0].url = activity.buttons[0].url.replace(
            `{${key}}`,
            rpcUrlVars[key]
          );
        }
        if (activity.buttons[1]?.url?.includes(`{${key}}`)) {
          activity.buttons[1].url = activity.buttons[0].url.replace(
            `{${key}}`,
            rpcUrlVars[key]
          );
        }
      });
    }

    // Substring details if needed
    if (activity.details && activity.details.length >= 128) {
      activity.details = activity.details.substring(0, 125) + "...";
    }

    // Substring state if needed
    if (activity.state && activity.state.length >= 128) {
      activity.state = activity.state.substring(0, 125) + "...";
    }

    // Substring large image text if needed
    if (activity.largeImageText && activity.largeImageText.length >= 128) {
      activity.largeImageText =
        activity.largeImageText.substring(0, 125) + "...";
    }

    // Substring small image text if needed
    if (activity.smallImageText && activity.smallImageText.length >= 128) {
      activity.smallImageText =
        activity.smallImageText.substring(0, 125) + "...";
    }

    // Substring button label and URL if needed
    if (activity.buttons) {
      if (
        activity.buttons[0]?.label &&
        activity.buttons[0].label.length >= 30
      ) {
        activity.buttons[0].label = activity.buttons[0].label.substring(0, 30);
      }

      if (
        activity.buttons[1]?.label &&
        activity.buttons[1].label.length >= 30
      ) {
        activity.buttons[1].label = activity.buttons[1].label.substring(0, 30);
      }
    }

    // Remove buttons if their URL is invalid
    if (activity.buttons) {
      if (
        activity.buttons[0]?.url.length > 512 ||
        !this.isValidUrl(activity.buttons[0]?.url)
      ) {
        delete activity.buttons[0];
      }

      if (
        activity.buttons[1]?.url.length > 512 ||
        !this.isValidUrl(activity.buttons[1]?.url)
      ) {
        delete activity.buttons[1];
      }

      activity.buttons = activity.buttons.filter((item) => item);
    }

    // Check large image
    if (
      activity.largeImageKey == null ||
      activity.largeImageKey === "" ||
      activity.largeImageKey.length > 256
    ) {
      delete activity.largeImageKey;
    }

    // Check small image
    if (
      activity.smallImageKey == null ||
      activity.smallImageKey === "" ||
      activity.smallImageKey.length > 256
    ) {
      delete activity.smallImageKey;
    }

    // Timestamp
    if (new Date(attributes.endTime).getTime() < 0) {
      delete activity.startTime;
      delete activity.endTime;
    }

    if (!activity.details) delete activity.details;
    if (!activity.state) delete activity.state;
    if (!activity.largeImageText) delete activity.largeImageText;
    if (activity.largeImageText?.length === 1)
      activity.largeImageText = ` ${activity.largeImageText} `;
    if (!activity.smallImageText) delete activity.smallImageText;
    if (activity.smallImageText?.length === 1)
      activity.smallImageText = ` ${activity.smallImageText} `;
    if (activity.buttons?.length === 0) delete activity.buttons;

    return activity;
  }

  /**
   * Checks if URL is valid
   * @param str URL
   */
  isValidUrl(str) {
    let url;
    try {
      url = new URL(str);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }
};
