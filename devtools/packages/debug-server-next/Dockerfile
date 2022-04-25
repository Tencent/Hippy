FROM csighub.tencentyun.com/tsw/tsw:latest
LABEL maintainer="chestershen@tencent.com"
RUN mkdir -p /data/release/devtools-debug-server
WORKDIR /data/release/devtools-debug-server
COPY dist dist
COPY node_modules node_modules
COPY package.json .
COPY package-lock.json .

# RUN npm i --registry=http://mirrors.tencent.com/npm/

CMD ["node", "dist/index-debug", "--port", "80"]

EXPOSE 80
