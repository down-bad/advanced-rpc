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
  <div class="arpc-settings">
  <h1>AdvancedRPC</h1>

  <div
    class="arpc-bubble arpc-warning"
    v-show="app.cfg.general?.discordrpc?.enabled || app.cfg.connectivity?.discord_rpc?.enabled"
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
          fill-rule="evenodd"
          clip-rule="evenodd"
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
    v-show="$root.cfg.general.privateEnabled && settings.respectPrivateSession"
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
      v-if="settings.installedVersion < settings.latestVersion"
    >
      <div class="arpc-option-segment">
        <b>There is a new version available!</b>
        <small>
          Installed version: {{settings.installedVersion}}<br />
          Latest version: {{settings.latestVersion}}
        </small>
      </div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <button class="arpc-button" @click="update()">Update</button>
      </div>
    </div>

    <div
      :disabled="app.cfg.general?.discordrpc?.enabled || app.cfg.connectivity?.discord_rpc?.enabled"
    >
      <div class="arpc-option">
        <div class="arpc-option-segment">Enable AdvancedRPC</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="settings.enabled" switch />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          Hide while Private Session is enabled
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
          Application ID
          <small>Restart recommended</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.appId" />
          </label>
        </div>
      </div>

      <div class="arpc-option" :disabled="!settings.enabled">
        <div class="arpc-option-segment">Reload AdvancedRPC</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <button class="arpc-button" @click="reloadAdvancedRpc()">
            Reload
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Play -->
  <h2>Play</h2>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.general?.discordrpc?.enabled || app.cfg.connectivity?.discord_rpc?.enabled || !settings.enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="settings.play.enabled" switch />
        </label>
      </div>
    </div>

    <div v-show="settings.play.enabled">
      <div class="arpc-option">
        <div class="arpc-option-segment">
          First Line (details)
          <small
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
          >
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
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
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
            <select class="arpc-select" v-model="settings.play.largeImage">
              <option value="disabled">Off</option>
              <option value="cover">Artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.largeImage == 'custom'">
        <div class="arpc-option-segment">
          Large Image Key / URL <small>Max 256 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.largeImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.largeImage != 'disabled'">
        <div class="arpc-option-segment">
          Large Image Text
          <small
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
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
            <input type="checkbox" v-model="settings.play.smallImage" switch />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.smallImage">
        <div class="arpc-option-segment">
          Small Image Key / URL <small>Max 256 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.smallImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.smallImage">
        <div class="arpc-option-segment">
          Small Image Text
          <small
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
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
            <input type="checkbox" v-model="settings.play.buttons" switch />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.buttons">
        <div class="arpc-option-segment">
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
        <div
          class="arpc-option-segment arpc-option-segment_auto arpc-button-segment"
        >
          <label>Label</label>
          <input type="text" v-model="settings.play.button1.label" />

          <label>URL</label>
          <input type="text" v-model="settings.play.button1.url" />
        </div>
        <div
          class="arpc-option-segment arpc-option-segment_auto arpc-button-segment"
        >
          <label>Label</label>
          <input type="text" v-model="settings.play.button2.label" />

          <label>URL</label>
          <input type="text" v-model="settings.play.button2.url" />
        </div>
      </div>
    </div>
  </div>

  <!-- Pause -->
  <h2>Pause</h2>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.general?.discordrpc?.enabled || app.cfg.connectivity?.discord_rpc?.enabled || !settings.enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence while Paused</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="settings.pause.enabled" switch />
        </label>
      </div>
    </div>

    <div v-show="settings.pause.enabled">
      <div class="arpc-option">
        <div class="arpc-option-segment">
          First Line (details)
          <small
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
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
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
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
            <select class="arpc-select" v-model="settings.pause.largeImage">
              <option value="disabled">Off</option>
              <option value="cover">Artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.largeImage == 'custom'">
        <div class="arpc-option-segment">
          Large Image Key / URL <small>Max 256 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.largeImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.largeImage != 'disabled'">
        <div class="arpc-option-segment">
          Large Image Text
          <small
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
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
            <input type="checkbox" v-model="settings.pause.smallImage" switch />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.smallImage">
        <div class="arpc-option-segment">
          Small Image Key / URL <small>Max 256 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.smallImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.smallImage">
        <div class="arpc-option-segment">
          Small Image Text
          <small
            >Max 128 characters<br /><b>Variables:</b> {artist}, {composer},
            {title}, {album}, {trackNumber}</small
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
            <input type="checkbox" v-model="settings.pause.buttons" switch />
          </label>
        </div>
      </div>

      <div
        v-show="settings.pause.buttons && settings.play.buttons"
        class="arpc-option"
      >
        <div class="arpc-option-segment">Use Playback Buttons</div>
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
        v-show="settings.pause.buttons"
        :disabled="settings.pause.usePlayButtons && settings.play.buttons"
      >
        <div class="arpc-option-segment">
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
        <div
          class="arpc-option-segment arpc-option-segment_auto arpc-button-segment"
        >
          <label>Label </label>
          <input type="text" v-model="settings.pause.button1.label" />

          <label>URL</label>
          <input type="text" v-model="settings.pause.button1.url" />
        </div>
        <div
          class="arpc-option-segment arpc-option-segment_auto arpc-button-segment"
        >
          <label>Label</label>
          <input type="text" v-model="settings.pause.button2.label" />

          <label>URL</label>
          <input type="text" v-model="settings.pause.button2.url" />
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
      respectPrivateSession: true,
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
        if (latestVersion > installedVersion)
          console.log(
            `[Plugin][${PLUGIN_NAME}] There is a newer version available.`
          );
      } catch {
        console.log(`[Plugin][${PLUGIN_NAME}] Error checking for updates.`);
      }
    }

    if (settings) {
      settings.latestVersion = latestVersion;
      settings.installedVersion = installedVersion;
      this.settings = settings;
    } else {
      this.settings = {
        installedVersion: undefined,
        latestVersion: undefined,
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
      };
    }
  },
  methods: {
    update() {
      let msg =
        "Are you sure you want to update AdvancedRPC? Your configuration won't be lost.";
      app.confirm(msg, (res) => {
        if (res) {
          ipcRenderer.once("plugin-installed", (event, arg) => {
            if (arg.success) {
              notyf.success("AdvancedRPC has been successfully updated");
              app.confirm(
                "AdvancedRPC has been successfully updated, press OK to relaunch Cider.",
                (ok) => {
                  if (ok) {
                    ipcRenderer.invoke("relaunchApp");
                  } else {
                    return;
                  }
                }
              );
            } else {
              notyf.error("Error updating AdvancedRPC");
            }
          });
          ipcRenderer.invoke(
            "get-github-plugin",
            "https://github.com/down-bad/advanced-rpc"
          );
        }
      });
    },
    reloadAdvancedRpc() {
      ipcRenderer.send("reloadAdvancedRpc");
    },
  },
});

class AdvancedRpcFrontend {
  constructor() {
    console.log(`[Plugin][${PLUGIN_NAME}] Frontend established.`);
    CiderFrontAPI.StyleSheets.Add("./plugins/gh_510140500/advancedrpc.less");
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
