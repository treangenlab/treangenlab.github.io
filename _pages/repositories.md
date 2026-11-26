---
layout: page
permalink: /repositories/
title: code
description: Treangen lab Github repositories
nav: true
nav_order: 5
---

{% if site.data.repositories.github_users %}

{% if site.repo_trophies.enabled %}
{% for user in site.data.repositories.github_users %}
{% if site.data.repositories.github_users.size > 1 %}

  <h4>{{ user }}</h4>
  {% endif %}
  <div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% include repository/repo_trophies.liquid username=user %}
  </div>

---

{% endfor %}
{% endif %}
{% endif %}

{% if site.data.repositories.github_repos %}

## Tools and source code

The lab's open-source tools, grouped by main programming language. Hover over a tool, or scroll to it, to watch it run.

<div id="repo-langs" class="repo-langs" data-repos="{{ site.data.repositories.github_repos | join: ',' }}">
  <svg class="repo-langs-pie" viewBox="0 0 120 120" role="img" aria-label="Share of code by language across the lab's GitHub repositories"></svg>
  <div class="repo-langs-body">
    <p class="repo-langs-summary">Language breakdown is loading.</p>
    <ul class="repo-langs-legend"></ul>
    <p class="repo-langs-note"></p>
  </div>
  <div class="repo-langs-tip" hidden></div>
</div>
<noscript>Across these repositories, counting only C/C++, Rust, Python and Java: roughly 60% Python, 35% C/C++, 3% Rust and 1% Java (November 2026).</noscript>

{::nomarkdown}
<div class="tools">
{%- assign languages = site.data.tools | map: "language" | uniq | sort -%}
{%- for language in languages -%}
<h2 class="category" id="{{ language | replace: '+', 'p' | slugify }}">{{ language }}</h2>
{%- assign items = site.data.tools | where: "language", language | sort_natural: "name" -%}
{%- for tool in items -%}
{% include tool_block.liquid tool=tool %}
{%- endfor -%}
{%- endfor -%}
<p class="tools-footnote">The terminal demos are illustrations. Each command follows the tool's own README. Where a repository ships example output, the lines shown are copied from it; otherwise the demo lists the output files the tool documents. The Gingr view is drawn from Parsnp's MERS-CoV example genomes.</p>
</div>
{:/nomarkdown}
{% endif %}

<script defer src="{{ '/assets/js/repo-stats.js' | relative_url }}"></script>
<script defer src="{{ '/assets/js/gingr-demo.js' | relative_url }}"></script>
<script defer src="{{ '/assets/js/tool-demos.js' | relative_url }}"></script>
