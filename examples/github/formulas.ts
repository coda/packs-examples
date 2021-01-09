import type {FetchRequest} from 'packs-sdk';
import type {GenericSyncTable} from 'packs-sdk';
import {GitHubReviewEvent} from './types';
import type {PackFormulas} from 'packs-sdk';
import {UserVisibleError} from 'packs-sdk';
import {makeObjectFormula} from 'packs-sdk';
import {makeStringParameter} from 'packs-sdk';
import {apiUrl} from './helpers';
import {makeSimpleAutocompleteMetadataFormula} from 'packs-sdk';
import {parsePullUrl} from './helpers';
import * as schemas from './schemas';

// A parameter the identifies a PR to review using its url.
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
          return result.body;
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
        {params: ['https://github.com/kr-project/packs-examples/pull/123', 'COMMENT', 'Some comment'], result: 'TODO'},
      ],
    }),
  ],
};

export const syncTables: GenericSyncTable[] = [
  // Sync table definitions go here, e.g.
  // makeSyncTable({...}),
];
