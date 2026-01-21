-- ============================================
-- 叮当讲故事 - 导入弟子规课程数据
-- 执行此脚本前，请先执行 setup.sql
-- ============================================

INSERT INTO dingdang_study_courses (id, category, title, text, pinyin, sort_order, is_active) VALUES
('dzg-1', 'dizigui', '弟子规 · 总叙', '弟子规 圣人训 首孝弟 次谨信 泛爱众 而亲仁 有余力 则学文', 'dì zǐ guī shèng rén xùn shǒu xiào tì cì jǐn xìn fàn ài zhòng ér qīn rén yǒu yú lì zé xué wén', 0, true),
('dzg-2', 'dizigui', '弟子规 · 入则孝（一）', '父母呼 应勿缓 父母命 行勿懒 父母教 须敬听 父母责 须顺承', 'fù mǔ hū yìng wù huǎn fù mǔ mìng xíng wù lǎn fù mǔ jiào xū jìng tīng fù mǔ zé xū shùn chéng', 1, true),
('dzg-3', 'dizigui', '弟子规 · 入则孝（二）', '冬则温 夏则凊 晨则省 昏则定 出必告 反必面 居有常 业无变', 'dōng zé wēn xià zé jìng chén zé xǐng hūn zé dìng chū bì gào fǎn bì miàn jū yǒu cháng yè wú biàn', 2, true),
('dzg-4', 'dizigui', '弟子规 · 入则孝（三）', '事虽小 勿擅为 苟擅为 子道亏 物虽小 勿私藏 苟私藏 亲心伤', 'shì suī xiǎo wù shàn wéi gǒu shàn wéi zǐ dào kuī wù suī xiǎo wù sī cáng gǒu sī cáng qīn xīn shāng', 3, true),
('dzg-5', 'dizigui', '弟子规 · 入则孝（四）', '亲所好 力为具 亲所恶 谨为去 身有伤 贻亲忧 德有伤 贻亲羞', 'qīn suǒ hào lì wèi jù qīn suǒ wù jǐn wèi qù shēn yǒu shāng yí qīn yōu dé yǒu shāng yí qīn xiū', 4, true),
('dzg-6', 'dizigui', '弟子规 · 入则孝（五）', '亲爱我 孝何难 亲憎我 孝方贤 亲有过 谏使更 怡吾色 柔吾声', 'qīn ài wǒ xiào hé nán qīn zēng wǒ xiào fāng xián qīn yǒu guò jiàn shǐ gēng yí wú sè róu wú shēng', 5, true),
('dzg-7', 'dizigui', '弟子规 · 入则孝（六）', '谏不入 悦复谏 号泣随 挞无怨 亲有疾 药先尝 昼夜侍 不离床', 'jiàn bù rù yuè fù jiàn háo qì suí tà wú yuàn qīn yǒu jí yào xiān cháng zhòu yè shì bù lí chuáng', 6, true),
('dzg-8', 'dizigui', '弟子规 · 入则孝（七）', '丧三年 常悲咽 居处变 酒肉绝 丧尽礼 祭尽诚 事死者 如事生', 'sāng sān nián cháng bēi yè jū chǔ biàn jiǔ ròu jué sāng jìn lǐ jì jìn chéng shì sǐ zhě rú shì shēng', 7, true),
('dzg-9', 'dizigui', '弟子规 · 出则悌（一）', '兄道友 弟道恭 兄弟睦 孝在中 财物轻 怨何生 言语忍 忿自泯', 'xiōng dào yǒu dì dào gōng xiōng dì mù xiào zài zhōng cái wù qīng yuàn hé shēng yán yǔ rěn fèn zì mǐn', 8, true),
('dzg-10', 'dizigui', '弟子规 · 出则悌（二）', '或饮食 或坐走 长者先 幼者后 长呼人 即代叫 人不在 己即到', 'huò yǐn shí huò zuò zǒu zhǎng zhě xiān yòu zhě hòu zhǎng hū rén jí dài jiào rén bù zài jǐ jí dào', 9, true),
('dzg-11', 'dizigui', '弟子规 · 出则悌（三）', '称尊长 勿呼名 对尊长 勿见能 路遇长 疾趋揖 长无言 退恭立', 'chēng zūn zhǎng wù hū míng duì zūn zhǎng wù xiàn néng lù yù zhǎng jí qū yī zhǎng wú yán tuì gōng lì', 10, true),
('dzg-12', 'dizigui', '弟子规 · 出则悌（四）', '骑下马 乘下车 过犹待 百步余 长者立 幼勿坐 长者坐 命乃坐', 'qí xià mǎ chéng xià chē guò yóu dài bǎi bù yú zhǎng zhě lì yòu wù zuò zhǎng zhě zuò mìng nǎi zuò', 11, true),
('dzg-13', 'dizigui', '弟子规 · 出则悌（五）', '尊长前 声要低 低不闻 却非宜 进必趋 退必迟 问起对 视勿移', 'zūn zhǎng qián shēng yào dī dī bù wén què fēi yí jìn bì qū tuì bì chí wèn qǐ duì shì wù yí', 12, true),
('dzg-14', 'dizigui', '弟子规 · 出则悌（六）', '事诸父 如事父 事诸兄 如事兄', 'shì zhū fù rú shì fù shì zhū xiōng rú shì xiōng', 13, true),
('dzg-15', 'dizigui', '弟子规 · 谨（一）', '朝起早 夜眠迟 老易至 惜此时 晨必盥 兼漱口 便溺回 辄净手', 'zhāo qǐ zǎo yè mián chí lǎo yì zhì xī cǐ shí chén bì guàn jiān shù kǒu biàn niào huí zhé jìng shǒu', 14, true),
('dzg-16', 'dizigui', '弟子规 · 谨（二）', '冠必正 纽必结 袜与履 俱紧切 置冠服 有定位 勿乱顿 致污秽', 'guān bì zhèng niǔ bì jié wà yǔ lǚ jù jǐn qiè zhì guān fú yǒu dìng wèi wù luàn dùn zhì wū huì', 15, true),
('dzg-17', 'dizigui', '弟子规 · 谨（三）', '衣贵洁 不贵华 上循分 下称家 对饮食 勿拣择 食适可 勿过则', 'yī guì jié bù guì huá shàng xún fèn xià chèn jiā duì yǐn shí wù jiǎn zé shí shì kě wù guò zé', 16, true),
('dzg-18', 'dizigui', '弟子规 · 谨（四）', '年方少 勿饮酒 饮酒醉 最为丑 步从容 立端正 揖深圆 拜恭敬', 'nián fāng shào wù yǐn jiǔ yǐn jiǔ zuì zuì wéi chǒu bù cóng róng lì duān zhèng yī shēn yuán bài gōng jìng', 17, true),
('dzg-19', 'dizigui', '弟子规 · 谨（五）', '勿践阈 勿跛倚 勿箕踞 勿摇髀 缓揭帘 勿有声 宽转弯 勿触棱', 'wù jiàn yù wù bǒ yǐ wù jī jù wù yáo bì huǎn jiē lián wù yǒu shēng kuān zhuǎn wān wù chù léng', 18, true),
('dzg-20', 'dizigui', '弟子规 · 谨（六）', '执虚器 如执盈 入虚室 如有人 事勿忙 忙多错 勿畏难 勿轻略', 'zhí xū qì rú zhí yíng rù xū shì rú yǒu rén shì wù máng máng duō cuò wù wèi nán wù qīng lüè', 19, true),
('dzg-21', 'dizigui', '弟子规 · 谨（七）', '斗闹场 绝勿近 邪僻事 绝勿问 将入门 问孰存 将上堂 声必扬', 'dòu nào chǎng jué wù jìn xié pì shì jué wù wèn jiāng rù mén wèn shú cún jiāng shàng táng shēng bì yáng', 20, true),
('dzg-22', 'dizigui', '弟子规 · 谨（八）', '人问谁 对以名 吾与我 不分明 用人物 须明求 倘不问 即为偷', 'rén wèn shuí duì yǐ míng wú yǔ wǒ bù fēn míng yòng rén wù xū míng qiú tǎng bù wèn jí wéi tōu', 21, true),
('dzg-23', 'dizigui', '弟子规 · 谨（九）', '借人物 及时还 后有急 借不难', 'jiè rén wù jí shí huán hòu yǒu jí jiè bù nán', 22, true),
('dzg-24', 'dizigui', '弟子规 · 信（一）', '凡出言 信为先 诈与妄 奚可焉 话说多 不如少 惟其是 勿佞巧', 'fán chū yán xìn wéi xiān zhà yǔ wàng xī kě yān huà shuō duō bù rú shǎo wéi qí shì wù nìng qiǎo', 23, true),
('dzg-25', 'dizigui', '弟子规 · 信（二）', '奸巧语 秽污词 市井气 切戒之 见未真 勿轻言 知未的 勿轻传', 'jiān qiǎo yǔ huì wū cí shì jǐng qì qiè jiè zhī jiàn wèi zhēn wù qīng yán zhī wèi dì wù qīng chuán', 24, true),
('dzg-26', 'dizigui', '弟子规 · 信（三）', '事非宜 勿轻诺 苟轻诺 进退错 凡道字 重且舒 勿急疾 勿模糊', 'shì fēi yí wù qīng nuò gǒu qīng nuò jìn tuì cuò fán dào zì zhòng qiě shū wù jí jí wù mó hú', 25, true),
('dzg-27', 'dizigui', '弟子规 · 信（四）', '彼说长 此说短 不关己 莫闲管 见人善 即思齐 纵去远 以渐跻', 'bǐ shuō cháng cǐ shuō duǎn bù guān jǐ mò xián guǎn jiàn rén shàn jí sī qí zòng qù yuǎn yǐ jiàn jī', 26, true),
('dzg-28', 'dizigui', '弟子规 · 信（五）', '见人恶 即内省 有则改 无加警 唯德学 唯才艺 不如人 当自砺', 'jiàn rén è jí nèi xǐng yǒu zé gǎi wú jiā jǐng wéi dé xué wéi cái yì bù rú rén dāng zì lì', 27, true),
('dzg-29', 'dizigui', '弟子规 · 信（六）', '若衣服 若饮食 不如人 勿生戚 闻过怒 闻誉乐 损友来 益友却', 'ruò yī fú ruò yǐn shí bù rú rén wù shēng qī wén guò nù wén yù lè sǔn yǒu lái yì yǒu què', 28, true),
('dzg-30', 'dizigui', '弟子规 · 信（七）', '闻誉恐 闻过欣 直谅士 渐相亲 无心非 名为错 有心非 名为恶', 'wén yù kǒng wén guò xīn zhí liàng shì jiàn xiāng qīn wú xīn fēi míng wéi cuò yǒu xīn fēi míng wéi è', 29, true),
('dzg-31', 'dizigui', '弟子规 · 信（八）', '过能改 归于无 倘掩饰 增一辜', 'guò néng gǎi guī yú wú tǎng yǎn shì zēng yī gū', 30, true),
('dzg-32', 'dizigui', '弟子规 · 泛爱众（一）', '凡是人 皆须爱 天同覆 地同载 行高者 名自高 人所重 非貌高', 'fán shì rén jiē xū ài tiān tóng fù dì tóng zài xíng gāo zhě míng zì gāo rén suǒ zhòng fēi mào gāo', 31, true),
('dzg-33', 'dizigui', '弟子规 · 泛爱众（二）', '才大者 望自大 人所服 非言大 己有能 勿自私 人所能 勿轻訾', 'cái dà zhě wàng zì dà rén suǒ fú fēi yán dà jǐ yǒu néng wù zì sī rén suǒ néng wù qīng zī', 32, true),
('dzg-34', 'dizigui', '弟子规 · 泛爱众（三）', '勿谄富 勿骄贫 勿厌故 勿喜新 人不闲 勿事搅 人不安 勿话扰', 'wù chǎn fù wù jiāo pín wù yàn gù wù xǐ xīn rén bù xián wù shì jiǎo rén bù ān wù huà rǎo', 33, true),
('dzg-35', 'dizigui', '弟子规 · 泛爱众（四）', '人有短 切莫揭 人有私 切莫说 道人善 即是善 人知之 愈思勉', 'rén yǒu duǎn qiè mò jiē rén yǒu sī qiè mò shuō dào rén shàn jí shì shàn rén zhī zhī yù sī miǎn', 34, true),
('dzg-36', 'dizigui', '弟子规 · 泛爱众（五）', '扬人恶 即是恶 疾之甚 祸且作 善相劝 德皆建 过不规 道两亏', 'yáng rén è jí shì è jí zhī shèn huò qiě zuò shàn xiāng quàn dé jiē jiàn guò bù guī dào liǎng kuī', 35, true),
('dzg-37', 'dizigui', '弟子规 · 泛爱众（六）', '凡取与 贵分晓 与宜多 取宜少 将加人 先问己 己不欲 即速已', 'fán qǔ yǔ guì fēn xiǎo yǔ yí duō qǔ yí shǎo jiāng jiā rén xiān wèn jǐ jǐ bù yù jí sù yǐ', 36, true),
('dzg-38', 'dizigui', '弟子规 · 泛爱众（七）', '恩欲报 怨欲忘 报怨短 报恩长 待婢仆 身贵端 虽贵端 慈而宽', 'ēn yù bào yuàn yù wàng bào yuàn duǎn bào ēn cháng dài bì pú shēn guì duān suī guì duān cí ér kuān', 37, true),
('dzg-39', 'dizigui', '弟子规 · 泛爱众（八）', '势服人 心不然 理服人 方无言', 'shì fú rén xīn bù rán lǐ fú rén fāng wú yán', 38, true),
('dzg-40', 'dizigui', '弟子规 · 亲仁', '同是人 类不齐 流俗众 仁者希 果仁者 人多畏 言不讳 色不媚 能亲仁 无限好 德日进 过日少 不亲仁 无限害 小人进 百事坏', 'tóng shì rén lèi bù qí liú sú zhòng rén zhě xī guǒ rén zhě rén duō wèi yán bù huì sè bù mèi néng qīn rén wú xiàn hǎo dé rì jìn guò rì shǎo bù qīn rén wú xiàn hài xiǎo rén jìn bǎi shì huài', 39, true),
('dzg-41', 'dizigui', '弟子规 · 余力学文（一）', '不力行 但学文 长浮华 成何人 但力行 不学文 任己见 昧理真', 'bù lì xíng dàn xué wén zhǎng fú huá chéng hé rén dàn lì xíng bù xué wén rèn jǐ jiàn mèi lǐ zhēn', 40, true),
('dzg-42', 'dizigui', '弟子规 · 余力学文（二）', '读书法 有三到 心眼口 信皆要 方读此 勿慕彼 此未终 彼勿起', 'dú shū fǎ yǒu sān dào xīn yǎn kǒu xìn jiē yào fāng dú cǐ wù mù bǐ cǐ wèi zhōng bǐ wù qǐ', 41, true),
('dzg-43', 'dizigui', '弟子规 · 余力学文（三）', '宽为限 紧用功 工夫到 滞塞通 心有疑 随札记 就人问 求确义', 'kuān wéi xiàn jǐn yòng gōng gōng fū dào zhì sè tōng xīn yǒu yí suí zhá jì jiù rén wèn qiú què yì', 42, true),
('dzg-44', 'dizigui', '弟子规 · 余力学文（四）', '房室清 墙壁净 几案洁 笔砚正 墨磨偏 心不端 字不敬 心先病', 'fáng shì qīng qiáng bì jìng jī àn jié bǐ yàn zhèng mò mó piān xīn bù duān zì bù jìng xīn xiān bìng', 43, true),
('dzg-45', 'dizigui', '弟子规 · 余力学文（五）', '列典籍 有定处 读看毕 还原处 虽有急 卷束齐 有缺坏 就补之', 'liè diǎn jí yǒu dìng chù dú kàn bì huán yuán chù suī yǒu jí juàn shù qí yǒu quē huài jiù bǔ zhī', 44, true),
('dzg-46', 'dizigui', '弟子规 · 余力学文（六）', '非圣书 屏勿视 蔽聪明 坏心志 勿自暴 勿自弃 圣与贤 可驯致', 'fēi shèng shū bǐng wù shì bì cōng míng huài xīn zhì wù zì bào wù zì qì shèng yǔ xián kě xùn zhì', 45, true)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  text = EXCLUDED.text,
  pinyin = EXCLUDED.pinyin,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 验证导入
SELECT count(*) as total_courses FROM dingdang_study_courses;
