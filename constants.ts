import { ClassicContent, ChildProfile, DiaryEntry } from './types';

export const DEFAULT_PROFILE: ChildProfile = {
  name: "叮当",
  age: 5,
  redFlowers: 12
};

export const INITIAL_DIARIES: DiaryEntry[] = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    content: "今天叮当帮奶奶拿了拖鞋，奶奶夸他是好孩子。但是吃饭的时候把青菜挑出来了，不爱吃青菜。",
    photos: [],
    isDraft: false
  },
  {
    id: '2',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    content: "叮当在幼儿园学会了一首新儿歌，回来唱给我们听，特别开心。晚上主动刷牙，说要保护牙齿。",
    photos: [],
    isDraft: false
  },
  {
    id: '3',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
    content: "今天带叮当去公园玩，他第一次主动把自己的玩具分享给别的小朋友，虽然有点舍不得，但最后还是递给了那个小弟弟。",
    photos: [],
    isDraft: false
  }
];

export const CLASSIC_LIBRARY: ClassicContent[] = [
  // ==================== 弟子规 ====================
  // 总叙
  {
    id: 'dzg-1',
    category: 'dizigui',
    title: '弟子规 · 总叙',
    text: '弟子规 圣人训 首孝弟 次谨信 泛爱众 而亲仁 有余力 则学文',
    pinyin: 'dì zǐ guī shèng rén xùn shǒu xiào tì cì jǐn xìn fàn ài zhòng ér qīn rén yǒu yú lì zé xué wén',
    isLearned: true,
    learnedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },

  // 入则孝（一）
  {
    id: 'dzg-2',
    category: 'dizigui',
    title: '弟子规 · 入则孝（一）',
    text: '父母呼 应勿缓 父母命 行勿懒 父母教 须敬听 父母责 须顺承',
    pinyin: 'fù mǔ hū yìng wù huǎn fù mǔ mìng xíng wù lǎn fù mǔ jiào xū jìng tīng fù mǔ zé xū shùn chéng'
  },
  // 入则孝（二）
  {
    id: 'dzg-3',
    category: 'dizigui',
    title: '弟子规 · 入则孝（二）',
    text: '冬则温 夏则凊 晨则省 昏则定 出必告 反必面 居有常 业无变',
    pinyin: 'dōng zé wēn xià zé jìng chén zé xǐng hūn zé dìng chū bì gào fǎn bì miàn jū yǒu cháng yè wú biàn'
  },
  // 入则孝（三）
  {
    id: 'dzg-4',
    category: 'dizigui',
    title: '弟子规 · 入则孝（三）',
    text: '事虽小 勿擅为 苟擅为 子道亏 物虽小 勿私藏 苟私藏 亲心伤',
    pinyin: 'shì suī xiǎo wù shàn wéi gǒu shàn wéi zǐ dào kuī wù suī xiǎo wù sī cáng gǒu sī cáng qīn xīn shāng'
  },
  // 入则孝（四）
  {
    id: 'dzg-5',
    category: 'dizigui',
    title: '弟子规 · 入则孝（四）',
    text: '亲所好 力为具 亲所恶 谨为去 身有伤 贻亲忧 德有伤 贻亲羞',
    pinyin: 'qīn suǒ hào lì wèi jù qīn suǒ wù jǐn wèi qù shēn yǒu shāng yí qīn yōu dé yǒu shāng yí qīn xiū'
  },
  // 入则孝（五）
  {
    id: 'dzg-6',
    category: 'dizigui',
    title: '弟子规 · 入则孝（五）',
    text: '亲爱我 孝何难 亲憎我 孝方贤 亲有过 谏使更 怡吾色 柔吾声',
    pinyin: 'qīn ài wǒ xiào hé nán qīn zēng wǒ xiào fāng xián qīn yǒu guò jiàn shǐ gēng yí wú sè róu wú shēng'
  },
  // 入则孝（六）
  {
    id: 'dzg-7',
    category: 'dizigui',
    title: '弟子规 · 入则孝（六）',
    text: '谏不入 悦复谏 号泣随 挞无怨 亲有疾 药先尝 昼夜侍 不离床',
    pinyin: 'jiàn bù rù yuè fù jiàn háo qì suí tà wú yuàn qīn yǒu jí yào xiān cháng zhòu yè shì bù lí chuáng'
  },
  // 入则孝（七）
  {
    id: 'dzg-8',
    category: 'dizigui',
    title: '弟子规 · 入则孝（七）',
    text: '丧三年 常悲咽 居处变 酒肉绝 丧尽礼 祭尽诚 事死者 如事生',
    pinyin: 'sāng sān nián cháng bēi yè jū chǔ biàn jiǔ ròu jué sāng jìn lǐ jì jìn chéng shì sǐ zhě rú shì shēng'
  },

  // 出则悌（一）
  {
    id: 'dzg-9',
    category: 'dizigui',
    title: '弟子规 · 出则悌（一）',
    text: '兄道友 弟道恭 兄弟睦 孝在中 财物轻 怨何生 言语忍 忿自泯',
    pinyin: 'xiōng dào yǒu dì dào gōng xiōng dì mù xiào zài zhōng cái wù qīng yuàn hé shēng yán yǔ rěn fèn zì mǐn'
  },
  // 出则悌（二）
  {
    id: 'dzg-10',
    category: 'dizigui',
    title: '弟子规 · 出则悌（二）',
    text: '或饮食 或坐走 长者先 幼者后 长呼人 即代叫 人不在 己即到',
    pinyin: 'huò yǐn shí huò zuò zǒu zhǎng zhě xiān yòu zhě hòu zhǎng hū rén jí dài jiào rén bù zài jǐ jí dào'
  },
  // 出则悌（三）
  {
    id: 'dzg-11',
    category: 'dizigui',
    title: '弟子规 · 出则悌（三）',
    text: '称尊长 勿呼名 对尊长 勿见能 路遇长 疾趋揖 长无言 退恭立',
    pinyin: 'chēng zūn zhǎng wù hū míng duì zūn zhǎng wù xiàn néng lù yù zhǎng jí qū yī zhǎng wú yán tuì gōng lì'
  },
  // 出则悌（四）
  {
    id: 'dzg-12',
    category: 'dizigui',
    title: '弟子规 · 出则悌（四）',
    text: '骑下马 乘下车 过犹待 百步余 长者立 幼勿坐 长者坐 命乃坐',
    pinyin: 'qí xià mǎ chéng xià chē guò yóu dài bǎi bù yú zhǎng zhě lì yòu wù zuò zhǎng zhě zuò mìng nǎi zuò'
  },
  // 出则悌（五）
  {
    id: 'dzg-13',
    category: 'dizigui',
    title: '弟子规 · 出则悌（五）',
    text: '尊长前 声要低 低不闻 却非宜 进必趋 退必迟 问起对 视勿移',
    pinyin: 'zūn zhǎng qián shēng yào dī dī bù wén què fēi yí jìn bì qū tuì bì chí wèn qǐ duì shì wù yí'
  },
  // 出则悌（六）
  {
    id: 'dzg-14',
    category: 'dizigui',
    title: '弟子规 · 出则悌（六）',
    text: '事诸父 如事父 事诸兄 如事兄',
    pinyin: 'shì zhū fù rú shì fù shì zhū xiōng rú shì xiōng'
  },

  // 谨（一）
  {
    id: 'dzg-15',
    category: 'dizigui',
    title: '弟子规 · 谨（一）',
    text: '朝起早 夜眠迟 老易至 惜此时 晨必盥 兼漱口 便溺回 辄净手',
    pinyin: 'zhāo qǐ zǎo yè mián chí lǎo yì zhì xī cǐ shí chén bì guàn jiān shù kǒu biàn niào huí zhé jìng shǒu'
  },
  // 谨（二）
  {
    id: 'dzg-16',
    category: 'dizigui',
    title: '弟子规 · 谨（二）',
    text: '冠必正 纽必结 袜与履 俱紧切 置冠服 有定位 勿乱顿 致污秽',
    pinyin: 'guān bì zhèng niǔ bì jié wà yǔ lǚ jù jǐn qiè zhì guān fú yǒu dìng wèi wù luàn dùn zhì wū huì'
  },
  // 谨（三）
  {
    id: 'dzg-17',
    category: 'dizigui',
    title: '弟子规 · 谨（三）',
    text: '衣贵洁 不贵华 上循分 下称家 对饮食 勿拣择 食适可 勿过则',
    pinyin: 'yī guì jié bù guì huá shàng xún fèn xià chèn jiā duì yǐn shí wù jiǎn zé shí shì kě wù guò zé'
  },
  // 谨（四）
  {
    id: 'dzg-18',
    category: 'dizigui',
    title: '弟子规 · 谨（四）',
    text: '年方少 勿饮酒 饮酒醉 最为丑 步从容 立端正 揖深圆 拜恭敬',
    pinyin: 'nián fāng shào wù yǐn jiǔ yǐn jiǔ zuì zuì wéi chǒu bù cóng róng lì duān zhèng yī shēn yuán bài gōng jìng'
  },
  // 谨（五）
  {
    id: 'dzg-19',
    category: 'dizigui',
    title: '弟子规 · 谨（五）',
    text: '勿践阈 勿跛倚 勿箕踞 勿摇髀 缓揭帘 勿有声 宽转弯 勿触棱',
    pinyin: 'wù jiàn yù wù bǒ yǐ wù jī jù wù yáo bì huǎn jiē lián wù yǒu shēng kuān zhuǎn wān wù chù léng'
  },
  // 谨（六）
  {
    id: 'dzg-20',
    category: 'dizigui',
    title: '弟子规 · 谨（六）',
    text: '执虚器 如执盈 入虚室 如有人 事勿忙 忙多错 勿畏难 勿轻略',
    pinyin: 'zhí xū qì rú zhí yíng rù xū shì rú yǒu rén shì wù máng máng duō cuò wù wèi nán wù qīng lüè'
  },
  // 谨（七）
  {
    id: 'dzg-21',
    category: 'dizigui',
    title: '弟子规 · 谨（七）',
    text: '斗闹场 绝勿近 邪僻事 绝勿问 将入门 问孰存 将上堂 声必扬',
    pinyin: 'dòu nào chǎng jué wù jìn xié pì shì jué wù wèn jiāng rù mén wèn shú cún jiāng shàng táng shēng bì yáng'
  },
  // 谨（八）
  {
    id: 'dzg-22',
    category: 'dizigui',
    title: '弟子规 · 谨（八）',
    text: '人问谁 对以名 吾与我 不分明 用人物 须明求 倘不问 即为偷',
    pinyin: 'rén wèn shuí duì yǐ míng wú yǔ wǒ bù fēn míng yòng rén wù xū míng qiú tǎng bù wèn jí wéi tōu'
  },
  // 谨（九）
  {
    id: 'dzg-23',
    category: 'dizigui',
    title: '弟子规 · 谨（九）',
    text: '借人物 及时还 后有急 借不难',
    pinyin: 'jiè rén wù jí shí huán hòu yǒu jí jiè bù nán'
  },

  // 信（一）
  {
    id: 'dzg-24',
    category: 'dizigui',
    title: '弟子规 · 信（一）',
    text: '凡出言 信为先 诈与妄 奚可焉 话说多 不如少 惟其是 勿佞巧',
    pinyin: 'fán chū yán xìn wéi xiān zhà yǔ wàng xī kě yān huà shuō duō bù rú shǎo wéi qí shì wù nìng qiǎo'
  },
  // 信（二）
  {
    id: 'dzg-25',
    category: 'dizigui',
    title: '弟子规 · 信（二）',
    text: '奸巧语 秽污词 市井气 切戒之 见未真 勿轻言 知未的 勿轻传',
    pinyin: 'jiān qiǎo yǔ huì wū cí shì jǐng qì qiè jiè zhī jiàn wèi zhēn wù qīng yán zhī wèi dì wù qīng chuán'
  },
  // 信（三）
  {
    id: 'dzg-26',
    category: 'dizigui',
    title: '弟子规 · 信（三）',
    text: '事非宜 勿轻诺 苟轻诺 进退错 凡道字 重且舒 勿急疾 勿模糊',
    pinyin: 'shì fēi yí wù qīng nuò gǒu qīng nuò jìn tuì cuò fán dào zì zhòng qiě shū wù jí jí wù mó hú'
  },
  // 信（四）
  {
    id: 'dzg-27',
    category: 'dizigui',
    title: '弟子规 · 信（四）',
    text: '彼说长 此说短 不关己 莫闲管 见人善 即思齐 纵去远 以渐跻',
    pinyin: 'bǐ shuō cháng cǐ shuō duǎn bù guān jǐ mò xián guǎn jiàn rén shàn jí sī qí zòng qù yuǎn yǐ jiàn jī'
  },
  // 信（五）
  {
    id: 'dzg-28',
    category: 'dizigui',
    title: '弟子规 · 信（五）',
    text: '见人恶 即内省 有则改 无加警 唯德学 唯才艺 不如人 当自砺',
    pinyin: 'jiàn rén è jí nèi xǐng yǒu zé gǎi wú jiā jǐng wéi dé xué wéi cái yì bù rú rén dāng zì lì'
  },
  // 信（六）
  {
    id: 'dzg-29',
    category: 'dizigui',
    title: '弟子规 · 信（六）',
    text: '若衣服 若饮食 不如人 勿生戚 闻过怒 闻誉乐 损友来 益友却',
    pinyin: 'ruò yī fú ruò yǐn shí bù rú rén wù shēng qī wén guò nù wén yù lè sǔn yǒu lái yì yǒu què'
  },
  // 信（七）
  {
    id: 'dzg-30',
    category: 'dizigui',
    title: '弟子规 · 信（七）',
    text: '闻誉恐 闻过欣 直谅士 渐相亲 无心非 名为错 有心非 名为恶',
    pinyin: 'wén yù kǒng wén guò xīn zhí liàng shì jiàn xiāng qīn wú xīn fēi míng wéi cuò yǒu xīn fēi míng wéi è'
  },
  // 信（八）
  {
    id: 'dzg-31',
    category: 'dizigui',
    title: '弟子规 · 信（八）',
    text: '过能改 归于无 倘掩饰 增一辜',
    pinyin: 'guò néng gǎi guī yú wú tǎng yǎn shì zēng yī gū'
  },

  // 泛爱众（一）
  {
    id: 'dzg-32',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（一）',
    text: '凡是人 皆须爱 天同覆 地同载 行高者 名自高 人所重 非貌高',
    pinyin: 'fán shì rén jiē xū ài tiān tóng fù dì tóng zài xíng gāo zhě míng zì gāo rén suǒ zhòng fēi mào gāo'
  },
  // 泛爱众（二）
  {
    id: 'dzg-33',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（二）',
    text: '才大者 望自大 人所服 非言大 己有能 勿自私 人所能 勿轻訾',
    pinyin: 'cái dà zhě wàng zì dà rén suǒ fú fēi yán dà jǐ yǒu néng wù zì sī rén suǒ néng wù qīng zī'
  },
  // 泛爱众（三）
  {
    id: 'dzg-34',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（三）',
    text: '勿谄富 勿骄贫 勿厌故 勿喜新 人不闲 勿事搅 人不安 勿话扰',
    pinyin: 'wù chǎn fù wù jiāo pín wù yàn gù wù xǐ xīn rén bù xián wù shì jiǎo rén bù ān wù huà rǎo'
  },
  // 泛爱众（四）
  {
    id: 'dzg-35',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（四）',
    text: '人有短 切莫揭 人有私 切莫说 道人善 即是善 人知之 愈思勉',
    pinyin: 'rén yǒu duǎn qiè mò jiē rén yǒu sī qiè mò shuō dào rén shàn jí shì shàn rén zhī zhī yù sī miǎn'
  },
  // 泛爱众（五）
  {
    id: 'dzg-36',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（五）',
    text: '扬人恶 即是恶 疾之甚 祸且作 善相劝 德皆建 过不规 道两亏',
    pinyin: 'yáng rén è jí shì è jí zhī shèn huò qiě zuò shàn xiāng quàn dé jiē jiàn guò bù guī dào liǎng kuī'
  },
  // 泛爱众（六）
  {
    id: 'dzg-37',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（六）',
    text: '凡取与 贵分晓 与宜多 取宜少 将加人 先问己 己不欲 即速已',
    pinyin: 'fán qǔ yǔ guì fēn xiǎo yǔ yí duō qǔ yí shǎo jiāng jiā rén xiān wèn jǐ jǐ bù yù jí sù yǐ'
  },
  // 泛爱众（七）
  {
    id: 'dzg-38',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（七）',
    text: '恩欲报 怨欲忘 报怨短 报恩长 待婢仆 身贵端 虽贵端 慈而宽',
    pinyin: 'ēn yù bào yuàn yù wàng bào yuàn duǎn bào ēn cháng dài bì pú shēn guì duān suī guì duān cí ér kuān'
  },
  // 泛爱众（八）
  {
    id: 'dzg-39',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（八）',
    text: '势服人 心不然 理服人 方无言',
    pinyin: 'shì fú rén xīn bù rán lǐ fú rén fāng wú yán'
  },

  // 亲仁
  {
    id: 'dzg-40',
    category: 'dizigui',
    title: '弟子规 · 亲仁',
    text: '同是人 类不齐 流俗众 仁者希 果仁者 人多畏 言不讳 色不媚 能亲仁 无限好 德日进 过日少 不亲仁 无限害 小人进 百事坏',
    pinyin: 'tóng shì rén lèi bù qí liú sú zhòng rén zhě xī guǒ rén zhě rén duō wèi yán bù huì sè bù mèi néng qīn rén wú xiàn hǎo dé rì jìn guò rì shǎo bù qīn rén wú xiàn hài xiǎo rén jìn bǎi shì huài'
  },

  // 余力学文（一）
  {
    id: 'dzg-41',
    category: 'dizigui',
    title: '弟子规 · 余力学文（一）',
    text: '不力行 但学文 长浮华 成何人 但力行 不学文 任己见 昧理真',
    pinyin: 'bù lì xíng dàn xué wén zhǎng fú huá chéng hé rén dàn lì xíng bù xué wén rèn jǐ jiàn mèi lǐ zhēn'
  },
  // 余力学文（二）
  {
    id: 'dzg-42',
    category: 'dizigui',
    title: '弟子规 · 余力学文（二）',
    text: '读书法 有三到 心眼口 信皆要 方读此 勿慕彼 此未终 彼勿起',
    pinyin: 'dú shū fǎ yǒu sān dào xīn yǎn kǒu xìn jiē yào fāng dú cǐ wù mù bǐ cǐ wèi zhōng bǐ wù qǐ'
  },
  // 余力学文（三）
  {
    id: 'dzg-43',
    category: 'dizigui',
    title: '弟子规 · 余力学文（三）',
    text: '宽为限 紧用功 工夫到 滞塞通 心有疑 随札记 就人问 求确义',
    pinyin: 'kuān wéi xiàn jǐn yòng gōng gōng fū dào zhì sè tōng xīn yǒu yí suí zhá jì jiù rén wèn qiú què yì'
  },
  // 余力学文（四）
  {
    id: 'dzg-44',
    category: 'dizigui',
    title: '弟子规 · 余力学文（四）',
    text: '房室清 墙壁净 几案洁 笔砚正 墨磨偏 心不端 字不敬 心先病',
    pinyin: 'fáng shì qīng qiáng bì jìng jī àn jié bǐ yàn zhèng mò mó piān xīn bù duān zì bù jìng xīn xiān bìng'
  },
  // 余力学文（五）
  {
    id: 'dzg-45',
    category: 'dizigui',
    title: '弟子规 · 余力学文（五）',
    text: '列典籍 有定处 读看毕 还原处 虽有急 卷束齐 有缺坏 就补之',
    pinyin: 'liè diǎn jí yǒu dìng chù dú kàn bì huán yuán chù suī yǒu jí juàn shù qí yǒu quē huài jiù bǔ zhī'
  },
  // 余力学文（六）
  {
    id: 'dzg-46',
    category: 'dizigui',
    title: '弟子规 · 余力学文（六）',
    text: '非圣书 屏勿视 蔽聪明 坏心志 勿自暴 勿自弃 圣与贤 可驯致',
    pinyin: 'fēi shèng shū bǐng wù shì bì cōng míng huài xīn zhì wù zì bào wù zì qì shèng yǔ xián kě xùn zhì'
  }
];

// 分类信息
export const CATEGORY_INFO = {
  dizigui: {
    name: '弟子规',
    icon: '📖',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    description: '学习做人的道理'
  },
  custom: {
    name: '自定义',
    icon: '✨',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: '家长添加的内容'
  }
};

// 获取今日内容的索引（基于日期计算，确保每天内容不同）
export const getTodayContentIndex = (library: ClassicContent[]): number => {
  const today = new Date();
  // 使用本地日期计算，避免时区问题
  const startOfYear = new Date(today.getFullYear(), 0, 1); // 1月1日
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = todayStart.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // +1 因为1月1日是第1天
  return dayOfYear % library.length;
};

// 获取昨日内容索引
export const getYesterdayContentIndex = (library: ClassicContent[]): number => {
  const todayIndex = getTodayContentIndex(library);
  return todayIndex === 0 ? library.length - 1 : todayIndex - 1;
};
