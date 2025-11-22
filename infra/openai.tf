resource "azurerm_cognitive_account" "openai" {
  count               = var.enable_openai ? 1 : 0

  name                = "${var.project_name}-aoai-${var.environment}"
  location            = "eastus"
  resource_group_name = azurerm_resource_group.rg.name

  kind     = "OpenAI"
  sku_name = "S0"
}

resource "azurerm_cognitive_deployment" "chat" {
  count                = var.enable_openai ? 1 : 0

  name                 = "gpt-35-turbo"
  cognitive_account_id = azurerm_cognitive_account.openai[0].id

  model {
    name   = "gpt-35-turbo"
    format = "OpenAI"
  }

  sku {
    name = "Standard"
  }
}
