---
layout: notes
category: notes
tag: [knowledge]
title: Docker Cheat Sheet
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2020-03-10-container-questions-cover.png"
---

### Images

```shell
# pull images from registries
docker image pull NAME[:TAG]
# list all of the images in Docker host's local cache
docker image ls
# list images with SHA256 hash
docker image ls --digests
# show a list of IDs of the images 
docker image ls -q
# display detailed metadata of one or more images
docker image inspect IMAGE
# delete one or more images
docker image rm IMAGE
```

### Containers

```shell
# start new containers
docker container run IMAGE [COMMAND]
# start new container in detached mode (background)
docker container run -d IMAGE [COMMAND]
# lists all containers in the running (UP) state
docker container ls
# show all containers including those in stopped (Exited) state
docker container ls -a
# run a new process inside of a running container
docker container exec CONTAINER COMMAND
# stop a running container and put it in the (Exited (0)) state
docker container stop CONTAINER
# restart a stopped (Exited) container
docker container start CONTAINER
# delete a stopped container (after stopping it)
docker container rm CONTAINER
# show detailed configuration and runtime information about a container
docker container inspect CONTAINER
# stop and delete all containers
docker container stop $(docker container ls -aq)
docker container rm $(docker container ls -aq)
```

### Container Life Cycle

```shell
# reads a Dockerfile and containerizes an application
docker image build -t NAME[:TAG] PATH
```