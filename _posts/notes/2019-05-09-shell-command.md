---
layout: notes
category: notes
tag: [knowledge]
title: Useful Shell Staffs that are easy to Forget
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-05-09-shell-command-cover.png"
published: false
---

### Commands

#### switch to `root` user's shell

```shell
# after switching to root, the prompt will change to "#"
sudo su
```

#### `cd` back to last directory

```shell
cd -
```

#### write to a file with `sudo`

```shell
# assuming abc.txt requires root permission
sudo echo hello > abc.txt # not working
echo hello | sudo tee abc.txt # works, `tee` takes stdin and write to files
```

#### print commands to be executed (shell debug)

```bash
# [2]
# print commands to be executed to `stderr` before any substitution and expansion is applied
set -v
# print everything as if it were executed, after any substitution and expansion is applied
# `+` is prepended to indicate the depth-level
set -x
# to exit these modes
set +v
set +x
```

#### size the terminal window on remote machine

```bash
# the prompt and commnads may not display correctly on remote machine you SSH to
# use the following command to correct it
resize
```

### Bash Scripting

Run a series of commands while using control flows.

#### Variables

```bash

```

#### HERE document

```bash
# redirect the comamnd block to stdin of the COMMAND
COMMAND <<LimitString
command #1
command #2
...
LimitString
# Equivalent to
COMMAND < command-file
# where command-file contains 
command #1
command #2
...
```

Choose the `LimitString` sufficiently unusual that it will not occur anywhere in the command line and confuse matters. [ref](https://tldp.org/LDP/abs/html/here-docs.html)

### Terminal Tools

#### Tmux

```bash
# Sessions: workspace
tmux # start a new session
tmux new -s NAME # specify the NAME to start
tmux ls # lists all curretn sessions
tmux a # attach the last session
tmux a -t NAME # attach the NAME session
<C-b> d # detach the current session
<C-d> # close the Panel
exit # close the Panel
# Windows: tabs
<C-b> c # create a new windows within the session
<C-b> N # go to the Nth window
<C-b> n # go to the next window
<C-b> p # go to the previous window
<C-b> , # rename the current window
<C-b> w # list current windows
# Panes: splits
<C-b> <quote> # split horizontally
<C-b> % # split vertically
<C-b> <up,down,left,right> # move focus to the direction
<C-b>+<up,down,left,right> # resize current pane to the direction
<C-b> z # zoom in or zoom out of current pane
<C-b> <space> # traverse pane arrangements
<C-b> [ # scroll up and down using <page-up> and <page-down>

# copy in tmux [1]
# default method
<C-b> [ # 1. enter copy mode
<page-up> <page-down> <arrow> # 2. navigate to where you want to copy
<C-space> # 3. start copy
<arrow> # 4. select what to copy
<C-w> # 5 copy to `tmux` buffer
<C-b> ] # paste using `tmux` buffer
# vi mode: modify ~/.tmux.conf and use v, y, p
# mouse mode: add following to ~/.tmux.conf
set -g mouse on
# then, use <C-b> [ to enter copy mode, use mouse to select and <C-c> to copy as normal
# q to quit copy mode, and right click mouse to paste
```

### Security

#### SSH keys croptography

```shell
# on local machine (client)
# first generate the key pair (public key, private key)
ssh-keygen
# send the public key to remote machine, -i to specify the public key
# this public key is stored in ~/.ssh/authorized_keys on remote machine
ssh-copy-id -i ~/.ssh/id_rsa.pub username@xxx.xxx.xxx.xxx
# 1. the remote machine sends a message to client
# 2. the client sign this meesage using private key
# sign(message, private key) -> signature
# 3. the signature is sent to remote machine
# verify(message, signature, public key) -> bool 
# 4. the remote machine checks whether or not the signature is valid. Without private key, it is hard to make the verify function return true
```

### Reference
[1]. <https://www.rushiagr.com/blog/2016/06/16/everything-you-need-to-know-about-tmux-copy-pasting-ubuntu/>

[2]. <https://wiki.bash-hackers.org/scripting/debuggingtips#use_shell_debug_output>