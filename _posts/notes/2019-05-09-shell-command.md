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
echo hello | sudo tee abc.txt # works, `tee` takes stdin andwrite to files
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