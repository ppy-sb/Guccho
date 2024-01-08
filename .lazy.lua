return {
  {
    "stevearc/conform.nvim",
    event = { "BufWritePre" },
    cmd = { "ConformInfo" },
    opts = {
      -- Define your formatters
      formatters_by_ft = {
        vue = { "eslint_d" },
      },
    },
  },
}
