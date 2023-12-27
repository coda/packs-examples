// A file to hold the credentials used by the Pack.

// It's not possible to use the SDK's system authentication and store these in
// Coda directly since you need direct access to the values in order to create
// the JWT.
// We recommend you don't check this file into your code repository, for example
// by adding an entry for it in your .gitignore file.

// Create an application and private key at: https://dashboard.nexmo.com/

// The ID of your Vonage application.
export const ApplicationId = "...";

// The private key generated for your Vonage application.
export const PrivateKey = `
-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----
`.trim();
