# Google Tables

This is an example Pack that syncs data from Google Tables (an Area 120 project). The primary purpose of this example is to demonstrate how to build a dynamic sync table with two-way sync enabled.

## Setup

To run the example code and actually connect to Google Tables, you'll need to create a Google Cloud project and get a client id and client secret. This can be done using the [Google Cloud console](https://console.cloud.google.com).

When configuring the OAuth settings you'll need to add **`http://localhost:3000/oauth`** as your "Redirect URIs" in order to run these examples locally. To run them on Coda after uploading & releasing, your authorization callback URL must change to be **`https://coda.io/packsAuth/oauth2/{PACK_ID}`**.

Run `coda auth examples/google-tables/pack.ts`. You'll be prompted to enter your client id and client secret, and then your browser will open and begin Google's OAuth flow. After the flow completes, the access token for that account will saved locally for use when executing formulas and syncs, so you only have to do this once. But you can run the command again to change to a different account, or to update your token if it becomes invalid.

## Running the Example

To sync a table run:

```bash
coda execute examples/google-tables/pack.ts Table --dynamicUrl="https://area120tables.googleapis.com/v1alpha1/tables/{TABLE_ID}"
```

To test two-way sync you'll need to upload the Pack and test it in a live doc.
