# Box

This is a small example Pack that demonstrates how to create an action formula that uploads a file to Box. The primary purpose of this example is to demonstrate how to use the `form-data` NPM library to send `multipart/form-data` payloads with the Fetcher.

## Setup

To run the example code and actually connect to Box, you'll need to create a Custom App
with Box and get a client id and client secret. This can be done using the [Box developer console](https://app.box.com/developers/console).

When configuring the OAuth settings you'll need to add **`http://localhost:3000/oauth`**
as your "Redirect URIs" in order to run these examples locally. To run them
on Coda after uploading & releasing, your authorization callback URL must change to be
**`https://coda.io/packsAuth/oauth2/{PACK_ID}`**.

Run `coda auth examples/box/pack.ts`. You'll be prompted to enter your client id
and client secret, and then your browser will open and begin Box's OAuth flow.
After the flow completes, the access token for that account will saved locally
for use when executing formulas and syncs, so you only have to do this once. But you can
run the command again to change to a different account, or to update your token if it
becomes invalid.

## Running the Example

To upload a file run:

```bash
coda execute examples/box/pack.ts UploadFile "{FILE_URL}"
```

The file URL must be hosted on `codahosted.io`, which is where Coda stores uploaded files and images. You can test with this value:

```
https://codahosted.io/docs/usaAjFrOkA/blobs/bl-HBxFdR_Yjg/5e2a110296bd8591bfa6734a0ba3aac501b82e60b8090800a7306e9162e4c8102ff1de6e18ade5843174e548e64a7349ba6ac653b54bb3d4e001e2414731f6fb48736bf80f1e2f35a05c9edefe7a25e7037b2c071104e173ba73449a28f2b1e953f8b962
```
