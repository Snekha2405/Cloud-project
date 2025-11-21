resource "azurerm_cosmosdb_account" "cosmos" {
  name                = "${var.project_name}-cosmos-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  offer_type = "Standard"
  kind       = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

# SQL Database
resource "azurerm_cosmosdb_sql_database" "db" {
  name                = var.cosmos_db_name
  account_name        = azurerm_cosmosdb_account.cosmos.name
  resource_group_name = azurerm_cosmosdb_account.cosmos.resource_group_name

  throughput = 400
}

# EVENTS container
resource "azurerm_cosmosdb_sql_container" "events" {
  name                = "Events"
  account_name        = azurerm_cosmosdb_account.cosmos.name
  resource_group_name = azurerm_cosmosdb_account.cosmos.resource_group_name
  database_name       = azurerm_cosmosdb_sql_database.db.name

  partition_key_paths = ["/id"]
}

# REGISTRATIONS container
resource "azurerm_cosmosdb_sql_container" "registrations" {
  name                = "Registrations"
  account_name        = azurerm_cosmosdb_account.cosmos.name
  resource_group_name = azurerm_cosmosdb_account.cosmos.resource_group_name
  database_name       = azurerm_cosmosdb_sql_database.db.name

  partition_key_paths = ["/eventId"]
}

# USERS container
resource "azurerm_cosmosdb_sql_container" "users" {
  name                = "Users"
  account_name        = azurerm_cosmosdb_account.cosmos.name
  resource_group_name = azurerm_cosmosdb_account.cosmos.resource_group_name
  database_name       = azurerm_cosmosdb_sql_database.db.name

  partition_key_paths = ["/email"]
}
