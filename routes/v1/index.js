const router = require('express').Router();

// point
const point = require('./point')
router.use('/point', point)


router.all('*',(req, res)=>{
	res.status(404).send({success:false, msg:`paf-v1-api unknown uri ${req.path}`});
})

module.exports = router;