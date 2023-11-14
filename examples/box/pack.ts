import FormData from "form-data";
import * as coda from "@codahq/packs-sdk";
import {getFilename} from "./helpers";
import {getUser} from "./helpers";
import {searchFolders} from "./helpers";

export const pack = coda.newPack();

pack.addNetworkDomain("box.com");

pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: "https://account.box.com/api/oauth2/authorize",
  tokenUrl: "https://api.box.com/oauth2/token",
  getConnectionName: async function (context) {
    let user = await getUser(context);
    return user.name;
  },
});

pack.addFormula({
  name: "UploadFile",
  description: "Uploads a file to Box.",
  parameters: [
    coda.makeParameter({
      type: coda.ParameterType.File,
      name: "file",
      description: "The file to upload.",
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "filename",
      description:
        "The filename to upload to. Default: the original filename of the file.",
      optional: true,
    }),
    coda.makeParameter({
      type: coda.ParameterType.String,
      name: "folderId",
      description:
        "The ID of the folder to upload to. Default: the root folder.",
      optional: true,
      autocomplete: async function (context, search) {
        let folders = await searchFolders(context, search);
        return folders.map(folder => {
          return {
            display: folder.name,
            value: folder.id,
          };
        });
      },
    }),
  ],
  resultType: coda.ValueType.String,
  isAction: true,
  execute: async function (args, context) {
    let [fileUrl, filename, folderId = "0"] = args;

    // Download the file from the URL.
    let download = await context.fetcher.fetch({
      method: "GET",
      url: fileUrl,
      isBinaryResponse: true,
      disableAuthentication: true,
    });
    let file = download.body;
    if (!filename) {
      filename = getFilename(fileUrl, download.headers);
    }
    let contentType = download.headers["content-type"] as string;

    // Define the file attributes to send to Box.
    let attributes = {
      name: filename,
      parent: {
        id: folderId,
      },
    };

    // Bundle the attributes and the file as form data.
    let form = new FormData();
    form.append("attributes", JSON.stringify(attributes));
    form.append("file", file, {
      contentType: contentType,
      filename: filename,
    });

    // Send the form data to box to complete the upload.
    let upload = await context.fetcher.fetch({
      method: "POST",
      url: "https://upload.box.com/api/2.0/files/content",
      headers: {
        ...form.getHeaders(),
      },
      body: form.getBuffer(),
    });

    // Return the ID of the uploaded file.
    return upload.body.entries[0].id;
  },
});
