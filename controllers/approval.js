const e = require('express')
// const login_data = require('../models/auth')
const helper_func = require('../models/helper')

exports.get_default = (req, res, next) => {
	login_data=req.session;
	helper_func.updateApproval(req.query.id, req.query.status).then(() => {
		helper_func.getRequests('t', 'f').then((doneIngReq) => {
			helper_func.getRequests('f', 'f').then((doneMiscReq) => {
				res.render('ownerTemp', {
					doneIngReq: doneIngReq,
					doneMiscReq: doneMiscReq,
				})
			})
		})
	})
}
