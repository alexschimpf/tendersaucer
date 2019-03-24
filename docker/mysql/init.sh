#!/usr/bin/env bash
set -ex

MYSQL_PASSWORD=root
chown -R mysql:mysql /var/lib/mysql

mysql -u root -p"$MYSQL_PASSWORD" -e "GRANT USAGE ON *.* TO 'root'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';"
mysql -u root -p"$MYSQL_PASSWORD" -e "GRANT SELECT, LOCK TABLES ON mysql.* TO 'root'@'%';"
mysql -u root -p"$MYSQL_PASSWORD" -e "GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON *.* TO 'root'@'%';"

mysql -u root -p"$MYSQL_PASSWORD" -e "DROP DATABASE IF EXISTS tendersaucer"
mysql -u root -p"$MYSQL_PASSWORD" -e "CREATE DATABASE tendersaucer DEFAULT CHARACTER SET utf8;"
mysql -u root -p"$MYSQL_PASSWORD" -e "GRANT ALL PRIVILEGES ON tendersaucer.* TO 'root'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';"

mysql -u root -p"$MYSQL_PASSWORD" -D tendersaucer < /opt/sql/tendersaucer.sql
