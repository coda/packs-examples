import type {Continuation} from 'coda-packs-sdk';
import type {ExecutionContext} from 'coda-packs-sdk';
import type {FetchRequest} from 'coda-packs-sdk';
import type {FetchResponse} from 'coda-packs-sdk';
import type {GenericSyncFormulaResult} from 'coda-packs-sdk';
import type {GitHubPullRequest} from './types';
import type {GitHubRepo} from './types';
import type {GitHubUser} from './types';
import {ensureExists} from 'coda-packs-sdk';
import {makeMetadataFormula} from 'coda-packs-sdk';
import {withQueryParams} from 'coda-packs-sdk';

const PULL_REQUEST_URL_REGEX = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;
const REPO_URL_REGEX = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)$/;

const DEFAULT_PAGE_SIZE = 100;

// This is a simple wrapper that takes a relative GitHub url and turns into an absolute url.
// We recommend having helpers to generate API urls particularly when APIs use versioned
// urls, so that if you need to update to a new version of the API it is easy to do so
// in one place. Here GitHub's API urls do not have version identifiers so this is less
// meaningful but we do so to future-proof things.
export function apiUrl(path: string, params?: Record<string, any>): string {
  const url = `https://api.github.com${path}`;
  return params ? withQueryParams(url, params) : url;
}

// This formula is used in the authentication definition in the manifest.
// It returns a simple label for the current user's account so the account
// can be identified in the UI.
export const getConnectionName = makeMetadataFormula(async context => {
  const request: FetchRequest = {
    method: 'GET',
    url: apiUrl('/user'),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await context.fetcher.fetch(request);
  return (response.body as GitHubUser).login;
});

// The user-facing formula uses a pull request url to identify PRs in a user-friendly way.
// We parse such a url into its identifiers.
export function parsePullUrl(url: string): {owner: string; repo: string; pullNumber: string} {
  const match = ensureExists(PULL_REQUEST_URL_REGEX.exec(url), 'Received an invalid pull request URL');
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3],
  };
}

// The user-facing formula uses a url to identify repos in a user-friendly way.
// We parse such a url into its identifiers.
export function parseRepoUrl(url: string): {owner: string; repo: string} {
  const match = ensureExists(REPO_URL_REGEX.exec(url), 'Received an invalid repo URL');
  return {
    owner: match[1],
    repo: match[2],
  };
}

// Get a single page of repos that the user has access to. The caller can call this repeatedly
// with a continuation if the user has access to more repos than can fit on one page (100).
export async function getRepos(context: ExecutionContext, continuation?: Continuation) {
  const url = continuation?.nextUrl
    ? (continuation.nextUrl as string)
    : apiUrl('/user/repos', {per_page: DEFAULT_PAGE_SIZE});

  const result = await context.fetcher.fetch({
    url,
    method: 'GET',
  });

  const nextUrl = nextUrlFromLinkHeader(result);
  return {
    result: result.body as GitHubRepo[],
    continuation: nextUrl ? {nextUrl} : undefined,
  };
}

// The meat of the implementation of the PullRequests sync table.
// Fetches a page of pull requests matching the given param filters, optionally returning
// a continuation indicating where to pick up to fetch a subsequent result page.
export async function getPullRequests(
  [repoUrl, base, state]: any[],
  context: ExecutionContext,
  continuation: Continuation | undefined,
): Promise<GenericSyncFormulaResult> {
  const {owner, repo} = parseRepoUrl(repoUrl);
  const params = {per_page: DEFAULT_PAGE_SIZE, base, state};
  let url = apiUrl(`/repos/${owner}/${repo}/pulls`, params);
  if (continuation) {
    url = continuation.nextUrl as string;
  }

  const response = await context.fetcher.fetch({method: 'GET', url});

  const results = response.body?.map(parsePullRequest);
  const nextUrl = nextUrlFromLinkHeader(response);
  return {result: results, continuation: nextUrl ? {nextUrl} : undefined};
}

// This does some basic transformation and unnesting of a pull request response object
// to make the response match the schema declared in schemas.ts. Most of the property name
// remapping happens automatically with the packs infrastructure because the schema declares
// `fromKey` properties in order to rename keys, so this function exists mostly to do massagin
// beyond what can be done with `fromKey`.
function parsePullRequest(pr: GitHubPullRequest) {
  return {
    ...pr,
    repo: pr.head && pr.head.repo,
    labels: (pr.labels || []).map(label => label.name),
    sourceBranch: pr.head && pr.head.ref,
    targetBranch: pr.base && pr.base.ref,
  };
}

// See if GitHub has given us the url of a next page of results.
function nextUrlFromLinkHeader(result: FetchResponse<any>): string | undefined {
  const parsedHeader = typeof result.headers.link === 'string' ? parseLinkHeader(result.headers.link) : undefined;
  if (parsedHeader && parsedHeader.next) {
    return parsedHeader.next;
  }
}

// GitHub uses the somewhat-standard `Link` http response to header to indicate if there are subsequent
// or previous result pages available. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link
// for an explanation of the format.
// GitHub's `Link` header value looks like:
// `<https://api.github.com/user/1234/repos?page=3&per_page=100>; rel="next", <https://api.github.com/user/1234/repos?page=1&per_page=100>; rel="prev"`
//  This function parses the link header and returns object matching the `rel` label to the corresponding url, in this case:
// {
//   next: '<https://api.github.com/user/1234/repos?page=3&per_page=100',
//   prev: 'https://api.github.com/user/1234/repos?page=1&per_page=100',
// }
// The npm library `parse-link-header` is useful for this purpose: https://www.npmjs.com/package/parse-link-header
// We haven't used it here for simplicity of dependencies in this repo, but it may well be helpful in your own packs.
function parseLinkHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  const parts = header.split(/,\s*/);
  parts.map(part => {
    const match = part.match(/<([^>]*)>; rel="(.+)"/);
    if (match) {
      result[match[2]] = match[1];
    }
  });
  return result;
}
