FROM node:14-alpine as build-step

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