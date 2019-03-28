FROM centos:7

# Install .NET Core and dependencies
RUN yum install -y centos-release-dotnet
RUN yum install -y rh-dotnet21

# Update and clean
RUN yum -y update
RUN yum clean all

# Configure Kestrel
ENV ASPNETCORE_URLS http://+:5001
ENV DOTNET_RUNNING_IN_CONTAINER true
ENV DOTNET_USE_POLLING_FILE_WATCHER true
ENV NUGET_XMLDOC_MODE skip

# Reference the environment
VOLUME [ "/app", "/.keys", "/logs"]
