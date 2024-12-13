# Set configurable stuff
DB_SERVER_prod=${DB_SERVER}
DB_USER_prod=dbadmin
DB_PASSWORD_prod=${DB_PASSWORD}

LEAF_ROOT=$PWD
KEYS_PATH=${KEYS_PATH}  # Set the absolute path to keys

# SQL_SERVER_CONNECTION="Server=host.docker.internal,1433;Database=LeafDB;uid=sa;Password=$SA_PASSWORD;TrustServerCertificate=True"
SQL_SERVER_CONNECTION_prod="Server=$DB_SERVER_prod;Database=LeafDB;uid=$DB_USER_prod;Password=$DB_PASSWORD_prod;TrustServerCertificate=True"

# Check ENV variables
if [ -z ${LEAF_JWT_CERT+x}   ]; then echo "LEAF_JWT_CERT is unset" && exit; fi
if [ -z ${LEAF_JWT_KEY+x}    ]; then echo "LEAF_JWT_KEY is unset" && exit; fi
if [ -z ${LEAF_JWT_KEY_PW+x} ]; then echo "LEAF_JWT_KEY_PW is unset" && exit; fi
if [ -z ${SERILOG_DIR+x}     ]; then echo "SERILOG_DIR is unset" && exit; fi

# Verify certificate files exist
if [ ! -f "${KEYS_PATH}/cert.pem" ]; then echo "cert.pem not found in ${KEYS_PATH}" && exit; fi 
if [ ! -f "${KEYS_PATH}/leaf.pfx" ]; then echo "leaf.pfx not found in ${KEYS_PATH}" && exit; fi

#--------------
# Cleanup
#--------------
echo "Stopping and removing existing containers..."
docker stop leaf_api_demo >/dev/null
docker rm leaf_api_demo >/dev/null

#--------------
# API
#--------------
echo "Building API..."
cd $LEAF_ROOT/src/server
docker build --platform linux/amd64 -t leaf_api .
cd $LEAF_ROOT

echo "Starting API..."

docker run \
    -e "LEAF_APP_DB=$SQL_SERVER_CONNECTION_prod" \
    -e "LEAF_CLIN_DB=$SQL_SERVER_CONNECTION_prod" \
    -e "LEAF_JWT_KEY_PW=$LEAF_JWT_KEY_PW" \
    -e "LEAF_JWT_CERT=/.keys/cert.pem" \
    -e "LEAF_JWT_KEY=/.keys/leaf.pfx" \
    -p 5001:5001 \
    -v ${PWD}/src/server:/app \
    -v ${KEYS_PATH}:/.keys \
    -v ${SERILOG_DIR}:/logs \
    --add-host=host.docker.internal:host-gateway \
    --platform linux/amd64 \
    --name leaf_api_demo \
    -d \
    leaf_api