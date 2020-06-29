---
layout: notes
category: notes
tag: [knowledge]
title: Useful Shell Staffs that are easy to Forget
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-05-09-shell-command-cover.png"
---

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