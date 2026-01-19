terraform {
  cloud {
    organization = "dcube-org-temp"

    workspaces {
      name = "deployment-basics"
    }
  }
}
