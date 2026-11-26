---
layout: page
title: projects
permalink: /projects/
description: Research themes and active projects in the Treangen lab
nav: true
nav_order: 2
# Research areas are listed by number of papers, most first (Nov 2026, as shown on the papers page: 38, 38, 36, 13), then the owl project.
display_categories: ["Pathogen Genomics and Wastewater Surveillance", "Microbiome Profiling and Metagenomics", "Scalable Algorithms and AI for Microbial Genomics", "Biosecurity and Synthetic DNA Screening", "Great Horned Owl “Sammy” sequencing and assembly project"]
horizontal: false
---

Main research themes of the Treangen lab are listed below. Each page describes a project, the lab's role, funding source, and the publications and methods that have come out of it. Source code for every tool is on the [Code](/repositories/) page.

Trainees in our lab are also supported by fellowships, including the Gulf Coast Consortia [NLM Training Program in Biomedical Informatics and Data Science](https://www.gulfcoastconsortia.org/home/training/bmi-nlm/) (NIH T15LM007093, PI: Lydia Kavraki), which supports [Ryan Doughty](/profiles/rdoughty/).

<div style="clear: both;"></div>

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
