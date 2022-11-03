FROM mcr.microsoft.com/mssql/server:2019-latest

ARG sapw

# change active user to root
USER root 

RUN mkdir data

# set mssql as owner of the data directory
RUN chown mssql data

# change back to user mssql
USER mssql

# Include schema and initial data
COPY ./*.sql ./
# COPY ./SynPuf_OMOP.bak ./data/

# # Accept EULA
ENV ACCEPT_EULA Y

# Dev SA Password
ENV MSSQL_SA_PASSWORD ${sapw}

# Volumize somewhere to interact with host if needed
VOLUME /bak


# Set up database
RUN ( /opt/mssql/bin/sqlservr --accept-eula & ) | grep -q "Service Broker manager has started" \
    && /opt/mssql-tools/bin/sqlcmd -S 127.0.0.1 -U SA -P ${MSSQL_SA_PASSWORD} -i LeafDB.sql   \
    && /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P ${MSSQL_SA_PASSWORD} -i TestDB.sql   \
    && /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P ${MSSQL_SA_PASSWORD} -i ./LeafDB.Init.sql -d LeafDB   \
    && pkill sqlservr

    # && /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U SA -P ${MSSQL_SA_PASSWORD} -i ./SynPuf_OMOP.Restore.sql \
    # && /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U SA -P ${MSSQL_SA_PASSWORD} -i ./SynPuf_OMOP.Shrink.sql \
    # && /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U SA -P ${MSSQL_SA_PASSWORD} \
    # && /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U SA -P ${MSSQL_SA_PASSWORD} -i ./LeafDB.Data.sql \
    # && /opt/mssql-tools/bin/sqlcmd -S localhost,1433 -U SA -P ${MSSQL_SA_PASSWORD} -i ./LeafDB.Exec.sql \

# RUN rm /data/SynPuf_OMOP.bak