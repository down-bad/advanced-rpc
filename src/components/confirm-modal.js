export default Vue.component("arpc-confirm-modal", {
  template: `
  <div
  class="arpc-modal-layer"
  id="arpc-confirm-modal"
  @click.self="$emit('close-modal')"
>
  <div class="arpc-modal-window">
    <div class="arpc-modal-header">
      <div>{{ title }}</div>
      <arpc-close-button @close="$emit('close-modal')"></arpc-close-button>
    </div>
    <div class="arpc-modal-content">{{ description }}</div>
    <div class="arpc-modal-footer">
      <div></div>
      <div>
        <button
          class="arpc-button arpc-button-underline"
          @click="$emit('close-modal')"
        >
          Cancel
        </button>
        <button class="arpc-button arpc-button-red" @click="confirm()">
          Confirm
        </button>
      </div>
    </div>
  </div>
</div>

  `,
  props: ["title", "description"],
  methods: {
    confirm() {
      this.$emit("confirm");
      this.$emit("close-modal");
    },
  },
});
