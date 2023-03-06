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
    <div
      class="arpc-modal-content"
      id="arpc-changelog"
      v-html="changelog"
    ></div>
    <div class="arpc-modal-footer">
      <div v-if="checkingForUpdate">Checking for updates...</div>
      <div v-else-if="latestVersion > installedVersion">
        There is a new update available!<br />Installed version:
        {{installedVersion}}
      </div>
      <div
        class="arpc-modal-footer-content"
        v-else-if="latestVersion <= installedVersion"
      >
        <div>No update available.</div>
        <div v-if="!remoteData?.hideLastArtworkUpdate">
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
        :disabled="checkingForUpdate || !latestVersion || latestVersion <= installedVersion || updating"
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
    checkingForUpdate() {
      return Vue.observable(window.AdvancedRpc).checkingForUpdate;
    },
    latestVersion() {
      return Vue.observable(window.AdvancedRpc).latestVersion;
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
    changelog() {
      return Vue.observable(window.AdvancedRpc).changelog;
    },
    updating() {
      return Vue.observable(window.AdvancedRpc).updateInProgress;
    },
  },
  async mounted() {
    await AdvancedRpc.checkForUpdates();
  },
  methods: {
    update() {
      AdvancedRpc.update();
    },
  },
});
