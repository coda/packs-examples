import * as ContentDisposition from "content-disposition";
import type { Folder } from "./types";
import type { User } from "./types";
import * as coda from "@codahq/packs-sdk";
import * as mime from "mime-types";
import { url } from "inspector";

export async function searchFolders(context: coda.ExecutionContext,
  search: string): Promise<Folder[]> {
  let url = coda.withQueryParams("https://api.box.com/2.0/search", {
    type: "folder",
    // If no query has been entered, search for "folder" to find all folders.
    query: search || "folder",
    limit: 100,
    fields: "id,name",
  });
  let response = await context.fetcher.fetch({
    method: "GET",
    url: url,
  });
  return response.body.entries;
}

export async function getUser(context: coda.ExecutionContext): Promise<User> {
  let response = await context.fetcher.fetch({
    method: "GET",
    url: "https://api.box.com/2.0/users/me"
  });
  return response.body;
}

export function getFilename(fileUrl: string,
  headers: Record<string, string | string[] | undefined>): string {
  let contentType = headers["content-type"] as string;
  let contentDisposition = headers["content-disposition"] as string;
  // Use the original filename, if present.
  if (contentDisposition) {
    let parsed = ContentDisposition.parse(contentDisposition);
    if (parsed.parameters.filename) {
      return parsed.parameters.filename;
    }
  }
  // Fallback to last segment of the URL as the name.
  let name = fileUrl.split("/").pop() as string;
  // Add an appropriate file extension, if the content type is known.
  if (contentType) {
    let extension = mime.extension(contentType);
    if (extension) {
      name += `.${extension}`;
    }
  }
  return name;
}
