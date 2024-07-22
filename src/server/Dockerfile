FROM mcr.microsoft.com/dotnet/sdk:6.0

RUN useradd leaf                \
    && mkdir /home/leaf/        \
    && chown leaf /home/leaf/   \
    && groupadd leafg           \
    && usermod -a -G leafg leaf

COPY --chown=leaf:leafg . /app

VOLUME [ "/app", "/.keys", "/logs" ]
 
USER leaf
 
# Configure Environment Variables
ENV LEAF_JWT_CERT /.keys/cert.pem
ENV LEAF_JWT_KEY  /.keys/leaf.pfx
ENV SERILOG_DIR   /logs
ENV ASPNETCORE_URLS=http://0.0.0.0:5001
ENV DOTNET_RUNNING_IN_CONTAINER true
ENV DOTNET_USE_POLLING_FILE_WATCHER true
ENV NUGET_XMLDOC_MODE skip
 
WORKDIR /app/API
CMD [ "dotnet", "run" ]