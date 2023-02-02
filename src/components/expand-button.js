export default Vue.component("arpc-expand-button", {
  template: `
  <div
  @click="$emit('toggle-expandable')"
  class="arpc-expand-button"
  :style="{'transform': expanded ? 'scale(-1, 1) rotate(0deg)' : 'scale(-1, 1) rotate(90deg)'}"
>
  <svg
    class="arpc-expand-button"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="img"
  >
    <path
      fill="none"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M7 10L12 15 17 10"
      aria-hidden="true"
    ></path>
  </svg>
</div>

  `,
  props: ["expanded"],
});
