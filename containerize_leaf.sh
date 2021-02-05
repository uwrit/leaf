
# Set configurable stuff
SA_PASSWORD=Th3PA55--8zz       # DB password
DB_SERVER=host.docker.internal # Use 'host.docker.internal' if mac, else '127.0.0.1' if linux 
                               # see: (https://stackoverflow.com/questions/24319662/from-inside-of-a-docker-container-how-do-i-connect-to-the-localhost-of-the-mach)
LEAF_ROOT=$(PWD)                            

# Check ENV variables
if [ -z ${LEAFDB_SA_PW+x}    ]; then echo "LEAFDB_SA_PW is unset!"    exit; fi
if [ -z ${LEAF_JWT_CERT+x}   ]; then echo "LEAF_JWT_CERT is unset!"   exit; fi
if [ -z ${LEAF_JWT_KEY+x}    ]; then echo "LEAF_JWT_KEY is unset!"    exit; fi
if [ -z ${LEAF_JWT_KEY+x}    ]; then echo "LEAF_JWT_KEY is unset!"    exit; fi
if [ -z ${LEAF_JWT_KEY_PW+x} ]; then echo "LEAF_JWT_KEY_PW is unset!" exit; fi
if [ -z ${LEAF_JWT_KEY_PW+x} ]; then echo "LEAF_JWT_KEY_PW is unset!" exit; fi

# Extract cert/key path from ENVs
KEYS_PATH=`echo $LEAF_JWT_CERT | sed 's/\/cert.pem.*//'`
if [ -z ${KEYS_PATH+x} ]; then echo "Couldn't find cert+key path! Are you sure LEAF_JWT_CERT is a valid path?" && exit; fi

#--------------
# DB
#--------------
docker run -d -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=$SA_PASSWORD" -p 1433:1433 --name leaf_db_demo mcr.microsoft.com/mssql/server:2017-latest 
sleep 10s
# sqlcmd oddly prefers '127.0.0.1' (not 'host.docker.internal'), so use that here
sqlcmd -S '127.0.0.1' -U SA -P $SA_PASSWORD -i src/db/build/LeafDB.sql 
sqlcmd -S '127.0.0.1' -U SA -P $SA_PASSWORD -d LeafDB -i src/db/build/LeafDB.Init.sql
sqlcmd -S '127.0.0.1' -U SA -P $SA_PASSWORD -i src/db/build/TestDB.sql

#--------------
# API
#--------------
cd $LEAF_ROOT/src/server
docker build -t leaf_api .
cd $LEAF_ROOT
docker run \
    -e "LEAF_APP_DB=Server=$DB_SERVER,1433;Database=LeafDB;uid=sa;Password=$SA_PASSWORD" \
    -e "LEAF_CLIN_DB=Server=$DB_SERVER,1433;Database=TestDB;uid=sa;Password=$SA_PASSWORD" \
    -e "LEAF_JWT_KEY_PW=$LEAF_JWT_KEY_PW" \
    -p 5001:5001 \
    -v ${PWD}/src/server:/app \
    -v ${KEYS_PATH}:/.keys \
    -v ${SERILOG_DIR}:/logs \
    --name leaf_api_demo \
    -d \
    leaf_api
