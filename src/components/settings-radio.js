export default Vue.component("arpc-radio", {
  props: ["data"],
  template: `
  <div>
  <h2 @click="$emit('click-ee', 'radioClickEe')">Radio Stations</h2>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Radio Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="radio.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!radio.enabled">
      <div class="arpc-option">
        <div
          class="arpc-option-segment"
          style="cursor: pointer"
          @click="$emit('sidebar-item', 'general')"
        >
          Use the General Playback Configuration
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="radio.usePlayConfig" switch />
          </label>
        </div>
      </div>

      <div
        :disabled="radio.usePlayConfig && !(!radio.enabled || app.cfg.connectivity.discord_rpc.enabled || !enabled)"
      >
        <div class="arpc-option">
          <div class="arpc-option-segment">
            First Line (details)
            <small
              >Max 128 characters<br /><button
                class="arpc-button arpc-var-button"
                @click="$emit('set-modal', 'variables')"
              >
                {variables}
              </button></small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.details" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">
            Second Line (state)
            <small
              >Max 128 characters<br /><button
                class="arpc-button arpc-var-button"
                @click="$emit('set-modal', 'variables')"
              >
                {variables}
              </button></small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.state" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Timestamp</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="radio.timestamp">
                <option value="disabled">Off</option>
                <option value="elapsed">Elapsed time</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Large Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="radio.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Radio cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.largeImage == 'custom'">
          <div class="arpc-option-segment">
            Large Image Key / URL
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.largeImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.largeImage != 'disabled'">
          <div class="arpc-option-segment">
            Large Image Text
            <small
              >Max 128 characters<br /><button
                class="arpc-button arpc-var-button"
                @click="$emit('set-modal', 'variables')"
              >
                {variables}
              </button></small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.largeImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="radio.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Radio cover</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.smallImage == 'custom'">
          <div class="arpc-option-segment">
            Small Image Key / URL
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="radio.smallImage != 'disabled'">
          <div class="arpc-option-segment">
            Small Image Text
            <small
              >Max 128 characters<br /><button
                class="arpc-button arpc-var-button"
                @click="$emit('set-modal', 'variables')"
              >
                {variables}
              </button></small
            >
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="radio.smallImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="radio.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="radio.buttons">
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Use Playback Buttons
                <small
                  >Use the same buttons as the ones shown on playback.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="radio.usePlayButtons"
                    switch
                  />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              :disabled="radio.usePlayButtons && !(radio.usePlayConfig && !radio.enabled || app.cfg.connectivity.discord_rpc.enabled || !enabled)"
            >
              <div class="arpc-option-segment">
                Buttons <br />
                <small
                  ><b>Max label length:</b> 30 characters<br />
                  <b>Max URL length:</b> 512 characters<br /><button
                    class="arpc-button arpc-var-button"
                    @click="$emit('set-modal', 'variables')"
                  >
                    {variables}
                  </button></small
                >
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="radio.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="radio.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="radio.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="radio.button2.url" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</div>

`,
  data: () => ({
    radio: null,
    enabled: false,
  }),
  watch: {
    radio() {
      this.$emit("update", "radio", this.radio);
    },
    data() {
      [this.radio, this.enabled] = this.data;
    },
  },
  created() {
    [this.radio, this.enabled] = this.data;
  },
});
