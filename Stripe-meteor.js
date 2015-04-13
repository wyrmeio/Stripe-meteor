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
          name: 'Company Name, Inc.',
          description: this.name,
          amount: this.price * 100 // this is cents, not dollars
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
      _.each(names, function (name) {
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
