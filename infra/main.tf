# Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "${var.project_name}-rg-${var.environment}"
  location = var.location
}

# App Service Plan (Linux)
resource "azurerm_service_plan" "plan" {
  name                = "${var.project_name}-plan-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  os_type  = "Linux"
  sku_name = "B1" # Basic tier; change to S1/P1v3 etc. for production
}

# Web App for Node backend
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-api-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  https_only = true

  site_config {
    minimum_tls_version = "1.2"

    application_stack {
      node_version = "20-lts"
    }
  }

  # App settings will be filled after Cosmos & OpenAI are defined
  app_settings = {
    "NODE_ENV" = var.environment
    "PORT"     = "3000"
    # Cosmos DB (your server.js uses COSMOS_URI, COSMOS_KEY, COSMOS_DBNAME)
    "COSMOS_URI"    = azurerm_cosmosdb_account.cosmos.endpoint
    "COSMOS_KEY"    = azurerm_cosmosdb_account.cosmos.primary_key
    "COSMOS_DBNAME" = azurerm_cosmosdb_sql_database.db.name

    # Azure OpenAI (your server.js uses ENDPOINT, APIKEY, DEPLOYMENT, APIVERSION)
    "ENDPOINT"   = azurerm_cognitive_account.openai.endpoint
    "APIKEY"     = azurerm_cognitive_account.openai.primary_access_key
    "DEPLOYMENT" = azurerm_cognitive_deployment.chat.name
    "APIVERSION" = "2024-02-15-preview"
  }
}
