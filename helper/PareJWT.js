exports.getUserId = (token, callback) => {
	const atob = require('atob');
	var base64Url = token.split('.')[1];
	// var base64 = base64Url.replace("-", "+").replace("_", "/")
	var tokenData = JSON.parse(atob(base64Url));
	callback(tokenData.id, tokenData.email, tokenData.iat);
};
