import type {APIEntry} from "../types";
import type {MockExecutionContext} from "@codahq/packs-sdk/dist/development";
import {assert} from "chai";
import {describe} from "mocha";
import {executeFormulaFromPackDef} from "@codahq/packs-sdk/dist/development";
import {it} from "mocha";
import {newJsonFetchResponse} from "@codahq/packs-sdk/dist/development";
import {newMockExecutionContext} from "@codahq/packs-sdk/dist/development";
import {pack} from "../pack";
import * as sinon from "sinon";

describe("Dictionary pack", () => {
  let context: MockExecutionContext;

  beforeEach(() => {
    // Before each test, we create a brand new execution context.
    // This will allow us to register fake fetcher responses.
    context = newMockExecutionContext();
  });

  it("executes Define", async () => {
    // We create a fake API response and set up our mock fetcher to return it.
    // Because we've defined an APIEntry type that specifies the structure of
    // the API response, it's easy to create a fake response that has all
    // the necessary fields, because TypeScript will help us.
    let fakeEntry: APIEntry = {
      shortdef: ["definition of foo"],
      fl: "noun",
      hwi: {hw: "foo"},
      date: "1970",
      meta: {
        id: "foo",
        offensive: false,
      },
    };
    let fakeEntries = [fakeEntry];
    context.fetcher.fetch.resolves(newJsonFetchResponse(fakeEntries));

    // This is the heart of the test, where we actually execute the formula on a
    // given set of parameters, using our mock execution context.
    let response = await executeFormulaFromPackDef<any[]>(
      pack,
      "Define",
      ["foo"],
      context,
    );

    assert.equal(1, response.length);
    // The response object has gone through normalization, standardizing the
    // capitalization and formatting of object propery names to be consistent
    // across packs.
    assert.deepEqual(response[0], {
      Id: "foo",
      Definitions: ["definition of foo"],
      PartOfSpeech: "noun",
      Headword: "foo",
      FirstUse: "1970",
      Offensive: false,
    });
    sinon.assert.calledOnceWithExactly(context.fetcher.fetch, {
      method: "GET",
      url: "https://www.dictionaryapi.com/api/v3/references/collegiate/json/foo",
    });
  });

  // It's important to verify how your pack behaves in edges cases. We've
  // checked that the real API returns an empty list as a response when it
  // cannot find the input word, so we simulate that here, and make sure
  // that our implementation doesn't throw any errors.
  it("executes with an empty response", async () => {
    context.fetcher.fetch.resolves(newJsonFetchResponse([]));
    let response = await executeFormulaFromPackDef(
      pack,
      "Define",
      ["unknown"],
      context,
    );
    assert.deepEqual([], response);
  });
});
