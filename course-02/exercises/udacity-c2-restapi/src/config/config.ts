export const config = {
  "dev": {
    "username": "udagramselindev",
    "password": "udagramselindev",
    "database": "udagramselindev",
    "host": "udagramselindev.cbokukz9elyj.us-east-2.rds.amazonaws.com",
    "dialect": "postgres",
    "aws_region": "us-east-2",
    "aws_profile": "default",
    "aws_media_bucket": "udagram-ruttner-dev"
  },
  "prod": {
    "username": "",
    "password": "",
    "database": "udagram_prod",
    "host": "",
    "dialect": "postgres"
  },
  "jwt": {
    "secret": "helloworld"
  }
}
