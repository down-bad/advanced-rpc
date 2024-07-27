/* Version: 1.7.1 - July 27, 2024 23:49:09 */
(function () {
  'use strict';

  Vue.component("plugin.advancedrpc", {
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
            url: "{radioUrl}"
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
              url: "{applePodcastsUrl}"
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
              url: "{applePodcastsUrl}"
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
        imageSize: "1024",
        removeInvalidButtons: true,
        removePause: "0",
        icloudArtworks: true
      },
      installedVersion: AdvancedRpc.installedVersion,
      unappliedSettings: AdvancedRpc.unappliedSettings,
      versionInfo: "ARPC 1.7.1 - July 27, 2024",
      textVariables: "{artist}, {composer}, {title}, {album}, {trackNumber}",
      urlVariables: "{appleMusicUrl}, {ciderUrl}",
      variableStyles: "{variable^} for uppercase, {variable*} for lowercase",
      modal: "",
      privateSessionBubble: {
        enabled: true,
        message: "Private Session is currently enabled, your Discord presence won't be displayed.",
        color: "#00AFF4",
        icon: "info"
      },
      ciderRpcBubble: {
        enabled: true,
        message: `Please disable Cider's Discord Rich Presence in ${app.getLz("term.settings")} > ${app.getLz("settings.header.connectivity")} and restart the app.`,
        color: "#FAA81A",
        icon: "warning"
      },
      noConnectionBubble: {
        enabled: true,
        title: "Huston, we have a problem.",
        message: "Unable to establish a connection to the AdvancedRPC server. Some features may be unavailable. Please check your internet connection, or try again later.",
        color: "#F04747",
        icon: ""
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
          podcasts: "play"
        }
      },
      themes: [],
      filteredCategorizedThemes: {},
      settingsStyle: {
        zoom: "100%"
      }
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
        const scaleToHeightMap = app?.cfg?.visual?.directives?.windowLayout === "twopanel" ? {
          75: "97.5",
          80: "98",
          85: "98.5",
          90: "99",
          95: "99.5",
          105: "100.5",
          110: "101.5",
          115: "102",
          120: "102.5",
          125: "103"
        } : null;
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
          125: "2.5"
        };
        const scale = this.frontend.scale;
        const heightValue = scaleToHeightMap?.[scale] || "100";
        const paddingValue = scaleToPaddingMap[scale] || "15";
        return `
      height: calc(${heightValue}% - var(--chromeHeight2));
      padding-top: calc(var(--chromeHeight1) + ${paddingValue}px);
      `;
      }
    },
    watch: {
      settings: {
        handler() {
          if (this.settings["removePause"] < 0) this.settings["removePause"] = 0;
          if (this.settings["imageSize"] < 0) this.settings["imageSize"] = 1;
          AdvancedRpc.setSettings(this.settings);
          ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.setting`, this.settings);
        },
        deep: true
      },
      frontend: {
        handler() {
          AdvancedRpc.setFrontendData(this.frontend);
          this.setTheme(this.frontend.theme, this.remoteData);
          this.settingsStyle.zoom = `${this.frontend.scale}%`;
        },
        deep: true
      }
    },
    async created() {
      this.settings = AdvancedRpc.getSettings();
      let frontend = AdvancedRpc.getFrontendData();
      if (!frontend["scale"]) frontend["scale"] = "100";
      if (!frontend.pageStates["general"]) frontend.pageStates["general"] = "play";
      if (!frontend.pageStates["videos"]) frontend.pageStates["videos"] = "play";
      if (!frontend.pageStates["podcasts"]) frontend.pageStates["podcasts"] = "play";
      if (typeof frontend.autoUpdate === "undefined") frontend.autoUpdate = true;
      this.frontend = frontend;
      this.setTheme(frontend.theme, this.remoteData);
    },
    async mounted() {
      ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.unappliedSettings`, (e, status) => {
        AdvancedRpc.unappliedSettings = status;
        this.unappliedSettings = status;
      });
      ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.setPrevSettings`, (e, settings) => {
        this.settings = settings;
      });
      document.onkeydown = this.checkKey;
      if (!this.remoteData?.flags?.dontTriggerApiOnMount) await AdvancedRpc.checkForUpdates("arpc");
    },
    methods: {
      receiveSettings(key, settings) {
        this.settings[key] = settings;
      },
      async updateSettings() {
        await ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`, this.settings);
        notyf.success({
          message: "Settings applied",
          background: "#2D7D46",
          dismissible: true
        });
      },
      resetChanges() {
        ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.resetChanges`, this.settings);
      },
      async resetSettings() {
        await AdvancedRpc.setDefaultSettings();
        this.settings = await AdvancedRpc.getSettings();
        await ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`, this.settings);
        notyf.success({
          message: "Your settings have been reset",
          background: "#d83c3e",
          dismissible: true
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
        if (item[1]) this.frontend.pageStates[item[0]] = item[1];else document.querySelector(".arpc-page").scrollIntoView();
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
            if (action === "close") this.modal = null;else this.setModal(action);
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
            app.mk.setQueue({
              url: action,
              parameters: {
                l: app.mklang
              }
            }).then(() => {
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
        if (remoteData?.themes) this.themes = Object.values(remoteData.themes).flat();else this.themes = [];
        this.themes = this.themes?.filter(t => {
          if (t.requirement) {
            return this.frontend[t.requirement];
          } else {
            return true;
          }
        });
        if (remoteData?.themes) Object.keys(remoteData.themes).forEach(key => {
          this.filteredCategorizedThemes[key] = remoteData.themes[key].filter(t => {
            if (t.requirement) {
              return this.frontend[t.requirement];
            } else {
              return true;
            }
          });
        });
        if (remoteData?.forceTheme) {
          document.querySelector(".advancedrpc")?.setAttribute("arpc-theme", remoteData.forceTheme);
        } else if (this.themes?.find(t => t.id === theme)) {
          document.querySelector(".advancedrpc")?.setAttribute("arpc-theme", theme);
          this.frontend.theme = theme;
        } else {
          document.querySelector(".advancedrpc")?.setAttribute("arpc-theme", "dark");
          this.frontend.theme = "dark";
        }
      },
      clickingEe(easterEgg) {
        if (!this.remoteData?.[easterEgg] || this.frontend[this.remoteData?.[easterEgg].id + "Theme"]) return;
        if (!this[this.remoteData?.[easterEgg].id + "Clicks"]) this[this.remoteData?.[easterEgg].id + "Clicks"] = 0;
        this[this.remoteData?.[easterEgg].id + "Clicks"]++;
        if (this[this.remoteData?.[easterEgg].id + "Clicks"] > this.remoteData?.[easterEgg]?.silentClicks && this[this.remoteData?.[easterEgg].id + "Clicks"] <= this.remoteData?.[easterEgg]?.clicks - 1) {
          notyf.success({
            message: this.remoteData?.[easterEgg]?.clickText.replace("{clicks}", this.remoteData[easterEgg].clicks - this[this.remoteData[easterEgg].id + "Clicks"]),
            background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
            ripple: false,
            icon: false
          });
        }
        if (this[this.remoteData?.[easterEgg].id + "Clicks"] > this.remoteData?.[easterEgg]?.clicks - 1) {
          this.unlockTheme(this.remoteData?.[easterEgg].id);
          if (this.remoteData?.[easterEgg]?.unlockText) {
            notyf.success({
              message: this.remoteData?.[easterEgg].unlockText,
              background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
              icon: false,
              duration: 5000,
              dismissible: true
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
          await fetch(`https://arpc-api.imvasi.com/theme?version=${this.installedVersion}&theme=${theme}
        `, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            }
          });
        } catch {}
      },
      checkKey(e) {
        e = e || window.event;

        // esc
        if (e.keyCode == "27" && this.remoteData?.flags?.escExit) {
          this.modal ? this.modal = null : app.navigateBack();
        } else if (e.keyCode == "27") {
          this.modal = null;
        }

        // ctrl + s
        if (e.ctrlKey && e.keyCode == "83" && this.unappliedSettings) {
          e.preventDefault();
          this.updateSettings();
        }
      }
    }
  });

  Vue.component("arpc-bubble", {
    props: ["id", "enabled", "title", "message", "url", "icon", "color", "backgroundColor", "textColor", "iconColor"],
    template: `
  <div
  class="arpc-bubble"
  :id="id &&  'arpc-bubble-' + id"
  :style="{'border-color': color, 'background': backgroundColor || color + '1a', 'cursor': url ? 'pointer' : 'default'}"
  @click="url && $emit('do-action', url)"
>
  <div v-if="icon" class="arpc-bubble-icon">
    <svg
      v-if="icon === 'warning'"
      class="arpc-bubble-icon arpc-warning-icon"
      aria-hidden="false"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <path
        :style="{'fill': iconColor || color}"
        d="M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z"
      ></path>
    </svg>

    <svg
      v-else-if="icon === 'info'"
      class="arpc-bubble-icon"
      aria-hidden="false"
      width="16"
      height="16"
      viewBox="0 0 12 12"
    >
      <path
        :style="{'fill': iconColor || color}"
        d="M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z"
      ></path>
    </svg>

    <svg
      v-else-if="icon === 'download'"
      class="arpc-bubble-icon"
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        :style="{'fill': iconColor || color}"
        d="M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z"
      ></path>
    </svg>
  </div>
  <div class="arpc-bubble-text" :style="{'color': textColor || ''}">
    <div v-if="title" class="arpc-bubble-title">{{title}}</div>
    <div>{{message}}</div>
  </div>
</div>

  `
  });

  Vue.component("arpc-changelog", {
    template: `
  <div
  class="arpc-modal-layer"
  id="arpc-changelog-modal"
  @click.self="$emit('close-changelog')"
>
  <div class="arpc-modal-window arpc-changelog-window">
    <div class="arpc-modal-header">
      <div>What's New</div>
      <arpc-close-button @close="$emit('close-changelog')"></arpc-close-button>
    </div>
    <div class="arpc-modal-content" id="arpc-changelog">
      <div v-if="changelog" v-html="changelog"></div>
      <div v-else>
        <arpc-spinner></arpc-spinner>
      </div>
    </div>

    <div class="arpc-modal-footer">
      <div v-if="gettingRemoteData">Checking for updates...</div>
      <div v-else-if="versionData && versionData.updateAvailable">
        <div v-if="versionData.footerMessage">
          {{ versionData.footerMessage }}
        </div>
        <div v-else>
          There is a new update available!<br />Installed version:
          {{installedVersion}}
        </div>
      </div>
      <div
        class="arpc-modal-footer-content"
        v-else-if="versionData && !versionData.updateAvailable"
      >
        <div v-if="versionData.footerMessage">
          {{ versionData.footerMessage }}
        </div>
        <div v-else>No update available.</div>

        <div v-if="!remoteData?.flags?.hideLastArtworkUpdate">
          <div v-if="gettingAnimatedArtworks">
            Checking animated artworks...
          </div>
          <div v-else-if="artworksUpdated">
            Animated artworks have been updated!
          </div>
          <div v-else-if="artworksUpdate">
            Animated artworks last update: {{artworksUpdate}}
          </div>
        </div>
      </div>
      <div v-else>Error checking for updates.</div>

      <button
        :disabled="gettingRemoteData || !versionData || !versionData.updateAvailable || updating"
        class="arpc-button arpc-button-blue"
        id="arpc-update-button"
        @click="update()"
      >
        {{ updating ? 'Updating...' : 'Update' }}
      </button>
    </div>
  </div>
</div>

  `,
    data: () => ({
      installedVersion: AdvancedRpc.installedVersion,
      artworksUpdated: false
    }),
    computed: {
      versionData() {
        return Vue.observable(window.AdvancedRpc).versionData;
      },
      gettingAnimatedArtworks() {
        return Vue.observable(window.AdvancedRpc).gettingAnimatedArtworks;
      },
      artworksUpdate() {
        const update = Vue.observable(window.AdvancedRpc).artworksUpdate;
        if (!update) {
          return null;
        }
        return new Date(update).toLocaleDateString();
      },
      remoteData() {
        return Vue.observable(window.AdvancedRpc).remoteData;
      },
      gettingRemoteData() {
        return Vue.observable(window.AdvancedRpc).gettingRemoteData;
      },
      changelog() {
        return Vue.observable(window.AdvancedRpc).changelog;
      },
      updating() {
        return Vue.observable(window.AdvancedRpc).updateInProgress;
      },
      updateDownloaded() {
        return Vue.observable(window.AdvancedRpc).updateDownloaded;
      }
    },
    async mounted() {
      await AdvancedRpc.checkForUpdates("changelog");
    },
    methods: {
      update() {
        if (this.updating || !this.versionData || !this.versionData.updateAvailable || this.gettingRemoteData) {
          return;
        }
        if (this.updateDownloaded) {
          ipcRenderer.invoke("relaunchApp");
          return;
        }
        AdvancedRpc.update();
      }
    }
  });

  Vue.component("arpc-expand-button", {
    template: `
  <div
  @click="$emit('toggle-expandable')"
  class="arpc-expand-button"
  :style="{'transform': expanded ? 'scale(-1, 1) rotate(0deg)' : 'scale(-1, 1) rotate(90deg)'}"
>
  <svg
    class="arpc-expand-button"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="img"
  >
    <path
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M7 10L12 15 17 10"
      aria-hidden="true"
    ></path>
  </svg>
</div>

  `,
    props: ["expanded"]
  });

  Vue.component("arpc-close-button", {
    template: `
  <button @click="$emit('close')" class="arpc-close-button">
  <svg
    class="arpc-close-button"
    aria-hidden="true"
    role="img"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
    ></path>
  </svg>
</button>

  `
  });

  Vue.component("arpc-variables-modal", {
    template: `
  <div
  class="arpc-modal-layer"
  id="arpc-variables-modal"
  @click.self="$emit('close-variables')"
>
  <div class="arpc-modal-window">
    <div class="arpc-modal-header">
      <div>Variables</div>
      <arpc-close-button @close="$emit('close-variables')"></arpc-close-button>
    </div>
    <div class="arpc-modal-content">
      <div class="arpc-label">Text Variables</div>
      <div id="arpc-variables">
        <div>{title}</div>
        <div>{artist}</div>
        <div>{album}</div>
        <div>{composer}</div>
        <div>{trackNumber}</div>
        <div>{trackCount}</div>
        <div>{genre}</div>
        <div>{year}</div>
        <div>{songId}</div>
        <div>{albumId}</div>
        <div>{artistId}</div>
      </div>

      <div class="arpc-label">Podcasts Variables</div>
      <div id="arpc-variables">
        <div>{episodeNumber}</div>
        <div>{applePodcastsUrl}</div>
        <div>{websiteUrl}</div>
        <div>{assetUrl}</div>
      </div>

      <div class="arpc-label">Radio Stations Variables</div>
      <div id="arpc-variables">
        <div>{radioName}</div>
        <div>{radioTagline}</div>
        <div>{radioUrl}</div>
      </div>

      <div class="arpc-label">Variables Style</div>
      <div id="arpc-variables">
        <div>{variable^}</div>
        for uppercase
      </div>
      <div id="arpc-variables">
        <div>{variable*}</div>
        for lowercase
      </div>

      <div class="arpc-label">URL Variables (for buttons)</div>
      <div id="arpc-variables">
        <div>{appleMusicUrl}</div>
        <div>{albumUrl}</div>
        <div>{artistUrl}</div>
        <div>{spotifyUrl}</div>
        <div>{youtubeUrl}</div>
        <div>{youtubeMusicUrl}</div>
        <div>{songlinkUrl}</div>
        <div>{ciderUrl}</div>
      </div>
    </div>
  </div>
</div>

  `
  });

  Vue.component("arpc-sidebar", {
    template: `
  <div class="arpc-sidebar">
  <div>
    <div class="arpc-header">
      <h1 @click="$emit('click-ee', 'headerClickEe')">
        {{ computedRemoteData?.header ?? "AdvancedRPC" }}
      </h1>
      <img
        @click="$emit('click-ee', 'decorationClickEe')"
        v-if="computedRemoteData?.titleDecoration?.url"
        :src="computedRemoteData?.titleDecoration?.url"
        :title="computedRemoteData?.titleDecoration?.text"
        :width="computedRemoteData?.titleDecoration?.width ?? 40"
        :height="computedRemoteData?.titleDecoration?.height ?? 40"
        draggable="false"
      />
    </div>

    <div
      v-for="item in sideBarItems?.upper"
      :class="{'arpc-sidebar-item': item.id !== 'separator' && item.id !== 'eyebrow', 'arpc-sidebar-separator': item.id === 'separator', 'arpc-sidebar-eyebrow': item.id === 'eyebrow', 'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && versionData?.updateAvailable}"
      :id="item.id && 'arpc-sidebar-item-' + item.id"
      @click="$emit('do-action', item)"
    >
      {{ item.dest === 'modal.changelog' && versionData?.updateAvailable ?
      item.updateText : item.text }}
      <div
        v-if="item.badge?.text"
        :style="{background: item.badge?.color, color: item.badge?.textColor}"
        class="arpc-badge"
      >
        {{ item.badge?.text }}
      </div>
    </div>
  </div>
  <div>
    <div
      v-for="item in sideBarItems?.lower"
      :class="{'arpc-sidebar-item': item.id !== 'separator' && item.id !== 'eyebrow', 'arpc-sidebar-separator': item.id === 'separator', 'arpc-sidebar-eyebrow': item.id === 'eyebrow', 'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && versionData?.updateAvailable}"
      :id="item.id && 'arpc-sidebar-item-' + item.id"
      @click="$emit('do-action', item)"
    >
      {{ item.dest === 'modal.changelog' && versionData?.updateAvailable ?
      item.updateText : item.text }}
      <div
        v-if="item.badge?.text"
        :style="{background: item.badge?.color, color: item.badge?.textColor}"
        class="arpc-badge"
      >
        {{ item.badge?.text }}
      </div>
    </div>

    <div v-if="computedRemoteData?.footers" class="arpc-footer">
      <div
        v-for="footer in computedRemoteData?.footers"
        class="arpc-footer-item"
        :id="'arpc-footer-item-' + footer.id"
        :style="{pointerEvents: footer.dest ? 'auto' : 'none'}"
        @click="$emit('do-action', footer.dest)"
      >
        {{ footerText(footer.text) }}
      </div>
    </div>
    <footer
      v-else
      @click="openLink('https://github.com/down-bad/advanced-rpc')"
    >
      {{ versionInfo }}
    </footer>
  </div>
</div>

`,
    props: ["installedVersion", "versionData", "versionInfo", "remoteData", "frontend"],
    data: () => ({
      sideBarItems: null,
      version: null,
      versionDate: null
    }),
    computed: {
      computedRemoteData() {
        const data = Vue.observable(this.remoteData);
        this.sidebarItems(data);
        return data;
      }
    },
    created() {
      this.sidebarItems(this.computedRemoteData);
      this.version = AdvancedRpc.installedVersion;
      this.versionDate = AdvancedRpc.versionDate;
    },
    methods: {
      footerText(text) {
        return text.replaceAll("$version", this.version).replaceAll("$date", this.versionDate);
      },
      sidebarItems(remoteData) {
        this.sideBarItems = remoteData?.sideBarItems;
        if (!this.sideBarItems) {
          this.sideBarItems = {
            upper: [{
              text: "Songs",
              dest: "arpc.general",
              id: "general"
            }, {
              text: "Videos",
              dest: "arpc.videos",
              id: "videos"
            }, {
              text: "Radio Stations",
              dest: "arpc.radio",
              id: "radio"
            }, {
              text: "Podcasts",
              dest: "arpc.podcasts",
              id: "podcasts"
            }, {
              text: "Settings",
              dest: "arpc.settings",
              id: "settings"
            }],
            lower: [{
              text: "Variables",
              dest: "modal.variables"
            }, {
              text: "Changelog",
              updateText: "Update available!",
              dest: "modal.changelog"
            }]
          };
        }
      },
      openLink(url) {
        window.open(url, "_blank");
      }
    }
  });

  Vue.component("arpc-confirm-modal", {
    template: `
  <div
  class="arpc-modal-layer"
  id="arpc-confirm-modal"
  @click.self="$emit('close-modal')"
>
  <div class="arpc-modal-window">
    <div class="arpc-modal-header">
      <div>{{ title }}</div>
      <arpc-close-button @close="$emit('close-modal')"></arpc-close-button>
    </div>
    <div class="arpc-modal-content">{{ description }}</div>
    <div class="arpc-modal-footer">
      <div></div>
      <div>
        <button
          class="arpc-button arpc-button-underline"
          @click="$emit('close-modal')"
        >
          Cancel
        </button>
        <button class="arpc-button arpc-button-red" @click="confirm()">
          Confirm
        </button>
      </div>
    </div>
  </div>
</div>

  `,
    props: ["title", "description"],
    methods: {
      confirm() {
        this.$emit("confirm");
        this.$emit("close-modal");
      }
    }
  });

  Vue.component("arpc-general", {
    props: ["data"],
    template: `
<div>
  <div class="arpc-settings-header">
    <h2 @click="$emit('click-ee', 'generalClickEe')">Songs</h2>
    <arpc-exit-button v-if="flags?.exitButton"></arpc-exit-button>
  </div>

  <div class="arpc-state-selector" v-if="flags?.stateSelector">
    <h3
      :class="{'arpc-selected-state': state === 'play'}"
      @click="$emit('do-action', 'arpc.general.play')"
    >
      Play
    </h3>
    <h3
      :class="{'arpc-selected-state': state === 'pause'}"
      @click="$emit('do-action', 'arpc.general.pause')"
    >
      Pause
    </h3>
  </div>

  <h3 v-if="!flags?.stateSelector">Play</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state === 'play'"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="settings.play.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!settings.play.enabled">
      <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>

      <div class="arpc-option" v-if="flags?.activityTypes">
        <div class="arpc-option-segment">
          Activity Type
          <small
            v-if="flags?.discordTypeBugNotifText && settings.play.type !== 'playing'"
            >{{ flags.discordTypeBugNotifText }}</small
          >
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.type">
              <option value="listening">Listening</option>
              <option value="watching">Watching</option>
              <option value="playing">Playing</option>
              <option value="competing">Competing</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          First Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.details" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          Second Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.state" />
          </label>
        </div>
      </div>

      <div
        class="arpc-option"
        v-if="flags?.activityTypes && flags?.thirdLine && settings.play.type !== 'playing'"
      >
        <div class="arpc-option-segment">
          Third Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.largeImageText" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Timestamp</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.timestamp">
              <option value="disabled">Off</option>
              <option value="remaining">Remaining time</option>
              <option value="elapsed">Elapsed time</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">LARGE IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Large Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.largeImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.largeImage == 'custom'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Large Image Key / URL</div>
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.largeImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.largeImage != 'disabled'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Large Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.largeImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">SMALL IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Small Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.smallImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.smallImage == 'custom'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Small Image Key / URL</div>
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.smallImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.smallImage != 'disabled'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Small Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.smallImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
      <div class="arpc-option">
        <div class="arpc-option-segment">Enable Buttons</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="settings.play.buttons" switch />
          </label>
        </div>
      </div>

      <Transition name="arpc-settings-slide">
        <div class="arpc-option" v-show="settings.play.buttons">
          <div class="arpc-option-segment">
            Buttons <br v-show="settings.play.buttons" />
            <small
              ><b>Max label length</b>: 30 characters<br />
              <b>Max URL length</b>: 512 characters</small
            >
          </div>
          <div
            class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
          >
            <label class="arpc-label">Label</label>
            <input type="text" v-model="settings.play.button1.label" />

            <label class="arpc-label">URL</label>
            <input type="text" v-model="settings.play.button1.url" />
          </div>
          <div
            class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
          >
            <label class="arpc-label">Label</label>
            <input type="text" v-model="settings.play.button2.label" />

            <label class="arpc-label">URL</label>
            <input type="text" v-model="settings.play.button2.url" />
          </div></div
      ></Transition>
    </div>
  </div>

  <h3 v-if="!flags?.stateSelector">Pause</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state == 'pause'"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence while Paused</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="settings.pause.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!settings.pause.enabled">
      <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>
      <div class="arpc-option" v-if="flags?.activityTypes">
        <div class="arpc-option-segment">
          Activity Type
          <small
            v-if="flags?.discordTypeBugNotifText && settings.pause.type !== 'playing'"
            >{{ flags.discordTypeBugNotifText }}</small
          >
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.pause.type">
              <option value="listening">Listening</option>
              <option value="watching">Watching</option>
              <option value="playing">Playing</option>
              <option value="competing">Competing</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          First Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.details" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          Second Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.state" />
          </label>
        </div>
      </div>

      <div
        class="arpc-option"
        v-if="flags?.activityTypes && flags?.thirdLine && settings.pause.type !== 'playing'"
      >
        <div class="arpc-option-segment">
          Third Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.largeImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">LARGE IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Large Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.pause.largeImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.largeImage == 'custom'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Large Image Key / URL</div>
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.largeImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.largeImage != 'disabled'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Large Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.largeImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">SMALL IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Small Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.pause.smallImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.smallImage == 'custom'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Small Image Key / URL</div>
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.smallImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.smallImage != 'disabled'">
        <div class="arpc-option-segment">
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Small Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.smallImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
      <div class="arpc-option">
        <div class="arpc-option-segment">Enable Buttons</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="settings.pause.buttons" switch />
          </label>
        </div>
      </div>

      <Transition name="arpc-settings-slide">
        <div v-show="settings.pause.buttons">
          <div class="arpc-option">
            <div class="arpc-option-segment">
              Use Playback Buttons
              <small>Use the same buttons as the ones shown on playback.</small>
            </div>
            <div class="arpc-option-segment arpc-option-segment_auto">
              <label>
                <input
                  type="checkbox"
                  v-model="settings.pause.usePlayButtons"
                  switch
                />
              </label>
            </div>
          </div>

          <div
            class="arpc-option"
            :disabled="settings.pause.usePlayButtons && !(!settings.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
          >
            <div class="arpc-option-segment">
              Buttons <br />
              <small
                ><b>Max label length:</b> 30 characters<br />
                <b>Max URL length:</b> 512 characters</small
              >
            </div>
            <div
              class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
            >
              <label class="arpc-label">Label</label>
              <input type="text" v-model="settings.pause.button1.label" />

              <label class="arpc-label">URL</label>
              <input type="text" v-model="settings.pause.button1.url" />
            </div>
            <div
              class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
            >
              <label class="arpc-label">Label</label>
              <input type="text" v-model="settings.pause.button2.label" />

              <label class="arpc-label">URL</label>
              <input type="text" v-model="settings.pause.button2.url" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</div>

`,
    data: () => ({
      settings: {
        play: null,
        pause: null
      },
      enabled: false,
      state: "play",
      flags: null
    }),
    watch: {
      play() {
        this.$emit("update", "play", this.settings.play);
      },
      pause() {
        this.$emit("update", "pause", this.settings.pause);
      },
      data() {
        [this.settings.play, this.settings.pause, this.enabled, this.state, this.flags] = this.data;
      }
    },
    created() {
      [this.settings.play, this.settings.pause, this.enabled, this.state, this.flags] = this.data;
    }
  });

  Vue.component("arpc-podcasts", {
    props: ["data"],
    template: `
<div>
  <div class="arpc-settings-header">
    <h2 @click="$emit('click-ee', 'podcastsClickEe')">Podcasts</h2>
    <arpc-exit-button v-if="flags?.exitButton"></arpc-exit-button>
  </div>

  <div class="arpc-state-selector" v-if="flags?.stateSelector">
    <h3
      :class="{'arpc-selected-state': state === 'play'}"
      @click="$emit('do-action', 'arpc.podcasts.play')"
    >
      Play
    </h3>
    <h3
      :class="{'arpc-selected-state': state === 'pause'}"
      @click="$emit('do-action', 'arpc.podcasts.pause')"
    >
      Pause
    </h3>
  </div>

  <h3 v-if="!flags?.stateSelector">Play</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state === 'play'"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Podcast Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="podcasts.play.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!podcasts.play.enabled">
      <div class="arpc-option">
        <div
          class="arpc-option-segment"
          style="cursor: pointer"
          @click="$emit('do-action', 'arpc.general.play')"
        >
          Use the Songs Playback Configuration
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input
              type="checkbox"
              v-model="podcasts.play.usePlayConfig"
              switch
            />
          </label>
        </div>
      </div>

      <div
        :disabled="podcasts.play.usePlayConfig && !(!podcasts.play.enabled || app.cfg.connectivity.discord_rpc.enabled || !enabled)"
      >
        <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>
        <div class="arpc-option" v-if="flags?.activityTypes">
          <div class="arpc-option-segment">
            Activity Type
            <small
              v-if="flags?.discordTypeBugNotifText && podcasts.play.type !== 'playing'"
              >{{ flags.discordTypeBugNotifText }}</small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="podcasts.play.type">
                <option value="listening">Listening</option>
                <option value="watching">Watching</option>
                <option value="playing">Playing</option>
                <option value="competing">Competing</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            First Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.play.details" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Second Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.play.state" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-if="flags?.activityTypes && flags?.thirdLine && podcasts.play.type !== 'playing'"
        >
          <div class="arpc-option-segment">
            Third Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.play.largeImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Timestamp</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="podcasts.play.timestamp">
                <option value="disabled">Off</option>
                <option value="remaining">Remaining time</option>
                <option value="elapsed">Elapsed time</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          LARGE IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Large Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="podcasts.play.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Podcast cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="podcasts.play.largeImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Large Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.play.largeImageKey" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-show="podcasts.play.largeImage != 'disabled'"
        >
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Large Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.play.largeImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          SMALL IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="podcasts.play.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Podcast cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="podcasts.play.smallImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Small Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.play.smallImageKey" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-show="podcasts.play.smallImage != 'disabled'"
        >
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Small Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.play.smallImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="podcasts.play.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="podcasts.play.buttons">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Buttons <br />
                <small
                  ><b>Max label length:</b> 30 characters<br />
                  <b>Max URL length:</b> 512 characters</small
                >
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="podcasts.play.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="podcasts.play.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="podcasts.play.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="podcasts.play.button2.url" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <h3 v-if="!flags?.stateSelector">Pause</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state == 'pause'"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence while Paused</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="podcasts.pause.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!podcasts.pause.enabled">
      <div class="arpc-option">
        <div
          class="arpc-option-segment"
          style="cursor: pointer"
          @click="$emit('do-action', 'arpc.general.pause')"
        >
          Use the Songs Pause Configuration
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input
              type="checkbox"
              v-model="podcasts.pause.usePauseConfig"
              switch
            />
          </label>
        </div>
      </div>

      <div
        :disabled="podcasts.pause.usePauseConfig && !(!podcasts.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
      >
        <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>
        <div class="arpc-option" v-if="flags?.activityTypes">
          <div class="arpc-option-segment">
            Activity Type
            <small
              v-if="flags?.discordTypeBugNotifText && podcasts.pause.type !== 'playing'"
              >{{ flags.discordTypeBugNotifText }}</small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="podcasts.pause.type">
                <option value="listening">Listening</option>
                <option value="watching">Watching</option>
                <option value="playing">Playing</option>
                <option value="competing">Competing</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            First Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.pause.details" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Second Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.pause.state" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-if="flags?.activityTypes && flags?.thirdLine && podcasts.pause.type !== 'playing'"
        >
          <div class="arpc-option-segment">
            Third Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.pause.largeImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          LARGE IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Large Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="podcasts.pause.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Podcast cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="podcasts.pause.largeImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Large Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.pause.largeImageKey" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-show="podcasts.pause.largeImage != 'disabled'"
        >
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Large Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.pause.largeImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          SMALL IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="podcasts.pause.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Podcast cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="podcasts.pause.smallImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Small Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.pause.smallImageKey" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-show="podcasts.pause.smallImage != 'disabled'"
        >
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Small Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="podcasts.pause.smallImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="podcasts.pause.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="podcasts.pause.buttons">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Use Playback Buttons
                <small
                  >Use the same buttons as the ones shown on playback.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="podcasts.pause.usePlayButtons"
                    switch
                  />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              :disabled="podcasts.pause.usePlayButtons && !(podcasts.pause.usePauseConfig || !podcasts.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
            >
              <div class="arpc-option-segment">
                Buttons <br />
                <small
                  ><b>Max label length:</b> 30 characters<br />
                  <b>Max URL length:</b> 512 characters</small
                >
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="podcasts.pause.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="podcasts.pause.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="podcasts.pause.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="podcasts.pause.button2.url" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</div>

`,
    data: () => ({
      podcasts: null,
      enabled: false,
      state: "play",
      flags: null
    }),
    watch: {
      podcasts() {
        this.$emit("update", "podcasts", this.podcasts);
      },
      data() {
        [this.podcasts, this.enabled, this.state, this.flags] = this.data;
      }
    },
    created() {
      [this.podcasts, this.enabled, this.state, this.flags] = this.data;
    }
  });

  Vue.component("arpc-videos", {
    props: ["data"],
    template: `
<div>
  <div class="arpc-settings-header">
    <h2 @click="$emit('click-ee', 'videosClickEe')">Videos</h2>
    <arpc-exit-button v-if="flags?.exitButton"></arpc-exit-button>
  </div>

  <div class="arpc-state-selector" v-if="flags?.stateSelector">
    <h3
      :class="{'arpc-selected-state': state === 'play'}"
      @click="$emit('do-action', 'arpc.videos.play')"
    >
      Play
    </h3>
    <h3
      :class="{'arpc-selected-state': state === 'pause'}"
      @click="$emit('do-action', 'arpc.videos.pause')"
    >
      Pause
    </h3>
  </div>

  <h3 v-if="!flags?.stateSelector">Play</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state === 'play'"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Video Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="videos.play.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!videos.play.enabled">
      <div class="arpc-option">
        <div
          class="arpc-option-segment"
          style="cursor: pointer"
          @click="$emit('do-action', 'arpc.general.play')"
        >
          Use the Songs Playback Configuration
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="videos.play.usePlayConfig" switch />
          </label>
        </div>
      </div>

      <div
        :disabled="videos.play.usePlayConfig && !(!videos.play.enabled || app.cfg.connectivity.discord_rpc.enabled || !enabled)"
      >
        <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>
        <div class="arpc-option" v-if="flags?.activityTypes">
          <div class="arpc-option-segment">
            Activity Type
            <small
              v-if="flags?.discordTypeBugNotifText && videos.play.type !== 'playing'"
              >{{ flags.discordTypeBugNotifText }}</small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.play.type">
                <option value="listening">Listening</option>
                <option value="watching">Watching</option>
                <option value="playing">Playing</option>
                <option value="competing">Competing</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            First Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.details" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Second Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.state" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-if="flags?.activityTypes && flags?.thirdLine && videos.play.type !== 'playing'"
        >
          <div class="arpc-option-segment">
            Third Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.largeImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Timestamp</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.play.timestamp">
                <option value="disabled">Off</option>
                <option value="remaining">Remaining time</option>
                <option value="elapsed">Elapsed time</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          LARGE IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Large Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.play.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.largeImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Large Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.largeImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.largeImage != 'disabled'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Large Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.largeImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          SMALL IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.play.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.smallImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Small Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.smallImage != 'disabled'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Small Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.smallImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="videos.play.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="videos.play.buttons">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Buttons <br />
                <small
                  ><b>Max label length:</b> 30 characters<br />
                  <b>Max URL length:</b> 512 characters</small
                >
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="videos.play.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.play.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="videos.play.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.play.button2.url" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <h3 v-if="!flags?.stateSelector">Pause</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state == 'pause'"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence while Paused</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="videos.pause.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!videos.pause.enabled">
      <div class="arpc-option">
        <div
          class="arpc-option-segment"
          style="cursor: pointer"
          @click="$emit('do-action', 'arpc.general.pause')"
        >
          Use the Songs Pause Configuration
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input
              type="checkbox"
              v-model="videos.pause.usePauseConfig"
              switch
            />
          </label>
        </div>
      </div>

      <div
        :disabled="videos.pause.usePauseConfig && !(!videos.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
      >
        <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>
        <div class="arpc-option" v-if="flags?.activityTypes">
          <div class="arpc-option-segment">
            Activity Type
            <small
              v-if="flags?.discordTypeBugNotifText && videos.pause.type !== 'playing'"
              >{{ flags.discordTypeBugNotifText }}</small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.pause.type">
                <option value="listening">Listening</option>
                <option value="watching">Watching</option>
                <option value="playing">Playing</option>
                <option value="competing">Competing</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            First Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.details" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Second Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.state" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-if="flags?.activityTypes && flags?.thirdLine && videos.pause.type !== 'playing'"
        >
          <div class="arpc-option-segment">
            Third Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.largeImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          LARGE IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Large Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.pause.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.largeImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Large Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.largeImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.largeImage != 'disabled'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Large Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.largeImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          SMALL IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.pause.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.smallImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Small Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.smallImage != 'disabled'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Small Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.smallImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="videos.pause.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="videos.pause.buttons">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Use Playback Buttons
                <small
                  >Use the same buttons as the ones shown on playback.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="videos.pause.usePlayButtons"
                    switch
                  />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              :disabled="videos.pause.usePlayButtons && !(videos.pause.usePauseConfig || !videos.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
            >
              <div class="arpc-option-segment">
                Buttons <br />
                <small
                  ><b>Max label length:</b> 30 characters<br />
                  <b>Max URL length:</b> 512 characters</small
                >
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="videos.pause.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.pause.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="videos.pause.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.pause.button2.url" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</div>

`,
    data: () => ({
      videos: null,
      enabled: false,
      state: "play",
      flags: null
    }),
    watch: {
      videos() {
        this.$emit("update", "videos", this.videos);
      },
      data() {
        [this.videos, this.enabled, this.state, this.flags] = this.data;
      }
    },
    created() {
      [this.videos, this.enabled, this.state, this.flags] = this.data;
    }
  });

  Vue.component("arpc-radio", {
    props: ["data"],
    template: `
<div>
  <div class="arpc-settings-header">
    <h2 @click="$emit('click-ee', 'radioClickEe')">Radio Stations</h2>
    <arpc-exit-button v-if="flags?.exitButton"></arpc-exit-button>
  </div>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Radio Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="radio.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!radio.enabled">
      <div class="arpc-option">
        <div
          class="arpc-option-segment"
          style="cursor: pointer"
          @click="$emit('do-action', 'arpc.general.play')"
        >
          Use the Songs Playback Configuration
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="radio.usePlayConfig" switch />
          </label>
        </div>
      </div>

      <div
        :disabled="radio.usePlayConfig && !(!radio.enabled || app.cfg.connectivity.discord_rpc.enabled || !enabled)"
      >
        <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>
        <div class="arpc-option" v-if="flags?.activityTypes">
          <div class="arpc-option-segment">
            Activity Type
            <small
              v-if="flags?.discordTypeBugNotifText && radio.type !== 'playing'"
              >{{ flags.discordTypeBugNotifText }}</small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="radio.type">
                <option value="listening">Listening</option>
                <option value="watching">Watching</option>
                <option value="playing">Playing</option>
                <option value="competing">Competing</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            First Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.details" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Second Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.state" />
            </label>
          </div>
        </div>

        <div
          class="arpc-option"
          v-if="flags?.activityTypes && flags?.thirdLine && radio.type !== 'playing'"
        >
          <div class="arpc-option-segment">
            Third Line
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.largeImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Timestamp</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="radio.timestamp">
                <option value="disabled">Off</option>
                <option value="elapsed">Elapsed time</option>
              </select>
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          LARGE IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Large Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="radio.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Radio cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.largeImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Large Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.largeImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.largeImage != 'disabled'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Large Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.largeImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">
          SMALL IMAGE
        </div>
        <div class="arpc-option">
          <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
            Image
          </div>
          <div v-else class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="radio.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Radio cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.smallImage == 'custom'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Image Key / URL</div>
            <div v-else>Small Image Key / URL</div>
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.smallImage != 'disabled'">
          <div class="arpc-option-segment">
            <div v-if="flags?.categorizedOptions">Text</div>
            <div v-else>Small Image Text</div>
            <small>Max 128 characters</small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.smallImageText" />
            </label>
          </div>
        </div>

        <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="radio.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="radio.buttons">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Use Playback Buttons
                <small
                  >Use the same buttons as the ones shown on playback.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="radio.usePlayButtons"
                    switch
                  />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              :disabled="radio.usePlayButtons && !(radio.usePlayConfig && !radio.enabled || app.cfg.connectivity.discord_rpc.enabled || !enabled)"
            >
              <div class="arpc-option-segment">
                Buttons <br />
                <small
                  ><b>Max label length:</b> 30 characters<br />
                  <b>Max URL length:</b> 512 characters</small
                >
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="radio.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="radio.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="radio.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="radio.button2.url" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</div>

`,
    data: () => ({
      radio: null,
      enabled: false,
      flags: null
    }),
    watch: {
      radio() {
        this.$emit("update", "radio", this.radio);
      },
      data() {
        [this.radio, this.enabled, this.flags] = this.data;
      }
    },
    created() {
      [this.radio, this.enabled, this.flags] = this.data;
    }
  });

  Vue.component("arpc-spinner", {
    template: `
  <div class="arpc-spinner">
  <span class="arpc-spinner-inner" role="img" aria-label="Loading"
    ><span class="arpc-wandering-cubes"
      ><span class="arpc-cube"></span><span class="arpc-cube"></span></span
  ></span>
</div>
  `
  });

  Vue.component("arpc-exit-button", {
    template: `
  <div class="arpc-exit-button">
  <div class="arpc-exit-button-icon" @click="exit">
    <svg
      aria-hidden="true"
      role="img"
      width="18"
      height="18"
      viewBox="0 0 24 24"
    >
      <path
        d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
      ></path>
    </svg>
  </div>
  <div class="arpc-exit-button-keybind">ESC</div>
</div>

  `,
    methods: {
      exit() {
        app.navigateBack();
      }
    }
  });

  Vue.component("arpc-custom-modal", {
    template: `
  <div
  class="arpc-modal-layer"
  :id="'arpc-modal-' + modalData?.id"
  @click.self="$emit('do-action', 'modal.close')"
>
  <div class="arpc-modal-window" :style="modalData?.style">
    <div class="arpc-modal-header">
      <div>{{modalData?.title}}</div>
      <arpc-close-button
        @close="$emit('do-action', 'modal.close')"
      ></arpc-close-button>
    </div>
    <div class="arpc-modal-content">
      <div v-if="modalHtml" v-html="modalHtml"></div>
      <div v-else>
        <arpc-spinner></arpc-spinner>
      </div>
    </div>

    <div class="arpc-modal-footer" v-if="modalHtml && modalData?.footer">
      <div>{{modalData?.footer.text}}</div>
      <div v-if="modalData?.footer.buttons">
        <button
          v-for="(button, index) in modalData.footer.buttons"
          :key="index"
          :class="'arpc-button arpc-button-' + (button.type || 'blue')"
          @click="$emit('do-action', button.action || 'modal.close')"
        >
          {{button.text}}
        </button>
      </div>
    </div>
  </div>
</div>

  `,
    props: ["modalData"],
    data: () => ({
      modalHtml: null
    }),
    async created() {
      try {
        this.modalHtml = await fetch(this.modalData.htmlUrl).then(res => res.text());
      } catch (error) {
        this.modalHtml = "Failed fetching modal content.";
      }
    },
    async mounted() {
      // await AdvancedRpc.checkForUpdates("changelog");
    },
    methods: {}
  });

  let cachedArtwork = {
    url: "",
    id: ""
  };
  let cachedCustomArtwork = {
    url: "",
    id: ""
  };
  class AdvancedRpcFrontend {
    PLUGIN_NAME = "AdvancedRPC";
    SETTINGS_KEY = "settings";
    FRONTEND_KEY = "frontend";
    remoteData = null;
    versionData = null;
    installedVersion = "1.7.1";
    versionDate = "July 27, 2024";
    changelog = undefined;
    unappliedSettings = false;
    updateInProgress = false;
    updateDownloaded = null;
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
      ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.initSettings`, this.getSettings());
      this.checkForUpdates("startup");
    }

    // Gets settings from localStorage or sets default settings if none are found
    getSettings() {
      try {
        const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`);
        if (!data) {
          this.setDefaultSettings();
          return this.getSettings();
        } else {
          const arpcSettings = JSON.parse(data);
          if (arpcSettings.videos.pause.button2.url === "%DEVMODE%") this.isDev = true;else this.isDev = false;
          return arpcSettings;
        }
      } catch (error) {
        return null;
      }
    }

    // Sets settings in localStorage
    setSettings(data) {
      localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`, JSON.stringify(data));
    }

    // Check if user's settings are up to date with AdvancedRPC updates
    initSettings() {
      let settings = this.getSettings();
      if (typeof settings.play.smallImage == "boolean") {
        settings.play.smallImage = settings.play.smallImage ? "custom" : "disabled";
      }
      if (typeof settings.pause.smallImage == "boolean") {
        settings.pause.smallImage = settings.pause.smallImage ? "custom" : "disabled";
      }
      if (!settings.imageSize) settings["imageSize"] = "1024";
      if (!settings.play.fallbackImage) settings["play"]["fallbackImage"] = "applemusic";
      if (!settings.pause.fallbackImage) settings["pause"]["fallbackImage"] = "applemusic";
      if (!settings.removePause) settings["removePause"] = "0";
      if (typeof settings.removeInvalidButtons === "undefined") settings["removeInvalidButtons"] = true;
      if (typeof settings.icloudArtworks === "undefined") settings["icloudArtworks"] = true;
      if (!settings.play.type) settings["play"]["type"] = "listening";
      if (!settings.pause.type) settings["pause"]["type"] = "listening";
      if (!settings.podcasts) settings["podcasts"] = {
        play: {
          enabled: true,
          usePlayConfig: false,
          type: "listening",
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
          type: "listening",
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
      if (!settings.podcasts.play.type) settings["podcasts"]["play"]["type"] = "listening";
      if (!settings.podcasts.pause.type) settings["podcasts"]["pause"]["type"] = "listening";
      if (!settings.videos) settings["videos"] = {
        play: {
          enabled: true,
          usePlayConfig: false,
          type: "watching",
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
          type: "watching",
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
      if (!settings.videos.play.type) settings["videos"]["play"]["type"] = "watching";
      if (!settings.videos.pause.type) settings["videos"]["pause"]["type"] = "watching";
      if (!settings.radio) settings["radio"] = {
        enabled: true,
        usePlayConfig: false,
        type: "listening",
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
          url: "{radioUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
      };
      if (!settings.radio.type) settings["radio"]["type"] = "listening";
      this.setSettings(settings);
    }

    // Sets default settings in localStorage
    setDefaultSettings() {
      localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`, JSON.stringify({
        appId: "927026912302362675",
        enabled: true,
        respectPrivateSession: true,
        play: {
          enabled: true,
          type: "listening",
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
          type: "listening",
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
          type: "listening",
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
            url: "{radioUrl}"
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
            type: "listening",
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
              url: "{applePodcastsUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
          },
          pause: {
            enabled: true,
            usePauseConfig: false,
            type: "listening",
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
              url: "{applePodcastsUrl}"
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
            type: "watching",
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
            type: "watching",
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
        imageSize: "1024",
        removeInvalidButtons: true,
        removePause: "0",
        icloudArtworks: true
      }));
    }

    // Gets frontend data from localStorage or sets default values if none are found
    getFrontendData() {
      try {
        const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`);
        if (!data) {
          localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`, JSON.stringify({
            sidebar: "general",
            theme: "dark",
            bubblesExpanded: true,
            scale: "100",
            pageStates: {
              general: "play",
              videos: "play",
              podcasts: "play"
            }
          }));
          return this.getFrontendData();
        } else return JSON.parse(data);
      } catch (error) {
        return null;
      }
    }

    // Sets frontend data to localStorage
    setFrontendData(data) {
      localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`, JSON.stringify(data));
    }
    async getRemoteData(src) {
      if (!this.gettingRemoteData) {
        this.gettingRemoteData = true;
        const frontend = await this.getFrontendData();
        try {
          this.remoteData = await fetch(`${this.isDev ? this.devUrl : this.prodUrl}/getRemoteData?src=${src}&version=${this.installedVersion}&theme=${frontend.theme}
            `).then(response => {
            if (response.status === 200) return response.json();else return null;
          });
          ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.remoteData`, this.remoteData);
          if (this.remoteData?.versionData) {
            this.versionData = this.remoteData.versionData;
            this.artworksUpdate = this.remoteData.versionData.artworksUpdate;
            const autoUpdateRemotely = this.remoteData?.flags?.autoUpdate && !this.remoteData?.flags?.autoUpdateOption;
            const autoUpdateLocally = this.remoteData?.flags?.autoUpdate && this.remoteData?.flags?.autoUpdateOption && frontend.autoUpdate;
            if (this.versionData.updateAvailable && this.versionData.updateNotif && !autoUpdateRemotely && !autoUpdateLocally) {
              const updateNotyf = notyf.error({
                message: this.versionData.updateNotif.message || "There is a new AdvancedRPC version available!",
                icon: false,
                background: this.versionData.updateNotif.color || "#5865f2",
                duration: this.versionData.updateNotif.duration || "5000",
                dismissible: true
              });
              updateNotyf.on("click", ({
                target,
                event
              }) => {
                // app.appRoute("plugin/advancedrpc");
                app.pluginPages.page = "plugin.advancedrpc";
                window.location.hash = "plugin-renderer";
              });
            }
            if (autoUpdateRemotely || autoUpdateLocally) {
              this.update(autoUpdateRemotely || autoUpdateLocally);
              // notyf.success(`${autoUpdateRemotely || autoUpdateLocally}`);
            }
          } else {
            this.versionData = null;
          }
          this.gettingRemoteData = false;
          return true;
        } catch (e) {
          console.log(`[Plugin][${this.PLUGIN_NAME}] Error fetching remote data. Some features may not work.`);
          console.log(e);
          this.remoteData = null;
          this.versionData = null;
          this.artworksUpdate = null;
          this.colorslessUpdate = null;
          this.gettingRemoteData = false;
          ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.remoteData`, this.remoteData);
          return false;
        }
      }
    }
    async getColorsless(src) {
      if (!this.gettingColorsless && this.versionData?.colorslessUpdate !== this.colorslessUpdate) {
        this.gettingColorsless = true;
        try {
          const colorsless = await fetch(`${this.isDev ? this.devUrl : this.prodUrl}/getColorsless?src=${src}&version=${this.installedVersion}
            `).then(async response => {
            if (response.status === 200) return response.text();else return null;
          });
          if (colorsless) {
            ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.colorsless`, colorsless);
          }
          this.colorslessUpdate = this.versionData?.colorslessUpdate;
          this.gettingColorsless = false;
          return true;
        } catch (e) {
          console.log(`[Plugin][${this.PLUGIN_NAME}] Error getting theme styles.`);
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
          const changelog = await fetch(this.remoteData?.versionData?.changelogUrl ?? "https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/changelog.html").then(async response => response.text());
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
          if (this.remoteData?.flags?.animatedArtworks && !this.remoteData?.animatedArtworksv2?.enabled) {
            this.gettingAnimatedArtworks = true;
            let artworks = await fetch(`${this.isDev ? this.devUrl : this.prodUrl}/getArtworks?src=${src}&version=${this.installedVersion}`, {
              cache: "no-store"
            }).then(response => {
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
          console.log(`[Plugin][${this.PLUGIN_NAME}] Error fetching animated artworks.`);
          console.log(e);
          this.gettingAnimatedArtworks = false;
          return false;
        }
      }
    }
    async checkForUpdates(src) {
      this.checkingForUpdate = true;
      await this.getRemoteData(src);
      const promises = [this.getAnimatedArtworks(src), this.getChangelog(src), this.getColorsless(src)];
      await Promise.allSettled(promises);
    }
    async update(autoUpdate) {
      if (!this.remoteData?.versionData?.updateAvailable) {
        return;
      }
      if (this.remoteData?.versionData?.version === this.updateDownloaded) {
        return;
      }
      AdvancedRpc.updateInProgress = true;
      ipcRenderer.once("plugin-installed", (event, arg) => {
        if (arg.success) {
          // ipcRenderer.invoke("relaunchApp");
          AdvancedRpc.updateInProgress = false;
          AdvancedRpc.updateDownloaded = this.versionData?.version;
          if (autoUpdate && this.remoteData?.flags?.autoUpdateNotif) {
            const updateNotyf = notyf.error({
              message: this.remoteData?.flags?.autoUpdateNotifText || "New AdvancedRPC version available! Restart Cider to complete installation.",
              icon: false,
              background: "#5865f2",
              duration: "10000",
              dismissible: true
            });
            updateNotyf.on("click", ({
              target,
              event
            }) => {
              app.pluginPages.page = "plugin.advancedrpc";
              window.location.hash = "plugin-renderer";
            });
          } else if (!autoUpdate) {
            ipcRenderer.invoke("relaunchApp");
          }
        } else {
          notyf.error("Error updating AdvancedRPC");
          AdvancedRpc.updateInProgress = false;
        }
      });
      ipcRenderer.invoke("get-github-plugin", "https://github.com/down-bad/advanced-rpc");
    }
  }
  window.AdvancedRpc = new AdvancedRpcFrontend();
  ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.itemChanged`, async (e, enabled, cover, icloudSetting, kind, songId, artworkUrl, update) => {
    const animatedArtworksv2 = AdvancedRpc.remoteData?.animatedArtworksv2,
      icloudArtworks = AdvancedRpc.remoteData?.icloudArtworks,
      isDev = AdvancedRpc.isDev;
    let currentItem = localStorage.getItem("currentTrack");
    currentItem = currentItem && currentItem !== "undefined" ? JSON.parse(currentItem) : null;
    if (!currentItem || currentItem === "undefined") return;

    // Get animated artwork
    if (enabled && !songId?.startsWith("i.") && animatedArtworksv2?.enabled && cover && kind) {
      let artwork = await getAnimatedArtwork(currentItem?._assets?.[0]?.metadata?.playlistId, animatedArtworksv2);
      if (artwork === "fetching") {
        isDev && notyf.error("Return becauce fetching!!");
        return;
      }
      if (!artwork) artwork = currentItem?.attributes?.artwork?.url;
      currentItem = {
        ...currentItem,
        artwork
      };
    }

    // Get custom iCloud artwork
    if (enabled && icloudSetting && songId?.startsWith("i.") && icloudArtworks?.enabled && artworkUrl) {
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
          artwork: artwork.url
        };
      }
    }
    try {
      currentItem = JSON.stringify(currentItem);
      await ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.currentItem`, currentItem, update);
    } catch (error) {
      console.log(error);
    }
  });

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
        setTimeout(reject, animatedArtworksv2?.timeout ?? 5000, "Animated artwork fetching timed out.");
      });
      let request, refId;
      if (animatedArtworksv2?.stats) {
        refId = window.uuidv4();
        request = fetch(`https://arpc-api.imvasi.com/animartwork/${albumId} `, {
          headers: {
            "X-Ref-Id": refId
          }
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
    if (cachedCustomArtwork.id === songId && cachedCustomArtwork.url === "fetching") {
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
        setTimeout(reject, icloudArtworks?.timeout ?? 5000, "Custom artwork fetching timed out.");
      });
      let request, refId;
      if (icloudArtworks?.stats) {
        refId = window.uuidv4();
        request = fetch(`https://arpc-api.imvasi.com/artwork/`, {
          method: "POST",
          body: JSON.stringify({
            imageUrl: customArtwork
          }),
          headers: {
            "Content-Type": "application/json",
            "X-Ref-Id": refId
          }
        });
      } else {
        request = fetch(`https://arpc-api.imvasi.com/artwork/`, {
          method: "POST",
          body: JSON.stringify({
            imageUrl: customArtwork
          }),
          headers: {
            "Content-Type": "application/json"
          }
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
        "X-Ref-Id": refId
      },
      body: JSON.stringify({
        ms
      })
    });
  }

})();
