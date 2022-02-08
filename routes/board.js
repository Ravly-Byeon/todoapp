var router = require('express').Router();

function login(req,res,next){
    if(req.user){
        //req.user가 있는지 검사 (로그인 후 세션이 있으면 req.user가 항상 있음)
        next();
    }else{
        res.send('로그인을 하세요');
    }
}

//여기 있는 모든 라우트들에 적용할 미들웨어
router.use(login);

//sports에 접속 할 때만 미들웨어 적용
// router.use('/sports',login);

router.get('/sports',function(req,res){
    res.send('스포츠 게시판');
});
router.get('/game',function(req,res){
    res.send('게임 게시판');
});

module.exports = router;