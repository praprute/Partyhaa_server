const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('./../../config');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const { resp } = require('./../../helper/response');

exports.register = async (req, res, next) => {
	try {
		var { body } = req;
		let email = req.body.email;
		let password = body.password;
		let confirmPassword = body.confirmPassword;
		let accept = body.accept;
		console.log(body);
		const passwordHash = bcrypt.hashSync(password, 10);
		const errors = await validationResult(req);

		if (!errors.isEmpty()) {
			res.status(200).send(resp(false, errors.array(), null, null));
		} else {
			await req.getConnection(async (err, connection) => {
				if (err) return next(err);
				var ckechEmail = `SELECT email FROM partyhaan.users where email = '${email}' ;`;
				var insertUser = `INSERT INTO partyhaan.users (email, password,accept) VALUES ('${email}','${passwordHash}',${accept}); `;
				await connection.query(ckechEmail, [], async (err, result) => {
					if (err) {
						return next(err);
					}
					if (result.length > 0) {
						return res
							.status(200)
							.send(
								resp(
									false,
									errors.array(),
									'Email is duplicate',
									'อีเมลนี้ถูกใช้เรียบร้อย'
								)
							);
					} else {
						await connection.query(insertUser, [], async (err, result) => {
							if (err) {
								return next(err);
							} else {
								return res
									.status(200)
									.send(
										resp(
											true,
											result,
											'Register Success',
											'สมัครสมาชิกเรียบร้อย'
										)
									);
							}
						});
					}
				});
			});
		}
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};

exports.requireSignin = expressJwt({
	secret: config.secret,
	userProperty: 'auth',
	algorithms: ['sha1', 'RS256', 'HS256'],
});

exports.login = async (req, res) => {
	try {
		var { body } = req;
		let email = body.email;
		let password = body.password;
		const errors = await validationResult(req);

		if (!errors.isEmpty()) {
			res.status(200).send(resp(false, errors.array(), null, null));
		} else {
			await req.getConnection(async (err, connection) => {
				if (err) return next(err);
				var sql = `SELECT*FROM partyhaan.users where email='${email}' ;`
				connection.query(sql, [], (err, result) => {
					if (err) {
						return next(err);
					}
					if (result[0]) {
						const isCorrect = bcrypt.compareSync(password, result[0].password);
						if (isCorrect) {
							const token = jwt.sign(
								{
									id: result[0].idUser,
									email: result[0].email,
									iat: Math.floor(new Date() / 1000),
								},
								config.secret
							);
							res.cookie('tokenShareExpire', token, {
								expire: new Date() + 9999,
							});
							return res.status(200).send(
								resp(
									true,
									{
										token: token,
									},
									'Login Success',
									'เข้าสู่ระบบเรียบร้อย'
								)
							);
						} else {
							return res
								.status(200)
								.send(
									resp(false, null, 'password not true', 'รหัสผ่านไม่ถูกต้อง')
								);
						}
					} else {
						return res
							.status(200)
							.send(
								resp(
									false,
									null,
									'Pls registeration',
									'กรุณาสมัครสมาชิกเพื่อเข้าใช้งาน'
								)
							);
					}
				});
			});
		}
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};
