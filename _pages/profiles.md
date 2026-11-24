---
layout: page
permalink: /people/
title: people
description: Treangen lab members
nav: true
nav_order: 1
display_categories: [PI, Current members, Lab alumni]
horizontal: false
---

<!-- pages/profiles.md -->
<div class="people-view-toggle" id="people-toggle" role="group" aria-label="Choose how lab members are shown" hidden>
  <button type="button" data-view="hex" class="is-active">Hexagon view</button>
  <button type="button" data-view="grid">Grid view</button>
</div>
<div id="people-bubbles" class="people-bubbles" hidden>
  <div class="people-bubbles-stage">
    {% for category in page.display_categories %}
      {% assign members = site.profiles | where: "category", category | sort: "importance" %}
      {% if category == "Lab alumni" %}
        {% assign members = site.profiles | where: "category", category | sort: "departed" | reverse %}
      {% endif %}
      {% for person in members %}
        {% assign ext = person.img | split: "." | last | prepend: "." %}
        {% assign img_base = person.img | remove: ext %}
        <button
          type="button"
          class="people-bubble"
          data-category="{{ category | slugify }}"
          data-name="{{ person.title | escape }}"
          data-description="{{ person.description | escape }}"
          data-topics="{{ person.topics | join: '|' | escape }}"
          data-url="{{ person.url | relative_url }}"
          data-slug="{{ person.url | split: '/' | last }}"
          {% if person.hex_swap %}data-swap="{{ person.hex_swap }}"{% endif %}
          data-focus="{{ person.img_focus | default: '50,35,1.8' }}"
          aria-label="{{ person.title | escape }}"
        >
          <span class="people-bubble-photo">
            <span class="people-bubble-inner">
              {% if person.img %}
                <img
                  src="{{ img_base | relative_url }}-800.webp"
                  onerror="this.onerror=null; this.src='{{ person.img | relative_url }}';"
                  alt=""
                  loading="eager"
                >
              {% else %}
                <span class="people-bubble-initials">{{ person.initials }}</span>
              {% endif %}
            </span>
          </span>
          <span class="people-bubble-name">{{ person.title }}</span>
        </button>
      {% endfor %}
    {% endfor %}
    <button
      type="button"
      class="people-bubble people-bubble-open"
      data-category="open"
      data-below="nkokroko,ehuang"
      data-name="You here?"
      data-description="Todd is recruiting a PhD student to join the Treangen Lab."
      data-topics=""
      data-url="{{ '/#recruiting' | relative_url }}"
      data-link-text="Read the recruiting note"
      aria-label="Open position: recruiting a PhD student"
    >
      <span class="people-bubble-photo">
        <span class="people-bubble-inner">
          <span class="people-bubble-initials">You<br>here?</span>
        </span>
      </span>
      <span class="people-bubble-name">Recruiting a PhD student</span>
    </button>
  </div>
  <p class="people-bubbles-legend">
    <span class="key key-pi"></span>PI <span class="key key-current-members"></span>Current members
    <span class="key key-lab-alumni"></span>Lab alumni
  </p>
  <div id="people-detail" class="people-detail" aria-live="polite">
    <p class="people-detail-hint">Hover over a photo for details; click to open the profile.</p>
  </div>
</div>

<div class="profiles" id="people-list">
{% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized profiles -->
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category">{{ category }}</h2>
  </a>
  {% assign categorized_projects = site.profiles | where: "category", category %}
  {% assign sorted_projects = categorized_projects | sort: "importance" %}
  {% if category == "Lab alumni" %}
    {% assign sorted_projects = categorized_projects | sort: "departed" | reverse %}
  {% endif %}
  {% if category == "Current members" %}
    {% assign sorted_projects = categorized_projects | sort: "joined" | reverse %}
  {% endif %}
  <!-- Generate cards for each project -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
  {% endfor %}

{% else %}

<!-- Display profiles without categories -->

{% assign sorted_projects = site.profiles | sort: "importance" %}

  <!-- Generate cards for each project -->

{% if page.horizontal %}

  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>

{% assign alumni = site.profiles | where: "category", "Lab alumni" %}
{% assign in_academia = alumni | where: "sector", "academia" | size %}
{% assign in_industry = alumni | where: "sector", "industry" | size %}
<h2 class="people-sectors-title">Where lab alumni are now</h2>
<div id="alumni-sectors" class="alumni-sectors" data-academia="{{ in_academia }}" data-industry="{{ in_industry }}">
  <svg class="alumni-sectors-pie" viewBox="0 0 120 120" role="img" aria-label="Lab alumni in academia and industry"></svg>
  <div class="alumni-sectors-body">
    <p class="alumni-sectors-summary">
      Of {{ in_academia | plus: in_industry }} lab alumni with a known current position, {{ in_academia }} are in academia and
      {{ in_industry }} are in industry.
    </p>
    <ul class="alumni-sectors-legend">
      <li><span class="swatch swatch-academia"></span>Academia <span class="count">{{ in_academia }}</span></li>
      <li><span class="swatch swatch-industry"></span>Industry <span class="count">{{ in_industry }}</span></li>
    </ul>
    <p class="alumni-sectors-note">Academia includes faculty, postdoctoral and graduate positions at universities and research hospitals.</p>
  </div>
</div>

<script defer src="{{ '/assets/js/people-bubbles.js' | relative_url }}"></script>
