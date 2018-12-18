// pages/address/address.js
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    MainCity:[],
    choosecity:""
  },
  ready:function(){
    var that=this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Values',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          MainCity: res.data
        })
        console.log(that.data.MainCity);
      }
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    submitcity:function(event){
      console.log(event);
      let city=event.currentTarget.dataset.city;
      let partitionid = event.currentTarget.dataset.partitionid;
      app.globalData.city = city;
      app.globalData.partitionid = partitionid;


      console.log(app.globalData.prevpath);

      if (app.globalData.prevpath == undefined || app.globalData.prevpath == "") {
        wx.switchTab({
          url: '../index/index',
        })
      } else {
        wx.redirectTo({
          url: "/" + app.globalData.prevpath
        })
      }
    }
  }
})
