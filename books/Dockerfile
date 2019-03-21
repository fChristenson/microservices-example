FROM mhart/alpine-node:10

COPY . /src

WORKDIR /src

RUN npm install --production

EXPOSE 3000

CMD npm start
