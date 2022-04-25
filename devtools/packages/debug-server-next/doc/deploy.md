# Deploy
Debug server use Redis Pub/Sub to do load-balancing between multiple server, and use COS to store your static resources. Follow those step to deploy your own devtools debug server:

1. Add environment variable
   - Single Node
      ```bash
      IS_CLUSTER=false
      StaticFileStorage="local"
      DOMAIN=<your_access_domain_with_port> # like https://devtools.qq.com
      ```

   - Node Cluster
      ```bash
      IS_CLUSTER=true
      StaticFileStorage="COS"
      DOMAIN=<your_access_domain_with_port>
      # redis config
      REDIS_PWD=<your_redis_pwd>
      REDIS_HOST=<your_redis_host>
      REDIS_PORT=<your_redis_port>
      # cos config
      SecretId=<your_COS_secret_id>
      SecretKey=<your_COS_secret_key>
      Bucket=<your_COS_bucket>
      Region=<your_COS_region>
      StorageClass=<your_COS_storage_class>
      ```

2. Build docker image and deploy: `docker build -t devtools-debug-server:v1 .`