---
layout: notes
category: notes
tag: [knowledge]
title: "How to Optimize GPU Performance - Guidelines and Ideas"
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2020-01-15-GPU-optimization-idea-cover.jpg"
---

### Amdahl’s Law

_Don’t continue to optimize once a part is only a small fraction of overall execution time_

$$
S_{\text{overall}} = \frac{1}{(1-p) + \frac{p}{s}}
$$

where $S_{\text{overall}}$ is the theoretical overall speedup og whole task, $p$ is the proportion of parallel part in the whole task, $s$ is the speedup of parallel portion [1].

### Global Memory Optimization

#### Memory Coalescing (Strive for perfect coalescing per warp)
- Why: 
    - Off-chip memory is accessed in chunks. Even if you read only a single word.
    - If you don’t use whole chunk, bandwidth is wasted
- Structure of array is often better than array of structures
    - Very clear win on regular, stride 1 access patterns
- Align starting address (may require padding)
- A warp should access within a contiguous region

#### Have enough concurrent accesses to saturate the bus
- Why: Little's law
- Launch enough threads to maximize throughput
    - Latency is hidden by switching threads (warps)
- Process several elements per thread
    - Multiple loads get pipelined
    - Indexing calculations can often be reused

### Shared Memory Optimization

- Why: Shared memory is banked
    - 32banks, 4-byte wide banks
    - Successive 4-byte words belong to different banks
    - 4 bytes per bank per 2 clocks per multiprocessor
    - serialization: if n threads in a warp access different 4-byte words in the same bank, n accesses are executed serially
    - multicast: n threads access the same word in one fetch
- Avoid bank conflicts
    - Pad SMEM arrays
        - For example, when a warp accesses a 2D array’s column, add one more padding column
    - Rearrange data in SMEM

### Control Flow (Instruction Throughput) Optimization

- Why: Divergent branches
    - Threads within a single warp take different paths
    - Different execution paths within a warp are serialized
- Try grouping threads that take the same path
    - Rearrange the data, pre-process the data
- Avoid diverging within a warp
    - make branch granularity a whole multiple of warp size


### Reference
[1]. <https://en.wikipedia.org/wiki/Amdahl%27s_law>