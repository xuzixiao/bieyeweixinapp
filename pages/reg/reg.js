// pages/login/login.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sessionkey:"",
    encryptedData:"",
    iv:"",
    code:"",
    userinfor: {},
    logintype: 1,//1:账号密码登陆。2：手机验证码登陆
    tel: "",
    yzm: "",
    pwd: "",
    repwd: "",
    bdyzmtel:"",
    bdyzm:"",
    getyzmtext: "获取验证码",
    getyzmstatus: false,
    bdgetyzmtext: "获取验证码",
    bdgetyzmstatus: false,
    yzmcuttime: 60,
    regtext:"注册"
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
  changetab: function (e) {
    let logintype = parseInt(e.currentTarget.dataset.logintype);
    if(logintype==2){
      this.setData({
        logintype: logintype,
        regtext:"绑定手机号注册"
      })
    }else{
      this.setData({
        logintype: logintype,
        regtext: "注册"
      })
    }
    
  },
  tel: function (e) {
    this.setData({
      tel: e.detail.value
    })
  },
  yzm: function (e) {
    this.setData({
      yzm: e.detail.value
    })
  },
  pwd: function (e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  repwd: function (e) {
    this.setData({
      repwd: e.detail.value
    })
  },
  bdyzmtel:function(e){
    this.setData({
      bdyzmtel: e.detail.value
    })
  },
  bdyzm:function(e){
    this.setData({
      bdyzm: e.detail.value
    })
  },
  reguser: function () {
    let regtype = this.data.logintype;

    if (regtype==1){//未有账号，注册
      if (this.data.tel == "") {
        this.showtip("手机号不能为空");
        return;
      }

      if (this.data.yzm == "") {
        this.showtip("验证码不能为空");
        return;
      }

      if (this.data.pwd == "") {
        this.showtip("请输入密码");
        return;
      }

      if (this.data.repwd == "") {
        this.showtip("请输入确认密码");
        return;
      }
      if (this.data.pwd != this.data.repwd) {
        this.showtip("两次密码输入不一致");
        return;
      }

      let regdata = {
        "mobile": this.data.tel,
        "code": this.data.yzm,
        "password": this.data.pwd,
        "session_key": this.data.sessionkey,
        "iv": this.data.iv,
        "encryptedData": this.data.encryptedData
      }
      wx.showLoading({
        title: '提交注册中',
        mask: true
      })
      let that = this;
      wx.request({
        url: 'https://wxapp.bie-ye.com/api/Regist',
        method: "PUT",
        data: regdata,
        success: function (res) {
          wx.hideLoading();
          console.log(res);
          if (res.statusCode == 200) {
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
              title: '注册成功',
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
    }else{//已有账号，绑定手机号
      this.setData({
        regtext:"绑定手机号注册"
      })
      if (this.data.bdyzmtel==""){
        this.showtip("请输入您所要绑定的手机号，并获取验证码");
        return;
      }
      if (this.data.bdyzmtel == "") {
        this.showtip("请输入您所要绑定的手机号，并获取验证码");
        return;
      }
      if (this.data.bdyzm==""){
        this.showtip("输入您的手机验证码");
        return;
      }



      let bddata={
        "mobile": this.data.bdyzmtel,
        "code": this.data.bdyzm,
        "session_key": this.data.sessionkey,
        "iv": this.data.iv,
        "encryptedData": this.data.encryptedData
      }
      let that=this;
      wx.showLoading({
        title: '提交注册中',
      })
      wx.request({
        url: 'https://wxapp.bie-ye.com/api/Bind',
        method:"PUT",
        data:bddata,
        success:function(res){
          wx.hideLoading()
          if(res.statusCode==200){
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
          }else{
            that.showtip(res.data);
          }
        }
      })
    }
  },
  userinfo:function(e){
    if(e.detail.rawData){
      let rawData = JSON.parse(e.detail.rawData);
      wx.setStorage({
        key: 'userinfor',
        data: rawData,
      })
      this.setData({
        userinfor: rawData,
        haveuserinfo:false
      })
      wx.showToast({
        title: '获取授权成功',
        icon: 'success',
        duration: 2000
      })
    };
  },
  getyzm: function () {
    if (this.data.tel == "") {
      this.showtip("填写手机号后获取验证码");
      return;
    }
    if (!(/^1(3|4|5|6|7|8)\d{9}$/.test(this.data.tel))) {
      this.showtip("请填写正确的手机号");
      return;
    }
    var that=this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Regist',
      data: {
        mobile: this.data.tel
      },
      header: {
        "Content-Type": "json"
      },
      success:function(res){
        console.log(res)
        if (res.statusCode==200){
          that.cuttime();
       }else{
          that.showtip(res.data);
          return;
       }
      }
    })
  },
  bdgetyzm: function () {
    var bdyzmtel = this.data.bdyzmtel
    if (this.data.bdyzmtel == "") {
      this.showtip("填写手机号后获取验证码");
      return;
    }
    if (!(/^1(3|4|5|6|7|8)\d{9}$/.test(this.data.bdyzmtel))) {
      this.showtip("请填写正确的手机号");
      return;
    }
    var that = this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Login',
      data: {
        mobile: this.data.bdyzmtel
      },
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        console.log(res)
        if (res.statusCode == 200) {
          that.bdcuttime();
        } else {
          that.showtip(res.data);
          return;
        }
      }
    })
  },
  cuttime:function(){
    let that=this;
    let yzmcuttime = that.data.yzmcuttime;
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

  bdcuttime: function () {
    let that = this;
    let yzmcuttime = that.data.yzmcuttime;
    that.setData({
      bdgetyzmtext: yzmcuttime + "s",
      bdgetyzmstatus: true
    })
    let cuttimefun = setInterval(function () {
      yzmcuttime--;
      that.setData({
        bdgetyzmtext: yzmcuttime + "s"
      })
      if (yzmcuttime == 0) {
        that.setData({
          bdgetyzmtext: "重新获取",
          bdgetyzmstatus: false
        })
        clearInterval(cuttimefun)
      }
    }, 1000)
  },





  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
      wx.getStorage({
        key: 'regdata',
        success: function(res) {
          that.setData({
            sessionkey: res.data.sessionkey,
            iv: res.data.iv,
            encryptedData: res.data.encryptedData
          })
        },
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
   let that=this;
    wx.login({
      success: function (res) {
        that.setData({
          code: res.code
        })
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