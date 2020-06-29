---
layout: notes
category: notes
tag: [knowledge]
title: Git Cheat Sheet
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-05-13-git-cheatsheet-cover.png"
---

### Braching and Merging

```shell
# show branches
git branch
# create a new branch and switch to it
# same as `git branch <name>; git checkout <name>`
git checkout -b <name>
```

#### Merge vs. Rebase

In Git, there are two main ways to integrate changes from one branch into another: the `merge` and the `rebase`.

Merge: _Join two or more development histories together. Incorporates changes from the named commits (since the time their histories diverged from the current branch) into the current branch_

```shell
# Assuming the git history looks like this, currently on branch `master`
#       A---B---C feature
#      /
# D---E---F---G master
git merge feature
# replay the changes made on the `feature` branch since it diverged 
# from `master` (i.e., E) until its current commit (C) on top of `master`,
# and record the result in a new commit along with the names of the two parent commits
#       A---B---C feature
#      /         \
# D---E---F---G---H master
```

Rebase: _Take all the changes that were committed on one branch and replay them on a different branch_

```shell
# Assuming the git history looks like this
#       A---B---C feature
#      /
# D---E---F---G master
git rebase master feature
# the `feature` branch is transplanted onto the `master` branch
# note that all commits in `feature` branch has been regenerated accordingly
#               A'--B'--C' feature
#              /
# D---E---F---G master
```

### Reference

[1]. <https://missing.csail.mit.edu/2020/version-control/>