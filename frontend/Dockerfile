FROM node:12-alpine
WORKDIR /app
COPY . /app
RUN npm i
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["node", "app.js"]