---
layout: page
title: Olivar
description: Automated variant-aware primer design for multiplex tiled amplicon sequencing
img:
importance: 2
category: Viral genomics and primer design
github: https://github.com/treangenlab/olivar
related_publications: true
---

## Background
Olivar is a command-line tool for multiplex PCR tiling design {% cite wang2024olivar %}. It first builds an index for each target of interest that captures undesired sequence features such as homologous regions, SNPs and extreme GC content. It then designs tiled amplicons covering one or more indexes and minimizes primer dimers with the SADDLE algorithm.

Olivar was developed by Dr. Michael X. Wang in collaboration with the Stadler lab at Rice.

## Availability
Open source at [github.com/treangenlab/olivar](https://github.com/treangenlab/olivar) and installable from Bioconda (Linux, macOS, and Windows via WSL).
