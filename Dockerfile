FROM buildkite/puppeteer:latest
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
ENV  PATH="${PATH}:/node_modules/.bin"
ENV NODE_ENV="production"
CMD [ "node", "server.js" ]
