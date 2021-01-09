import {AuthenticationType} from 'packs-sdk';
import {FetchRequest} from 'packs-sdk';
import {PackCategory} from 'packs-sdk';
import type {PackDefinition} from 'packs-sdk';
import {formulas} from './formulas';
import {makeMetadataFormula} from 'packs-sdk';
import {syncTables} from './formulas';

const getConnectionName = makeMetadataFormula(async context => {
  const request: FetchRequest = {
    method: 'GET',
    url: 'https://api.github.com/user',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await context.fetcher.fetch(request);
  return response.body.login;
});

export const manifest: PackDefinition = {
  id: 1483,
  name: 'GitHub',
  shortDescription: 'Sync and update GitHub pull requests.',
  description: 'Sync and update GitHub pull requests.',
  version: '0.0.1',
  exampleImages: [],
  providerId: 2010,
  category: PackCategory.DataStorage,
  logoPath: 'logo.png',
  // The GitHub pack uses OAuth authentication, to allow each user to login to GitHub via
  // the browser when installing the pack. The pack will operate on their personal data.
  defaultAuthentication: {
    type: AuthenticationType.OAuth2,
    // As outlined in https://docs.github.com/en/free-pro-team@latest/developers/apps/authorizing-oauth-apps,
    // these are the urls for initiating OAuth authentication and doing token exchanged.
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    // When making authorized http requests, most services ask you to pass a header of this form:
    // `Authorization: Bearer <OAUTH-TOKEN>`
    // but GitHub asks you use:
    // `Authorization: token <OAUTH-TOKEN>`
    // so we specify a non-default tokenPrefix here.
    tokenPrefix: 'token',
    // These are deprecated. You will provide your client id and client secret in the Coda developers UI.
    clientIdEnvVarName: 'PACKS_GITHUB_CLIENT_ID', // DEPRECATED, ignore
    clientSecretEnvVarName: 'PACKS_GITHUB_CLIENT_SECRET', // DEPRECATED, ignore
    // These are the GitHub-specific scopes the user will be prompted to authorize in order for
    // the functionality in this pack to succeed.
    scopes: ['read:user', 'repo'],
    // This is a simple formula that makes an API call to GitHub to find the name of the
    // user associated with the OAuth access token. This name is used to label the Coda account
    // connection associated with these credentials throughout the Coda UI.
    // For example, a user may connect both a personal GitHub account and a work GitHub account to
    // Coda, and this formula will help those accounts be clearly labeled in Coda without
    // direct input from the user.
    getConnectionName,
  },
  formulas,
  syncTables,
};
