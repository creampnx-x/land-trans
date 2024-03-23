const express = require('express');
const bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// 跨域
app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE')
    res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE')
    next();
});


const O = require('./land');
const { Land, User, Transation } = O;

/**********************************      user        ****************************************/

var registerUser = require('./registerUser.js');

//app.get('/land/re')

app.post('/land/register', function (req, res) {
    console.log(req.body);

    const keys = ['name', 'user_id', 'password'];
    for (let item of keys) {
        if (!req.body[item]) {
            res.send({
                status: 'fail',
                info: item + ' does not input',
                data: null
            });
        }
    }

    // 注册钱包用户
    registerUser.registerUser(req.body.user_id, async function (result) {
        if (result == 200) {
            const infomation = {
                userId: 'admin',
                method: 'CreateUser',
                args: [req.body.name, req.body.user_id, req.body.password, req.body.role ?? 'normal', req.body.boss ?? '']
            }

            // 上链
            const [result, error] = await User.CreateUser(infomation);
            if (error) {
                res.send({
                    status: 'fail',
                    info: error,
                    data: null
                });
            } else {
                res.send({
                    status: 'success',
                    info: '',
                    data: result
                });
            }

        } else {
            res.send({
                status: 'fail',
                info: result,
                data: null
            });
        }
    });
});


app.post('/land/login', async function (req, res) {
    console.log(req.body);

    const userId = req.body.user_id;


    let infomation = {
        userId,
        method: 'LogIn',
        args: [userId, req.body.password]
    }

    const [result, error] = await User.LogIn(infomation);

    if (error) {
        res.send({
            status: 'fail',
            info: error,
            data: null
        })
    } else {
        if (result === 'true') {
            infomation = {
                userId,
                method: 'QueryUser',
                args: [userId]
            };

            const [userInfo, error] = await User.QueryUser(infomation);
            res.send({
                status: !error ? 'success' : 'fail',
                info: error,
                data: JSON.parse(userInfo)
            });
        } else {

            res.send({
                status: 'fail',
                info: 'wrong password',
                data: null
            })
        }
    }
});


/*********************************         land         ************************************/

app.post("/land/create", async function (req, res) {
    const keys = ["position", "landId", "owner", "valid"];
    const args = [];
    for (let item of keys) {
        if (!req.body[item]) {
            res.send({
                status: 'fail',
                info: item + ' does not input',
                data: null
            });
            return null;
        }

        args.push(req.body[item]);
    }


    const infomation = {
        userId: req.body["owner"],
        method: 'CreateLand',
        args
    }
    const [result, error] = Land.CreateLand(infomation);

    res.send({
        status: error ? 'fail' : 'success',
        info: error,
        data: result  
    });
});


app.listen(3001);