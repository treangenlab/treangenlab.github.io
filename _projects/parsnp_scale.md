---
layout: page
title: "Genome alignment and comparison at scale"
description: "Parsnp2 and related tools · Comparing microbial genomes and metagenomes as collections grow toward the petabyte scale"
img: assets/img/projects/parsnp_scale.png
img_anim: assets/anim/projects/parsnp_scale.gif
importance: 1
category: Petabyte-scale microbial genomics and metagenomics
topics: ["genome alignment", "strain-level analysis", "high-performance computing"]
members: [rluo, rdoughty, ymthant]
related_publications: true
---

## About the project
Public collections of microbial genomes and metagenomes now hold millions of genomes and are growing toward the petabyte scale, well beyond what classical alignment and search methods were built for. This line of work develops algorithms and data structures that keep whole-genome comparison practical at that scale, starting from the lab's core-genome aligner, Parsnp.

Parsnp 2.0 extends core-genome alignment to massive microbial datasets {% cite kille2024parsnp %}, and newer lab tools build on the same ideas for strain-level analysis, signature discovery and variant detection directly from sequencing data. The lab tested this approach under time pressure in the 2026 [DARPA Bio-Attribution Challenge](https://www.darpa.mil/research/challenges/bio-attribution), which required screening hundreds of terabytes of environmental sequencing data within hours.

## Tools from this project
- [Parsnp](/projects/parsnp/): core-genome alignment for thousands of microbial genomes
- [Strainify](/projects/strainify/): strain-level abundance analysis for short-read metagenomics, built on Parsnp
- [Seqwin](/projects/seqwin/): signature sequences in microbial genomes
- [bronko](/projects/bronko/): alignment-free detection of viral genome variation
- [mft-tools](/projects/mft/): a sequence transformation that masks point mutations for more sensitive viral genome alignment

Source code for all lab tools is on the [Code](/repositories/) page.

## Funding
This work is supported in part by the lab's [NSF CAREER](/projects/fund_career/) and [NSF MIM](/projects/fund_mim/) awards.
