<div align="center">
  <h2>🛡️ GitHub Rulesets</h2>
  <p>Increasing visibility of contributions across the organisation</p>
</div>

### What are rulesets?

GitHub rulesets allow control over how people interact with Catppuccin's
repositories, involving restrictions on deleting branches, force pushing the
default branch, and much more. To learn more about what rulesets offer, see
"[About rulesets - GitHub
Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)."

### What rulesets will Catppuccin apply?

| Ruleset                                                    | Description                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [Block Force Push](rulesets/block-force-push.json)         | Block any force push to the default branch.                                                                  |
| [Require Pull Request](rulesets/require-pull-request.json) | Require a pull request to be created against the default branch.<br/>(Excluding organisation administrators) |

### Why are these rulesets being applied?

We want to **increase the visibility of contributions across the organisation**.
The Catppuccin Discord server has `#github` channel which sends a message when a
pull request is raised on any repository. Enforcing pull requests means that the
visibility of the contribution is extended past just the people watching the
repository, but also people in the active Discord community.

Naturally, this results in more people looking at the pull request, giving
helpful suggestions/opinions, and even reducing the chance of malicious or
unwanted commits being merged into the default branch.

### How will these rulesets be applied?

#### Automated Script

The preferred method of applying these rulesets will be through a script making
use of the [GraphQL `createRepositoryRuleset`
Mutation](https://docs.github.com/en/graphql/reference/mutations#createrepositoryruleset),
however, there are some considerations to keep in mind which are listed below:

1. A non-zero amount of repositories already contain these rulesets, so the
   script needs to be robust in order to handle rulesets with the same name. Also,
   the same rules may exist in a single ruleset or under different names so
   existing rulesets should be vetted. I'd imagine the
   [`updateRepositoryRuleset`](https://docs.github.com/en/graphql/reference/mutations#updaterepositoryruleset)
   and
   [`deleteRepositoryRuleset`](https://docs.github.com/en/graphql/reference/mutations#deleterepositoryruleset)
   mutations will be needed here.
2. Some repositories, such as
   [catppuccin/jetbrains-icons](https://github.com/catppuccin/jetbrains-icons) and
   [catppuccin/jetbrains](https://github.com/catppuccin/jetbrains), rely on the
   ability to push directly to the default branch as part of their CI/CD release
   workflows. These repositories need their CI/CD updated to use a `PAT` for the
   cloning of the repository before the `Require Pull Request` ruleset can be
   applied.

The script (yet to be created) should account for the considerations listed
above. In the meantime, the [Manual](#manual) instructions can be used to easily import
the rulesets via the user interface.

#### Manual

1. Download the files located within the [rulesets/](rulesets) directory.
2. Navigate to the GitHub repository you'd like to apply the rules on.
3. Follow instructions outlined in "[Importing a ruleset - GitHub
   Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository#importing-a-ruleset)"
   to import your ruleset.
4. Save your ruleset.
