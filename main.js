var request = require('request'),
	cheerio = require('cheerio'),
	getCSV = require('./getcsv'),
	fs = require('fs'),
	csv = require('fast-csv'),
	async = require('async');

require('./date.js');
var date = new Date().toString('M/d/yyyy');