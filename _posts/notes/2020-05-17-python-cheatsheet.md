---
layout: notes
category: notes
tag: [knowledge]
title: Python Cheatsheet
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2019-05-09-shell-command-cover.png"
published: false
---

### Generators

#### Why

1. Easy implementation of producer-consumer model for time-consuming jobs
    - The producer produces items and add to a queue, the consumer takes the item from the queue and do some work.
    - It might take a long time for the producer to produce an item. The consumer does not have to wait for the producor to produce everything, then perform the operation. Instead, it can just consume one item whenever there is one in the queue.
    - The generator makes writing such producor-consumer code much easier. You write a generator, whenever it `yield` at somewhere (put an item in the queue), you can consume the item, just like waht consumer does.
    ```python
    # slow
    # produce a list of items (takes a long time to produce one)
    # then consumer all together one by one
    items = produce_items() # return a list of items
    for item in items:
        # do something
    # faster
    # generator (producor-consumer) emit one item as soon as one is produced
    # the consumer starts to consume (launch a job on cluster) immediately when one item is available
    for item in gen_items():
        # do something
    ```
2. No large intermedia temporary files

### Customized `sys.stdout`

`sys.stdout` is a file, you can write a customized class to do something more

1. use the normal `print()` function but write the printed staff to a file while printing on the screen
2. process the printed staff whiling printing

```python
# override the stdout with a customized class

```

### Reference

[1]. <https://www.dabeaz.com/generators/Generators.pdf>