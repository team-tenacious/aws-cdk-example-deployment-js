const express = require('express');
const app = express();
const port = 3000;
const redis = require('redis');
const client = redis.createClient({
    host: process.env.REDIS_HOST || "redis"
});

app.set('view engine', 'pug');

app.get('/', function (req, res) {
    client.set("times", Date.now(), e => {
        client.get("times", (e, result) => {
            let message;
            if (e) message = e.message;
            else message = result;
            res.render('index', { title: 'js  cdk example', message })
        });
    });
  });

app.listen(port, () => {
  console.log(`Example app listening on port:${port}`)
})

