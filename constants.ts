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
    phrases: [
      { text: '弟子规', pinyin: 'dì zǐ guī' },
      { text: '圣人训', pinyin: 'shèng rén xùn' },
      { text: '首孝弟', pinyin: 'shǒu xiào tì' },
      { text: '次谨信', pinyin: 'cì jǐn xìn' },
      { text: '泛爱众', pinyin: 'fàn ài zhòng' },
      { text: '而亲仁', pinyin: 'ér qīn rén' },
      { text: '有余力', pinyin: 'yǒu yú lì' },
      { text: '则学文', pinyin: 'zé xué wén' }
    ],
    isLearned: true,
    learnedDate: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },

  // 入则孝（一）
  {
    id: 'dzg-2',
    category: 'dizigui',
    title: '弟子规 · 入则孝（一）',
    phrases: [
      { text: '父母呼', pinyin: 'fù mǔ hū' },
      { text: '应勿缓', pinyin: 'yìng wù huǎn' },
      { text: '父母命', pinyin: 'fù mǔ mìng' },
      { text: '行勿懒', pinyin: 'xíng wù lǎn' },
      { text: '父母教', pinyin: 'fù mǔ jiào' },
      { text: '须敬听', pinyin: 'xū jìng tīng' },
      { text: '父母责', pinyin: 'fù mǔ zé' },
      { text: '须顺承', pinyin: 'xū shùn chéng' }
    ]
  },

  // 入则孝（二）
  {
    id: 'dzg-3',
    category: 'dizigui',
    title: '弟子规 · 入则孝（二）',
    phrases: [
      { text: '冬则温', pinyin: 'dōng zé wēn' },
      { text: '夏则凊', pinyin: 'xià zé jìng' },
      { text: '晨则省', pinyin: 'chén zé xǐng' },
      { text: '昏则定', pinyin: 'hūn zé dìng' },
      { text: '出必告', pinyin: 'chū bì gào' },
      { text: '反必面', pinyin: 'fǎn bì miàn' },
      { text: '居有常', pinyin: 'jū yǒu cháng' },
      { text: '业无变', pinyin: 'yè wú biàn' }
    ]
  },

  // 入则孝（三）
  {
    id: 'dzg-4',
    category: 'dizigui',
    title: '弟子规 · 入则孝（三）',
    phrases: [
      { text: '事虽小', pinyin: 'shì suī xiǎo' },
      { text: '勿擅为', pinyin: 'wù shàn wéi' },
      { text: '苟擅为', pinyin: 'gǒu shàn wéi' },
      { text: '子道亏', pinyin: 'zǐ dào kuī' },
      { text: '物虽小', pinyin: 'wù suī xiǎo' },
      { text: '勿私藏', pinyin: 'wù sī cáng' },
      { text: '苟私藏', pinyin: 'gǒu sī cáng' },
      { text: '亲心伤', pinyin: 'qīn xīn shāng' }
    ]
  },

  // 入则孝（四）
  {
    id: 'dzg-5',
    category: 'dizigui',
    title: '弟子规 · 入则孝（四）',
    phrases: [
      { text: '亲所好', pinyin: 'qīn suǒ hào' },
      { text: '力为具', pinyin: 'lì wèi jù' },
      { text: '亲所恶', pinyin: 'qīn suǒ wù' },
      { text: '谨为去', pinyin: 'jǐn wèi qù' },
      { text: '身有伤', pinyin: 'shēn yǒu shāng' },
      { text: '贻亲忧', pinyin: 'yí qīn yōu' },
      { text: '德有伤', pinyin: 'dé yǒu shāng' },
      { text: '贻亲羞', pinyin: 'yí qīn xiū' }
    ]
  },

  // 入则孝（五）
  {
    id: 'dzg-6',
    category: 'dizigui',
    title: '弟子规 · 入则孝（五）',
    phrases: [
      { text: '亲爱我', pinyin: 'qīn ài wǒ' },
      { text: '孝何难', pinyin: 'xiào hé nán' },
      { text: '亲憎我', pinyin: 'qīn zēng wǒ' },
      { text: '孝方贤', pinyin: 'xiào fāng xián' },
      { text: '亲有过', pinyin: 'qīn yǒu guò' },
      { text: '谏使更', pinyin: 'jiàn shǐ gēng' },
      { text: '怡吾色', pinyin: 'yí wú sè' },
      { text: '柔吾声', pinyin: 'róu wú shēng' }
    ]
  },

  // 入则孝（六）
  {
    id: 'dzg-7',
    category: 'dizigui',
    title: '弟子规 · 入则孝（六）',
    phrases: [
      { text: '谏不入', pinyin: 'jiàn bù rù' },
      { text: '悦复谏', pinyin: 'yuè fù jiàn' },
      { text: '号泣随', pinyin: 'háo qì suí' },
      { text: '挞无怨', pinyin: 'tà wú yuàn' },
      { text: '亲有疾', pinyin: 'qīn yǒu jí' },
      { text: '药先尝', pinyin: 'yào xiān cháng' },
      { text: '昼夜侍', pinyin: 'zhòu yè shì' },
      { text: '不离床', pinyin: 'bù lí chuáng' }
    ]
  },

  // 入则孝（七）
  {
    id: 'dzg-8',
    category: 'dizigui',
    title: '弟子规 · 入则孝（七）',
    phrases: [
      { text: '丧三年', pinyin: 'sāng sān nián' },
      { text: '常悲咽', pinyin: 'cháng bēi yè' },
      { text: '居处变', pinyin: 'jū chǔ biàn' },
      { text: '酒肉绝', pinyin: 'jiǔ ròu jué' },
      { text: '丧尽礼', pinyin: 'sāng jìn lǐ' },
      { text: '祭尽诚', pinyin: 'jì jìn chéng' },
      { text: '事死者', pinyin: 'shì sǐ zhě' },
      { text: '如事生', pinyin: 'rú shì shēng' }
    ]
  },

  // 出则悌（一）
  {
    id: 'dzg-9',
    category: 'dizigui',
    title: '弟子规 · 出则悌（一）',
    phrases: [
      { text: '兄道友', pinyin: 'xiōng dào yǒu' },
      { text: '弟道恭', pinyin: 'dì dào gōng' },
      { text: '兄弟睦', pinyin: 'xiōng dì mù' },
      { text: '孝在中', pinyin: 'xiào zài zhōng' },
      { text: '财物轻', pinyin: 'cái wù qīng' },
      { text: '怨何生', pinyin: 'yuàn hé shēng' },
      { text: '言语忍', pinyin: 'yán yǔ rěn' },
      { text: '忿自泯', pinyin: 'fèn zì mǐn' }
    ]
  },

  // 出则悌（二）
  {
    id: 'dzg-10',
    category: 'dizigui',
    title: '弟子规 · 出则悌（二）',
    phrases: [
      { text: '或饮食', pinyin: 'huò yǐn shí' },
      { text: '或坐走', pinyin: 'huò zuò zǒu' },
      { text: '长者先', pinyin: 'zhǎng zhě xiān' },
      { text: '幼者后', pinyin: 'yòu zhě hòu' },
      { text: '长呼人', pinyin: 'zhǎng hū rén' },
      { text: '即代叫', pinyin: 'jí dài jiào' },
      { text: '人不在', pinyin: 'rén bù zài' },
      { text: '己即到', pinyin: 'jǐ jí dào' }
    ]
  },

  // 出则悌（三）
  {
    id: 'dzg-11',
    category: 'dizigui',
    title: '弟子规 · 出则悌（三）',
    phrases: [
      { text: '称尊长', pinyin: 'chēng zūn zhǎng' },
      { text: '勿呼名', pinyin: 'wù hū míng' },
      { text: '对尊长', pinyin: 'duì zūn zhǎng' },
      { text: '勿见能', pinyin: 'wù xiàn néng' },
      { text: '路遇长', pinyin: 'lù yù zhǎng' },
      { text: '疾趋揖', pinyin: 'jí qū yī' },
      { text: '长无言', pinyin: 'zhǎng wú yán' },
      { text: '退恭立', pinyin: 'tuì gōng lì' }
    ]
  },

  // 出则悌（四）
  {
    id: 'dzg-12',
    category: 'dizigui',
    title: '弟子规 · 出则悌（四）',
    phrases: [
      { text: '骑下马', pinyin: 'qí xià mǎ' },
      { text: '乘下车', pinyin: 'chéng xià chē' },
      { text: '过犹待', pinyin: 'guò yóu dài' },
      { text: '百步余', pinyin: 'bǎi bù yú' },
      { text: '长者立', pinyin: 'zhǎng zhě lì' },
      { text: '幼勿坐', pinyin: 'yòu wù zuò' },
      { text: '长者坐', pinyin: 'zhǎng zhě zuò' },
      { text: '命乃坐', pinyin: 'mìng nǎi zuò' }
    ]
  },

  // 出则悌（五）
  {
    id: 'dzg-13',
    category: 'dizigui',
    title: '弟子规 · 出则悌（五）',
    phrases: [
      { text: '尊长前', pinyin: 'zūn zhǎng qián' },
      { text: '声要低', pinyin: 'shēng yào dī' },
      { text: '低不闻', pinyin: 'dī bù wén' },
      { text: '却非宜', pinyin: 'què fēi yí' },
      { text: '进必趋', pinyin: 'jìn bì qū' },
      { text: '退必迟', pinyin: 'tuì bì chí' },
      { text: '问起对', pinyin: 'wèn qǐ duì' },
      { text: '视勿移', pinyin: 'shì wù yí' }
    ]
  },

  // 出则悌（六）
  {
    id: 'dzg-14',
    category: 'dizigui',
    title: '弟子规 · 出则悌（六）',
    phrases: [
      { text: '事诸父', pinyin: 'shì zhū fù' },
      { text: '如事父', pinyin: 'rú shì fù' },
      { text: '事诸兄', pinyin: 'shì zhū xiōng' },
      { text: '如事兄', pinyin: 'rú shì xiōng' }
    ]
  },

  // 谨（一）
  {
    id: 'dzg-15',
    category: 'dizigui',
    title: '弟子规 · 谨（一）',
    phrases: [
      { text: '朝起早', pinyin: 'zhāo qǐ zǎo' },
      { text: '夜眠迟', pinyin: 'yè mián chí' },
      { text: '老易至', pinyin: 'lǎo yì zhì' },
      { text: '惜此时', pinyin: 'xī cǐ shí' },
      { text: '晨必盥', pinyin: 'chén bì guàn' },
      { text: '兼漱口', pinyin: 'jiān shù kǒu' },
      { text: '便溺回', pinyin: 'biàn niào huí' },
      { text: '辄净手', pinyin: 'zhé jìng shǒu' }
    ]
  },

  // 谨（二）
  {
    id: 'dzg-16',
    category: 'dizigui',
    title: '弟子规 · 谨（二）',
    phrases: [
      { text: '冠必正', pinyin: 'guān bì zhèng' },
      { text: '纽必结', pinyin: 'niǔ bì jié' },
      { text: '袜与履', pinyin: 'wà yǔ lǚ' },
      { text: '俱紧切', pinyin: 'jù jǐn qiè' },
      { text: '置冠服', pinyin: 'zhì guān fú' },
      { text: '有定位', pinyin: 'yǒu dìng wèi' },
      { text: '勿乱顿', pinyin: 'wù luàn dùn' },
      { text: '致污秽', pinyin: 'zhì wū huì' }
    ]
  },

  // 谨（三）
  {
    id: 'dzg-17',
    category: 'dizigui',
    title: '弟子规 · 谨（三）',
    phrases: [
      { text: '衣贵洁', pinyin: 'yī guì jié' },
      { text: '不贵华', pinyin: 'bù guì huá' },
      { text: '上循分', pinyin: 'shàng xún fèn' },
      { text: '下称家', pinyin: 'xià chèn jiā' },
      { text: '对饮食', pinyin: 'duì yǐn shí' },
      { text: '勿拣择', pinyin: 'wù jiǎn zé' },
      { text: '食适可', pinyin: 'shí shì kě' },
      { text: '勿过则', pinyin: 'wù guò zé' }
    ]
  },

  // 谨（四）
  {
    id: 'dzg-18',
    category: 'dizigui',
    title: '弟子规 · 谨（四）',
    phrases: [
      { text: '年方少', pinyin: 'nián fāng shào' },
      { text: '勿饮酒', pinyin: 'wù yǐn jiǔ' },
      { text: '饮酒醉', pinyin: 'yǐn jiǔ zuì' },
      { text: '最为丑', pinyin: 'zuì wéi chǒu' },
      { text: '步从容', pinyin: 'bù cóng róng' },
      { text: '立端正', pinyin: 'lì duān zhèng' },
      { text: '揖深圆', pinyin: 'yī shēn yuán' },
      { text: '拜恭敬', pinyin: 'bài gōng jìng' }
    ]
  },

  // 谨（五）
  {
    id: 'dzg-19',
    category: 'dizigui',
    title: '弟子规 · 谨（五）',
    phrases: [
      { text: '勿践阈', pinyin: 'wù jiàn yù' },
      { text: '勿跛倚', pinyin: 'wù bǒ yǐ' },
      { text: '勿箕踞', pinyin: 'wù jī jù' },
      { text: '勿摇髀', pinyin: 'wù yáo bì' },
      { text: '缓揭帘', pinyin: 'huǎn jiē lián' },
      { text: '勿有声', pinyin: 'wù yǒu shēng' },
      { text: '宽转弯', pinyin: 'kuān zhuǎn wān' },
      { text: '勿触棱', pinyin: 'wù chù léng' }
    ]
  },

  // 谨（六）
  {
    id: 'dzg-20',
    category: 'dizigui',
    title: '弟子规 · 谨（六）',
    phrases: [
      { text: '执虚器', pinyin: 'zhí xū qì' },
      { text: '如执盈', pinyin: 'rú zhí yíng' },
      { text: '入虚室', pinyin: 'rù xū shì' },
      { text: '如有人', pinyin: 'rú yǒu rén' },
      { text: '事勿忙', pinyin: 'shì wù máng' },
      { text: '忙多错', pinyin: 'máng duō cuò' },
      { text: '勿畏难', pinyin: 'wù wèi nán' },
      { text: '勿轻略', pinyin: 'wù qīng lüè' }
    ]
  },

  // 谨（七）
  {
    id: 'dzg-21',
    category: 'dizigui',
    title: '弟子规 · 谨（七）',
    phrases: [
      { text: '斗闹场', pinyin: 'dòu nào chǎng' },
      { text: '绝勿近', pinyin: 'jué wù jìn' },
      { text: '邪僻事', pinyin: 'xié pì shì' },
      { text: '绝勿问', pinyin: 'jué wù wèn' },
      { text: '将入门', pinyin: 'jiāng rù mén' },
      { text: '问孰存', pinyin: 'wèn shú cún' },
      { text: '将上堂', pinyin: 'jiāng shàng táng' },
      { text: '声必扬', pinyin: 'shēng bì yáng' }
    ]
  },

  // 谨（八）
  {
    id: 'dzg-22',
    category: 'dizigui',
    title: '弟子规 · 谨（八）',
    phrases: [
      { text: '人问谁', pinyin: 'rén wèn shuí' },
      { text: '对以名', pinyin: 'duì yǐ míng' },
      { text: '吾与我', pinyin: 'wú yǔ wǒ' },
      { text: '不分明', pinyin: 'bù fēn míng' },
      { text: '用人物', pinyin: 'yòng rén wù' },
      { text: '须明求', pinyin: 'xū míng qiú' },
      { text: '倘不问', pinyin: 'tǎng bù wèn' },
      { text: '即为偷', pinyin: 'jí wéi tōu' }
    ]
  },

  // 谨（九）
  {
    id: 'dzg-23',
    category: 'dizigui',
    title: '弟子规 · 谨（九）',
    phrases: [
      { text: '借人物', pinyin: 'jiè rén wù' },
      { text: '及时还', pinyin: 'jí shí huán' },
      { text: '后有急', pinyin: 'hòu yǒu jí' },
      { text: '借不难', pinyin: 'jiè bù nán' }
    ]
  },

  // 信（一）
  {
    id: 'dzg-24',
    category: 'dizigui',
    title: '弟子规 · 信（一）',
    phrases: [
      { text: '凡出言', pinyin: 'fán chū yán' },
      { text: '信为先', pinyin: 'xìn wéi xiān' },
      { text: '诈与妄', pinyin: 'zhà yǔ wàng' },
      { text: '奚可焉', pinyin: 'xī kě yān' },
      { text: '话说多', pinyin: 'huà shuō duō' },
      { text: '不如少', pinyin: 'bù rú shǎo' },
      { text: '惟其是', pinyin: 'wéi qí shì' },
      { text: '勿佞巧', pinyin: 'wù nìng qiǎo' }
    ]
  },

  // 信（二）
  {
    id: 'dzg-25',
    category: 'dizigui',
    title: '弟子规 · 信（二）',
    phrases: [
      { text: '奸巧语', pinyin: 'jiān qiǎo yǔ' },
      { text: '秽污词', pinyin: 'huì wū cí' },
      { text: '市井气', pinyin: 'shì jǐng qì' },
      { text: '切戒之', pinyin: 'qiè jiè zhī' },
      { text: '见未真', pinyin: 'jiàn wèi zhēn' },
      { text: '勿轻言', pinyin: 'wù qīng yán' },
      { text: '知未的', pinyin: 'zhī wèi dì' },
      { text: '勿轻传', pinyin: 'wù qīng chuán' }
    ]
  },

  // 信（三）
  {
    id: 'dzg-26',
    category: 'dizigui',
    title: '弟子规 · 信（三）',
    phrases: [
      { text: '事非宜', pinyin: 'shì fēi yí' },
      { text: '勿轻诺', pinyin: 'wù qīng nuò' },
      { text: '苟轻诺', pinyin: 'gǒu qīng nuò' },
      { text: '进退错', pinyin: 'jìn tuì cuò' },
      { text: '凡道字', pinyin: 'fán dào zì' },
      { text: '重且舒', pinyin: 'zhòng qiě shū' },
      { text: '勿急疾', pinyin: 'wù jí jí' },
      { text: '勿模糊', pinyin: 'wù mó hú' }
    ]
  },

  // 信（四）
  {
    id: 'dzg-27',
    category: 'dizigui',
    title: '弟子规 · 信（四）',
    phrases: [
      { text: '彼说长', pinyin: 'bǐ shuō cháng' },
      { text: '此说短', pinyin: 'cǐ shuō duǎn' },
      { text: '不关己', pinyin: 'bù guān jǐ' },
      { text: '莫闲管', pinyin: 'mò xián guǎn' },
      { text: '见人善', pinyin: 'jiàn rén shàn' },
      { text: '即思齐', pinyin: 'jí sī qí' },
      { text: '纵去远', pinyin: 'zòng qù yuǎn' },
      { text: '以渐跻', pinyin: 'yǐ jiàn jī' }
    ]
  },

  // 信（五）
  {
    id: 'dzg-28',
    category: 'dizigui',
    title: '弟子规 · 信（五）',
    phrases: [
      { text: '见人恶', pinyin: 'jiàn rén è' },
      { text: '即内省', pinyin: 'jí nèi xǐng' },
      { text: '有则改', pinyin: 'yǒu zé gǎi' },
      { text: '无加警', pinyin: 'wú jiā jǐng' },
      { text: '唯德学', pinyin: 'wéi dé xué' },
      { text: '唯才艺', pinyin: 'wéi cái yì' },
      { text: '不如人', pinyin: 'bù rú rén' },
      { text: '当自砺', pinyin: 'dāng zì lì' }
    ]
  },

  // 信（六）
  {
    id: 'dzg-29',
    category: 'dizigui',
    title: '弟子规 · 信（六）',
    phrases: [
      { text: '若衣服', pinyin: 'ruò yī fú' },
      { text: '若饮食', pinyin: 'ruò yǐn shí' },
      { text: '不如人', pinyin: 'bù rú rén' },
      { text: '勿生戚', pinyin: 'wù shēng qī' },
      { text: '闻过怒', pinyin: 'wén guò nù' },
      { text: '闻誉乐', pinyin: 'wén yù lè' },
      { text: '损友来', pinyin: 'sǔn yǒu lái' },
      { text: '益友却', pinyin: 'yì yǒu què' }
    ]
  },

  // 信（七）
  {
    id: 'dzg-30',
    category: 'dizigui',
    title: '弟子规 · 信（七）',
    phrases: [
      { text: '闻誉恐', pinyin: 'wén yù kǒng' },
      { text: '闻过欣', pinyin: 'wén guò xīn' },
      { text: '直谅士', pinyin: 'zhí liàng shì' },
      { text: '渐相亲', pinyin: 'jiàn xiāng qīn' },
      { text: '无心非', pinyin: 'wú xīn fēi' },
      { text: '名为错', pinyin: 'míng wéi cuò' },
      { text: '有心非', pinyin: 'yǒu xīn fēi' },
      { text: '名为恶', pinyin: 'míng wéi è' }
    ]
  },

  // 信（八）
  {
    id: 'dzg-31',
    category: 'dizigui',
    title: '弟子规 · 信（八）',
    phrases: [
      { text: '过能改', pinyin: 'guò néng gǎi' },
      { text: '归于无', pinyin: 'guī yú wú' },
      { text: '倘掩饰', pinyin: 'tǎng yǎn shì' },
      { text: '增一辜', pinyin: 'zēng yī gū' }
    ]
  },

  // 泛爱众（一）
  {
    id: 'dzg-32',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（一）',
    phrases: [
      { text: '凡是人', pinyin: 'fán shì rén' },
      { text: '皆须爱', pinyin: 'jiē xū ài' },
      { text: '天同覆', pinyin: 'tiān tóng fù' },
      { text: '地同载', pinyin: 'dì tóng zài' },
      { text: '行高者', pinyin: 'xíng gāo zhě' },
      { text: '名自高', pinyin: 'míng zì gāo' },
      { text: '人所重', pinyin: 'rén suǒ zhòng' },
      { text: '非貌高', pinyin: 'fēi mào gāo' }
    ]
  },

  // 泛爱众（二）
  {
    id: 'dzg-33',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（二）',
    phrases: [
      { text: '才大者', pinyin: 'cái dà zhě' },
      { text: '望自大', pinyin: 'wàng zì dà' },
      { text: '人所服', pinyin: 'rén suǒ fú' },
      { text: '非言大', pinyin: 'fēi yán dà' },
      { text: '己有能', pinyin: 'jǐ yǒu néng' },
      { text: '勿自私', pinyin: 'wù zì sī' },
      { text: '人所能', pinyin: 'rén suǒ néng' },
      { text: '勿轻訾', pinyin: 'wù qīng zī' }
    ]
  },

  // 泛爱众（三）
  {
    id: 'dzg-34',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（三）',
    phrases: [
      { text: '勿谄富', pinyin: 'wù chǎn fù' },
      { text: '勿骄贫', pinyin: 'wù jiāo pín' },
      { text: '勿厌故', pinyin: 'wù yàn gù' },
      { text: '勿喜新', pinyin: 'wù xǐ xīn' },
      { text: '人不闲', pinyin: 'rén bù xián' },
      { text: '勿事搅', pinyin: 'wù shì jiǎo' },
      { text: '人不安', pinyin: 'rén bù ān' },
      { text: '勿话扰', pinyin: 'wù huà rǎo' }
    ]
  },

  // 泛爱众（四）
  {
    id: 'dzg-35',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（四）',
    phrases: [
      { text: '人有短', pinyin: 'rén yǒu duǎn' },
      { text: '切莫揭', pinyin: 'qiè mò jiē' },
      { text: '人有私', pinyin: 'rén yǒu sī' },
      { text: '切莫说', pinyin: 'qiè mò shuō' },
      { text: '道人善', pinyin: 'dào rén shàn' },
      { text: '即是善', pinyin: 'jí shì shàn' },
      { text: '人知之', pinyin: 'rén zhī zhī' },
      { text: '愈思勉', pinyin: 'yù sī miǎn' }
    ]
  },

  // 泛爱众（五）
  {
    id: 'dzg-36',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（五）',
    phrases: [
      { text: '扬人恶', pinyin: 'yáng rén è' },
      { text: '即是恶', pinyin: 'jí shì è' },
      { text: '疾之甚', pinyin: 'jí zhī shèn' },
      { text: '祸且作', pinyin: 'huò qiě zuò' },
      { text: '善相劝', pinyin: 'shàn xiāng quàn' },
      { text: '德皆建', pinyin: 'dé jiē jiàn' },
      { text: '过不规', pinyin: 'guò bù guī' },
      { text: '道两亏', pinyin: 'dào liǎng kuī' }
    ]
  },

  // 泛爱众（六）
  {
    id: 'dzg-37',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（六）',
    phrases: [
      { text: '凡取与', pinyin: 'fán qǔ yǔ' },
      { text: '贵分晓', pinyin: 'guì fēn xiǎo' },
      { text: '与宜多', pinyin: 'yǔ yí duō' },
      { text: '取宜少', pinyin: 'qǔ yí shǎo' },
      { text: '将加人', pinyin: 'jiāng jiā rén' },
      { text: '先问己', pinyin: 'xiān wèn jǐ' },
      { text: '己不欲', pinyin: 'jǐ bù yù' },
      { text: '即速已', pinyin: 'jí sù yǐ' }
    ]
  },

  // 泛爱众（七）
  {
    id: 'dzg-38',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（七）',
    phrases: [
      { text: '恩欲报', pinyin: 'ēn yù bào' },
      { text: '怨欲忘', pinyin: 'yuàn yù wàng' },
      { text: '报怨短', pinyin: 'bào yuàn duǎn' },
      { text: '报恩长', pinyin: 'bào ēn cháng' },
      { text: '待婢仆', pinyin: 'dài bì pú' },
      { text: '身贵端', pinyin: 'shēn guì duān' },
      { text: '虽贵端', pinyin: 'suī guì duān' },
      { text: '慈而宽', pinyin: 'cí ér kuān' }
    ]
  },

  // 泛爱众（八）
  {
    id: 'dzg-39',
    category: 'dizigui',
    title: '弟子规 · 泛爱众（八）',
    phrases: [
      { text: '势服人', pinyin: 'shì fú rén' },
      { text: '心不然', pinyin: 'xīn bù rán' },
      { text: '理服人', pinyin: 'lǐ fú rén' },
      { text: '方无言', pinyin: 'fāng wú yán' }
    ]
  },

  // 亲仁
  {
    id: 'dzg-40',
    category: 'dizigui',
    title: '弟子规 · 亲仁',
    phrases: [
      { text: '同是人', pinyin: 'tóng shì rén' },
      { text: '类不齐', pinyin: 'lèi bù qí' },
      { text: '流俗众', pinyin: 'liú sú zhòng' },
      { text: '仁者希', pinyin: 'rén zhě xī' },
      { text: '果仁者', pinyin: 'guǒ rén zhě' },
      { text: '人多畏', pinyin: 'rén duō wèi' },
      { text: '言不讳', pinyin: 'yán bù huì' },
      { text: '色不媚', pinyin: 'sè bù mèi' },
      { text: '能亲仁', pinyin: 'néng qīn rén' },
      { text: '无限好', pinyin: 'wú xiàn hǎo' },
      { text: '德日进', pinyin: 'dé rì jìn' },
      { text: '过日少', pinyin: 'guò rì shǎo' },
      { text: '不亲仁', pinyin: 'bù qīn rén' },
      { text: '无限害', pinyin: 'wú xiàn hài' },
      { text: '小人进', pinyin: 'xiǎo rén jìn' },
      { text: '百事坏', pinyin: 'bǎi shì huài' }
    ]
  },

  // 余力学文（一）
  {
    id: 'dzg-41',
    category: 'dizigui',
    title: '弟子规 · 余力学文（一）',
    phrases: [
      { text: '不力行', pinyin: 'bù lì xíng' },
      { text: '但学文', pinyin: 'dàn xué wén' },
      { text: '长浮华', pinyin: 'zhǎng fú huá' },
      { text: '成何人', pinyin: 'chéng hé rén' },
      { text: '但力行', pinyin: 'dàn lì xíng' },
      { text: '不学文', pinyin: 'bù xué wén' },
      { text: '任己见', pinyin: 'rèn jǐ jiàn' },
      { text: '昧理真', pinyin: 'mèi lǐ zhēn' }
    ]
  },

  // 余力学文（二）
  {
    id: 'dzg-42',
    category: 'dizigui',
    title: '弟子规 · 余力学文（二）',
    phrases: [
      { text: '读书法', pinyin: 'dú shū fǎ' },
      { text: '有三到', pinyin: 'yǒu sān dào' },
      { text: '心眼口', pinyin: 'xīn yǎn kǒu' },
      { text: '信皆要', pinyin: 'xìn jiē yào' },
      { text: '方读此', pinyin: 'fāng dú cǐ' },
      { text: '勿慕彼', pinyin: 'wù mù bǐ' },
      { text: '此未终', pinyin: 'cǐ wèi zhōng' },
      { text: '彼勿起', pinyin: 'bǐ wù qǐ' }
    ]
  },

  // 余力学文（三）
  {
    id: 'dzg-43',
    category: 'dizigui',
    title: '弟子规 · 余力学文（三）',
    phrases: [
      { text: '宽为限', pinyin: 'kuān wéi xiàn' },
      { text: '紧用功', pinyin: 'jǐn yòng gōng' },
      { text: '工夫到', pinyin: 'gōng fū dào' },
      { text: '滞塞通', pinyin: 'zhì sè tōng' },
      { text: '心有疑', pinyin: 'xīn yǒu yí' },
      { text: '随札记', pinyin: 'suí zhá jì' },
      { text: '就人问', pinyin: 'jiù rén wèn' },
      { text: '求确义', pinyin: 'qiú què yì' }
    ]
  },

  // 余力学文（四）
  {
    id: 'dzg-44',
    category: 'dizigui',
    title: '弟子规 · 余力学文（四）',
    phrases: [
      { text: '房室清', pinyin: 'fáng shì qīng' },
      { text: '墙壁净', pinyin: 'qiáng bì jìng' },
      { text: '几案洁', pinyin: 'jī àn jié' },
      { text: '笔砚正', pinyin: 'bǐ yàn zhèng' },
      { text: '墨磨偏', pinyin: 'mò mó piān' },
      { text: '心不端', pinyin: 'xīn bù duān' },
      { text: '字不敬', pinyin: 'zì bù jìng' },
      { text: '心先病', pinyin: 'xīn xiān bìng' }
    ]
  },

  // 余力学文（五）
  {
    id: 'dzg-45',
    category: 'dizigui',
    title: '弟子规 · 余力学文（五）',
    phrases: [
      { text: '列典籍', pinyin: 'liè diǎn jí' },
      { text: '有定处', pinyin: 'yǒu dìng chù' },
      { text: '读看毕', pinyin: 'dú kàn bì' },
      { text: '还原处', pinyin: 'huán yuán chù' },
      { text: '虽有急', pinyin: 'suī yǒu jí' },
      { text: '卷束齐', pinyin: 'juàn shù qí' },
      { text: '有缺坏', pinyin: 'yǒu quē huài' },
      { text: '就补之', pinyin: 'jiù bǔ zhī' }
    ]
  },

  // 余力学文（六）
  {
    id: 'dzg-46',
    category: 'dizigui',
    title: '弟子规 · 余力学文（六）',
    phrases: [
      { text: '非圣书', pinyin: 'fēi shèng shū' },
      { text: '屏勿视', pinyin: 'bǐng wù shì' },
      { text: '蔽聪明', pinyin: 'bì cōng míng' },
      { text: '坏心志', pinyin: 'huài xīn zhì' },
      { text: '勿自暴', pinyin: 'wù zì bào' },
      { text: '勿自弃', pinyin: 'wù zì qì' },
      { text: '圣与贤', pinyin: 'shèng yǔ xián' },
      { text: '可驯致', pinyin: 'kě xùn zhì' }
    ]
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
