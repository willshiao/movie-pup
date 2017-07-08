/*
Navicat SQLite Data Transfer

Source Server         : Movies
Source Server Version : 30714
Source Host           : :0

Target Server Type    : SQLite
Target Server Version : 30714
File Encoding         : 65001

Date: 2017-07-08 11:46:07
*/

PRAGMA foreign_keys = OFF;

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS "main"."tags";
CREATE TABLE "tags" (
"id"  INTEGER NOT NULL,
"name"  TEXT NOT NULL,
PRIMARY KEY ("id")
);
