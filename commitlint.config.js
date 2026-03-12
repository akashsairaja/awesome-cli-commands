export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New commands, recipes, agents, skills, rules
        "fix", // Fix incorrect data, typos, broken references
        "docs", // README, CONTRIBUTING, templates
        "chore", // CI, configs, deps
        "refactor", // Restructure data without changing content
        "style", // Formatting, whitespace
      ],
    ],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [0, "always"], // Disable — commit bodies can be long
  },
};
