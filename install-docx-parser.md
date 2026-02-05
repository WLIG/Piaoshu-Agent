# 安装Word文档解析库

为了更好地支持Word文档解析，建议安装以下依赖：

```bash
# 安装JSZip库用于解析docx文件（docx本质是zip格式）
npm install jszip

# 安装类型定义
npm install @types/jszip --save-dev

# 可选：安装mammoth库用于更高级的docx解析
npm install mammoth
npm install @types/mammoth --save-dev
```

或者使用yarn：
```bash
yarn add jszip
yarn add @types/jszip --dev

# 可选
yarn add mammoth
yarn add @types/mammoth --dev
```

安装后，可以在解析API中使用更专业的Word文档解析功能。

## 针对大型书籍的特殊处理

新增的书籍上传工具 (`/upload/book`) 专门处理：
- 大型Word文档（如81章节的书籍）
- 中文编码问题和乱码处理
- 智能章节分割
- 批量上传避免超时