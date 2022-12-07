const { AutoClient } = require("discord-auto-rpc");
const { ipcMain } = require("electron");
const { join } = require("path");
const axios = require("axios");

module.exports = class AdvancedRpcBackend {
  constructor(env) {
    this._env = env;
    this._store = env.utils.getStore();

    this.name = "AdvancedRPC";
    this.description = "Fully customizable Discord Rich Presence for Cider";
    this.version = "[VI]{version}[/VI]";
    this.author = "down-bad (Vasilis#1517)";

    this._settings = {};
    this._prevSettings = {};
    this._initSettings = {};
    this._nextSettings = {};
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
    this.startedTime = null;
    this.updateTime = 0;
    this.updatedAfterPause = false;

    this.coverImage = {
      id: null,
      url: null,
    };

    this.remoteData = {};
    this.artworks = {};
    this.currentItem = {};
  }

  /*******************************************************************************************
   * Public Methods
   * ****************************************************************************************/

  /**
   * Runs on app ready
   */
  onReady(_win) {
    console.log(`[Plugin][${this.name}] Ready.`);
  }

  async onRendererReady(_win) {
    try {
      ipcMain.handle(`plugin.${this.name}.initSettings`, (_event, settings) => {
        if (!settings) return;
        this._prevSettings = this._settings;
        this._settings = settings;

        if (!this.init) {
          this.init = true;
          this.connect();
        }
      });

      ipcMain.handle(`plugin.${this.name}.setting`, (_event, settings) => {
        if (!settings) return;

        this._settings.applySettings = settings.applySettings;

        if (Object.keys(this._initSettings).length === 0)
          this._initSettings = this._settings;
        else this._initSettings.applySettings = this._settings.applySettings;

        if (
          settings.applySettings === "manually" ||
          settings.applySettings === "state"
        ) {
          if (JSON.stringify(this._initSettings) === JSON.stringify(settings))
            this._utils
              .getWindow()
              .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
          else
            this._utils
              .getWindow()
              .webContents.send(`plugin.${this.name}.unappliedSettings`, true);

          if (settings.applySettings === "state") {
            this._prevSettings = this._settings;
            this._nextSettings = settings;
          }
        } else {
          this._prevSettings = this._settings;
          this._settings = settings;

          if (this._prevSettings.appId === this._settings.appId)
            this.setActivity(this._attributes);
        }

        if (!this.init) {
          this.init = true;
          this.connect();
        }
      });

      ipcMain.handle(`plugin.${this.name}.resetChanges`, (_event) => {
        if (Object.keys(this._initSettings).length !== 0) {
          this._utils
            .getWindow()
            .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
          this._utils
            .getWindow()
            .webContents.send(
              `plugin.${this.name}.setPrevSettings`,
              this._initSettings
            );
        }
      });

      ipcMain.handle(
        `plugin.${this.name}.updateSettings`,
        (_event, settings) => {
          if (!settings) return;
          this._prevSettings = this._settings;
          this._settings = settings;
          this._initSettings = {};
          this._utils
            .getWindow()
            .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
          this.setActivity(this._attributes);
        }
      );

      ipcMain.on("discordrpc:updateImage", async (_event, artworkUrl) => {
        if (
          !this.remoteData?.icloudArtworks ||
          this._utils.getStoreValue("connectivity.discord_rpc.enabled") ||
          this._attributes?.artwork?.url
        )
          return;

        const res = await axios.post(
          "https://api.cider.sh/v1/images",
          { url: artworkUrl },
          {
            headers: {
              "User-Agent": this._utils.getWindow().webContents.getUserAgent(),
              url: artworkUrl,
            },
          }
        );

        this.coverImage.id = this._attributes?.songId;
        this.coverImage.url = `https://images.weserv.nl/?url=${
          res?.data?.imageUrl
        }&w=${this._settings.imageSize ?? 1024}&h=${
          this._settings.imageSize ?? 1024
        }&output=jpg&fit=cover`;

        this.setActivity(this._attributes);
      });
    } catch {}

    try {
      ipcMain.handle(`plugin.${this.name}.remoteData`, (_event, data) => {
        this.remoteData = data;
      });
    } catch {}

    try {
      ipcMain.handle(`plugin.${this.name}.artworks`, (_event, artworks) => {
        this.artworks = artworks;
      });
    } catch {}

    try {
      ipcMain.handle(`plugin.${this.name}.currentItem`, (_event, item) => {
        this.currentItem = JSON.parse(item);
      });
    } catch {}

    this._env.utils.loadJSFrontend(join(this._env.dir, "index.frontend.js"));
    this._env.utils.loadJSFrontend(join(this._env.dir, "frontend-vue.js"));
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
    if (attributes.kind !== "song") {
      try {
        this._utils
          .getWindow()
          .webContents.send(`plugin.${this.name}.itemChanged`, null);
      } catch {}
    }

    if (
      Object.keys(this._nextSettings).length !== 0 &&
      this._settings.applySettings === "state"
    ) {
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
      this._settings = this._nextSettings;
      this._nextSettings = {};
      this._initSettings = {};
    }

    this.startedTime = Date.now();
    this.setActivity(attributes);
  }

  /**
   * Runs on song change
   * @param attributes Music Attributes
   */
  onNowPlayingItemDidChange(attributes) {
    try {
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.itemChanged`, null);
    } catch {}

    if (
      Object.keys(this._nextSettings).length !== 0 &&
      this._settings.applySettings === "state"
    ) {
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
      this._settings = this._nextSettings;
      this._nextSettings = {};
      this._initSettings = {};
    }

    this.startedTime = Date.now();
    this.setActivity(attributes);
  }

  /**
   * Runs on playback time change
   * @param attributes Music Attributes
   */
  playbackTimeDidChange(attributes) {
    if (
      (this.updateTime + 5000 < Date.now() &&
        attributes.endTime - 5000 > Date.now()) ||
      attributes.kind === "radioStation"
    ) {
      if (attributes.kind !== "song") {
        try {
          this._utils
            .getWindow()
            .webContents.send(`plugin.${this.name}.itemChanged`, null);
        } catch {}
      }

      this.setActivity(attributes);
    }
  }

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
    this._attributes = attributes;

    if (this._settings.applySettings === "immediately") {
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
      this._initSettings = {};
    }

    if (!this._client || !attributes) return;

    if (
      attributes.kind === "song" &&
      this.currentItem?._songId !== attributes.songId &&
      this.currentItem?.id !== attributes.songId
    ) {
      return setTimeout(() => {
        try {
          this._utils
            .getWindow()
            .webContents.send(`plugin.${this.name}.itemChanged`, null);
        } catch {}
        if (this.updateTime + 5000 < Date.now()) {
          this.setActivity(attributes);
        }
      }, 3000);
    }

    if (
      this._utils.getStoreValue("connectivity.discord_rpc.enabled") ||
      !this._settings.enabled ||
      (this._settings.respectPrivateSession &&
        this._utils.getStoreValue("general.privateEnabled")) ||
      attributes.playParams?.id === "no-id-found"
    ) {
      this._client.clearActivity();
      return;
    }

    let activity = {
      instance: false,
    };

    let settings;
    if (
      attributes.kind === "radioStation" &&
      !this._settings.radio.usePlayConfig
    ) {
      settings = this._settings.radio;
    } else if (
      attributes.kind === "podcast-episodes" &&
      attributes.status &&
      !this._settings.podcasts.play.usePlayConfig
    ) {
      settings = this._settings.podcasts.play;
    } else if (
      attributes.kind === "podcast-episodes" &&
      !attributes.status &&
      !this._settings.podcasts.pause.usePauseConfig
    ) {
      settings = this._settings.podcasts.pause;
    } else if (
      (attributes.kind === "musicVideo" ||
        attributes.kind === "uploadedVideo") &&
      attributes.status &&
      !this._settings.videos.play.usePlayConfig
    ) {
      settings = this._settings.videos.play;
    } else if (
      (attributes.kind === "musicVideo" ||
        attributes.kind === "uploadedVideo") &&
      !attributes.status &&
      !this._settings.videos.pause.usePauseConfig
    ) {
      settings = this._settings.videos.pause;
    } else {
      settings = attributes.status ? this._settings.play : this._settings.pause;
    }

    const fallbackImage = attributes.status
      ? this._settings.play.fallbackImage
      : this._settings.pause.fallbackImage;

    activity.details = settings.details;
    activity.state = settings.state;
    activity.largeImageText = settings.largeImageText;

    // Set image size
    if (this._settings.imageSize < 1) this._settings.imageSize = 1024;

    // Set large image
    if (settings.largeImage.startsWith("cover")) {
      activity.largeImageKey = this.setImage(
        attributes,
        settings,
        fallbackImage
      );

      if (
        activity.largeImageKey !== fallbackImage &&
        !this.isValidUrl(activity.largeImageKey)
      )
        activity.largeImageKey = fallbackImage;
    } else if (settings.largeImage === "custom") {
      activity.largeImageKey = settings.largeImageKey;
    }

    // Set small image
    activity.smallImageText = settings.smallImageText;
    if (settings.smallImage.startsWith("cover")) {
      activity.smallImageKey = this.setImage(
        attributes,
        settings,
        fallbackImage
      );

      if (
        activity.smallImageKey !== fallbackImage &&
        !this.isValidUrl(activity.smallImageKey)
      )
        activity.smallImageKey = fallbackImage;
    } else if (settings.smallImage === "custom") {
      activity.smallImageKey = settings.smallImageKey;
    }

    // Buttons
    activity.buttons = [];

    if (attributes.kind === "podcast-episodes") {
      if (
        this._settings.podcasts.pause.enabled &&
        !this._settings.podcasts.pause.usePauseConfig &&
        this._settings.podcasts.pause.buttons &&
        this._settings.podcasts.pause.usePlayButtons &&
        !attributes.status
      ) {
        this.setButtons(
          this._settings.podcasts.play.button1,
          this._settings.podcasts.play.button2,
          activity
        );
      } else if (
        this._settings.podcasts.pause.enabled &&
        this._settings.podcasts.pause.usePauseConfig &&
        this._settings.pause.buttons &&
        this._settings.pause.usePlayButtons &&
        !attributes.status
      ) {
        this.setButtons(
          this._settings.play.button1,
          this._settings.play.button2,
          activity
        );
      } else if (settings.buttons) {
        this.setButtons(settings.button1, settings.button2, activity);
      }
    } else if (
      attributes.kind === "musicVideo" ||
      attributes.kind === "uploadedVideo"
    ) {
      if (
        this._settings.videos.pause.enabled &&
        !this._settings.videos.pause.usePauseConfig &&
        this._settings.videos.pause.buttons &&
        this._settings.videos.pause.usePlayButtons &&
        !attributes.status
      ) {
        this.setButtons(
          this._settings.videos.play.button1,
          this._settings.videos.play.button2,
          activity
        );
      } else if (
        this._settings.videos.pause.enabled &&
        this._settings.videos.pause.usePauseConfig &&
        this._settings.pause.buttons &&
        this._settings.pause.usePlayButtons &&
        !attributes.status
      ) {
        this.setButtons(
          this._settings.play.button1,
          this._settings.play.button2,
          activity
        );
      } else if (settings.buttons) {
        this.setButtons(settings.button1, settings.button2, activity);
      }
    } else if (
      (this._settings.pause.enabled &&
        this._settings.pause.buttons &&
        this._settings.pause.usePlayButtons &&
        !attributes.status) ||
      (this._settings.radio.enabled &&
        !this._settings.radio.usePlayConfig &&
        this._settings.radio.buttons &&
        this._settings.radio.usePlayButtons &&
        attributes.kind === "radioStation")
    ) {
      this.setButtons(
        this._settings.play.button1,
        this._settings.play.button2,
        activity
      );
    } else if (settings.buttons) {
      this.setButtons(settings.button1, settings.button2, activity);
    }

    // Set timestamps
    if (attributes.status) {
      if (settings.timestamp !== "disabled") {
        activity.startTimestamp = this.startedTime ?? Date.now();

        if (
          settings.timestamp === "remaining" &&
          attributes.kind !== "radioStation"
        )
          activity.endTimestamp = attributes.endTime;
      }
    }

    // Filter the activity
    activity = this.filterActivity(activity, attributes);

    if (!this.ready) {
      this._activityCache = activity;
      return;
    }

    if (
      (attributes.status && !settings.enabled) ||
      (!attributes.status && !settings.enabled)
    ) {
      this._client.clearActivity();
    } else if (activity && this._activityCache !== activity) {
      this._client.setActivity(activity);
    }
    this._activityCache = activity;
    this.updateTime = Date.now();
  }

  /**
   * Filter the Discord activity object
   */
  filterActivity(activity, attributes) {
    let rpcTextVars = {
        artist: attributes.artistName ?? "",
        composer: attributes.composerName ?? "",
        title: attributes.name ?? "",
        album: attributes.albumName ?? "",
        trackNumber: attributes.trackNumber ?? "",
        trackCount: this.currentItem?._assets?.[0]?.metadata?.trackCount ?? "",
        year: this.currentItem?._assets?.[0]?.metadata?.trackCount ?? "",
        genre: this.currentItem?._assets?.[0]?.metadata?.genre ?? "",
        songId: attributes.songId ?? "",
        albumId: this.currentItem?._assets?.[0]?.metadata?.playlistId ?? "",
        artistId: this.currentItem?._assets?.[0]?.metadata?.artistId ?? "",
      },
      rpcUrlVars = {
        appleMusicUrl: `${attributes.url.appleMusic}?src=arpc`,
        ciderUrl: `${attributes.url.cider}?src=arpc`,
        songlinkUrl: `https://song.link/i/${rpcTextVars["songId"]}?src=arpc`,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(
          rpcTextVars["artist"] + " - " + rpcTextVars["title"]
        )}?src=arpc`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          rpcTextVars["artist"] + " - " + rpcTextVars["title"]
        )}&src=arpc`,
        youtubeMusicUrl: `https://music.youtube.com/search?q=${encodeURIComponent(
          rpcTextVars["artist"] + " - " + rpcTextVars["title"]
        )}&src=arpc`,
        albumUrl: rpcTextVars["albumId"]
          ? `https://music.apple.com/album/${rpcTextVars["albumId"]}?src=arpc`
          : "",
        artistUrl: rpcTextVars["artistId"]
          ? `https://music.apple.com/artist/${rpcTextVars["artistId"]}?src=arpc`
          : "",
      };

    if (attributes.kind === "radioStation") {
      rpcTextVars["radioName"] = attributes.editorialNotes?.name ?? "";
      rpcTextVars["radioTagline"] = attributes.editorialNotes?.tagline ?? "";
      rpcUrlVars[
        "radioUrl"
      ] = `https://music.apple.com/station/${rpcTextVars["songId"]}?src=arpc`;
    }

    if (attributes.kind === "podcast-episodes") {
      rpcTextVars["episodeNumber"] = attributes.episodeNumber ?? "";
      rpcUrlVars["assetUrl"] = attributes.assetUrl ?? "";
      rpcUrlVars["applePodcastsUrl"] = this.currentItem?.attributes?.url ?? "";
      rpcUrlVars["websiteUrl"] = this.currentItem?.attributes?.websiteUrl ?? "";
    }

    if (attributes.kind === "musicVideo")
      rpcUrlVars["appleMusicUrl"] = rpcUrlVars["appleMusicUrl"].replace(
        "song",
        "music-video"
      );
    else if (attributes.kind === "uploadedVideo")
      rpcUrlVars["appleMusicUrl"] = rpcUrlVars["appleMusicUrl"].replace(
        "song",
        "post"
      );

    if (this._settings.removeInvalidButtons) {
      if (attributes.songId.startsWith("i.") || attributes.songId === "-1") {
        rpcUrlVars["appleMusicUrl"] = "";
        rpcUrlVars["ciderUrl"] = "";
        rpcUrlVars["songlinkUrl"] = "";
      }

      if (attributes.kind === "podcast-episodes") {
        rpcUrlVars["appleMusicUrl"] = "";
        rpcUrlVars["ciderUrl"] = "";
        rpcUrlVars["songlinkUrl"] = "";
      }

      if (
        attributes.kind === "musicVideo" ||
        attributes.kind === "uploadedVideo"
      ) {
        rpcUrlVars["ciderUrl"] = "";
        rpcUrlVars["songlinkUrl"] = "";
      }
    }

    // Create uppercase and lowercase variables
    for (const [key, value] of Object.entries(rpcTextVars)) {
      if (typeof value === "string") {
        rpcTextVars[`${key}^`] = value.toUpperCase();
        rpcTextVars[`${key}*`] = value.toLowerCase();
      }
    }

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
        if (activity.buttons[0]?.url?.includes(`{${key}}`)) {
          activity.buttons[0].url = activity.buttons[0].url.replace(
            `{${key}}`,
            encodeURIComponent(rpcTextVars[key])
          );
        }
        if (activity.buttons[1]?.label?.includes(`{${key}}`)) {
          activity.buttons[1].label = activity.buttons[1].label.replace(
            `{${key}}`,
            rpcTextVars[key]
          );
        }
        if (activity.buttons[1]?.url?.includes(`{${key}}`)) {
          activity.buttons[1].url = activity.buttons[1].url.replace(
            `{${key}}`,
            encodeURIComponent(rpcTextVars[key])
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
          activity.buttons[1].url = activity.buttons[1].url.replace(
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
    if (activity.details?.length === 1) activity.details += " ";
    if (!activity.state) delete activity.state;
    if (activity.state?.length === 1) activity.state += " ";
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

  setImage(attributes, settings, fallbackImage) {
    if (this.coverImage.id === attributes.songId && this.coverImage.url) {
      return this.coverImage.url;
    } else if (
      attributes.kind === "song" &&
      settings.largeImage === "cover" &&
      this.remoteData?.animatedArtworks &&
      this.artworks &&
      this.currentItem?._songId === attributes.songId &&
      this.artworks[this.currentItem?._assets?.[0]?.metadata?.playlistId]
    ) {
      return this.artworks[this.currentItem._assets[0].metadata.playlistId];
    } else {
      return (
        attributes.artwork?.url
          ?.replace("{w}", this._settings.imageSize ?? 1024)
          .replace("{h}", this._settings.imageSize ?? 1024) ?? fallbackImage
      );
    }
  }

  setButtons(button1, button2, activity) {
    if (button1.label && button1.url) {
      activity.buttons.push({
        label: button1.label,
        url: button1.url,
      });
    }
    if (button2.label && button2.url) {
      activity.buttons.push({
        label: button2.label,
        url: button2.url,
      });
    }
  }
};
