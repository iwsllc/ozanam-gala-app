var paypal_sdk = require('paypal-rest-sdk')
var reg = require('./registrations')
var url = require('url')
var number = require('../lib/number')


var payment = function() {
  var self = this
  self.intent = 'sale'
  self.payer = {
    payment_method: 'paypal'
  }
  self.redirect_urls = {
    return_url: (process.env.ENABLESSL == 'yes' ? 'https://' + process.env.SSLHOSTNAME : 'http://' + process.env.HOSTNAME) + 
    '/register/finish',
    cancel_url: (process.env.ENABLESSL == 'yes' ? 'https://' + process.env.SSLHOSTNAME : 'http://' + process.env.HOSTNAME) + 
    '/register/confirm?confirm='
  }
  self.transactions = []
  return self
}
exports.finish = function(registrationId, callback) {
  reg.findById(registrationId, function(err,record) {
    if (err) return callback(err);
    if (!record) return callback('Registration not found.')

    var exec = '';
    for(var ix=0;ix<record.payment.links.length;ix++) {
      var item = record.payment.links[ix];
      if (item.rel === 'execute') {
        exec = item.href;
        break;
      }
    }

    paypal_sdk.payment.execute(record.payment.id,{payer_id: record.payment.payerId },function(err,result) {
      if (err) return callback(err, record);
      if (result.state !== 'approved')
        return callback('Failed to complete purchase.', record) //redir to check by mail thanks. 
      
      reg.setSaleLinks(record._id, result.links)

      return callback(null, record);
    })
  })

}

exports.start = function(registration, callback) {
  var temp = new payment();
  temp.redirect_urls.cancel_url += registration._id.toHexString()

  var items = [];
        
  if (registration.order.level !== 10)
    items.push({
          quantity: 1, 
          name:'2013 Ozanam Hollywood Holiday Gala Sponsorship', 
          price:number.formatMoney(reg.getSponsorshipAmount(registration.order.level)),  
          currency:'USD'
        })

  if (registration.order.extraSeats)
    items.push({
          quantity: registration.order.extraSeats, 
          name:'Extra Seats', 
          price:number.formatMoney(reg.getExtraSeatsPrice()),  
          currency:'USD'
        })

  if (registration.order.donation)
    items.push({
          quantity: 1, 
          name:'Additional Donation', 
          price:number.formatMoney(registration.order.donation),  
          currency:'USD'
        })

  temp.transactions.push({ 
    amount: {
      currency: 'USD', 
      total: number.formatMoney(registration.order.total),
      details: {
        subtotal : number.formatMoney(registration.order.total)
      }
    }, 
    description: '2013 Ozanam Hollywood Holiday Gala registration.',
    item_list: { 
      items: items
    }
  })

  paypal_sdk.payment.create(temp, function(err,payment) {
    if (err) return callback(err)

    var approval = '';
    for(ix=0;ix<payment.links.length;ix++) {
      if (payment.links[ix].rel === 'approval_url') {
        approval = payment.links[ix].href
        break
      }
    }

    var parts = url.parse(approval, true)

    registration.payment = {
      id: payment.id,
      links: payment.links,
      token: parts.query['token']
    }

    reg.setPayment(registration._id, registration.payment, function(err,count) { 
      if (!err)
        return callback(null,approval)
      else
        return callback('Failed to save payment information.');
    })
  });
}