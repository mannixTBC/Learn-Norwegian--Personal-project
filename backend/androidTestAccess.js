// Temporary, server-controlled testing policy. A client header alone grants
// nothing: requireAuth must first resolve the real, non-anonymous account.
const isAndroidClient=req=>req?.headers?.['x-nordlingo-client']==='android';
const isAndroidTestUser=req=>process.env.ANDROID_TEST_UNLIMITED==='true'
 && isAndroidClient(req) && !!req.userId && req.verifiedUser?.id===req.userId
 && req.verifiedUser.is_anonymous===false;
module.exports={isAndroidClient,isAndroidTestUser};
