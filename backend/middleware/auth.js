const { verifySession } = require('../services/session.service');
module.exports.authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return res.status(401).json({success:false,message:'Access denied.'});
  try {
    const session = await verifySession(authorization.slice(7));
    req.user = {_id:session._id,role:session.role};
    next();
  } catch (error) {
    return res.status(error.status || 503).json({success:false,message:error.status ? error.message : 'Unable to verify your session. Please try again.'});
  }
};
module.exports.requireCompany = (req,res,next) => req.user?.role === 'company' ? next() : res.status(403).json({success:false,message:'Company access required.'});
module.exports.requireJobseeker = (req,res,next) => req.user?.role === 'jobseeker' ? next() : res.status(403).json({success:false,message:'Jobseeker access required.'});
module.exports.requireAdmin = (req,res,next) => req.user?.role === 'admin' ? next() : res.status(403).json({success:false,message:'Admin access required.'});
