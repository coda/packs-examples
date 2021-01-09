import {ensureExists} from 'packs-sdk';

const PULL_REQUEST_URL_REGEX = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/;

// This is a simple wrapper that takes a relative GitHub url and turns into an absolute url.
// We recommend having helpers to generate API urls particularly when APIs use versioned
// urls, so that if you need to update to a new version of the API it is easy to do so
// in one place. Here GitHub's API urls do not have version identifiers so this is less
// meaningful but we do so to future-proof things.
export function apiUrl(path: string): string {
  return `https://api.github.com${path}`;
}

export function parsePullUrl(url: string): {owner: string; repo: string; pullNumber: string} {
  const match = ensureExists(PULL_REQUEST_URL_REGEX.exec(url), 'Received an invalid pull request URL');
  return {
    owner: match[1],
    repo: match[2],
    pullNumber: match[3],
  };
}
