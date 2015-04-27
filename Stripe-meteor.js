// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Items = new Mongo.Collection("items");
Customers = new Mongo.Collection("customer details");

if (Meteor.isClient) {
  var price;

    function onCreationofToken(token){
        stripeToken = token.id;
        stripeEmail = token.email;
        Customers.insert({
            cusEmail: stripeEmail,
            cusCard: stripeToken
        });
        Meteor.call('chargeCard', stripeToken, price, stripeEmail);
        }

  var checkout = StripeCheckout.configure({
    key: 'pk_test_Z1eYlRSEH3ppUHqXxidAliOj', //test stripe publishable key
    // The callback after checkout is complete
    token: onCreationofToken
  });

  Template.list.helpers({
    items: function () {
      return Items.find();
    }
  });

  Template.item.events({
    'click .buy': function (event) {
      event.preventDefault();
      price = this.price * 100;
      checkout.open({
          });
    }
  });
}

// On server startup, create some items if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Items.find().count() === 0) {
      var names = ["Item 1", "Item 2", "Item 3",
                   "Item 4", "Item 5", "Item 6"];
      names.each(names, function (name) {
        Items.insert({
          name: name,
          price: Math.floor(Random.fraction() * 10) * 5
        });
      });
    }
  });

  Meteor.methods({
      'chargeCard': function(stripeToken, price, stripeEmail) {
          var Stripe = StripeAPI('sk_test_weYszsKrOxQB952IBECHyrLE'); //test stripe secret key

          Stripe.charges.create({
              amount: price,
              currency: 'usd',
              card: stripeToken,
              description: "Charge for "+ stripeEmail, //An arbitrary string which you can attach to a charge object. It is displayed when in the web interface alongside the charge. Note that if you use Stripe to send automatic email receipts to your customers, your receipt emails will include the description of the charge(s) that they are describing.
              receipt_email: stripeEmail //The email address to send this charge's receipt to.
      }, function(err, res) {
        if(err){console.log(err);}
        else{console.log(res);
            return true;}
    });

          Meteor.Mandrill.sendTemplate(
              {
                  "key": "KsgfMBrfNBHasKMvALfd_w",
                  // template key
                  "template_name": "purchase-html",
                  // template dynamic content
                  "template_content": [
                      {
                          // name: "userFirstName",
                          // main: "Vince Carter"
                      }],
                // Read more on how to use merge tags in the Mandrill Docs
                // http://help.mandrill.com/entries/21678522-How-do-I-use-merge-tags-to-add-dynamic-content-message:
                  message: {
                      "global_merge_vars": [
                          {
                              name: "var1",
                              content: "Global Value 1"
                          }
                    ],
                    "merge_vars": [
                        {
                            "rcpt": "emailadress@domain.com",
                            "vars": [
                                {
                                    "name": "fname",
                                    "content": "John"
                                },
                                {
                                    "name": "lname",
                                    "content": "Smith"
                                }
                            ]
                        }
                    ],

                      "to":[
                          {email: stripeEmail}
                      ]
                }
            });

          twilio = Twilio('AC0f353c15337b4007e8ef18a5f023b202', '8a1e68d11f24e2ff391109f9d9318fc6');
          twilio.sendSms({
             to:'+17042647864', // Any number Twilio can deliver to
             from: '+17044133411', // A number you bought from Twilio and can use for outbound communication
             body: 'Test.' // body of the SMS message
          }, function(err, responseData) { //this function is executed when a response is received from Twilio
              if (!err) { // "err" is an error received during the request, if any
                  // "responseData" is a JavaScript object containing data received from Twilio.
                  console.log(responseData.from); // outputs "+17044133411"
                  console.log(responseData.body); // outputs "Test."
              }
            });
        twilio.makeCall({
            to:'+16515556677', // Any number Twilio can call
            from: '+17044133411', // A number you bought from Twilio and can use for outbound communication
            url: 'http://www.example.com/twiml.xml' // A URL that produces an XML document (TwiML) which contains instructions for the call
        }, function(err, responseData) {
                //executed when the call has been initiated.
            console.log(responseData.from); // outputs "+17044133411"
        });
}


          // 'createCustomer': function(stripeToken, stripeEmail) {
          //   var Stripe = StripeAPI('sk_test_weYszsKrOxQB952IBECHyrLE'); //test stripe secret key

          //  Stripe.customers.create({
          //    source: stripeToken,
          //   description: "Charge for "+ stripeEmail, //An arbitrary string which you can attach to a charge object. It is displayed when in the web interface alongside the charge. Note that if you use Stripe to send automatic email receipts to your customers, your receipt emails will include the description of the charge(s) that they are describing.
          // }, function(err, res) {
          //    if(err){console.log(err);}
          //    else{console.log(res);
          //     return true;}
          // });
      // }
});
}
