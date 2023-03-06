export default Vue.component("arpc-sidebar", {
  template: `
  <div class="arpc-sidebar">
  <div>
    <div class="arpc-header">
      <h1 @click="$emit('click-ee', 'headerClickEe')">
        {{ remoteData?.header ?? "AdvancedRPC" }}
      </h1>
      <img
        @click="$emit('click-ee', 'decorationClickEe')"
        v-if="remoteData?.titleDecorations?.rightImage"
        :src="remoteData?.titleDecorations?.rightImage"
        :title="remoteData?.titleDecorations?.rightImageText"
        width="40"
        height="40"
        draggable="false"
      />
    </div>

    <div
      v-for="item in sideBarItems?.upper"
      v-if="checkVersions(item)"
      :class="{'arpc-sidebar-item': item.id !== 'separator' && item.id !== 'eyebrow', 'arpc-sidebar-separator': item.id === 'separator', 'arpc-sidebar-eyebrow': item.id === 'eyebrow', 'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && installedVersion < latestVersion}"
      @click="doAction(item)"
    >
      {{ item.dest === 'modal.changelog' && installedVersion < latestVersion ?
      item.updateText : item.text }}
    </div>
  </div>
  <div>
    <div
      v-for="item in sideBarItems?.lower"
      v-if="checkVersions(item)"
      :class="{'arpc-sidebar-item': item.id !== 'separator' && item.id !== 'eyebrow', 'arpc-sidebar-separator': item.id === 'separator', 'arpc-sidebar-eyebrow': item.id === 'eyebrow', 'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && installedVersion < latestVersion}"
      @click="doAction(item)"
    >
      {{ item.dest === 'modal.changelog' && installedVersion < latestVersion ?
      item.updateText : item.text }}
    </div>

    <footer @click="openLink('https://github.com/down-bad/advanced-rpc')">
      {{ versionInfo }}
    </footer>
  </div>
</div>

`,
  props: [
    "installedVersion",
    "latestVersion",
    "versionInfo",
    "remoteData",
    "frontend",
  ],
  data: () => ({
    sideBarItems: null,
  }),
  created() {
    this.sideBarItems = this.remoteData?.sideBarItems;

    if (!this.sideBarItems) {
      this.sideBarItems = {
        upper: [
          {
            text: "General",
            dest: "arpc.general",
            id: "general",
          },
          {
            text: "Videos",
            dest: "arpc.videos",
            id: "videos",
          },
          {
            text: "Radio Stations",
            dest: "arpc.radio",
            id: "radio",
          },
          {
            text: "Podcasts",
            dest: "arpc.podcasts",
            id: "podcasts",
          },
          {
            text: "Settings",
            dest: "arpc.settings",
            id: "settings",
          },
        ],
        lower: [
          {
            text: "Changelog",
            updateText: "Update available!",
            dest: "modal.changelog",
          },
        ],
      };
    }
  },
  methods: {
    doAction(item) {
      if (item.dest.startsWith("arpc.")) {
        this.$emit("sidebar-item", item.id);
      } else if (item.dest.startsWith("modal.")) {
        this.$emit("set-modal", item.dest.replace("modal.", ""));
      } else if (item.dest.startsWith("theme.")) {
        this.$emit("set-theme", item.dest.replace("theme.", ""));
      } else {
        this.openLink(item.dest);
      }
    },
    openLink(url) {
      window.open(url, "_blank");
    },
    checkVersions(param) {
      if (
        param.versions &&
        !param.versions.includes(AdvancedRpc.installedVersion)
      ) {
        return false;
      } else if (
        param.versionsSmallerThan &&
        AdvancedRpc.installedVersion >= param.versionsSmallerThan
      ) {
        return false;
      } else {
        return true;
      }
    },
  },
});
