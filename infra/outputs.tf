output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "Name of the resource group"
}

output "webapp_name" {
  value       = azurerm_linux_web_app.backend.name
  description = "Name of the backend web app"
}

output "webapp_url" {
  value       = azurerm_linux_web_app.backend.default_hostname
  description = "Default hostname of the backend web app"
}

output "cosmos_endpoint" {
  value       = azurerm_cosmosdb_account.cosmos.endpoint
  description = "Endpoint of the Cosmos DB account"
}

output "openai_endpoint" {
  value       = var.enable_openai && length(azurerm_cognitive_account.openai) > 0 ? azurerm_cognitive_account.openai[0].endpoint : ""
  description = "Endpoint of Azure OpenAI account (empty if OpenAI disabled)"
}

output "openai_deployment_name" {
  value       = var.enable_openai && length(azurerm_cognitive_deployment.chat) > 0 ? azurerm_cognitive_deployment.chat[0].name : ""
  description = "Name of the Azure OpenAI deployment (empty if OpenAI disabled)"
}
