// const fs = require('fs');

module.exports = {
	secret:
		'4r0j959709ni62dasdfkaknkndfvkwe6783993h13bjsdcksjdvkawdf392832340192ekjfbkjfa8366612553078u478o',
	dbOptions: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
		database: process.env.DB,
		dateStrings: true,
		insecureAuth: true,
	},
};
