import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as schemas from "./schemas";
import * as types from "./types";

export const pack = coda.newPack();

// This tells Coda which domain the pack make requests to. Any fetcher
// requests to other domains won't be allowed.
pack.addNetworkDomain("github.com");

// The GitHub pack uses OAuth authentication, to allow each user to login
// to GitHub via the browser when installing the pack. The pack will
// operate on their personal data.
pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  // As outlined in https://docs.github.com/en/free-pro-team@latest/developers/apps/authorizing-oauth-apps,
  // these are the urls for initiating OAuth authentication and doing
  // token exchange.
  authorizationUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  // When making authorized http requests, most services ask you to pass
  // a header of this form:
  // `Authorization: Bearer <OAUTH-TOKEN>`
  // but GitHub asks you use:
  // `Authorization: token <OAUTH-TOKEN>`
  // so we specify a non-default tokenPrefix here.
  tokenPrefix: "token",
  // These are the GitHub-specific scopes the user will be prompted to
  // authorize in order for the functionality in this pack to succeed.
  scopes: ["read:user", "repo"],
  // This is a simple formula that makes an API call to GitHub to find
  // the name of the user associated with the OAuth access token. This
  // name is used to label the Coda account connection associated with
  // these credentials throughout the Coda UI. For example, a user may
  // connect both a personal GitHub account and a work GitHub account to
  // Coda, and this formula will help those accounts be clearly labeled
  // in Coda without direct input from the user.
  getConnectionName: helpers.getConnectionName,
});

// A parameter that identifies a PR to review using its url.
const PullRequestUrlParameter = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "pullRequestUrl",
  description:
    'The URL of the pull request. For example, "https://github.com/[org]/[repo]/pull/[id]".',
});

// A parameter that indicates what action to take on the review.
const PullRequestReviewActionTypeParameter = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "actionType",
  description:
    "Type of review action. One of Approve, Comment or Request Changes",
  // Since there are only an enumerated set of valid values that GitHub
  // allows, we add an autocomplete function to populate a searchable
  // dropdown in the Coda UI. We can provided a hardcoded set of
  // options. The `display` value will be shown to users in the UI,
  // while the `value` will be what is passed to the formula.
  autocomplete: [
    {display: "Approve", value: types.GitHubReviewEvent.Approve},
    {display: "Comment", value: types.GitHubReviewEvent.Comment},
    {display: "Request Changes", value: types.GitHubReviewEvent.RequestChanges},
  ],
});

// Free-form text to be included as the review comment, if this is a Comment
// or Request Changes action.
const PullRequestReviewCommentParameter = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "comment",
  description:
    "Comment for review. Required if review action type is Comment or Request Changes.",
  optional: true,
});

// We use makeObjectFormula because this formula will return a structured
// object with multiple pieces of data about the submitted rview.
pack.addFormula({
  resultType: coda.ValueType.Object,
  name: "ReviewPullRequest",
  description: "Review a pull request.",
  schema: schemas.PullRequestReviewResponseSchema,
  // This formula is an action: it changes the status of PR in GitHub.
  // Declaring this means this formula will be made available as a button action
  // in the Coda UI.
  isAction: true,
  parameters: [
    PullRequestUrlParameter,
    PullRequestReviewActionTypeParameter,
    PullRequestReviewCommentParameter,
  ],
  execute: async function ([pullRequestUrl, actionType, comment], context) {
    if (actionType !== types.GitHubReviewEvent.Approve && !comment) {
      // You can throw a UserVisibleError at any point in a formula to provide
      // an error message to be displayed to the user in the UI.
      throw new coda.UserVisibleError(
        "Comment parameter must be provided for Comment or Request Changes actions.",
      );
    }

    let payload = {body: comment, event: actionType};
    let {owner, repo, pullNumber} = helpers.parsePullUrl(pullRequestUrl);
    let request: coda.FetchRequest = {
      method: "POST",
      url: helpers.apiUrl(
        `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
      ),
      body: JSON.stringify(payload),
    };

    try {
      let result = await context.fetcher.fetch(request);
      // The response is useful to return almost as-is. Our schema definition
      // above will re-map some fields to clearer names and remove extraneous
      // properties without us having to do that manually in code here though.
      return result.body as types.PullRequestReviewResponse;
    } catch (e: any) {
      if (e.statusCode === 422) {
        // Some http errors are common usage mistakes that we wish to surface to
        // the user in a clear way, so we detect those and re-map them to
        // user-visible errors, rather than letting these fall through as
        // uncaught errors.
        if (e.message.includes("Can not approve your own pull request")) {
          throw new coda.UserVisibleError(
            "Can not approve your own pull request",
          );
        } else if (
          e.message.includes("Can not request changes on your own pull request")
        ) {
          throw new coda.UserVisibleError(
            "Can not request changes on your own pull request",
          );
        }
      }
      throw e;
    }
  },
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
pack.addFormula({
  name: "UserEmail",
  description:
    "Returns the primary email address used on this user's GitHub account.",
  resultType: coda.ValueType.String,
  // This formula will need this additional OAuth permission to get the email
  // address of the user.
  extraOAuthScopes: ["user:email"],
  parameters: [],
  execute: async function ([_index], context) {
    let request: coda.FetchRequest = {
      method: "GET",
      url: helpers.apiUrl("/user/emails"),
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
});

// A parameter that identifies a repo to sync data from using the repo's url.
// For each sync configuration, the user must select a single repo from which
// to sync, since GitHub's API does not return entities across repos
// However, a user can set up multiple sync configurations
// and each one can individually sync from a separate repo.
// (This is exported so that we can unittest the autocomplete formula.)
export const RepoUrlParameter = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "repoUrl",
  description:
    'The URL of the repository to list pull requests from. For example, "https://github.com/[org]/[repo]".',
  // This autocomplete formula will list all of the repos that the current
  // user has access to and expose them as a searchable dropdown in the UI.
  // It fetches the GitHub repo objects and then runs a simple text search
  // over the repo name.
  autocomplete: async (context, search) => {
    let results: types.GitHubRepo[] = [];
    let continuation: coda.Continuation | undefined;
    do {
      let response = await helpers.getRepos(context, continuation);
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
    return coda.autocompleteSearchObjects(search, results, "name", "html_url");
  },
});

const BaseParameterOptional = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "base",
  description: 'The name of the base branch. For example, "main".',
  optional: true,
});

const PullRequestStateOptional = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "state",
  description:
    'Returns pull requests in the given state. If unspecified, defaults to "open".',
  optional: true,
  autocomplete: [
    {
      display: "Open pull requests only",
      value: types.PullRequestStateFilter.Open,
    },
    {
      display: "Closed pull requests only",
      value: types.PullRequestStateFilter.Closed,
    },
    {display: "All pull requests", value: types.PullRequestStateFilter.All},
  ],
});

pack.addSyncTable({
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
  schema: schemas.PullRequestSchema,
  formula: {
    // This is the name of the formula that implements the sync. By convention
    // it should be the same as the name of the sync table. This will be
    // removed in a future version of the SDK.
    name: "PullRequests",
    // A description to show in the UI.
    description: "Sync pull requests from GitHub.",
    parameters: [
      RepoUrlParameter,
      BaseParameterOptional,
      PullRequestStateOptional,
    ],
    // The implementation of the sync, which must return an array of objects
    // that fit the pullRequestSchema above, representing a single page of
    // results, and optionally a `continuation` if there are subsequent pages
    // of results to fetch.
    execute: async function (params, context) {
      return helpers.getPullRequests(params, context);
    },
  },
});
