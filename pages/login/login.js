// pages/login/login.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logintype: 1,//1:账号密码登陆。2：手机验证码登陆
    tel: "",
    pwd: "",
    yzmtel: "",
    yzm: "",
    getyzmtext: "获取验证码",
    getyzmstatus: false,
    yzmcuttime: 60,
    code: ""
  },

  showtip: function (str) {
    if (str == "") {
      return;
    }
    wx.showModal({
      title: '',
      content: str,
      showCancel: false
    })
  },
  goreg: function () {
    wx.navigateTo({
      url: '../../pages/reg/reg',
    })
  },
  changetab: function (e) {
    let logintype = parseInt(e.currentTarget.dataset.logintype);
    this.setData({
      logintype: logintype
    })
  },
  tel: function (e) {
    this.setData({
      tel: e.detail.value
    })
  },
  pwd: function (e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  yzmtel: function (e) {
    this.setData({
      yzmtel: e.detail.value
    })
  },
  yzm: function (e) {
    this.setData({
      yzm: e.detail.value
    })
  },
  logoin: function () {
    let logintype = this.data.logintype;
    if (logintype == 1) {//用户名密码登陆
      if (this.data.tel == "" || this.data.pwd == "") {
        this.showtip("请您完善您的登陆信息");
        return;
      }
      wx.showLoading({
        title: '登陆中~',
      })
      let that = this;
      wx.request({
        url: 'https://wxapp.bie-ye.com/api/LoginP',
        method: 'POST',
        hearder: {
          "Content-Type": "application/json;charset=utf-8"
        },
        data: {
          mobile: this.data.tel,
          password: this.data.pwd,
          JsCode: this.data.code
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.Success) {
            wx.setStorage({
              key: "userinfor",
              data: res.data.Message
            })
            wx.setStorage({
              key: "loginstatus",
              data: 1
            })
            wx.setStorage({
              key: "Token",
              data: res.data.Token
            })
            wx.showToast({
              title: '登陆成功',
            })
            setTimeout(function () {
              wx.switchTab({
                url: '../../pages/my/my',
              })
            }, 800)
          } else {
            that.showtip(res.data);
          }
        }
      })
    } else if (logintype == 2) {//验证码登陆

      if (this.data.yzmtel == "") {
        this.showtip("手机号不能为空");
        return;
      }
      if (this.data.yzm == "") {
        this.showtip("填写手机验证码");
        return;
      }
      let that = this;
      wx.showLoading({
        title: '登陆中~',
      })
      wx.request({
        url: 'https://wxapp.bie-ye.com/api/Login',
        method: "POST",
        data: {
          mobile: this.data.yzmtel,
          code: this.data.yzm,
          JsCode: this.data.code
        },
        success: function (res) {
          wx.hideLoading();
          console.log(res);
          if (res.data.Success) {
            wx.setStorage({
              key: "userinfor",
              data: res.data.Message
            })
            wx.setStorage({
              key: "loginstatus",
              data: 1
            })
            wx.setStorage({
              key: "Token",
              data: res.data.Token
            })
            wx.showToast({
              title: '登陆成功',
            })
            setTimeout(function () {
              wx.switchTab({
                url: '../../pages/my/my',
              })
            }, 800)
          } else {
            that.showtip(res.data);
          }
        }
      })


    }
  },
  getyzm: function () {
    console.log(this.data.yzmtel);
    if (this.data.yzmtel == "") {
      this.showtip("填写手机号后获取验证码");
      return;
    }
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Login',
      data: {
        mobile: this.data.yzmtel
      }
    })
    let that = this;
    let yzmcuttime = that.data.yzmcuttime
    that.setData({
      getyzmtext: yzmcuttime + "s",
      getyzmstatus: true
    })
    let cuttimefun = setInterval(function () {
      yzmcuttime--;
      that.setData({
        getyzmtext: yzmcuttime + "s"
      })
      if (yzmcuttime == 0) {
        that.setData({
          getyzmtext: "重新获取",
          getyzmstatus: false
        })
        clearInterval(cuttimefun)
      }
    }, 1000)
  },
  getuserinfor: function () {
    wx.getUserInfo({
      timeout: 2000,
      success: function (res) {
        console.log(res);
      }
    })
  },
  updatecode: function (code) {//更新code
    this.setData({
      code: code
    })
    wx.setStorage({
      key: 'code',
      data: code
    })
  },
  userinfor: function (e) {
    console.log(e);

    var that = this;
    wx.showLoading({
      title: '登陆中~',
    })
    wx.login({
      success: function (res) {
        that.updatecode(res.code);
        wx.request({
          url: 'https://wxapp.bie-ye.com/api/Code',
          data: {
            Jscode: res.code
          },
          success: function (state) {
            let logindata = JSON.parse(state.data);
            console.log(logindata)
            if(logindata.code == 0) {//未注册
              let userinfor = JSON.parse(e.detail.rawData);
                wx.setStorage({
                  key: 'userinfor',
                  data: userinfor,
                })
                wx.hideLoading();
                wx.showModal({
                  content: '您还没有注册，无法微信授权登陆,先完成注册吧',
                  showCancel: false,
                  confirmText: "去注册吧",
                  success: function (e) {
                    if (e.confirm||e.cancel==false) {
                      wx.navigateTo({
                        url: '../../pages/reg/reg',
                      })
                    }
                  }
                })
            }
            else if (logindata.code == 1) {//已注册

              console.log(logindata.result);
              wx.setStorage({
                key: "userinfor",
                data: logindata.result.Message
              })
              wx.setStorage({
                key: "loginstatus",
                data: 1
              })
              wx.setStorage({
                key: "Token",
                data: logindata.result.Token
              })
              wx.showToast({
                title: '登陆成功',
              })
              setTimeout(function () {
                wx.switchTab({
                  url: '../../pages/my/my',
                })
              }, 800)
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
    this.getuserinfor();
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
    let that = this;

    wx.login({
      success: function (res) {
        that.setData({
          code: res.code
        })
        wx.setStorage({
          key: 'code',
          data: res.code,
        })
        console.log(res.code)
        return;
      }
    })
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