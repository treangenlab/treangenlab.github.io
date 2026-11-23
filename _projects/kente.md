---
layout: page
title: Kente
description: A graph-based pangenomic approach for horizontal gene transfer detection in microbiomes
img:
importance: 2
category: software
github: https://github.com/treangenlab/Kente
related_publications: true
---

## Background
Kente is a pangenome graph-based framework for detecting horizontal gene transfer (HGT) from assembled metagenomic contigs {% cite kokroko2026kente %}. Kraken2 first profiles which genera are present in a sample, which narrows the search space; minigraph then maps the contigs against a pre-built database of bacterial genus-level pangenome graphs, and HGT events are called from the contig-to-graph alignments.

The name comes from the Ghanaian woven fabric: just as kente cloth weaves many strands into one design, bacterial genomes are mosaics in which segments move across lineages.

## Availability
Open source at [github.com/treangenlab/Kente](https://github.com/treangenlab/Kente). The pangenome graph database is available on [Zenodo](https://zenodo.org/records/18895175).

## Team
- Natalie Kokroko (lead developer)
- Richa Jayanti
- Dr. Nicolae Sapoval
- Dr. Michael G. Nute
- Dr. Luay Nakhleh
- Dr. Todd J. Treangen
