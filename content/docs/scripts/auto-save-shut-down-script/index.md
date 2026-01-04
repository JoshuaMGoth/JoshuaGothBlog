---
title: "Linux Shut-Down and Auto-Save Script"
date: 2025-11-26T12:08:03-08:00
draft: false
description: "Linux Shut-Down and Auto-Save Script With Prompts"
noindex: false
featured: false
pinned: false
comments: true
series:
#  - 
categories:
  - Linux
  - Guides
  - Documentation
  - Application
tags:
  - Script
  - ShutDown
  - Tool
  - Bro
images:
  - shut-down.png
alt_text: "Linux Shut Down and Auto Save Scripts with Prompts"
# menu:
#   main:
#     weight: 100
#     params:
#       icon:
#         vendor: bs
#         name: book
#         color: '#e24d0e'
# 
---
# A Shut-Down Prompt That Can `Save` Us All
I have memory problems. As one that suffers from CRS (cant remember sh!t), anything that I can use to aid my handicap from day-to-day, I am all for. As such, I forget to save things and end up losing work on a daily basis during the evenings shutdown of the PC. 

 There are countless sites with walkthroughs, guides, programs, etc, so I do my best as to not reinvent the wheel, and share things that I have found useful that there may not have had enough attention to gain traction. 
 
 But It’s the little tech-shortcuts that I aim to share in my tech-centered posts. Things that, as a *real* person—who makes tons of *real* mistakes—I find **really** useful. 

It took some time and testing, but I created a script that I would like to share that is made for folks such as myself. The primary purpose: Saving all unsaved documents in a folder when a shutdown is triggered. Built in with a simple prompt, I have worked this into a service, which allows for the saving of all unsaved documents before any shutdown automatically. 

I hope you find it as useful as I have. Just update the variables to suit your personal needs **Don’t forget the test run**. [^2]

## Auto-Save Script

First things first: Create a script called `autosave_work.sh` and paste the contents below. I created two folders on my desktop. One for where the unsaved (now-saved) work goes, and one where the scripts that you will be creating below. But to each, their own.

```bash
#!/bin/bash

# Auto-save work script
# Save to: ~/Desktop/Shutdown

AUTOSAVE_DIR="$HOME/Desktop/Shutdown"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$AUTOSAVE_DIR/work_backup_$TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Auto-saving work to: $BACKUP_DIR"

# Function to check if process is running and then save relevant files
save_work() {
    # Save browser tabs (if using Firefox/Chrome)
    if pgrep -x "firefox" > /dev/null; then
        echo "Saving Firefox session..."
        # Firefox session backup (requires session manager extension or copy profile)
        firefox_profile=$(find ~/.mozilla/firefox -name "*.default-release" 2>/dev/null | head -1)
        if [ -n "$firefox_profile" ]; then
            mkdir -p "$BACKUP_DIR/firefox"
            cp -r "$firefox_profile/sessionstore-backups" "$BACKUP_DIR/firefox/" 2>/dev/null
        fi
    fi

    if pgrep -x "chrome" > /dev/null || pgrep -x "chromium" > /dev/null; then
        echo "Saving Chrome/Chromium session..."
        # Chrome session backup
        chrome_dir=$(find ~/.config -name "Chromium" -o -name "google-chrome" 2>/dev/null | head -1)
        if [ -n "$chrome_dir" ]; then
            mkdir -p "$BACKUP_DIR/chrome"
            cp "$chrome_dir/Default/Current Session" "$BACKUP_DIR/chrome/" 2>/dev/null
            cp "$chrome_dir/Default/Current Tabs" "$BACKUP_DIR/chrome/" 2>/dev/null
        fi
    fi

    # Save terminal sessions (tmux)
    if pgrep -x "tmux" > /dev/null; then
        echo "Saving tmux sessions..."
        mkdir -p "$BACKUP_DIR/tmux"
        tmux list-sessions > "$BACKUP_DIR/tmux/sessions.txt"
        # Save individual pane content
        tmux list-panes -a -F "#{session_name}:#{window_index}.#{pane_index}:#{pane_current_command}:#{pane_current_path}" > "$BACKUP_DIR/tmux/panes.txt"
    fi

    # Save unsaved documents from common editors
    save_editor_work() {
        local editor=$1
        local process_name=$2
        
        if pgrep -x "$process_name" > /dev/null; then
            echo "Detected $editor running - attempting to save work..."
            case $editor in
                "code")
                    # VS Code - save all files
                    if command -v code >/dev/null 2>&1; then
                        code --list-extensions > "$BACKUP_DIR/vscode_extensions.txt"
                        # Save opened files list
                        code --get-file-watch-patterns > "$BACKUP_DIR/vscode_files.txt" 2>/dev/null
                    fi
                    ;;
                "vim"|"nvim")
                    # Vim/Neovim - save session
                    mkdir -p "$BACKUP_DIR/vim"
                    # You might want to manually save sessions in your vim config
                    find /tmp -name "*vim*" -type f 2>/dev/null | head -5 | xargs -I {} cp {} "$BACKUP_DIR/vim/" 2>/dev/null
                    ;;
            esac
        fi
    }

    save_editor_work "code" "code"
    save_editor_work "vim" "vim"
    save_editor_work "nvim" "nvim"

    # Save recent documents
    echo "Saving recent documents..."
    find ~/Documents -name "*.txt" -o -name "*.md" -o -name "*.pdf" -o -name "*.doc*" 2>/dev/null | \
        head -20 | xargs -I {} cp {} "$BACKUP_DIR/" 2>/dev/null

    # Save desktop files
    echo "Saving desktop files..."
    cp ~/Desktop/* "$BACKUP_DIR/" 2>/dev/null

    # Save clipboard content
    if command -v xclip >/dev/null 2>&1; then
        echo "Saving clipboard content..."
        xclip -selection clipboard -o > "$BACKUP_DIR/clipboard.txt" 2>/dev/null
    fi

    # Save open windows information
    if command -v wmctrl >/dev/null 2>&1; then
        echo "Saving window information..."
        wmctrl -l > "$BACKUP_DIR/open_windows.txt"
    fi
}

# Export function for use in subshells
export -f save_work
export BACKUP_DIR

# Run save function
save_work

# Create a summary file
echo "Auto-save completed at: $(date)" > "$BACKUP_DIR/summary.txt"
echo "Backup location: $BACKUP_DIR" >> "$BACKUP_DIR/summary.txt"
echo "User: $USER" >> "$BACKUP_DIR/summary.txt"

echo "Auto-save completed! Files saved to: $BACKUP_DIR"
```

Make it Executable
```bash
chmod +x autosave_work.sh
```

### Enhanced Safe Shutdown Script with Interactive Prompt

Create a file called`interactive_shutdown.sh`, paste the contents below and place it with the other scripts.

```bash
#!/bin/bash

# Interactive safe shutdown script with auto-save

AUTOSAVE_SCRIPT="./autosave_work.sh"  # Update path if needed

# Function to display usage
show_usage() {
    echo "Usage: $0 [minutes|HH:MM]"
    echo "Examples:"
    echo "  $0           - Interactive mode"
    echo "  $0 5         - Shutdown in 5 minutes"
    echo "  $0 18:30     - Shutdown at 6:30 PM"
    echo "  $0 now       - Shutdown immediately"
    exit 1
}

# Function to validate time input
validate_time() {
    local input=$1
    
    # Check for "now"
    if [[ "$input" == "now" ]]; then
        return 0
    fi
    
    # Check for minutes (numeric)
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        if [ "$input" -le 0 ]; then
            echo "Error: Minutes must be greater than 0"
            return 1
        fi
        return 0
    fi
    
    # Check for HH:MM format
    if [[ "$input" =~ ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$ ]]; then
        return 0
    fi
    
    echo "Error: Invalid time format. Use minutes (5) or time (18:30) or 'now'"
    return 1
}

# Function to calculate seconds until target time
calculate_seconds() {
    local input=$1
    
    if [[ "$input" == "now" ]]; then
        echo 0
        return
    fi
    
    if [[ "$input" =~ ^[0-9]+$ ]]; then
        # Minutes input
        echo $((input * 60))
        return
    fi
    
    # HH:MM format
    local target_hour=$(echo "$input" | cut -d: -f1)
    local target_minute=$(echo "$input" | cut -d: -f2)
    local current_hour=$(date +%H)
    local current_minute=$(date +%M)
    local current_second=$(date +%S)
    
    local target_total_minutes=$((target_hour * 60 + target_minute))
    local current_total_minutes=$((current_hour * 60 + current_minute))
    
    local minutes_diff=$((target_total_minutes - current_total_minutes))
    
    # If target time is earlier, assume it's for tomorrow
    if [ $minutes_diff -lt 0 ]; then
        minutes_diff=$((minutes_diff + 24 * 60))
    fi
    
    local seconds_diff=$((minutes_diff * 60 - current_second))
    echo $seconds_diff
}

# Function to run auto-save
run_autosave() {
    echo "Starting auto-save procedure..."
    
    if [ -f "$AUTOSAVE_SCRIPT" ]; then
        bash "$AUTOSAVE_SCRIPT"
        if [ $? -eq 0 ]; then
            echo "✓ Auto-save completed successfully"
            return 0
        else
            echo "⚠ Auto-save encountered issues"
            return 1
        fi
    else
        echo "❌ Auto-save script not found at: $AUTOSAVE_SCRIPT"
        return 1
    fi
}

# Function for interactive prompt
interactive_prompt() {
    echo "=========================================="
    echo "    Safe System Shutdown with Auto-Save"
    echo "=========================================="
    echo
    echo "How would you like to schedule the shutdown?"
    echo
    echo "1) Shutdown in X minutes"
    echo "2) Shutdown at specific time (HH:MM)"
    echo "3) Shutdown now"
    echo "4) Cancel"
    echo
    read -p "Enter your choice [1-4]: " choice
    
    case $choice in
        1)
            read -p "Enter minutes until shutdown: " minutes
            if validate_time "$minutes"; then
                SHUTDOWN_DELAY_SECONDS=$(calculate_seconds "$minutes")
                SCHEDULE_TYPE="minutes"
                SCHEDULE_VALUE="$minutes"
            else
                echo "Invalid input. Please try again."
                interactive_prompt
            fi
            ;;
        2)
            read -p "Enter shutdown time (HH:MM, 24-hour format): " shutdowntime
            if validate_time "$shutdowntime"; then
                SHUTDOWN_DELAY_SECONDS=$(calculate_seconds "$shutdowntime")
                SCHEDULE_TYPE="time"
                SCHEDULE_VALUE="$shutdowntime"
            else
                echo "Invalid time format. Please try again."
                interactive_prompt
            fi
            ;;
        3)
            SHUTDOWN_DELAY_SECONDS=0
            SCHEDULE_TYPE="now"
            SCHEDULE_VALUE="now"
            ;;
        4)
            echo "Shutdown cancelled."
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            interactive_prompt
            ;;
    esac
}

# Function to format time remaining
format_time_remaining() {
    local seconds=$1
    local hours=$((seconds / 3600))
    local minutes=$(( (seconds % 3600) / 60 ))
    local secs=$((seconds % 60))
    
    if [ $hours -gt 0 ]; then
        printf "%dh %dm %ds" $hours $minutes $secs
    elif [ $minutes -gt 0 ]; then
        printf "%dm %ds" $minutes $secs
    else
        printf "%ds" $secs
    fi
}

# Function to display shutdown info
display_shutdown_info() {
    local seconds=$1
    local type=$2
    local value=$3
    
    echo
    echo "=== Shutdown Scheduled ==="
    case $type in
        "minutes")
            echo "Time until shutdown: $value minutes"
            ;;
        "time")
            echo "Shutdown at: $value"
            local current_epoch=$(date +%s)
            local target_epoch=$((current_epoch + seconds))
            echo "Which is: $(date -d "@$target_epoch" "+%H:%M:%S")"
            ;;
        "now")
            echo "Shutting down immediately"
            ;;
    esac
    echo "Auto-save will be performed"
    echo "==========================="
    echo
}

# Main script logic

# If arguments provided, use them
if [ $# -eq 1 ]; then
    if ! validate_time "$1"; then
        show_usage
    fi
    SHUTDOWN_DELAY_SECONDS=$(calculate_seconds "$1")
    
    # Determine schedule type for display
    if [[ "$1" == "now" ]]; then
        SCHEDULE_TYPE="now"
        SCHEDULE_VALUE="now"
    elif [[ "$1" =~ : ]]; then
        SCHEDULE_TYPE="time"
        SCHEDULE_VALUE="$1"
    else
        SCHEDULE_TYPE="minutes"
        SCHEDULE_VALUE="$1"
    fi
else
    # Interactive mode
    interactive_prompt
fi

# Confirm shutdown
display_shutdown_info "$SHUTDOWN_DELAY_SECONDS" "$SCHEDULE_TYPE" "$SCHEDULE_VALUE"

if [ $SHUTDOWN_DELAY_SECONDS -gt 10 ]; then
    read -p "Proceed with shutdown? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Shutdown cancelled."
        exit 0
    fi
else
    echo "Shutting down in 5 seconds... (Ctrl+C to cancel)"
    sleep 5
fi

# Run auto-save
if ! run_autosave; then
    read -p "Auto-save had issues. Continue with shutdown? (y/N): " continue_anyway
    if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
        echo "Shutdown cancelled due to auto-save issues."
        exit 1
    fi
fi

# Notify user
if command -v notify-send >/dev/null 2>&1; then
    if [ $SHUTDOWN_DELAY_SECONDS -eq 0 ]; then
        notify-send "System Shutdown" "Shutting down now. Work saved to Desktop/Shutdown/"
    elif [ $SHUTDOWN_DELAY_SECONDS -le 300 ]; then  # 5 minutes or less
        notify-send "System Shutdown" "Shutting down in $(format_time_remaining $SHUTDOWN_DELAY_SECONDS). Work saved to Desktop/Shutdown/"
    else
        notify-send "System Shutdown" "Shutdown scheduled. Work saved to Desktop/Shutdown/"
    fi
fi

# If immediate shutdown
if [ $SHUTDOWN_DELAY_SECONDS -eq 0 ]; then
    echo "Shutting down now..."
    sudo shutdown -h now
    exit 0
fi

# Countdown for longer delays
if [ $SHUTDOWN_DELAY_SECONDS -le 300 ]; then  # 5 minutes or less
    echo "Final countdown:"
    while [ $SHUTDOWN_DELAY_SECONDS -gt 0 ]; do
        if [ $SHUTDOWN_DELAY_SECONDS -le 60 ] && [ $((SHUTDOWN_DELAY_SECONDS % 10)) -eq 0 ] || [ $SHUTDOWN_DELAY_SECONDS -le 10 ]; then
            echo "Shutting down in $(format_time_remaining $SHUTDOWN_DELAY_SECONDS)..."
        fi
        sleep 1
        SHUTDOWN_DELAY_SECONDS=$((SHUTDOWN_DELAY_SECONDS - 1))
    done
else
    # For longer delays, check every minute
    local minutes_remaining=$((SHUTDOWN_DELAY_SECONDS / 60))
    echo "Shutdown in progress... (Ctrl+C to cancel)"
    
    while [ $minutes_remaining -gt 0 ]; do
        if [ $minutes_remaining -le 10 ] || [ $((minutes_remaining % 15)) -eq 0 ]; then
            echo "$minutes_remaining minutes remaining until shutdown..."
            
            if command -v notify-send >/dev/null 2>&1 && [ $minutes_remaining -le 5 ]; then
                notify-send "Shutdown Reminder" "$minutes_remaining minutes remaining"
            fi
        fi
        sleep 60
        minutes_remaining=$((minutes_remaining - 1))
    done
    
    # Final minute countdown
    echo "Final countdown:"
    for i in {60..1}; do
        if [ $i -le 10 ] || [ $((i % 15)) -eq 0 ]; then
            echo "$i seconds remaining..."
        fi
        sleep 1
    done
fi

echo "Shutting down now..."
echo "Last auto-save location: ~/Desktop/Shutdown/work_backup_$(date +"%Y%m%d_%H%M%S")"

# Execute shutdown
sudo shutdown -h now
#!/bin/bash

# ... [previous script content remains the same] ...

# Function to check sudo privileges
check_sudo() {
    echo "Checking for shutdown privileges..."
    if sudo -n true 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to execute shutdown with proper privileges
execute_shutdown() {
    echo "Shutting down now..."
    echo "Last auto-save location: ~/Desktop/Shutdown/work_backup_$(date +"%Y%m%d_%H%M%S")"
    
    # Try to shutdown without password if possible, otherwise prompt
    if sudo -n shutdown -h now 2>/dev/null; then
        exit 0
    else
        echo "Root privileges required for shutdown. Please enter your password:"
        sudo shutdown -h now
    fi
}
execute_shutdown

```

Make this one executable, as well
```bash
chmod +x interactive_shutdown.sh
```

Then simply run[^1]
```bash
./interactive_shutdown.sh
```

### (Optional) Disable Sudo for Shutdowns: *For Those Who Love an Easy Life*

Don’t worry, we are approaching the end. Next step, edit the sudoers file
```bash
sudo visudo
```
Add this line (replace `yourusername` with your actual username—duh)
```text
yourusername ALL=(ALL) NOPASSWD: /usr/bin/shutdown
```

### Taking Lazy to the Next Level: *Creating a systemd service that runs your script when the computer shuts down*

Create Service File
```bash
sudo nano /etc/systemd/system/autosave-shutdown.service
```

Add the following
```bash
[Unit]
Description=Auto-save Work Before Shutdown
DefaultDependencies=false
Before=shutdown.target reboot.target halt.target

[Service]
Type=oneshot
RemainAfterExit=true
ExecStart=/bin/true
ExecStop=/home/yourusername/path/to/autosave_work.sh
TimeoutStopSec=30
User=yourusername
Environment=HOME=/home/yourusername

[Install]
WantedBy=multi-user.target
```

Enable the Service
```bash
sudo systemctl enable autosave-shutdown.service
```

And Finally, Test the Service
```bash
sudo systemctl start autosave-shutdown.service
sudo systemctl status autosave-shutdown.service
```

### Taking it to the Next Level: Adding the Power Button for Events

For those who dare venture on: Create acpi(d) script `power-button-auto-save`

```bash
sudo nano /etc/acpi/events/power-button-auto-save
```

Paste the Following
```text
event=button/power.*
action=/home/yourusername/path/to/autosave_work.sh && /usr/bin/systemctl poweroff
```

Kick the Daemon (Restart acpi(d))
```bash
sudo systemctl restart acpid
```


### AND FINALLY, Last but Not Least. . .
For those of use who are too lazy to get out of bed to shut the PC down and prefer to SSH into your system by phone
```bash
ssh -t username@hostname 'cd /path/to/scripts && sudo ./interactive_shutdown.sh'
```

### You Made it Through
Congratulations. You now are able to wake up in the morning without panic and sleepless nights wondering if you left the oven on (saved) or not. I hope this helps! Please keep checking back as I add more cool scripts, tools, and web-fu stuff. 

~Cheers!


[^1]: I suggest creating a few unsaved text documents in different places before running this script and after saving everything else.

[^2]: Please Note: I run Arch Linux, and while this script works for my system, it may need to be tweaked to your own rig.




<div class="support-minimal" style="text-align: center; margin: 2rem 0; padding: 1rem;">
    <a href="https://buymeacoffee.com/joshuagoth"
       target="_blank"
       rel="noopener"
       style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #0d6efd; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.9rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1v1a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h5a5 5 0 0 1 5 5v1zM6 15a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3H6v3z"/>
        </svg>
        Buy Me Some Web Time
    </a>
</div>



