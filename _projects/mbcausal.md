---
layout: page
title: mbcausal
description: Causal inference from longitudinal gut microbiome profiles
img:
importance: 4
published: false
category: tool
github: https://github.com/treangenlab/mbcausal
related_publications: true
---

## Background
mbcausal is a disease-agnostic pipeline for causal inference from longitudinal gut microbiome data. It profiles shotgun or long-read metagenomes, builds quality-controlled abundance tables for each cohort, applies a centered log-ratio transform, and then runs interpretable representation learning and lagged causal discovery against clinical outcomes.

The pipeline was developed on the iHMP/IBDMDB inflammatory bowel disease cohort and includes a simulation study in which the true answer is known. It is developed by Eddy Huang.

## Availability
Open source at [github.com/treangenlab/mbcausal](https://github.com/treangenlab/mbcausal), with full documentation in the project [wiki](https://github.com/treangenlab/mbcausal/wiki).
