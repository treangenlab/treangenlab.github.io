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
  <h2 class="paper-map-title">Where each paper sits</h2>
  <p class="paper-map-intro">Each dot is a paper, placed by how much it is about applications and biology (left to right) and how much it is about theory and algorithms (bottom to top). Hover over a dot for the paper, and click to open it.</p>
  <div class="paper-map-plot">
    <svg viewBox="0 0 720 470" role="img" aria-label="Scatter plot of lab papers by application focus and algorithm focus"></svg>
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
