-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "openid" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "lastActiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "coverImage" TEXT,
    "author" TEXT,
    "tags" TEXT NOT NULL,
    "category" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "avgReadDuration" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ArticleCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleCategory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "context" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thinking" TEXT,
    "relatedArticles" TEXT,
    "feedback" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBehavior" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "duration" INTEGER,
    "scrollDepth" INTEGER,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBehavior_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBehavior_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "reason" TEXT,
    "position" INTEGER NOT NULL,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "readDuration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeEntity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "articleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeEntity_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntityRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntityRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "KnowledgeEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntityRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "KnowledgeEntity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StatsCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metric" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "metadata" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_openid_key" ON "User"("openid");

-- CreateIndex
CREATE INDEX "User_level_lastActiveAt_idx" ON "User"("level", "lastActiveAt");

-- CreateIndex
CREATE INDEX "User_openid_idx" ON "User"("openid");

-- CreateIndex
CREATE INDEX "Article_category_difficulty_idx" ON "Article"("category", "difficulty");

-- CreateIndex
CREATE INDEX "Article_tags_idx" ON "Article"("tags");

-- CreateIndex
CREATE INDEX "Article_viewCount_likeCount_idx" ON "Article"("viewCount", "likeCount");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleCategory_articleId_categoryId_key" ON "ArticleCategory"("articleId", "categoryId");

-- CreateIndex
CREATE INDEX "ArticleCategory_categoryId_idx" ON "ArticleCategory"("categoryId");

-- CreateIndex
CREATE INDEX "Conversation_userId_updatedAt_idx" ON "Conversation"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "UserBehavior_userId_articleId_idx" ON "UserBehavior"("userId", "articleId");

-- CreateIndex
CREATE INDEX "UserBehavior_userId_interactionType_createdAt_idx" ON "UserBehavior"("userId", "interactionType", "createdAt");

-- CreateIndex
CREATE INDEX "UserBehavior_articleId_interactionType_idx" ON "UserBehavior"("articleId", "interactionType");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_category_key" ON "UserInterest"("userId", "category");

-- CreateIndex
CREATE INDEX "UserInterest_userId_score_idx" ON "UserInterest"("userId", "score" DESC);

-- CreateIndex
CREATE INDEX "UserInterest_category_idx" ON "UserInterest"("category");

-- CreateIndex
CREATE INDEX "Recommendation_userId_createdAt_idx" ON "Recommendation"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Recommendation_userId_clicked_idx" ON "Recommendation"("userId", "clicked");

-- CreateIndex
CREATE INDEX "Recommendation_score_idx" ON "Recommendation"("score" DESC);

-- CreateIndex
CREATE INDEX "KnowledgeEntity_type_idx" ON "KnowledgeEntity"("type");

-- CreateIndex
CREATE INDEX "KnowledgeEntity_name_idx" ON "KnowledgeEntity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EntityRelation_fromId_toId_relation_key" ON "EntityRelation"("fromId", "toId", "relation");

-- CreateIndex
CREATE INDEX "EntityRelation_fromId_idx" ON "EntityRelation"("fromId");

-- CreateIndex
CREATE INDEX "EntityRelation_toId_idx" ON "EntityRelation"("toId");

-- CreateIndex
CREATE INDEX "EntityRelation_relation_idx" ON "EntityRelation"("relation");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "StatsCache_metric_date_key" ON "StatsCache"("metric", "date");

-- CreateIndex
CREATE INDEX "StatsCache_metric_date_idx" ON "StatsCache"("metric", "date" DESC);
