export default Vue.component("plugin.advancedrpc", {
  template: `
<div class="advancedrpc">
  <Transition name="arpc-modal">
    <arpc-changelog
      v-if="modal === 'changelog'"
      @close-changelog="setModal('')"
    />

    <arpc-variables-modal
      v-if="modal === 'variables'"
      @close-variables="setModal('')"
    />

    <arpc-confirm-modal
      v-if="modal === 'reset-settings'"
      title="Reset Settings"
      description="This will reset your AdvancedRPC configuration to default. Are you sure you want to continue?"
      @confirm="resetSettings()"
      @close-modal="setModal('')"
    />

    <arpc-custom-modal
      v-if="modal?.startsWith('custom-')"
      :modal="modal"
      :modalData="remoteData?.modals?.find((m) => m.id === modal)"
      @do-action="doAction"
    />

    <arpc-artwork-request
      v-if="modal === 'artwork-request'"
      @close-modal="setModal('')"
    />
  </Transition>

  <Transition name="arpc-fade">
    <div class="arpc-modal-backdrop" v-if="modal"></div
  ></Transition>

  <div class="arpc-page">
    <Transition name="arpc-slide">
      <div class="arpc-unapplied-settings-alert" v-show="unappliedSettings">
        <div
          @click="clickingEe('unappliedTextEe')"
          class="arpc-unapplied-settings-content"
          :style="settingsStyle"
        >
          <div>Apply your changes to update your Discord presence.</div>
          <div class="arpc-unapplied-settings-options">
            <button
              class="arpc-button arpc-button-underline"
              @click="resetChanges()"
            >
              Reset
            </button>
            <button
              class="arpc-button arpc-button-green"
              @click="updateSettings()"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div></Transition
    >

    <div class="arpc-settings" :style="settingsStyle">
      <arpc-sidebar
        :installedVersion="installedVersion"
        :versionData="versionData"
        :versionInfo="versionInfo"
        :remoteData="remoteData"
        :frontend="frontend"
        @do-action="doAction"
        @click-ee="clickingEe"
        :style="sidebarScaleStyle"
      ></arpc-sidebar>

      <div class="arpc-content">
        <!-- <Transition name="arpc-settings-slide">
          <div
            class="arpc-bubbles-bar arpc-expandable"
            @click="toggleBubbles()"
            v-if="bubbles.length > 0 || ($root.cfg.general.privateEnabled && settings.respectPrivateSession) || app.cfg.connectivity.discord_rpc.enabled"
          >
            <div
              class="arpc-bubbles-count"
              :style="{'opacity': frontend.bubblesExpanded ? 0 : 1}"
            >
              <div v-if="bubbles.length === 1">{{ bubbles.length }} notice</div>
              <div v-else>{{ bubbles.length }} notices</div>
            </div>
            <arpc-expand-button
              :expanded="frontend.bubblesExpanded"
            ></arpc-expand-button></div
        ></Transition> -->

        <Transition name="arpc-settings-slide">
          <arpc-bubble
            v-if="$root.cfg.general.privateEnabled && settings.respectPrivateSession"
            v-bind="privateSessionBubble"
          ></arpc-bubble>
        </Transition>

        <Transition name="arpc-settings-slide">
          <arpc-bubble
            v-if="app.cfg.connectivity.discord_rpc.enabled"
            v-bind="ciderRpcBubble"
          ></arpc-bubble
        ></Transition>

        <Transition name="arpc-settings-slide">
          <arpc-bubble
            v-if="!remoteData"
            v-bind="noConnectionBubble"
          ></arpc-bubble
        ></Transition>

        <arpc-bubble
          v-for="bubble in remoteData?.bubbles"
          v-if="bubble?.enabled"
          v-bind="bubble"
          @do-action="doAction"
        ></arpc-bubble>

        <!-- General -->
        <arpc-general
          v-show="frontend.sidebar === 'general'"
          :data="[settings.play, settings.pause, settings.enabled, frontend.pageStates.general, remoteData?.flags]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @do-action="doAction"
        />

        <!-- Podcasts -->
        <arpc-podcasts
          v-show="frontend.sidebar === 'podcasts'"
          :data="[settings.podcasts, settings.enabled, frontend.pageStates.podcasts, remoteData?.flags]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @do-action="doAction"
        />

        <!-- Videos -->
        <arpc-videos
          v-show="frontend.sidebar === 'videos'"
          :data="[settings.videos, settings.enabled, frontend.pageStates.videos, remoteData?.flags]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @do-action="doAction"
        />

        <!-- Radio -->
        <arpc-radio
          v-show="frontend.sidebar === 'radio'"
          :data="[settings.radio, settings.enabled, remoteData?.flags]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @do-action="doAction"
        />

        <!-- Settings -->
        <div v-show="frontend.sidebar === 'settings'">
          <div class="arpc-settings-header">
            <h2 @click="clickingEe('settingsClickEe')">Settings</h2>
            <arpc-exit-button
              v-if="remoteData?.flags?.exitButton"
            ></arpc-exit-button>
          </div>

          <div class="arpc-option-container">
            <div :disabled="app.cfg.connectivity.discord_rpc.enabled">
              <div class="arpc-option">
                <div class="arpc-option-segment">Enable AdvancedRPC</div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      @click="clickingEe('enableArpcSwitchEe')"
                      type="checkbox"
                      v-model="settings.enabled"
                      switch
                    />
                  </label>
                </div>
              </div>
            </div>

            <div class="arpc-label">PRESENCE</div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Application ID
                <small
                  >Create your own on
                  <a
                    href="https://discord.com/developers/applications"
                    target="_blank"
                    >Discord Developer Portal</a
                  >.<br />Restart to apply.
                </small>
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.appId" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Respect Private Session
                <small
                  >Hides your presence while Private Session is enabled.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.respectPrivateSession"
                    switch
                  />
                </label>
              </div>
            </div>

            <div
              v-if="remoteData?.icloudArtworks?.setting"
              :disabled="remoteData?.icloudArtworks?.settingDisabled"
              class="arpc-option"
            >
              <div class="arpc-option-segment">
                <div class="arpc-option-with-badge">
                  <div v-if="remoteData?.icloudArtworks?.settingTitle">
                    {{ remoteData?.icloudArtworks?.settingTitle }}
                  </div>
                  <div v-else>iCloud Music Artworks</div>
                  <div
                    v-if="remoteData?.badges?.icloud?.text"
                    :style="{background: remoteData?.badges?.icloud?.color, color: remoteData?.badges?.icloud?.textColor}"
                    class="arpc-badge"
                  >
                    {{ remoteData?.badges?.icloud?.text }}
                  </div>
                </div>
                <small v-if="remoteData?.icloudArtworks?.settingDesc">
                  {{ remoteData?.icloudArtworks?.settingDesc }}
                </small>
                <small v-else
                  >Show the artworks of the songs uploaded to your iCloud Music
                  Library.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    v-if="remoteData?.icloudArtworks?.settingDisabled && remoteData?.icloudArtworks?.forceOn"
                    type="checkbox"
                    checked
                    switch
                  />
                  <input
                    v-else-if="remoteData?.icloudArtworks?.settingDisabled"
                    type="checkbox"
                    switch
                  />
                  <input
                    v-else
                    type="checkbox"
                    v-model="settings.icloudArtworks"
                    switch
                  />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Auto Clear Paused Presence
                <small
                  >Clears your presence after the specified amount of seconds
                  has passed while paused.<br />Set to 0 to disable.
                </small>
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="number"
                    v-model="settings.removePause"
                    placeholder="0"
                    min="0"
                  />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Fallback Image
                <small
                  >Set a custom image to be shown when the artwork doesn't exist
                  or hasn't loaded yet.<br />Max 256 characters</small
                >
              </div>
              <!-- <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              > -->
              <div class="arpc-option-segment arpc-option-segment_auto">
                <!-- <label>Play</label> -->
                <input type="text" v-model="settings.play.fallbackImage" />
              </div>
              <!-- <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label>Pause</label>
                <input type="text" v-model="settings.pause.fallbackImage" />
              </div> -->
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Artwork Image Size
                <small
                  >Changes the width and height of the artwork when used in the
                  presence. Larger values might cause the artwork to take longer
                  to load for others. Does not apply for animated
                  artwork.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="number"
                    v-model="settings.imageSize"
                    placeholder="1024"
                    min="1"
                  />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Remove Invalid Buttons
                <small
                  >Removes potentially invalid buttons, such as Apple Music
                  buttons for iCloud songs or song.link buttons for
                  podcasts.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.removeInvalidButtons"
                    switch
                  />
                </label>
              </div>
            </div>

            <div class="arpc-label">ADVANCEDRPC</div>

            <div class="arpc-option" v-if="remoteData?.flags?.autoUpdateOption">
              <div class="arpc-option-segment">
                Auto Update
                <small
                  >Automatically update AdvancedRPC when a new version is
                  available.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="checkbox" v-model="frontend.autoUpdate" switch />
                </label>
              </div>
            </div>

            <div v-if="themes && themes.length > 0" class="arpc-option">
              <div
                class="arpc-option-segment"
                :class="{ 'arpc-rumble' : remoteData?.themeClickEe?.id && !frontend[remoteData?.themeClickEe?.id + 'Theme'] }"
                @click="clickingEe('themeClickEe')"
              >
                <div class="arpc-option-with-badge">
                  Theme
                  <div
                    v-if="remoteData?.badges?.themes?.text"
                    :style="{background: remoteData?.badges?.themes?.color, color: remoteData?.badges?.themes?.textColor}"
                    class="arpc-badge"
                  >
                    {{ remoteData?.badges?.themes?.text }}
                  </div>
                </div>
                <small
                  v-if="themes.find(t => t.id === frontend.theme)?.description"
                >
                  {{ themes.find(t => t.id === frontend.theme).description }}
                </small>
              </div>

              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <select
                    v-if="remoteData?.flags?.categorizedThemes"
                    class="arpc-select"
                    v-model="frontend.theme"
                  >
                    <option value="" disabled hidden>Select Theme</option>
                    <optgroup
                      v-for="(themes, key) in filteredCategorizedThemes"
                      :label="key"
                      v-if="themes.length > 0"
                    >
                      <option v-for="theme in themes" :value="theme.id">
                        {{ theme.name }}
                      </option>
                    </optgroup>
                  </select>

                  <select v-else class="arpc-select" v-model="frontend.theme">
                    <option value="" disabled hidden>Select Theme</option>
                    <option v-for="theme in themes" :value="theme.id">
                      {{ theme.name }}
                    </option>
                  </select>
                </label>
              </div>
            </div>

            <div v-if="remoteData?.flags?.scaleSetting" class="arpc-option">
              <div class="arpc-option-segment">Scale</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <select class="arpc-select" v-model="frontend.scale">
                    <option value="" disabled hidden>Scale</option>
                    <option value="75">75%</option>
                    <option value="80">80%</option>
                    <option value="85">85%</option>
                    <option value="90">90%</option>
                    <option value="95">95%</option>
                    <option value="100">100%</option>
                    <option value="105">105%</option>
                    <option value="110">110%</option>
                    <option value="115">115%</option>
                    <option value="120">120%</option>
                    <option value="125">125%</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Reset Configuration to Default
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <button
                  class="arpc-button arpc-button-red"
                  @click="setModal('reset-settings')"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- About -->
        <div v-show="frontend.sidebar === 'about'">
          <h2>About</h2>
        </div>
      </div>
    </div>
  </div>
</div>

  `,
  data: () => ({
    settings: {
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
    },
    installedVersion: AdvancedRpc.installedVersion,
    unappliedSettings: AdvancedRpc.unappliedSettings,
    versionInfo: "[VI]ARPC {version} - {date}[/VI]",
    textVariables: "{artist}, {composer}, {title}, {album}, {trackNumber}",
    urlVariables: "{appleMusicUrl}, {ciderUrl}",
    variableStyles: "{variable^} for uppercase, {variable*} for lowercase",
    modal: "",
    privateSessionBubble: {
      enabled: true,
      message:
        "Private Session is currently enabled, your Discord presence won't be displayed.",
      color: "#00AFF4",
      icon: "info",
    },
    ciderRpcBubble: {
      enabled: true,
      message: `Please disable Cider's Discord Rich Presence in ${app.getLz(
        "term.settings"
      )} > ${app.getLz("settings.header.connectivity")} and restart the app.`,
      color: "#FAA81A",
      icon: "warning",
    },
    noConnectionBubble: {
      enabled: true,
      title: "Huston, we have a problem.",
      message:
        "Unable to establish a connection to the AdvancedRPC server. Some features may be unavailable. Please check your internet connection, or try again later.",
      color: "#F04747",
      icon: "",
    },
    frontend: {
      sidebar: "general",
      theme: "dark",
      bubblesExpanded: true,
      scale: "100",
      autoUpdate: true,
      pageStates: {
        general: "play",
        videos: "play",
        podcasts: "play",
      },
    },
    themes: [],
    filteredCategorizedThemes: {},
    settingsStyle: {
      zoom: "100%",
    },
  }),
  computed: {
    remoteData() {
      const data = Vue.observable(window.AdvancedRpc).remoteData;
      if (data?.themes) this.themes = Object.values(data.themes).flat();
      this.setTheme(this.frontend.theme, data);
      return data;
    },
    versionData() {
      return Vue.observable(window.AdvancedRpc).versionData;
    },
    sidebarScaleStyle() {
      const scaleToHeightMap =
        app?.cfg?.visual?.directives?.windowLayout === "twopanel"
          ? {
              75: "97.5",
              80: "98",
              85: "98.5",
              90: "99",
              95: "99.5",
              105: "100.5",
              110: "101.5",
              115: "102",
              120: "102.5",
              125: "103",
            }
          : null;

      const scaleToPaddingMap = {
        75: "27.5",
        80: "25",
        85: "22.5",
        90: "20",
        95: "17.5",
        105: "12.5",
        110: "10",
        115: "7.5",
        120: "5",
        125: "2.5",
      };

      const scale = this.frontend.scale;
      const heightValue = scaleToHeightMap?.[scale] || "100";
      const paddingValue = scaleToPaddingMap[scale] || "15";

      return `
      height: calc(${heightValue}% - var(--chromeHeight2));
      padding-top: calc(var(--chromeHeight1) + ${paddingValue}px);
      `;
    },
  },
  watch: {
    settings: {
      handler() {
        if (this.settings["removePause"] < 0) this.settings["removePause"] = 0;
        if (this.settings["imageSize"] < 0) this.settings["imageSize"] = 1;

        AdvancedRpc.setSettings(this.settings);
        ipcRenderer.invoke(
          `plugin.${AdvancedRpc.PLUGIN_NAME}.setting`,
          this.settings
        );
      },
      deep: true,
    },
    frontend: {
      handler() {
        AdvancedRpc.setFrontendData(this.frontend);
        this.setTheme(this.frontend.theme, this.remoteData);
        this.settingsStyle.zoom = `${this.frontend.scale}%`;
      },
      deep: true,
    },
  },
  async created() {
    this.settings = AdvancedRpc.getSettings();

    let frontend = AdvancedRpc.getFrontendData();
    if (!frontend["scale"]) frontend["scale"] = "100";
    if (!frontend.pageStates["general"])
      frontend.pageStates["general"] = "play";
    if (!frontend.pageStates["videos"]) frontend.pageStates["videos"] = "play";
    if (!frontend.pageStates["podcasts"])
      frontend.pageStates["podcasts"] = "play";

    if (typeof frontend.autoUpdate === "undefined") frontend.autoUpdate = true;

    this.frontend = frontend;

    this.setTheme(frontend.theme, this.remoteData);
  },
  async mounted() {
    ipcRenderer.on(
      `plugin.${AdvancedRpc.PLUGIN_NAME}.unappliedSettings`,
      (e, status) => {
        AdvancedRpc.unappliedSettings = status;
        this.unappliedSettings = status;
      }
    );

    ipcRenderer.on(
      `plugin.${AdvancedRpc.PLUGIN_NAME}.setPrevSettings`,
      (e, settings) => {
        this.settings = settings;
      }
    );

    document.onkeydown = this.checkKey;

    if (!this.remoteData?.flags?.dontTriggerApiOnMount)
      await AdvancedRpc.checkForUpdates("arpc");
  },
  methods: {
    receiveSettings(key, settings) {
      this.settings[key] = settings;
    },
    async updateSettings() {
      await ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`,
        this.settings
      );
      notyf.success({
        message: "Settings applied",
        background: "#2D7D46",
        dismissible: true,
      });
    },
    resetChanges() {
      ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.resetChanges`,
        this.settings
      );
    },
    async resetSettings() {
      await AdvancedRpc.setDefaultSettings();
      this.settings = await AdvancedRpc.getSettings();
      await ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`,
        this.settings
      );
      notyf.success({
        message: "Your settings have been reset",
        background: "#d83c3e",
        dismissible: true,
      });
    },
    setModal(modal) {
      this.modal = modal;
    },
    toggleExpandable(key) {
      this.frontend.expandables[key] = !this.frontend.expandables[key];
    },
    toggleBubbles() {
      this.frontend.bubblesExpanded = !this.frontend.bubblesExpanded;
    },
    changeSidebarItem(item) {
      item = item.split(".");

      this.frontend.sidebar = item[0];
      if (item[1]) this.frontend.pageStates[item[0]] = item[1];
      else document.querySelector(".arpc-page").scrollIntoView();
    },
    doAction(data) {
      if (data.dest) data = data.dest;

      let dest;
      if (typeof data === "string") {
        dest = !data.startsWith("http") ? data.split(".")[0] : data;
      }

      if (!dest) return;

      let action;
      if (!data.startsWith("http")) action = data.split(".").slice(1).join(".");

      switch (dest) {
        case "arpc":
          this.changeSidebarItem(action);
          break;
        case "modal":
          if (action === "close") this.modal = null;
          else this.setModal(action);
          break;
        case "theme":
          const prevTheme = this.frontend.theme;
          this.setTheme(action, this.remoteData);
          if (prevTheme !== action) this.reportThemeUnlock(action);
          break;
        case "unlockTheme":
          this.unlockTheme(action);
          break;
        case "play":
          app.mk
            .setQueue({ url: action, parameters: { l: app.mklang } })
            .then(() => {
              app.mk.play();
            });
          break;
        case "ciderModal":
          app.modals[action] = true;
          break;
        case "ciderHash":
          window.location.hash = action;
          break;
        case "closeCider":
          app.closeWindow();
          break;
        case "restartCider":
          ipcRenderer.invoke("relaunchApp");
          break;
        case "back":
          app.navigateBack();
          break;
        case "update":
          AdvancedRpc.update();
          break;
        default:
          this.openLink(dest);
      }
    },
    openLink(url) {
      window.open(url, "_blank");
    },
    setTheme(theme, remoteData) {
      if (remoteData?.themes)
        this.themes = Object.values(remoteData.themes).flat();
      else this.themes = [];

      this.themes = this.themes?.filter((t) => {
        if (t.requirement) {
          return this.frontend[t.requirement];
        } else {
          return true;
        }
      });

      if (remoteData?.themes)
        Object.keys(remoteData.themes).forEach((key) => {
          this.filteredCategorizedThemes[key] = remoteData.themes[key].filter(
            (t) => {
              if (t.requirement) {
                return this.frontend[t.requirement];
              } else {
                return true;
              }
            }
          );
        });

      if (remoteData?.forceTheme) {
        document
          .querySelector(".advancedrpc")
          ?.setAttribute("arpc-theme", remoteData.forceTheme);
      } else if (this.themes?.find((t) => t.id === theme)) {
        document
          .querySelector(".advancedrpc")
          ?.setAttribute("arpc-theme", theme);

        this.frontend.theme = theme;
      } else {
        document
          .querySelector(".advancedrpc")
          ?.setAttribute("arpc-theme", "dark");

        this.frontend.theme = "dark";
      }
    },
    clickingEe(easterEgg) {
      if (
        !this.remoteData?.[easterEgg] ||
        this.frontend[this.remoteData?.[easterEgg].id + "Theme"]
      )
        return;

      if (!this[this.remoteData?.[easterEgg].id + "Clicks"])
        this[this.remoteData?.[easterEgg].id + "Clicks"] = 0;

      this[this.remoteData?.[easterEgg].id + "Clicks"]++;

      if (
        this[this.remoteData?.[easterEgg].id + "Clicks"] >
          this.remoteData?.[easterEgg]?.silentClicks &&
        this[this.remoteData?.[easterEgg].id + "Clicks"] <=
          this.remoteData?.[easterEgg]?.clicks - 1
      ) {
        notyf.success({
          message: this.remoteData?.[easterEgg]?.clickText.replace(
            "{clicks}",
            this.remoteData[easterEgg].clicks -
              this[this.remoteData[easterEgg].id + "Clicks"]
          ),
          background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
          ripple: false,
          icon: false,
        });
      }

      if (
        this[this.remoteData?.[easterEgg].id + "Clicks"] >
        this.remoteData?.[easterEgg]?.clicks - 1
      ) {
        this.unlockTheme(this.remoteData?.[easterEgg].id);

        if (this.remoteData?.[easterEgg]?.unlockText) {
          notyf.success({
            message: this.remoteData?.[easterEgg].unlockText,
            background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
            icon: false,
            duration: 5000,
            dismissible: true,
          });
        }
      }
    },
    unlockTheme(theme) {
      const prevTheme = this.frontend.theme;
      this.frontend[theme + "Theme"] = true;
      this.frontend.theme = theme;
      this.setTheme(theme, this.remoteData);
      if (prevTheme !== theme) this.reportThemeUnlock(theme);
    },
    async reportThemeUnlock(theme) {
      try {
        await fetch(
          `https://arpc-api.imvasi.com/theme?version=${this.installedVersion}&theme=${theme}
        `,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch {}
    },
    checkKey(e) {
      e = e || window.event;

      // esc
      if (e.keyCode == "27" && this.remoteData?.flags?.escExit) {
        this.modal ? (this.modal = null) : app.navigateBack();
      } else if (e.keyCode == "27") {
        this.modal = null;
      }

      // ctrl + s
      if (e.ctrlKey && e.keyCode == "83" && this.unappliedSettings) {
        e.preventDefault();
        this.updateSettings();
      }
    },
  },
});
