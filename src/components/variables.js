export default Vue.component("arpc-variables-modal", {
  template: `
  <div
  class="arpc-modal-layer"
  id="arpc-variables-modal"
  @click.self="$emit('close-variables')"
>
  <div class="arpc-modal-window">
    <div class="arpc-modal-header">
      <div>Variables</div>
      <arpc-close-button @close="$emit('close-variables')"></arpc-close-button>
    </div>
    <div class="arpc-modal-content">
      <div class="arpc-label">Text Variables</div>
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

      <div class="arpc-label">Podcasts Variables</div>
      <div id="arpc-variables">
        <div>{episodeNumber}</div>
        <div>{applePodcastsUrl}</div>
        <div>{websiteUrl}</div>
        <div>{assetUrl}</div>
      </div>

      <div class="arpc-label">Radio Stations Variables</div>
      <div id="arpc-variables">
        <div>{radioName}</div>
        <div>{radioTagline}</div>
        <div>{radioUrl}</div>
      </div>

      <div class="arpc-label">Variables Style</div>
      <div id="arpc-variables">
        <div>{variable^}</div>
        for uppercase
      </div>
      <div id="arpc-variables">
        <div>{variable*}</div>
        for lowercase
      </div>

      <div class="arpc-label">URL Variables (for buttons)</div>
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

  `,
});
