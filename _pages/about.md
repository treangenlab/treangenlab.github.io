---
layout: about
title: home
permalink: /
subtitle: <a href='https://csweb.rice.edu'>Department of Computer Science, Rice University </a>. 

profile:
  align: right
  image: labphoto_2026.jpg
  images: # the home page cycles through these photos
    - image: labphoto_2026.jpg
      focus: "50% 88%" # which part of the photo stays in view when it is cropped to the shared 4:3 frame
      caption: Treangen Lab at the U.S. Capitol, October 2026
    - image: labphoto_steps.jpg
      caption: Treangen Lab at Rice
    - image: labphoto_lunch.jpg
      caption: Treangen Lab lunch
    - image: labphoto_2024.jpg
      focus: "45% 50%" # which part of the photo stays in view when it is cropped to the shared 4:3 frame
      caption: Treangen Lab at Rice, October 2024
    - image: lab_oes.jpg
      focus: "75% 50%" # which part of the photo stays in view when it is cropped to the shared 4:3 frame
      caption: Treangen Lab at Rice, 2024
  image_circular: false # crops the image to make it circular
  more_info: >
    <p>Rice University, Houston, TX</p>

news: true # includes a list of news items
selected_papers: true # includes a list of papers marked as "selected={true}"
social: true # includes social icons at the bottom of the page
---

Welcome to the Treangen lab website, a bioinformatics and computational biology research group at Rice University, led by Dr. Todd J. Treangen (Associate Professor of Computer Science, with joint appointments in BioSciences and Bioengineering). 

<div id="recruiting" style="overflow: hidden; margin: 1.25rem 0; padding: 1rem 1.25rem; border-left: 5px solid var(--global-theme-color); border-radius: 6px; background-color: rgba(128, 128, 128, 0.12);">
  <p style="margin: 0 0 0.35rem 0; font-size: 1.15rem; font-weight: 600; color: var(--global-theme-color);">We're recruiting!</p>
  <p style="margin: 0;">The Treangen Lab has three open positions: a <strong>PhD student</strong>, a <strong>Postdoctoral Scientist</strong> and a <strong>Research Engineer</strong>. <a href="{{ '/news/hiring_2026/' | relative_url }}">Read about the open positions</a>.</p>
</div>

Since launching in 2018, the Treangen lab has focused on developing scalable and accurate computational algorithms, methods, and open-source software tools to answer research questions specific to: (i) biosecurity and synthetic DNA screening {% include theme_icon.liquid name="biosecurity" %}, (ii) pathogen genomics and wastewater surveillance {% include theme_icon.liquid name="pathogen" %}, (iii) microbiome profiling and metagenomics {% include theme_icon.liquid name="microbiome" %}, and (iv) scalable algorithms and AI/ML for microbial genomics {% include theme_icon.liquid name="algorithms" %}.

<div class="site-guide">
  <p class="site-guide-title">Explore the site</p>
  <ul>
    <li><i class="fa-solid fa-users" aria-hidden="true"></i><span><a href="{{ '/people/' | relative_url }}">People</a>: profiles of current Treangen lab members and alumni.</span></li>
    <li><i class="fa-solid fa-diagram-project" aria-hidden="true"></i><span><a href="{{ '/projects/' | relative_url }}">Projects</a>: active research areas.</span></li>
    <li><i class="fa-solid fa-code" aria-hidden="true"></i><span><a href="{{ '/repositories/' | relative_url }}">Code</a>: open-source tools and demos.</span></li>
    <li><i class="fa-solid fa-file-lines" aria-hidden="true"></i><span><a href="{{ '/publications/' | relative_url }}">Papers</a>: complete listing of all preprints and publications.</span></li>
    <li><i class="fa-solid fa-bullhorn" aria-hidden="true"></i><span><a href="{{ '/news/' | relative_url }}">News</a>: news items of note since lab launch in 2018.</span></li>
    <li><i class="fa-solid fa-pen-nib" aria-hidden="true"></i><span><a href="{{ '/blog/' | relative_url }}">Blog</a>: posts from lab members focusing on research, conferences, and travel.</span></li>
  </ul>
</div>

Current funding includes NSF (CAREER, SHF, MIM), NIH (NIAID GCID), and DTRA, among others. Prior support from: c3.ai DTI, DHS, IARPA, and NIH. 

<div class="funding-logos d-flex flex-wrap align-items-center" style="gap: 2.5rem; margin: 0.75rem 0 1rem;">
    <div style="width: 84px;">
        {% include figure.liquid loading="eager" path="assets/img/CDC_logo.png" title="CDC" class="img-fluid" sizes="120px" %}
    </div>
    <div style="width: 115px;">
        {% include figure.liquid loading="eager" path="assets/img/NIAID_logo.png" title="NIH" class="img-fluid" sizes="120px" %}
    </div>
    <div style="width: 60px;">
        {% include figure.liquid loading="eager" path="assets/img/NSF_logo.png" title="NSF" class="img-fluid" sizes="120px" %}
    </div>
    {% comment %} The DTRA logo appears once a file named DTRA_logo.png is added to assets/img. {% endcomment %}
    {% assign dtra_logo = site.static_files | where: "path", "/assets/img/DTRA_logo.png" | first %}
    {% if dtra_logo %}
    <div style="width: 64px;">
        {% include figure.liquid loading="eager" path="assets/img/DTRA_logo.png" title="DTRA" class="img-fluid" sizes="120px" %}
    </div>
    {% endif %}
</div>

