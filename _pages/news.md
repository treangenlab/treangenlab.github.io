---
layout: page
title: news
permalink: /news/
description: Lab news since the Treangen Lab launched in 2018
nav: true
nav_order: 5
---

{% assign items = site.news | sort: "date" | reverse %}
{% assign current_year = "" %}
<p class="news-today" id="news-today" hidden><i class="fa-regular fa-calendar" aria-hidden="true"></i> Today is <time></time></p>
<script>
  (function () {
    var p = document.getElementById("news-today");
    if (!p) return;
    var now = new Date();
    var t = p.querySelector("time");
    t.textContent = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    t.setAttribute("datetime", now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2));
    p.hidden = false;
  })();
</script>
<div class="news news-by-year">
{% for item in items %}
  {% assign item_year = item.date | date: "%Y" %}
  {% if item_year != current_year %}
    {% unless forloop.first %}
      </table>
    {% endunless %}
    <h2 class="news-year" id="{{ item_year }}">{{ item_year }}</h2>
    <table class="table table-sm table-borderless">
    {% assign current_year = item_year %}
  {% endif %}
  <tr>
    <th scope="row" style="width: 20%">
      {% if item.year_only %}{{ item.date | date: "%Y" }}{% elsif item.approx_date %}{{ item.date | date: "%b %Y" }}{% else %}{{ item.date | date: "%b %d, %Y" }}{% endif %}
    </th>
    <td>
      {% if item.themes %}<span class="news-themes">{% for theme in item.themes %}{% case theme %}{% when 'biosecurity' %}{% assign tn = 'Biosecurity and Synthetic DNA Screening' %}{% when 'pathogen' %}{% assign tn = 'Pathogen Genomics and Wastewater Surveillance' %}{% when 'microbiome' %}{% assign tn = 'Microbiome Profiling and Metagenomics' %}{% else %}{% assign tn = 'Scalable Algorithms and AI for Microbial Genomics' %}{% endcase %}<a href="{{ '/projects/' | relative_url }}" title="{{ tn }}"><img src="{{ '/assets/anim/papers/' | append: theme | append: '.png' | relative_url }}" width="24" height="24" alt="{{ tn }}" loading="lazy"></a>{% endfor %}</span>{% endif %}
      {% if item.inline %}
        {{ item.content | remove: "<p>" | remove: "</p>" | emojify }}
      {% else %}
        <a class="news-title" href="{{ item.url | relative_url }}">{{ item.title }}</a>
      {% endif %}
    </td>
  </tr>
  {% if forloop.last %}
    </table>
  {% endif %}
{% endfor %}
</div>
