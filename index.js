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
  // console.log(lastRequestToken);
  res.redirect(authoriseURL);
}); 

app.get('/callback', async function(req, res) {
  let oauth_verifier = req.query.oauth_verifier;
  let accessToken = await xero.oauth1Client.swapRequestTokenforAccessToken(lastRequestToken, oauth_verifier);
  // organisations
  let org = await xero.organisations.get();

  // get accounts
  let accounts = await xero.accounts.get();

  // make Contact
  const newContact = await xero.contacts.create({
    "Contacts": [
      { 
        "Name": "asdasdddddddddddDDDDDDDDDDDDDDDDDDDDDDDdd",
      },
      {
        "Name": 'Zhen',
      }
    ]  
  });
  const contacts = await xero.contacts.get();
  console.log(newContact);

  // make invoices
  const newInvoice = await xero.invoices.create(
    {
      "Type": "ACCREC",
      "Contact": { 
        "ContactID": "bf6fa631-34e2-4344-9255-96ce6d523990" 
      },
      "DueDate": "\/Date(1518685950940+0000)\/",
      "LineItems": [
        { 
          "Description": "Zhen Services as agreed",
          "Quantity": "4",
          "UnitAmount": "100.00",
          "AccountCode": "200"
        }
      ],
      "Status": "AUTHORISED"
    }
  );
  const invoices = await xero.invoices.get({InvoiceID: newInvoice.Invoices[0].InvoiceID});

  // payments
  const payment = await xero.payments.create(
    {
      "Invoice": { "InvoiceID": newInvoice.Invoices[0].InvoiceID },
      "Account": {                
        "AccountID": "13918178-849a-4823-9a31-57b7eac713d7",
        "Code": "090" 
      },
      "Date": "2009-09-08",
      "Amount": 32.06
    }
  );
  const result = await xero.paymentServices.create({
    "PaymentServices": [{
      "PaymentServiceID": "7f0f43b1-9ba9-4ba4-a785-e677652c7d7e",
      "PaymentServiceName": "Awesome Pay",
      "PaymentServiceUrl": "https://www.awesomepay.com/?invoiceNo=[INVOICENUMBER]&currency=[CURRENCY]&amount=[AMOUNTDUE]&shortCode=[SHORTCODE]",
      "PayNowText": "Pay via AwesomePay",
      "PaymentServiceType": "Custom"
    }]
  });
  console.log(result);
  res.setHeader("Content-Type", "application/JSON");
  res.send(JSON.stringify(await xero.payments.get(), null, 4));
})

app.listen(app.get('port'), function() {
  console.log('App running on http://localhost:3000/');
})