#!/bin/bash
start_time=$(date +%s)
echo "Deploy app - Env: $TAG"

#Enable debugging mode
set -x

AWS_ID="019348867331"
AWS_REGION="ap-northeast-1"


echo "Deploy by ECS"
ECS_CLUSTER="web-app-$TAG"
ECS_SERVICE="web-service-$TAG"
chmod +x ./jenkins/scripts/ecs-deploy.sh
./jenkins/scripts/ecs-deploy.sh -r ${AWS_REGION} -c "$ECS_CLUSTER" -n "$ECS_SERVICE" --force-new-deployment --skip-deployments-check --min 50 --max 100 -i ignore -to latest

OUT=$?
echo $OUT

#Disable debugging mode
set +x

end_time=$(date +%s)
runtime=$( echo "$end_time - $start_time" | bc -l )
echo "Completed in $runtime" seconds

if [ $OUT -eq 0 ]
then
  echo 'Deploy: Successful'
  exit 0
else
  echo 'Deploy: Failed'
  exit 1
fi
