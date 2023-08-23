provider "aws" {
  region = "ap-northeast-1"
}

resource "aws_ecr_repository" "ecr_repo_name" {
  name = "auth-boilerplate"
}

resource "aws_ecr_lifecycle_policy" "ecr_lifecycle_policy" {
  repository = aws_ecr_repository.ecr_repo_name.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1,
      description  = "Keep only the 5 most recent images",
      selection = {
        tagStatus   = "any",
        countType   = "imageCountMoreThan",
        countNumber = 5,
      },
      action = {
        type = "expire",
      },
    }]
  })
}
