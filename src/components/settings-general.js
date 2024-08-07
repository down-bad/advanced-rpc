export default Vue.component("arpc-general", {
  props: ["data"],
  template: `
<div>
  <div class="arpc-settings-header">
    <h2 @click="$emit('click-ee', 'generalClickEe')">Songs</h2>
    <arpc-exit-button v-if="flags?.exitButton"></arpc-exit-button>
  </div>

  <div class="arpc-state-selector" v-if="flags?.stateSelector">
    <h3
      :class="{'arpc-selected-state': state === 'play'}"
      @click="$emit('do-action', 'arpc.general.play')"
    >
      Play
    </h3>
    <h3
      :class="{'arpc-selected-state': state === 'pause'}"
      @click="$emit('do-action', 'arpc.general.pause')"
    >
      Pause
    </h3>
  </div>

  <h3 v-if="!flags?.stateSelector">Play</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state === 'play'"
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
      <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>

      <div class="arpc-option" v-if="flags?.activityTypes">
        <div class="arpc-option-segment">
          Activity Type
          <small
            v-if="flags?.discordTypeBugNotifText && settings.play.type !== 'playing'"
            >{{ flags.discordTypeBugNotifText }}</small
          >
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.play.type">
              <option value="listening">Listening</option>
              <option value="watching">Watching</option>
              <option value="playing">Playing</option>
              <option value="competing">Competing</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          First Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.details" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          Second Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.state" />
          </label>
        </div>
      </div>

      <div
        class="arpc-option"
        v-if="flags?.activityTypes && flags?.thirdLine && settings.play.type !== 'playing'"
      >
        <div class="arpc-option-segment">
          Third Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.largeImageText" />
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

      <div v-if="flags?.categorizedOptions" class="arpc-label">LARGE IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Large Image</div>
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
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Large Image Key / URL</div>
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
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Large Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.largeImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">SMALL IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Small Image</div>
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
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Small Image Key / URL</div>
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
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Small Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.play.smallImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
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
              <b>Max URL length</b>: 512 characters</small
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

  <h3 v-if="!flags?.stateSelector">Pause</h3>

  <div
    class="arpc-option-container"
    :disabled="app.cfg.connectivity.discord_rpc.enabled || !enabled"
    v-show="!flags?.stateSelector || state == 'pause'"
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
      <div v-if="flags?.categorizedOptions" class="arpc-label">INFO</div>
      <div class="arpc-option" v-if="flags?.activityTypes">
        <div class="arpc-option-segment">
          Activity Type
          <small
            v-if="flags?.discordTypeBugNotifText && settings.pause.type !== 'playing'"
            >{{ flags.discordTypeBugNotifText }}</small
          >
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <select class="arpc-select" v-model="settings.pause.type">
              <option value="listening">Listening</option>
              <option value="watching">Watching</option>
              <option value="playing">Playing</option>
              <option value="competing">Competing</option>
            </select>
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          First Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.details" />
          </label>
        </div>
      </div>

      <div class="arpc-option">
        <div class="arpc-option-segment">
          Second Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.state" />
          </label>
        </div>
      </div>

      <div
        class="arpc-option"
        v-if="flags?.activityTypes && flags?.thirdLine && settings.pause.type !== 'playing'"
      >
        <div class="arpc-option-segment">
          Third Line
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.largeImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">LARGE IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Large Image</div>
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
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Large Image Key / URL</div>
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
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Large Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.largeImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">SMALL IMAGE</div>
      <div class="arpc-option">
        <div v-if="flags?.categorizedOptions" class="arpc-option-segment">
          Image
        </div>
        <div v-else class="arpc-option-segment">Small Image</div>
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
          <div v-if="flags?.categorizedOptions">Image Key / URL</div>
          <div v-else>Small Image Key / URL</div>
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
          <div v-if="flags?.categorizedOptions">Text</div>
          <div v-else>Small Image Text</div>
          <small>Max 128 characters</small>
        </div>
        <div class="arpc-option-segment arpc-option-segment_auto">
          <label>
            <input type="text" v-model="settings.pause.smallImageText" />
          </label>
        </div>
      </div>

      <div v-if="flags?.categorizedOptions" class="arpc-label">BUTTONS</div>
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
                <b>Max URL length:</b> 512 characters</small
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
    state: "play",
    flags: null,
  }),
  watch: {
    play() {
      this.$emit("update", "play", this.settings.play);
    },
    pause() {
      this.$emit("update", "pause", this.settings.pause);
    },
    data() {
      [
        this.settings.play,
        this.settings.pause,
        this.enabled,
        this.state,
        this.flags,
      ] = this.data;
    },
  },
  created() {
    [
      this.settings.play,
      this.settings.pause,
      this.enabled,
      this.state,
      this.flags,
    ] = this.data;
  },
});
