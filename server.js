const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;
app.set('view engine','ejs');
app.use('/public',express.static('public'));
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
app.use(session({secret : '비밀코드',resave :true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());
const dotenv = require('dotenv').config();

const { ObjectId}   = require('mongodb');

var db;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.rvjh9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',function(err,client){
    if(err){
        return console.log(err)
    }

    db = client.db('todoapp');
    // db.collection('post').insertOne({_id:100,이름 : 'John' , 나이:20},function(에러, 결과){
    //     console.log('저장완료');
    // });
});

app.listen(3000,function(){
    console.log('listening on 3000');
});



app.get('/pet',function(req, res){
    res.send('펫용품 쇼핑할 수 있는 페이지 입니다.');
});

app.get('/beauty',function(req,res){
   res.send('뷰티 상품 페이지입니다.');
});

app.get('/login',function(req,res){
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local',{
    failureRedirect : '/fail'
}), function(req,res){
    res.redirect('/');
});

app.get('/mypage', login ,function(req,res){
    console.log(req.user);
    res.render('mypage.ejs', {member : req.user});
});

function login(req,res,next){
    if(req.user){
        //req.user가 있는지 검사 (로그인 후 세션이 있으면 req.user가 항상 있음)
        next();
    }else{
        res.redirect('/login');
    }
}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

//세션을 저장시키는 코드(로그인 성공 시 발동)
passport.serializeUser(function (user,done){
    done(null, user.id)
});
//특정 세션데이터 가진 사람을 db에서 찾음 (마이페이지 접속 시 발동)
passport.deserializeUser(function(아이디, done){
    db.collection('login').findOne({id: 아이디}, function(err, result){
        done(null,result);
    });
});

app.post('/register',function(req,res){
    db.collection('login').insertOne({id:req.body.id, pw:req.body.pw},function(err, result){
        res.redirect("/");
    });
});

app.get('/fail',function(req, res){
    res.send('FAIL');
});

app.get('/',function(req,res){
    res.render('index.ejs');
});

app.get('/write',function(req,res){
    res.render('write.ejs');
});

app.post('/add', function(req, res){
    // res.send('전송완료');
    db.collection('counter').findOne({name : '게시물갯수'}, function(err,result){
        console.log(result.totalPost);
        var total = result.totalPost;
        var saveData = {
            _id: total+1,
            title:req.body.title,
            date:req.body.date,
            writer:req.user._id
        }
        db.collection('post').insertOne(saveData,function(err, result){
           if(err) console.log(err);
        });
        db.collection('counter').updateOne({name:'게시물갯수'},{ $inc :{totalPost:1}},function(err, result){
           if(err) { return console.log(err) }
        });
    });
    res.render('write.ejs');
});

app.get('/list',function(req,res){
    db.collection('post').find().toArray(function(err,result){
        console.log(result);
    res.render('list.ejs', {posts : result});
    });
});

app.delete('/delete',function(req,res){
    console.log(req.body._id + "^0^");
    req.body._id = parseInt(req.body._id);
    var deleteData = {
        _id : req.body._id,
        writer : req.user._id
    }
    db.collection('post').deleteOne(deleteData, function(err, result){
        if(err) console.log(err);
       console.log('삭제완료');
       res.status(200).send({message : '성공했습니다.'});
   });
});

app.get('/detail/:id',function(req,res){
    console.log(req.params.id + " ㅇㅅㅇ");
    db.collection('post').findOne({_id : parseInt(req.params.id)},function(err, result){
        console.log(result);
        res.render('detail.ejs',{ data  : result });
    });
});

app.get('/edit/:id',function(req,res){
    console.log(req.params.id+")))");
    db.collection('post').findOne({_id: parseInt(req.params.id)},function(err,result){
        res.render('edit.ejs',{data: result});
    });
});

app.get('/update/:id',function(req,res){
    // db.collection('post').updateOne({_id : parseInt(res.body._id)}, {$set:})
});

app.put('/edit',function(req,res){
    db.collection('post').updateOne({_id : parseInt(req.body._id)},{ $set : {title : req.body.title, date: req.body.date}},function(err,result){
        console.log('수정완료');
        res.redirect('/list');
    });
});




app.get('/search', (req,res) => {
    //쿼리 스트링 전부 출력
    console.log(req.query.value);
    var condition = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                    query: req.query.value,
                    //여러개를 동시에 찾고 싶을 때는 ['','','',...]
                    path: 'title'
                }
            }
        },
        //_id 오름차순 정렬 (-1: 내림차순)
        { $sort :{ _id : -1 } },
        //10개만 제한해서 검색
        { $limit : 10},
        //원하는 검색 결과만 보여줌(타이틀 가져옴(1), _id 안 가져옴(0), 내가 저장한 정보가 아닌 스코어(검색어와 관련도)도 가져옴)
        { $project : { title : 1, _id:0, score: { $meta: "searchScore"}}}
    ]
    db.collection('post').aggregate(condition).toArray((err,result) => {
        console.log(result);
        res.render('search.ejs',{posts : result});
    });
});

//라우터
//shop.js에서 배출한 변수를 첨부해줌 (미들웨어) : '/shop' 경로가 요청되면 해당 미들웨어(라우터)를 적용시킴
app.use('/shop',require('./routes/shop'));

app.use('/board/sub', require('./routes/board'));

//파일 업로드
let multer = require('multer');
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null, './public/image');
    },
    filename: function(req,file,cb){
        cb(null,file.originalname);
    },
    filefilter : function(req,file,cb){
        //필터로 파일 확장자 제한 가능
    }
});
var upload = multer({storage : storage});

app.get('/upload',function(req,res){
    res.render('upload.ejs');
});

app.post('/upload',upload.single('profile'), function(req,res){
    res.send('업로드완료');
});

app.get('/image/:imageName',(req,res)=>{
    return res.sendFile(__dirname+'/public/image/'+ req.params.imageName)
});

//채팅방 개설
app.get('/chatRoom/:id', login ,async (req,res) => {
    try {
        const { params, user } = req;
        const { id } = params;
        const { id: userId } = user;
        const chatRoom = {
            member : [user._id, ObjectId(id)]
        }
        const result1 = await db.collection('chatRoom').findOne(chatRoom);
        if(!result1) {
            chatRoom.date = new Date();
            chatRoom.title = req.user._id + " & " + req.params.id;
            const result2 = await db.collection('chatRoom').insertOne(chatRoom);
        }
        return res.redirect('/chat');
    } catch (e) {
        console.log(e);
    }
});

//채팅방게시물
app.get('/chat',login,async (req,res)=>{
    try{
        const { user } = req;
        const result = await db.collection('chatRoom').find({member: user._id}).toArray();
        return res.render('chat.ejs', {list: result});
    }catch (e) {
        console.log(e);
    }
});

//JWT
const tokenRouter = require('./routes/token');
const apiRouter = require('./routes/api');
app.use('/token',tokenRouter);
app.use('/api',apiRouter);

