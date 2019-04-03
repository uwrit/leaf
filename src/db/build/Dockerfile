FROM microsoft/mssql-server-linux:2017-latest

ARG sapw

RUN mkdir data

# Include schema and initial data
COPY ./LeafDB.sql ./LeafDB.Data.sql ./LeafDB.Exec.sql ./SynPuf_OMOP.Restore.sql ./
COPY ./SynPuf_OMOP.bak ./data/

# Accept EULA
ENV ACCEPT_EULA Y

# Dev SA Password
ENV MSSQL_SA_PASSWORD ${sapw}

# Volumize somewhere to interact with host if needed
VOLUME /bak

# Set up database
RUN /opt/mssql/bin/sqlservr & sleep 10 \
    && /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P ${MSSQL_SA_PASSWORD} -i ./LeafDB.sql \
    # && /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P ${MSSQL_SA_PASSWORD} -i ./LeafDB.Data.sql \
    && /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P ${MSSQL_SA_PASSWORD} -i ./LeafDB.Exec.sql \
    && /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P ${MSSQL_SA_PASSWORD} -i ./SynPuf_OMOP.Restore.sql \
    # && /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P ${MSSQL_SA_PASSWORD} -i ./SynPuf_OMOP.Shrink.sql \
    && pkill sqlservr

RUN rm /data/SynPuf_OMOP.bak