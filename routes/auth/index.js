const express = require('express');
const router = express.Router();
const { body, param, check } = require('express-validator');
const { register, login } = require('../../controller/auth/auth');

router.post(
	'/signup',
	[
		body('email')
			.isEmail()
			.trim()
			// .withMessage('Please enter a valid Email')
			.exists({ checkNull: true, checkFalsy: true }),
		body('password')
			.isString()
			.trim()
			.isLength({ min: 8 })
			.withMessage('min 8')
			.isLength({ max: 20 })
			.withMessage('max 20')
			.isAlphanumeric()
			.withMessage('Please enter password with text and number'),
		body('confirmPassword').custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Password dont match');
			}
			return true;
		}),
	],
	register
);

router.post(
	'/signin',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid Email')
			.trim()
			.exists({ checkNull: true, checkFalsy: true }),
		body('password')
			.isString()
			.isLength({ min: 6 })
			.withMessage('min 6')
			.isAlphanumeric()
			.withMessage('Please enter password with text and number')
			.trim(),
	],
	login
);

module.exports = router;
// module.exports = router;
