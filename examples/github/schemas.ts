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
