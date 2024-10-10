import express from 'express';  // 使用 ES 模块的 import
import mongoose from 'mongoose';
import cors from 'cors';

import bcrypt from'bcrypt';
import bodyParser from'body-parser';
const app = express();
const PORT = process.env.PORT || 5000;

// 中间件设置
app.use(cors());
app.use(express.json()); // 解析 JSON 请求体
app.use(bodyParser.json());

let uri = "mongodb+srv://<username>:<password>@cluster0.fcsd6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";



const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 登录路由
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('接收到的请求数据:', req.body); // 输出请求的用户名和密码

    if (!username || !password) {
        return res.status(400).send('用户名和密码不能为空');
    }

    try {
        // 更新连接字符串
        const dbUri = uri.replace('<username>', encodeURIComponent(username)).replace('<password>', encodeURIComponent(password));
        
        console.log('连接 MongoDB 的 URI:', dbUri); // 输出连接字符串

        // 连接到 MongoDB
        await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB Atlas 连接成功');

        // 登录成功
        console.log('用户登录成功:', username); // 登录成功时输出
        res.json({ message: '登录成功', username }); // 返回用户名
    } catch (error) {
        console.error('MongoDB Atlas 连接错误:', error);
        res.status(500).send('服务器错误');
    }
});

/*
const uri = "mongodb+srv://<username>:<password>@cluster0.fcsd6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Atlas 连接成功');

        // 在这里添加获取数据的代码
    })
    .catch(err => console.error('MongoDB Atlas 连接错误:', err));

*/

// 定义 Submission后数据模型
const QuestionDataSchema = new mongoose.Schema({
    questionNumber: { type: Number, required: true },
    iid:{ type: Number, required: true},
    isCorrect:{type:Boolean, requied: true},
    questionTitle:{type: String, requied: true},
    questionType: { type: String, required: true },
    questionText: { type: String, required: true },
    options: { type: [String], required: true, default: [] }, // 默认空数组
    userSelection: { type: [String], default: [] }, // 可以为空，默认空数组
    correctAnswer: { type: String, required: true }
});

// 定义 Submission 数据模型
const SubmissionSchema = new mongoose.Schema({
    username: { type: String, required: true }, // 新增字段z
    submitTime: { type: String, required: true },
    ttime: { type: String, required: true },
    doneCount: { type: Number, required: true },
    notDoneCount: { type: Number, required: true },
    markedCount: { type: Number, required: true },
    userAnswers: { type: [QuestionDataSchema], default: [] } // 允许空，默认是空数组
}, { collection: 'submissions' });

// 创建模型
const Submission = mongoose.model('Submission', SubmissionSchema);

// 定义处理提交的路由
app.post('/submit', async (req, res) => {
    const submissionData = req.body; // 从请求体中获取提交的数据

    try {
        const submission = new Submission(submissionData);
        await submission.save();
        res.status(201).send('数据已成功提交');
    } catch (error) {
        res.status(500).send('提交过程中出现错误: ' + error.message);
    }
});

// 获取提交记录的路由
app.get('/submissions', async (req, res) => {
    try {
        const { submitTime } = req.query;

        if (submitTime) {
            const submission = await Submission.find({ submitTime });
            if (submission.length > 0) {
                return res.status(200).json(submission);
            } else {
                return res.status(404).send('未找到对应的提交记录');
            }
        } else {
            const submissions = await Submission.find();
            return res.status(200).json(submissions);
        }
    } catch (error) {
        res.status(500).send('获取提交记录时出错: ' + error.message);
    }
});

/// 获取所有提交时间的路由
app.get('/submission-times', async (req, res) => {
    try {
        const username = req.query.username; // 从查询参数获取用户名
        
        console.log(username);

        if (!username) {
            return res.status(400).send('用户名未提供');
        }

        // 根据用户名查找对应的提交记录
        const submissions = await Submission.find({ username });
        const submissionTimes = submissions.map(submission => submission.submitTime);

        if (submissionTimes.length > 0) {
            return res.status(200).json(submissionTimes); // 返回找到的提交时间
        } else {
            return res.status(404).send('未找到对应的提交记录');
        }
    } catch (error) {
        res.status(500).send('获取提交时间时出错: ' + error.message);
    }
});

import fs from 'fs';
import path from 'path';

// 获取所有提交记录的路由
app.get('/submission-all', async (req, res) => {
    try {
        const username = req.query.username; // 从查询参数获取用户名
        
        console.log(username);

        if (!username) {
            return res.status(400).send('用户名未提供');
        }

        // 根据用户名查找对应的提交记录
        const submissions = await Submission.find({ username });

        // 如果没有找到提交记录
        if (submissions.length === 0) {
            return res.status(404).send('未找到对应的提交记录');
        }

        // 直接返回提交记录
        return res.status(200).json(submissions);
    } catch (error) {
        res.status(500).send('获取提交时间时出错: ' + error.message);
    }
});



import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取所有提交时间的路由
app.post('/save-data', (req, res) => {
    console.log('接收到的请求体:', req.body);

    const data = req.body;
    const filePath = path.join(__dirname, 'dataaa.json'); // 使用 __dirname

    fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8', (err) => {
        if (err) {
            console.error('保存文件时出错:', err.message);
            return res.status(500).send('保存文件时出错: ' + err.message);
        }
        res.status(200).send('文件保存成功！');
    });
});



// 获取所有提交时间的路由
app.post('/summary-data', (req, res) => {
    console.log('接收到的请求体:', req.body);

    const data = req.body;
    const filePath = path.join(__dirname, 'everysummary.json'); // 使用 __dirname

    fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8', (err) => {
        if (err) {
            console.error('保存文件时出错:', err.message);
            return res.status(500).send('保存文件时出错: ' + err.message);
        }
        res.status(200).send('文件保存成功！');
    });
});

app.get('/ana', async (req, res) => {
    try {
        //const { username, startTime, endTime } = req.query; // 从查询参数获取用户名、起始时间和结束时间
        const username = req.query.username; // 从查询参数获取用户名
       // console.log('请求参数:', { username, startTime, endTime });

        if (!username) {
            console.error('错误: 用户名未提供');
            return res.status(400).send('用户名未提供');
        }

        // 根据用户名查找对应的提交记录
        const submissions = await Submission.find({ username });
        console.log('找到的提交记录数量:', submissions.length);

        // 如果没有找到提交记录
        if (submissions.length === 0) {
            console.warn('警告: 未找到对应的提交记录');
            return res.status(404).send('未找到对应的提交记录');
        }

        /*// 筛选提交时间在指定时间段内的记录
        const filteredSubmissions = submissions.filter(submission => {
            const submitTime = new Date(submission.submitTime);
            const isInTimeRange = (!startTime || submitTime >= new Date(startTime)) && 
                                  (!endTime || submitTime <= new Date(endTime));
            return isInTimeRange;
        });
        */

        // 获取当前日期并计算两周前的日期
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        // 筛选最近两周内的提交记录
        const filteredSubmissions = submissions.filter(submission => {
            const submitTime = new Date(submission.submitTime);
            return submitTime >= twoWeeksAgo;
        });
        console.log('筛选后符合条件的记录数量:', filteredSubmissions.length);

        // 如果没有找到符合条件的提交记录
        if (filteredSubmissions.length === 0) {
            console.warn('警告: 未找到符合条件的提交记录');
            return res.status(404).send('未找到符合条件的提交记录');
        }

        // 将符合条件的记录存储到 finaldata.json
        fs.writeFileSync(path.join(__dirname, 'finaldata.json'), JSON.stringify(filteredSubmissions, null, 2));
        console.log('符合条件的提交记录已存储到 finaldata.json');

        // 返回符合条件的提交记录
        return res.status(200).json(filteredSubmissions);
    } catch (error) {
        console.error('获取提交时间时出错:', error.message);
        res.status(500).send('获取提交时间时出错: ' + error.message);
    }
});



// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
