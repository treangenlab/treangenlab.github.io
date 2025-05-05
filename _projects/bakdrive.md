---
layout: page
title: Bakdrive
description: A novel approach to inferring microbial interactions across multiple microbiome samples
img:
importance: 4
category: software
---
# Optional external URL for project (replaces project detail page).
# external_link: "https://www.iarpa.gov/index.php/research-programs/fun-gcat"

# image:
#  caption: Bakdrive pipeline
#  focal_point: Smart

# links:

# url_code: "https://gitlab.com/treangenlab/bakdrive"
# url_pdf: "https://www.biorxiv.org/content/10.1101/2021.09.24.461746v1.full.pdf"
# url_slides: ""
# url_video: ""

# Slides (optional).
#   Associate this project with Markdown slides.
#   Simply enter your slide deck's filename without extension.
#   E.g. `slides = "example-slides"` references `content/slides/example-slides.md`.
#   Otherwise, set `slides = ""`.
# slides: bakdrive

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vS9ydjWtiIZejkaW0fA5gjJnNmZR1p_IUw3Uwze6cg7RGLHQjOxIzmXoo9ptCODaS8mOzDXX-qTwGM_/embed?start=true&loop=true&delayms=5000" frameborder="0" width="720" height="434" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

## Background
Interactions among microbes within microbial communities have been shown to play crucial roles in human health. In spite of recent progress, low-level knowledge of bacteria driving microbial interactions within microbiomes remains unknown, limiting our ability to fully understand and control microbial communities. In this study, we present a novel approach for identifying driver species within microbiomes. Bakdrive infers ecological networks of given metagenomic sequencing samples and identifies minimum sets of driver species using control theory. Bakdrive has three key innovations in this space: (i) it leverages inherent information from metagenomic sequencing samples to identify driver species, (ii) it explicitly takes host-specific variation into consideration, and (iii) it does not require a known ecological network. In extensive simulated data, we demonstrate identifying driver species identified from healthy donor samples and introducing them to the disease samples, we can restore the gut microbiome in recurrent Clostridioides difficile infection patients to a healthy state. We also applied Bakdrive to two real datasets, rCDI and Crohn’s disease patients, uncovering driver species consistent with previous work. In summary, Bakdrive provides a novel approach for teasing apart microbial interactions. Bakdrive is open-source and available at https://gitlab.com/treangenlab/bakdrive





