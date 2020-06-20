---
layout: notes
category: notes
tag: [tech_tips]
title: Setup Dual Boot of Ubuntu and Windows at Home for Remote Development
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-02-09-ubuntu-setup-cover.png"
---

#### Check the windows boot mode

<https://www.easyuefi.com/resource/check-windows-is-booted-in-uefi-mode.html>

My system is in `legacy` mode, so the max partition on a single physical disk is 4. 

#### Install ubuntu dual boot alongside legacy windows

<http://dailylinuxuser.com/2015/11/how-to-install-ubuntu-linux-alongside_8.html>

Note: it is different for `legacy` and `UEFI` windows dual system.

<http://dailylinuxuser.com/2015/11/how-to-install-ubuntu-linux-alongside_8.html>

#### Setup SSH server on ubuntu

<http://ubuntuhandbook.org/index.php/2016/04/enable-ssh-ubuntu-16-04-lts/>

#### SSH to ubuntu

If we just want to `ssh` to ubuntu from home network, just use the internal ip.

If we want to `ssh` from outside internet, we need to setup `port forwarding` in the router (<https://ubuntuforums.org/showthread.php?t=1558871>, <https://unix.stackexchange.com/questions/19620/ssh-port-forward-to-access-my-home-machine-from-anywhere>)

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-02-09-ubuntu-setup-fig1.png){:height="70%" width="70%"}

To make the `ssh` more secure, we would use `rsa` key (<https://help.ubuntu.com/community/SSH/OpenSSH/Keys>)

If we already have the `rsa` key on Mac, for example used for Github, we need to setup a different one as descirbed [here](<https://security.stackexchange.com/questions/40050/best-practice-separate-ssh-key-per-host-and-user-vs-one-ssh-key-for-all-hos>). We can also setup `~/.ssh/config` to simplify the command to `ssh` to the remote server, i.e., ubuntu-home [[ref1](<https://gist.github.com/jexchan/2351996>), [ref2](<https://nerderati.com/2011/03/17/simplify-your-life-with-an-ssh-config-file/>)]. 

Use `sudo service ssh status` to monitor the logs of the `SSH` connection in case hackers blocks in.

#### Reboot to Windows from Terminal

Follow <http://www.webupd8.org/2010/10/how-to-reboot-in-windows-from-ubuntu.html> to update the `Grub` configuration first.

In ubuntu, use `sudo grub-reboot 4` to set the next default boot system in `Grub` to Windows. Then, use `reboot` to reboot the system. This default setting only works for next reboot. If you reboot from Windows again, the `Grub` default system will be `0`, i.e., ubuntu, again.

#### Setup X11 through ssh

Since X11 is not installed by default in current release of maxOS, we first install `XQuartz`, which is the official X11 on our mac. The steps are 

1. start `XQuartz`
2. in terminal, in addition to the normal `ssh` command, add `-Y` or `-X`
3. open whatever windows you like :)

[ref](https://uisapp2.iu.edu/confluence-prd/pages/viewpage.action?pageId=280461906)

#### Setup vnc remote desktop

Follow the steps in [ref1](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-vnc-on-ubuntu-14-04), first we need to install `tightvncserver` on the target ubuntu, we have two options here for how the desktop looks like

[Option 1] use `ubuntu-gnome-desktop`, [ref](https://www.digitalocean.com/community/questions/vnc-gray-screen-ubuntu-14-04), [ref](http://onkea.com/ubuntu-vnc-grey-screen/)

[Option 2] use `xfce4`, [ref1](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-vnc-on-ubuntu-14-04). Instead of setting the startup commands like in this ref, I prefer to use

```shell
$ vncserver -depth 16 -geometry 1734x1080
```

to start the vncserver explicitly. The vncserver should be start by this command everytime after reboot. It can be killed with 

```shell
$ vncserver -kill :1
```

The terminal launch problem can be solved by [ref](https://ubuntuforums.org/showthread.php?t=1894293).

On mac, we can use the native vnc client in `Finder` as in [ref](https://cat.pdx.edu/platforms/mac/remote-access/vnc-to-linux/) or `Chicken vnc` like [ref](https://kb.wisc.edu/cae/page.php?id=6245).

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-02-09-ubuntu-setup-fig2.png){:height="60%" width="60%"}

We may also use `screen sharing` in Ubuntu 18.04 like [this](https://websiteforstudents.com/access-ubuntu-18-04-lts-beta-desktop-via-vnc-from-windows-machines/). This is not tested yet.

#### Known Problems

[**Mouse Scroll Too Fast**] Unplug and replug the receiver. [ref](https://askubuntu.com/questions/916647/how-to-fix-microsoft-mouse-scrolling-speed-on-ubuntu)