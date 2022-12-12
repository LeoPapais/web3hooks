# Web3hooks

This is an integration between Zapier and RPC Providers. Currently only supports Infura.

It basically allows users to create subscriptions to events, sending the contract and the topics of interest alongside with a hookUrl where they want to be notified. The webserver will connect to the RPC provider and subscribe to this events. When a matching event is emitted, the server will post the data to hookUrl.

We save the subscription data just because in case of an outage, we can rerun the server and keep posting to the users.

There's a lot of room for improvement here. Here's a bullet point from the top of my mind:

 - Add other subscription methods ("newHeads", "newPendingTransactions", "syncing")
 - Allow users to send action requests, like a eth_call or eth_getBalance
 - Add other providers
 - Fix scalability issues and better error handling

If you have an idea on how to improve something, please fell free to open an issue/PR.

### to-do list
 - fix types inconsistences.
 - create logo and homepage
 - find other 2 users


## Running the webserver

Copy the .env_template file to a file named `.env`. Then replace the mongo connection string with one pointing to your mongo server. After that, issue:

```
cd webserver
npm install
ts-node index.ts
```

## Testing zapier-app

Copy the .env_template file to a file named `.env`. Insert the required credentials and url. After that, issue:

```
cd zapier-app

# install the CLI globally
npm install -g zapier-platform-cli
npm install
zapier test
```
