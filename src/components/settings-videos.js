export default Vue.component("arpc-videos", {
  props: ["data"],
  template: `
  <div>
  <h2 @click="$emit('click-ee', 'videosClickEe')">Videos</h2>
  <h3>Play</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence on Video Playback</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="videos.play.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!videos.play.enabled">
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
            <input type="checkbox" v-model="videos.play.usePlayConfig" switch />
          </label>
        </div>
      </div>

      <div
        :disabled="videos.play.usePlayConfig && !(!videos.play.enabled || app.cfg.connectivity.discord_rpc.enabled || !enabled)"
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
              <input type="text" v-model="videos.play.details" />
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
              <input type="text" v-model="videos.play.state" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Timestamp</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.play.timestamp">
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
              <select class="arpc-select" v-model="videos.play.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.largeImage == 'custom'">
          <div class="arpc-option-segment">
            Large Image Key / URL
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.largeImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.largeImage != 'disabled'">
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
              <input type="text" v-model="videos.play.largeImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.play.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.smallImage == 'custom'">
          <div class="arpc-option-segment">
            Small Image Key / URL
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.play.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.play.smallImage != 'disabled'">
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
              <input type="text" v-model="videos.play.smallImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="videos.play.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="videos.play.buttons">
            <div class="arpc-option">
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
                <input type="text" v-model="videos.play.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.play.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="videos.play.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.play.button2.url" />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <h3>Pause</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
  >
    <div class="arpc-option">
      <div class="arpc-option-segment">Show Presence while Paused</div>
      <div class="arpc-option-segment arpc-option-segment_auto">
        <label>
          <input type="checkbox" v-model="videos.pause.enabled" switch />
        </label>
      </div>
    </div>

    <div :disabled="!videos.pause.enabled">
      <div class="arpc-option">
        <div
          class="arpc-option-segment"
          style="cursor: pointer"
          @click="$emit('sidebar-item', 'general')"
        >
          Use the General Pause Configuration
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input
              type="checkbox"
              v-model="videos.pause.usePauseConfig"
              switch
            />
          </label>
        </div>
      </div>

      <div
        :disabled="videos.pause.usePauseConfig && !(!videos.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
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
              <input type="text" v-model="videos.pause.details" />
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
              <input type="text" v-model="videos.pause.state" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Large Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.pause.largeImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.largeImage == 'custom'">
          <div class="arpc-option-segment">
            Large Image Key / URL
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.largeImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.largeImage != 'disabled'">
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
              <input type="text" v-model="videos.pause.largeImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Small Image</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <select class="arpc-select" v-model="videos.pause.smallImage">
                <option value="disabled">Off</option>
                <option value="cover">Thumbnail</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.smallImage == 'custom'">
          <div class="arpc-option-segment">
            Small Image Key / URL
            <small>Max 256 characters<br /></small>
          </div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="text" v-model="videos.pause.smallImageKey" />
            </label>
          </div>
        </div>

        <div class="arpc-option" v-show="videos.pause.smallImage != 'disabled'">
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
              <input type="text" v-model="videos.pause.smallImageText" />
            </label>
          </div>
        </div>

        <div class="arpc-option">
          <div class="arpc-option-segment">Enable Buttons</div>
          <div class="arpc-option-segment arpc-option-segment_auto">
            <label>
              <input type="checkbox" v-model="videos.pause.buttons" switch />
            </label>
          </div>
        </div>

        <Transition name="arpc-settings-slide">
          <div v-show="videos.pause.buttons">
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
                    v-model="videos.pause.usePlayButtons"
                    switch
                  />
                </label>
              </div>
            </div>

            <div
              class="arpc-option"
              :disabled="videos.pause.usePlayButtons && !(videos.pause.usePauseConfig || !videos.pause.enabled || !enabled || app.cfg.connectivity.discord_rpc.enabled)"
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
                <input type="text" v-model="videos.pause.button1.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.pause.button1.url" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label class="arpc-label">Label</label>
                <input type="text" v-model="videos.pause.button2.label" />

                <label class="arpc-label">URL</label>
                <input type="text" v-model="videos.pause.button2.url" />
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
    videos: null,
    enabled: false,
  }),
  watch: {
    videos() {
      this.$emit("update", "videos", this.videos);
    },
    data() {
      [this.videos, this.enabled] = this.data;
    },
  },
  created() {
    [this.videos, this.enabled] = this.data;
  },
});
