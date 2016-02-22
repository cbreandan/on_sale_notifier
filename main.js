var request = require('request'),
	cheerio = require('cheerio'),
	async = require('async');

//store all items you would like to purchase in this array 
var wish_list_urls = [
	'http://www.amazon.ca/gp/product/B00NF47XBW?dpID=51wbcAAkStL&dpSrc=sims&preST=_SL500_SR135%2C135_&refRID=RHYBH11BACHNT6194S5C&ref_=pd_rhf_gw_s_cp_2',
	'http://www.amazon.ca/gp/product/B00NA00MWS?redirect=true&ref_=br_asw_pdt-3',
	'http://www.amazon.com/Xbox-One-Elite-Wireless-Controller/dp/B00ZDNNRB8/ref=sr_1_28?s=electronics&ie=UTF8&qid=1456165519&sr=1-28&refinements=p_n_availability%3A1248801011'
];

async.eachSeries(wish_list_urls, function(item, next_item){
	request(item, function(err, response, body){
		if (!err && response.statusCode == 200){
			var $ = cheerio.load(body);
			$('.a-lineitem').each(function(index, items){
				list_price = $(items).find('td.a-span12.a-color-secondary.a-size-base.a-text-strike').text();
				console.log('List Price: ' + list_price); 
				price = $(items).find('#priceblock_ourprice').text();
				console.log('Price: ' + price);
				savings = $(items).find('td.a-span12.a-color-price.a-size-base').text();
				savings = savings.replace(savings.substring(10,13), ''); //trim spaces
				savings = savings.substring(0, savings.indexOf(')')+1); //trim spaces
				console.log('Savings: ' + savings);
			});
			$('#availability').each(function(index, items){
				availability = $(items).find('.a-size-medium').text();
				availability = availability.replace(availability.substring(0,35), ''); //trim spaces
				console.log('Availability: ' + availability);
			});
			return next_item();
		} else {
			console.log('We have encountered ' + err);
			return next_item();
		}
	});
}, function(){
	console.log('done');
});


