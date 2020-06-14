---
layout: notes
category: notes
tag: [knowledge]
title: Container Questions
---

#### VM vs. Container

{:class="table table-bordered"}
| | VMs | Containers |
|:-|:-|:-|
| Weight | Heavyweight | Lightweight |
| OS | Each VM runs in its own OS | All containers share the host OS |
|Virtualization|Hardware-level virtualization|OS virtualization|
|Startup|Startup time in minutes|Startup time in milliseconds|
|Memory|Allocates required memory|Requires less memory space|
|Isolation|Fully isolated and hence more secure|Process-level isolation, possibly less secure|
|Deployment|Deployed by VM managers|Deploy individual containers by using Docker via command line; <br>Deploy multiple containers by using an orchestrator such as Kubernetes Service.|
|Load balancing|Virtual machine load balancing moves running VMs to other servers in a failover cluster.|Containers themselves don't move; instead an orchestrator can automatically start or stop containers on cluster nodes to manage changes in load and availability.|
|Fault tolerance|VMs can fail over to another server in a cluster, with the VM's operating system restarting on the new server.|If a cluster node fails, any containers running on it are rapidly recreated by the orchestrator on another cluster node.|