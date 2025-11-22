resource "azurerm_cognitive_account" "openai" {
  name                = "${var.project_name}-aoai-${var.environment}"
  location            = "eastus"   # 👈 Azure OpenAI supported region
  resource_group_name = azurerm_resource_group.rg.name

  kind     = "OpenAI"
  sku_name = "S0"
}


resource "azurerm_cognitive_deployment" "chat" {
  name                 = "gpt-35-turbo"   # deployment name must match your server.js
  cognitive_account_id = azurerm_cognitive_account.openai.id

  model {
    name   = "gpt-35-turbo"
    format = "OpenAI"
  }

  sku {
    name = "Standard"
  }
}
