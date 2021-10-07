import {ConnectionRequirement} from "@codahq/packs-sdk";
import type {Continuation} from "@codahq/packs-sdk";
import type {FetchRequest} from "@codahq/packs-sdk";
import type {Formula} from "@codahq/packs-sdk";
import type {GenericSyncTable} from "@codahq/packs-sdk";
import type {GitHubRepo} from "./types";
import {GitHubReviewEvent} from "./types";
import {ParameterType} from "@codahq/packs-sdk";
import type {PullRequestReviewResponse} from "./types";
import {PullRequestStateFilter} from "./types";
import {UserVisibleError} from "@codahq/packs-sdk";
import {ValueType} from "@codahq/packs-sdk";
import {apiUrl} from "./helpers";
import {autocompleteSearchObjects} from "@codahq/packs-sdk";
import {getPullRequests} from "./helpers";
import {getRepos} from "./helpers";
import {makeFormula} from "@codahq/packs-sdk";
import {makeMetadataFormula} from "@codahq/packs-sdk";
import {makeParameter} from "@codahq/packs-sdk";
import {makeSimpleAutocompleteMetadataFormula} from "@codahq/packs-sdk";
import {makeSyncTable} from "@codahq/packs-sdk";
import {parsePullUrl} from "./helpers";
import * as schemas from "./schemas";

// A parameter that identifies a PR to review using its url.
const pullRequestUrlParameter = makeParameter({
  type: ParameterType.String,
  name: "pullRequestUrl",
  description:
    'The URL of the pull request. For example, "https://github.com/[org]/[repo]/pull/[id]".',
});

// A parameter that indicates what action to take on the review.
const pullRequestReviewActionTypeParameter = makeParameter({
  type: ParameterType.String,
  name: "actionType",
  description:
    "Type of review action. One of Approve, Comment or Request Changes",
  // Since there are only an enumerated set of valid values that GitHub
  // allows, we add an autocomplete function to populate a searchable
  // dropdown in the Coda UI. This helper function generates an autocomplete
  // formula when there is a hardcoded set of options. The `display` value
  // will be shown to users in the UI, while the `value` will be what is
  // passed to the formula.
  autocomplete: makeSimpleAutocompleteMetadataFormula([
    {display: "Approve", value: GitHubReviewEvent.Approve},
    {display: "Comment", value: GitHubReviewEvent.Comment},
    {display: "Request Changes", value: GitHubReviewEvent.RequestChanges},
  ]),
});

// Free-form text to be included as the review comment, if this is a Comment
// or Request Changes action.
const pullRequestReviewCommentParameter = makeParameter({
  type: ParameterType.String,
  name: "comment",
  description:
    "Comment for review. Required if review action type is Comment or Request Changes.",
  optional: true,
});

// We use makeObjectFormula because this formula will return a structured
// object with multiple pieces of data about the submitted rview.
const reviewPullRequestFormula = makeFormula({
  resultType: ValueType.Object,
  name: "ReviewPullRequest",
  description: "Review a pull request.",
  schema: schemas.pullRequestReviewResponseSchema,
  execute: async function ([pullRequestUrl, actionType, comment], context) {
    if (actionType !== GitHubReviewEvent.Approve && !comment) {
      // You can throw a UserVisibleError at any point in a formula to provide
      // an error message to be displayed to the user in the UI.
      throw new UserVisibleError(
        "Comment parameter must be provided for Comment or Request Changes actions.",
      );
    }

    let payload = {body: comment, event: actionType};
    let {owner, repo, pullNumber} = parsePullUrl(pullRequestUrl);
    let request: FetchRequest = {
      method: "POST",
      url: apiUrl(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`),
      body: JSON.stringify(payload),
    };

    try {
      let result = await context.fetcher.fetch(request);
      // The response is useful to return almost as-is. Our schema definition
      // above will re-map some fields to clearer names and remove extraneous
      // properties without us having to do that manually in code here though.
      return result.body as PullRequestReviewResponse;
    } catch (e: any) {
      if (e.statusCode === 422) {
        // Some http errors are common usage mistakes that we wish to surface to
        // the user in a clear way, so we detect those and re-map them to
        // user-visible errors, rather than letting these fall through as
        // uncaught errors.
        if (e.message.includes("Can not approve your own pull request")) {
          throw new UserVisibleError("Can not approve your own pull request");
        } else if (
          e.message.includes("Can not request changes on your own pull request")
        ) {
          throw new UserVisibleError(
            "Can not request changes on your own pull request",
          );
        }
      }
      throw e;
    }
  },
  // This formaula requires a user account.
  connectionRequirement: ConnectionRequirement.Required,
  // This formula is an action: it changes the status of PR in GitHub.
  // Declaring this means this formula will be made available as a button action
  // in the Coda UI.
  isAction: true,
  parameters: [
    pullRequestUrlParameter,
    pullRequestReviewActionTypeParameter,
    pullRequestReviewCommentParameter,
  ],
  examples: [
    {
      params: [
        "https://github.com/coda/packs-examples/pull/123",
        "COMMENT",
        "Some comment",
      ],
      result: {
        Id: 12345,
        User: {
          Login: "someuser",
          Id: 98765,
          Avatar: "https://avatars2.githubusercontent.com/u/12345",
          Url: "https://github.com/someuser",
        },
        Body: "Some comment",
        State: "COMMENTED",
        Url: "https://github.com/coda/packs-examples/pull/123",
        CommitId: "ff3d90e1d62c37b93994078fad0dad37d3e",
      },
    },
  ],
});

// This formula demonstrates the use of incremental/progressive OAuth scopes.
// Calling this formula requires more permissions from GitHub than the pack
// requests at its initial installation, and Coda will guide a user through
// an additional authorization when they try to use a formula with greater
// permissions like this and get an error.
const getUserFormula = makeFormula({
  name: "UserEmail",
  description:
    "Returns the primary email address used on this user's GitHub account.",
  resultType: ValueType.String,
  // This formula will need this additional OAuth permission to get the email
  // address of the user.
  extraOAuthScopes: ["user:email"],
  parameters: [],
  execute: async function ([_index], context) {
    let request: FetchRequest = {
      method: "GET",
      url: apiUrl("/user/emails"),
    };
    // If this fetch is attempted without the extra OAuth scope, GitHub will
    // give a 404 error, which will bubble up to Coda because there is no
    // try/catch on this fetch. When Coda sees an error from a formula like
    // that, it looks at the scopes the user is currently authenticated with
    // compared to what scopes are requested by the pack's manifest and the
    // formula. Here, Coda will see the extraOAuthScopes field on this
    // formula and replace the 404 error with an instruction to the user
    // to sign in again.
    let result = await context.fetcher.fetch(request);
    // Return only the one email marked as primary.
    return result.body.find((emailObject: any) => emailObject.primary).email;
  },
  connectionRequirement: ConnectionRequirement.Required,
});

export const formulas: Formula[] = [reviewPullRequestFormula, getUserFormula];

// A parameter that identifies a repo to sync data from using the repo's url.
// For each sync configuration, the user must select a single repo from which
// to sync, since GitHub's API does not return entities across repos
// However, a user can set up multiple sync configurations
// and each one can individually sync from a separate repo.
// (This is exported so that we can unittest the autocomplete formula.)
export const repoUrlParameter = makeParameter({
  type: ParameterType.String,
  name: "repoUrl",
  description:
    'The URL of the repository to list pull requests from. For example, "https://github.com/[org]/[repo]".',
  // This autocomplete formula will list all of the repos that the current
  // user has access to and expose them as a searchable dropdown in the UI.
  // It fetches the GitHub repo objects and then runs a simple text search
  // over the repo name.
  autocomplete: makeMetadataFormula(async (context, search) => {
    let results: GitHubRepo[] = [];
    let continuation: Continuation | undefined;
    do {
      let response = await getRepos(context, continuation);
      results = results.concat(...response.result);
      ({continuation} = response);
    } while (continuation && continuation.nextUrl);
    // This helper function can implement most autocomplete use cases. It
    // takes the user's current search (if any) and an array of arbitrary
    // objects. The final arguments are the property name of a label field to
    // search over, and finally the property name that should be used as the
    // value when a user selects a result.
    // So here, this is saying "search the `name` field of reach result, and
    // use the html_url as the value once selected".
    return autocompleteSearchObjects(search, results, "name", "html_url");
  }),
});

const baseParameterOptional = makeParameter({
  type: ParameterType.String,
  name: "base",
  description: 'The name of the base branch. For example, "main".',
  optional: true,
});

const pullRequestStateOptional = makeParameter({
  type: ParameterType.String,
  name: "state",
  description:
    'Returns pull requests in the given state. If unspecified, defaults to "open".',
  optional: true,
  autocomplete: makeSimpleAutocompleteMetadataFormula([
    {display: "Open pull requests only", value: PullRequestStateFilter.Open},
    {
      display: "Closed pull requests only",
      value: PullRequestStateFilter.Closed,
    },
    {display: "All pull requests", value: PullRequestStateFilter.All},
  ]),
});

export const syncTables: GenericSyncTable[] = [
  makeSyncTable({
    // This is the name of the sync table, which will show in the UI.
    name: "PullRequests",
    // This the unique id of the table, used internally. By convention, it's
    // often the singular form the display name defined right above.
    // Other sync tables and formulas can return references to rows in this
    // table, by defining an `Identity` object in their response schemas that
    // points to this value, e.g. `identity: {name: 'PullRequest'}`.
    identityName: "PullRequest",
    // This is the schema of a single entity (row) being synced. The formula
    // that implements this sync must return an array of objects matching this
    // schema. Each such object will be a row in the resulting table.
    schema: schemas.pullRequestSchema,
    formula: {
      // This is the name of the formula that implements the sync. By convention
      // it should be the same as the name of the sync table. This will be
      // removed in a future version of the SDK.
      name: "PullRequests",
      // A description to show in the UI.
      description: "Sync pull requests from GitHub.",
      // The implementation of the sync, which must return an array of objects
      // that fit the pullRequestSchema above, representing a single page of
      // results, and optionally a `continuation` if there are subsequent pages
      // of results to fetch.
      execute: (params, context) =>
        getPullRequests(params, context, context.sync.continuation),
      // Sync table formulas don't require examples, as these formulas are
      // called internally by the sync infrastructure, so these examples won't
      // be shown to users. This will be removed in a future version of the SDK.
      // Syncing from GitHub obviously requires a user account to be configured
      // and selected.
      connectionRequirement: ConnectionRequirement.Required,
      parameters: [
        repoUrlParameter,
        baseParameterOptional,
        pullRequestStateOptional,
      ],
    },
  }),
];
