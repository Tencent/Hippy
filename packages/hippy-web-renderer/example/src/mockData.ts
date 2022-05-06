export const SocialMockData = {
  net: {
    '/gallery/getsubtype': function (param) {
      const [path, isTrpc, urlParams, requestData] = param;
      if (requestData.type === 1) {
        return {
          error_msg: '',
          data: {
            labelItems: [
              {
                name: '表情包',
                id: 1,
              },
              {
                name: '头像',
                id: 2,
              },
              {
                name: '壁纸',
                id: 3,
              },
              {
                name: '不差图',
                id: 4,
              },
            ],
          },
          status: 0,
        };
      }
      return {
        error_msg: '',
        data: {
          labelItems: [
            {
              name: '英雄原画',
              id: 1,
            },
            {
              name: '皮肤原画',
              id: 2,
            },
            {
              name: '壁纸',
              id: 7,
            },
            {
              name: '动态壁纸',
              id: 4,
            },
            {
              name: '王者世界',
              id: 3,
            },
            {
              name: '未完待续',
              id: 5,
            },
          ],
        },
        status: 0,
      };
    },
    '/gallery/getgallerylist': function (param) {
      const [path, isTrpc, urlParams, requestData] = param;
      if (requestData.type === 1) {
        return {
          error_msg: '',
          data: {
            galleryItems: [
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/F7455F45442F27F55DAFF3DD19500A99.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/F7455F45442F27F55DAFF3DD19500A99.png',
                        height: 606,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '17033965116201773951',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'https://ttwzavatar.kohsocialapp.qq.com/532707564/4a0cef270cdf536fc4144ffa6a73f9aad/76',
                  userName: '营地同人酱',
                  momentId: '129659773',
                  userId: '532707564',
                  likeNum: 3086,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1000,
                  picSize: 0,
                  url:
                    'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/F7455F45442F27F55DAFF3DD19500A99.png',
                  height: 606,
                },
                firstPicRatio: 0.606,
                isSingle: true,
                isLong: false,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/ed14a208b2d1fff3f28feebf221675c1/750',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1920,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/ed14a208b2d1fff3f28feebf221675c1/750',
                        height: 1357,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '18242279814519959219',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'http://p.qlogo.cn/yoyo_avatar/366954250/866afa610b59acb55bbf876ea7025bb7c/76',
                  userName: '王者荣耀同人局',
                  momentId: '130055048',
                  userId: '366954250',
                  likeNum: 1722,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1920,
                  picSize: 0,
                  url:
                    'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/ed14a208b2d1fff3f28feebf221675c1/750',
                  height: 1357,
                },
                firstPicRatio: 0.7067708333333333,
                isSingle: true,
                isLong: false,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/68398B07E246D7A756366532954C2A40.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/68398B07E246D7A756366532954C2A40.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/CC822E6CC5853A725433EA8FC79585F1.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/CC822E6CC5853A725433EA8FC79585F1.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/8D804228947E84DB0C36CDFEDA6A5294.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/8D804228947E84DB0C36CDFEDA6A5294.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/92A5F19515D44E4EE6654F0383A187D6.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/92A5F19515D44E4EE6654F0383A187D6.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/5B7FD781CDB873628019A57791718B37.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/5B7FD781CDB873628019A57791718B37.png',
                        height: 1000,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '9420266136498550440',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'http://p.qlogo.cn/yoyo_avatar/2114212941/6567ccf7ef11f35040f7fc6e166d5681G/76',
                  userName: '是脑洞君啊',
                  momentId: '128730010',
                  userId: '2114212941',
                  likeNum: 5902,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1000,
                  picSize: 0,
                  url:
                    'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/68398B07E246D7A756366532954C2A40.png',
                  height: 1000,
                },
                firstPicRatio: 1,
                isSingle: false,
                isLong: false,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/1A4D2F0D2C5E31EBA4BCA8F836D22E44.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/1A4D2F0D2C5E31EBA4BCA8F836D22E44.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/7366F46D92833EC2B646D04149E5D194.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/7366F46D92833EC2B646D04149E5D194.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/315C85B118DD236774D663888F91A105.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/315C85B118DD236774D663888F91A105.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/0C8A352F9FE7BBA80CAE6877F01C7103.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/0C8A352F9FE7BBA80CAE6877F01C7103.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/94CD0B627E8679B6434E5376A4E38EF8.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/94CD0B627E8679B6434E5376A4E38EF8.png',
                        height: 1000,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '16659485219718100111',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'https://ttwzavatar.kohsocialapp.qq.com/532707564/4a0cef270cdf536fc4144ffa6a73f9aad/76',
                  userName: '营地同人酱',
                  momentId: '130538875',
                  userId: '532707564',
                  likeNum: 2552,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1000,
                  picSize: 0,
                  url:
                    'http://momentcon-1255653016.file.myqcloud.com//532707564/20001/1A4D2F0D2C5E31EBA4BCA8F836D22E44.png',
                  height: 1000,
                },
                firstPicRatio: 1,
                isSingle: false,
                isLong: false,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/1fe15e6fdf21991a63d76a4184563e40/750',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1155,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/1fe15e6fdf21991a63d76a4184563e40/750',
                        height: 2052,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/f2d0aec7d72a151f2f57af025bc564ae/750',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 5287,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/f2d0aec7d72a151f2f57af025bc564ae/0',
                        height: 2692,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/adbd21f6dd3bf64eb597bd3d9b3c1caa/750',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1155,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/adbd21f6dd3bf64eb597bd3d9b3c1caa/0',
                        height: 2052,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '9178248693550344181',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'https://ttwzavatar.kohsocialapp.qq.com/58913832/7b125e00ead503d51fba14021e2a572bG/76',
                  userName: '吃了个吃吃呀',
                  momentId: '130610133',
                  userId: '58913832',
                  likeNum: 3007,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1155,
                  picSize: 0,
                  url:
                    'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/1fe15e6fdf21991a63d76a4184563e40/750',
                  height: 2052,
                },
                firstPicRatio: 1.7766233766233765,
                isSingle: false,
                isLong: true,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/2DE1A093FAE4207F5545726A2E6AC091.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/2DE1A093FAE4207F5545726A2E6AC091.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/93BDDE9E07F5CCE2433CC2963EB65633.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/93BDDE9E07F5CCE2433CC2963EB65633.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/72440140B16A6593237BBB812B323067.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/72440140B16A6593237BBB812B323067.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/4803A46F5A5F4BCDE4B66E5205F2511C.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/4803A46F5A5F4BCDE4B66E5205F2511C.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/9FDDF5342178AB1E32EADDA733086383.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/9FDDF5342178AB1E32EADDA733086383.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/6F16C897B018C13FE7CB255C6B7AB70C.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/6F16C897B018C13FE7CB255C6B7AB70C.png',
                        height: 1000,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '9773685187477199815',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'http://p.qlogo.cn/yoyo_avatar/2114212941/6567ccf7ef11f35040f7fc6e166d5681G/76',
                  userName: '是脑洞君啊',
                  momentId: '128730140',
                  userId: '2114212941',
                  likeNum: 2118,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1000,
                  picSize: 0,
                  url:
                    'http://momentcon-1255653016.file.myqcloud.com//2114212941/20001/2DE1A093FAE4207F5545726A2E6AC091.png',
                  height: 1000,
                },
                firstPicRatio: 1,
                isSingle: false,
                isLong: false,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//487278578/20001/D306011ECC92135F3466F6591CB2BBAB.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//487278578/20001/D306011ECC92135F3466F6591CB2BBAB.png',
                        height: 1000,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//487278578/20001/33C9D8839A2CEA8A40FF7C339A7D7D7E.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1000,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//487278578/20001/33C9D8839A2CEA8A40FF7C339A7D7D7E.png',
                        height: 1000,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '13929787682102617237',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'https://ttwzavatar.kohsocialapp.qq.com/487278578/b640a1685a8b4cc7ec5aba72927a80017/76',
                  userName: 'Cynczl-',
                  momentId: '128266772',
                  userId: '487278578',
                  likeNum: 1138,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1000,
                  picSize: 0,
                  url:
                    'http://momentcon-1255653016.file.myqcloud.com//487278578/20001/D306011ECC92135F3466F6591CB2BBAB.png',
                  height: 1000,
                },
                firstPicRatio: 1,
                isSingle: false,
                isLong: false,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/efc96380b39cca45a4dfc0c7ddd1c1e1/750',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1080,
                        picSize: 0,
                        url:
                          'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/efc96380b39cca45a4dfc0c7ddd1c1e1/750',
                        height: 1920,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '948988925026801365',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'http://p.qlogo.cn/yoyo_avatar/366954250/866afa610b59acb55bbf876ea7025bb7c/76',
                  userName: '王者荣耀同人局',
                  momentId: '131509604',
                  userId: '366954250',
                  likeNum: 1540,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1080,
                  picSize: 0,
                  url:
                    'https://pvppic.kohsocialapp.qq.com/wzzs_pic/0/efc96380b39cca45a4dfc0c7ddd1c1e1/750',
                  height: 1920,
                },
                firstPicRatio: 1.7777777777777777,
                isSingle: true,
                isLong: true,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/3faf6b27ee0ef72a6468e40733b8e163.jpg?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1024,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/3faf6b27ee0ef72a6468e40733b8e163.jpg',
                        height: 1024,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/b7881cf6a4666e53af5e0777d6725366.jpg?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1024,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/b7881cf6a4666e53af5e0777d6725366.jpg',
                        height: 1024,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/d3d4cd919debf03342aa2feed6026b11.jpg?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1024,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/d3d4cd919debf03342aa2feed6026b11.jpg',
                        height: 1024,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/781c764d75459988e227dacb908fd505.jpg?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1024,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/781c764d75459988e227dacb908fd505.jpg',
                        height: 1024,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/e4278329a0d35acca02b991713258059.jpg?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 1024,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/e4278329a0d35acca02b991713258059.jpg',
                        height: 1024,
                      },
                    },
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/6fb73285efd1098e472cd779bad76c21.jpg?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 3507,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/6fb73285efd1098e472cd779bad76c21.jpg',
                        height: 1240,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '5905455260797370372',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'http://p.qlogo.cn/yoyo_avatar/476974082/05a0ceba2e030c07875390f9221215fb8/76',
                  userName: '九邪ice',
                  momentId: '126121462',
                  userId: '476974082',
                  likeNum: 1103,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 1024,
                  picSize: 0,
                  url:
                    'http://momentcon-1255653016.file.myqcloud.com/476974082/20001/3faf6b27ee0ef72a6468e40733b8e163.jpg',
                  height: 1024,
                },
                firstPicRatio: 1,
                isSingle: false,
                isLong: false,
              },
              {
                userSharePicItem: {
                  isFollow: false,
                  isLike: false,
                  picArray: [
                    {
                      thumb: {
                        width: 0,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//1868393840/20001/B063883D1567793E93754A87A7218154.png?imageMogr2/thumbnail/300x/format/jpg',
                        height: 0,
                      },
                      isGif: false,
                      originPic: {
                        width: 2200,
                        picSize: 0,
                        url:
                          'http://momentcon-1255653016.file.myqcloud.com//1868393840/20001/B063883D1567793E93754A87A7218154.png',
                        height: 1237,
                      },
                    },
                  ],
                  tulinParam: {
                    iRecommendedID: 'ebfa9da8-1f5f-4f8a-8c57-48de18003674',
                    iRecommendedAlgID: '100',
                    recType: 'exact',
                    docid: '4157672433012835836',
                    sessionID: '1639033341',
                  },
                  label: 0,
                  avatar:
                    'https://ttwzavatar.kohsocialapp.qq.com/1868393840/1b48377a053987f2115f4ea5705add38S/76',
                  userName: '贰拾柒PX',
                  momentId: '125252004',
                  userId: '1868393840',
                  likeNum: 3501,
                },
                officialPicItem: '',
                type: 1,
                firstPic: {
                  width: 2200,
                  picSize: 0,
                  url:
                    'http://momentcon-1255653016.file.myqcloud.com//1868393840/20001/B063883D1567793E93754A87A7218154.png',
                  height: 1237,
                },
                firstPicRatio: 0.5622727272727273,
                isSingle: true,
                isLong: false,
              },
            ],
            hasNextPage: true,
            eggRate: 70,
          },
          status: 0,
        };
      } else {
        if (requestData.lable === 1) {
          return {
            error_msg: '',
            data: {
              galleryItems: [
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4dcccb1c48820e68f949071c082ca419.jpeg?imageView2/2/w/1440/h/732/q/65',
                          height: 732,
                        },
                        isGif: false,
                        originPic: {
                          width: 8120,
                          picSize: 7102340,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4dcccb1c48820e68f949071c082ca419.jpeg',
                          height: 4133,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '1452',
                    label: 1,
                    title: '金蝉',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 8120,
                    picSize: 7102340,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4dcccb1c48820e68f949071c082ca419.jpeg',
                    height: 4133,
                  },
                  firstPicRatio: 0.5089901477832512,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/c82c12a3951a4712249c68498c160798.jpeg?imageView2/2/w/1440/h/733/q/65',
                          height: 733,
                        },
                        isGif: false,
                        originPic: {
                          width: 8505,
                          picSize: 4281183,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/c82c12a3951a4712249c68498c160798.jpeg',
                          height: 4331,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '1363',
                    label: 1,
                    title: '弈星',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 8505,
                    picSize: 4281183,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/c82c12a3951a4712249c68498c160798.jpeg',
                    height: 4331,
                  },
                  firstPicRatio: 0.5092298647854203,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/c09d965e6c416f07003777025e1889f8.jpeg?imageView2/2/w/1440/h/676/q/65',
                          height: 676,
                        },
                        isGif: false,
                        originPic: {
                          width: 4600,
                          picSize: 1939291,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/c09d965e6c416f07003777025e1889f8.jpeg',
                          height: 2160,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '879',
                    label: 1,
                    title: '云缨',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 4600,
                    picSize: 1939291,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/c09d965e6c416f07003777025e1889f8.jpeg',
                    height: 2160,
                  },
                  firstPicRatio: 0.46956521739130436,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/afb257f77bf5b5a5bc46a1f97eaa8065.jpeg?imageView2/2/w/1440/h/733/q/65',
                          height: 733,
                        },
                        isGif: false,
                        originPic: {
                          width: 8120,
                          picSize: 6031715,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/afb257f77bf5b5a5bc46a1f97eaa8065.jpeg',
                          height: 4135,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '148',
                    label: 1,
                    title: '梦奇',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 8120,
                    picSize: 6031715,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/afb257f77bf5b5a5bc46a1f97eaa8065.jpeg',
                    height: 4135,
                  },
                  firstPicRatio: 0.5092364532019704,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4e22380baed9b51d3d940b1c397f93f0.jpeg?imageView2/2/w/1440/h/733/q/65',
                          height: 733,
                        },
                        isGif: false,
                        originPic: {
                          width: 8120,
                          picSize: 10025097,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4e22380baed9b51d3d940b1c397f93f0.jpeg',
                          height: 4135,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '828',
                    label: 1,
                    title: '艾琳',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 8120,
                    picSize: 10025097,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4e22380baed9b51d3d940b1c397f93f0.jpeg',
                    height: 4135,
                  },
                  firstPicRatio: 0.5092364532019704,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/cbd394d4b7a2c20b184d85ede17d339b.jpeg?imageView2/2/w/1440/h/733/q/65',
                          height: 733,
                        },
                        isGif: false,
                        originPic: {
                          width: 8079,
                          picSize: 3632378,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/cbd394d4b7a2c20b184d85ede17d339b.jpeg',
                          height: 4115,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '674',
                    label: 1,
                    title: '司空震',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 8079,
                    picSize: 3632378,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/cbd394d4b7a2c20b184d85ede17d339b.jpeg',
                    height: 4115,
                  },
                  firstPicRatio: 0.5093452159920783,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/162cff3d6aca9c62e78bafcef2333377.jpeg?imageView2/2/w/1440/h/733/q/65',
                          height: 733,
                        },
                        isGif: false,
                        originPic: {
                          width: 7691,
                          picSize: 4130487,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/162cff3d6aca9c62e78bafcef2333377.jpeg',
                          height: 3917,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '176',
                    label: 1,
                    title: '澜',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 7691,
                    picSize: 4130487,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/162cff3d6aca9c62e78bafcef2333377.jpeg',
                    height: 3917,
                  },
                  firstPicRatio: 0.5092965804186712,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/3d2010a3beeeb13342a0556c478876cb.jpeg?imageView2/2/w/1440/h/811/q/65',
                          height: 811,
                        },
                        isGif: false,
                        originPic: {
                          width: 6126,
                          picSize: 6746664,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/3d2010a3beeeb13342a0556c478876cb.jpeg',
                          height: 3453,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '175',
                    label: 1,
                    title: '夏洛特',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 6126,
                    picSize: 6746664,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/3d2010a3beeeb13342a0556c478876cb.jpeg',
                    height: 3453,
                  },
                  firstPicRatio: 0.5636630754162586,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/3b36481340bf02ee2be8b40e79fe0c0c.jpeg?imageView2/2/w/1440/h/732/q/65',
                          height: 732,
                        },
                        isGif: false,
                        originPic: {
                          width: 8122,
                          picSize: 1678706,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/3b36481340bf02ee2be8b40e79fe0c0c.jpeg',
                          height: 4134,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '174',
                    label: 1,
                    title: '阿古朵',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 8122,
                    picSize: 1678706,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/3b36481340bf02ee2be8b40e79fe0c0c.jpeg',
                    height: 4134,
                  },
                  firstPicRatio: 0.5089879340064024,
                  isSingle: true,
                  isLong: false,
                },
                {
                  userSharePicItem: '',
                  officialPicItem: {
                    picArray: [
                      {
                        thumb: {
                          width: 1440,
                          picSize: 0,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/e79318ca56bf31bc52b5cd6b4e98c4be.jpeg?imageView2/2/w/1440/h/733/q/65',
                          height: 733,
                        },
                        isGif: false,
                        originPic: {
                          width: 8120,
                          picSize: 4183942,
                          url:
                            'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/e79318ca56bf31bc52b5cd6b4e98c4be.jpeg',
                          height: 4134,
                        },
                      },
                    ],
                    egg: '',
                    videoArray: [],
                    isLike: false,
                    secondTitle: '',
                    id: '173',
                    label: 1,
                    title: '蒙恬',
                    type: 0,
                  },
                  type: 0,
                  firstPic: {
                    width: 8120,
                    picSize: 4183942,
                    url:
                      'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/e79318ca56bf31bc52b5cd6b4e98c4be.jpeg',
                    height: 4134,
                  },
                  firstPicRatio: 0.5091133004926108,
                  isSingle: true,
                  isLong: false,
                },
              ],
              hasNextPage: true,
              eggRate: 70,
            },
            status: 0,
          };
        }
        return {
          error_msg: '',
          data: {
            galleryItems: [
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/d30c817f6b57261b15cb2c7f6257bc77.jpeg?imageView2/2/w/1440/h/809/q/65',
                        height: 809,
                      },
                      isGif: false,
                      originPic: {
                        width: 1703,
                        picSize: 273047,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/d30c817f6b57261b15cb2c7f6257bc77.jpeg',
                        height: 957,
                      },
                    },
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/5b24fffa4fcc516505f6c68e209ab769.jpeg?imageView2/2/w/1440/h/810/q/65',
                        height: 810,
                      },
                      isGif: false,
                      originPic: {
                        width: 3840,
                        picSize: 801320,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/5b24fffa4fcc516505f6c68e209ab769.jpeg',
                        height: 2160,
                      },
                    },
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4fbb2282df7a99207fea34e6466abddf.jpeg?imageView2/2/w/1440/h/810/q/65',
                        height: 810,
                      },
                      isGif: false,
                      originPic: {
                        width: 2634,
                        picSize: 709887,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4fbb2282df7a99207fea34e6466abddf.jpeg',
                        height: 1482,
                      },
                    },
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/a325688939bdf7ad2649e1e749b3e6f0.jpeg?imageView2/2/w/1440/h/810/q/65',
                        height: 810,
                      },
                      isGif: false,
                      originPic: {
                        width: 1699,
                        picSize: 310613,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/a325688939bdf7ad2649e1e749b3e6f0.jpeg',
                        height: 956,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '拒霜思',
                  id: '1457',
                  label: 3,
                  title: '嫦娥',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 1703,
                  picSize: 273047,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/d30c817f6b57261b15cb2c7f6257bc77.jpeg',
                  height: 957,
                },
                firstPicRatio: 0.5619495008807985,
                isSingle: false,
                isLong: false,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/eacee7d108a259b5c7c829bf6ef772d2.jpeg?imageView2/2/w/1440/h/733/q/65',
                        height: 733,
                      },
                      isGif: false,
                      originPic: {
                        width: 4000,
                        picSize: 1006379,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/eacee7d108a259b5c7c829bf6ef772d2.jpeg',
                        height: 2037,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '拒霜思',
                  id: '1455',
                  label: 2,
                  title: '嫦娥',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 4000,
                  picSize: 1006379,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/eacee7d108a259b5c7c829bf6ef772d2.jpeg',
                  height: 2037,
                },
                firstPicRatio: 0.50925,
                isSingle: true,
                isLong: false,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [],
                  egg: '',
                  videoArray: [
                    {
                      videoUrl:
                        'https://pvpfile.kohsocialapp.qq.com/5b695d81d235ad4eff0d99118fdaa422.mp4',
                      thumb: {
                        width: 750,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/999f3337824d2c76f8b0f24b1ed13a85.jpeg?imageView2/1/q/65',
                        height: 1624,
                      },
                      originPic: {
                        width: 750,
                        picSize: 217390,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/999f3337824d2c76f8b0f24b1ed13a85.jpeg',
                        height: 1624,
                      },
                    },
                    {
                      videoUrl:
                        'https://pvpfile.kohsocialapp.qq.com/381eaf63efa6c7cf51dc59e83d523848.mp4',
                      thumb: {
                        width: 750,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/0eb12c01323fb6b3366ad12196cc979f.jpeg?imageView2/1/q/65',
                        height: 1624,
                      },
                      originPic: {
                        width: 750,
                        picSize: 139684,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/0eb12c01323fb6b3366ad12196cc979f.jpeg',
                        height: 1624,
                      },
                    },
                  ],
                  isLike: false,
                  secondTitle: '拒霜思',
                  id: '1459',
                  label: 4,
                  title: '嫦娥',
                  type: 1,
                },
                type: 0,
                firstPic: {
                  width: 750,
                  picSize: 217390,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/999f3337824d2c76f8b0f24b1ed13a85.jpeg',
                  height: 1624,
                },
                firstPicRatio: 2.1653333333333333,
                isSingle: true,
                isLong: true,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 750,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/999f3337824d2c76f8b0f24b1ed13a85.jpeg?imageView2/1/q/65',
                        height: 1624,
                      },
                      isGif: false,
                      originPic: {
                        width: 750,
                        picSize: 217390,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/999f3337824d2c76f8b0f24b1ed13a85.jpeg',
                        height: 1624,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '拒霜思',
                  id: '1458',
                  label: 7,
                  title: '嫦娥',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 750,
                  picSize: 217390,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/999f3337824d2c76f8b0f24b1ed13a85.jpeg',
                  height: 1624,
                },
                firstPicRatio: 2.1653333333333333,
                isSingle: true,
                isLong: true,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/9c3add64b463d3c3fc4ab84491e4469a.jpeg?imageView2/2/w/1440/h/733/q/65',
                        height: 733,
                      },
                      isGif: false,
                      originPic: {
                        width: 8120,
                        picSize: 2726025,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/9c3add64b463d3c3fc4ab84491e4469a.jpeg',
                        height: 4134,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '前尘',
                  id: '1453',
                  label: 2,
                  title: '金蝉',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 8120,
                  picSize: 2726025,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/9c3add64b463d3c3fc4ab84491e4469a.jpeg',
                  height: 4134,
                },
                firstPicRatio: 0.5091133004926108,
                isSingle: true,
                isLong: false,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4dcccb1c48820e68f949071c082ca419.jpeg?imageView2/2/w/1440/h/732/q/65',
                        height: 732,
                      },
                      isGif: false,
                      originPic: {
                        width: 8120,
                        picSize: 7102340,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4dcccb1c48820e68f949071c082ca419.jpeg',
                        height: 4133,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '',
                  id: '1452',
                  label: 1,
                  title: '金蝉',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 8120,
                  picSize: 7102340,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/4dcccb1c48820e68f949071c082ca419.jpeg',
                  height: 4133,
                },
                firstPicRatio: 0.5089901477832512,
                isSingle: true,
                isLong: false,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 838,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/f2ac5422e84dca543d831ae87a0a2121.jpeg?imageView2/1/q/65',
                        height: 1406,
                      },
                      isGif: false,
                      originPic: {
                        width: 838,
                        picSize: 320282,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/f2ac5422e84dca543d831ae87a0a2121.jpeg',
                        height: 1406,
                      },
                    },
                    {
                      thumb: {
                        width: 845,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/187365d38f40d45c5347c48510a4ae43.jpeg?imageView2/1/q/65',
                        height: 1404,
                      },
                      isGif: false,
                      originPic: {
                        width: 845,
                        picSize: 289070,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/187365d38f40d45c5347c48510a4ae43.jpeg',
                        height: 1404,
                      },
                    },
                    {
                      thumb: {
                        width: 839,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/59b9bd02cdbea22e7baa286f6bd7b35c.jpeg?imageView2/1/q/65',
                        height: 1406,
                      },
                      isGif: false,
                      originPic: {
                        width: 839,
                        picSize: 272528,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/59b9bd02cdbea22e7baa286f6bd7b35c.jpeg',
                        height: 1406,
                      },
                    },
                    {
                      thumb: {
                        width: 842,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/a2c3f7fd08ace5f483c54b47ccf4485b.jpeg?imageView2/1/q/65',
                        height: 1404,
                      },
                      isGif: false,
                      originPic: {
                        width: 842,
                        picSize: 310572,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/a2c3f7fd08ace5f483c54b47ccf4485b.jpeg',
                        height: 1404,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '拒霜思',
                  id: '1456',
                  label: 7,
                  title: '嫦娥',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 838,
                  picSize: 320282,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/f2ac5422e84dca543d831ae87a0a2121.jpeg',
                  height: 1406,
                },
                firstPicRatio: 1.6778042959427208,
                isSingle: false,
                isLong: true,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 1440,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/95bdc3b231c3be8e8245cd45d21e2784.jpeg?imageView2/2/w/1440/h/2560/q/65',
                        height: 2560,
                      },
                      isGif: false,
                      originPic: {
                        width: 2160,
                        picSize: 945718,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/95bdc3b231c3be8e8245cd45d21e2784.jpeg',
                        height: 3840,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '',
                  id: '1454',
                  label: 7,
                  title: '暃',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 2160,
                  picSize: 945718,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/95bdc3b231c3be8e8245cd45d21e2784.jpeg',
                  height: 3840,
                },
                firstPicRatio: 1.7777777777777777,
                isSingle: true,
                isLong: true,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [
                    {
                      thumb: {
                        width: 750,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/5a32193f50ed348a1833d60e402fc0d9.jpeg?imageView2/1/q/65',
                        height: 1624,
                      },
                      isGif: false,
                      originPic: {
                        width: 750,
                        picSize: 205377,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/5a32193f50ed348a1833d60e402fc0d9.jpeg',
                        height: 1624,
                      },
                    },
                    {
                      thumb: {
                        width: 750,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/ced962d19348872f7bf7446c8270fd4e.jpeg?imageView2/1/q/65',
                        height: 1624,
                      },
                      isGif: false,
                      originPic: {
                        width: 750,
                        picSize: 217028,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/ced962d19348872f7bf7446c8270fd4e.jpeg',
                        height: 1624,
                      },
                    },
                  ],
                  egg: '',
                  videoArray: [],
                  isLike: false,
                  secondTitle: '',
                  id: '1451',
                  label: 7,
                  title: '金蝉',
                  type: 0,
                },
                type: 0,
                firstPic: {
                  width: 750,
                  picSize: 205377,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/5a32193f50ed348a1833d60e402fc0d9.jpeg',
                  height: 1624,
                },
                firstPicRatio: 2.1653333333333333,
                isSingle: false,
                isLong: true,
              },
              {
                userSharePicItem: '',
                officialPicItem: {
                  picArray: [],
                  egg: '',
                  videoArray: [
                    {
                      videoUrl:
                        'https://pvpfile.kohsocialapp.qq.com/5b2f659856fd06606d2b9d817bff4369.mp4',
                      thumb: {
                        width: 750,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/ced962d19348872f7bf7446c8270fd4e.jpeg?imageView2/1/q/65',
                        height: 1624,
                      },
                      originPic: {
                        width: 750,
                        picSize: 217028,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/ced962d19348872f7bf7446c8270fd4e.jpeg',
                        height: 1624,
                      },
                    },
                    {
                      videoUrl:
                        'https://pvpfile.kohsocialapp.qq.com/02c1c41c36d03ff07fd3a00ec5a14f2f.mp4',
                      thumb: {
                        width: 750,
                        picSize: 0,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/5a32193f50ed348a1833d60e402fc0d9.jpeg?imageView2/1/q/65',
                        height: 1624,
                      },
                      originPic: {
                        width: 750,
                        picSize: 205377,
                        url:
                          'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/5a32193f50ed348a1833d60e402fc0d9.jpeg',
                        height: 1624,
                      },
                    },
                  ],
                  isLike: false,
                  secondTitle: '',
                  id: '1450',
                  label: 4,
                  title: '金蝉',
                  type: 1,
                },
                type: 0,
                firstPic: {
                  width: 750,
                  picSize: 217028,
                  url:
                    'https://wzzsmanager-1255653016.file.myqcloud.com/common-image/ced962d19348872f7bf7446c8270fd4e.jpeg',
                  height: 1624,
                },
                firstPicRatio: 2.1653333333333333,
                isSingle: true,
                isLong: true,
              },
            ],
            hasNextPage: true,
            eggRate: 70,
          },
          status: 0,
        };
      }
    },
  },
};
