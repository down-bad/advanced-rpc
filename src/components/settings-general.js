export default Vue.component("arpc-general", {
  props: ["data"],
  template: `
  <div>
  <h2 @click="$emit('click-ee', 'generalClickEe')">General</h2>
  <h3>Play</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="settings.play.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!settings.play.enabled">
      <div class="arpc-option">
        <div class="arpc-option-segment">
          First Line (details)
          <small
            >Max 128 characters<br /><button
              class="arpc-button arpc-var-button"
              @click="$emit('set-modal', 'variables')"
            >
              {variables}
            </button>
          </small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.details" />
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
            <input type="text" v-model="settings.play.state" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Timestamp</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.timestamp">
              <option value="disabled">Off</option>
              <option value="remaining">Remaining time</option>
              <option value="elapsed">Elapsed time</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Large Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.largeImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.largeImage == 'custom'">
        <div class="arpc-option-segment">
          Large Image Key / URL
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.largeImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.largeImage != 'disabled'">
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
            <input type="text" v-model="settings.play.largeImageText" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Small Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.smallImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.smallImage == 'custom'">
        <div class="arpc-option-segment">
          Small Image Key / URL
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.smallImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.play.smallImage != 'disabled'">
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
            <input type="text" v-model="settings.play.smallImageText" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Enable Buttons</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="settings.play.buttons" switch />
          </label>
        </div>
      </div>

      <Transition name="arpc-settings-slide">
        <div class="arpc-option" v-show="settings.play.buttons">
          <div class="arpc-option-segment">
            Buttons <br v-show="settings.play.buttons" />
            <small
              ><b>Max label length</b>: 30 characters<br />
              <b>Max URL length</b>: 512 characters<br /><button
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
            <input type="text" v-model="settings.play.button1.label" />

            <label class="arpc-label">URL</label>
            <input type="text" v-model="settings.play.button1.url" />
          </div>
          <div
            class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
          >
            <label class="arpc-label">Label</label>
            <input type="text" v-model="settings.play.button2.label" />

            <label class="arpc-label">URL</label>
            <input type="text" v-model="settings.play.button2.url" />
          </div></div
      ></Transition>
    </div>
  </div>

  <!-- Pause -->
  <h3>Pause</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence while Paused</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="settings.pause.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!settings.pause.enabled">
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
            <input type="text" v-model="settings.pause.details" />
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
            <input type="text" v-model="settings.pause.state" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Large Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.pause.largeImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.largeImage == 'custom'">
        <div class="arpc-option-segment">
          Large Image Key / URL
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.largeImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.largeImage != 'disabled'">
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
            <input type="text" v-model="settings.pause.largeImageText" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Small Image</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.pause.smallImage">
              <option value="disabled">Off</option>
              <option value="cover-static">Artwork</option>
              <option value="cover">Animated artwork</option>
              <option value="custom">Custom</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.smallImage == 'custom'">
        <div class="arpc-option-segment">
          Small Image Key / URL
          <small>Max 256 characters<br /></small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.smallImageKey" />
          </label>
        </div>
      </div>

      <div class="arpc-option" v-show="settings.pause.smallImage != 'disabled'">
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
            <input type="text" v-model="settings.pause.smallImageText" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">Enable Buttons</div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="checkbox" v-model="settings.pause.buttons" switch />
          </label>
        </div>
      </div>

      <Transition name="arpc-settings-slide">
        <div v-show="settings.pause.buttons">
          <div class="arpc-option">
            <div class="arpc-option-segment">
              Use Playback Buttons
              <small>Use the same buttons as the ones shown on playback.</small>
            </div>
            <div class="arpc-option-segment arpc-option-segment_auto">
              <label>
                <input
                  type="checkbox"
                  v-model="settings.pause.usePlayButtons"
                  switch
                />
              </label>
            </div>
          </div>

          <div
            class="arpc-option"
            :disabled="settings.pause.usePlayButtons && !(!settings.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
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
              <input type="text" v-model="settings.pause.button1.label" />

              <label class="arpc-label">URL</label>
              <input type="text" v-model="settings.pause.button1.url" />
            </div>
            <div
              class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
            >
              <label class="arpc-label">Label</label>
              <input type="text" v-model="settings.pause.button2.label" />

              <label class="arpc-label">URL</label>
              <input type="text" v-model="settings.pause.button2.url" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</div>

`,
  data: () => ({
    settings: {
      play: null,
      pause: null,
    },
    enabled: false,
  }),
  watch: {
    play() {
      this.$emit("update", "play", this.settings.play);
    },
    pause() {
      this.$emit("update", "pause", this.settings.pause);
    },
    data() {
      [this.settings.play, this.settings.pause, this.enabled] = this.data;
    },
  },
  created() {
    [this.settings.play, this.settings.pause, this.enabled] = this.data;
  },
});
