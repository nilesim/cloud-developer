Selin Kaya

Refactor Udagram App into Microservices and Deploy project

I continued in course-02 source directory and pushed project codes for Docker and Kubernetes there.


## Clone the project GitHub repository link:
https://github.com/nilesim/cloud-developer/tree/master/course-02/exercises/ 
## Screenshots can be found at:
https://github.com/nilesim/cloud-developer/tree/dev/course-02/project/refactor-udagram-screenshots
## DockerHub images could be found at: 
https://hub.docker.com/u/nilesim

* CI-CD file for travis:
https://github.com/nilesim/cloud-developer/blob/master/.travis.yml
* “user” - allows users to register and log into a web client:
https://github.com/nilesim/cloud-developer/tree/master/course-02/exercises/udacity-c2-restapi-user
* “feed” - allows users to post photos, and process photos using image filtering:
https://github.com/nilesim/cloud-developer/tree/master/course-02/exercises/udacity-c2-restapi-feed
* “frontend” - acts as an interface between the user and the backend-services:
https://github.com/nilesim/cloud-developer/tree/master/course-02/exercises/udacity-c2-frontend
* docker compose build files for building all with ngnix:
https://github.com/nilesim/cloud-developer/tree/master/course-02/exercises/udacity-c3-deployment/docker
* k8 files for kubernetes:
https://github.com/nilesim/cloud-developer/tree/master/course-02/exercises/udacity-c3-deployment/k8s


### Commands to work project
## 1 - Starting the app as a container on a local system
cd <your-dir>\cloud-developer\course-02\exercises\udacity-c2-restapi-user

npm install

docker build -t nilesim/udacity-restapi-user . 

cd <your-dir>\cloud-developer\course-02\exercises\udacity-c2-restapi-feed

npm install

docker build -t nilesim/udacity-restapi-feed . 

cd <your-dir>\cloud-developer\course-02\exercises\udacity-c2-frontend

npm install

docker build -t nilesim/udacity-frontend . 

docker images

### Run the container on local with environment variables
docker run --rm --publish 8080:8080 -v $HOME/.aws:/root/.aws --env POSTGRESS_HOST=$POSTGRESS_HOST --env POSTGRESS_USERNAME=$POSTGRESS_USERNAME --env POSTGRESS_PASSWORD=$POSTGRESS_PASSWORD --env POSTGRESS_DB=$POSTGRESS_DB --env AWS_REGION=$AWS_REGION --env AWS_PROFILE=$AWS_PROFILE --env AWS_BUCKET=$AWS_BUCKET --env JWT_SECRET=$JWT_SECRET --name feed nilesim/udacity-restapi-feed

docker exec -it feed /bin/bash

curl http://localhost:8080/api/v0/feed

docker push nilesim/udacity-restapi-feed
### List, kill and clean
docker container ls

docker container kill feed

docker container prune

## 2 - DockerFiles build all together 
docker-compose -f docker-compose-build.yaml build --parallel
### Monitor them
docker-compose ps
### If you wish to stop the containers gracefully, use the below command:
docker-compose stop
### To remove (and stop) the container
docker-compose down

## 3 - To deploy to a kubernetes cluster
cd <your-dir>\cloud-developer\course-02\exercises\udacity-c3-deployment\k8s

kubectl apply -f backend-feed-deployment.yaml 

kubectl apply -f backend-user-deployment.yaml 

kubectl apply -f frontend-deployment.yaml 

kubectl apply -f reverseproxy-deployment.yaml

### Check the Status of Pods:
kubectl get pod -o wide

kubectl get deployment

kubectl get rs

kubectl get pod

### Delete if necessary
kubectl delete deployment dep-example

kubectl delete pod pod-example

## 4 - Apply the secrets - (!)the secrets are not committed to git for security reasons. Can be given if necessary.
kubectl apply -f .\aws-secret.yaml

kubectl apply -f .\env-configmap.yaml

kubectl apply -f .\env-secret.yaml


kubectl get configmaps

kubectl get secrets

kubectl get secret aws-secret -o yaml

kubectl describe secrets/aws-secret

## 5 - Port forwarding for accessing service via localhost
kubectl apply -f .\backend-feed-service.yaml

kubectl apply -f .\backend-user-service.yaml

kubectl port-forward service/frontend 8100:8100

kubectl port-forward service/reverseproxy 8080:8080
### test it 
curl http://localhost:8080/api/v0/feed

-- chrome screenshot can be found at: https://github.com/nilesim/cloud-developer/blob/dev/course-02/project/refactor-udagram-screenshots/alive-website.PNG

## 6 - Scale up and down
 kubectl scale deployment/backend-user --replicas=10
 
 kubectl scale deployment/backend-feed --replicas=5
 
 kubectl get deploy
 
 kubectl scale deployment/backend-user --replicas=1
 
 kubectl scale deployment/backend-feed --replicas=1

## 7 - zero downtime update example

-- I used 

-- https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/

-- https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-interactive/

kubectl get deployments

kubectl set image deployments/backend-feed backend-feed=nilesim/udacity-restapi-feed:dev

## 8 - a/b testing
kubectl apply -f backend-feed-deployment-green.yaml 

kubectl apply -f backend-feed-deployment-red.yaml 

kubectl apply -f backend-feed-service-red.yaml

kubectl apply -f backend-feed-service-green.yaml


kubectl port-forward service/frontend 8100:8100

kubectl port-forward service/reverseproxy 8080:8080
