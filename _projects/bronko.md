---
layout: page
title: bronko
description: Ultrafast, alignment-free detection of viral genome variation
img:
importance: 1
category: tool
github: https://github.com/treangenlab/bronko
related_publications: true
---

## Background
bronko is a viral variant caller, written in Rust, that detects major and minor variants directly from sequencing reads. It bypasses read mapping: k-mers within a small edit distance are mapped straight onto a pileup of the forward and reverse strands, and variants are called from the resulting depth and k-mer support. The output is a VCF, and multiple samples of the same species can be combined into a multiple sequence alignment for phylogenetics.

## Highlights
- One or two commands replace indexing, read mapping, SAM manipulation and variant calling
- Scales to hundreds of reference strains against hundreds of samples at once
- 10-1000x faster than read mapping followed by variant calling, depending on depth and thread count
- Calls consistent with iVar and LoFreq for SNPs and iSNVs; indel calling is available as of v0.1.4

bronko was accepted to RECOMB 2026 and is published in Genome Research {% cite doughty2026bronko %}.

## Availability
Open source at [github.com/treangenlab/bronko](https://github.com/treangenlab/bronko) and installable from Bioconda.

## Team
- Ryan Doughty (lead developer)
- Dr. Michael J. Tisza (Baylor College of Medicine)
- Dr. Todd J. Treangen
