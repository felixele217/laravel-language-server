# Installation

1. Clone this repository
2. Start language server in your .config/nvim/after/ftplugin/php.lua
```
vim.lsp.start {
  name = 'laravel-language-server',
  cmd = {
    'npx',
    'ts-node',
    // path to where you cloned this repository
    vim.fn.expand '~/code/laravel-language-server/server/src/server.ts',
  },
  capabilities = vim.lsp.protocol.make_client_capabilities(),
  settings = {},
  init_options = {}, -- also tried vim.empty_dict()
  root_dir = vim.fn.getcwd(), -- also tried vim.empty_dict()
}
```
3. Run :checkhealth vim.lsp in a PHP File to see if it works! :)
