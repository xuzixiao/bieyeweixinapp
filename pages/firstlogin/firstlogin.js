// pages/firstlogin/firstlogin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  userinfor:function(e){
    let getuserinforstatus=e.detail.errMsg.split(":")[1];
    if (getuserinforstatus!="ok"){
      wx.showToast({
        title: '已取消授权登陆',
        icon:"none"
      })
      return;
    }
    wx.showLoading();
    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    wx.login({
      success:function(res){
        let Jscode = res.code
        wx.request({
          url: 'https://wxapp.bie-ye.com/api/Code',
          method:"POST",
          data:{
            encryptedData: encryptedData,
            iv: iv,
            JsCode: Jscode
          },
          success:function(r){
            let rdata=JSON.parse(r.data);
            console.log(rdata);
            let sessionkey = rdata.result;
            if (rdata.code == 0) {//未注册
              wx.hideLoading();
              wx.showModal({
                content: '您还没有注册，无法微信授权登陆,先完成注册吧',
                showCancel: false,
                confirmText: "去注册吧",
                success: function (e) {
                  if (e.confirm || e.cancel == false) {
                    let regdata={
                      encryptedData: encryptedData,
                      iv: iv,
                      sessionkey: sessionkey
                    }
                    wx.setStorage({
                      key: 'regdata',
                      data: regdata,
                    })
                    wx.navigateTo({
                      url: '../../pages/reg/reg'
                    })
                  }
                }
              })
            } else if(rdata.code == 1){
              wx.hideLoading();
              wx.setStorage({
                key: 'Token',
                data: sessionkey.Token,
              })
              wx.setStorage({
                key: 'userinfor',
                data: sessionkey.Message
              })
              wx.setStorage({
                key: 'loginstatus',
                data: 1,
              })
              wx.switchTab({
                url: '/pages/index/index',
              })
            }
          }
        })
      }
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