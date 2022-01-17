const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const config = require('../../config');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt');
const { resp } = require('../../helper/response');
const authCheck = require('../../helper/PareJWT');
const fs = require('fs');

exports.getType = async (req, res, next) => {
	try {
		// var { body } = req;
		await req.getConnection(async (err, connection) => {
			if (err) return next(err);
			var getTypeSQL = 'SELECT idroomType, name FROM partyhaan.roomType;';
			await connection.query(getTypeSQL, [], async (err, result) => {
				if (err) {
					return next(err);
				} else {
					return res.status(200).send(resp(true, result, null, null));
				}
			});
		});
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};

exports.getPartyRoom = async (req, res, next) => {
	try {
		await req.getConnection(async (err, connection) => {
			if (err) return next(err);
			var getPartySQL = `SELECT idroomJoin,partyName,name AS typeRoom ,email, create_id,content,quantity,people,timestamp  FROM partyhaan.roomJoin 
			INNER JOIN (SELECT idUser, email FROM partyhaan.users) user ON user.idUser = roomJoin.create_id
			INNER JOIN (SELECT idroomType,name FROM partyhaan.roomType) TypeRoom ON TypeRoom.idroomType = roomJoin.type
			ORDER BY timestamp DESC
			`;
			await connection.query(getPartySQL, [], async (err, result) => {
				if (err) {
					return next(err);
				} else {
					return res.status(200).send(resp(true, result, null, null));
				}
			});
		});
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};

function SedFile(nameImage, res) {
	fs.readFile(`./img/${nameImage}`, `base64`, (err, base64Image) => {
		const dataUrl = `data:image/jpeg;base64, ${base64Image}`;
		// console.log('base64Image : ', base64Image);
		return res.status(200).send(resp(true, dataUrl, null, null));
	});
}

exports.getImage = async (req, res, next) => {
	try {
		var { body } = req;
		// console.log(body);
		switch (body.type) {
			case 'youtube':
				SedFile('youtube.png', res);
				// code block
				break;
			case 'netflix':
				SedFile('netflix.png', res);
				// code block
				break;
			case 'disney plus':
				SedFile('disney.png', res);
				// code block
				break;
			case 'HBO':
				SedFile('HBO.png', res);
				// code block
				break;
			default:
			// code block
		}
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};

exports.regisRoom = async (req, res, next) => {
	try {
		var { body } = req;
		let type = req.body.type;
		let content = req.body.content;
		let quantity = body.quantity;
		let partyName = body.partyName;

		await req.getConnection(async (err, connection) => {
			if (err) return next(err);
			await authCheck.getUserId(
				req.headers.authorization,
				async (id, email, approve) => {
					var CreateSQL = `INSERT INTO partyhaan.roomJoin (create_id, type, content, quantity, partyName) VALUES ('${id}', '${type}', '${content}', '${quantity}', '${partyName}');`;
					await connection.query(CreateSQL, [], async (err, result) => {
						if (err) {
							return next(err);
						} else {
						
							var createTransaction = `INSERT INTO partyhaan.TransactionJoin (room, user) VALUES (${result.insertId} , ${id})`;
							await connection.query(
								createTransaction,
								[],
								async (err, result) => {
									if (err) {
										return next(err);
									} else {
										return res
											.status(200)
											.send(
												resp(
													true,
													result,
													'Create Room Success',
													'สร้างปาตี้เรียบร้อย'
												)
											);
									}
								}
							);
						}
					});
				}
			);
		});
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};

exports.getPeopleJoin = async (req, res, next) => {
	try {
		await req.getConnection(async (err, connection) => {
			if (err) return next(err);
			var getPeopleSQL = `SELECT * FROM partyhaan.TransactionJoin where room = ${req.params.idRoom}; `;
			await connection.query(getPeopleSQL, [], async (err, result) => {
				if (err) {
					return next(err);
				} else {
					return res.status(200).send(resp(true, result, null, null));
				}
			});
		});
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};

exports.joinParty = async (req, res, next) => {
	try {
		var { body } = req;
		let idRoom = req.body.idRoom;
		await req.getConnection(async (err, connection) => {
			if (err) return next(err);
			await authCheck.getUserId(
				req.headers.authorization,
				async (id, email, approve) => {
					var CheckDubbleJoin = `SELECT * FROM partyhaan.TransactionJoin where room = ${idRoom} and user = ${id};`;
					await connection.query(CheckDubbleJoin, [], async (err, result) => {
						if (err) {
							return next(err);
						}
						if (result.length > 0) {
							return res
								.status(200)
								.send(
									resp(
										false,
										result,
										'Join Room has Duplicate',
										'คุณเข้าร่วมปาตี้นี้ไปแล้ว'
									)
								);
						} else {
							var CheckFullJoin = `SELECT idroomJoin,quantity,user FROM partyhaan.roomJoin 
							INNER JOIN (SELECT idUser, email FROM partyhaan.users) user ON user.idUser = roomJoin.create_id
							INNER JOIN (SELECT idroomType,name FROM partyhaan.roomType) TypeRoom ON TypeRoom.idroomType = roomJoin.type
							INNER JOIN (SELECT room, user FROM partyhaan.TransactionJoin) TJ ON TJ.room = idroomJoin
							WHERE idroomJoin = ${idRoom}
							ORDER BY timestamp ASC`;
							await connection.query(CheckFullJoin, [], async (err, result) => {
								if (err) {
									return next(err);
								} else {
								
									if (result.length == result[0].quantity) {
										return res
											.status(200)
											.send(
												resp(
													false,
													result,
													'Join Room has Full',
													'ปาตี้นี้เต็มเเล้ว'
												)
											);
									} else {
										var JoinParty = `INSERT INTO partyhaan.TransactionJoin (room, user) VALUES (${idRoom} , ${id})`;
										await connection.query(
											JoinParty,
											[],
											async (err, result) => {
												if (err) {
													return next(err);
												} else {
													return res
														.status(200)
														.send(
															resp(
																true,
																result,
																'Join Room Success',
																'คุณเข้าร่วมปาตี้นี้เรียบร้อย'
															)
														);
												}
											}
										);
									}
								}
							});
						}
					});
				}
			);
		});
	} catch (err) {
		res.status(500).send({
			success: 'ERROR',
			message: err.message,
		});
	}
};
