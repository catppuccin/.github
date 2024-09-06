#!/usr/bin/env -S deno run --allow-net

import { Octokit } from "https://esm.sh/@octokit/core@6.1.2";
import { paginateGraphQL } from "https://esm.sh/@octokit/plugin-paginate-graphql@5.2.2";
import { z } from "https://esm.sh/zod@3.23.8";

if (Deno.args.length < 1) {
  console.error(
    "Please provide your GitHub personal access token as an argument."
  );
  Deno.exit(1);
}

// Unsure how to properly code-generate the types and have it play nice with
// @ocotokit/plugin-paginate-graphql so zod should be fine for a simple script
// like this.
const ruleSchema = z.object({
  type: z.string(),
});

const rulesetSchema = z.object({
  name: z.string(),
  rules: z.object({
    nodes: z.array(ruleSchema),
  }),
});

const repositorySchema = z
  .object({
    name: z.string(),
    isPrivate: z.boolean(),
    isArchived: z.boolean(),
    rulesets: z.object({
      nodes: z.array(rulesetSchema),
    }),
  })
  .strict();
type Repository = z.infer<typeof repositorySchema>;

const repositoriesSchema = z.object({
  nodes: z.array(repositorySchema),
});

const organisationSchema = z.object({
  repositories: repositoriesSchema,
});

const responseSchema = z.object({
  organization: organisationSchema,
});

const PaginatedOctokit = Octokit.plugin(paginateGraphQL);
const octokit = new PaginatedOctokit({
  auth: Deno.args[0],
});

const iterator = octokit.graphql.paginate.iterator(
  `query($cursor: String) {
    organization(login: "catppuccin") {
      repositories(first: 100, after: $cursor) {
        nodes {
          name
          isPrivate
          isArchived
          rulesets(first: 3) {
            nodes {
              name
              rules(first: 3) {
                nodes {
                  type
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }`
);

async function* yieldRepositoryRulesets() {
  for await (const response of iterator) {
    const responseData = await responseSchema.parseAsync(response);
    yield responseData.organization.repositories.nodes;
  }
}

const fetchRepositoryRulesets = async (): Promise<Repository[]> => {
  return (await Array.fromAsync(await yieldRepositoryRulesets()))
    .flat()
    .filter((repo) => !repo.isPrivate && !repo.isArchived);
};

// const displayRepositoryRulesets = (repos: Repository[]) => {
//   for (const repo of repos) {
//     const repoName = repo.name;
//     const rulesets = repo.rulesets.nodes;

//     console.log(`Rulesets for repository "${repoName}":`);
//     rulesets.forEach((ruleset) => {
//       console.log(
//         `  - Ruleset: ${ruleset.name} (${ruleset.rules.nodes
//           .map((rule) => rule.type)
//           .join(", ")})`
//       );
//     });
//     console.log("\n ");
//   }
// };

try {
  const repositoryRulesets = await fetchRepositoryRulesets();
  console.log(JSON.stringify(repositoryRulesets, null, 2));
} catch (error) {
  console.error(`Error: ${error}`);
}
