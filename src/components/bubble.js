export default Vue.component("arpc-bubble", {
  props: [
    "enabled",
    "message",
    "url",
    "icon",
    "color",
    "backgroundColor",
    "textColor",
    "iconColor",
    "versions",
    "versionsSmallerThan",
  ],
  template: `
  <div
  class="arpc-bubble"
  :style="{'border-color': color, 'background': backgroundColor || color + '1a', 'cursor': url ? 'pointer' : 'default'}"
  @click="url && doAction(url)"
>
  <div v-if="icon" class="arpc-bubble-icon">
    <svg
      v-if="icon === 'warning'"
      class="arpc-bubble-icon arpc-warning-icon"
      aria-hidden="false"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <path
        :style="{'fill': iconColor || color}"
        d="M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z"
      ></path>
    </svg>

    <svg
      v-else-if="icon === 'info'"
      class="arpc-bubble-icon"
      aria-hidden="false"
      width="16"
      height="16"
      viewBox="0 0 12 12"
    >
      <path
        :style="{'fill': iconColor || color}"
        d="M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z"
      ></path>
    </svg>

    <svg
      v-else-if="icon === 'download'"
      class="arpc-bubble-icon"
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        :style="{'fill': iconColor || color}"
        d="M16.293 9.293L17.707 10.707L12 16.414L6.29297 10.707L7.70697 9.293L11 12.586V2H13V12.586L16.293 9.293ZM18 20V18H20V20C20 21.102 19.104 22 18 22H6C4.896 22 4 21.102 4 20V18H6V20H18Z"
      ></path>
    </svg>
  </div>
  <div class="arpc-bubble-text" :style="{'color': textColor || ''}">
    {{message}}
  </div>
</div>

  `,
  methods: {
    doAction(item) {
      if (item.startsWith("arpc.")) {
        this.$emit("sidebar-item", item.replace("arpc.", ""));
      } else if (item.startsWith("modal.")) {
        this.$emit("set-modal", item.replace("modal.", ""));
      } else if (item.startsWith("theme.")) {
        this.$emit("set-theme", item.replace("theme.", ""));
      } else {
        window.open(item, "_blank");
      }
    },
  },
});
