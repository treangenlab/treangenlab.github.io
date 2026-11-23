---
layout: page
title: PlasmidScreen
description: Fast detection of engineered DNA in sequencing reads
img:
importance: 2
category: Pathogen detection and biosecurity
github: https://github.com/treangenlab/PlasmidScreen
related_publications: true
---

## Background
PlasmidScreen detects engineered DNA in sequencing reads. Its first stage is a Kraken2 k-mer scan over sliding windows against a custom database built for engineering detection. An optional second stage looks for signs of codon optimization: it finds each read's nearest protein neighbor with DIAMOND, compares codon usage against the matching host's codon table, and flags reads whose codon adaptation index exceeds a threshold. Each read receives an overall call of Natural or Synthetic.

PlasmidScreen is developed by Felix Quintana. Related lab work on detecting engineered plasmids: {% cite quintana2026towards wang2021plasmidhawk %}.

## Availability
Open source at [github.com/treangenlab/PlasmidScreen](https://github.com/treangenlab/PlasmidScreen).
