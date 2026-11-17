const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
module.exports.authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) return res.status(401).json({success:false,message:'Access denied.'});
  let decoded;
  try { decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET); }
  catch { return res.status(401).json({success:false,message:'Invalid or expired token.'}); }
  if (!['company','jobseeker','admin'].includes(decoded.role)) return res.status(403).json({success:false,message:'This account type is no longer supported.'});
  try {
    const account = await userModel.findById(decoded._id).select('role isSuspended');
    if (!account || account.role !== decoded.role || account.isSuspended) return res.status(403).json({success:false,message:'This session is no longer permitted. Sign in again or contact support.'});
    req.user = {_id:String(account._id),role:account.role};
    next();
  } catch { return res.status(503).json({success:false,message:'Unable to verify your session. Please try again.'}); }
};
module.exports.requireCompany = (req,res,next) => req.user?.role === 'company' ? next() : res.status(403).json({success:false,message:'Company access required.'});
module.exports.requireJobseeker = (req,res,next) => req.user?.role === 'jobseeker' ? next() : res.status(403).json({success:false,message:'Jobseeker access required.'});
module.exports.requireAdmin = (req,res,next) => req.user?.role === 'admin' ? next() : res.status(403).json({success:false,message:'Admin access required.'});
