---
layout: notes
category: notes
tag: [knowledge]
title: "Parallel Patterns"
---

### Why Parallel with Patterns?

Given a problem, we want to think at a higher level instead of low-level implementation details. These high-level structures work as the building blocks to assemble the solutions to complex problems. Parallel patterns tell us **what** to compute, not **how** to compute. The idea is

- Focusing on ligh-level structures and patterns
- Higher level patterns are built from more fundamental patterns
- Let the programmers worry about how to implement the patters

### Reduce

_Many parallel threads need to generate a single result_

- order doesn't matter to the result
- associative operator (+, *, min/max, AND/OR, …)

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-04-22-parallel-patterns-reduce.png){:height="40%" width="40%"}

Assuming the size of array to be $N$

- Reduction takes $\log(N)$ steps to complete. Step $i$ does $N/2^i$ independent operations. Each step is done inparallel, the overall complexity is $O(\log(N))$.
- The number of total operations done is $\sum_{i=1}^{\log(N)} 2^{N-i} = N-1 = O(N)$. Parallel reduction does not do more opeartions than the sequential one. It is efficient.
- Typically, given a large array, we do sequential reduction on each processor first, then do in parallel. Given $p$ processors, the time complexity is $O(\frac{N}{p} + log(p))$.

Optimization of parallel reduction on GPU [1]. 

### Scan (Prefix Sum)

_Each thread outputs the sum of all elements before it, inclusively or exclusively_

- binary associative operator [2]
- done in place

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2019-04-22-parallel-patterns-scan.png){:height="90%" width="90%"}

Assuming all data resides in one thread block, a single phase scan

- takes $O(\log(N))$ steps
- in step $i$, each thread works with another thread that is $2^{i-1}$ offset away
- $N-2^{i-1}$ threads participate
- overall complexity $O(\log(N))$

If the data is too large to fit into one thread block, we take a two-phase approach

- on GPU, using $b$ thread blocks, $O(\log(\frac{N}{b} + \log(b)))$:
    - Partition data to $N/b$ thread blocks, each block does parallel scan locally
    - Perform another parallel scan using the last element from each block, which is the sum of all elements within that block
    - Add the corresponding result from the second scan to all elements within each thread block

- on multi-core CPU with $p$ processors [3], $O(\frac{N}{p} + \log(p))$:
    - Partition data to $N/p$ processors, does equential scan locally on each processor
    - Perform parallel scan using the last element from each processor, which is the sum of all elements within that processor
    - Add the result of parallel scan on each processor to each of its local prefix sum

<!-- ### Split: Many parallel threads need to partition data
	○ Given: array of true and false elements (and payloads)
	○ Return an array with all true elements at the beginning
### Compact / Expand: Many parallel threads produce variable output / thread
	○ Remove null elements
	○ Reserve Variable Storage Per Thread
	○ Each thread must answer a simple question: “Where do I write my output?”
		§ The answer depends on what other threads write!

### Segmented Scan
	○ Scan + Barriers/Flags associated with certain positions in the input arrays. Operations don’t propagate beyond barriers
	○ Doing lots of reductions of unpredictable size at the same time is the most common use
	○ Think of doing sums/max/count/any over arbitrary sub-domains of your data
	○ Common Usage Scenarios:
		§ Determine which region/tree/group/object class an element belongs to and assign that as its new ID
		§ Sort based on that ID
		§ Operate on all of the regions/trees/groups/objects in parallel, no matter what their size or number
### Sort
	○ Sorted lists can be processed by segmented scan
	○ Sort data to restore memory and execution coherence
	○ Radix sort is faster than comparison-based sorts
### MapReduce
	○ Combination of sort and reduction (scan)
	○ Map
		§ Map a function over a domain.
		§ Function is provided by the user. 
		§ Function can be anything which produces a (key, value) pair
			□ Value can just be a pointer to arbitrary data structure
	○ Sort
		§ All the (key, value) pairs are sorted based on their keys
		§ Happens implicitly
		§ Creates runs of (k, v) pairs with same key
		§ User usually has no control over sort function
	○ Reduce
		§ Reduce function is provided by the user
			□ Can be simple plus, max,…
		§ Library makes sure that values from one key don’t propagate to another (segscan)
		§ Final result is a list of keys and final values (or arbitrary data structures) -->

### Reference
[1]. <https://developer.download.nvidia.com/assets/cuda/files/reduction.pdf>

[2]. <http://mathonline.wikidot.com/associativity-and-commutativity-of-binary-operations>

[3]. CSE 6220 - High Performance Computing, Georgia Tech