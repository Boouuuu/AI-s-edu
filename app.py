from flask import Flask, request, jsonify
from flask_cors import CORS

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
import sys
import torch

import torch
from torch import nn
from torch.nn.init import xavier_uniform_
from torch.nn.init import constant_
from torch.nn.init import xavier_normal_
from torch_geometric.data import Data
from torch_geometric.nn import GATConv 
import math
import torch.nn.functional as F
from enum import IntEnum
import numpy as np

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class Dim(IntEnum):
    batch = 0
    seq = 1
    feature = 2


class AKT(nn.Module):
    def __init__(self, n_question, n_pid, d_model, n_blocks,
                 kq_same, dropout, model_type, final_fc_dim=512, n_heads=8, d_ff=2048,  l2=1e-5, separate_qa=False):
        super().__init__()
        """
        Input:
            d_model: dimension of attention block
            final_fc_dim: dimension of final fully connected net before prediction
            n_heads: number of heads in multi-headed attention
            d_ff : dimension for fully conntected net inside the basic block
        """
        self.n_question = n_question
        self.dropout = dropout
        self.kq_same = kq_same
        self.n_pid = n_pid
        self.l2 = l2
        self.model_type = model_type
        self.separate_qa = separate_qa
        embed_l = d_model
        if self.n_pid > 0:
            self.difficult_param = nn.Embedding(self.n_pid+1, 1)
            self.q_embed_diff = nn.Embedding(self.n_question+1, embed_l)
            self.qa_embed_diff = nn.Embedding(2 * self.n_question + 1, embed_l)
        # n_question+1 ,d_model
        self.q_embed = nn.Embedding(self.n_question+1, embed_l)
        if self.separate_qa:
            self.qa_embed = nn.Embedding(2*self.n_question+1, embed_l)
        else:
            self.qa_embed = nn.Embedding(2, embed_l)
        # Architecture Object. It contains stack of attention block
        self.model = Architecture(n_question=n_question, n_blocks=n_blocks, n_heads=n_heads, dropout=dropout,
                                    d_model=d_model, d_feature=d_model / n_heads, d_ff=d_ff,  kq_same=self.kq_same, model_type=self.model_type)

        self.out = nn.Sequential(
            nn.Linear(d_model + embed_l,
                      final_fc_dim), nn.ReLU(), nn.Dropout(self.dropout),
            nn.Linear(final_fc_dim, 256), nn.ReLU(
            ), nn.Dropout(self.dropout),
            nn.Linear(256, 1)
        )
        # nn.Sequential是一个有序的容器，它可以接受多个层（如卷积层、全连接层、激活函数等），
        # 并将它们组合在一起，形成一个单一的模块。
        self.reset()

    def reset(self):
        for p in self.parameters():
            if p.size(0) == self.n_pid+1 and self.n_pid > 0:
                torch.nn.init.constant_(p, 0.)

    def forward(self, q_data, qa_data, target, pid_data=None):
        # Batch First
        q_embed_data = self.q_embed(q_data)  # BS, seqlen,  d_model# c_ct  三维元组
        if self.separate_qa:
            # BS, seqlen, d_model #f_(ct,rt)
            qa_embed_data = self.qa_embed(qa_data)
        else:
            qa_data = (qa_data-q_data)//self.n_question  # rt
            # BS, seqlen, d_model # c_ct+ g_rt =e_(ct,rt)
            qa_embed_data = self.qa_embed(qa_data)+q_embed_data

        if self.n_pid > 0:
            q_embed_diff_data = self.q_embed_diff(q_data)  # d_ct
            pid_embed_data = self.difficult_param(pid_data)  # uq
            q_embed_data = q_embed_data + pid_embed_data * \
                q_embed_diff_data  # uq *d_ct + c_ct
            qa_embed_diff_data = self.qa_embed_diff(
                qa_data)  # f_(ct,rt) or #h_rt
            if self.separate_qa:
                qa_embed_data = qa_embed_data + pid_embed_data * \
                    qa_embed_diff_data  # uq* f_(ct,rt) + e_(ct,rt)
            else:
                qa_embed_data = qa_embed_data + pid_embed_data * \
                    (qa_embed_diff_data+q_embed_diff_data)  # + uq *(h_rt+d_ct)
            c_reg_loss = (pid_embed_data ** 2.).sum() * self.l2
        else:
            c_reg_loss = 0.

        # BS.seqlen,d_model
        # Pass to the decoder
        # output shape BS,seqlen,d_model or d_model//2
        d_output = self.model(q_embed_data, qa_embed_data)  # 211x512  进行模型训练，输入两种数据，这里可以修改
        # print(d_output)
        # print(q_embed_data)
        concat_q = torch.cat([d_output, q_embed_data], dim=-1) #将d_output和问题嵌入进行拼接，再用预测模块进行预测
        # print(concat_q)
        output = self.out(concat_q)
        labels = target.reshape(-1)
        m = nn.Sigmoid()
        preds = (output.reshape(-1))  # logit 预测
        mask = labels > -0.9
        masked_labels = labels[mask].float()
        masked_preds = preds[mask]
        loss = nn.BCEWithLogitsLoss(reduction='none')
        output = loss(masked_preds, masked_labels)
        return output.sum()+c_reg_loss, m(preds), mask.sum()


class Architecture(nn.Module):
    def __init__(self, n_question,  n_blocks, d_model, d_feature,
                 d_ff, n_heads, dropout, kq_same, model_type):
        super().__init__()
        """
            n_block : number of stacked blocks in the attention
            d_model : dimension of attention input/output
            d_feature : dimension of input in each of the multi-head attention part.
            n_head : number of heads. n_heads*d_feature = d_model
        """
        self.d_model = d_model
        self.model_type = model_type

        if model_type in {'akt'}:
            self.blocks_1 = nn.ModuleList([
                TransformerLayer(d_model=d_model, d_feature=d_model // n_heads,
                                 d_ff=d_ff, dropout=dropout, n_heads=n_heads, kq_same=kq_same)
                for _ in range(n_blocks)
            ])
            self.blocks_2 = nn.ModuleList([
                TransformerLayer(d_model=d_model, d_feature=d_model // n_heads,
                                 d_ff=d_ff, dropout=dropout, n_heads=n_heads, kq_same=kq_same)
                for _ in range(n_blocks*2)
            ])

    def forward(self, q_embed_data, qa_embed_data):
        # target shape  bs, seqlen
        seqlen, batch_size = q_embed_data.size(1), q_embed_data.size(0)

        qa_pos_embed = qa_embed_data
        q_pos_embed = q_embed_data

        y = qa_pos_embed
        seqlen, batch_size = y.size(1), y.size(0)
        x = q_pos_embed

        # encoder
        for block in self.blocks_1:  # encode qas
            y = block(mask=1, query=y, key=y, values=y)
        flag_first = True
        for block in self.blocks_2:
            if flag_first:  # peek current question
                x = block(mask=1, query=x, key=x,
                          values=x, apply_pos=False)
                flag_first = False
            else:  # dont peek current response
                x = block(mask=0, query=x, key=x, values=y, apply_pos=True)
                flag_first = True
        return x


class TransformerLayer(nn.Module):
    def __init__(self, d_model, d_feature,
                 d_ff, n_heads, dropout,  kq_same):
        super().__init__()
        """
            This is a Basic Block of Transformer paper. It containts one Multi-head attention object. Followed by layer norm and postion wise feedforward net and dropout layer.
        """
        kq_same = kq_same == 1
        # Multi-Head Attention Block
        self.masked_attn_head = MultiHeadAttention(
            d_model, d_feature, n_heads, dropout, kq_same=kq_same)

        # Two layer norm layer and two droput layer
        self.layer_norm1 = nn.LayerNorm(d_model)
        self.dropout1 = nn.Dropout(dropout)

        self.linear1 = nn.Linear(d_model, d_ff)
        self.activation = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.linear2 = nn.Linear(d_ff, d_model)

        self.layer_norm2 = nn.LayerNorm(d_model)
        self.dropout2 = nn.Dropout(dropout)

    def forward(self, mask, query, key, values, apply_pos=True):
        """
        Input:
            block : object of type BasicBlock(nn.Module). It contains masked_attn_head objects which is of type MultiHeadAttention(nn.Module).
            mask : 0 means, it can peek only past values. 1 means, block can peek only current and pas values
            query : Query. In transformer paper it is the input for both encoder and decoder
            key : Keys. In transformer paper it is the input for both encoder and decoder
            Values. In transformer paper it is the input for encoder and  encoded output for decoder (in masked attention part)

        Output:
            query: Input gets changed over the layer and returned.

        """

        seqlen, batch_size = query.size(1), query.size(0)
        nopeek_mask = np.triu(
            np.ones((1, 1, seqlen, seqlen)), k=mask).astype('uint8')
        src_mask = (torch.from_numpy(nopeek_mask) == 0).to(device)
        if mask == 0:  # If 0, zero-padding is needed.
            # Calls block.masked_attn_head.forward() method
            query2 = self.masked_attn_head(
                query, key, values, mask=src_mask, zero_pad=True)
        else:
            # Calls block.masked_attn_head.forward() method
            query2 = self.masked_attn_head(
                query, key, values, mask=src_mask, zero_pad=False)

        query = query + self.dropout1((query2))
        query = self.layer_norm1(query)
        if apply_pos:
            query2 = self.linear2(self.dropout(
                self.activation(self.linear1(query))))
            query = query + self.dropout2((query2))
            query = self.layer_norm2(query)
        return query


class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, d_feature, n_heads, dropout, kq_same, bias=True):
        super().__init__()
        """
        It has projection layer for getting keys, queries and values. Followed by attention and a connected layer.
        """
        self.d_model = d_model
        self.d_k = d_feature
        self.h = n_heads
        self.kq_same = kq_same

        self.v_linear = nn.Linear(d_model, d_model, bias=bias)
        self.k_linear = nn.Linear(d_model, d_model, bias=bias)
        if kq_same is False:
            self.q_linear = nn.Linear(d_model, d_model, bias=bias)
        self.dropout = nn.Dropout(dropout)
        self.proj_bias = bias
        self.out_proj = nn.Linear(d_model, d_model, bias=bias)
        self.gammas = nn.Parameter(torch.zeros(n_heads, 1, 1))
        torch.nn.init.xavier_uniform_(self.gammas)

        self._reset_parameters()

    def _reset_parameters(self):
        xavier_uniform_(self.k_linear.weight)
        xavier_uniform_(self.v_linear.weight)
        if self.kq_same is False:
            xavier_uniform_(self.q_linear.weight)

        if self.proj_bias:
            constant_(self.k_linear.bias, 0.)
            constant_(self.v_linear.bias, 0.)
            if self.kq_same is False:
                constant_(self.q_linear.bias, 0.)
            constant_(self.out_proj.bias, 0.)

    def forward(self, q, k, v, mask, zero_pad):

        bs = q.size(0)

        # perform linear operation and split into h heads

        k = self.k_linear(k).view(bs, -1, self.h, self.d_k)
        if self.kq_same is False:
            q = self.q_linear(q).view(bs, -1, self.h, self.d_k)
        else:
            q = self.k_linear(q).view(bs, -1, self.h, self.d_k)
        v = self.v_linear(v).view(bs, -1, self.h, self.d_k)

        # transpose to get dimensions bs * h * sl * d_model

        k = k.transpose(1, 2)
        q = q.transpose(1, 2)
        v = v.transpose(1, 2)
        # calculate attention using function we will define next
        gammas = self.gammas
        scores = attention(q, k, v, self.d_k,
                           mask, self.dropout, zero_pad, gammas)

        # concatenate heads and put through final linear layer
        concat = scores.transpose(1, 2).contiguous()\
            .view(bs, -1, self.d_model)

        output = self.out_proj(concat)

        return output


def attention(q, k, v, d_k, mask, dropout, zero_pad, gamma=None):
    """
    This is called by Multi-head atention object to find the values.
    """
    scores = torch.matmul(q, k.transpose(-2, -1)) / \
        math.sqrt(d_k)  # BS, 8, seqlen, seqlen
    bs, head, seqlen = scores.size(0), scores.size(1), scores.size(2)

    x1 = torch.arange(seqlen).expand(seqlen, -1).to(device)
    x2 = x1.transpose(0, 1).contiguous()

    with torch.no_grad():
        scores_ = scores.masked_fill(mask == 0, -1e32)
        scores_ = F.softmax(scores_, dim=-1)  # BS,8,seqlen,seqlen
        scores_ = scores_ * mask.float().to(device)
        distcum_scores = torch.cumsum(scores_, dim=-1)  # bs, 8, sl, sl
        disttotal_scores = torch.sum(
            scores_, dim=-1, keepdim=True)  # bs, 8, sl, 1
        position_effect = torch.abs(
            x1-x2)[None, None, :, :].type(torch.FloatTensor).to(device)  # 1, 1, seqlen, seqlen
        # bs, 8, sl, sl positive distance
        dist_scores = torch.clamp(
            (disttotal_scores-distcum_scores)*position_effect, min=0.)
        dist_scores = dist_scores.sqrt().detach()
    m = nn.Softplus()
    gamma = -1. * m(gamma).unsqueeze(0)  # 1,8,1,1
    # Now after do exp(gamma*distance) and then clamp to 1e-5 to 1e5
    total_effect = torch.clamp(torch.clamp(
        (dist_scores*gamma).exp(), min=1e-5), max=1e5)
    scores = scores * total_effect

    scores.masked_fill_(mask == 0, -1e32)
    scores = F.softmax(scores, dim=-1)  # BS,8,seqlen,seqlen
    if zero_pad:
        pad_zero = torch.zeros(bs, head, 1, seqlen).to(device)
        scores = torch.cat([pad_zero, scores[:, :, 1:, :]], dim=2)
    scores = dropout(scores)
    output = torch.matmul(scores, v)
    return output


class LearnablePositionalEmbedding(nn.Module):
    def __init__(self, d_model, max_len=512):
        super().__init__()
        # Compute the positional encodings once in log space.
        pe = 0.1 * torch.randn(max_len, d_model)
        pe = pe.unsqueeze(0)
        self.weight = nn.Parameter(pe, requires_grad=True)

    def forward(self, x):
        return self.weight[:, :x.size(Dim.seq), :]  # ( 1,seq,  Feature)


class CosinePositionalEmbedding(nn.Module):
    def __init__(self, d_model, max_len=512):
        super().__init__()
        # Compute the positional encodings once in log space.
        pe = 0.1 * torch.randn(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        div_term = torch.exp(torch.arange(0, d_model, 2).float() *
                             -(math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)
        self.weight = nn.Parameter(pe, requires_grad=False)

    def forward(self, x):
        return self.weight[:, :x.size(Dim.seq), :]  # ( 1,seq,  Feature)



class ModifiedGAT(torch.nn.Module):
    def __init__(self, in_channels, out_channels, heads=1, num_layers=3):
        super(ModifiedGAT, self).__init__()
        self.num_layers = num_layers
        self.gat_layers = torch.nn.ModuleList()  # 使用 ModuleList 来存储多个 GATConv 层

        # 添加多个 GATConv 层
        for i in range(num_layers):
            if i == 0:
                self.gat_layers.append(GATConv(in_channels, out_channels, heads=heads, concat=True))
            else:
                self.gat_layers.append(GATConv(out_channels * heads, out_channels, heads=1, concat=False))

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        
        # 多层 GATConv 的前向传播
        for layer in self.gat_layers:
            x = layer(x, edge_index)
            x = F.elu(x)  # 使用 ELU 激活函数
        
        return x




app = Flask(__name__)
CORS(app)  # 启用CORS


@app.route('/recommend', methods=['POST'])
    

def recommend():
    print(f"Request method: {request.method}")
    # 获取来自前端的 JSON 数据
    data = request.json
    text = data.get("example_key", "")  # 提取值，如果不存在则返回空字符串
    if text!="":
        # 模型加载和推荐算法
        model = SentenceTransformer('distiluse-base-multilingual-cased')
        input_embedding = model.encode([text])  # 对输入文本进行编码
        pre_embeddings = np.load('pre_embeddings.npy')  # 加载预先计算的短文本向量
        similarity_matrix = cosine_similarity(input_embedding, pre_embeddings)  # 计算余弦相似度

        # 找出相似度最高的30条短文本的索引
        top_indices = np.argsort(similarity_matrix[0])[-31:-1][::-1]  # 从高到低排序
    else:
        top_indices = np.array([i+1]for i in range(498))
        print("没找到文本，加载了全部！")






    p_data=[]
    p_data.append(top_indices.tolist())  # 当前问题的 ID

    f={1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1,
    15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1, 21: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1, 27: 1,
    28: 1, 29: 1, 30: 1, 31: 1, 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1,
    41: 1, 42: 1, 43: 1, 44: 1, 45: 1, 46: 1, 47: 1, 48: 1, 49: 1, 50: 1, 51: 1, 52: 1, 53: 1,
    54: 1, 55: 1, 56: 1, 57: 1, 58: 1, 59: 1, 60: 1, 61: 1, 62: 1, 63: 1, 64: 1, 65: 1, 66: 1,
    67: 1, 68: 1, 69: 1, 70: 1, 71: 1, 72: 1, 73: 1, 74: 1, 75: 1, 76: 1, 77: 2, 78: 2, 79: 2,
    80: 2, 81: 2, 82: 2, 83: 2, 84: 2, 85: 2, 86: 2, 87: 2, 88: 2, 89: 2, 90: 2, 91: 2, 92: 2,
    93: 2, 94: 2, 95: 2, 96: 2, 97: 2, 98: 2, 99: 2, 100: 2, 101: 2, 102: 2, 103: 2, 104: 2, 
    105: 2, 106: 2, 107: 2, 108: 2, 109: 2, 110: 2, 111: 2, 112: 2, 113: 2, 114: 2, 115: 2, 116: 2,
    117: 2, 118: 2, 119: 2, 120: 2, 121: 2, 122: 2, 123: 2, 124: 2, 125: 2, 126: 2, 127: 2, 128: 2,
    129: 2, 130: 2, 131: 2, 132: 2, 133: 2, 134: 2, 135: 2, 136: 2, 137: 2, 138: 2, 139: 2, 140: 2, 141: 2, 
    142: 2, 143: 2, 144: 2, 145: 2, 146: 2, 147: 2, 148: 2, 149: 2, 150: 2, 151: 2, 152: 2, 153: 2, 154: 2, 
    155: 2, 156: 2, 157: 2, 158: 2, 159: 2, 160: 2, 161: 2, 162: 2, 163: 2, 164: 2, 165: 2, 166: 2, 167: 2, 
    168: 2, 169: 2, 170: 2, 171: 2, 172: 2, 173: 2, 174: 2, 175: 2, 176: 2, 177: 2, 178: 2, 179: 2, 180: 2, 
    181: 2, 182: 2, 183: 2, 184: 2, 185: 2, 186: 2, 187: 2, 188: 2, 189: 2, 190: 2, 191: 2, 192: 2, 193: 2, 
    194: 2, 195: 2, 196: 2, 197: 2, 198: 2, 199: 2, 200: 2, 201: 2, 202: 2, 203: 2, 204: 2, 205: 2, 206: 2, 
    207: 2, 208: 2, 209: 2, 210: 2, 211: 2, 212: 2, 213: 2, 214: 2, 215: 2, 216: 2, 217: 2, 218: 2, 219: 2, 
    220: 2, 221: 2, 222: 2, 223: 2, 224: 2, 225: 2, 226: 2, 227: 2, 228: 2, 229: 2, 230: 2, 231: 2, 232: 2, 
    233: 2, 234: 2, 235: 2, 236: 2, 237: 2, 238: 2, 239: 2, 240: 2, 241: 2, 242: 2, 243: 2, 244: 2, 245: 2,
    246: 2, 247: 2, 248: 2, 249: 2, 250: 2, 251: 2, 252: 2, 253: 2, 254: 2, 255: 2, 256: 2, 257: 2, 258: 2, 
    259: 2, 260: 2, 261: 2, 262: 2, 263: 2, 264: 2, 265: 2, 266: 2, 267: 2, 268: 2, 269: 2, 270: 2, 271: 2, 
    272: 2, 273: 2, 274: 2, 275: 2, 276: 2, 277: 2, 278: 2, 279: 2, 280: 2, 281: 2, 282: 2, 283: 2, 284: 2, 
    285: 2, 286: 2, 287: 2, 288: 2, 289: 2, 290: 2, 291: 2, 292: 2, 293: 2, 294: 2, 295: 2, 296: 2, 297: 2, 
    298: 2, 299: 2, 300: 2, 301: 2, 302: 2, 303: 2, 304: 2, 305: 3, 306: 3, 307: 3, 308: 3, 309: 3, 310: 3, 
    311: 3, 312: 3, 313: 3, 314: 3, 315: 4, 316: 4, 317: 4, 318: 4, 319: 4, 320: 4, 321: 4, 322: 4, 323: 4, 
    324: 4, 325: 5, 326: 5, 327: 5, 328: 5, 329: 5, 330: 5, 331: 5, 332: 5, 333: 5, 334: 5, 335: 5, 336: 5, 
    337: 5, 338: 5, 339: 6, 340: 6, 341: 6, 342: 6, 343: 6, 344: 6, 345: 6, 346: 6, 347: 6, 348: 6, 349: 7, 
    350: 7, 351: 7, 352: 7, 353: 7, 354: 7, 355: 7, 356: 7, 357: 7, 358: 7, 359: 7, 360: 7, 361: 7, 362: 7, 
    363: 7, 364: 7, 365: 7, 366: 7, 367: 7, 368: 7, 369: 8, 370: 8, 371: 8, 372: 8, 373: 8, 374: 8, 375: 8, 
    376: 8, 377: 8, 378: 8, 379: 8, 380: 8, 381: 8, 382: 8, 383: 8, 384: 8, 385: 8, 386: 8, 387: 8, 388: 8, 
    389: 9, 390: 9, 391: 9, 392: 9, 393: 9, 394: 9, 395: 9, 396: 9, 397: 9, 398: 9, 399: 10, 400: 10, 401: 10, 
    402: 10, 403: 10, 404: 10, 405: 10, 406: 10, 407: 10, 408: 10, 409: 10, 410: 10, 411: 10, 412: 10, 413: 10, 
    414: 10, 415: 10, 416: 10, 417: 10, 418: 10, 419: 10, 420: 10, 421: 10, 422: 10, 423: 10, 424: 10, 425: 10, 
    426: 10, 427: 10, 428: 10, 429: 10, 430: 10, 431: 10, 432: 10, 433: 10, 434: 10, 435: 10, 436: 10, 437: 10, 
    438: 10, 439: 10, 440: 10, 441: 10, 442: 10, 443: 10, 444: 10, 445: 10, 446: 10, 447: 10, 448: 10, 449: 10, 
    450: 10, 451: 10, 452: 10, 453: 10, 454: 10, 455: 10, 456: 10, 457: 10, 458: 10, 459: 10, 460: 11, 461: 11, 
    462: 11, 463: 11, 464: 11, 465: 11, 466: 11, 467: 11, 468: 11, 469: 11, 470: 11, 471: 11, 472: 11, 473: 11, 
    474: 11, 475: 11, 476: 11, 477: 11, 478: 11, 479: 11, 480: 11, 481: 11, 482: 11, 483: 11, 484: 11, 485: 11, 
    486: 11, 487: 11, 488: 11, 489: 11, 490: 11, 491: 11, 492: 11, 493: 11, 494: 11, 495: 11, 496: 11, 497: 11, 498: 11}
    qa=[]
    qa_data=[]
    for i in top_indices:
        qa.append(f[i])
    qa_data.append(qa)

    q_data=qa_data
    prolen=len(p_data[0])
    seqlen=30

    q_dataArray = np.zeros((len(q_data), seqlen))
    for j in range(len(q_data)):
        dat = q_data[j]
        q_dataArray[j, :len(dat)] = dat

    qa_dataArray = np.zeros((len(qa_data), seqlen))
    for j in range(len(qa_data)):
        dat = qa_data[j]
        qa_dataArray[j, :len(dat)] = dat

    p_dataArray = np.zeros((len(p_data), seqlen))
    for j in range(len(p_data)):
        dat = p_data[j]
        p_dataArray[j, :len(dat)] = dat
    target=p_dataArray
    pid_flag=1
    model_type='akt'

    pred_list = []

    element_count = 0
    true_el = 0


    model_path = 'aktmodel.pth'

    # 加载模型
    checkpoint = torch.load(model_path, map_location=torch.device('cpu'))


    # 如果你的保存对象是字典（例如保存了模型状态、优化器状态等），你可以访问特定的元素
    model_state_dict = checkpoint['model_state_dict']
    optimizer_state_dict = checkpoint['optimizer_state_dict']
    epoch = checkpoint['epoch']
    loss = checkpoint['loss']
    n_question = checkpoint['n_question']  # 假设你在保存模型时存储了这些信息
    n_pid = checkpoint['n_pid']
    d_model = checkpoint['d_model']
    n_blocks = checkpoint['n_block']
    kq_same = checkpoint['kq_same']
    dropout = checkpoint['dropout']
    model_type = checkpoint['model_type']

    model = AKT(n_question, n_pid, d_model, n_blocks, kq_same, dropout, model_type)
    model.load_state_dict(model_state_dict)
    model.eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
    input_q = torch.from_numpy(q_dataArray).long().to(device)
    input_qa = torch.from_numpy(qa_dataArray).long().to(device)
    target = torch.from_numpy(target).float().to(device)
    input_pid=p_dataArray
    input_pid = torch.from_numpy(input_pid).long().to(device)

    _, pred, true_ct = model(input_q, input_qa, target, input_pid)
    # 前向传播获得预测
    pred = pred.detach().cpu().numpy()
    pred_prolen = pred[:prolen]

    # 1. 获取 pred_prolen 的索引和排序后的值
    sorted_indices = sorted(range(len(pred_prolen)), key=lambda i: pred_prolen[i])

    # 2. 提取值最高的 3 个的索引
    highest_indices = sorted_indices[-3:]

    # 3. 提取值最中间的 4 个的索引
    mid_start = (len(pred_prolen) - 4) // 2
    middle_indices = sorted_indices[mid_start:mid_start + 4]

    # 4. 提取值最低的 3 个的索引
    lowest_indices = sorted_indices[:3]

    # 5. 根据索引从 p_data 中提取值，并按照顺序存入新列表
    result = [p_data[0][i] for i in highest_indices] + \
            [p_data[0][i] for i in middle_indices] + \
            [p_data[0][i] for i in lowest_indices]

    print(result)
# 返回推荐的索引和相似度
# 获取对应的相似度值
    # top_similarities = similarity_matrix[0][result]
    try:
        return jsonify(recommended_ids=result)
    except Exception as e:
        print(f"Error: {e}")  # 打印错误信息
        return jsonify({"error": str(e)}), 500  # 返回错误信息和状态码
    
    
    # return jsonify(recommended_ids=top_indices)


# 创建全局模型和优化器
model = ModifiedGAT(in_channels=1, out_channels=2)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

# 用于存储推荐学习路径
recommended_learning_paths = []


@app.route('/gatdata', methods=['POST'])
def generate_gat_data():
    global num_points,knowledge_points, embeddings, recommended_learning_paths,edge_index  # 使用全局变量存储数据
    
    # 从请求中获取 JSON 数据
    data = request.get_json()
    
    # 检查请求中是否有 links
    if 'links' not in data:
        return jsonify({'error': '未提供 links 数据'}), 400
    
    links = data['links']

    # 步骤1：提取唯一的知识点
    knowledge_points = set()
    for link in links:
        knowledge_points.add(link["source"])
        knowledge_points.add(link["target"])

    knowledge_points = list(knowledge_points)  # 转换为列表
    num_points = len(knowledge_points)

    # 创建知识点到索引的映射
    kp_to_index = {kp: idx for idx, kp in enumerate(knowledge_points)}

    # 打印知识点和映射关系
    print("知识点:", knowledge_points)
    print("知识点到索引映射:", kp_to_index)

    # 步骤2：根据链接创建边索引
    edge_index = []
    for link in links:
        source_idx = kp_to_index.get(link["source"])
        target_idx = kp_to_index.get(link["target"])
        
        if source_idx is not None and target_idx is not None:
            edge_index.append([source_idx, target_idx])
        else:
            print(f"未找到源或目标知识点: {link['source']} -> {link['target']}")

    edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()  # 转置为正确的形状

    # 打印边索引
    print("边索引:\n", edge_index)

    # 返回操作成功的响应
    return jsonify({'message': '请求成功'}), 200  # 返回状态码 200，表示请求成功


@app.route('/train', methods=['POST'])
def train_model():
    global knowledge,num_points,knowledge_points, embeddings, recommended_learning_paths,edge_index  # 使用全局变量存储数据
    # 从前端获取知识点、正确率和边关系数据

    content=request.get_json()
    knowledge = content['knowledge']  # 知识点列表
    titleCounts = content['titleCounts']  # 各知识点的尝试次数
    correctCounts = content['correctCounts']  # 各知识点的正确次数
    

    # 步骤3：为每个知识点创建学生掌握度，若知识点未包含，则掌握度为0
    #num_points = len(knowledge)
    student_accuracies = torch.zeros(num_points)

    # 计算每个知识点的正确率
    accuracyRates = {}
    for index, title in enumerate(knowledge):
        totalAttempts = titleCounts.get(title, 0)  # 获取尝试次数
        correctAttempts = correctCounts.get(title, 0)  # 获取正确次数
        accuracyRate = (correctAttempts / totalAttempts) * 100 if totalAttempts > 0 else 0.5  # 计算正确率
        accuracyRates[title] = accuracyRate
        student_accuracies[index] = accuracyRate / 100  # 将正确率标准化到 [0, 1]


    # 步骤4：创建图数据
    graph_data = Data(x=student_accuracies.unsqueeze(1), edge_index=edge_index)

    # 输出图数据
    print("图数据内容:")
    print(graph_data)
    # 模型训练步骤
    model.train()
    for epoch in range(100):
        optimizer.zero_grad()
        out = model(graph_data)
        target = torch.ones_like(out)  # 假设目标嵌入
        loss = F.mse_loss(out, target) #L2损失

        # 增加对边关系的惩罚
        edge_penalty = 0.0
        for i,(u, v) in enumerate(graph_data.edge_index.t().tolist()):
            edge_penalty += F.mse_loss(out[u], out[v])  # 计算连接的节点之间的嵌入损失

        #将边惩罚添加到总损失中
        total_loss = loss + 0.9 * edge_penalty  # 0.01 是惩罚项的权重

        total_loss.backward()
    
        optimizer.step()

        if epoch % 10 == 0:
            print(f'Epoch {epoch}, Loss: {loss.item()}')

    # 模型推断阶段
    model.eval()
    with torch.no_grad():
        embeddings = model(graph_data)

   # 确保返回的内容是一个有效的 JSON 对象
    response = {'message': 'Training started!', 'status': 'success'}  # 示例响应
    return jsonify(response)




@app.route('/gatcenter', methods=['POST'])
def generate_recommendations():
    global knowledge, knowledge_points, embeddings, recommended_learning_paths,edge_index  # 使用全局变量存储数据
    
    # 获取前端传入的核心知识点
    core_knowledge_point = request.form.get('core_knowledge_point')
    if not core_knowledge_point:
        return jsonify({'error': '未提供核心知识点'}), 400

    #if core_knowledge_point not in knowledge_points:
    #   return jsonify({'error': f'核心知识点 {core_knowledge_point} 不在知识点列表中'}), 400


    learned_knowledge_points=[]
    unlearned_knowledge_points=[]

    for kp in knowledge_points:
        if kp in knowledge:
            learned_knowledge_points.append(kp)
        else:
            unlearned_knowledge_points.append(kp)

    core_index = knowledge_points.index(core_knowledge_point)
    core_embedding = embeddings[core_index]

    # 计算与核心知识点的余弦相似度
    similarity = F.cosine_similarity(embeddings, core_embedding.unsqueeze(0), dim=1)
    recommendations = torch.argsort(similarity, descending=True)

    
    # 推荐学习路径信息
    recommended_learning_paths = []
    for idx in recommendations:
        if idx != core_index :  # 排除核心知识点本身
            knowledge_point = knowledge_points[idx]
            similarity_value = similarity[idx].item()
            embedding_value = embeddings[idx].numpy().tolist()  # 转换为列表
            recommended_learning_paths.append({
                'knowledge_point': knowledge_point,
                'similarity': similarity_value,
                'embedding': embedding_value
            })
        if len(recommended_learning_paths) >= 10:  # 只保留前十个相似度最高的知识点
            break
      
    return jsonify({
        'core_knowledge_point': core_knowledge_point,
        'recommended_learning_paths': recommended_learning_paths
    })

# 新的接口
@app.route('/gatrespond', methods=['GET'])
def gatrespond():
    return jsonify(recommended_learning_paths)  # 返回推荐的学习路径



# 启动 Flask 应用
if __name__ == '__main__':
    app.run(debug=True, port=5001)
