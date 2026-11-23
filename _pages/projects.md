---
layout: page
title: projects
permalink: /projects/
description: Active funded research in the Treangen lab
nav: true
nav_order: 2
display_categories: ["National Institutes of Health", "National Science Foundation", "CDC and Department of Defense"]
horizontal: false
---

The lab's research is organized around the funded projects below. Each page describes the project, the lab's role, and the tools that have come out of it. Source code for every tool is on the [Code](/repositories/) page.

Trainees in the lab are also supported by fellowships, including the Gulf Coast Consortia [NLM Training Program in Biomedical Informatics and Data Science](https://www.gulfcoastconsortia.org/home/training/bmi-nlm/) (NIH T15LM007093, PI: Lydia Kavraki), which supports [Ryan Doughty](/profiles/rdoughty/).

<!-- pages/projects.md -->
<div class="projects">
{% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category">{{ category }}</h2>
  </a>
  {% assign categorized_projects = site.projects | where: "category", category %}
  {% assign sorted_projects = categorized_projects | sort: "importance" %}
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

<!-- Display projects without categories -->

{% assign sorted_projects = site.projects | sort: "importance" %}

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
