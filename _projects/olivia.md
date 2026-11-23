---
layout: page
title: Olivia
description: Learned sequence representations for automated primer design
img:
importance: 3
category: Viral genomics and primer design
github: https://github.com/treangenlab/Olivia
related_publications: true
---

## Background
Olivia designs tiled amplicon primer schemes from a multiple sequence alignment. It extends [Olivar](/projects/olivar/) {% cite wang2024olivar %} in three ways:

- **A learned primer encoder.** Every candidate primer is scored by a multi-head encoder trained on about one million experimentally validated primers from more than 8,000 species, and the more abnormal half is discarded before primer-dimer optimization.
- **NUPACK primer-dimer optimization.** Primer pools are optimized against NUPACK 4 free energies.
- **Degenerate primers.** In degenerate mode the design reference is an IUPAC consensus of the alignment, so primers can cover sequence variation with ambiguous bases.

Olivia is developed by Dongwei Li with Dr. Michael X. Wang and Dr. Lauren B. Stadler.

## Availability
Open source at [github.com/treangenlab/Olivia](https://github.com/treangenlab/Olivia).
