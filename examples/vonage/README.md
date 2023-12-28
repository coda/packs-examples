# Vonage

This is an example Pack that syncs data from Vonage. The primary purpose of this example is to demonstrate how to perform JWT (JSON Web Token) authentication in a Pack.

Coda doesn't yet have native support for JWT authentication, but when the API uses a shared set of system credentials you can approximate it. This example stores the shared credentials in a file and uses the `jsrsasign` library to generate the JWT. When using this pattern in your own Packs make sure not to check the credentials file into your version control system.

## Setup

To run the example code and actually connect to Vonage, you'll need to sign up for a Vonage account and create a new application. This can be done using the [Vonage API Dashboard](https://dashboard.nexmo.com/). After you have created the application, enter the generated application ID and private key in to the `credentials.ts` file.


## Running the Example

To sync the list of conversations run:

```bash
coda execute examples/vonage/pack.ts Conversations
```
