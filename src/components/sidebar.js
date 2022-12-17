export default Vue.component("arpc-sidebar", {
  template: `
  <div class="arpc-sidebar">
  <div>
    <div class="arpc-header">
      <h1>AdvancedRPC</h1>
      <img
        v-if="remoteData?.titleDecorations?.rightImage"
        :src="remoteData?.titleDecorations?.rightImage"
        width="40"
        height="40"
        draggable="false"
      />
    </div>

    <div
      class="arpc-sidebar-item"
      v-for="item in sidebarItems?.upper"
      :class="{'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && installedVersion < latestVersion}"
      @click="changeSidebarItem(item)"
    >
      {{ item.dest === 'modal.changelog' && installedVersion < latestVersion ?
      item.updateText : item.text }}
    </div>
  </div>
  <div>
    <div
      class="arpc-sidebar-item"
      v-for="item in sidebarItems?.lower"
      :class="{'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && installedVersion < latestVersion}"
      @click="changeSidebarItem(item)"
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
    sidebarItems: null,
  }),
  created() {
    this.sidebarItems = this.remoteData?.sidebarItems;

    if (!this.sidebarItems) {
      this.sidebarItems = {
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
    changeSidebarItem(item) {
      if (item.dest.startsWith("arpc.")) {
        this.$emit("sidebar-item", item.id);
      } else if (item.dest.startsWith("modal.")) {
        this.$emit("set-modal", item.dest.replace("modal.", ""));
      } else {
        this.openLink(item.dest);
      }
    },
    setModal(modal) {
      this.$emit("set-modal", modal);
    },
    openLink(url) {
      window.open(url, "_blank");
    },
  },
});
