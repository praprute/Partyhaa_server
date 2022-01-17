const express = require('express');
const router = express.Router();
const { body, param, check } = require('express-validator');
const { requireSignin } = require('../../controller/auth/auth');
const {
	regisRoom,
	getType,
	getPartyRoom,
	getImage,
	joinParty,
	getPeopleJoin,
} = require('../../controller/party');

router.post('/created', requireSignin, regisRoom);
router.get('/getType',  getType);
router.get('/getPeopleJoin/:idRoom', getPeopleJoin);
router.get('/getPartyRoom', getPartyRoom);
router.post('/getImage', getImage);
router.post('/JoinParty', requireSignin, joinParty);


module.exports = router;