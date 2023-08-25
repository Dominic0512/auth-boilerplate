#!make

include .env.makefile
export $(shell sed 's/=.*//' .env.makefile)

DOCKER_FILE_PATH:=docker/Dockerfile.node.general
DOCKER_REGISTRY:=$(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
REPOSITORY:=auth-boilerplate
DEFAULT_TAG:=latest

TAG_COMMIT := $$(git rev-list --abbrev-commit --tags --max-count=1)
# `2>/dev/null` suppress errors and `|| true` suppress the error codes.
TAG := $(shell git describe --abbrev=0 --tags ${TAG_COMMIT} 2>/dev/null || true)
# strip the version prefix
VERSION := $(TAG:v%=%)
COMMIT := $(shell git rev-parse --short HEAD)

all:
	@echo "nothing now"

bump:
	@echo "change to main branch to bump version!"
	git checkout main
	lerna version

build:
	@echo "build docker image $(REPOSITORY)";
	docker build -f $(DOCKER_FILE_PATH) -t $(REPOSITORY) .

tag:
	@echo "tag image as $(DOCKER_REGISTRY)/$(REPOSITORY):$(DEFAULT_TAG), $(DOCKER_REGISTRY)/$(REPOSITORY):$(VERSION)";
	docker tag $(REPOSITORY) $(DOCKER_REGISTRY)/$(REPOSITORY):$(DEFAULT_TAG)
	docker tag $(REPOSITORY) $(DOCKER_REGISTRY)/$(REPOSITORY):$(VERSION)

publish: repo-login tag
	@echo "push images $(DOCKER_REGISTRY)/$(REPOSITORY):$(DEFAULT_TAG), $(DOCKER_REGISTRY)/$(REPOSITORY):$(VERSION)";
	docker push $(DOCKER_REGISTRY)/$(REPOSITORY):$(DEFAULT_TAG)
	docker push $(DOCKER_REGISTRY)/$(REPOSITORY):$(VERSION)

release: build publish

repo-login:
	aws ecr get-login-password | docker login --username AWS --password-stdin $(DOCKER_REGISTRY)/$(REPOSITORY)

.PHONY: all bump build repo-login
