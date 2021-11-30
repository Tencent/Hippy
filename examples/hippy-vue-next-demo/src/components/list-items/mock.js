const MOCK_IMG = 'http://cdn.read.html5.qq.com/image?imageUrl=http%3A%2F%2Finews%2Egtimg%2Ecom%2Fnewsapp%5Fmatch%2F0%2F3377717982%2F0&src=read&t=0&w=1080&h=720&q=6&rspimgflag=0&imgflag=15&filesize=45829&referUrl=http%3A%2F%2Fkuaibao%2Eqq%2Ecom%2Fs%2F20180504A0KP3600';
const MOCK_IMG2 = 'https://cdn.read.html5.qq.com/image?src=feeds&subsrc=circle&q=5&r=0&imgflag=13&cdn_cache=24&w=120&h=120&imageUrl=http%3A%2F%2Finews%2Egtimg%2Ecom%2Fnewsapp%5Fls%2F0%2F2813667713%5F200200%2F0';
const MOCK_COVER = 'http://cdn.read.html5.qq.com/image?src=video_hot&q=5&h=693&w=1125&r=0&imageUrl=https%3A%2F%2Fvpic.video.qq.com%2F86124154%2Ff05265k1iyt.png';

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
const mockData = [STYLE_5, STYLE_1, STYLE_2, STYLE_1, STYLE_2, STYLE_1, STYLE_2, STYLE_5, STYLE_1];

export default mockData;
