---
layout: page
permalink: /publications/
title: papers
description: publications and preprints in reverse chronological order.
nav: true
nav_order: 3
---

<!-- _pages/publications.md -->

<div id="paper-map" class="paper-map">
  <h2 class="paper-map-title">Theory vs Applied research overview (each dot represents a paper, click on it for more details).</h2>
  <p class="paper-map-intro">Papers on the left lean toward theory and algorithms, papers on the right lean toward applications and biology, and papers near the middle are a balance of both. Height shows how pronounced a paper's main focus is; solid dots lean clearly one way with a strong focus, and fainter dots are more mixed. Hover over a dot to see the paper.</p>
  <div class="paper-map-plot">
    <svg viewBox="0 0 720 500" role="img" aria-label="Volcano-style plot of lab papers, from theory-leaning on the left to applied on the right"></svg>
    <div class="paper-map-tip" hidden></div>
  </div>
  <ul class="paper-map-legend"></ul>
  <p class="paper-map-detail" aria-live="polite"></p>
  <script type="application/json" id="paper-map-data">{{ site.data.paper_map | jsonify }}</script>
</div>
<script defer src="{{ '/assets/js/paper-map.js' | relative_url }}"></script>

<!-- Bibsearch Feature -->

{% include bib_search.liquid %}

<div class="publications">

{% bibliography %}

</div>
