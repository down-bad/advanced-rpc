const PLUGIN_NAME = "AdvancedRPC";
const SETTINGS_KEY = "settings";
const { version } = require("./package.json");

function getLocalStorage() {
  try {
    const data = localStorage.getItem(`plugin.${PLUGIN_NAME}.${SETTINGS_KEY}`);
    return JSON.parse(data);
  } catch (error) {
    updateLocalStorage(null);
    return null;
  }
}

function updateLocalStorage(data) {
  localStorage.setItem(
    `plugin.${PLUGIN_NAME}.${SETTINGS_KEY}`,
    JSON.stringify(data)
  );
}

let installedVersion = version,
  latestVersion = undefined;

Vue.component("plugin.advancedrpc", {
  template: `
  <div class="content-inner settings-page">
  <div class="md-option-container">
    <div class="md-option-header mt-3">
      <span>AdvancedRPC Settings</span>
    </div>

    <div
      class="md-header-title ms-2"
      v-show="app.cfg.general.discordrpc.enabled || app.cfg.connectivity.discord_rpc.enabled"
    >
      Please disable Cider's Discord Rich Presence in
      {{$root.getLz('term.settings')}} >
      {{$root.getLz('settings.header.connectivity')}} and restart the app.
    </div>
    <div class="settings-option-body">
      <div
        class="md-option-line"
        v-show="settings.installedVersion < settings.latestVersion"
      >
        <div class="md-option-segment">
          <b>There is a new version available!</b>
          <small>
            Installed version: {{settings.installedVersion}}<br />
            Latest version: {{settings.latestVersion}}
          </small>
        </div>
        <div class="md-option-segment md-option-segment_auto">
          <button class="md-btn" @click="$root.appRoute('plugins-github')">
            Update
          </button>
        </div>
      </div>

      <div
        :disabled="app.cfg.general.discordrpc.enabled || app.cfg.connectivity.discord_rpc.enabled"
      >
        <div class="md-option-line">
          <div class="md-option-segment">Enable AdvancedRPC</div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="checkbox" v-model="settings.enabled" switch />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">
            Application ID
            <small>Restart recommended</small>
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.appId" />
            </label>
          </div>
        </div>

        <div
          class="md-option-line"
          :disabled="app.cfg.general.discordrpc.enabled || app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
        >
          <div class="md-option-segment">Reload AdvancedRPC</div>
          <div class="md-option-segment md-option-segment_auto">
            <button class="md-btn" @click="reloadAdvancedRpc()">Reload</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Play -->
    <div class="md-option-header mt-3">
      <span>Play</span>
    </div>

    <div
      class="settings-option-body"
      :disabled="app.cfg.general.discordrpc.enabled || app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
    >
      <div class="md-option-line">
        <div class="md-option-segment">Show presence when playing</div>
        <div class="md-option-segment md-option-segment_auto">
          <label>
            <input type="checkbox" v-model="settings.play.enabled" switch />
          </label>
        </div>
      </div>

      <div v-show="settings.play.enabled">
        <div class="md-option-line">
          <div class="md-option-segment">
            First line (details)
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.play.details" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">
            Second line (state)
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.play.state" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">Timestamp</div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <select
                class="md-select"
                style="width: 180px"
                v-model="settings.play.timestamp"
              >
                <option value="disabled">Off</option>
                <option value="remaining">Remaining time</option>
                <option value="elapsed">Elapsed time</option>
              </select>
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">Image</div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <select
                class="md-select"
                style="width: 180px"
                v-model="settings.play.largeImage"
              >
                <option value="disabled">Off</option>
                <option value="cover">Cover art</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div
          class="md-option-line"
          v-show="settings.play.largeImage == 'custom'"
        >
          <div class="md-option-segment">
            Image key/source <small>Max 256 characters</small>
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.play.largeImageKey" />
            </label>
          </div>
        </div>

        <div
          class="md-option-line"
          v-show="settings.play.largeImage != 'disabled'"
        >
          <div class="md-option-segment">
            Image text
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.play.largeImageText" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">Show small icon</div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input
                type="checkbox"
                v-model="settings.play.smallImage"
                switch
              />
            </label>
          </div>
        </div>

        <div class="md-option-line" v-show="settings.play.smallImage">
          <div class="md-option-segment">
            Small image key/source <small>Max 256 characters</small>
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.play.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="md-option-line" v-show="settings.play.smallImage">
          <div class="md-option-segment">
            Small image text
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.play.smallImageText" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">
            Buttons <br v-show="settings.play.buttons" />
            <small v-show="settings.play.buttons"
              ><b>Max label length:</b> 30 characters<br />
              <b>Max URL length:</b> 512 characters<br /><b>Label variables:</b>
              {artist}, {composer}, {title}, {album}, {trackNumber}<br /><b
                >URL variables:</b
              >
              {appleMusicUrl}, {ciderUrl}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="checkbox" v-model="settings.play.buttons" switch />
            </label>
          </div>
        </div>

        <div v-show="settings.play.buttons">
          <div class="md-option-line">
            <div class="md-option-segment">Button #1 label</div>
            <div class="md-option-segment md-option-segment_auto">
              <label>
                <input type="text" v-model="settings.play.button1.label" />
              </label>
            </div>
          </div>

          <div class="md-option-line">
            <div class="md-option-segment">Button #1 URL</div>
            <div class="md-option-segment md-option-segment_auto">
              <label>
                <input type="text" v-model="settings.play.button1.url" />
              </label>
            </div>
          </div>

          <div class="md-option-line">
            <div class="md-option-segment">Button #2 label</div>
            <div class="md-option-segment md-option-segment_auto">
              <label>
                <input type="text" v-model="settings.play.button2.label" />
              </label>
            </div>
          </div>

          <div class="md-option-line">
            <div class="md-option-segment">Button #2 URL</div>
            <div class="md-option-segment md-option-segment_auto">
              <label>
                <input type="text" v-model="settings.play.button2.url" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pause -->
    <div class="md-option-header mt-3">
      <span>Pause</span>
    </div>

    <div
      class="settings-option-body"
      :disabled="app.cfg.general.discordrpc.enabled || app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
    >
      <div class="md-option-line">
        <div class="md-option-segment">Show presence while on pause</div>
        <div class="md-option-segment md-option-segment_auto">
          <label>
            <input type="checkbox" v-model="settings.pause.enabled" switch />
          </label>
        </div>
      </div>

      <div v-show="settings.pause.enabled">
        <div class="md-option-line">
          <div class="md-option-segment">
            First line (details)
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.pause.details" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">
            Second line (state)
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.pause.state" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">Image</div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <select
                class="md-select"
                style="width: 180px"
                v-model="settings.pause.largeImage"
              >
                <option value="disabled">Off</option>
                <option value="cover">Cover art</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div
          class="md-option-line"
          v-show="settings.pause.largeImage == 'custom'"
        >
          <div class="md-option-segment">
            Image key/source <small>Max 256 characters</small>
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.pause.largeImageKey" />
            </label>
          </div>
        </div>

        <div
          class="md-option-line"
          v-show="settings.pause.largeImage != 'disabled'"
        >
          <div class="md-option-segment">
            Image text
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.pause.largeImageText" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">Show small icon</div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input
                type="checkbox"
                v-model="settings.pause.smallImage"
                switch
              />
            </label>
          </div>
        </div>

        <div class="md-option-line" v-show="settings.pause.smallImage">
          <div class="md-option-segment">
            Small image key/source <small>Max 256 characters</small>
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.pause.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="md-option-line" v-show="settings.pause.smallImage">
          <div class="md-option-segment">
            Small image text
            <small
              >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
              {title}, {album}, {trackNumber}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="text" v-model="settings.pause.smallImageText" />
            </label>
          </div>
        </div>

        <div class="md-option-line">
          <div class="md-option-segment">
            Buttons <br v-show="settings.pause.buttons" />
            <small v-show="settings.pause.buttons"
              ><b>Max label length:</b> 30 characters<br />
              <b>Max URL length:</b> 512 characters<br /><b>Label variables:</b>
              {artist}, {composer}, {title}, {album}, {trackNumber}<br /><b
                >URL variables:</b
              >
              {appleMusicUrl}, {ciderUrl}</small
            >
          </div>
          <div class="md-option-segment md-option-segment_auto">
            <label>
              <input type="checkbox" v-model="settings.pause.buttons" switch />
            </label>
          </div>
        </div>

        <div v-show="settings.pause.buttons">
          <div v-show="settings.play.buttons" class="md-option-line">
            <div class="md-option-segment">Use same buttons as playback</div>
            <div class="md-option-segment md-option-segment_auto">
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
            :disabled="settings.pause.usePlayButtons && settings.play.buttons"
          >
            <div class="md-option-line">
              <div class="md-option-segment">Button #1 label</div>
              <div class="md-option-segment md-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.button1.label" />
                </label>
              </div>
            </div>

            <div class="md-option-line">
              <div class="md-option-segment">Button #1 URL</div>
              <div class="md-option-segment md-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.button1.url" />
                </label>
              </div>
            </div>

            <div class="md-option-line">
              <div class="md-option-segment">Button #2 label</div>
              <div class="md-option-segment md-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.button2.label" />
                </label>
              </div>
            </div>

            <div class="md-option-line">
              <div class="md-option-segment">Button #2 URL</div>
              <div class="md-option-segment md-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.pause.button2.url" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  `,
  data: () => ({
    settings: {
      installedVersion: undefined,
      latestVersion: undefined,
      appId: "927026912302362675",
      enabled: true,
      play: {
        enabled: true,
        details: "{title}",
        state: "{artist}",
        timestamp: "remaining",
        largeImage: "cover",
        largeImageKey: "applemusic",
        largeImageText: "{album}",
        smallImage: true,
        smallImageKey: "play",
        smallImageText: "Playing",
        buttons: false,
        button1: {
          label: "Listen on Cider",
          url: "{ciderUrl}",
        },
        button2: {
          label: "View on Apple Music",
          url: "{appleMusicUrl}",
        },
      },
      pause: {
        enabled: true,
        details: "{title}",
        state: "{artist}",
        largeImage: "cover",
        largeImageKey: "applemusic",
        largeImageText: "{album}",
        smallImage: true,
        smallImageKey: "pause",
        smallImageText: "Paused",
        buttons: false,
        usePlayButtons: false,
        button1: {
          label: "Listen on Cider",
          url: "{ciderUrl}",
        },
        button2: {
          label: "View on Apple Music",
          url: "{appleMusicUrl}",
        },
      },
    },
  }),
  watch: {
    settings: {
      handler() {
        updateLocalStorage(this.settings);
        ipcRenderer.invoke(`plugin.${PLUGIN_NAME}.setting`, this.settings);
      },
      deep: true,
    },
  },
  async mounted() {
    const settings = getLocalStorage();

    if (!latestVersion) {
      try {
        const { version } = await fetch(
          "https://raw.githubusercontent.com/down-bad/advanced-rpc/main/package.json"
        ).then((response) => response.json());
        latestVersion = version;
        settings.latestVersion = version;
        settings.installedVersion = installedVersion;
      } catch {
        console.log(`[Plugin][${PLUGIN_NAME}] Error checking for updates.`);
      }
    }

    if (settings) this.settings = settings;
  },
  methods: {
    reloadAdvancedRpc() {
      ipcRenderer.send("reloadAdvancedRpc");
    },
  },
});

class AdvancedRpcFrontend {
  constructor() {
    console.log(`[Plugin][${PLUGIN_NAME}] Frontend established.`);
    const menuEntry = new CiderFrontAPI.Objects.MenuEntry();
    menuEntry.id = window.uuidv4();
    menuEntry.name = "AdvancedRPC Settings";
    menuEntry.onClick = () => {
      app.appRoute("plugin/advancedrpc");
    };
    CiderFrontAPI.AddMenuEntry(menuEntry);
    ipcRenderer.invoke(`plugin.${PLUGIN_NAME}.setting`, getLocalStorage());
  }
}

const AdvancedRpc = new AdvancedRpcFrontend();
