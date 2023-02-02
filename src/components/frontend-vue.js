export default Vue.component("plugin.advancedrpc", {
  template: `
  <div class="advancedrpc">
  <Transition name="arpc-modal">
    <arpc-changelog
      v-if="modal === 'changelog'"
      @close-changelog="setModal('')"
    />

    <arpc-variables-modal
      v-if="modal === 'variables'"
      @close-variables="setModal('')"
    />

    <arpc-confirm-modal
      v-if="modal === 'reset-settings'"
      title="Reset Settings"
      description="This will reset your AdvancedRPC configuration to default. Are you sure you want to continue?"
      @confirm="resetSettings()"
      @close-modal="setModal('')"
    />
  </Transition>

  <Transition name="arpc-fade">
    <div class="arpc-modal-backdrop" v-if="modal"></div
  ></Transition>

  <div class="arpc-page">
    <Transition name="arpc-slide">
      <div class="arpc-unapplied-settings-alert" v-show="unappliedSettings">
        <div class="arpc-unapplied-settings-content">
          <div v-if="settings.applySettings === 'state'">
            Your changes will apply on playback state change. Apply now?
          </div>
          <div
            @click="clickingEe('unappliedTextEe')"
            v-else-if="settings.applySettings === 'manually'"
          >
            You've made changes, apply them to update your Discord presence.
          </div>
          <div v-else>;)</div>
          <div class="arpc-unapplied-settings-options">
            <button
              class="arpc-button arpc-button-underline"
              @click="resetChanges()"
            >
              Reset
            </button>
            <button
              class="arpc-button arpc-button-green"
              @click="updateSettings()"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div></Transition
    >

    <div class="arpc-settings">
      <arpc-sidebar
        :installedVersion="installedVersion"
        :latestVersion="latestVersion"
        :versionInfo="versionInfo"
        :remoteData="remoteData"
        :frontend="frontend"
        @sidebar-item="changeSidebarItem"
        @set-modal="setModal"
        @set-theme="unlockTheme"
        @click-ee="clickingEe"
      ></arpc-sidebar>

      <div class="arpc-content">
        <Transition name="arpc-settings-slide">
          <div
            class="arpc-bubbles-bar arpc-expandable"
            @click="toggleBubbles()"
            v-if="bubbles.length > 0 || ($root.cfg.general.privateEnabled && settings.respectPrivateSession) || app.cfg.connectivity.discord_rpc.enabled"
          >
            <div
              class="arpc-bubbles-count"
              :style="{'opacity': frontend.bubblesExpanded ? 0 : 1}"
            >
              <div v-if="bubbles.length === 1">{{ bubbles.length }} notice</div>
              <div v-else>{{ bubbles.length }} notices</div>
            </div>
            <arpc-expand-button
              :expanded="frontend.bubblesExpanded"
            ></arpc-expand-button></div
        ></Transition>

        <Transition name="arpc-settings-slide">
          <div v-show="frontend.bubblesExpanded">
            <Transition name="arpc-settings-slide">
              <arpc-bubble
                v-if="$root.cfg.general.privateEnabled && settings.respectPrivateSession"
                v-bind="privateSessionBubble"
              ></arpc-bubble
            ></Transition>

            <Transition name="arpc-settings-slide">
              <arpc-bubble
                v-if="app.cfg.connectivity.discord_rpc.enabled"
                v-bind="ciderRpcBubble"
              ></arpc-bubble
            ></Transition>

            <arpc-bubble
              v-for="bubble in bubbles"
              v-if="bubble?.enabled"
              v-bind="bubble"
              @sidebar-item="changeSidebarItem"
              @set-modal="setModal"
              @set-theme="unlockTheme"
            ></arpc-bubble></div
        ></Transition>

        <!-- General -->
        <div v-show="frontend.sidebar === 'general'">
          <!-- Play -->
          <h2 @click="clickingEe('generalClickEe')">General</h2>
          <h3>Play</h3>

          <div
            class="arpc-option-container"
            :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
          >
            <div class="arpc-option">
              <div class="arpc-option-segment">Show Presence on Playback</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.play.enabled"
                    switch
                  />
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
                      @click="setModal('variables')"
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
                      @click="setModal('variables')"
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
                    <select
                      class="arpc-select"
                      v-model="settings.play.timestamp"
                    >
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
                    <select
                      class="arpc-select"
                      v-model="settings.play.largeImage"
                    >
                      <option value="disabled">Off</option>
                      <option value="cover-static">Artwork</option>
                      <option value="cover">Animated artwork</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                </div>
              </div>

              <div
                class="arpc-option"
                v-show="settings.play.largeImage == 'custom'"
              >
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

              <div
                class="arpc-option"
                v-show="settings.play.largeImage != 'disabled'"
              >
                <div class="arpc-option-segment">
                  Large Image Text
                  <small
                    >Max 128 characters<br /><button
                      class="arpc-button arpc-var-button"
                      @click="setModal('variables')"
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
                    <select
                      class="arpc-select"
                      v-model="settings.play.smallImage"
                    >
                      <option value="disabled">Off</option>
                      <option value="cover-static">Artwork</option>
                      <option value="cover">Animated artwork</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                </div>
              </div>

              <div
                class="arpc-option"
                v-show="settings.play.smallImage == 'custom'"
              >
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

              <div
                class="arpc-option"
                v-show="settings.play.smallImage != 'disabled'"
              >
                <div class="arpc-option-segment">
                  Small Image Text
                  <small
                    >Max 128 characters<br /><button
                      class="arpc-button arpc-var-button"
                      @click="setModal('variables')"
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
                    <input
                      type="checkbox"
                      v-model="settings.play.buttons"
                      switch
                    />
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
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div
                    class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                  >
                    <label>Label</label>
                    <input type="text" v-model="settings.play.button1.label" />

                    <label>URL</label>
                    <input type="text" v-model="settings.play.button1.url" />
                  </div>
                  <div
                    class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                  >
                    <label>Label</label>
                    <input type="text" v-model="settings.play.button2.label" />

                    <label>URL</label>
                    <input type="text" v-model="settings.play.button2.url" />
                  </div></div
              ></Transition>
            </div>
          </div>

          <!-- Pause -->
          <h3>Pause</h3>

          <div
            class="arpc-option-container"
            :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
          >
            <div class="arpc-option">
              <div class="arpc-option-segment">Show Presence while Paused</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.pause.enabled"
                    switch
                  />
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
                      @click="setModal('variables')"
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
                      @click="setModal('variables')"
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
                    <select
                      class="arpc-select"
                      v-model="settings.pause.largeImage"
                    >
                      <option value="disabled">Off</option>
                      <option value="cover-static">Artwork</option>
                      <option value="cover">Animated artwork</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                </div>
              </div>

              <div
                class="arpc-option"
                v-show="settings.pause.largeImage == 'custom'"
              >
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

              <div
                class="arpc-option"
                v-show="settings.pause.largeImage != 'disabled'"
              >
                <div class="arpc-option-segment">
                  Large Image Text
                  <small
                    >Max 128 characters<br /><button
                      class="arpc-button arpc-var-button"
                      @click="setModal('variables')"
                    >
                      {variables}
                    </button></small
                  >
                </div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="text"
                      v-model="settings.pause.largeImageText"
                    />
                  </label>
                </div>
              </div>

              <div class="arpc-option">
                <div class="arpc-option-segment">Small Image</div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <select
                      class="arpc-select"
                      v-model="settings.pause.smallImage"
                    >
                      <option value="disabled">Off</option>
                      <option value="cover-static">Artwork</option>
                      <option value="cover">Animated artwork</option>
                      <option value="custom">Custom</option>
                    </select>
                  </label>
                </div>
              </div>

              <div
                class="arpc-option"
                v-show="settings.pause.smallImage == 'custom'"
              >
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

              <div
                class="arpc-option"
                v-show="settings.pause.smallImage != 'disabled'"
              >
                <div class="arpc-option-segment">
                  Small Image Text
                  <small
                    >Max 128 characters<br /><button
                      class="arpc-button arpc-var-button"
                      @click="setModal('variables')"
                    >
                      {variables}
                    </button></small
                  >
                </div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="text"
                      v-model="settings.pause.smallImageText"
                    />
                  </label>
                </div>
              </div>

              <div class="arpc-option">
                <div class="arpc-option-segment">Enable Buttons</div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="checkbox"
                      v-model="settings.pause.buttons"
                      switch
                    />
                  </label>
                </div>
              </div>

              <Transition name="arpc-settings-slide">
                <div v-show="settings.pause.buttons">
                  <div class="arpc-option">
                    <div class="arpc-option-segment">
                      Use Playback Buttons
                      <small
                        >Use the same buttons as the ones shown on
                        playback.</small
                      >
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
                    :disabled="settings.pause.usePlayButtons && !(!settings.pause.enabled || !settings.enabled || app.cfg.connectivity.discord_rpc.enabled)"
                  >
                    <div class="arpc-option-segment">
                      Buttons <br />
                      <small
                        ><b>Max label length:</b> 30 characters<br />
                        <b>Max URL length:</b> 512 characters<br /><button
                          class="arpc-button arpc-var-button"
                          @click="setModal('variables')"
                        >
                          {variables}
                        </button></small
                      >
                    </div>
                    <div
                      class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                    >
                      <label>Label</label>
                      <input
                        type="text"
                        v-model="settings.pause.button1.label"
                      />

                      <label>URL</label>
                      <input type="text" v-model="settings.pause.button1.url" />
                    </div>
                    <div
                      class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                    >
                      <label>Label</label>
                      <input
                        type="text"
                        v-model="settings.pause.button2.label"
                      />

                      <label>URL</label>
                      <input type="text" v-model="settings.pause.button2.url" />
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>

        <!-- Podcasts -->
        <div v-show="frontend.sidebar === 'podcasts'">
          <h2 @click="clickingEe('podcastsClickEe')">Podcasts</h2>
          <h3>Play</h3>

          <div
            class="arpc-option-container"
            :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
          >
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Show Presence on Podcast Playback
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.podcasts.play.enabled"
                    switch
                  />
                </label>
              </div>
            </div>

            <div :disabled="!settings.podcasts.play.enabled">
              <div class="arpc-option">
                <div
                  class="arpc-option-segment"
                  style="cursor: pointer"
                  @click="changeSidebarItem('general')"
                >
                  Use the General Playback Configuration
                </div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="checkbox"
                      v-model="settings.podcasts.play.usePlayConfig"
                      switch
                    />
                  </label>
                </div>
              </div>

              <div
                :disabled="settings.podcasts.play.usePlayConfig && !(!settings.podcasts.play.enabled || app.cfg.connectivity.discord_rpc.enabled || !settings.enabled)"
              >
                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    First Line (details)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.play.details"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    Second Line (state)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.play.state"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Timestamp</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.podcasts.play.timestamp"
                      >
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
                      <select
                        class="arpc-select"
                        v-model="settings.podcasts.play.largeImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Podcast cover</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.play.largeImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Large Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.play.largeImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.play.largeImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Large Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.play.largeImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Small Image</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.podcasts.play.smallImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Podcast cover</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.play.smallImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Small Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.play.smallImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.play.smallImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Small Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.play.smallImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Enable Buttons</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="checkbox"
                        v-model="settings.podcasts.play.buttons"
                        switch
                      />
                    </label>
                  </div>
                </div>

                <Transition name="arpc-settings-slide">
                  <div v-show="settings.podcasts.play.buttons">
                    <div class="arpc-option">
                      <div class="arpc-option-segment">
                        Buttons <br />
                        <small
                          ><b>Max label length:</b> 30 characters<br />
                          <b>Max URL length:</b> 512 characters<br /><button
                            class="arpc-button arpc-var-button"
                            @click="setModal('variables')"
                          >
                            {variables}
                          </button></small
                        >
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.play.button1.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.play.button1.url"
                        />
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.play.button2.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.play.button2.url"
                        />
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
            :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
          >
            <div class="arpc-option">
              <div class="arpc-option-segment">Show Presence while Paused</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.podcasts.pause.enabled"
                    switch
                  />
                </label>
              </div>
            </div>

            <div :disabled="!settings.podcasts.pause.enabled">
              <div class="arpc-option">
                <div
                  class="arpc-option-segment"
                  style="cursor: pointer"
                  @click="changeSidebarItem('general')"
                >
                  Use the General Pause Configuration
                </div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="checkbox"
                      v-model="settings.podcasts.pause.usePauseConfig"
                      switch
                    />
                  </label>
                </div>
              </div>

              <div
                :disabled="settings.podcasts.pause.usePauseConfig && !(!settings.podcasts.pause.enabled || !settings.enabled || app.cfg.connectivity.discord_rpc.enabled)"
              >
                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    First Line (details)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.pause.details"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    Second Line (state)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.pause.state"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Large Image</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.podcasts.pause.largeImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Podcast cover</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.pause.largeImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Large Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.pause.largeImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.pause.largeImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Large Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.pause.largeImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Small Image</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.podcasts.pause.smallImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Podcast cover</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.pause.smallImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Small Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.pause.smallImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.podcasts.pause.smallImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Small Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.podcasts.pause.smallImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Enable Buttons</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="checkbox"
                        v-model="settings.podcasts.pause.buttons"
                        switch
                      />
                    </label>
                  </div>
                </div>

                <Transition name="arpc-settings-slide">
                  <div v-show="settings.podcasts.pause.buttons">
                    <div class="arpc-option">
                      <div class="arpc-option-segment">
                        Use Playback Buttons
                        <small
                          >Use the same buttons as the ones shown on
                          playback.</small
                        >
                      </div>
                      <div class="arpc-option-segment arpc-option-segment_auto">
                        <label>
                          <input
                            type="checkbox"
                            v-model="settings.podcasts.pause.usePlayButtons"
                            switch
                          />
                        </label>
                      </div>
                    </div>

                    <div
                      class="arpc-option"
                      :disabled="settings.podcasts.pause.usePlayButtons && !(settings.podcasts.pause.usePauseConfig || !settings.podcasts.pause.enabled || !settings.enabled || app.cfg.connectivity.discord_rpc.enabled)"
                    >
                      <div class="arpc-option-segment">
                        Buttons <br />
                        <small
                          ><b>Max label length:</b> 30 characters<br />
                          <b>Max URL length:</b> 512 characters<br /><button
                            class="arpc-button arpc-var-button"
                            @click="setModal('variables')"
                          >
                            {variables}
                          </button></small
                        >
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.pause.button1.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.pause.button1.url"
                        />
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.pause.button2.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.podcasts.pause.button2.url"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Videos -->
        <div v-show="frontend.sidebar === 'videos'">
          <h2 @click="clickingEe('videosClickEe')">Videos</h2>
          <h3>Play</h3>

          <div
            class="arpc-option-container"
            :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
          >
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Show Presence on Video Playback
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.videos.play.enabled"
                    switch
                  />
                </label>
              </div>
            </div>

            <div :disabled="!settings.videos.play.enabled">
              <div class="arpc-option">
                <div
                  class="arpc-option-segment"
                  style="cursor: pointer"
                  @click="changeSidebarItem('general')"
                >
                  Use the General Playback Configuration
                </div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="checkbox"
                      v-model="settings.videos.play.usePlayConfig"
                      switch
                    />
                  </label>
                </div>
              </div>

              <div
                :disabled="settings.videos.play.usePlayConfig && !(!settings.videos.play.enabled || app.cfg.connectivity.discord_rpc.enabled || !settings.enabled)"
              >
                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    First Line (details)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.play.details"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    Second Line (state)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input type="text" v-model="settings.videos.play.state" />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Timestamp</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.videos.play.timestamp"
                      >
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
                      <select
                        class="arpc-select"
                        v-model="settings.videos.play.largeImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Thumbnail</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.play.largeImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Large Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.play.largeImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.play.largeImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Large Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.play.largeImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Small Image</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.videos.play.smallImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Thumbnail</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.play.smallImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Small Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.play.smallImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.play.smallImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Small Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.play.smallImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Enable Buttons</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="checkbox"
                        v-model="settings.videos.play.buttons"
                        switch
                      />
                    </label>
                  </div>
                </div>

                <Transition name="arpc-settings-slide">
                  <div v-show="settings.videos.play.buttons">
                    <div class="arpc-option">
                      <div class="arpc-option-segment">
                        Buttons <br />
                        <small
                          ><b>Max label length:</b> 30 characters<br />
                          <b>Max URL length:</b> 512 characters<br /><button
                            class="arpc-button arpc-var-button"
                            @click="setModal('variables')"
                          >
                            {variables}
                          </button></small
                        >
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.videos.play.button1.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.videos.play.button1.url"
                        />
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.videos.play.button2.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.videos.play.button2.url"
                        />
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
            :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
          >
            <div class="arpc-option">
              <div class="arpc-option-segment">Show Presence while Paused</div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.videos.pause.enabled"
                    switch
                  />
                </label>
              </div>
            </div>

            <div :disabled="!settings.videos.pause.enabled">
              <div class="arpc-option">
                <div
                  class="arpc-option-segment"
                  style="cursor: pointer"
                  @click="changeSidebarItem('general')"
                >
                  Use the General Pause Configuration
                </div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="checkbox"
                      v-model="settings.videos.pause.usePauseConfig"
                      switch
                    />
                  </label>
                </div>
              </div>

              <div
                :disabled="settings.videos.pause.usePauseConfig && !(!settings.videos.pause.enabled || !settings.enabled || app.cfg.connectivity.discord_rpc.enabled)"
              >
                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    First Line (details)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.pause.details"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    Second Line (state)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.pause.state"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Large Image</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.videos.pause.largeImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Thumbnail</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.pause.largeImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Large Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.pause.largeImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.pause.largeImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Large Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.pause.largeImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Small Image</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.videos.pause.smallImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Thumbnail</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.pause.smallImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Small Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.pause.smallImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.videos.pause.smallImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Small Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.videos.pause.smallImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Enable Buttons</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="checkbox"
                        v-model="settings.videos.pause.buttons"
                        switch
                      />
                    </label>
                  </div>
                </div>

                <Transition name="arpc-settings-slide">
                  <div v-show="settings.videos.pause.buttons">
                    <div class="arpc-option">
                      <div class="arpc-option-segment">
                        Use Playback Buttons
                        <small
                          >Use the same buttons as the ones shown on
                          playback.</small
                        >
                      </div>
                      <div class="arpc-option-segment arpc-option-segment_auto">
                        <label>
                          <input
                            type="checkbox"
                            v-model="settings.videos.pause.usePlayButtons"
                            switch
                          />
                        </label>
                      </div>
                    </div>

                    <div
                      class="arpc-option"
                      :disabled="settings.videos.pause.usePlayButtons && !(settings.videos.pause.usePauseConfig || !settings.videos.pause.enabled || !settings.enabled || app.cfg.connectivity.discord_rpc.enabled)"
                    >
                      <div class="arpc-option-segment">
                        Buttons <br />
                        <small
                          ><b>Max label length:</b> 30 characters<br />
                          <b>Max URL length:</b> 512 characters<br /><button
                            class="arpc-button arpc-var-button"
                            @click="setModal('variables')"
                          >
                            {variables}
                          </button></small
                        >
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.videos.pause.button1.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.videos.pause.button1.url"
                        />
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.videos.pause.button2.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.videos.pause.button2.url"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Radio -->
        <div v-show="frontend.sidebar === 'radio'">
          <h2 @click="clickingEe('radioClickEe')">Radio Stations</h2>

          <div
            class="arpc-option-container"
            :disabled="app.cfg.connectivity.discord_rpc.enabled || !settings.enabled"
          >
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Show Presence on Radio Playback
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.radio.enabled"
                    switch
                  />
                </label>
              </div>
            </div>

            <div :disabled="!settings.radio.enabled">
              <div class="arpc-option">
                <div
                  class="arpc-option-segment"
                  style="cursor: pointer"
                  @click="changeSidebarItem('general')"
                >
                  Use the General Playback Configuration
                </div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      type="checkbox"
                      v-model="settings.radio.usePlayConfig"
                      switch
                    />
                  </label>
                </div>
              </div>

              <div
                :disabled="settings.radio.usePlayConfig && !(!settings.radio.enabled || app.cfg.connectivity.discord_rpc.enabled || !settings.enabled)"
              >
                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    First Line (details)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input type="text" v-model="settings.radio.details" />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">
                    Second Line (state)
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input type="text" v-model="settings.radio.state" />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Timestamp</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.radio.timestamp"
                      >
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
                      <select
                        class="arpc-select"
                        v-model="settings.radio.largeImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Radio cover</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.radio.largeImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Large Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.radio.largeImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.radio.largeImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Large Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.radio.largeImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Small Image</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <select
                        class="arpc-select"
                        v-model="settings.radio.smallImage"
                      >
                        <option value="disabled">Off</option>
                        <option value="cover">Radio cover</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.radio.smallImage == 'custom'"
                >
                  <div class="arpc-option-segment">
                    Small Image Key / URL
                    <small>Max 256 characters<br /></small>
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.radio.smallImageKey"
                      />
                    </label>
                  </div>
                </div>

                <div
                  class="arpc-option"
                  v-show="settings.radio.smallImage != 'disabled'"
                >
                  <div class="arpc-option-segment">
                    Small Image Text
                    <small
                      >Max 128 characters<br /><button
                        class="arpc-button arpc-var-button"
                        @click="setModal('variables')"
                      >
                        {variables}
                      </button></small
                    >
                  </div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="text"
                        v-model="settings.radio.smallImageText"
                      />
                    </label>
                  </div>
                </div>

                <div class="arpc-option">
                  <div class="arpc-option-segment">Enable Buttons</div>
                  <div class="arpc-option-segment arpc-option-segment_auto">
                    <label>
                      <input
                        type="checkbox"
                        v-model="settings.radio.buttons"
                        switch
                      />
                    </label>
                  </div>
                </div>

                <Transition name="arpc-settings-slide">
                  <div v-show="settings.radio.buttons">
                    <div class="arpc-option">
                      <div class="arpc-option-segment">
                        Use Playback Buttons
                        <small
                          >Use the same buttons as the ones shown on
                          playback.</small
                        >
                      </div>
                      <div class="arpc-option-segment arpc-option-segment_auto">
                        <label>
                          <input
                            type="checkbox"
                            v-model="settings.radio.usePlayButtons"
                            switch
                          />
                        </label>
                      </div>
                    </div>

                    <div
                      class="arpc-option"
                      :disabled="settings.radio.usePlayButtons && !(settings.radio.usePlayConfig && !settings.radio.enabled || app.cfg.connectivity.discord_rpc.enabled || !settings.enabled)"
                    >
                      <div class="arpc-option-segment">
                        Buttons <br />
                        <small
                          ><b>Max label length:</b> 30 characters<br />
                          <b>Max URL length:</b> 512 characters<br /><button
                            class="arpc-button arpc-var-button"
                            @click="setModal('variables')"
                          >
                            {variables}
                          </button></small
                        >
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.radio.button1.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.radio.button1.url"
                        />
                      </div>
                      <div
                        class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
                      >
                        <label>Label</label>
                        <input
                          type="text"
                          v-model="settings.radio.button2.label"
                        />

                        <label>URL</label>
                        <input
                          type="text"
                          v-model="settings.radio.button2.url"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings -->
        <div v-show="frontend.sidebar === 'settings'">
          <h2 @click="clickingEe('settingsClickEe')">Settings</h2>

          <div class="arpc-option-container">
            <div :disabled="app.cfg.connectivity.discord_rpc.enabled">
              <div class="arpc-option">
                <div class="arpc-option-segment">Enable AdvancedRPC</div>
                <div class="arpc-option-segment arpc-option-segment_auto">
                  <label>
                    <input
                      @click="clickingEe('enableArpcSwitchEe')"
                      type="checkbox"
                      v-model="settings.enabled"
                      switch
                    />
                  </label>
                </div>
              </div>
            </div>
            <div class="arpc-option">
              <div class="arpc-option-segment">
                Application ID
                <small
                  >Create your own on
                  <a
                    href="https://discord.com/developers/applications"
                    target="_blank"
                    >Discord Developer Portal</a
                  >.<br />Restart after changing to avoid unwanted
                  effects.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input type="text" v-model="settings.appId" />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Respect Private Session
                <small
                  >Hides your presence while Private Session is enabled.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.respectPrivateSession"
                    switch
                  />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Fallback Image
                <small
                  >Set a custom image to be shown when the artwork doesn't exist
                  or hasn't loaded yet.<br />Max 256 characters</small
                >
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label>Play</label>
                <input type="text" v-model="settings.play.fallbackImage" />
              </div>
              <div
                class="arpc-option-segment arpc-option-segment_auto arpc-multiple-items"
              >
                <label>Pause</label>
                <input type="text" v-model="settings.pause.fallbackImage" />
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Artwork Image Size
                <small
                  >Changes the width and height of the artwork when used in the
                  presence. Larger values might cause the artwork to take longer
                  to load for others. Does not apply for animated
                  artwork.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="number"
                    v-model="settings.imageSize"
                    placeholder="1024"
                  />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Remove Invalid Buttons
                <small
                  >Removes potentially invalid buttons, such as Apple Music
                  buttons for iCloud songs or song.link buttons for
                  podcasts.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.removeInvalidButtons"
                    switch
                  />
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Apply Settings Immediately
                <small
                  >Apply settings to your Discord presence as you change them.
                  This can cause rate limits.</small
                >
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <input
                    type="checkbox"
                    v-model="settings.applySettings"
                    true-value="immediately"
                    false-value="manually"
                    switch
                  />
                </label>
              </div>
            </div>

            <div v-if="themes && themes.length > 0" class="arpc-option">
              <div
                class="arpc-option-segment"
                :class="{ 'arpc-rumble' : remoteData?.themeClickEe?.id && !frontend[remoteData?.themeClickEe?.id + 'Theme'] }"
                @click="clickingEe('themeClickEe')"
              >
                Theme
                <small
                  v-if="themes.find(t => t.id === frontend.theme)?.description"
                >
                  {{ themes.find(t => t.id === frontend.theme).description }}
                </small>
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <label>
                  <select class="arpc-select" v-model="frontend.theme">
                    <option value="" disabled hidden>Select Theme</option>
                    <option v-for="theme in themes" :value="theme.id">
                      {{ theme.name }}
                    </option>
                  </select>
                </label>
              </div>
            </div>

            <div class="arpc-option">
              <div class="arpc-option-segment">
                Reset Configuration to Default
              </div>
              <div class="arpc-option-segment arpc-option-segment_auto">
                <button
                  class="arpc-button arpc-button-red"
                  @click="setModal('reset-settings')"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- About -->
        <div v-show="frontend.sidebar === 'about'">
          <h2>About</h2>
        </div>
      </div>
    </div>
  </div>
</div>

  `,
  data: () => ({
    settings: {
      appId: "927026912302362675",
      enabled: true,
      respectPrivateSession: true,
      play: {
        enabled: true,
        details: "{title}",
        state: "{artist}",
        timestamp: "remaining",
        largeImage: "cover",
        largeImageKey: "applemusic",
        largeImageText: "{album}",
        smallImage: "custom",
        smallImageKey: "play",
        smallImageText: "Playing",
        fallbackImage: "applemusic",
        buttons: true,
        button1: {
          label: "Listen on Apple Music",
          url: "{appleMusicUrl}",
        },
        button2: {
          label: "",
          url: "",
        },
      },
      pause: {
        enabled: true,
        details: "{title}",
        state: "{artist}",
        largeImage: "cover",
        largeImageKey: "applemusic",
        largeImageText: "{album}",
        smallImage: "custom",
        smallImageKey: "pause",
        smallImageText: "Paused",
        fallbackImage: "applemusic",
        buttons: true,
        usePlayButtons: true,
        button1: {
          label: "Listen on Apple Music",
          url: "{appleMusicUrl}",
        },
        button2: {
          label: "",
          url: "",
        },
      },
      radio: {
        enabled: true,
        usePlayConfig: false,
        details: "{title}",
        state: "{artist}",
        timestamp: "elapsed",
        largeImage: "cover",
        largeImageKey: "applemusic",
        largeImageText: "{album}",
        smallImage: "custom",
        smallImageKey: "live",
        smallImageText: "Live",
        buttons: true,
        usePlayButtons: false,
        button1: {
          label: "Listen on Apple Music",
          url: "{appleMusicUrl}",
        },
        button2: {
          label: "",
          url: "",
        },
      },
      podcasts: {
        play: {
          enabled: true,
          usePlayConfig: false,
          details: "{title}",
          state: "{artist}",
          timestamp: "remaining",
          largeImage: "cover",
          largeImageKey: "podcasts",
          largeImageText: "Episode {episodeNumber}",
          smallImage: "custom",
          smallImageKey: "play",
          smallImageText: "Playing",
          buttons: true,
          button1: {
            label: "Listen to this podcast",
            url: "{applePodcastsUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
        pause: {
          enabled: true,
          usePauseConfig: false,
          details: "{title}",
          state: "{artist}",
          largeImage: "cover",
          largeImageKey: "podcasts",
          largeImageText: "Episode {episodeNumber}",
          smallImage: "custom",
          smallImageKey: "pause",
          smallImageText: "Paused",
          buttons: true,
          usePlayButtons: true,
          button1: {
            label: "Listen to this podcast",
            url: "{applePodcastsUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
      },
      videos: {
        play: {
          enabled: true,
          usePlayConfig: false,
          details: "{title}",
          state: "{artist}",
          timestamp: "remaining",
          largeImage: "cover",
          largeImageKey: "applemusic",
          largeImageText: "{album}",
          smallImage: "custom",
          smallImageKey: "play",
          smallImageText: "Playing",
          buttons: true,
          button1: {
            label: "Watch on Apple Music",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
        pause: {
          enabled: true,
          usePauseConfig: false,
          details: "{title}",
          state: "{artist}",
          largeImage: "cover",
          largeImageKey: "applemusic",
          largeImageText: "{album}",
          smallImage: "custom",
          smallImageKey: "pause",
          smallImageText: "Paused",
          buttons: true,
          usePlayButtons: true,
          button1: {
            label: "Watch on Apple Music",
            url: "{appleMusicUrl}",
          },
          button2: {
            label: "",
            url: "",
          },
        },
      },
      imageSize: 1024,
      applySettings: "manually",
      removeInvalidButtons: true,
    },
    installedVersion: AdvancedRpc.installedVersion,
    latestVersion: AdvancedRpc.latestVersion,
    unappliedSettings: AdvancedRpc.unappliedSettings,
    versionInfo: "[VI]{version} - {date}[/VI]",
    textVariables: "{artist}, {composer}, {title}, {album}, {trackNumber}",
    urlVariables: "{appleMusicUrl}, {ciderUrl}",
    variableStyles: "{variable^} for uppercase, {variable*} for lowercase",
    modal: "",
    remoteData: AdvancedRpc.remoteData,
    privateSessionBubble: {
      enabled: true,
      message:
        "Private Session is currently enabled, your Discord presence won't be displayed.",
      color: "#00AFF4",
      icon: "info",
    },
    ciderRpcBubble: {
      enabled: true,
      message: `Please disable Cider's Discord Rich Presence in ${app.getLz(
        "term.settings"
      )} > ${app.getLz("settings.header.connectivity")} and restart the app.`,
      color: "#FAA81A",
      icon: "warning",
    },
    frontend: {
      sidebar: "general",
      theme: "dark",
      bubblesExpanded: true,
    },
    themes: [],
    bubbles: [],
  }),
  watch: {
    settings: {
      handler() {
        AdvancedRpc.setSettings(this.settings);
        ipcRenderer.invoke(
          `plugin.${AdvancedRpc.PLUGIN_NAME}.setting`,
          this.settings
        );
        this.initBubbles();
      },
      deep: true,
    },
    frontend: {
      handler() {
        AdvancedRpc.setFrontendData(this.frontend);
        this.setTheme(this.frontend.theme);
      },
      deep: true,
    },
  },
  async created() {
    this.settings = AdvancedRpc.getSettings();

    let frontend = AdvancedRpc.getFrontendData();
    if (typeof frontend["bubblesExpanded"] === "undefined")
      frontend["bubblesExpanded"] = true;
    this.frontend = frontend;

    this.setTheme(frontend.theme);
    this.initBubbles();
  },
  async mounted() {
    ipcRenderer.on(
      `plugin.${AdvancedRpc.PLUGIN_NAME}.unappliedSettings`,
      (e, status) => {
        AdvancedRpc.unappliedSettings = status;
        this.unappliedSettings = status;
      }
    );

    ipcRenderer.on(
      `plugin.${AdvancedRpc.PLUGIN_NAME}.setPrevSettings`,
      (e, settings) => {
        this.settings = settings;
      }
    );
  },
  methods: {
    async updateSettings() {
      await ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`,
        this.settings
      );
      notyf.success({
        message: "Settings applied",
        background: "#2D7D46",
        dismissible: true,
      });
    },
    resetChanges() {
      ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.resetChanges`,
        this.settings
      );
    },
    async resetSettings() {
      await AdvancedRpc.setDefaultSettings();
      this.settings = await AdvancedRpc.getSettings();
      await ipcRenderer.invoke(
        `plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`,
        this.settings
      );
      notyf.success({
        message: "Your settings have been reset",
        background: "#d83c3e",
        dismissible: true,
      });
    },
    setModal(modal) {
      this.modal = modal;
    },
    toggleExpandable(key) {
      this.frontend.expandables[key] = !this.frontend.expandables[key];
    },
    toggleBubbles() {
      this.frontend.bubblesExpanded = !this.frontend.bubblesExpanded;
    },
    changeSidebarItem(item) {
      this.frontend.sidebar = item;
      document.querySelector(".arpc-page").scrollIntoView();
    },
    openLink(url) {
      window.open(url, "_blank");
    },
    setTheme(theme) {
      this.themes = this.remoteData?.themes;

      this.themes = this.themes?.filter((t) => {
        if (t.requirement) {
          return this.frontend[t.requirement];
        } else {
          return true;
        }
      });

      if (this.remoteData?.forceTheme) {
        document
          .querySelector(".advancedrpc")
          ?.setAttribute("arpc-theme", this.remoteData.forceTheme);
      } else if (this.themes?.find((t) => t.id === theme)) {
        document
          .querySelector(".advancedrpc")
          ?.setAttribute("arpc-theme", theme);
      } else {
        document
          .querySelector(".advancedrpc")
          ?.setAttribute("arpc-theme", "dark");

        this.frontend.theme = "dark";
      }
    },
    clickingEe(easterEgg) {
      if (
        !this.remoteData?.[easterEgg] ||
        this.frontend[this.remoteData?.[easterEgg].id + "Theme"]
      )
        return;

      if (!this[this.remoteData?.[easterEgg].id + "Clicks"])
        this[this.remoteData?.[easterEgg].id + "Clicks"] = 0;

      this[this.remoteData?.[easterEgg].id + "Clicks"]++;

      if (
        this[this.remoteData?.[easterEgg].id + "Clicks"] >
          this.remoteData?.[easterEgg]?.silentClicks &&
        this[this.remoteData?.[easterEgg].id + "Clicks"] <=
          this.remoteData?.[easterEgg]?.clicks - 1
      ) {
        notyf.success({
          message: this.remoteData?.[easterEgg]?.clickText.replace(
            "{clicks}",
            this.remoteData[easterEgg].clicks -
              this[this.remoteData[easterEgg].id + "Clicks"]
          ),
          background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
          ripple: false,
          icon: false,
        });
      }

      if (
        this[this.remoteData?.[easterEgg].id + "Clicks"] >
        this.remoteData?.[easterEgg]?.clicks - 1
      ) {
        this.unlockTheme(this.remoteData?.[easterEgg].id);

        if (this.remoteData?.[easterEgg]?.unlockText) {
          notyf.success({
            message: this.remoteData?.[easterEgg].unlockText,
            background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
            icon: false,
            duration: 5000,
            dismissible: true,
          });
        }
      }
    },
    unlockTheme(theme) {
      this.frontend[theme + "Theme"] = true;
      this.frontend.theme = theme;
      this.setTheme(theme);
    },
    checkVersions(param) {
      if (
        param.versions &&
        !param.versions.includes(AdvancedRpc.installedVersion)
      ) {
        return false;
      } else if (
        param.versionsSmallerThan &&
        AdvancedRpc.installedVersion >= param.versionsSmallerThan
      ) {
        return false;
      } else {
        return true;
      }
    },
    initBubbles() {
      let bubbles = [];
      this.remoteData?.bubbles?.forEach((bubble) => {
        if (this.checkVersions(bubble)) bubbles.push(bubble);
      });

      if (app.cfg.general.privateEnabled && this.settings.respectPrivateSession)
        bubbles.push(undefined);

      if (app.cfg.connectivity.discord_rpc.enabled) bubbles.push(undefined);

      this.bubbles = bubbles;
    },
  },
});
