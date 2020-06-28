---
layout: notes
category: notes
tag: [knowledge]
title: Concurrency Patterns
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2020-03-10-container-questions-cover.png"
published: false
---

### Producer/Consumer

Producers create items of some kind and add them to a data structure; consumers remove the items and process them.
- While an item is being added to or removed from the buffer, the buffer is in an inconsistent state. Therefore, threads must have exclusive access to the buffer.
- If a consumer thread arrives while the buffer is empty, it blocks until a producer adds a new item.
- If a producer arrives when the buffer is full, it blocks until a consumer removes an item.

```c++
sem_t spaces, items, mutex;
sem_init(&spaces, 0, buffer.size());
sem_init(&items, 0, 0);
sem_init(&mutex, 0, 1);
void *producer(void *arg) {
    sem_wait(&spaces);  // wait for more space
    sem_wait(&mutex);
    // ************* insert to queue
    sem_post(&mutex);
    sem_post(&items);  // signal that there are more items
    return NULL;
}
void *consumer(void *arg) {
    sem_wait(&items);
    sem_wait(&mutex);
    // ************* get from queue
    sem_post(&mutex);
    sem_post(&spaces);
    return NULL;
}
```

### Readers/Writers

A data structure, database, or file system is read and modified by concurrent threads.

#### Favor Readers

- Any number of readers can be in the critical section simultaneously.
- Writers must have exclusive access to the critical section. A writer cannot enter the critical section while any other thread (reader or writer) is there, and while the writer is there, no other thread may enter.

```c++
int readerCount = 0;
sem_t roomEmpty, mutex;
sem_init(&roomEmpty, 0, 1);
sem_init(&mutex, 0, 1);
void *reader(void *arg) {
    sem_wait(&mutex);
    readerCount++;
    if (readerCount == 1)
        sem_wait(&roomEmpty);  // first reader turns on the light
    sem_post(&mutex);
    // ************* reading the data
    sem_wait(&mutex);
    readerCount--;
    if (readerCount == 0)
        sem_post(&roomEmpty);  // last reader turns off the light
    sem_post(&mutex);
    return NULL;
}
void *writer(void *arg) {
    sem_wait(&roomEmpty);  // wait for room to be empty
    // ************* writing to the data
    sem_post(&roomEmpty);  // signal that the room is empty now
    return NULL;
}
```

```c++
// Three states are possible with a reader–writer lock: 
// locked in read mode, locked in write mode, and unlocked. 
// Only one thread at a time can hold a reader–writer lock in write mode,
// but multiple threads can hold a reader–writer lock in read mode at the same time.
pthread_rwlock_t rwlock;
void *reader(void *arg) {
    pthread_rwlock_rdlock(&rwlock);
    // reading the data
    pthread_rwlock_unlock(&rwlock);
    return NULL;
}
void *writer(void *arg) {
    pthread_rwlock_wrlock(&rwlock);
    // writing to the data
    pthread_rwlock_unlock(&rwlock);
    return NULL;
}
```

#### Favor Writers

```c++
int readerCount = 0;
int writerCount = 0;
sem_t mutexReader, mutexWriter;
sem_t noReader, noWriter;
sem_init(&mutexReader, 0, 1);
sem_init(&mutexWriter, 0, 1);
sem_init(&noReader, 0, 1);
sem_init(&noWriter, 0, 1);
void *reader(void *arg) {
    sem_wait(&noReader);  // wait for the signal to allow readers in
    sem_wait(&mutexReader);
    readerCount++;
    if (readerCount == 1)
        sem_wait(&noWriter);  // first reader turns on the light
    sem_post(&mutexReader);
    sem_post(&noReader);
    // ************* reading the data
    sem_wait(&mutexReader);
    readerCount--;
    if (readerCount == 0)
        sem_post(&noWriter);  // last reader turns off the light
    sem_post(&mutexReader);
    return NULL;
}
void *writer(void *arg) {
    sem_wait(&mutexWriter);
    writerCount++;
    if (writerCount == 1)
        sem_wait(&noReader);  // first writer turns on the light
    sem_post(&mutexWriter);
    
    sem_wait(&noWriter);  // exclusively write
    // ************* writing to the data
    sem_post(&noWriter);
    sem_wait(&mutexWriter);
    writerCount--;
    if (writerCount == 0)
        sem_post(&noReader);  // last writer turns off the light
    sem_post(&mutexWriter);
    return NULL;
}
```

#### No Starvation

"no thread shall be allowed to starve" if and only if semaphores preserve first-in first-out ordering when blocking and releasing threads

```c++
int readerCount = 0;
sem_t roomEmpty, mutex, serviceQueue;
sem_init(&roomEmpty, 0, 1);
sem_init(&mutex, 0, 1);
sem_init(&serviceQueue, 0, 1);
void *reader(void *arg) {
    // no more readers added if there is writer waiting
    sem_wait(&serviceQueue);
    sem_post(&serviceQueue);
    sem_wait(&mutex);
    readerCount++;
    if (readerCount == 1)
        sem_wait(&roomEmpty);  // first reader turns on the light
    sem_post(&mutex);
    // ************* reading the data
    sem_wait(&mutex);
    readerCount--;
    if (readerCount == 0)
        sem_post(&roomEmpty);  // last reader turns off the light
    sem_post(&mutex);
    return NULL;
}
void *writer(void *arg) {
    sem_wait(&serviceQueue); // wait in line to be serviced
    sem_wait(&roomEmpty);     // request exclusive access to resource
    sem_post(&serviceQueue);  // let next in line be serviced
    // ************* writing to the data
    sem_post(&roomEmpty);  // signal that the room is empty now
    return NULL;
}
```