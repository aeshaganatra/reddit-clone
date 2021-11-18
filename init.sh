#!/bin/bash -i

sudo docker run --rm -p 6379:6379 --name some-redis -d redis:6.0
sudo docker run --rm -p 3306:3306 --name some-mysql -e MYSQL_ROOT_PASSWORD=admin -d mysql:8.0

sleep 9

sudo docker exec -it some-mysql mysql -u root -padmin -e "create database lireddit2"

