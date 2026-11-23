---
layout: page
title: Min-Frame Transformation (mft-tools)
description: A sequence transformation that masks point mutations for more sensitive viral genome alignment
img:
importance: 3
category: software
github: https://github.com/treangenlab/mft-tools
related_publications: true
---

## Background
The Min-Frame Transformation (MFT) locally transforms a nucleotide sequence into a character sequence over a separate, reduced alphabet. The transformation masks a large share of single-nucleotide mutations, which increases sensitivity for full-text indexing methods (MUMs, BWT) and in turn improves viral genome alignment {% cite doughty2026min %}.

MFT resembles minimizers, with three differences: a value is chosen for every window, so sequence length is preserved one-to-one; the k-mer ordering is defined a priori and not random; and k-mers map to a small alphabet (typically 12-64 characters) and not to one hash per k-mer.

## Availability
mft-tools is written in Rust and available at [github.com/treangenlab/mft-tools](https://github.com/treangenlab/mft-tools) and through conda. Analyses for the paper are at [github.com/treangenlab/mft-analyses](https://github.com/treangenlab/mft-analyses).

## Team
- Ryan Doughty (lead developer)
- Ankhi Banerjee
- Dr. Bryce Kille
- Dr. Tandy Warnow (UIUC)
- Dr. Todd J. Treangen
