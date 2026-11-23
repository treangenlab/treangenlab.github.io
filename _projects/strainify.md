---
layout: page
title: Strainify
description: Strain-level microbiome profiling for low-coverage short-read metagenomic datasets
img:
importance: 1
category: Microbiome analysis
github: https://github.com/treangenlab/Strainify
related_publications: true
---

## Background
Strainify is a strain-level abundance analysis tool for short-read metagenomics, designed to stay accurate on low-coverage datasets {% cite luo2025strainify %}. Given a folder of reference genomes and a folder of reads, it reports the relative abundance of each strain. It builds on the lab's core-genome alignment tool Parsnp {% cite kille2024parsnp %}, and an optional `filter-run` mode first uses MAGNET {% cite sapoval2024lightweight %} to keep only the reference genomes that are present in each sample.

## Availability
Open source at [github.com/treangenlab/Strainify](https://github.com/treangenlab/Strainify) and installable from Bioconda.

## Team
- Rossie Luo (lead developer)
- Dr. Bryce Kille
- Dr. Michael G. Nute
- Ellen E. Vaughan
- Justin R. Clark
- Dr. Anthony W. Maresso (Baylor College of Medicine)
- Dr. Todd J. Treangen
