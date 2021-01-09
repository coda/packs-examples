# GitHub

This is a more substantive example pack that connects to GitHub using OAuth2 authentication,
and implements a table that syncs various pull requests for one or more repos that the
user has access to.

To run the example code and actually connect to GitHub, you'll need to create an OAuth app
with GitHub and get a client id and client secret. GitHub's documentation for OAuth apps
lives at https://docs.github.com/en/free-pro-team@latest/developers/apps/creating-an-oauth-app.

When creating a GitHub OAuth app you'll need to set **`http://localhost:3000/oauth`**
as your "Authorization callback URL" in order to run these examples locally.

## Running the Example

Run `coda auth examples/github/manifest.ts`. You'll be prompted to enter you client id
and client secret, and then your browser will open and begin GitHub's OAuth flow.
After the flow completes, the access token for that account will saved locally
for use when executing formulas and syncs, so you only have to do this once. But you can
run the command again to change to a different account, or to update your token if it
becomes invalid.

To sync pull requests and output them to the console, you can run:

```bash
coda execute examples/github/manifest.ts PullRequests --fetch
```

To create a review on a pull request, you can run:

```bash
coda execute examples/github/manifest.ts GitHub::ReviewPullRequest https://github.com/<your-org>/<your-repo>/pull/<your-pr> COMMENT "Some comment" --fetch
```

Note that this will actually update your pull request in GitHub! So be careful and make
sure you don't inadvertently e.g. approve a real PR if you're just exploring.

## Running the Tests

Run the unittests just for this pack by using:

```bash
mocha --require ts-node/register examples/github/test/github_test.ts
```

The unittests use a mock http fetcher and do not connect to a real API.

There is also an integration test, which makes real http requests to the API.
To run successfully, this test requires that you've already setup an access token
using `coda auth examples/github/manifest.ts`.

```bash
mocha --require ts-node/register examples/github/test/github_integration.ts
```
