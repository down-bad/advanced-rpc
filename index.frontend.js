/* Version: 1.3.3 - September 16, 2022 03:24:00 */
'use strict';

class AdvancedRpcFrontend {
  PLUGIN_NAME = "AdvancedRPC";
  SETTINGS_KEY = "settings";
  remoteData = null;
  installedVersion = "1.3.3";
  latestVersion = undefined;
  changelog = undefined;
  unappliedSettings = false;
  updateInProgress = false;

  constructor() {
    console.log(`[Plugin][${this.PLUGIN_NAME}] Frontend established.`);
    CiderFrontAPI.StyleSheets.Add("./plugins/gh_510140500/advancedrpc.less");
    const menuEntry = new CiderFrontAPI.Objects.MenuEntry();
    menuEntry.id = window.uuidv4();
    menuEntry.name = "AdvancedRPC Settings";

    menuEntry.onClick = () => {
      app.appRoute("plugin/advancedrpc");
    };

    CiderFrontAPI.AddMenuEntry(menuEntry);
    ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.initSettings`, this.getLocalStorage());
    this.checkForUpdates(this.init = true);
  }

  getLocalStorage() {
    try {
      const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`);
      return JSON.parse(data);
    } catch (error) {
      updateLocalStorage(null);
      return null;
    }
  }

  updateLocalStorage(data) {
    localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`, JSON.stringify(data));
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
