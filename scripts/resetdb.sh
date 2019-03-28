#!/bin/bash
docker rm leaf_mssql_1
echo "Deleted Leaf MSSQL Container"
docker rmi leaf_mssql
echo "Deleted Leaf MSSQL Image"
docker volume rm leaf_leaf-mssql
echo "Deleted Leaf MSSQL Volume"