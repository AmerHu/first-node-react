import express from 'express';
import bodyParser from "body-parser";
import {MongoClient} from "mongodb";
import * as path from "path";

const app = express();
app.use(express.static(path.join(__dirname,'/build')))
app.use(bodyParser.json())
const withDB = async (operations) => {
    try {
        const clint = await MongoClient.connect('mongodb://127.0.0.1:27017', {useNewUrlParser: true});
        const db = clint.db('react')
        await operations(db);
        clint.close();
    } catch (err) {
        res.status(500).json({message: 'something wrong', error: error})
    }
}
app.post('/api/article/:name/upvote', async (req, res) => {
    withDB(async (db) => {
        const article = req.params.name;
        const articlesInfo = await db.collection('articles').findOne({name: article});
        await db.collection('articles').updateOne({name: article}, {
            '$set': {
                upvotes: articlesInfo.upvotes + 1,
            }
        });
        const updatedArticlesInfo = await db.collection('articles').findOne({name: article});
        res.status(200).send(updatedArticlesInfo)
    });
});

app.post('/api/article/:name/add-comment', async (req, res) => {
    await withDB(async (db) => {
        const {name,comment} = req.body;
        const article = req.params.name;
        const articlesInfo = await db.collection('articles').findOne({name: article});
        await db.collection('articles').updateOne({name: article}, {
            '$set': {
                comments: articlesInfo.comments.concat({name,comment}) ,
            }
        });
        const updatedArticlesInfo = await db.collection('articles').findOne({name: article});
        res.status(200).send(updatedArticlesInfo)
    });
});

app.get('/api/article/:name', async (req, res) => {
    withDB(async (db) => {
        const article = req.params.name;
        const articlesInfo = await db.collection('articles').findOne({name: article});
        res.status(200).send(articlesInfo)
    });
});
app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname+'/build/index.html'))
})


app.listen(8000, () => console.log('listening on :8000'))
