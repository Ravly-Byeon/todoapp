var router = require('express').Router();
function login(req,res,next){
    if(req.user){
        //req.user가 있는지 검사 (로그인 후 세션이 있으면 req.user가 항상 있음)
        next();
    }else{
        res.send('로그인을 하세요');
    }
}
router.get('/shirts',login,function(req,res){
    res.send('셔츠 파는 페이지');
});

router.get('/pants',login,function(req,res){
    res.send('바지 파는 페이지');
});

module.exports = router;