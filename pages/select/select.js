// pages/select/select.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkdate:{
      homenum:"",
      hometype:"",
    },
    homenum:[
      {
        id:1,
        typename:"一居"
      }, {
        id: 2,
        typename: "二居"
      }, {
        id: 3,
        typename: "三居"
      },{
        id:4,
        typename:"四居及以上"
      }
    ],
    hometype:[
      {
        id:1,
        typename:"民宿",
      }, {
        id: 2,
        typename: "别墅",
      }
    ],
    peopleinfor:{
      peoplenum: "不限",
      peopledesc:"不限"
    }
  },
/*
人数选择
 */
  sub:function(){
    if (this.data.peopleinfor.peoplenum == "不限" || this.data.peopleinfor.peoplenum == 1){
      return;
    }else{
      this.setData({
        'peopleinfor.peopledesc': this.data.peopleinfor.peoplenum-1+"人",
        'peopleinfor.peoplenum': this.data.peopleinfor.peoplenum - 1,
      })
    }
  },
  add:function(){
    if (this.data.peopleinfor.peoplenum == "不限") {
      this.setData({
        'peopleinfor.peopledesc': "1人",
        'peopleinfor.peoplenum': 1,
      })
    }else{
      this.setData({
        'peopleinfor.peopledesc': this.data.peopleinfor.peoplenum + 1+"人",
        'peopleinfor.peoplenum': this.data.peopleinfor.peoplenum + 1,
      })
    }

  },
  gosearch:function(){
    wx.navigateBack()
  },
//户型选择
  checkhomenum:function(e){
    let checknum = e.currentTarget.dataset.homenum;
    this.setData({
      'checkdate.homenum': checknum
    })
  },
  //房型选择
  checkhometype: function (e) {
    let checknum = e.currentTarget.dataset.hometype;
    this.setData({
      'checkdate.hometype': checknum
    })
  },
  //清空选择
  clearcheck:function(){
    this.setData({
      'checkdate.hometype':"",
      'checkdate.homenum': "",
      'peopleinfor.peoplenum': "不限",
      'peopleinfor.peopledesc': "不限"
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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