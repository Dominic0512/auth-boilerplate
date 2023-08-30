# Prerequisite
1. Docker Desktop
2. AWS CLI and an AWS account
3. PNPM
4. Terraform CLI

# Getting Started For Development

## 1. To clone the env.example files for development, follow the following paths:
```
cp ./.env.example ./.env.development
cp ./services/gateway/.env.example ./services/gateway/.env.development
cp ./services/user/.env.example ./services/users/.env.development
```

> Remember fulfill the env variables.

## 2. To run the api services on local.
```
docker-compose -f ./docker/docker-compose.yml up -d
```

# Getting Starteed for Deployment

## 1. To clone the env.example files for deployment, follow the following paths:
```
cp ./.env.example ./.env.production
cp ./services/gateway/.env.example ./services/gateway/.env.production
cp ./services/user/.env.example ./services/users/.env.production
cp ./.env.makefile.example ./.env.makefile
```
> Remember fulfill the env variables.

## 2. Login aws account via AWS CLI
```
aws configure
```
> Enter the AWS access key and secret by generating an access key record through AWS console.

## 3. Bump version once you have new commits
```
make bump
```

## 4. Create repository via AWS console/terraform
### Terraform
```
cd ./terraform/registry
terraform init
terraform plan
terraform apply
```
> To destroy the ECR repository, you only can do it via AWS console.

## 5. Release docker image to AWS ECR.
```
make release
```

## 6. Deploy the container services to any plaform which supporting docker container deployment.

# Future works
1. [] Typeorm migrations mechanism
2. [] Pull out the shared packages for services ex: Entity type, helpers ......etc
3. [] Implement ECS deployment via Terraform
4. [] CI/CD auto deployment
5. [] Client site via NextJS
6. [] Admin portal via NextJS or headless CMS