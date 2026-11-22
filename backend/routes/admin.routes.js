const router = require('express').Router();
const {authenticate,requireAdmin} = require('../middleware/auth');
const admin = require('../controllers/admin.controllers');
router.use(authenticate,requireAdmin);
router.get('/overview',admin.overview);
router.get('/:resource',admin.list);
router.get('/:resource/:id',admin.get);
router.patch('/:resource/:id',admin.update);
module.exports=router;
