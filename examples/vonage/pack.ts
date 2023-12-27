import * as coda from "@codahq/packs-sdk";
import * as credentials from "./credentials";
import * as rs from "jsrsasign";

export const pack = coda.newPack();

const ConversationSchema = coda.makeObjectSchema({
  properties: {
    id: {
      type: coda.ValueType.String,
    },
    name: {
      type: coda.ValueType.String,
    },
    display_name: {
      type: coda.ValueType.String,
    },
    image: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference,
      fromKey: "image_url",
    },
  },
  displayProperty: "name",
  idProperty: "id",
  featuredProperties: ["display_name", "image"],
});

pack.addNetworkDomain("nexmo.com");

pack.addSyncTable({
  name: "Conversations",
  description: "Lists the conversations created by the application.",
  identityName: "Conversation",
  schema: ConversationSchema,
  formula: {
    name: "SyncConversations",
    description: "Syncs the conversations.",
    parameters: [],
    execute: async function (args, context) {
      // Use the next URL if available, or default to the base URL.
      let url = context.sync.continuation?.nextUrl as string;
      if (!url) {
        url = "https://api.nexmo.com/v1/conversations";
      }

      // Create a JWT for authentication.
      let jwt = createJwt(context);

      // Fetch the list of conversations.
      let response = await context.fetcher.fetch({
        method: "GET",
        url: "https://api.nexmo.com/v1/conversations",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      let conversations = response.body._embedded.conversations;
      let nextUrl = response.body._links.next;

      // Create a continuation, if there are more conversations available.
      let continuation;
      if (nextUrl) {
        continuation = {
          nextUrl: nextUrl,
        };
      }

      return {
        result: conversations,
        continuation: continuation,
      };
    },
  },
});

// Create a JWT using the application ID and private key in credentials.ts.
function createJwt(context: coda.ExecutionContext) {
  let now = Date.now() / 1000;
  let header = {
    alg: "RS256",
    typ: "JWT",
  };
  let payload = {
    application_id: credentials.ApplicationId,
    iat: now,
    nbf: now,
    exp: now + 600, // Expires in 10 minutes.
    jti: context.invocationToken,
    acl: {
      paths: {
        "/*/conversations/**": {
          methods: ["GET"],
        },
      },
    },
  };
  return rs.KJUR.jws.JWS.sign("RS256", header, payload, credentials.PrivateKey);
}
