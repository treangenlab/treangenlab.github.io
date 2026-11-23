---
layout: page
title: onsight
description: Pathogen detection directly from nanopore raw signal, on CPU, during the run
img:
importance: 2
category: Pathogen detection and biosecurity
github: https://github.com/treangenlab/onsight
related_publications: true
---

## Background
onsight detects pathogens from the raw electrical signal of nanopore reads while a sequencing run is in progress. It needs no basecalling and no GPU, so it can run beside the sequencer on a small device.

onsight matches raw signal against a panel of signatures: short DNA pieces specific to each target species. It reports which targets are present in the sample and after how many reads each one was called. It reads FAST5, POD5, SLOW5 and BLOW5 files from R9.4.1 and R10.4.1 flow cells.

onsight is developed by Eddy Huang.

## Availability
Open source at [github.com/treangenlab/onsight](https://github.com/treangenlab/onsight).
