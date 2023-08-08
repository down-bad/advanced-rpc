export default Vue.component("arpc-custom-modal", {
  template: `
  <div
  class="arpc-modal-layer"
  :id="'arpc-modal-' + modalData?.id"
  @click.self="$emit('do-action', 'modal.close')"
>
  <div class="arpc-modal-window" :style="modalData?.style">
    <div class="arpc-modal-header">
      <div>{{modalData?.title}}</div>
      <arpc-close-button
        @close="$emit('do-action', 'modal.close')"
      ></arpc-close-button>
    </div>
    <div class="arpc-modal-content">
      <div v-if="modalHtml" v-html="modalHtml"></div>
      <div v-else>
        <arpc-spinner></arpc-spinner>
      </div>
    </div>

    <div class="arpc-modal-footer" v-if="modalHtml && modalData?.footer">
      <div>{{modalData?.footer.text}}</div>
      <div v-if="modalData?.footer.buttons">
        <button
          v-for="(button, index) in modalData.footer.buttons"
          :key="index"
          :class="'arpc-button arpc-button-' + (button.type || 'blue')"
          @click="$emit('do-action', button.action || 'modal.close')"
        >
          {{button.text}}
        </button>
      </div>
    </div>
  </div>
</div>

  `,
  props: ["modalData"],
  data: () => ({
    modalHtml: null,
  }),
  async created() {
    try {
      this.modalHtml = await fetch(this.modalData.htmlUrl).then((res) =>
        res.text()
      );
    } catch (error) {
      this.modalHtml = "Failed fetching modal content.";
    }
  },
  async mounted() {
    // await AdvancedRpc.checkForUpdates("changelog");
  },
  methods: {},
});
