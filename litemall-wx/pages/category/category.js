var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    limit: 10,
    catagoryId: ''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.id) {
      that.setData({
        id: parseInt(options.id)
      });
    }

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });


    this.getCategoryInfo();
    this.getDDMCatagoryId();


  },

  getDDMCatagoryId: function () {
    var dic = {
      "1036008": "3",
      "1036009": "4",
      "1036010": "6",
      "1036011": "5",
      "1036012": "2",
      "1036013": "7",
      "1036014": "11",
      "1036015": "10",
      "1036016": "9",
      "1036017": "8"
    };
    var catagoryId = dic[this.data.id];
    console.log('123' + catagoryId);
    this.setData({
      catagoryId: catagoryId
    });
  },

  getCategoryInfo: function () {
    let that = this;
    util.request(api.GoodsCategory, {
      id: this.data.id
    })
      .then(function (res) {

        if (res.errno == 0) {
          that.setData({
            navList: res.data.brotherCategory,
            currentCategory: res.data.currentCategory
          });

          wx.setNavigationBarTitle({
            title: res.data.parentCategory.name
          })

          // 当id是L1分类id时，这里需要重新设置成L1分类的一个子分类的id
          if (res.data.parentCategory.id == that.data.id) {
            that.setData({
              id: res.data.currentCategory.id
            });
          }

          //nav位置
          let currentIndex = 0;
          let navListCount = that.data.navList.length;
          for (let i = 0; i < navListCount; i++) {
            currentIndex += 1;
            if (that.data.navList[i].id == that.data.id) {
              break;
            }
          }
          if (currentIndex > navListCount / 2 && navListCount > 5) {
            that.setData({
              scrollLeft: currentIndex * 60
            });
          }
          // that.getGoodsList();
          that.loadFirstPage();

        } else {
          //显示错误信息
        }

      });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onPullDownRefresh() {
    this.loadFirstPage();
  },

  getGoodsList: function () {
    var that = this;

    util.request(api.GoodsList, {
      categoryId: that.data.id,
      page: that.data.page,
      limit: that.data.limit
    }).then(function (res) {
      that.setData({
        goodsList: res.data.list,
      });
    });
  },

  getDdmGoodsList: function () {
    var that = this;

    util.request('http://m2.ddm-home.com/List/GetApiProductList', {
      allimg: false,
      navigatId: this.data.catagoryId,
      page: that.data.page,
      pageSize: 10,
      sort: 'time-desc'
    }, 'POST').then(function (res) {
      that.setData({
        goodsList: that.data.goodsList.concat(res.msg.Products)
      });
    });
  },

  configProductName: function (products) {
    for (var i = 0; i < products.length; i++) {
      products[i].Name = products[i].Name.substring(15, products[i].Name.length);
      console.log(products[i].Name)
    }
  },

  processItemPrice: function (products) {
    for (var i = 0; i < products.length; i++) {
      var newPrice = products[i].Price * 1.20;
      products[i].Price = parseInt(newPrice);
    }
  },

  loadFirstPage: function () {
    var that = this;
    that.setData({
      page: 1,
      goodsList: []
    });
    wx.showLoading({
      title: '正在加载中...'
    });
    util.request('http://m2.ddm-home.com/List/GetApiProductList', {
      allimg: false,
      navigatId: this.data.catagoryId,
      page: that.data.page,
      pageSize: 10,
      sort: 'time-desc'
    }, 'POST').then(function (res) {
      wx.hideLoading();
      that.configProductName(res.msg.Products);
      that.processItemPrice(res.msg.Products);
      that.setData({
        goodsList: that.data.goodsList.concat(res.msg.Products)
      });
    });
  },

  loadNextPage: function () {
    var that = this;
    that.setData({
      page: this.data.page + 1
    });
    wx.showLoading({
      title: '正在加载中...'
    });
    util.request('http://m2.ddm-home.com/List/GetApiProductList', {
      allimg: false,
      navigatId: this.data.catagoryId,
      page: that.data.page,
      pageSize: 10,
      sort: 'time-desc'
    }, 'POST').then(function (res) {
      wx.hideLoading();
      that.configProductName(res.msg.Products);
      that.processItemPrice(res.msg.Products);
      that.setData({
        goodsList: that.data.goodsList.concat(res.msg.Products)
      });
    });
  },

  onUnload: function () {
    // 页面关闭
  },

  onReachBottom: function () {
    this.loadNextPage();
  },

  switchCate: function (event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getCategoryInfo();
  }
})