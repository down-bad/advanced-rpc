export default Vue.component("arpc-sidebar", {
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
  props: [
    "installedVersion",
    "versionData",
    "versionInfo",
    "remoteData",
    "frontend",
  ],
  data: () => ({
    sideBarItems: null,
    version: null,
    versionDate: null,
  }),
  computed: {
    computedRemoteData() {
      const data = Vue.observable(this.remoteData);
      this.sidebarItems(data);
      return data;
    },
  },
  created() {
    this.sidebarItems(this.computedRemoteData);

    this.version = AdvancedRpc.installedVersion;
    this.versionDate = AdvancedRpc.versionDate;
  },
  methods: {
    footerText(text) {
      return text
        .replaceAll("$version", this.version)
        .replaceAll("$date", this.versionDate);
    },
    sidebarItems(remoteData) {
      this.sideBarItems = remoteData?.sideBarItems;

      if (!this.sideBarItems) {
        this.sideBarItems = {
          upper: [
            {
              text: "Songs",
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
              text: "Variables",
              dest: "modal.variables",
            },
            {
              text: "Changelog",
              updateText: "Update available!",
              dest: "modal.changelog",
            },
          ],
        };
      }
    },
    openLink(url) {
      window.open(url, "_blank");
    },
  },
});
