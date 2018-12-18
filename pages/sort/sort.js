// pages/sort/sort.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checktypeid:1,
    sorttype:[
      {
        "typeid":1,
        "typetext":"推荐排序"
      },
      {
        "typeid": 2,
        "typetext": "好评优先"
      },
      {
        "typeid": 3,
        "typetext": "价格从低到高"
      },
      {
        "typeid": 4,
        "typetext": "价格从高到低"
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  sorttype:function(e){
    let sorttypeid=e.currentTarget.dataset.sorttypeid;
    let sortname = e.currentTarget.dataset.sortname;
    this.setData({
      checktypeid: sorttypeid
    })
    app.globalData.sort = sortname;
    setTimeout(function(){
      wx.navigateBack();
      // wx.redirectTo({
      //   url: '../../pages/search/search',
      // })
    },200)
    
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})