// These are the allowable values for the `event` field of a pull request review API request
// as dodcumented by GitHub:
// https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#submit-a-review-for-a-pull-request
export enum GitHubReviewEvent {
  Approve = 'APPROVE',
  Comment = 'COMMENT',
  RequestChanges = 'REQUEST_CHANGES',
}
