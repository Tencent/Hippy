FROM csighub.tencentyun.com/public/tnginx:1.0.81
RUN mkdir -p /data/release/
WORKDIR /data/release/
COPY site .
COPY nginx.conf /usr/local/services/tnginx_1_0_0-1.0/conf/nginx.conf
WORKDIR /data/release/devtools-protocol
# RUN ["/usr/local/services/tnginx_1_0_0-1.0/admin/start.sh", "all", "&&", "tail", "-f", "/dev/null"]
# ENTRYPOINT ["/usr/local/services/tnginx_1_0_0-1.0/admin/start.sh", "all"]
CMD ["/usr/local/services/tnginx_1_0_0-1.0/bin/nginx", "-g", "daemon off;"]
EXPOSE 80
