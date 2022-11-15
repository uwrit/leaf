FROM node:13.12.0-alpine as build-step

# set working directory
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY . /app
RUN npm install

CMD [ "npm", "start" ]

#COPY build /app/build
#COPY nginx.conf /app

#FROM nginx:1.17.1-alpine
#EXPOSE 8080
#COPY --from=build-step /app/build /usr/share/nginx/html
#COPY --from=build-step /app/nginx.conf /etc/nginx/conf.d/default.conf
#CMD [ "nginx", "-g", "daemon off;" ]







# FROM nginx:latest
# RUN apt update
# RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
# RUN apt install -y nodejs
# RUN npm install -g typescript@latest
# RUN mkdir /code
# COPY . /code
# RUN cd /code && find . && npm install && npm run build

# RUN mkdir /app
# RUN cp -R /code/build/* /app/

# COPY ./nginx.conf /etc/nginx/nginx.conf
