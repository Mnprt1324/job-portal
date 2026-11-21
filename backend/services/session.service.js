const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
async function verifySession(token) {
  let decoded;
  try { decoded=jwt.verify(token,process.env.JWT_SECRET); }
  catch { throw Object.assign(new Error('Invalid or expired token.'),{status:401}); }
  if (!['company','jobseeker','admin'].includes(decoded.role)) throw Object.assign(new Error('This account type is no longer supported.'),{status:403});
  const account=await User.findById(decoded._id).select('role isSuspended');
  if (!account || account.isSuspended || account.role!==decoded.role) throw Object.assign(new Error('This session is no longer permitted.'),{status:403});
  return {_id:String(account._id),role:account.role,expiresAt:decoded.exp*1000};
}
module.exports={verifySession};
