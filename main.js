var request = require('request'),
	cheerio = require('cheerio'),
	async = require('async');

//store all items you would like to purchase in this array 
var wish_list_urls = [
	'http://www.amazon.ca/gp/product/B00NF47XBW?dpID=51wbcAAkStL&dpSrc=sims&preST=_SL500_SR135%2C135_&refRID=RHYBH11BACHNT6194S5C&ref_=pd_rhf_gw_s_cp_2',
	'http://www.amazon.ca/gp/product/B00NA00MWS?redirect=true&ref_=br_asw_pdt-3'
];

async.eachSeries(wish_list_urls, function(item, next_item){
	request(item, function(err, response, body){
		if (!err && response.statusCode == 200){
			var $ = cheerio.load(body);
			$('#priceblock_ourprice_row').each(function(index, items){
				price = $(items).find('#priceblock_ourprice').text();
				console.log(price);
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

