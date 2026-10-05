AWS_ID="019348867331"
AWS_ECR_REPOSITORY="web-app-$TAG"
REGION="ap-northeast-1"
DOCKER_NAME="tokiwagi:$TAG"

# Login Elastic Container Registry - ECR
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${AWS_ID}.dkr.ecr.ap-northeast-1.amazonaws.com

## Push Image to ECR
DOCKER_REPOSITORY_WEB=${AWS_ID}.dkr.ecr.ap-northeast-1.amazonaws.com/${AWS_ECR_REPOSITORY}
docker tag "${DOCKER_NAME}" $DOCKER_REPOSITORY_WEB:latest
docker push ${DOCKER_REPOSITORY_WEB}:latest
