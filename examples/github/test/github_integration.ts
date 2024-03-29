import {PullRequestStateFilter} from "../types";
import {assert} from "chai";
import {describe} from "mocha";
import {executeSyncFormulaFromPackDef} from "@codahq/packs-sdk/dist/development";
import {it} from "mocha";
import {pack} from "../pack";

describe("GitHub pack integration test", () => {
  it("executes PullRequests sync", async () => {
    // Here we execute the sync using a real http fetcher. Since this pack
    // requires authentication, this requires that you've already run
    // `coda auth examples/github/packs.ts` to set up your OAuth credentials
    // for GitHub.
    let response = await executeSyncFormulaFromPackDef(
      pack,
      "PullRequests",
      // This integration test assumes you have access to the packs-examples
      // repo, which you should if you're looking at this example!
      [
        "https://github.com/coda/packs-examples",
        "",
        PullRequestStateFilter.All,
      ],
      undefined,
      undefined,
      {
        useRealFetcher: true,
        manifestPath: require.resolve("../pack"),
      },
    );

    // Reliably assertions here are tricky since this test uses live data that
    // is subject to change. Above we used the All parameter to ensure we're
    // syncing all PRs and not just open ones, to guarantee we have at least
    // one PR to examine here.
    assert.isAtLeast(response.length, 1);
    assert.equal(response[0].Repo.Name, "packs-examples");
  });

  // You could similarly write an integration for the ReviewPullRequest
  // formula. Since that is an action formula that mutates data, you may want
  // to have a dummy PR around for testing purposes that you keep appending
  // comments to.
});
