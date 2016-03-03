var request = require('request'),
	cheerio = require('cheerio'),
	async = require('async');

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

require('./date.js');
var date = new Date().toString('dd/MM/yyyy');

//store all Amazon items you would like to purchase in this array 
var wish_list_urls_amazon = [
	'http://www.amazon.ca/gp/product/B00NF47XBW?dpID=51wbcAAkStL&dpSrc=sims&preST=_SL500_SR135%2C135_&refRID=RHYBH11BACHNT6194S5C&ref_=pd_rhf_gw_s_cp_2',
	'http://www.amazon.ca/gp/product/B00NA00MWS?redirect=true&ref_=br_asw_pdt-3',
	'http://www.amazon.com/Xbox-One-Elite-Wireless-Controller/dp/B00ZDNNRB8/ref=sr_1_28?s=electronics&ie=UTF8&qid=1456165519&sr=1-28&refinements=p_n_availability%3A1248801011',
	'http://www.amazon.ca/gp/product/B00NF47XBW?dpID=51wbcAAkStL&dpSrc=sims&preST=_SL500_SR135%2C135_&refRID=RHYBH11BACHNT6194S5C&ref_=pd_rhf_gw_s_cp_2'
];

//store all eBay items you would like to purchase in this array 
var wish_list_urls_ebay = [
	'http://www.ebay.ca/itm/HP-15-an050ca-15-6-Bilingual-Laptop-Star-Wars-Special-Edition-Intel-Core-i5-6-/172003805969?_trkparms=%26rpp_cid%3D53e2416ae4b08323476c41b3%26rpp_icid%3D56bcb770e4b072686e5395f4',
	'http://www.ebay.ca/itm/100-arrow-vanes-4-/272142421662?hash=item3f5cf3ce9e:g:i00AAOSwoydWpDew'
];

var message = 'Hello There!<br> <br> <b>This email is notifying you that some of the items on your wish-list are on sale today! </b><br>';

if (wish_list_urls_amazon.length > 0){
	async.eachSeries(wish_list_urls_amazon, function(item, next_item){
		request(item, function(err, response, body){
			if (!err && response.statusCode == 200){
				var $ = cheerio.load(body);
				$('#centerCol').each(function(index, items){
					product = $(items).find('#productTitle').text();
					console.log(product);
				});
				$('#availability').each(function(index, items){
					availability = $(items).find('.a-size-medium').text();
					availability = availability.replace(availability.substring(0,35), ''); //trim spaces
					console.log('Availability: ' + availability);
				});
				$('.a-lineitem').each(function(index, items){
					list_price = $(items).find('td.a-span12.a-color-secondary.a-size-base.a-text-strike').text();
					console.log('List Price: ' + list_price); 
					price = $(items).find('#priceblock_ourprice').text();
					console.log('Price: ' + price);
					savings = $(items).find('td.a-span12.a-color-price.a-size-base').text();
					savings = savings.replace(savings.substring(10,13), ''); //trim spaces
					savings = savings.substring(0, savings.indexOf(')')+1); //trim spaces
					console.log('Savings: ' + savings);
					console.log(savings != '');
					if (savings != ''){
						message = message + '<br>' + product + ' :' + '<br>' + '<b>ORIGINAL PRICE:</b> ' + list_price + ' ,<b>NOW:</b> ' + 
						price + ' , <b>YOU SAVE:</b> ' + savings + ' , <b>Availability:</b> ' + availability + '<br>' + 'Purchase: ' + item + '<br><br>';
					}
				});
				return next_item();
			} else {
				console.log('We have encountered ' + err);
				return next_item();
			}
		});
	}, function(){
		console.log(message);

		async.eachSeries(wish_list_urls_ebay, function(item, next_item){
			request(item, function(err, response, body){
				if (!err && response.statusCode == 200){
					var $ = cheerio.load(body);
					$('div#CenterPanelInternal').each(function(index, items){
						product = $(items).find('h1#itemTitle.it-ttl').text().substring(16);
						console.log(product);
						list_price = $(items).find('span#orgPrc.notranslate.ms-orp').text().trim();
						console.log(list_price);
						price = $(items).find('span#prcIsum.notranslate').text().trim();
						console.log(price);
						savings = $(items).find('span#youSaveSTP.notranslate.ms-as-red').text().trim();
						console.log(savings);
						availability = $(items).find('span#qtySubTxt').text().trim();
						console.log(availability);
						if (savings != ''){
							message = message + '<br>' + product + ' :' + '<br>' + '<b>ORIGINAL PRICE:</b> ' + list_price + ' ,<b>NOW:</b> ' + 
							price + ' , <b>YOU SAVE:</b> ' + savings + ' , <b>Availability:</b> ' + availability + '<br>' + 'Purchase: ' + item + '<br><br>';
						}
					});
					return next_item();
				} else {
					console.log('err');
					return next_item();
				}
			});
		}, function(){
			if (message == 'Hello There!<br> <br> <b>This email is notifying you that some of the items on your wish-list are on sale today! </b><br>'){
			//do nothing
			} else {
				// make sure you 'turn on' to allow access for less secure apps
				// https://www.google.com/settings/security/lesssecureapps
				var options = {
				    service: 'gmail',
				    auth: {
				        user: 'amazon.discount.mailer@gmail.com',
				        pass: '13243546576879'
				    }
				};

				var transporter = nodemailer.createTransport(smtpTransport(options))

				var mailOptions = {
				    from: 'amazon.discount.mailer@gmail.com', 
				    to: 'cbreandan@gmail.com', 
				    subject: 'Items on your wish-list are on sale! ' + date, 
				    text: '', 
				    html: message
				}

				transporter.sendMail(mailOptions, function(error, response){
				  if (error){
				      console.log(error);
				  } else{
				      console.log("Message sent: " + response);
				  }
				});
			}
		});
	});
} else { //there's no items in amazon list, run eBay list
	async.eachSeries(wish_list_urls_ebay, function(item, next_item){
		request(item, function(err, response, body){
			if (!err && response.statusCode == 200){
				var $ = cheerio.load(body);
				$('div#CenterPanelInternal').each(function(index, items){
					product = $(items).find('h1#itemTitle.it-ttl').text().substring(16);
					console.log(product);
					list_price = $(items).find('span#orgPrc.notranslate.ms-orp').text().trim();
					console.log(list_price);
					price = $(items).find('span#prcIsum.notranslate').text().trim();
					console.log(price);
					savings = $(items).find('span#youSaveSTP.notranslate.ms-as-red').text().trim();
					console.log(savings);
					availability = $(items).find('span#qtySubTxt').text().trim();
					console.log(availability);
					if (savings != ''){
						message = message + '<br>' + product + ' :' + '<br>' + '<b>ORIGINAL PRICE:</b> ' + list_price + ' ,<b>NOW:</b> ' + 
						price + ' , <b>YOU SAVE:</b> ' + savings + ' , <b>Availability:</b> ' + availability + '<br>' + 'Purchase: ' + item + '<br><br>';
					}
				});
				return next_item();
			} else {
				console.log('err');
				return next_item();
			}
		});
	}, function(){
		if (message == 'Hello There!<br> <br> <b>This email is notifying you that some of the items on your wish-list are on sale today! </b><br>'){
			//do nothing
		} else {
			// make sure you 'turn on' to allow access for less secure apps
			// https://www.google.com/settings/security/lesssecureapps
			var options = {
			    service: 'gmail',
			    auth: {
			        user: 'amazon.discount.mailer@gmail.com',
			        pass: '13243546576879'
			    }
			};

			var transporter = nodemailer.createTransport(smtpTransport(options))

			var mailOptions = {
			    from: 'amazon.discount.mailer@gmail.com', 
			    to: 'cbreandan@gmail.com', 
			    subject: 'Items on your wish-list are on sale! ' + date, 
			    text: '', 
			    html: message
			}

			transporter.sendMail(mailOptions, function(error, response){
			  if (error){
			      console.log(error);
			  } else{
			      console.log("Message sent: " + response);
			  }
			});
		}
	});
}






