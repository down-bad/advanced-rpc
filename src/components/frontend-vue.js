Vue.component("plugin.advancedrpc", {
  template: `
  <div class="advancedrpc">
  <Transition name="arpc-modal">
    <vue-changelog
      v-if="changelogState"
      @close-changelog="toggleChangelog(false)"
  /></Transition>

  <Transition name="arpc-modal">
    <vue-variables-modal
      v-if="variablesModalState"
      @close-variables="toggleVariablesModal(false)"
    />
  </Transition>

  <Transition name="arpc-fade">
    <div
      class="arpc-modal-backdrop"
      v-if="changelogState || variablesModalState"
    ></div
  ></Transition>

  <div class="arpc-page">
    <Transition name="arpc-slide">
      <div class="arpc-unapplied-settings-alert" v-show="unappliedSettings">
        <div class="arpc-unapplied-settings-content">
          <div v-if="settings.applySettings === 'state'">
            Your changes will apply on playback state change. Apply now?
          </div>
          <div v-else-if="settings.applySettings === 'manually'">
            You've made changes, apply them to update your Discord presence.
          </div>
          <div v-else>;)</div>
          <div class="arpc-unapplied-settings-options">
            <a @click="resetChanges()">Reset</a>
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
      <div class="arpc-header">
        <h1>AdvancedRPC</h1>
      </div>

      <div
        class="arpc-bubble arpc-warning"
        v-if="app.cfg.connectivity.discord_rpc.enabled"
      >
        <div class="arpc-bubble-icon">
          <svg
            class="arpc-bubble-icon"
            aria-hidden="false"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z"
              fill="#faa81a"
            ></path>
          </svg>
        </div>
        <div class="arpc-bubble-text">
          Please disable Cider's Discord Rich Presence in
          {{$root.getLz('term.settings')}} >
          {{$root.getLz('settings.header.connectivity')}} and restart the app.
        </div>
      </div>

      <div
        class="arpc-bubble arpc-info"
        v-if="$root.cfg.general.privateEnabled && settings.respectPrivateSession"
      >
        <div class="arpc-bubble-icon">
          <svg
            class="arpc-bubble-icon"
            aria-hidden="false"
            width="16"
            height="16"
            viewBox="0 0 12 12"
          >
            <path
              fill="#00aff4"
              d="M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z"
            ></path>
          </svg>
        </div>
        <div class="arpc-bubble-text">
          Private Session is currently enabled, your Discord presence won't be
          displayed.
        </div>
      </div>

      <div class="arpc-option-container">
        <div
          class="arpc-option"
          id="arpc-update-option"
          v-if="installedVersion < latestVersion"
        >
          <div class="arpc-update-icon">
            <svg
              aria-hidden="true"
              role="img"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="#46C46E"
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z"
              ></path>
            </svg>
          </div>

          <div class="arpc-option-segment">
            <b>There is a new version available!</b>
            <small> Update to get the latest features and bug fixes. </small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <button
              class="arpc-button arpc-button-blue"
              @click="toggleChangelog(true)"
            >
              Update
            </button>
          </div>
        </div>

        <div :disabled="app.cfg.connectivity.discord_rpc.enabled">
          <div class="arpc-option">
            <div class="arpc-option-segment">Enable AdvancedRPC</div>
            <div class="arpc-option-segment arpc-option-segment_auto">
              <label>
                <input type="checkbox" v-model="settings.enabled" switch />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Play -->
      <h2>Play</h2>

      <div
        class="arpc-option-container arpc-opacity-transition"
        :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
      >
        <div class="arpc-option">
          <div class="arpc-option-segment">Show Presence on Playback</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="settings.play.enabled" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="settings.play.enabled">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                First Line (details)
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button>
                </small>
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.play.details" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Second Line (state)
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.play.state" />
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

            <div class="arpc-option">
              <div class="arpc-option-segment">Large Image</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <select
                    class="arpc-select"
                    v-model="settings.play.largeImage"
                  >
                    <option value="disabled">Off</option>
                    <option value="cover">Artwork</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.play.largeImage == 'custom'"
            >
              <div class="arpc-option-segment">
                Large Image Key / URL
                <small
                  >Max 256 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.play.largeImageKey" />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.play.largeImage != 'disabled'"
            >
              <div class="arpc-option-segment">
                Large Image Text
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.play.largeImageText" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">Small Image</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <select
                    class="arpc-select"
                    v-model="settings.play.smallImage"
                  >
                    <option value="disabled">Off</option>
                    <option value="cover">Artwork</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.play.smallImage == 'custom'"
            >
              <div class="arpc-option-segment">
                Small Image Key / URL
                <small
                  >Max 256 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.play.smallImageKey" />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.play.smallImage != 'disabled'"
            >
              <div class="arpc-option-segment">
                Small Image Text
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.play.smallImageText" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">Enable Buttons</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.play.buttons"
                    switch
                  />
                </label>
              </div>
            </div>

            <Transition name="arpc-settings-slide">
              <div class="arpc-option" v-show="settings.play.buttons">
                <div class="arpc-option-segment">
                  Buttons <br v-show="settings.play.buttons" />
                  <small
                    ><b>Max label length</b>: 30 characters<br />
                    <b>Max URL length</b>: 512 characters<br /><button
                      class="arpc-button arpc-var-button"
                      @click="toggleVariablesModal(true)"
                    >
                      {variables}
                    </button></small
                  >
                </div>
                <div
                  class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                >
                  <label>Label</label>
                  <input type="text" v-model="settings.play.button1.label" />

                  <label>URL</label>
                  <input type="text" v-model="settings.play.button1.url" />
                </div>
                <div
                  class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                >
                  <label>Label</label>
                  <input type="text" v-model="settings.play.button2.label" />

                  <label>URL</label>
                  <input type="text" v-model="settings.play.button2.url" />
                </div></div
            ></Transition></div
        ></Transition>
      </div>

      <!-- Pause -->
      <h2>Pause</h2>

      <div
        class="arpc-option-container arpc-opacity-transition"
        :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
      >
        <div class="arpc-option">
          <div class="arpc-option-segment">Show Presence while Paused</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="settings.pause.enabled" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="settings.pause.enabled">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                First Line (details)
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.details" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Second Line (state)
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.state" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">Large Image</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <select
                    class="arpc-select"
                    v-model="settings.pause.largeImage"
                  >
                    <option value="disabled">Off</option>
                    <option value="cover">Artwork</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.pause.largeImage == 'custom'"
            >
              <div class="arpc-option-segment">
                Large Image Key / URL
                <small
                  >Max 256 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.largeImageKey" />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.pause.largeImage != 'disabled'"
            >
              <div class="arpc-option-segment">
                Large Image Text
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.largeImageText" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">Small Image</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <select
                    class="arpc-select"
                    v-model="settings.pause.smallImage"
                  >
                    <option value="disabled">Off</option>
                    <option value="cover">Artwork</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.pause.smallImage == 'custom'"
            >
              <div class="arpc-option-segment">
                Small Image Key / URL
                <small
                  >Max 256 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.smallImageKey" />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              v-show="settings.pause.smallImage != 'disabled'"
            >
              <div class="arpc-option-segment">
                Small Image Text
                <small
                  >Max 128 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="toggleVariablesModal(true)"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.smallImageText" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">Enable Buttons</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.pause.buttons"
                    switch
                  />
                </label>
              </div>
            </div>

            <Transition name="arpc-settings-slide">
              <div v-show="settings.pause.buttons">
                <div
                  class="arpc-option"
                  v-show="settings.play.enabled && settings.play.buttons"
                >
                  <div class="arpc-option-segment">
                    Use Playback Buttons
                    <small
                      >Use the same buttons as the ones shown on
                      playback.</small
                    >
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
                  class="arpc-option arpc-opacity-transition"
                  :disabled="settings.pause.usePlayButtons && settings.play.enabled && settings.play.buttons"
                >
                  <div class="arpc-option-segment">
                    Buttons <br />
                    <small
                      ><b>Max label length:</b> 30 characters<br />
                      <b>Max URL length:</b> 512 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="toggleVariablesModal(true)"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div
                    class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                  >
                    <label>Label</label>
                    <input type="text" v-model="settings.pause.button1.label" />

                    <label>URL</label>
                    <input type="text" v-model="settings.pause.button1.url" />
                  </div>
                  <div
                    class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                  >
                    <label>Label</label>
                    <input type="text" v-model="settings.pause.button2.label" />

                    <label>URL</label>
                    <input type="text" v-model="settings.pause.button2.url" />
                  </div>
                </div>
              </div>
            </Transition></div
        ></Transition>
      </div>

      <!-- Advanced -->
      <h2>Advanced</h2>

      <div class="arpc-option-container">
        <div class="arpc-option">
          <div class="arpc-option-segment">
            Application ID
            <small
              >Create your own on
              <a
                href="https://discord.com/developers/applications"
                target="_blank"
                >Discord Developer Portal</a
              >.<br />Restart after changing to avoid unwanted effects.</small
            >
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
            <small v-if="settings.respectPrivateSession"
              >Your presence won't be displayed while Private Session is
              enabled.</small
            >
            <small v-else
              >Your presence will be displayed even while Private Session is
              enabled.</small
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
            Fallback Image
            <small
              >Set a custom image to be shown when the artwork doesn't exist
              (such as for local files).<br />Max 256 characters<button
                class="arpc-button arpc-var-button"
                @click="toggleVariablesModal(true)"
              >
                {variables}
              </button></small
            >
          </div>
          <div
            class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
          >
            <label>Play</label>
            <input type="text" v-model="settings.play.fallbackImage" />
          </div>
          <div
            class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
          >
            <label>Pause</label>
            <input type="text" v-model="settings.pause.fallbackImage" />
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Artwork Image Size
            <small
              >Changes the width and height of the artwork when used in the
              presence. Larger values might cause the artwork to take longer to
              load for others.</small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input
                type="number"
                v-model="settings.imageSize"
                placeholder="1024"
              />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Presence Update Delay (in milliseconds)
            <small>
              Puts a delay after updating your Discord presence in order to
              avoid rate limits such as when switching songs fast.
            </small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <input
              type="number"
              v-model="settings.presenceUpdateDelay"
              placeholder="0"
            />
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Apply Settings
            <small
              >Set whether to apply the settings manually, on play/pause or
              immediately while editing them. Applying them immediately can
              cause rate limits.</small
            >
          </div>

          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="settings.applySettings">
                <option value="manually">Manually</option>
                <option value="state">On State Change</option>
                <option value="immediately">Immediately</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <footer>
        <div>
          <b>AdvancedRPC</b> <br />
          {{versionInfo}} <br />
          By Vasilis#1517 <br />
          <a href="https://ko-fi.com/vasii" target="_blank">Donate</a>
        </div>
        <div>
          <button
            class="arpc-button arpc-button-blue"
            @click="toggleChangelog(true)"
          >
            Changelog
          </button>
        </div>
      </footer>
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
        buttons: false,
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
        buttons: false,
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
      imageSize: 1024,
      applySettings: "state",
      presenceUpdateDelay: 0,
    },
    installedVersion: AdvancedRpc.installedVersion,
    latestVersion: AdvancedRpc.latestVersion,
    unappliedSettings: AdvancedRpc.unappliedSettings,
    versionInfo: "[VI]{version} - {date}[/VI]",
    textVariables: "{artist}, {composer}, {title}, {album}, {trackNumber}",
    urlVariables: "{appleMusicUrl}, {ciderUrl}",
    variableStyles: "{variable^} for uppercase, {variable*} for lowercase",
    changelogState: false,
    variablesModalState: false,
  }),
  watch: {
    settings: {
      handler() {
        AdvancedRpc.updateLocalStorage(this.settings);
        ipcRenderer.invoke(
          `plugin.${AdvancedRpc.PLUGIN_NAME}.setting`,
          this.settings
        );
      },
      deep: true,
    },
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

    const settings = AdvancedRpc.getLocalStorage();
    if (settings) {
      // Convert old boolean settings
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

      // Add missing settings for users who update from older version
      if (!settings.imageSize) settings.imageSize = 1024;
      if (!settings.play.fallbackImage)
        settings.play.fallbackImage = "applemusic";
      if (!settings.pause.fallbackImage)
        settings.pause.fallbackImage = "applemusic";
      if (!settings.applySettings) settings.applySettings = "state";
      if (!settings.presenceUpdateDelay) settings.presenceUpdateDelay = 0;

      this.settings = settings;
    } else {
      this.settings = {
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
          buttons: false,
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
          buttons: false,
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
        imageSize: 1024,
        applySettings: "state",
        presenceUpdateDelay: 0,
      };
    }
  },
  methods: {
    updateSettings() {
      ipcRenderer
        .invoke(
          `plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`,
          this.settings
        )
        .then(() => {
          notyf.success({
            message: "Settings applied",
            background: "#2D7D46",
            dismissible: true,
          });
        });
    },
    resetChanges() {
      ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.resetChanges`,
        this.settings
      );
    },
    toggleChangelog(state) {
      this.changelogState = state;
    },
    toggleVariablesModal(state) {
      this.variablesModalState = state;
    },
  },
});

Vue.component("vue-variables-modal", {
  template: `
  <div class="arpc-modal-layer" @click.self="$emit('close-variables')">
  <div class="arpc-modal-window">
    <div class="arpc-modal-header">
      <div>Variables</div>
      <vue-close-button @close="$emit('close-variables')"></vue-close-button>
    </div>
    <div class="arpc-modal-content">
      <h4>Text Variables</h4>
      <div id="arpc-variables">
        <div>{title}</div>
        <div>{artist}</div>
        <div>{album}</div>
        <div>{composer}</div>
        <div>{trackNumber}</div>
      </div>

      <h4>Playback Variables</h4>
      <div id="arpc-variables">
        <div>{play.details}</div>
        <div>{play.state}</div>
        <div>{play.largeImageText}</div>
        <div>{play.smallImageText}</div>
        <div>{play.largeImageKey}</div>
        <div>{play.smallImageKey}</div>
        <div>{play.fallbackImage}</div>
      </div>

      <h4>Pause Variables</h4>
      <div id="arpc-variables">
        <div>{pause.details}</div>
        <div>{pause.state}</div>
        <div>{pause.largeImageText}</div>
        <div>{pause.smallImageText}</div>
        <div>{pause.largeImageKey}</div>
        <div>{pause.smallImageKey}</div>
        <div>{pause.fallbackImage}</div>
      </div>

      <h4>Variables Style</h4>
      <div id="arpc-variables">
        <div>{variable^}</div>
        for uppercase
      </div>
      <div id="arpc-variables">
        <div>{variable*}</div>
        for lowercase
      </div>

      <h4>URL Variables</h4>
      <div id="arpc-variables">
        <div>{appleMusicUrl}</div>
        <div>{ciderUrl}</div>
      </div>
    </div>
  </div>
</div>

  `,
});

Vue.component("vue-changelog", {
  template: `
  <div class="arpc-modal-layer" @click.self="$emit('close-changelog')">
  <div class="arpc-modal-window arpc-changelog-window">
    <div class="arpc-modal-header">
      <div>What's New</div>
      <vue-close-button @close="$emit('close-changelog')"></vue-close-button>
    </div>
    <div class="arpc-modal-content" id="arpc-changelog"></div>
    <div class="arpc-modal-footer">
      <div v-if="checkingForUpdate === true">Checking for updates...</div>
      <div v-else-if="latestVersion > installedVersion">
        There is a new update available!<br />Installed version:
        {{installedVersion}}
      </div>
      <div v-else-if="latestVersion <= installedVersion">
        No update available.
      </div>
      <div v-else>Error checking for updates.</div>

      <button
        v-if="updating"
        class="arpc-button arpc-button-blue"
        :disabled="true"
      >
        Updating...
      </button>
      <button
        v-else
        :disabled="checkingForUpdate || !latestVersion || latestVersion <= installedVersion"
        class="arpc-button arpc-button-blue"
        id="arpc-update-button"
        @click="update()"
      >
        Update
      </button>
    </div>
  </div>
</div>

  `,
  data: () => ({
    changelog: AdvancedRpc.changelog,
    latestVersion: null,
    installedVersion: AdvancedRpc.installedVersion,
    checkingForUpdate: true,
    updating: AdvancedRpc.updateInProgress,
  }),
  async mounted() {
    document.getElementById("arpc-changelog").innerHTML = this.changelog;

    await AdvancedRpc.checkForUpdates();

    this.changelog = AdvancedRpc.changelog;
    this.latestVersion = AdvancedRpc.latestVersion;
    this.checkingForUpdate = false;

    document.getElementById("arpc-changelog").innerHTML = this.changelog;
  },
  methods: {
    update() {
      AdvancedRpc.updateInProgress = true;
      this.updating = true;
      ipcRenderer.once("plugin-installed", (event, arg) => {
        if (arg.success) {
          ipcRenderer.invoke("relaunchApp");
        } else {
          notyf.error("Error updating AdvancedRPC");
          AdvancedRpc.updateInProgress = false;
          this.updating = false;
        }
      });
      ipcRenderer.invoke(
        "get-github-plugin",
        "https://github.com/down-bad/advanced-rpc"
      );
    },
  },
});

Vue.component("vue-close-button", {
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
      fill="#DCDDDE"
      d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
    ></path>
  </svg>
</button>

`,
});
