export default Vue.component("arpc-changelog", {
  template: `
  <div class="arpc-modal-layer" @click.self="$emit('close-changelog')">
  <div class="arpc-modal-window arpc-changelog-window">
    <div class="arpc-modal-header">
      <div>What's New</div>
      <arpc-close-button @close="$emit('close-changelog')"></arpc-close-button>
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