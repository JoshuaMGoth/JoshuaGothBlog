---
title: "5 Linux Shortcuts That Changed How I Work"
date: 2025-11-06T16:13:02-08:00
draft: false
description: "5 Linux Command Line Shortcuts That Will Make You 10x More Productive"
noindex: false
featured: false
pinned: false
# comments: true
series:
#  - 
categories:
  - Linux
  - Technology
  - Guides
tags:
  - CLI
  - howto
  - Shortcuts
  - Tips
  - Tricks
images:
 - linux-cli.png
# menu:
#   main:
#     weight: 100
#     params:
#       icon:
#         vendor: bs
#         name: book
#         color: '#e24d0e'
alt_text: "Discover 10 awesome Linux command line tricks that boost productivity and bring fun to your terminal. From matrix-style displays to disk space management and automation tools - become a command line wizard today!"
---
# 5 Linux Command Line Shortcuts That Will Make You 10x More Productive

Although having to work with Linux throughout my career, only within the last year have I switched to use Linux as a full-time, daily driver. Although very comfortable, I still consider myself a laymen (lacking in-depth knowledge of programming languages).

However, I wanted to share some commands that I picked up along the way that have made my every day life easier. I made a conscience effort--in the early days of full-time Linux-- to stay away from the GUI, and unlock the power of the terminal / command line. This, by far, was the best choice I have made, as I cannot tell you the amount of control that I have (not to mention the time I have saved) when working on my many projects. 

Below are my top five that I use on a daily basis that help me save oodles of time. I hope they help!


## 1. **Ctrl + R (Reverse Search) - Your Command History Time Machine**

This is arguably the biggest time-saver for anyone who uses the command line regularly. Instead of scrolling through history or retyping long commands, let the terminal find them for you.

```bash
# Press Ctrl + R, then start typing any part of a previous command
(reverse-i-search)`ssh`: ssh user@server.com -p 2222

# Keep pressing Ctrl + R to cycle through older matches
# Press Enter to execute, or press Right Arrow to edit first
```

## 2. **Ctrl + A / Ctrl + E - Line Navigation Mastery**

I am still working on mastering this, for using arrow keys feels like second nature.  The first two examples are what I use countless times everyday. 

```bash
Ctrl + A  # Move cursor to Beginning of line
Ctrl + E  # Move cursor to End of line

Ctrl + A  # Beginning
Ctrl + E  # End  
Ctrl + K  # Delete from cursor to end of line
Ctrl + U  # Delete from cursor to beginning of line
Ctrl + W  # Delete previous word
Alt + D   # Delete next word
```


## 3. **!! and !$ - The Ultimate Repeat Shortcuts**

I'm still getting used to this, but it is very useful, nonetheless. 


```bash
sudo apt update
# Oops, forgot sudo!
sudo !!

# Working with a file
tar -xzf long-complicated-filename.tar.gz
cd !$   # Expands to: cd long-complicated-filename.tar.gz
# Actually, let me check what's in it first
ls -la !:1  # Expands to: ls -la long-complicated-filename.tar.gz
```

## 4. **Ctrl + Z / bg / fg - Process Management Magic**

This is by far my favorite. The only problem that I have is forgetting what I have moved to the background. Still, this is my favorite on the list. 

```bash
# Start a long-running process
python3 data_processing.py

# Oops, need the terminal back!
Ctrl + Z  # Suspend the process

bg        # Resume process in background
fg        # Bring back to foreground

# Or to truly background it:
jobs      # See background jobs
disown %1 # Disconnect job 1 from terminal
```

## 5. **cd - - The Directory Switcher**

Simple. Way-Cool. Super-useful!

```bash
cd /var/log
# Do some work...
cd /home/user/projects
# Need to check logs again?
cd -   # Back to /var/log
# Back to projects?
cd -   # Back to /home/user/projects
```

## **BONUS: Custom Aliases That Change Everything**

While not a built-in shortcut, or a trick of any kind, I have found customization by use of Aliases to be life changing. 

**Add to ~/.bashrc:**
```bash
# Navigation
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Safety nets
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Quick listings
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# System monitoring
alias cpu='top -o %CPU'
alias mem='top -o %MEM'
alias ports='netstat -tulanp'

# Git shortcuts
alias gs='git status'
alias gc='git commit'
alias gp='git push'

# Quick editing
alias bashrc='vim ~/.bashrc && source ~/.bashrc'
alias vimrc='vim ~/.vimrc'
```

I hope these tidbits help you as much as they have me. Ill continue to post the things that I learned that *wow* me the most. 

**I would love to hear your favorite shortcuts / commands / Linux tricks. Drop me a line, or comment below, and Ill update the post (while giving you credit).**

~CHEERS
