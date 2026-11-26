---
layout: page
permalink: /publications/
title: papers
description: publications and preprints in reverse chronological order.
nav: true
nav_order: 4
---

<!-- _pages/publications.md -->

<div id="paper-map" class="paper-map">
  <h2 class="paper-map-title">Research overview (each dot represents a paper, click on it for more details).</h2>
  <p class="paper-map-intro">Papers are placed by how often terms for each kind of computation (left to right) and biology (bottom to top) appear in their text.</p>
  <div class="paper-map-plot">
    <svg viewBox="0 0 720 540" role="img" aria-label="Plot of lab papers by kind of computation, left to right, and kind of biology, bottom to top"></svg>
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
