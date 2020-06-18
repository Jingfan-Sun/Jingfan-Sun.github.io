---
layout: notes
category: notes
tag: [knowledge]
title: "GPU Performance Measurement"
---

### What limits GPU performance?

1. Memory throughput
2. Instruction Throughput
3. Latency

### Limited by bandwidth or arithmetic?

#### Instruction/Bytes ratio (rough estimation)

- Too high: each thread does too much calculations, limited by instruction/math
- Too low: each thread loads a lot but does little, limited by memory bandwidth

**Example - Square Matrix-Matrix Multiplication**

- _Straightforward Implementation_: each thread takes care of one element in the final product matrix `AB(i, j)`, which is the product of row `i` from matrix `A` and column `j` from matrix `B`. 

```c++
// Instruction/Bytes ratio is 0.25 (limited by memory bandwidth)
__global__ void mm_mul1(float *A, float *B, float *AB, int N) {
    // get the global row and column indices
    int row = blockIdx.y*blockDim.y + threadIdx.y; 
    int col = blockIdx.x*blockDim.x + threadIdx.x;
    float local = 0; // accumulate local temp summation of AB(i, j)
    // dot product
    // 2*N FP32 operation: (1 mul + 1 add) * N
    // 2*N FP32 loads: 2 * 4 Bytes * N
    // Instruction/Bytes ratio: 2/8 = 0.25
    for (int i = 0; i < N; i++) local += A[row*N+i] * B[i*N+col];
    AB[row*N+col] = local; // assign local results to to AB(i, j)
}
```

- _Shared Memory Tiled Implementation_: loads a tile of matrices `A` and `B` into `__shared__` memory insead of loading single element. Reuse the pre-loaded tiles to save memery bandwidth [1]. 

```c++
// Instruction/Bytes ratio is 4 (improve memory bandwidth usage by using shared memory)
#define TILE_SIZE 16
__global__ void mm_mul2(float *A, float *B, float *AB, int N) {
    // allocate shared memory for tiles of A and B
    __shared__ float sharedA[TILE_SIZE][TILE_SIZE]; 
    __shared__ float sharedB[TILE_SIZE][TILE_SIZE]; 
    // get the global row and column indices
    int row = blockIdx.y*blockDim.y + threadIdx.y; 
    int col = blockIdx.x*blockDim.x + threadIdx.x;
    float local = 0; // accumulate local temp summation of AB(i, j)
    // loop over matrices A and B tile by tile
    // 2*N FP32 operation per iteration: (1 mul + 1 add) * TILE_SIZE * N/TILE_SIZE
    // 2*N/TILE_SIZE FP32 loads per iteration: 2 * 4 Bytes * N/TILE_SIZE
    // Instruction/Bytes ratio: (2*N)/(8*N/TILE_SIZE) = TILE_SIZE/4 = 4
    for (int i = 0; i < N/TILE_SIZE; i++) {
        // work with other thread in warp to load tiles into shared memory
        sharedA[threadIdx.y][threadIdx.x] = A[row*N + (i*TILE_SIZE + threadIdx.x)]; 
        sharedB[threadIdx.y][threadIdx.x] = B[(i*TILE_SIZE + threadIdx.y)*N + col]; 
        __syncthreads();
        // dot product purely using shared memory
        for (int j = 0; j < TILE_SIZE; j++) local += sharedA[threadIdx.y][j] * sharedB[j][threadIdx.x];
        __syncthreads(); 
    }
    AB[row*N+col] = local;
}
```

#### Code likely uses more instructions and bytes than algorithm analysis suggests

- Instructions for loop control, pointer math, etc.
- Address pattern may result in more memory fetches

#### Profiler (quick, but approximate)

- Count the number of issued instruction
- Count memory requests/transactions from global memory to L1
- Calculate the Instruction/Bytes ratio

### Limiter Theory

#### A little background of SM

The figure below shows the SIMT architecture of Nvidia GPU. Left side (SI) runs in serial while the right side (MT) runs in parallel [2].

{: .center}
![](https://ambaboo-github-io-assets.s3.amazonaws.com/2020-01-12-GPU-performance-fig1.png){:height="60%" width="60%"}

- SI: only one instruction from one warp executed at any given instance, per scheduler
    - each warp has one PC
    - warps in a SM share one fetching unit (serial)
    - the fetched instructions are put into "queue"s (one per warp) (on a prioritized scheduling policy)
    - warps whose next instruction has its inputs ready for consumption are eligible for execution
    - there is a pool of warps to be scheduled or chosen from 
    - schedule unit pick one instruction from one warp to execute
- MT: all 32 threads in a warp execute the same instruction when selected

#### Supply vs. Demand

The hardware has its limits, e.g., FP32 ops/cycle, memory bandwidth. So you get your "Supply" for any given limit from your hardware, you pay for it. You can do worse (your "Demand"), but can never go faster than that number. 

$$
\begin{equation}
\begin{split}
Demand & \leq Supply \\
\rightarrow \lambda_{TB} \times N_t \times N_{op} & \leq \lambda_{op} \\
\rightarrow \lambda_{TB} & \leq \lambda_{op} / (N_t \times N_{op})
\end{split}
\end{equation}
$$

where 

- $\lambda_{TB}$ is rate thread blocks arrive - throughput of thread block, 
- $N_t$ denotes how many threads in one block, 
- $N_{op}$ gives the number of a given type of operation in one thread, 
- $\lambda_{op}$ is the throughput available for that type of operation.

For any type of operation unit, i.e., load unit, add unit, multiply unit, etc., you can write a limitor equation. You can never exceed the limit you get from this equation.

The most constraining limiter is called the critical limiter. The ideal case is that every limitor is the critical limitor, so you are not wasting any resources. You will want to adjust your algorithm to distribute the loads so everything is uniformly used.

There are three major types of limits on the performance of SM.

#### Bandwidth resource limiters

I got a kernel and many thread blocks pending to run, how fast should I push these thread blocks to the machine?

```c++
// Compute vector sum C = A+B
// FP32 ADD: 1, INT ADD: 1, INT MUL: 1
// LOAD: 2, STORE: 1
__global__ void vecAdd(float* A, float* B, float* C) {
    int i = threadIdx.x + blockDim.x * blockIdx.x;
    C[i] = A[i] + B[i]; 
}
```

- fp32, fp64, int, mem, transcendentals, etc. have different throughputs available
- determine the throughput for each operation using the limitor equation

#### Per-thread-block and Per-thread space limiters

SM also has limited resources on its space, i.e., warp count, register file, and shared memory size. These space resources are allocated when you launch the thread blocks (based on what you ask for), and deallocaetd on their completion. The comsumption is calculated using Little's Law.

**Little's law (queue theory)**

The number of staffs in a queue or "in flight" equals the rate they arrive times the latency of the server polling out from the queue.

$$
\begin{equation}
\begin{split}
& N = \lambda \times L \\
\rightarrow & \lambda \leq N / L
\end{split}
\end{equation}
$$

where

- $N$ is the number in the queue
- $\lambda$ is the arrival rate - the throughput
- $L$ is the latency of service

**Example**: assuming your device can have maximum of 48 warps at a given time, so $N$ is 48. If a thread block takes 1000 cycles to execute, $L$ is 1000. So the throughput can not exceed $48/1000$.

#### Additional results from Limiter Theory

- Limiter theory is an ok 1st order approximation
- it doesn't work when "traffic jam" occurs (threads not in paralle, waiting for expensive operations like `log`)
- To avoid "traffic jam", use lots of small thread blocks with uniform distribution of operation densities instead of making one too large

### Performance tunning  

- Have enough concurrent accesses to saturate the bus
- Need (mem_latency)x(bandwidth) bytes in flight (Little’s law)
    - eg. 400-800 cycle latency, 1.15 GHz clock, 144 GB/s bandwidth, 14 SMs
    - (400 cycles) / (1.15G cycles/sec) * (144G Bytes/sec) / (14 SMs) / (128 Bytes/tran)
    - Need 30-50 128-byte transactions in flight per SM
- Ways to increase concurrent accesses:
    - Increase occupancy
        - Adjust thread block dimensions (To maximize occupancy at given register and smem requirements)
        - Reduce register count (`-maxrregcountoption`, or `__launch_bounds__`)
    - Modify code to process several elements per thread
- Thread are free: don't make one single thread do too much, use many of them
    - hardware can run a lot of threads in parallel
    - HW launch: near zero overhead to create them
    - HW context switching: near zero overhead scheduling
    - don't have some threads do a lot and others do little in one warp
- Barriers are cheap: it is one single instruction (HW synchronization og thread blocks)
- Partition on results, not on sources: associate thread to where it is written
    - _example_: compute the magnetic field from $N$ atoms on $N$ locations. 
        - partation on sources: each thread calculates the magnetic field generated by one atom on $N$ locations, and writes to these $N$ locations.
        - partation on resutls: each thread calucates the magnetic fields generated by $N$ atoms on one location

### Reference

[1]. <https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html#shared-memory>

[2]. Programming Massively Parallel Processors with CUDA, <https://wrf.ecse.rpi.edu/Teaching/parallel-s2019/stanford/lectures/lecture_11/the_fermi_architecture.pdf>