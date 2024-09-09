#!/usr/bin/env -S deno run --no-lock --allow-read --allow-write --allow-net

import {
  updateReadme,
  validateYaml,
} from "https://deno.land/x/catppuccin_toolbox@deno-lib-v1.0.0/deno-lib/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

import governanceSchema from "@/governance.schema.json" with { type: "json" };
import type { GovernanceSchema, LeadershipTeam } from "@/governance.d.ts";
import { CurrentMembers } from "@/governance.d.ts";
import { PastMembers } from "@/governance.d.ts";

const root = new URL(".", import.meta.url).pathname;
const governanceYaml = await Deno.readTextFile(join(root, "./governance.yml"));
const governanceData = await validateYaml<GovernanceSchema>(
  governanceYaml,
  governanceSchema,
);

const generateMemberTable = (
  members: CurrentMembers | PastMembers,
  title: string,
): string => {
  const tableRows = members
    .map((member) => {
      return `    <td align="center"><a href="${member.url}"><img src="${member.url}.png" width="100px;" alt=""/><br /><sub><b>${member.name}</b></sub></a><br /></td>`;
    })
    .join("\n");

  return `<table>
  <tr>
    <th colspan="${members.length}" align="center"><h4>${title}</h4></th>
  </tr>
  <tr>
${tableRows}
  </tr>
</table>`;
};

const generateTeamSection = (team: LeadershipTeam): string => {
  const currentMembers = team["current-members"];
  const pastMembers = team["past-members"];
  const currentMembersTable = generateMemberTable(
    currentMembers,
    "Current Members",
  );
  const pastMembersTable = generateMemberTable(pastMembers, "Past Members");

  return `### ${team.name}

**${team.description}**

${team.responsibilities}

${currentMembersTable}
${pastMembers.length > 0 ? `${pastMembersTable}` : ""}
`;
};

const leadershipMarkdown = governanceData.leadership
  .map(generateTeamSection)
  .join("\n");

const governancePath = join(root, "../GOVERNANCE.md");
let governanceContent = await Deno.readTextFile(governancePath);
governanceContent = await updateReadme(governanceContent, leadershipMarkdown, {
  section: "LEADERSHIP",
});
await Deno.writeTextFile(governancePath, governanceContent);
