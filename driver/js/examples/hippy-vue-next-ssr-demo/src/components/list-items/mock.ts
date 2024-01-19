const MOCK_IMG =  'https://user-images.githubusercontent.com/12878546/148736841-59ce5d1c-8010-46dc-8632-01c380159237.jpg';
const MOCK_IMG2 =  'https://user-images.githubusercontent.com/12878546/148736850-4fc13304-25d4-4b6a-ada3-cbf0745666f5.jpg';
const MOCK_COVER =  'https://user-images.githubusercontent.com/12878546/148736859-29e3a5b2-612a-4fdd-ad21-dc5d29fa538f.jpg';

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

// mock data
const MOCK_DATA = [
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

export default MOCK_DATA;
