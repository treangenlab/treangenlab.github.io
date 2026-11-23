---
layout: page
title: Seqwin
description: Ultrafast identification of signature sequences in microbial genomes
img:
importance: 1
category: tool
github: https://github.com/treangenlab/Seqwin
related_publications: true
---

## Background
Seqwin is a fast, memory-efficient toolkit for discovering signature sequences (genomic markers) that balance high sensitivity with high specificity. It builds a minimizer-based pan-genome graph across target genomes and neighboring non-target genomes, and extracts signatures with a novel graph algorithm. The signatures can feed downstream assay design, including qPCR, ddPCR, amplicon sequencing and hybrid capture probes.

Seqwin is published in Bioinformatics as part of the ISMB 2026 proceedings {% cite wang2026seqwin %}.

## Availability
Open source at [github.com/treangenlab/Seqwin](https://github.com/treangenlab/Seqwin); installable from Bioconda (Linux, macOS) and PyPI (Windows, Linux, macOS).

## Team
- Dr. Michael X. Wang (lead developer)
- Dr. Bryce Kille
- Dr. Michael G. Nute
- Siyi Zhou
- Dr. Lauren B. Stadler (Rice University)
- Dr. Todd J. Treangen
