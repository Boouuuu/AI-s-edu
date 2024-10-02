import express from 'express';  // 使用 ES 模块的 import
import mongoose from 'mongoose';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 5000;

// 中间件设置
app.use(cors());
app.use(express.json()); // 解析 JSON 请求体





const uri = "mongodb+srv://Booo:1001@cluster0.fcsd6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Atlas 连接成功');

        // 在这里添加获取数据的代码
    })
    .catch(err => console.error('MongoDB Atlas 连接错误:', err));



// 定义 paper数据模型
const QuestionDataSchema = new mongoose.Schema({
    questionNumber: { type: Number, required: true },
    questionType: { type: String, required: true },
    questionText: { type: String, required: true },
    options: { type: [String], required: true, default: [] }, // 默认空数组
    userSelection: { type: [String], default: [] }, // 可以为空，默认空数组
    correctAnswer: { type: String, required: true }
});

// 定义 Submission 数据模型
const SubmissionSchema = new mongoose.Schema({
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

// 获取所有提交记录的路由
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

// 获取所有提交时间的路由
app.get('/submission-times', async (req, res) => {
    try {
        const submissions = await Submission.find();
        const submissionTimes = submissions.map(submission => submission.submitTime);
        return res.status(200).json(submissionTimes);
    } catch (error) {
        res.status(500).send('获取提交时间时出错: ' + error.message);
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
