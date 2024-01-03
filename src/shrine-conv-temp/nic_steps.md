0. `nvm use 12.16.1`
1. `mvn clean install -DskipTests`
2. `cd docker/scripts`
3. `docker build --platform linux/amd64 --no-cache -f src/main/docker/images/mysql/Dockerfile -t shrine-mysql:0.1 ../../`
4. `docker build --platform linux/arm64/v8 --no-cache --tag shrine-certs:0.1 --progress plain -f src/main/docker/images/certs/Dockerfile ../../`
5. `docker build --platform=linux/arm64/v8 --no-cache --tag shrine-node:0.1 -f src/main/docker/images/shrine-node/Dockerfile ../../ --build-arg SHRINE_VERSION=4.1.0`
6. `docker build --platform=linux/arm64/v8 --no-cache --build-arg I2B2_WILDFLY_TAG=release-v1.7.13 --tag shrine-i2b2-wildfly:0.1 -f src/main/docker/images/i2b2/Dockerfile ../../`
7. `cd ../../`
8. `docker build -f docker/scripts/src/main/docker/images/zookeeper/Dockerfile --no-cache -t zookeeper:3.7.0 . --build-arg SCALA_VERSION=2.12 --build-arg KAFKA_VERSION=3.4.0`
9. `docker build -f docker/scripts/src/main/docker/images/kafka/Dockerfile --no-cache -t kafka:3.0.0 . --build-arg SCALA_VERSION=2.12 --build-arg KAFKA_VERSION=3.4.0`
10. `cd docker/scripts`

# All nodes
11. `docker-compose --env-file src/main/docker/.env -f src/main/docker/dev-environments/docker-compose.yml -f src/main/docker/dev-environments/certs/docker-compose.yml -f src/main/docker/dev-environments/kafka/docker-compose.yml -f src/main/docker/dev-environments/shrine-hub/docker-compose.yml -f src/main/docker/dev-environments/shrine-node1/docker-compose.yml -f src/main/docker/dev-environments/shrine-node2/docker-compose.yml up --detach`

# Hub and node 1 only
11. `docker-compose --env-file src/main/docker/.env -f src/main/docker/dev-environments/docker-compose.yml -f src/main/docker/dev-environments/certs/docker-compose.yml -f src/main/docker/dev-environments/kafka/docker-compose.yml -f src/main/docker/dev-environments/shrine-hub/docker-compose.yml -f src/main/docker/dev-environments/shrine-node1/docker-compose.yml up --detach`
12. https://localhost:6443/shrine-api/shrine-webclient


