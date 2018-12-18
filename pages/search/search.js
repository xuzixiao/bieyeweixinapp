// pages/search/search.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowpage:1,
    searchdate:"选择日期",
    searchcity:"选择地区",
    searchpx:"推荐排序",
    searchdata: {
      UserID: "",
      PageIndex: 1,
      PartitionID: "",
      StartTime: "",
      EndTime: "",
      Customer: ""
    },
    nothave:false,
    loadHidden: true,//控制UI 显示继续加载还是已加载全部
    loadmore: true,//判断是否有数据继续加载
    villalist: [],
    getvillatype: 1
  },//getvillatype:1追加，2覆盖
  //选择地址
  address: function () {
    app.globalData.prevpath = this.route;
    wx.redirectTo({
      url: '../address/address'
    })
  },
  //选择日期
  choosedate: function () {
    app.globalData.prevpath = this.route;
    wx.redirectTo({
      url: '../chosedate/chosedate'
    })
  },
  //列表排序方式
  sort: function () {
    wx.navigateTo({
      url: '../sort/sort'
    })
  },
  //筛选
  select: function () {
    wx.navigateTo({
      url: '../select/select'
    })
  },
  //过滤没有数据的数据，返回有数据的对象数据
  OrganReqData: function () {
    let reqdata = this.data.searchdata;
    let newReqdata = {};
    for (let item in reqdata) {
      if (reqdata[item] != undefined && reqdata[item] != "") {
        newReqdata[item] = reqdata[item];
      }
    }
    return newReqdata;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const globaldata = app.globalData;
    if (typeof(globaldata.partitionid)!= "undefined") {
      this.setData({
        'searchdata.PartitionID': globaldata.partitionid
      })
    }
    if (typeof (globaldata.chosedate) != "undefined" && JSON.stringify(globaldata.chosedate) != "{}") {
      this.setData({
        'searchdata.StartTime': globaldata.chosedate.startdate,
        'searchdata.EndTime': globaldata.chosedate.enddate
      })
    }
    var that = this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Villa',
      data: this.data.searchdata,
      method: "Get",
      success: function (res) {
        if(res.data.length==0){
          that.setData({
            nothave: true
          })
          return;  
        }

        let resdata = that.changeimgsrc(res.data);
        that.setData({
          villalist: resdata
        })
      }
    })
  },
  changeimgsrc: function (data) {
    for (let i = 0; i < data.length; i++) {
      let zipLogo = app.ImgPathChange(data[i].Logo, 3);
      data[i].zipLogo = zipLogo;
    }
    return data;
  },
  getvillalist: function () {
    var that = this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Villa',
      data: that.data.searchdata,
      method: "Get",
      success: function (res) {
        let resdata = that.changeimgsrc(res.data);
        wx.hideLoading();
        if (that.data.getvillatype == 2) {
          that.setData({
            villalist: resdata
          })
          //当加载不足于5条。
          if (resdata.length < 5) {
            that.setData({
              loadmore: false,
              loadHidden: false,
            })
            return;
          }
        } else if (that.data.getvillatype == 1) {//concat（）追加
          that.setData({
            villalist: that.data.villalist.concat(resdata)
          })
          if (resdata.length < 5) {
            that.setData({
              loadmore: false,
              loadHidden: false,
            })
            return;
          }
        }
      }
    })




  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

   

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //日期回填搜索
    if (app.globalData.chosedate != undefined && JSON.stringify(app.globalData.chosedate) != "{}"){
      let startdate = app.globalData.chosedate.startdate.split("-");
      let enddate = app.globalData.chosedate.enddate.split("-");
      startdate = startdate[1] + '/' + startdate[2];
      enddate = enddate[1] + '/' + enddate[2];
      let rzdate = startdate + "-" + enddate;
      this.setData({
        searchdate: rzdate,
        'searchdata.StartTime': app.globalData.chosedate.startdate,
        'searchdata.EndTime': app.globalData.chosedate.enddate
      })
    }
    //地区回填搜索
    if (app.globalData.city != undefined && app.globalData.partitionid != undefined){

      if (app.globalData.city == "" && app.globalData.partitionid==""){
        this.setData({
          searchcity: "不限",
          'searchdata.PartitionID': app.globalData.partitionid
        })
        return;
      }
      this.setData({
        searchcity: app.globalData.city,
        'searchdata.PartitionID': app.globalData.partitionid
      })
    }
    if (app.globalData.sort != undefined) {
      this.setData({
        searchpx: app.globalData.sort
      })
    }
    this.setData({
      getvillatype: 2,
      'searchdata.PageIndex':1,
      nowpage: 1,
    })//每次更新搜索条件时

    this.getvillalist();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadmore) {
      wx.showLoading({
        title: '加载中',
      })
      this.setData({
        getvillatype: 1,//追加
      })
      var nextpage = this.data.searchdata.PageIndex + 1;
      setTimeout(() => {
        this.setData({
          'searchdata.PageIndex': nextpage
        })
        this.getvillalist();
      }, 1000)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})