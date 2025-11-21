output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "webapp_name" {
  value = azurerm_linux_web_app.backend.name
}

output "webapp_url" {
  value = azurerm_linux_web_app.backend.default_hostname
}

output "cosmos_endpoint" {
  value = azurerm_cosmosdb_account.cosmos.endpoint
}

output "openai_endpoint" {
  value = azurerm_cognitive_account.openai.endpoint
}

output "openai_deployment_name" {
  value = azurerm_cognitive_deployment.chat.name
}
