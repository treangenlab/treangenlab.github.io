---
layout: page
title: news
permalink: /news/
description: Lab news since the Treangen Lab launched in 2018
nav: true
nav_order: 6
---

{% assign items = site.news | sort: "date" | reverse %}
{% assign current_year = "" %}
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
      {% if item.approx_date %}{{ item.date | date: "%b %Y" }}{% else %}{{ item.date | date: "%b %d, %Y" }}{% endif %}
    </th>
    <td>
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
