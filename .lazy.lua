return {
  {
    "stevearc/conform.nvim",
    opts = {
      -- Define your formatters
      formatters_by_ft = {
        vue = { "volar", "eslint_d" },
        typescript = { "typescript", "eslint_d" },
        javascript = { "typescript", "eslint_d" },
        typescriptreact = { "typescript", "eslint_d" },
        javascriptreact = { "typescript", "eslint_d" },
      },
    },
  },
  {
    "laytan/tailwind-sorter.nvim",
    on_save_pattern = { "*.html", "*.jsx", "*.tsx", "*.vue" },
  },
}
