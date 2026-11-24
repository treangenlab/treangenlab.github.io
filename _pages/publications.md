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
  <p class="paper-map-intro">Papers further right are more application and biology oriented; papers higher up are more theory and algorithms oriented. Hover over a dot to see the paper.</p>
  <div class="paper-map-plot">
    <svg viewBox="0 0 720 500" role="img" aria-label="Scatter plot of lab papers by application focus and algorithm focus"></svg>
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
