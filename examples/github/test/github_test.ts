import type {GitHubPullRequest} from "../types";
import type {GitHubRepo} from "../types";
import {GitHubReviewEvent} from "../types";
import type {MockExecutionContext} from "@codahq/packs-sdk/dist/development";
import type {MockSyncExecutionContext} from "@codahq/packs-sdk/dist/development";
import type {PullRequestReviewResponse} from "../types";
import {RepoUrlParameter} from "../pack";
import {assert} from "chai";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import {describe} from "mocha";
import {executeFormulaFromPackDef} from "@codahq/packs-sdk/dist/development";
import {executeMetadataFormula} from "@codahq/packs-sdk/dist/development";
import {executeSyncFormulaFromPackDef} from "@codahq/packs-sdk/dist/development";
import {it} from "mocha";
import {newJsonFetchResponse} from "@codahq/packs-sdk/dist/development";
import {newMockExecutionContext} from "@codahq/packs-sdk/dist/development";
import {newMockSyncExecutionContext} from "@codahq/packs-sdk/dist/development";
import {pack} from "../pack";
import * as sinon from "sinon";

chai.use(chaiAsPromised);

describe("Github pack", () => {
  describe("ReviewPullRequest", () => {
    let context: MockExecutionContext;

    beforeEach(() => {
      // Before each test, we create a brand new execution context.
      // This will allow us to register fake fetcher responses.
      context = newMockExecutionContext();
    });

    it("executes ReviewPullRequest", async () => {
      // Create a fake response body, using the type we defined
      // as a guide for what fields should be included.
      let fakeReviewResponse: PullRequestReviewResponse = {
        id: 789,
        user: {
          id: 456,
          login: "user@example.com",
          avatar_url: "https://some-avatar.com",
          html_url: "https://some-user-url.com",
        },
        body: "review body",
        commit_id: "asdf",
        state: "CHANGES_REQUESTED",
        html_url: "https://some-review-url.com",
      };
      // Register the fake response with our mock fetcher.
      context.fetcher.fetch.returns(newJsonFetchResponse(fakeReviewResponse));

      // This is the heart of the test, where we actually execute the
      // formula on a given set of parameters, using our mock execution context.
      let response = await executeFormulaFromPackDef(
        pack,
        "ReviewPullRequest",
        [
          "https://github.com/some-org/some-repo/pull/234",
          GitHubReviewEvent.RequestChanges,
          "review body",
        ],
        context,
      );

      // Check the actual response matches what we'd expect from our fake
      // response after it goes through normalization. Since this is an action
      // formula, the response is not nearly as interesting as the request
      // itself, which we verify below.
      assert.deepEqual(response, {
        Id: 789,
        User: {
          Id: 456,
          Login: "user@example.com",
          Avatar: "https://some-avatar.com",
          Url: "https://some-user-url.com",
        },
        Body: "review body",
        CommitId: "asdf",
        State: "CHANGES_REQUESTED",
        Url: "https://some-review-url.com",
      });
      // Ensure that the API call we made to post a review
      // comment was constructed properly.
      sinon.assert.calledOnceWithExactly(context.fetcher.fetch, {
        method: "POST",
        url: "https://api.github.com/repos/some-org/some-repo/pulls/234/reviews",
        body: JSON.stringify({
          body: "review body",
          event: GitHubReviewEvent.RequestChanges,
        }),
      });
    });

    it("comment request requires comment body", async () => {
      // Our formula implementation has custom validation that if you use a
      // Comment action, that you actually send a comment body, so we make sure
      // that validation is working as expected.
      let responsePromise = executeFormulaFromPackDef(
        pack,
        "ReviewPullRequest",
        [
          "https://github.com/some-org/some-repo/pull/234",
          GitHubReviewEvent.Comment,
        ],
        context,
      );
      await assert.isRejected(
        responsePromise,
        /Comment parameter must be provided for Comment or Request Changes actions\./,
      );
    });
  });

  describe("PullRequests sync table", () => {
    let syncContext: MockSyncExecutionContext;

    beforeEach(() => {
      // Before each test, we create a brand new sync execution context.
      // This will allow us to register fake fetcher responses.
      // This context object is slightly different than a MockExectionContext
      // that we use with non-sync formuls.
      syncContext = newMockSyncExecutionContext();
    });

    // A helper function to create valid dummy data, since the GitHub
    // objects are quite large. This allows us to specify a handful of
    // specific fields of interest and populate the rest with defaults.
    function makeFakePullRequest(
      overrides: Partial<GitHubPullRequest>,
    ): GitHubPullRequest {
      let repo: GitHubRepo = {
        id: 573,
        name: "repo-name",
        full_name: "repo full name",
        description: "repo description",
        html_url: "https://some-repo-url.com",
      };
      let defaults: GitHubPullRequest = {
        title: "pull request title",
        user: {
          id: 435,
          login: "pr-author@example.com",
          avatar_url: "https://some-avatar.com",
          html_url: "https://some-user.com",
        },
        number: 123,
        html_url: "https://some-pr-url.com",
        created_at: "2021-01-13T00:08:37.572Z",
        updated_at: "2021-01-14T00:08:37.572Z",
        body: "pr body",
        labels: [{name: "label 1"}],
        state: "some-state",
        additions: 23,
        deletions: 7,
        changed_files: 4,
        base: {
          ref: "base-branch",
          repo: repo,
        },
        head: {
          ref: "change-branch",
          repo: repo,
        },
        assignees: [],
        requested_reviewers: [],
        requested_teams: [
          {id: 765, name: "some team", html_url: "https://some-team-url.com"},
        ],
      };
      return {...defaults, ...overrides};
    }

    // A helper function to generate the http header that GitHub uses to
    // tell us that there is a next page or previous page of results.
    function makeLinkHeader(opts: {next?: string; prev?: string}): string {
      let parts = Object.entries(opts)
        .filter(([_rel, url]) => url)
        .map(([rel, url]) => `<${url}>; rel="${rel}"`);
      return parts.join(", ");
    }

    // A simple test to make sure all the plumbing works, that doesn't
    // deal with pagination.
    it("syncs a single page", async () => {
      let pr1 = makeFakePullRequest({title: "pull request 1", number: 111});
      let pr2 = makeFakePullRequest({title: "pull request 2", number: 222});
      // Set up our mock fetcher to return a valdi result page with 2 fake PRs.
      syncContext.fetcher.fetch.returns(newJsonFetchResponse([pr1, pr2]));

      // This actually executes the entire sync.
      let syncedObjects = await executeSyncFormulaFromPackDef(
        pack,
        "PullRequests",
        ["https://github.com/some-org/some-repo"],
        syncContext,
      );

      // Make sure the sync actually pulled in our fake objects
      // from the fetcher. The result object fields have gone
      // through normalization, which is why they're capitalized.
      assert.equal(syncedObjects.length, 2);
      assert.equal(syncedObjects[0].Title, "pull request 1");
      assert.equal(syncedObjects[1].Title, "pull request 2");

      // Make sure we only made one http request to get results,
      // and that the url was what we expected it to me.
      sinon.assert.calledOnceWithExactly(syncContext.fetcher.fetch, {
        method: "GET",
        url: "https://api.github.com/repos/some-org/some-repo/pulls?per_page=100",
      });
    });

    // Similar to the previous test but makes sure our pagination logic works.
    it("syncs multiple pages", async () => {
      let pr1 = makeFakePullRequest({title: "pull request 1", number: 111});
      let pr2 = makeFakePullRequest({title: "pull request 2", number: 222});
      // Create a response to our first http request, that returns a PR
      // but includes an http header that tells us there is a next page
      // of results.
      let page1Response = newJsonFetchResponse([pr1], 200, {
        link: makeLinkHeader({next: "https://api.github.com/next-page-url"}),
      });
      // Create a response for our second http request, that doesn't
      // have a next page header, which means our sync should terminate
      // because there aren't any more pages to request.
      let page2Response = newJsonFetchResponse([pr2]);
      // Register these responses with our mock fetcher. The mock
      // fetcher will check the incoming arguments and return the appropriate
      // one of its multiple registered responses.
      syncContext.fetcher.fetch
        .withArgs({
          method: "GET",
          url: "https://api.github.com/repos/some-org/some-repo/pulls?per_page=100",
        })
        .returns(page1Response)
        .withArgs({
          method: "GET",
          url: "https://api.github.com/next-page-url",
        })
        .returns(page2Response);

      // Now actually execute the sync. This will keep fetching additional
      // pages of results until there is not continuation returned.
      let syncedObjects = await executeSyncFormulaFromPackDef(
        pack,
        "PullRequests",
        ["https://github.com/some-org/some-repo"],
        syncContext,
      );

      // Make sure the results from each page got concatenated together
      // into one big list of results.
      assert.equal(syncedObjects.length, 2);
      assert.equal(syncedObjects[0].Title, "pull request 1");
      assert.equal(syncedObjects[1].Title, "pull request 2");

      // Make sure we did indeed make 2 http requests.
      sinon.assert.calledTwice(syncContext.fetcher.fetch);
    });

    // We can even test the metadata formulas in the supporting
    // parts of our pack. The repo url parameter to this sync table
    // has an autocomplete metadata formula to make it easier for users
    // to select the repo they want to sync from. This test exercises
    // that formula, which makes http requests to GitHub to listen
    // repos that the user has access to.
    it("repo url autocomplete", async () => {
      // Create a mock execution context, some fake repos, and register
      // an http response that returns those repos.
      let context: MockExecutionContext = newMockExecutionContext();
      let repo1: GitHubRepo = {
        id: 123,
        name: "repo 1",
        full_name: "repo full name",
        description: "repo description",
        html_url: "https://repo-1-url,",
      };
      let repo2: GitHubRepo = {
        ...repo1,
        id: 456,
        name: "repo 2 matches some-query",
        html_url: "https://repo-2-url",
      };
      context.fetcher.fetch.returns(newJsonFetchResponse([repo1, repo2]));

      // Invoke the metadata formula simulating that the user has searched
      // in the UI for 'some-query'.
      let results = await executeMetadataFormula(
        RepoUrlParameter.autocomplete!,
        {search: "some-query"},
        context,
      );

      // The metadata formula should fetch our fake repos but filter
      // them to only those that match the search query.
      assert.equal(results.length, 1);
      assert.deepEqual(results[0], {
        value: "https://repo-2-url",
        display: "repo 2 matches some-query",
      });

      sinon.assert.calledOnceWithExactly(context.fetcher.fetch, {
        method: "GET",
        url: "https://api.github.com/user/repos?per_page=100",
      });
    });
  });
});
