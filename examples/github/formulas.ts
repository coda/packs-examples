import type {Continuation} from 'packs-sdk';
import type {FetchRequest} from 'packs-sdk';
import type {GenericSyncTable} from 'packs-sdk';
import type {GitHubRepo} from './types';
import {GitHubReviewEvent} from './types';
import type {PackFormulas} from 'packs-sdk';
import {PullRequestReviewResponse} from './types';
import {PullRequestStateFilter} from './types';
import {UserVisibleError} from 'packs-sdk';
import {makeObjectFormula} from 'packs-sdk';
import {makeStringParameter} from 'packs-sdk';
import {apiUrl} from './helpers';
import {autocompleteSearchObjects} from 'packs-sdk';
import {getPullRequests} from './helpers';
import {getRepos} from './helpers';
import {makeMetadataFormula} from 'packs-sdk';
import {makeSimpleAutocompleteMetadataFormula} from 'packs-sdk';
import {makeSyncTable} from 'packs-sdk';
import {parsePullUrl} from './helpers';
import * as schemas from './schemas';

// A parameter that identifies a PR to review using its url.
const pullRequestUrlParameter = makeStringParameter(
  'pullRequestUrl',
  'The URL of the pull request. For example, "https://github.com/[org]/[repo]/pull/[id]".',
);

// A parameter that indicates what action to take on the review.
const pullRequestReviewActionTypeParameter = makeStringParameter(
  'actionType',
  'Type of review action. One of Approve, Comment or Request Changes',
  {
    // Since there are only an enumerated set of valid values that GitHub
    // allows, we add an autocomplete function to populate a searchable
    // dropdown in the Coda UI. This helper function generates an autocomplete
    // formula when there is a hardcoded set of options. The `display` value
    // will be shown to users in the UI, while the `value` will be what is
    // passed to the formula.
    autocomplete: makeSimpleAutocompleteMetadataFormula([
      {display: 'Approve', value: GitHubReviewEvent.Approve},
      {display: 'Comment', value: GitHubReviewEvent.Comment},
      {display: 'Request Changes', value: GitHubReviewEvent.RequestChanges},
    ]),
  },
);

// Free-form text to be included as the review comment, if this is a Comment or Request Changes action.
const pullRequestReviewCommentParameter = makeStringParameter(
  'comment',
  'Comment for review. Required if review action type is Comment or Request Changes.',
  {optional: true},
);

export const formulas: PackFormulas = {
  GitHub: [
    // We use makeObjectFormula because this formula will return a structured object with multiple pieces of
    // data about the submitted rview.
    makeObjectFormula({
      name: 'ReviewPullRequest',
      description: 'Review a pull request.',
      async execute([pullRequestUrl, actionType, comment], context) {
        if (actionType !== GitHubReviewEvent.Approve && !comment) {
          // You can throw a UserVisibleError at any point in a formula to provide an error message
          // to be displayed to the user in the UI.
          throw new UserVisibleError('Comment parameter must be provided for Comment or Request Changes actions.');
        }

        const payload = {body: comment, event: actionType};
        const {owner, repo, pullNumber} = parsePullUrl(pullRequestUrl);
        const request: FetchRequest = {
          method: 'POST',
          url: apiUrl(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`),
          body: JSON.stringify(payload),
        };

        try {
          const result = await context.fetcher.fetch(request);
          // The response is useful to return almost as-is. Our schema definition in the `response` property
          // below will re-map some fields to clearer names and remove extraneous properties without us having
          // to do that manually in code here though.
          return result.body as PullRequestReviewResponse;
        } catch (e) {
          if (e.statusCode === 422) {
            // Some http errors are common usage mistakes that we wish to surface to the user in a clear
            // way, so we detect those and re-map them to user-visible errors, rather than letting
            // these fall through as uncaught errors.
            if (e.message.includes('Can not approve your own pull request')) {
              throw new UserVisibleError('Can not approve your own pull request');
            } else if (e.message.includes('Can not request changes on your own pull request')) {
              throw new UserVisibleError('Can not request changes on your own pull request');
            }
          }

          throw e;
        }
      },
      response: {
        schema: schemas.pullRequestReviewResponseSchema,
        // Since we returned GitHub's response body as-is, this declares that we wish any response property
        // that is not explicitly declared in our schema to removed from the response. This keeps responses
        // manageable and understandable, filtering out extraneous fields that may be confusing or unhelpful
        // to the user.
        excludeExtraneous: true,
      },
      network: {
        // This formula has a side effect: it changes the status of PR in GitHub.
        // Declaring this means this formula will be made available as a button action
        // in the Coda UI.
        hasSideEffect: true,
        // This formula requires a user account.
        requiresConnection: true,
      },
      parameters: [pullRequestUrlParameter, pullRequestReviewActionTypeParameter, pullRequestReviewCommentParameter],
      examples: [
        {
          params: ['https://github.com/kr-project/packs-examples/pull/123', 'COMMENT', 'Some comment'],
          result: {
            Id: 12345,
            User: {
              Login: 'someuser',
              Id: 98765,
              Avatar: 'https://avatars2.githubusercontent.com/u/12345',
              Url: 'https://github.com/someuser',
            },
            Body: 'Some comment',
            State: 'COMMENTED',
            Url: 'https://github.com/kr-project/packs-examples/pull/123',
            CommitId: 'ff3d90e1d62c37b93994078fad0dad37d3e',
          },
        },
      ],
    }),
  ],
};

// A parameter that identifies a repo to sync data from using the repo's url.
// For each sync configuration, the user must select a single repo from which to sync, since GitHub's API
// does not return entities across repos. However, a user can set up multiple sync configurations
// and each one can individually sync from a separate repo.
// (This is exported so that we can unittest the autocomplete formula.)
export const repoUrlParameter = makeStringParameter(
  'repoUrl',
  'The URL of the repository to list pull requests from. For example "https://github.com/[org]/[repo]".',
  {
    // This autocomplete formula will list all of the repos that the current user has access to
    // and expose them as a searchable dropdown in the UI.
    // It fetches the GitHub repo objects and then runs a simple text search over the repo name.
    autocomplete: makeMetadataFormula(async (context, search) => {
      let results: GitHubRepo[] = [];
      let continuation: Continuation | undefined;
      do {
        const response = await getRepos(context, continuation);
        results = results.concat(...response.result);
        ({continuation} = response);
      } while (continuation && continuation.nextUrl);
      // This helper function can implement most autocomplete use cases. It takes the user's current
      // search (if any) and an array of arbitrary objects. The final arguments are the property name of
      // a label field to search over, and finally the property name that should be used as the value
      // when a user selects a result.
      // So here, this is saying "search the `name` field of reach result, and use the html_url as the
      // value once selected".
      return autocompleteSearchObjects(search, results, 'name', 'html_url');
    }),
  },
);

const baseParameterOptional = makeStringParameter('base', 'The name of the base branch. For example, "master".', {
  optional: true,
});

const pullRequestStateOptional = makeStringParameter(
  'state',
  'Returns pull requests in the given state. If unspecified, defaults to "open".',
  {
    optional: true,
    autocomplete: makeSimpleAutocompleteMetadataFormula([
      {display: 'Open pull requests only', value: PullRequestStateFilter.Open},
      {display: 'Closed pull requests only', value: PullRequestStateFilter.Closed},
      {display: 'All pull requests', value: PullRequestStateFilter.All},
    ]),
  },
);

export const syncTables: GenericSyncTable[] = [
  makeSyncTable(
    // This is the name of the sync table, which will show in the UI.
    'PullRequests',
    // This is the schema of a single entity (row) being synced. The formula that implements
    // this sync must return an array of objects matching this schema. Each such object
    // will be a row in the resulting table.
    schemas.pullRequestSchema,
    {
      // This is the name of the formula that implements the sync. By convention it should be the
      // same as the name of the sync table. This will be removed in a future version of the SDK.
      name: 'PullRequests',
      // A description to show in the UI.
      description: 'Sync pull requests from GitHub.',
      // The implementation of the sync, which must return an array of objects that fit
      // the pullRequestSchema above, representing a single page of results, and optionally a
      // `continuation` if there are subsequent pages of results to fetch.
      execute: (params, context) => getPullRequests(params, context, context.sync.continuation),
      // Sync table formulas don't require examples, as these formulas are called internally
      // by the sync infrastructure, so these examples won't be shown to users.
      // This will be removed in a future version of the SDK.
      examples: [],
      network: {
        // A sync is a read-only action so there are no side effects.
        hasSideEffect: false,
        // Syncing from GitHub obviously requires a user account to be configured and selected.
        requiresConnection: true,
      },
      parameters: [repoUrlParameter, baseParameterOptional, pullRequestStateOptional],
    },
  ),
];
