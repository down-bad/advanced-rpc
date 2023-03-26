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
        <div class="arpc-unapplied-settings-content">
          <div v-if="settings.applySettings === 'state'">
            Your changes will apply on playback state change. Apply now?
          </div>
          <div
            @click="clickingEe('unappliedTextEe')"
            v-else-if="settings.applySettings === 'manually'"
          >
            You've made changes, apply them to update your Discord presence.
          </div>
          <div v-else>;)</div>
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

    <div class="arpc-settings">
      <arpc-sidebar
        :installedVersion="installedVersion"
        :versionData="versionData"
        :versionInfo="versionInfo"
        :remoteData="remoteData"
        :frontend="frontend"
        @do-action="doAction"
        @click-ee="clickingEe"
      ></arpc-sidebar>

      <div class="arpc-content">
        <Transition name="arpc-settings-slide">
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
        ></Transition>

        <Transition name="arpc-settings-slide">
          <div v-show="frontend.bubblesExpanded">
            <Transition name="arpc-settings-slide">
              <arpc-bubble
                v-if="$root.cfg.general.privateEnabled && settings.respectPrivateSession"
                v-bind="privateSessionBubble"
              ></arpc-bubble
            ></Transition>

            <Transition name="arpc-settings-slide">
              <arpc-bubble
                v-if="app.cfg.connectivity.discord_rpc.enabled"
                v-bind="ciderRpcBubble"
              ></arpc-bubble
            ></Transition>

            <arpc-bubble
              v-for="bubble in bubbles"
              v-if="bubble?.enabled"
              v-bind="bubble"
              @do-action="doAction"
            ></arpc-bubble></div
        ></Transition>

        <!-- General -->
        <arpc-general
          v-show="frontend.sidebar === 'general'"
          :data="[settings.play, settings.pause, settings.enabled]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @set-modal="setModal"
          @sidebar-item="changeSidebarItem"
        />

        <!-- Podcasts -->
        <arpc-podcasts
          v-show="frontend.sidebar === 'podcasts'"
          :data="[settings.podcasts, settings.enabled]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @set-modal="setModal"
          @sidebar-item="changeSidebarItem"
        />

        <!-- Videos -->
        <arpc-videos
          v-show="frontend.sidebar === 'videos'"
          :data="[settings.videos, settings.enabled]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @set-modal="setModal"
          @sidebar-item="changeSidebarItem"
        />

        <!-- Radio -->
        <arpc-radio
          v-show="frontend.sidebar === 'radio'"
          :data="[settings.radio, settings.enabled]"
          @update="receiveSettings"
          @click-ee="clickingEe"
          @set-modal="setModal"
          @sidebar-item="changeSidebarItem"
        />

        <!-- Settings -->
        <div v-show="frontend.sidebar === 'settings'">
          <h2 @click="clickingEe('settingsClickEe')">Settings</h2>

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

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Apply Settings Immediately
                <small
                  >Apply settings to your Discord presence as you change them.
                  This can cause rate limits.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.applySettings"
                    true-value="immediately"
                    false-value="manually"
                    switch
                  />
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
                    v-if="remoteData?.themesBadge?.text"
                    :style="{background: remoteData?.themesBadge?.color, color: remoteData?.themesBadge?.textColor}"
                    class="arpc-badge"
                  >
                    {{ remoteData?.themesBadge?.text }}
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
                    v-if="remoteData?.categorizedThemes"
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
      applySettings: "manually",
      removeInvalidButtons: true,
      removePause: "0",
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
    frontend: {
      sidebar: "general",
      theme: "dark",
      bubblesExpanded: true,
    },
    themes: [],
    filteredCategorizedThemes: {},
    bubbles: [],
  }),
  computed: {
    remoteData() {
      const data = Vue.observable(window.AdvancedRpc).remoteData;
      this.initBubbles(data?.bubbles);
      if (data?.themes) this.themes = Object.values(data.themes).flat();
      this.setTheme(this.frontend.theme, data);
      return data;
    },
    versionData() {
      return Vue.observable(window.AdvancedRpc).versionData;
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
        this.initBubbles(this.remoteData?.bubbles);
      },
      deep: true,
    },
    frontend: {
      handler() {
        AdvancedRpc.setFrontendData(this.frontend);
        this.setTheme(this.frontend.theme, this.remoteData);
      },
      deep: true,
    },
  },
  async created() {
    this.settings = AdvancedRpc.getSettings();

    let frontend = AdvancedRpc.getFrontendData();
    if (typeof frontend["bubblesExpanded"] === "undefined")
      frontend["bubblesExpanded"] = true;
    this.frontend = frontend;

    this.setTheme(frontend.theme, this.remoteData);
    this.initBubbles(this.remoteData?.bubbles);
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

    if (!this.remoteData?.dontTriggerApiOnMount)
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
      this.frontend.sidebar = item;
      document.querySelector(".arpc-page").scrollIntoView();
    },
    async doAction(item) {
      if (item.dest) item = item.dest;
      if (item.startsWith("arpc.")) {
        this.changeSidebarItem(item.replace("arpc.", ""));
      } else if (item.startsWith("modal.")) {
        this.setModal(item.replace("modal.", ""));
      } else if (item.startsWith("theme.")) {
        const prevTheme = this.frontend.theme;
        this.setTheme(item.replace("theme.", ""), this.remoteData);
        if (prevTheme !== item.replace("theme.", ""))
          this.reportThemeUnlock(item.replace("theme.", ""));
      } else if (item.startsWith("unlockTheme.")) {
        this.unlockTheme(item.replace("unlockTheme.", ""));
      } else {
        this.openLink(item);
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
          `https://dev-api.imvasi.com/theme?version=${this.installedVersion}&theme=${theme}
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
    initBubbles(data) {
      let bubbles = [];
      data?.forEach((bubble) => {
        if (bubble.enabled) bubbles.push(bubble);
      });

      if (app.cfg.general.privateEnabled && this.settings.respectPrivateSession)
        bubbles.push(undefined);

      if (app.cfg.connectivity.discord_rpc.enabled) bubbles.push(undefined);

      this.bubbles = bubbles;
    },
    checkKey(e) {
      e = e || window.event;

      // esc
      if (e.keyCode == "27") {
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
