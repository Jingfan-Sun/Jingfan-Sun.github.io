---
layout: notes
category: notes
tag: [knowledge]
title: Database Cheatsheet
cover_img: "https://ambaboo-github-io-assets.s3.amazonaws.com/2020-07-11-db-cheatsheet-cover.png"
published: true
---

### MySQL

#### Allow Remote User to Connect [1][2]

Scenario: A MySQL db has been started on a remote machine, I want to query this db from mu local workstation. I am not able to log in using the credential I use directly on the remote machine.

```bash
# edit mysqld.cnf
# change 'bind-address' to the ip of remote machine that serves the mysql db
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
# restart mysql server
sudo systemctl restart mysql
# create the credential used to connect from local -> remote mysql
CREATE USER 'username'@'local_ip' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'username'@'local_ip';
```

[1]. <https://phoenixnap.com/kb/mysql-remote-connection>

[2]. <https://www.digitalocean.com/community/tutorials/how-to-allow-remote-access-to-mysql>