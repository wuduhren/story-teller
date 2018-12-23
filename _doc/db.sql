-- phpMyAdmin SQL Dump
-- version 4.7.5
-- https://www.phpmyadmin.net/
--
-- 主機: localhost:3306
-- 產生時間： 2018 年 12 月 23 日 08:40
-- 伺服器版本: 5.6.38
-- PHP 版本： 5.6.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- 資料庫： `story-teller`
--

-- --------------------------------------------------------

--
-- 資料表結構 `php_session`
--

CREATE TABLE `php_session` (
  `id` char(32) COLLATE utf8_unicode_ci NOT NULL,
  `expiry` int(11) UNSIGNED NOT NULL,
  `value` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `story`
--

CREATE TABLE `story` (
  `id` int(10) UNSIGNED NOT NULL,
  `uid` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `time_create` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 資料表的匯出資料 `story`
--

INSERT INTO `story` (`id`, `uid`, `data`, `status`, `time_create`) VALUES
(42, 7, '{\"id\":\"42\",\"name\":\"故事1\",\"noteset\":[{\"name\":\"章節1\",\"note\":[{\"name\":\"對話1\",\"cmd\":[{\"kind\":\"msg\",\"txt\":\"這裡是故事的起點\"}],\"option\":[{\"txt\":\"選項1\",\"link\":\"章節1.對話2\"},{\"txt\":\"選項2\",\"link\":\"章節1.對話3\"}]},{\"name\":\"對話2\"},{\"name\":\"對話3\"}]}],\"pos\":{\"章節1\":{\"章節1.對話1\":{\"top\":\"52.747px\",\"left\":\"87px\"},\"章節1.對話2\":{\"top\":\"218.678px\",\"left\":\"87px\"},\"章節1.對話3\":{\"top\":\"345.047px\",\"left\":\"87px\"}}}}', 1, '2018-12-23 07:39:41');

-- --------------------------------------------------------

--
-- 資料表結構 `user`
--

CREATE TABLE `user` (
  `id` int(10) UNSIGNED NOT NULL,
  `account` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `permission` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `status` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `time_create` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 資料表的匯出資料 `user`
--

INSERT INTO `user` (`id`, `account`, `password`, `permission`, `status`, `email`, `time_create`) VALUES
(7, 'root', '1084c29da0ccd38cfcf3d9c92c148026', 'admin', 1, '', '2018-12-23 07:38:10');

--
-- 已匯出資料表的索引
--

--
-- 資料表索引 `php_session`
--
ALTER TABLE `php_session`
  ADD PRIMARY KEY (`id`);

--
-- 資料表索引 `story`
--
ALTER TABLE `story`
  ADD PRIMARY KEY (`id`),
  ADD KEY `status` (`status`),
  ADD KEY `uid` (`uid`);

--
-- 資料表索引 `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account` (`account`(191)),
  ADD KEY `status` (`status`);

--
-- 在匯出的資料表使用 AUTO_INCREMENT
--

--
-- 使用資料表 AUTO_INCREMENT `story`
--
ALTER TABLE `story`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- 使用資料表 AUTO_INCREMENT `user`
--
ALTER TABLE `user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
