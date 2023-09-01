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
### Example: Simple deployment on any VM instance via docker compose.
```
docker-compose -f ./docker/docker-compose.general.yml
```

> Please running the database by 3rd-party SaaS provider to save your time, such as [Cockroach Lab](https://www.cockroachlabs.com).

# Future works
1. [X] Add hursky to automatically execute lint, prettier command.
2. [X] Build shared eslint file for multiple services.
3. [ ] Typeorm migrations mechanism
4. [ ] Pull out the shared packages for services ex: Entity type, helpers ......etc
5. [ ] CI/CD auto deployment
6. [ ] Implement ECS deployment via Terraform
7. [ ] Client site via NextJS
8. [ ] Admin portal via NextJS or headless CMS
