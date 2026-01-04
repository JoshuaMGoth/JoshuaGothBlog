---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: false
description: "{{ replace .Name "-" " " | title }}"
noindex: false
featured: false
pinned: false
comments: true
authors:

  - JoshuaGoth
  
series:
#  - 
categories:
#  - 
tags:
#  - 
images:
#  - 
alt_text: 
# menu:
#   main:
#     weight: 100
#     params:
#       icon:
#         vendor: bs
#         name: book
#         color: '#e24d0e'
# movie review - {{< movie_review imdb_id="tt1234567" my_rating="8.5" >}} {{< /movie_review >}}
---

Your blog post content here...


{{ partial "support-me.html" . }}


