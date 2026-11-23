---
layout: page
title: Rhea
description: Reference-free structural variant detection in microbiomes
img:
importance: 3
category: tool
github: https://github.com/treangenlab/rhea
related_publications: true
---

## Background
Rhea detects structural variants between steps of a long-read metagenomic series, such as a time course, without reference genomes {% cite curry2024reference %}. It builds a single co-assembly graph from all reads in the series with metaFlye, aligns each sample's reads to that graph with minigraph, and looks for variant-specific patterns in how coverage changes between steps.

Rhea currently reports insertions, deletions, complex indels and tandem duplications. It was developed by Dr. Kristen Curry and presented at ISMB 2024.

## Availability
Open source at [github.com/treangenlab/rhea](https://github.com/treangenlab/rhea).
