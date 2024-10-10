---
layout: distill
title: Austin's STAMPS 2024 Experience
description: Experience and recap of the STAMPS 2024 workshop
tags: workshops
giscus_comments: false
date: 2024-09-28
featured: true

authors:
  - name: Austin Marshall
    url: "https://microbemarsh.github.io/"
    affiliations:
      name: Center for Neuroregeneration, Houston Methodist Research Institute and Department of Computer Science, Rice University

# bibliography: 2024-09-28-stampsblog.bib

toc:
  - name: Introduction
  - name: Venue
  - name: Topics and Presenters
  - name: Overall experience
  - name: Should you go?

---

## Introduction
Hey there, I'm Austin Marshall, a first year postdoctoral fellow in the [Villapol](https://villapol.hmailabs.org/) and [Treangen](https://treangenlab.github.io/) Labs where I work on trimming the knowledge gap between microbiologists and computer scientists. This blog will be related to my experience of the Strategies and Techniques for Analyzing Microbial Population Structures (STAMPS) workshop that I attended this past July.

---

## Venue

### Location
The STAMPS workshop is held at the University of Chicago, Marine Biological Laboratory. The Marine Biological Laboratory (**MBL**) is located in [Wood's Hole, Massachusetts](https://www.google.com/maps/place/Woods+Hole,+Falmouth,+MA/@41.5300117,-70.6892765,14z/data=!3m1!4b1!4m6!3m5!1s0x89e4d87731d3bb2b:0x6057f1e3e2336b81!8m2!3d41.5264977!4d-70.6730857!16zL20vMHR5N2I?entry=ttu&g_ep=EgoyMDI0MDkyNS4wIKXMDSoASAFQAw%3D%3D) and is the closest mainland town to [Martha's Vineyard.](https://www.google.com/maps/place/Martha's+Vineyard/@41.3923525,-70.817379,11z/data=!3m1!4b1!4m14!1m7!3m6!1s0x89e525890034153b:0xf5d72dfce4b4bc43!2sMartha's+Vineyard!8m2!3d41.3804981!4d-70.645473!16zL20vMGd0cmc!3m5!1s0x89e525890034153b:0xf5d72dfce4b4bc43!8m2!3d41.3804981!4d-70.645473!16zL20vMGd0cmc?entry=ttu&g_ep=EgoyMDI0MDkyNS4wIKXMDSoASAFQAw%3D%3D)

<div class="text-align: center;">
  <img src="https://treangenlab.github.io/assets/img/crabs_mbl.jpg" alt="horseshoe crabs at MBL">
</div>

### History
I was unaware of the immensely deep research history that the Woods Hole Oceanographic Institute and Marine Biology Laboratory have until I was tired of having my thinking cap on one evening and started looking around the amazing displays where I stumbled upon this.

<div class="text-align: center;">
  <img src="https://treangenlab.github.io/assets/img/thm_nobel.jpg" alt="Thomas Hunt Morgan Nobel Prize">
</div>

Check out this awesome Nobel prize they have on display near the Lillie Library, it was awarded to Thomas Hunt Morgan for his discovery of the role chromosomes play in heredity. Countless nobel laureates, defining figures in biology, and just amazing researchers had walked through these same halls that I was fortunate enough to have the opportunity to as well. For a wild list of nobel laureates affiliated with the MBL check out [this page.](https://www.mbl.edu/about/history-archives/nobel-laureates)

---

## Topics and Presenters
The [course description](https://www.mbl.edu/education/advanced-research-training-courses/course-offerings/strategies-and-techniques-analyzing-microbial-population-structures) of the STAMPS workshop is pretty spot-on. (_nanopore sequencing pun_) We went through the analysis of short-read and long-read amplicon sequencing analysis as well as metagenomic sequence analysis. Personally, I believe the _Stats Day_ was the most useful part for me but this could be due to my background and experience level.

The speaker lineup for the STAMPS workshop is pretty insane. The lectures began with an introduction into sequencing modalities and 16S sequence analysis by [Dr. Ben Callahan.](https://scholar.google.com/citations?user=zGifBvwAAAAJ&hl=en) Following Dr. Callahan, we were introduced into metagenomics and kmer based analyses by [Dr. C. Titus Brown](https://scholar.google.com/citations?user=O4rYanMAAAAJ&hl=en) who is definitely a leader in this field as his group is responsible for the creation and maintenance of [sourmash](https://github.com/sourmash-bio/sourmash), [khmer](https://github.com/dib-lab/khmer), and [spacegraphcats](https://github.com/spacegraphcats/spacegraphcats/).

After Dr. Brown gave the basis of metagenomic asequencing and analysis it was time for my group to step up to the plate. My co-PI [Dr. Todd J. Treangen](https://scholar.google.com/citations?user=N5irv88AAAAJ&hl=en) and STAMPS alumni / research scientist in the Treangen Lab [Dr. Michael G. Nute](https://scholar.google.com/citations?hl=en&user=E1v2MBUAAAAJ) gave a very in-depth look into metagenomic assembly including a hands on demonstration of reference-based vs. de-novo assembly methods and also gave some insight into multiprocessing and how we as a class only ran our assembly on one core...

<div class="text-align: center;">
  <img src="https://treangenlab.github.io/assets/img/agm_assembler.jpg" alt="cinnamon bun powered genome assembler">
</div>
Behind the scenes of the metagenomic assembly tutorial, shown above a cinnamon bun powered window size estimator.


The next day we were introduced to the fascinating research of [Dr. Curtis Huttenhower.](https://scholar.google.com/citations?user=yFncM6AAAAAJ&hl=en) If you are in the world of microbiome research you should be familiar with this name. Dr. Huttenhower covered a broad overview of his group's research but dove in-depth with a few of the Biobakery's newer tools including [anpan](https://github.com/biobakery/anpan), [HAllA](https://github.com/biobakery/halla), and [MaAsLin3](https://github.com/biobakery/maaslin3). This was probably one of the more intense lab sessions we had and we certainly put those Rstudio VM's to good use.

On the third to last day we had our _Stats Day_, led by the wonderful and talented [Dr. Amy Willis.](https://scholar.google.com/citations?hl=en&user=pFlAtDsAAAAJ) Dr. Willis walked the class through arguably some of the most complex and misunderstood areas of microbiome sequence analysis including relative abundances, alpha and beta diversity, as well as differential abundance analyses. Her research is certainly at the top of the field and if you are performing any microbiome analysis you should check out the [StatDivLab's github](https://github.com/statdivlab) for their plethora of programs that will help give you _confidence_ in your results. I also want to shoutout her wonderful PhD students [Sarah](https://github.com/svteichman), [Shirley](https://github.com/shirmath), and [Maria](https://github.com/MariaAVC) who are the next generation of microbiome stats wizards. 

My last full day was focused on metagenomic binning, with a little added flavor of strain level analysis and phylogenetics thanks to Mike Nute's background and PhD with [Dr. Tandy Warnow.](https://scholar.google.com/citations?hl=en&user=pPB_WK0AAAAJ) During this lecture and lab, we walked through the steps of using common binning tools (and what they are doing) as well as ran a multiple sequence alignment using [parsnp2](https://github.com/marbl/parsnp) with a [gingr](https://github.com/marbl/gingr) visualization! 

One of the speakers who was unable to come because of the dang C*VID was [Dr. Mike Lee.](https://scholar.google.com/citations?user=-ONw6lsAAAAJ&hl=en) Dr. Lee was still involved in this workshop as he was kind of our tech guy behind the scenes, as he had setup all our own individual compute instances (JupyterLab and Rstudio) and installed all the dependencies for the workshop labs to run smoothly. Mike Lee is someone I had really looked forward to meeting, as his website [Happy Belly Bioinformatics](https://astrobiomike.github.io/), was one of the main resources I used to begin my bioinformatics journey, also we worked in the same field at different NASA facilities for a while. Mike if you're reading this **hmu!**

---

## Overall experience
I think this was a great learning experience and it was hosted at a fantastic institution that has a remarkable past. Proabably my biggest gripe about this conference was the lack of air conditioning in the housing. Coming from Houston Texas, where the AC is on so much that there is a 40 degree temperature difference between inside and outside this was a bit of a challenge but it should not defer **anyone** from attending this workshop, it's part of the experience.

---

## Should you go?
**Yes**. If you are a biologist working on any microbiome analysis this would be a very beneficial experience for you and even if you are slightly seasoned in microbial sequence analysis like myself, I was still able to find it quite useful and gave me some more confidence to help get over the ever present [imposter syndrome.](https://en.wikipedia.org/wiki/Impostor_syndrome) If you have any questions on the STAMPS workshop or on more aspects of my time at STAMPS feel free to reach out via my contact info and check out the [STAMPS 2024 github!](https://github.com/mblstamps/stamps2024)

---
