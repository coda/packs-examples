import {schema} from 'packs-sdk';

const {ValueType, makeObjectSchema} = schema;

// A user associated with an entity or action. This is a child property
// in many other GitHub objects.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/users#get-a-user
export const userSchema = makeObjectSchema({
  type: ValueType.Object,
  id: 'id',
  // This is property that will render as a label on the object in the UI.
  primary: 'login',
  // We list only the subset of fields we care about, the actual user objects are much larger.
  properties: {
    id: {type: ValueType.Number, required: true},
    login: {type: ValueType.String, required: true},
    // Using fromKey is a shortcut to avoid writing code to transform GitHub's response
    // to an object matching our schema. We simply specify the name of the field
    // in the GitHub response using fromKey, and Coda will map it to the name of
    // property declared here.
    avatar: {
      type: ValueType.String,
      fromKey: 'avatar_url',
      // We return the image url of the GitHub user's avatar but declare it as codaType: ImageAttachment,
      // which instructs Coda to download the image and host it from Coda for use in Coda docs.
      codaType: ValueType.ImageAttachment,
    },
    url: {type: ValueType.String, fromKey: 'html_url', codaType: ValueType.Url, required: true},
  },
});

// The tiny subset of fields for a Team that we care about. We don't fetch teams directly
// but they are embedded in other responses, representing e.g. the teams requested to review a PR.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/teams#get-a-team-by-name
export const teamSchema = makeObjectSchema({
  type: ValueType.Object,
  id: 'id',
  // This is property that will render as a label on the object in the UI.
  primary: 'name',
  // We list only the subset of fields we care about, the actual team objects are much larger.
  properties: {
    id: {type: ValueType.Number, required: true},
    name: {type: ValueType.String, required: true},
    url: {type: ValueType.String, fromKey: 'html_url', codaType: ValueType.Url, required: true},
  },
});

// The response when creating a pull review request.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#create-a-review-for-a-pull-request
export const pullRequestReviewResponseSchema = makeObjectSchema({
  type: ValueType.Object,
  id: 'id',
  // This is property that will render as a label on the object in the UI.
  primary: 'body',
  // We list only the subset of fields we care about.
  properties: {
    id: {type: ValueType.Number, required: true},
    user: userSchema,
    body: {type: ValueType.String, required: true},
    commitId: {type: ValueType.String, fromKey: 'commit_id', required: true},
    state: {type: ValueType.String, required: true},
    url: {type: ValueType.String, codaType: ValueType.Url, fromKey: 'html_url', required: true},
  },
});

// The handful of fields we care about for a Repo object. These are embedded in PR objects.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#get-a-repository
export const repoSchema = makeObjectSchema({
  type: ValueType.Object,
  primary: 'name',
  id: 'id',
  properties: {
    id: {type: ValueType.Number, required: true},
    name: {type: ValueType.String, required: true},
    fullName: {type: ValueType.String, fromKey: 'full_name', required: true},
    description: {type: ValueType.String},
    url: {type: ValueType.String, fromKey: 'html_url', codaType: ValueType.Url, required: true},
  },
});

// A pull request object, as we would like to present it to Coda users. Many of the fields
// are renamed from GitHub's raw response objects (using `fromKey`) while other fields
// are remapped or rearranged to eliminate nesting. This is also only a subset of
// the fields returned by GitHub.
//
// Since this is the top-level schema in our PullRequests sync table definition,
// the `id`, `primary`, `identity`, and `featured` fields which are sometimes optional,
// are all required and important for creating a user-friendly table.
//
// https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#get-a-pull-request
export const pullRequestSchema = makeObjectSchema({
  type: ValueType.Object,
  // In a sync table, the id is used to uniquely identify the object across multiple syncs.
  // When this table is re-synced any row that matches this id will be replaced, rather
  // than appending the object as a new row.
  id: 'url',
  // This is property that will render as a label on the object in the UI.
  primary: 'title',
  // Giving an object an identity means that it can be referenced by other tables.
  // For example, suppose you defined another table listing the pending PRs that have
  // as a reviewer. Rather than listing the full data of those PRs inline, you could
  // simply sync their ids, and return references to the corresponding rows in this
  // PullRequests sync table. Those references are achieved using an `identity`, though
  // we do not currently demonstrate that here.
  identity: {
    packId: 1892,
    name: 'PullRequest',
  },
  // These are the subset of the `properties` below that should be automatically created
  // as columns when this table is first created in the UI. The remainder of the fields can
  // be easily added as columns manually by the user at any time. We choose only to feature
  // a handful of highly-relevant columns to keep tables manageable at creation time
  // and avoid overwhelming users with too many fields.
  featured: ['url', 'author', 'created', 'modified', 'closed', 'state', 'body'],
  properties: {
    title: {type: ValueType.String, required: true},
    author: {
      ...userSchema,
      fromKey: 'user',
    },
    pullRequestNumber: {type: ValueType.Number, fromKey: 'number', required: true},
    url: {type: ValueType.String, fromKey: 'html_url', codaType: ValueType.Url, required: true},
    created: {type: ValueType.String, fromKey: 'created_at', codaType: ValueType.Date, required: true},
    modified: {type: ValueType.String, fromKey: 'updated_at', codaType: ValueType.Date, required: true},
    closed: {type: ValueType.String, fromKey: 'closed_at', codaType: ValueType.Date},
    merged: {type: ValueType.String, fromKey: 'merged_at', codaType: ValueType.Date},
    mergeCommitSha: {type: ValueType.String, fromKey: 'merge_commit_sha'},
    body: {type: ValueType.String, codaType: ValueType.Markdown},
    labels: {type: ValueType.Array, items: {type: ValueType.String}},
    state: {type: ValueType.String, required: true},
    sourceBranch: {type: ValueType.String, required: true},
    targetBranch: {type: ValueType.String, required: true},
    addedLineCount: {type: ValueType.Number, fromKey: 'additions'},
    deletedLineCount: {type: ValueType.Number, fromKey: 'deletions'},
    changedFileCount: {type: ValueType.Number, fromKey: 'changed_files'},
    mergedBy: {...userSchema, fromKey: 'merged_by'},
    repo: {...repoSchema, required: true},
    assignees: {
      type: ValueType.Array,
      items: userSchema,
    },
    reviewerUsers: {
      type: ValueType.Array,
      items: userSchema,
      fromKey: 'requested_reviewers',
    },
    reviewerTeams: {
      type: ValueType.Array,
      items: teamSchema,
      fromKey: 'requested_teams',
    },
  },
});
