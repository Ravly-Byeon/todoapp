const express = require('express');
const router = express.Router();

const { verifyToken } = require('./middlewares');

// 토큰을 사용하여 API를 제공하는 라우터
router.get('/', verifyToken, (req, res) => {
    // 대충 DB에 이런 데이터가 있다고 가정
    const users = [
        { id: 1, name: 'Node.js' },
        { id: 2, name: 'npm' },
        { id: 3, name: 'Pengsu' },
    ]

    // 모든 정보 제공
    res.json(users);
});

// 경로 매개변수(:param)를 사용한 라우팅
router.get('/:id', verifyToken, async (req, res) => {
    // 대충 DB에 이런 데이터가 있다고 가정
    const users = [
        { id: 1, name: 'Node.js' },
        { id: 2, name: 'npm' },
        { id: 3, name: 'Pengsu' },
    ]

    // 특정 정보를 찾아 제공
    user = users.find(u => u.id === parseInt(req.params.id))
    res.send(user);
});

module.exports = router;