//获取应用实例
const app = getApp()
Page({
  data: {
    userInfo: {},//微信授权后获取的登陆信息
    login: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  login:function(){
    wx.navigateTo({
      url: '../login/login'
    })
  },
  gotohref:function(event){
    var url = event.currentTarget.dataset.url;
   console.log(url);

  },
  onShow:function(){
    var that=this;
    wx.getStorage({
      key: 'loginstatus',
      success: function(res) {
      //  console.log(res.data);
        if (res.data==0){
          that.setData({
            login: false
          })
        } else if(res.data==1){
          that.setData({
            login: true,
          })
          wx.getStorage({
            key: 'userinfor',
            success: function(res) {
              console.log(res);
              that.setData({
                userInfo:res.data
              })
            },
          })



        }
      }
    });
  },
  outlogin:function(){
    this.setData({
      userInfo:{},
      login:false
    })
    wx.clearStorage()
    wx.showToast({
      title: '退出登陆成功',
    })
  },
  onLoad: function () {
   
  },
  getUserInfo: function (e) {
    
  }
})
