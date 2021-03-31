const MOCK_IMG = 'http://res.imtt.qq.com/tps/expo-listview-1.jpg';
const MOCK_IMG2 = 'http://res.imtt.qq.com/tps/expo-listview-2.jpg';
const MOCK_COVER = 'http://res.imtt.qq.com/tps/expo-listview-3.jpg';

const STYLE_1 = {
  style: 1,
  itemBean: {
    title: '非洲总统出行真大牌，美制武装直升机和中国潜艇为其保驾',
    picList: [MOCK_IMG, MOCK_IMG, MOCK_IMG],
    subInfo: ['三图评论', '11评'],
  },
};
const STYLE_2 = {
  style: 2,
  itemBean: {
    title: '彼得·泰尔：认知未来是投资人的谋生之道',
    picUrl: MOCK_IMG2,
    subInfo: ['左文右图'],
  },
};
const STYLE_5 = {
  style: 5,
  itemBean: {
    title: '愤怒！美官员扬言：“不让中国拿走南海的岛屿，南海岛礁不属于中国”？',
    picUrl: MOCK_COVER,
    subInfo: ['六眼神魔  5234播放'],
  },
};
const mockData = [
  STYLE_5,
  STYLE_1,
  STYLE_2,
  STYLE_1,
  STYLE_2,
  STYLE_1,
  STYLE_2,
  STYLE_5,
  STYLE_1,
];

export default mockData;
