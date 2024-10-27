FROM node:slim As build

WORKDIR /usr/src/app

COPY --chown=node:node ./package*.json .

RUN npm ci

COPY --chown=node:node . .

RUN npm run build && npm ci --omit=dev

USER node


FROM node:slim As production

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/.env .

EXPOSE 8080

CMD [ "node", "dist/main.js" ]