echo "Building docker image, tag $TAG"
set -x
# Cat env content from Jenkins Credentials to .env file
cat $ENV_FILE > ./.env

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
docker-compose -f ./docker/docker-compose.yml build --parallel

OUT=$?
set +x

if [ $OUT -eq 0 ]
then
  exit 0
else
  echo 'Failure: docker build'
  exit 1
fi
