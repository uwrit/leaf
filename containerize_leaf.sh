
export $(xargs <.env)
# Set configurable stuff
SA_PASSWORD=Th3PA55--8zz       # DB password
DB_SERVER=host.docker.internal # Use 'host.docker.internal' if mac, else '127.0.0.1' if linux 
                               # see: (https://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach)
LEAF_ROOT=$PWD
DOCKER_OPTIONS="--add-host host.docker.internal:host-gateway -it "

# Check ENV variables
if [ -z ${LEAFDB_SA_PW+x}    ]; then echo "LEAFDB_SA_PW is unset!"    exit; fi
if [ -z ${LEAF_JWT_CERT+x}   ]; then echo "LEAF_JWT_CERT is unset!"   exit; fi
if [ -z ${LEAF_JWT_KEY+x}    ]; then echo "LEAF_JWT_KEY is unset!"    exit; fi
if [ -z ${LEAF_JWT_KEY_PW+x} ]; then echo "LEAF_JWT_KEY_PW is unset!" exit; fi
# if [ -z ${LEAF_JWT_KEY+x}    ]; then echo "LEAF_JWT_KEY is unset!"    exit; fi
# if [ -z ${LEAF_JWT_KEY_PW+x} ]; then echo "LEAF_JWT_KEY_PW is unset!" exit; fi


#--------------
# DB
# --------------
# sudo docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Th3PA55--8zz" -p 1433:1433 --name leaf_db_demo mcr.microsoft.com/mssql/server:2019-latest

# sleep 60s  # need to sleep long enough for the db server to setup
# sqlcmd oddly prefers '127.0.0.1' (not 'host.docker.internal'), so use that here
# sqlcmd -S localhost,1433 -U SA -P "Th3PA55--8zz"
#  SELECT Name from sys.databases;

# sqlcmd -S localhost,1433 -U SA -P "Th3PA55--8zz" -i src/db/build/LeafDB.sql 
# sqlcmd -S localhost,1433 -U SA -P "Th3PA55--8zz" -d LeafDB -i src/db/build/LeafDB.Init.sql
# sqlcmd -S localhost,1433 -U SA -P "Th3PA55--8zz" -i src/db/build/TestDB.sql


#--------------
# API
#--------------

cd $LEAF_ROOT/src/server

# Extract cert/key path from ENVs
# KEYS_PATH=`echo $LEAF_JWT_CERT | sed 's/\/cert.pem.*//'`
KEYS_PATH="/keys"
if [ -z ${KEYS_PATH+x} ]; then echo "Couldn't find cert+key path! Are you sure LEAF_JWT_CERT is a valid path?" && exit; fi

echo $PWD, ${KEYS_PATH}

sudo docker build -t leaf_api --progress=plain .

# docker run -e "LEAF_APP_DB=${LEAF_APP_DB}" -e "LEAF_CLIN_DB=${LEAF_CLIN_DB}" -e "LEAF_JWT_KEY_PW=${LEAF_JWT_KEY_PW}" -p 5001:5001 --name leaf_api_demo leaf_api
cd $LEAF_ROOT
sudo docker run \
    ${DOCKER_OPTIONS} \
    -e "LEAF_APP_DB=Server=$DB_SERVER,1433;Database=LeafDB;uid=sa;Password=$SA_PASSWORD" \
    -e "LEAF_CLIN_DB=Server=$DB_SERVER,1433;Database=TestDB;uid=sa;Password=$SA_PASSWORD" \
    -e "LEAF_JWT_KEY_PW=$LEAF_JWT_KEY_PW" \
    -p 5001:5001 \
    --name leaf_api_demo \
    -it \
    leaf_api # /bin/bash
    # -v ${PWD}:/app \
    # -v ${KEYS_PATH}:/.keys \
    # -v ${SERILOG_DIR}:/logs \
