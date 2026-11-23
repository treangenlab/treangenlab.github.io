---
layout: page
title: Lemur and MAGnet
description: Lightweight taxonomic profiling of long-read metagenomic datasets
img:
importance: 2
category: tool
github: https://github.com/treangenlab/lemur
related_publications: true
---

## Background
Lemur and MAGnet are a pair of tools for rapid, accurate taxonomic profiling of long-read metagenomes {% cite sapoval2024lightweight %}.

- **Lemur** profiles a sample quickly and reports relative abundances at a chosen taxonomic rank.
- **MAGnet** refines those assignments with a reference-based check. It selects and downloads reference genomes, aligns reads with Minimap2, and uses breadth and depth of genome coverage to verify which taxa are really present.

## Availability
Open source at [github.com/treangenlab/lemur](https://github.com/treangenlab/lemur) (also on Bioconda) and [github.com/treangenlab/magnet](https://github.com/treangenlab/magnet).
