import * as coda from "@codahq/packs-sdk";

// A user associated with an entity or action. This is a child property
// in many other GitHub objects.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/users#get-a-user
export const UserSchema = coda.makeObjectSchema({
  // We list only the subset of fields we care about, the actual user objects
  // are much larger.
  properties: {
    id: {type: coda.ValueType.Number, required: true},
    login: {type: coda.ValueType.String, required: true},
    // Using fromKey is a shortcut to avoid writing code to transform
    // GitHub's response to an object matching our schema. We simply specify
    // the name of the field in the GitHub response using fromKey, and Coda
    // will map it to the name of property declared here.
    avatar: {
      type: coda.ValueType.String,
      fromKey: "avatar_url",
      // We return the image url of the GitHub user's avatar but declare it as
      // codaType: ImageAttachment, which instructs Coda to download the image
      // and host it from Coda for use in Coda docs.
      codaType: coda.ValueHintType.ImageAttachment,
    },
    url: {
      type: coda.ValueType.String,
      fromKey: "html_url",
      codaType: coda.ValueHintType.Url,
      required: true,
    },
  },
  // This is the property that will render as a label on the object in the UI.
  displayProperty: "login",
  // This is the property that will be a unique key for the row.
  idProperty: "id",
});

// The tiny subset of fields for a Team that we care about. We don't fetch
// teams directly but they are embedded in other responses, representing
// e.g. the teams requested to review a PR.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/teams#get-a-team-by-name
export const TeamSchema = coda.makeObjectSchema({
  // We list only the subset of fields we care about, the actual team objects
  // are much larger.
  properties: {
    id: {type: coda.ValueType.Number, required: true},
    name: {type: coda.ValueType.String, required: true},
    url: {
      type: coda.ValueType.String,
      fromKey: "html_url",
      codaType: coda.ValueHintType.Url,
      required: true,
    },
  },
  // This is the property that will render as a label on the object in the UI.
  displayProperty: "name",
  // This is the property that will be a unique key for the row.
  idProperty: "id",
});

// The response when creating a pull review request.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#create-a-review-for-a-pull-request
export const PullRequestReviewResponseSchema = coda.makeObjectSchema({
  // We list only the subset of fields we care about.
  properties: {
    id: {type: coda.ValueType.Number, required: true},
    user: UserSchema,
    body: {type: coda.ValueType.String, required: true},
    commitId: {
      type: coda.ValueType.String,
      fromKey: "commit_id",
      required: true,
    },
    state: {type: coda.ValueType.String, required: true},
    url: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.Url,
      fromKey: "html_url",
      required: true,
    },
  },
  // This is the property that will render as a label on the object in the UI.
  displayProperty: "body",
  // This is the property that will be a unique key for the row.
  idProperty: "id",
});

// The handful of fields we care about for a Repo object. These are embedded
// in PR objects.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#get-a-repository
export const RepoSchema = coda.makeObjectSchema({
  properties: {
    id: {type: coda.ValueType.Number, required: true},
    name: {type: coda.ValueType.String, required: true},
    fullName: {
      type: coda.ValueType.String,
      fromKey: "full_name",
      required: true,
    },
    description: {type: coda.ValueType.String},
    url: {
      type: coda.ValueType.String,
      fromKey: "html_url",
      codaType: coda.ValueHintType.Url,
      required: true,
    },
  },
  displayProperty: "name",
  idProperty: "id",
});

// A pull request object, as we would like to present it to Coda users. Many
// of the fields are renamed from GitHub's raw response objects
// (using `fromKey`) while other field are remapped or rearranged to eliminate
// nesting. This is also only a subset of the fields returned by GitHub.
//
// Since this is the top-level schema in our PullRequests sync table definition,
// the `id`, `primary`, `identity`, and `featured` fields which are sometimes
// optional, are all required and important for creating a user-friendly table.
//
// https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#get-a-pull-request
export const PullRequestSchema = coda.makeObjectSchema({
  properties: {
    title: {type: coda.ValueType.String, required: true},
    author: {
      ...UserSchema,
      fromKey: "user",
    },
    pullRequestNumber: {
      type: coda.ValueType.Number,
      fromKey: "number",
      required: true,
    },
    url: {
      type: coda.ValueType.String,
      fromKey: "html_url",
      codaType: coda.ValueHintType.Url,
      required: true,
    },
    created: {
      type: coda.ValueType.String,
      fromKey: "created_at",
      codaType: coda.ValueHintType.Date,
      required: true,
    },
    modified: {
      type: coda.ValueType.String,
      fromKey: "updated_at",
      codaType: coda.ValueHintType.Date,
      required: true,
    },
    closed: {
      type: coda.ValueType.String,
      fromKey: "closed_at",
      codaType: coda.ValueHintType.Date,
    },
    merged: {
      type: coda.ValueType.String,
      fromKey: "merged_at",
      codaType: coda.ValueHintType.Date,
    },
    mergeCommitSha: {type: coda.ValueType.String, fromKey: "merge_commit_sha"},
    body: {type: coda.ValueType.String, codaType: coda.ValueHintType.Markdown},
    labels: {type: coda.ValueType.Array, items: {type: coda.ValueType.String}},
    state: {type: coda.ValueType.String, required: true},
    sourceBranch: {type: coda.ValueType.String, required: true},
    targetBranch: {type: coda.ValueType.String, required: true},
    addedLineCount: {type: coda.ValueType.Number, fromKey: "additions"},
    deletedLineCount: {type: coda.ValueType.Number, fromKey: "deletions"},
    changedFileCount: {type: coda.ValueType.Number, fromKey: "changed_files"},
    mergedBy: {...UserSchema, fromKey: "merged_by"},
    repo: {...RepoSchema, required: true},
    assignees: {
      type: coda.ValueType.Array,
      items: UserSchema,
    },
    reviewerUsers: {
      type: coda.ValueType.Array,
      items: UserSchema,
      fromKey: "requested_reviewers",
    },
    reviewerTeams: {
      type: coda.ValueType.Array,
      items: TeamSchema,
      fromKey: "requested_teams",
    },
  },
  // This is the property that will render as a label on the object in the UI.
  displayProperty: "title",
  // In a sync table, the ID property is used to uniquely identify the object
  // across multiple syncs. When this table is re-synced any row that matches
  // this id will be replaced, rather than appending the object as a new row.
  idProperty: "url",
  // These are the subset of the `properties` above that should be automatically
  // created as columns when this table is first created in the UI. The
  // remainder of the fields can be easily added as columns manually by the
  // user at any time. We choose only to feature a handful of highly-relevant
  // columns to keep tables manageable at creation time and avoid overwhelming
  // users with too many fields.
  featuredProperties: [
    "url", "author", "created", "modified", "closed", "state", "body"
  ],
});
