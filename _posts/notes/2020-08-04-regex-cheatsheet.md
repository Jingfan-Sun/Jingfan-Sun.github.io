---
layout: notes
category: notes
tag: [knowledge]
title: Regex Cheatsheet
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-05-09-shell-command-cover.png"
published: false
---

### Python `re` 

#### Use `''` not `""` for regex compiling

### Useful Cases

#### Match anything until this character

We don't know what characters are there in the sequence, but we do know the matching should stop once we encounter a certain character.

```python
pattern = re.compile('^(.+?;)')
njsdnfkja%79234&;sdfasdfasfsdfsd;
^^^^^^^^^^^^^^^^^
```

### Regerence

[1]. <https://stackoverflow.com/questions/7124778/how-to-match-anything-up-until-this-sequence-of-characters-in-a-regular-expres>