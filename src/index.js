const { AutoClient } = require("discord-auto-rpc");
const { ipcMain } = require("electron");
const { join } = require("path");
const fs = require("fs");
const path = require("path");
module.exports = class AdvancedRpcBackend {
  constructor(env) {
    this._env = env;
    this._utils = env.utils;
    this._store = env.utils.getStore();

    this.name = "AdvancedRPC";
    this.description = "Fully customizable Discord Rich Presence for Cider";
    this.version = "[VI]{version}[/VI]";
    this.author = "down-bad (Vasilis#1517)";

    this._client = null;
    this.init = false;
    this.ready = false;

    this._settings = {};
    this._prevSettings = {};
    this._initSettings = false;

    this._attributes = undefined;
    this._prevAttributes = undefined;

    this.updateTime = 0;
    this.startedTime = null;
    this.pauseTime = Date.now();

    this.remoteData = {};
    this.artworks = {};
    this.currentItem = {};

    this.interval = null;
    this.cleared = false;
  }

  onReady(_win) {
    console.log(`[Plugin][${this.name}] Ready.`);
  }

  async onRendererReady(_win) {
    this._env.utils.loadJSFrontend(join(this._env.dir, "index.frontend.js"));

    try {
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.itemChanged`, null);
    } catch {}

    this.startedTime = Date.now();
    this.pauseTime = Date.now();

    // Initialize arpc settings
    try {
      ipcMain.handle(`plugin.${this.name}.initSettings`, (_event, settings) => {
        if (!settings) return;
        this._settings = settings;
        this._prevSettings = settings;
        this._initSettings = true;

        if (!this.init) {
          this.init = true;
          this.connect();
        }
      });
    } catch {}

    // Initialize remote data
    try {
      ipcMain.handle(`plugin.${this.name}.remoteData`, (_event, data) => {
        this.remoteData = data;
      });
    } catch {}

    // Initialize colors.less for themes
    try {
      const filePath = path.join(this._env.dir, "colors.less");
      ipcMain.handle(`plugin.${this.name}.colorsless`, (_event, data) => {
        fs.writeFile(filePath, data, (err) => {
          if (err) console.log(err);
        });
      });
    } catch {}

    // Initialize animated artworks
    try {
      ipcMain.handle(`plugin.${this.name}.artworks`, (_event, artworks) => {
        this.artworks = artworks;
      });
    } catch {}

    // Get current song data from localStorage
    try {
      ipcMain.handle(`plugin.${this.name}.currentItem`, (_event, item) => {
        if (item) this.currentItem = JSON.parse(item);
        else this.currentItem = {};
      });
    } catch {}

    // Handle arpc settings changes
    ipcMain.handle(`plugin.${this.name}.setting`, (_event, settings) => {
      if (!settings || !this._initSettings) return;

      this._settings.applySettings = settings.applySettings;

      console.log(this._prevSettings);

      if (settings.applySettings === "manually") {
        if (JSON.stringify(this._prevSettings) === JSON.stringify(settings))
          this._utils
            .getWindow()
            .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
        else {
          this._utils
            .getWindow()
            .webContents.send(`plugin.${this.name}.unappliedSettings`, true);
        }
      } else {
        this._prevSettings = settings;
        this._settings = settings;
        this.setActivity(this._attributes);
      }
    });

    ipcMain.handle(`plugin.${this.name}.updateSettings`, (_event, settings) => {
      if (!settings) return;

      this._prevSettings = settings;
      this._settings = settings;
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
      this.setActivity(this._attributes);
    });

    ipcMain.handle(`plugin.${this.name}.resetChanges`, (_event) => {
      if (Object.keys(this._prevSettings).length !== 0) {
        this._utils
          .getWindow()
          .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
        this._utils
          .getWindow()
          .webContents.send(
            `plugin.${this.name}.setPrevSettings`,
            this._prevSettings
          );
      } else {
        this._utils
          .getWindow()
          .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
      }
    });
  }

  connect() {
    this._client = new AutoClient({ transport: "ipc" });

    this._client.once("ready", () => {
      console.info(
        `[Plugin][${this.name}] Connected to Discord as ${this._client.user.id}.`
      );

      this.interval = setInterval(() => {
        this.handleActivity(this._attributes, this._prevAttributes);
      }, 500);
    });

    this._client
      .endlessLogin({
        clientId: this._settings.appId,
      })
      .then(() => {
        this.ready = true;
      })
      .catch((e) => console.error(`[Plugin][${this.name}] ${e}`));
  }

  onPlaybackStateDidChange(attributes) {
    this._attributes = attributes;
  }

  onNowPlayingItemDidChange(attributes) {
    this._attributes = attributes;
  }

  playbackTimeDidChange(attributes) {
    this._attributes = attributes;
  }

  handleActivity(attributes, prevAttributes) {
    if (!this.ready) return;

    // Song change
    if (attributes.songId !== prevAttributes?.songId) {
      try {
        this._utils
          .getWindow()
          .webContents.send(`plugin.${this.name}.itemChanged`, null);
      } catch {}

      this.startedTime = Date.now();
      this.pauseTime = Date.now();
      this.cleared = false;
    }

    if (
      attributes.kind === "song" &&
      !attributes.songId.startsWith("i.") &&
      this.currentItem?._songId !== attributes.songId
    )
      return;

    // Pause
    if (attributes.status !== prevAttributes?.status && !attributes.status) {
      this.updateTime += 2000;
      // Don't go above 5 seconds
      if (this.updateTime > Date.now() + 5000)
        this.updateTime = Date.now() + 5000;

      this.pauseTime = Date.now();
      this.cleared = false;
    }

    // Unpause
    if (attributes.status !== prevAttributes?.status && attributes.status) {
      this.updateTime -= 2000;
      this.startedTime = Date.now() - (this.pauseTime - this.startedTime);
      this.cleared = false;
    }

    if (this.cleared) return;

    let removePause = this._settings.removePause;
    if (removePause < 0) removePause = 0;
    if (removePause % 1 !== 0) removePause = Math.round(removePause);

    if (
      removePause > 0 &&
      !attributes.status &&
      this.pauseTime + removePause * 1000 < Date.now()
    ) {
      this._client.clearActivity();
      this.cleared = true;
      return;
    }

    // Update activity
    if (this.updateTime + 5000 < Date.now()) {
      this.setActivity(attributes);
      this.updateTime = Date.now();
    }

    this._prevAttributes = attributes;
  }

  setActivity(attributes) {
    if (this._settings.applySettings === "immediately") {
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.unappliedSettings`, false);
    }

    if (!this._client || !attributes) return;

    if (
      this._utils.getStoreValue("connectivity.discord_rpc.enabled") ||
      !this._settings.enabled ||
      (this._settings.respectPrivateSession &&
        this._utils.getStoreValue("general.privateEnabled")) ||
      attributes.playParams?.id === "no-id-found"
    ) {
      this._client.clearActivity();
      this.cleared = true;
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

    const fallbackImage = this._settings.play.fallbackImage;

    activity.details = settings.details;
    activity.state = settings.state;
    activity.largeImageText = settings.largeImageText;

    // Set image size
    let imageSize = this._settings.imageSize;
    if (imageSize < 1) imageSize = 1024;
    if (imageSize % 1 !== 0) imageSize = Math.round(imageSize);

    // Set large image
    if (settings.largeImage.startsWith("cover")) {
      activity.largeImageKey = this.setImage(
        attributes,
        settings,
        fallbackImage,
        imageSize
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
        fallbackImage,
        imageSize
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

    activity = this.filterActivity(activity, attributes);

    if (
      (attributes.status && !settings.enabled) ||
      (!attributes.status && !settings.enabled)
    ) {
      this._client.clearActivity();
      this.cleared = true;
    } else if (activity && this._activityCache !== activity) {
      this._client.setActivity(activity);
      this.updateTime = Date.now();
    }
  }

  filterActivity(activity, attributes) {
    let rpcTextVars = {
        artist: attributes.artistName ?? "",
        composer: attributes.composerName ?? "",
        title: attributes.name ?? "",
        album: attributes.albumName ?? "",
        trackNumber: attributes.trackNumber ?? "",
        trackCount: this.currentItem?._assets?.[0]?.metadata?.trackCount ?? "",
        year: this.currentItem?._assets?.[0]?.metadata?.year ?? "",
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

      if (rpcUrlVars["appleMusicUrl"].includes("/song/ra."))
        rpcUrlVars["appleMusicUrl"] = rpcUrlVars["radioUrl"];
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
      if (rpcUrlVars["appleMusicUrl"].includes("/song/-1"))
        rpcUrlVars["appleMusicUrl"] = "";

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

  isValidUrl(str) {
    let url;
    try {
      url = new URL(str);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }

  setImage(attributes, settings, fallbackImage, imageSize) {
    if (
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
          ?.replace("{w}", imageSize ?? 1024)
          .replace("{h}", imageSize ?? 1024) ?? fallbackImage
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

  frontendLog(message) {
    try {
      this._utils
        .getWindow()
        .webContents.send(`plugin.${this.name}.consoleLog`, message);
    } catch {}
  }
};
