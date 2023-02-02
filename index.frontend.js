/* Version: 1.5.4 - February 2, 2023 11:08:19 */
(function () {
  'use strict';

  Vue.component("plugin.advancedrpc", {
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
              url: "{applePodcastsUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
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
              url: "{applePodcastsUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
          }
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
              url: "{appleMusicUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
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
              url: "{appleMusicUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
          }
        },
        imageSize: 1024,
        applySettings: "manually",
        removeInvalidButtons: true
      },
      installedVersion: AdvancedRpc.installedVersion,
      latestVersion: AdvancedRpc.latestVersion,
      unappliedSettings: AdvancedRpc.unappliedSettings,
      versionInfo: "1.5.4 - February 2, 2023 11:08:19",
      textVariables: "{artist}, {composer}, {title}, {album}, {trackNumber}",
      urlVariables: "{appleMusicUrl}, {ciderUrl}",
      variableStyles: "{variable^} for uppercase, {variable*} for lowercase",
      modal: "",
      remoteData: AdvancedRpc.remoteData,
      privateSessionBubble: {
        enabled: true,
        message: "Private Session is currently enabled, your Discord presence won't be displayed.",
        color: "#00AFF4",
        icon: "info"
      },
      ciderRpcBubble: {
        enabled: true,
        message: `Please disable Cider's Discord Rich Presence in ${app.getLz("term.settings")} > ${app.getLz("settings.header.connectivity")} and restart the app.`,
        color: "#FAA81A",
        icon: "warning"
      },
      frontend: {
        sidebar: "general",
        theme: "dark",
        bubblesExpanded: true
      },
      themes: [],
      bubbles: []
    }),
    watch: {
      settings: {
        handler() {
          AdvancedRpc.setSettings(this.settings);
          ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.setting`, this.settings);
          this.initBubbles();
        },
        deep: true
      },
      frontend: {
        handler() {
          AdvancedRpc.setFrontendData(this.frontend);
          this.setTheme(this.frontend.theme);
        },
        deep: true
      }
    },
    async created() {
      this.settings = AdvancedRpc.getSettings();
      let frontend = AdvancedRpc.getFrontendData();
      if (typeof frontend["bubblesExpanded"] === "undefined") frontend["bubblesExpanded"] = true;
      this.frontend = frontend;
      this.setTheme(frontend.theme);
      this.initBubbles();
    },
    async mounted() {
      ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.unappliedSettings`, (e, status) => {
        AdvancedRpc.unappliedSettings = status;
        this.unappliedSettings = status;
      });
      ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.setPrevSettings`, (e, settings) => {
        this.settings = settings;
      });
    },
    methods: {
      async updateSettings() {
        await ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`, this.settings);
        notyf.success({
          message: "Settings applied",
          background: "#2D7D46",
          dismissible: true
        });
      },
      resetChanges() {
        ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.resetChanges`, this.settings);
      },
      async resetSettings() {
        await AdvancedRpc.setDefaultSettings();
        this.settings = await AdvancedRpc.getSettings();
        await ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.updateSettings`, this.settings);
        notyf.success({
          message: "Your settings have been reset",
          background: "#d83c3e",
          dismissible: true
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
        this.themes = this.themes?.filter(t => {
          if (t.requirement) {
            return this.frontend[t.requirement];
          } else {
            return true;
          }
        });
        if (this.remoteData?.forceTheme) {
          document.querySelector(".advancedrpc")?.setAttribute("arpc-theme", this.remoteData.forceTheme);
        } else if (this.themes?.find(t => t.id === theme)) {
          document.querySelector(".advancedrpc")?.setAttribute("arpc-theme", theme);
        } else {
          document.querySelector(".advancedrpc")?.setAttribute("arpc-theme", "dark");
          this.frontend.theme = "dark";
        }
      },
      clickingEe(easterEgg) {
        if (!this.remoteData?.[easterEgg] || this.frontend[this.remoteData?.[easterEgg].id + "Theme"]) return;
        if (!this[this.remoteData?.[easterEgg].id + "Clicks"]) this[this.remoteData?.[easterEgg].id + "Clicks"] = 0;
        this[this.remoteData?.[easterEgg].id + "Clicks"]++;
        if (this[this.remoteData?.[easterEgg].id + "Clicks"] > this.remoteData?.[easterEgg]?.silentClicks && this[this.remoteData?.[easterEgg].id + "Clicks"] <= this.remoteData?.[easterEgg]?.clicks - 1) {
          notyf.success({
            message: this.remoteData?.[easterEgg]?.clickText.replace("{clicks}", this.remoteData[easterEgg].clicks - this[this.remoteData[easterEgg].id + "Clicks"]),
            background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
            ripple: false,
            icon: false
          });
        }
        if (this[this.remoteData?.[easterEgg].id + "Clicks"] > this.remoteData?.[easterEgg]?.clicks - 1) {
          this.unlockTheme(this.remoteData?.[easterEgg].id);
          if (this.remoteData?.[easterEgg]?.unlockText) {
            notyf.success({
              message: this.remoteData?.[easterEgg].unlockText,
              background: this.remoteData?.[easterEgg]?.color || "#d83c3e",
              icon: false,
              duration: 5000,
              dismissible: true
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
        if (param.versions && !param.versions.includes(AdvancedRpc.installedVersion)) {
          return false;
        } else if (param.versionsSmallerThan && AdvancedRpc.installedVersion >= param.versionsSmallerThan) {
          return false;
        } else {
          return true;
        }
      },
      initBubbles() {
        let bubbles = [];
        this.remoteData?.bubbles?.forEach(bubble => {
          if (this.checkVersions(bubble)) bubbles.push(bubble);
        });
        if (app.cfg.general.privateEnabled && this.settings.respectPrivateSession) bubbles.push(undefined);
        if (app.cfg.connectivity.discord_rpc.enabled) bubbles.push(undefined);
        this.bubbles = bubbles;
      }
    }
  });

  Vue.component("arpc-bubble", {
    props: ["enabled", "message", "url", "icon", "color", "backgroundColor", "textColor", "iconColor", "versions", "versionsSmallerThan"],
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
      }
    }
  });

  Vue.component("arpc-changelog", {
    template: `
  <div class="arpc-modal-layer" @click.self="$emit('close-changelog')">
  <div class="arpc-modal-window arpc-changelog-window">
    <div class="arpc-modal-header">
      <div>What's New</div>
      <arpc-close-button @close="$emit('close-changelog')"></arpc-close-button>
    </div>
    <div class="arpc-modal-content" id="arpc-changelog"></div>
    <div class="arpc-modal-footer">
      <div v-if="checkingForUpdate === true">Checking for updates...</div>
      <div v-else-if="latestVersion > installedVersion">
        There is a new update available!<br />Installed version:
        {{installedVersion}}
      </div>
      <div v-else-if="latestVersion <= installedVersion">
        No update available.
      </div>
      <div v-else>Error checking for updates.</div>

      <button
        v-if="updating"
        class="arpc-button arpc-button-blue"
        :disabled="true"
      >
        Updating...
      </button>
      <button
        v-else
        :disabled="checkingForUpdate || !latestVersion || latestVersion <= installedVersion"
        class="arpc-button arpc-button-blue"
        id="arpc-update-button"
        @click="update()"
      >
        Update
      </button>
    </div>
  </div>
</div>

  `,
    data: () => ({
      changelog: AdvancedRpc.changelog,
      latestVersion: null,
      installedVersion: AdvancedRpc.installedVersion,
      checkingForUpdate: true,
      updating: AdvancedRpc.updateInProgress
    }),
    async mounted() {
      document.getElementById("arpc-changelog").innerHTML = this.changelog;
      await AdvancedRpc.checkForUpdates();
      this.changelog = AdvancedRpc.changelog;
      this.latestVersion = AdvancedRpc.latestVersion;
      this.checkingForUpdate = false;
      document.getElementById("arpc-changelog").innerHTML = this.changelog;
    },
    methods: {
      update() {
        AdvancedRpc.updateInProgress = true;
        this.updating = true;
        ipcRenderer.once("plugin-installed", (event, arg) => {
          if (arg.success) {
            ipcRenderer.invoke("relaunchApp");
          } else {
            notyf.error("Error updating AdvancedRPC");
            AdvancedRpc.updateInProgress = false;
            this.updating = false;
          }
        });
        ipcRenderer.invoke("get-github-plugin", "https://github.com/down-bad/advanced-rpc");
      }
    }
  });

  Vue.component("arpc-expand-button", {
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
    props: ["expanded"]
  });

  Vue.component("arpc-close-button", {
    template: `
  <button @click="$emit('close')" class="arpc-close-button">
  <svg
    class="arpc-close-button"
    aria-hidden="true"
    role="img"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"
    ></path>
  </svg>
</button>

  `
  });

  Vue.component("arpc-variables-modal", {
    template: `
  <div class="arpc-modal-layer" @click.self="$emit('close-variables')">
  <div class="arpc-modal-window">
    <div class="arpc-modal-header">
      <div>Variables</div>
      <arpc-close-button @close="$emit('close-variables')"></arpc-close-button>
    </div>
    <div class="arpc-modal-content">
      <h4>Text Variables</h4>
      <div id="arpc-variables">
        <div>{title}</div>
        <div>{artist}</div>
        <div>{album}</div>
        <div>{composer}</div>
        <div>{trackNumber}</div>
        <div>{trackCount}</div>
        <div>{genre}</div>
        <div>{year}</div>
        <div>{songId}</div>
        <div>{albumId}</div>
        <div>{artistId}</div>
      </div>

      <h4>Podcasts Variables</h4>
      <div id="arpc-variables">
        <div>{episodeNumber}</div>
        <div>{applePodcastsUrl}</div>
        <div>{websiteUrl}</div>
        <div>{assetUrl}</div>
      </div>

      <h4>Radio Stations Variables</h4>
      <div id="arpc-variables">
        <div>{radioName}</div>
        <div>{radioTagline}</div>
        <div>{radioUrl}</div>
      </div>

      <h4>Variables Style</h4>
      <div id="arpc-variables">
        <div>{variable^}</div>
        for uppercase
      </div>
      <div id="arpc-variables">
        <div>{variable*}</div>
        for lowercase
      </div>

      <h4>URL Variables (for buttons)</h4>
      <div id="arpc-variables">
        <div>{appleMusicUrl}</div>
        <div>{albumUrl}</div>
        <div>{artistUrl}</div>
        <div>{spotifyUrl}</div>
        <div>{youtubeUrl}</div>
        <div>{youtubeMusicUrl}</div>
        <div>{songlinkUrl}</div>
        <div>{ciderUrl}</div>
      </div>
    </div>
  </div>
</div>

  `
  });

  Vue.component("arpc-sidebar", {
    template: `
  <div class="arpc-sidebar">
  <div>
    <div class="arpc-header">
      <h1 @click="$emit('click-ee', 'headerClickEe')">
        {{ remoteData?.header ?? "AdvancedRPC" }}
      </h1>
      <img
        @click="$emit('click-ee', 'decorationClickEe')"
        v-if="remoteData?.titleDecorations?.rightImage"
        :src="remoteData?.titleDecorations?.rightImage"
        width="40"
        height="40"
        draggable="false"
      />
    </div>

    <div
      v-for="item in sideBarItems?.upper"
      v-if="checkVersions(item)"
      :class="{'arpc-sidebar-item': item.id !== 'separator', 'arpc-sidebar-separator': item.id === 'separator', 'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && installedVersion < latestVersion}"
      @click="doAction(item)"
    >
      {{ item.dest === 'modal.changelog' && installedVersion < latestVersion ?
      item.updateText : item.text }}
    </div>
  </div>
  <div>
    <div
      v-for="item in sideBarItems?.lower"
      v-if="checkVersions(item)"
      :class="{'arpc-sidebar-item': item.id !== 'separator', 'arpc-sidebar-separator': item.id === 'separator', 'arpc-sidebar-selected': frontend.sidebar === item.id, 'arpc-sidebar-blue': item.dest === 'modal.changelog' && installedVersion < latestVersion}"
      @click="doAction(item)"
    >
      {{ item.dest === 'modal.changelog' && installedVersion < latestVersion ?
      item.updateText : item.text }}
    </div>

    <footer @click="openLink('https://github.com/down-bad/advanced-rpc')">
      {{ versionInfo }}
    </footer>
  </div>
</div>

`,
    props: ["installedVersion", "latestVersion", "versionInfo", "remoteData", "frontend"],
    data: () => ({
      sideBarItems: null
    }),
    created() {
      this.sideBarItems = this.remoteData?.sideBarItems;
      if (!this.sideBarItems) {
        this.sideBarItems = {
          upper: [{
            text: "General",
            dest: "arpc.general",
            id: "general"
          }, {
            text: "Videos",
            dest: "arpc.videos",
            id: "videos"
          }, {
            text: "Radio Stations",
            dest: "arpc.radio",
            id: "radio"
          }, {
            text: "Podcasts",
            dest: "arpc.podcasts",
            id: "podcasts"
          }, {
            text: "Settings",
            dest: "arpc.settings",
            id: "settings"
          }],
          lower: [{
            text: "Changelog",
            updateText: "Update available!",
            dest: "modal.changelog"
          }]
        };
      }
    },
    methods: {
      doAction(item) {
        if (item.dest.startsWith("arpc.")) {
          this.$emit("sidebar-item", item.id);
        } else if (item.dest.startsWith("modal.")) {
          this.$emit("set-modal", item.dest.replace("modal.", ""));
        } else if (item.dest.startsWith("theme.")) {
          this.$emit("set-theme", item.dest.replace("theme.", ""));
        } else {
          this.openLink(item.dest);
        }
      },
      setModal(modal) {
        this.$emit("set-modal", modal);
      },
      openLink(url) {
        window.open(url, "_blank");
      },
      checkVersions(param) {
        if (param.versions && !param.versions.includes(AdvancedRpc.installedVersion)) {
          return false;
        } else if (param.versionsSmallerThan && AdvancedRpc.installedVersion >= param.versionsSmallerThan) {
          return false;
        } else {
          return true;
        }
      }
    }
  });

  Vue.component("arpc-confirm-modal", {
    template: `
  <div class="arpc-modal-layer" @click.self="$emit('close-modal')">
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
      }
    }
  });

  class AdvancedRpcFrontend {
    PLUGIN_NAME = "AdvancedRPC";
    SETTINGS_KEY = "settings";
    FRONTEND_KEY = "frontend";
    remoteData = null;
    installedVersion = "1.5.4";
    latestVersion = undefined;
    changelog = undefined;
    unappliedSettings = false;
    updateInProgress = false;
    constructor() {
      console.log(`[Plugin][${this.PLUGIN_NAME}] Frontend established.`);
      CiderFrontAPI.StyleSheets.Add("./plugins/gh_510140500/advancedrpc.less");
      const menuEntry = new CiderFrontAPI.Objects.MenuEntry();
      menuEntry.id = window.uuidv4();
      menuEntry.name = "AdvancedRPC";
      menuEntry.onClick = () => {
        app.appRoute("plugin/advancedrpc");
      };
      CiderFrontAPI.AddMenuEntry(menuEntry);
      this.initSettings();
      ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.initSettings`, this.getSettings());
      this.checkForUpdates(this.init = true);
    }

    // Gets settings from localStorage or sets default settings if none are found
    getSettings() {
      try {
        const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`);
        if (!data) {
          this.setDefaultSettings();
          return this.getSettings();
        } else return JSON.parse(data);
      } catch (error) {
        return null;
      }
    }

    // Sets settings in localStorage
    setSettings(data) {
      localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`, JSON.stringify(data));
    }

    // Check if user's settings are up to date with AdvancedRPC updates
    initSettings() {
      let settings = this.getSettings();
      if (typeof settings.play.smallImage == "boolean") {
        settings.play.smallImage = settings.play.smallImage ? "custom" : "disabled";
      }
      if (typeof settings.pause.smallImage == "boolean") {
        settings.pause.smallImage = settings.pause.smallImage ? "custom" : "disabled";
      }
      if (!settings.imageSize) settings["imageSize"] = 1024;
      if (!settings.play.fallbackImage) settings["play"]["fallbackImage"] = "applemusic";
      if (!settings.pause.fallbackImage) settings["pause"]["fallbackImage"] = "applemusic";
      if (!settings.applySettings) settings["applySettings"] = "manually";
      if (settings.applySettings === "state") settings["applySettings"] = "manually";
      if (typeof settings.removeInvalidButtons === "undefined") settings["removeInvalidButtons"] = true;
      if (!settings.podcasts) settings["podcasts"] = {
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
          smallImageKey: "play",
          smallImageText: "Playing",
          buttons: true,
          usePlayButtons: true,
          button1: {
            label: "Listen to this podcast",
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
        }
      };
      if (!settings.videos) settings["videos"] = {
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
        }
      };
      if (!settings.radio) settings["radio"] = {
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
          url: "{appleMusicUrl}"
        },
        button2: {
          label: "",
          url: ""
        }
      };
      this.setSettings(settings);
    }

    // Sets default settings in localStorage
    setDefaultSettings() {
      localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.SETTINGS_KEY}`, JSON.stringify({
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
            url: "{appleMusicUrl}"
          },
          button2: {
            label: "",
            url: ""
          }
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
              url: "{applePodcastsUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
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
              url: "{applePodcastsUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
          }
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
              url: "{appleMusicUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
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
              url: "{appleMusicUrl}"
            },
            button2: {
              label: "",
              url: ""
            }
          }
        },
        imageSize: 1024,
        applySettings: "manually",
        removeInvalidButtons: true
      }));
    }

    // Gets frontend data from localStorage or sets default values if none are found
    getFrontendData() {
      try {
        const data = localStorage.getItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`);
        if (!data) {
          localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`, JSON.stringify({
            sidebar: "general",
            theme: "dark",
            bubblesExpanded: true
          }));
          return this.getFrontendData();
        } else return JSON.parse(data);
      } catch (error) {
        return null;
      }
    }

    // Sets frontend data to localStorage
    setFrontendData(data) {
      localStorage.setItem(`plugin.${this.PLUGIN_NAME}.${this.FRONTEND_KEY}`, JSON.stringify(data));
    }
    async checkForUpdates(init) {
      try {
        this.remoteData = await fetch("https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/data.json").then(response => response.json());
        ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.remoteData`, this.remoteData);
      } catch (e) {}
      try {
        const {
          version
        } = await fetch("https://raw.githubusercontent.com/down-bad/advanced-rpc/main/package.json").then(response => response.json());
        if (init && version > this.installedVersion) {
          const updateNotyf = notyf.error({
            message: "There is a new AdvancedRPC version available!",
            icon: false,
            background: "#5865f2",
            duration: "5000",
            dismissible: true
          });
          updateNotyf.on("click", ({
            target,
            event
          }) => {
            app.appRoute("plugin/advancedrpc");
          });
        }
        this.latestVersion = version;
      } catch (e) {
        console.log(`[Plugin][${this.PLUGIN_NAME}] Error checking for updates.`);
        console.log(e);
        this.latestVersion = null;
      }
      try {
        if (this.remoteData.animatedArtworks) {
          const artworks = await fetch("https://files.imvasi.com/arpc/artworks.json", {
            cache: "reload"
          }).then(response => response.json());
          ipcRenderer.invoke(`plugin.${this.PLUGIN_NAME}.artworks`, artworks);
        }
      } catch {}
      try {
        if (init) this.changelog = "Fetching changelog...";
        this.changelog = await fetch("https://raw.githubusercontent.com/down-bad/advanced-rpc/dev-main/remote/changelog.html").then(response => response.text());
      } catch (e) {
        this.changelog = "Failed to fetch changelog";
      }
    }
  }
  window.AdvancedRpc = new AdvancedRpcFrontend();
  ipcRenderer.on(`plugin.${AdvancedRpc.PLUGIN_NAME}.itemChanged`, (e, data) => {
    const currentItem = localStorage.getItem("currentTrack");
    ipcRenderer.invoke(`plugin.${AdvancedRpc.PLUGIN_NAME}.currentItem`, currentItem);
  });

})();