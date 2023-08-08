export default Vue.component("arpc-exit-button", {
  template: `
  <div class="arpc-exit-button">
  <div class="arpc-exit-button-icon" @click="exit">
    <svg
      aria-hidden="true"
      role="img"
      width="18"
      height="18"
      viewBox="0 0 24 24"
    >
      <path
        d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
      ></path>
    </svg>
  </div>
  <div class="arpc-exit-button-keybind">ESC</div>
</div>

  `,
  methods: {
    exit() {
      app.navigateBack();
    },
  },
});
