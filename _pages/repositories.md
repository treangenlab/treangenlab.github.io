---
layout: page
permalink: /repositories/
title: Code
description: Treangen lab Github repositories
nav: true
nav_order: 4
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

## GitHub Repositories

Source code for the lab's tools, listed by GitHub stars.

<div id="repo-langs" class="repo-langs" data-repos="{{ site.data.repositories.github_repos | join: ',' }}">
  <svg class="repo-langs-pie" viewBox="0 0 120 120" role="img" aria-label="Share of code by language across the repositories below"></svg>
  <div class="repo-langs-body">
    <p class="repo-langs-summary">Language breakdown is loading.</p>
    <ul class="repo-langs-legend"></ul>
    <p class="repo-langs-note"></p>
  </div>
  <div class="repo-langs-tip" hidden></div>
</div>
<noscript>Across these repositories, code is roughly 38% Python, 22% C/C++, 2% Rust and 38% other languages (November 2026).</noscript>

<div id="repo-list" class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

<script defer src="{{ '/assets/js/repo-stats.js' | relative_url }}"></script>
