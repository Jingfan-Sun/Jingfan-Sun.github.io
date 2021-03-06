---
layout: notes
category: notes
tag: [knowledge]
title: Useful Shell Staffs that are easy to Forget
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-05-09-shell-command-cover.png"
published: true
---

### Commands

#### Switch to `root` user's shell

```shell
# after switching to root, the prompt will change to "#"
sudo su
```

#### `cd` back to last directory

```shell
cd -
```

#### Write to a file with `sudo`

```shell
# assuming abc.txt requires root permission
sudo echo hello > abc.txt # not working
echo hello | sudo tee abc.txt # works, `tee` takes stdin and write to files
```

#### Print commands to be executed (shell debug)

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

#### Size the terminal window on remote machine

```bash
# the prompt and commnads may not display correctly on remote machine you SSH to
# use the following command to correct it
resize
```

#### Check the shared library dependecies of executable

```bash
# list the dependent shared libraries [3]
ldd <executable>
# if some libraries are missing, add to LD_LIBRARY_PATH
export LD_LIBRARY_PATH=<path_to_search_for_library>
```

#### Compress and Extract

```bash
# tar familty **********
# compress a dir to .tar.gz file [4]
tar -czvf <archieve>.tar.gz <path-to-dir>
# extract from .tgz file
# -x: extract, -v: verbose, -z: gnnuzip, -f: last falg just before the file
tar -xvzf <file.tgz>
# zip familty **********
# zip to path specified by -d 
zip -d <path-to-.zip> <file(s)>
# unzip to a path
unzip <.zip-file> -d [<path-to-unzip>]
```

#### Redirect `stdout`, `stderr` or both to file

```bash
# redirect stdout and stderr to seperate files
<cmd> > stdout.log 2> stderr.log
# redirect both stdout and stderr to one file
<cmd> &> stdout_err.log
```

#### Convert windows `\r\n`  file to unix `\n` file

```
dos2unix
```

#### Prepend time stamp before each line of output on command line

```bash
# python version [5], other versiions are on available [5]
command | python -c 'import sys,time;sys.stdout.write("".join(( " ".join((time.strftime("[%Y-%m-%d %H:%M:%S]", time.localtime()), line)) for line in sys.stdin )))'
```

#### Search files

```bash
# search for file name recursively in a dir
find <dir-path> -name "name-to-search"
find ./ -name "foo*.txt"
# search for file contents recursively in a dir
grep -r "string-to-search" *
# search for file contents recursively in a dir (only certain files)
grep --include=\*.{cpp,h} -r <path-to-search> -e "pattern-to-search"
```

#### Inline for loop

```bash
# traverse a range [6]
for i in {0..99}; do cat min_${i}.txt | wc -l; done
for ((i=0; i<100; i+=1)); do cat min_${i}.txt | wc -l; done
# traverse on files
for i in *.txt; do mv ${i}_backup.txt; done
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

#### Trace system calls and signals
`strace` can be used to examine how the program you are using is trying to open and read files to do name resolution. Example, the following cmd will trace how `ssh` tries to open files to resolve the given hostname `<some-hostname>`. [ref](https://serverfault.com/questions/266897/why-is-hostname-lookup-in-ssh-returning-a-different-result)
```bash
$ strace -eopen,read -f -o /tmp/ssh-strace.txt ssh <some-hostname>
```

#### `ssh` resolve hostname [ref](https://tldp.org/LDP/abs/html/here-docs.html)
1. search in `~/.ssh/config`
2. `/etc/resolv.conf` could have a `search` line which will automatically resolve hostnames
3. `/etc/nsswitch.conf` can be used to change how the machine does name resolution so you should check that too

### Terminal Tools

#### Tmux

```bash
# Sessions: workspace
tmux # start a new session
tmux new -s NAME # specify the NAME to start
tmux ls # lists all curretn sessions
tmux a # attach the last session
tmux a -t NAME # attach the NAME session
tmux a -t NAME -d # attach the NAME session, detach any other clients (to resize the window)
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

### Config files

#### Json vs. Yaml
The biggest pain point of using Json as config file is that you are not able to write comments in Json.

#### Json

#### Yaml

```yaml
# list of list
-
  - item1
  - item2
-
  - item3
  - item4
-> [["item1", "item2"], ["item3", "item4"]]
# named list
list:
  - item1
  - item2
-> {"list": ["item1", "item2"]}
# dictionary
dict:
  key1: val1
  key2: val2
-> {"dict":{"key1": "val1", "key2": "val2"}}
# merge dictionary
dict1: &dict1-link
  key1: val1
dict2:
  <<: *dict1-link
  key2: val2
-> {"dict1":{"key1": "val1"}, "dict2":{"key1": "val1", "key2": "val2"}}
# reuse list item
level1-list-0:
  - &list1
    key1: val1
level1-list-1:
  - *list1
  -
    key2: val2
-> {"level1-list-1":[{"key1": "val1"}, {"key2": "val2"}]}
```

### Reference
[1]. <https://www.rushiagr.com/blog/2016/06/16/everything-you-need-to-know-about-tmux-copy-pasting-ubuntu/>

[2]. <https://wiki.bash-hackers.org/scripting/debuggingtips#use_shell_debug_output>

[3]. <https://amir.rachum.com/blog/2016/09/17/shared-libraries/>

[4]. <https://www.howtogeek.com/248780/how-to-compress-and-extract-files-using-the-tar-command-on-linux/>

[5]. <https://unix.stackexchange.com/questions/26728/prepending-a-timestamp-to-each-line-of-output-from-a-command>

[6]. <https://www.cyberciti.biz/faq/linux-unix-bash-for-loop-one-line-command/>