variable "project_name" {
  type        = string
  default     = "college-events-portal"
  description = "Base name for all resources"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Environment name (dev/stage/prod)"
}

variable "location" {
  type        = string
  default     = "centralindia"
  description = "Azure region"
}

variable "cosmos_db_name" {
  type        = string
  default     = "CollegeEventsDB"
  description = "Cosmos DB SQL database name"
}
variable "enable_openai" {
  type        = bool
  default     = false
  description = "Whether to provision Azure OpenAI resources"
}
