export default Vue.component("arpc-changelog", {
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
    artworksUpdated: false,
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
    },
  },
  async mounted() {
    await AdvancedRpc.checkForUpdates("changelog");
  },
  methods: {
    update() {
      if (
        this.updating ||
        !this.versionData ||
        !this.versionData.updateAvailable ||
        this.gettingRemoteData
      ) {
        return;
      }

      if (this.updateDownloaded) {
        ipcRenderer.invoke("relaunchApp");
        return;
      }

      AdvancedRpc.update();
    },
  },
});
