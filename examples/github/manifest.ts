import {AuthenticationType} from 'coda-packs-sdk';
import type {PackVersionDefinition} from 'coda-packs-sdk';
import {formulas} from './formulas';
import {getConnectionName} from './helpers';
import {syncTables} from './formulas';

export const manifest: PackVersionDefinition = {
  version: '1.0',
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
  // This tells Coda which domain the pack make requests to. Any fetcher requests to other domains
  // won't be allowed.
  networkDomains: ['github.com'],
  formulaNamespace: 'GitHub',
  formulas,
  syncTables,
};
