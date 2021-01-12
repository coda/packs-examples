// These are the allowable values for the `event` field of a pull request review API request
// as dodcumented by GitHub:
// https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#submit-a-review-for-a-pull-request
export enum GitHubReviewEvent {
  Approve = 'APPROVE',
  Comment = 'COMMENT',
  RequestChanges = 'REQUEST_CHANGES',
}

// The valid values you can pass in the `state` filter parameter when listing PRs.
// https://docs.github.com/en/free-pro-team@latest/rest/reference/pulls#list-pull-requests
export enum PullRequestStateFilter {
  Open = 'open',
  Closed = 'closed',
  All = 'all',
}

// Below are types for GitHub object responses. These only include the subset of fields we
// care about for this pack. The actual responses are much larger.

export interface GitHubPullRequest {
  title: string;
  user: GitHubUser;
  number: number;
  html_url: string;
  created_at: string;
  modified_at: string;
  closed_at?: string;
  merged_at?: string;
  merge_commit_sha?: string;
  body: string;
  labels: GitHubLabel[];
  additions: number;
  deletions: number;
  changed_files: number;
  merged_by?: GitHubUser;
  base: GitHubCommit;
  head: GitHubCommit;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: GitHubTeam[];
}

interface GitHubCommit {
  repo: GitHubRepo;
  ref: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
}

interface GitHubLabel {
  name: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubTeam {
  id: number;
  name: string;
  html_url: string;
}
