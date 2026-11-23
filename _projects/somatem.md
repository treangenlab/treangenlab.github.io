---
layout: page
title: somatem
description: A modular, open-source Nextflow toolkit for long-read microbiome analysis
img:
importance: 3
category: software
github: https://github.com/treangenlab/somatem
related_publications: true
---

## Background
somatem is a modular Nextflow toolkit for long-read microbiome analysis. It supports Oxford Nanopore and PacBio data from 16S, metagenomic, isolate and longitudinal studies, with reproducible Conda environments and HTML summaries.

## Workflows
- Pre-processing: QC, read filtering and host depletion
- 16S profiling with Emu {% cite curry2022emu %}
- Metagenomic taxonomic profiling, including Lemur and MAGnet {% cite sapoval2024lightweight %}
- Assembly and MAG recovery
- Isolate genome analysis
- Pathogen and functional screening with SeqScreen {% cite balaji2022seqscreen %}
- Genome dynamics (structural variation and horizontal gene transfer) with Rhea {% cite curry2024reference %}

## Availability
Open source at [github.com/treangenlab/somatem](https://github.com/treangenlab/somatem) and installable from Bioconda (Linux and macOS).

## Team
- Dr. Prashant Kalvapalle (lead developer)
- Dr. Austin Marshall (now Research Assistant Professor, University of Florida)
- Dr. Todd J. Treangen
