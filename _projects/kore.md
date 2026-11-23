---
layout: page
title: kore
description: Bacterial genome completeness and contamination estimates from species core genomes
img:
importance: 2
category: Genome alignment and assembly
github: https://github.com/treangenlab/kore
related_publications: true
---

## Background
kore estimates how complete and how contaminated a bacterial genome assembly is, a job usually done with BUSCO, CheckM or CheckM2. It compares each assembly directly against the core genome of its species and names the species of any contamination it finds.

For each species, kore builds a core genome from the sequence shared by that species' high-quality genomes, found with a Parsnp2 core-genome alignment. Completeness is the share of that core found in the assembly. Contamination combines core sequence found more than once (for example a second strain) with core sequence from other species.

kore needs no gene annotation and is designed to be robust to fragmented assemblies. It is intended for species that have a core genome in its database; for novel or distant species the authors recommend CheckM2. kore is developed by Ryan Doughty.

## Availability
Open source at [github.com/treangenlab/kore](https://github.com/treangenlab/kore).
