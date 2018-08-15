const express = require('express');
const XeroClient = require('xero-node').AccountingAPIClient;
const config = require('./config.json');

let app = express();
let xero = new XeroClient(config);

let lastRequestToken = null;

app.set('port', 3000);

app.get('/', function(reg, res){
  res.send('<a href="/connect"> Connect to Xero</a>')
});

app.get('/connect', async function(req, res) {
  lastRequestToken = await xero.oauth1Client.getRequestToken();
  let authoriseURL = xero.oauth1Client.buildAuthoriseUrl(lastRequestToken);
  console.log(lastRequestToken);
  res.redirect(authoriseURL);
}); 

app.get('/callback', async function(req, res) {
  let oauth_verifier = req.query.oauth_verifier;
  let accessToken = await xero.oauth1Client.swapRequestTokenforAccessToken(lastRequestToken, oauth_verifier);

  let org = await xero.organisations.get();
  let invoices = await xero.invoices.get();
  let invoiceId = invoices.Invoices[0].id;

  res.send(invoiceId);
})

app.listen(app.get('port'), function() {
  console.log('App running on http://localhost:3000/');
})