// pages/ordercreat/ordercreat.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    UserID: "",
    loginstatus: "",
    Token: "",
    villaid: "",
    product: "",
    Logo: "",
    price: "",
    deposit: "",
    orderTotal: "",
    roomstatus: {},
    Startdate: "选择入住日期",
    Enddate: "选择退房日期",
    diffday: "?",
    ruzhurenshu: 1,
    username: "",
    tel: "",
    idcard: "",
    checkxieyi:false,//是否勾选服务协议。true代表勾选,false代表没有勾选。默认没有勾选。
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'loginstatus',
      success: function (res) { //获取登陆状态 res.data=1已登录/0未登陆 
        if (res.data == 1) { //如果已经登陆
          wx.getStorage({
            key: 'Token',
            success: function (e) {
              wx.getStorage({
                key: 'userinfor',
                success: function (r) {
                  //如果已经登陆，获取登陆状态，token,userid
                  that.setData({
                    loginstatus: res.data,
                    Token: e.data,
                    UserID: r.data.UserID
                  })
                },
              })
            },
          })
        } else if (res.data == 0) {
          //如果没有登陆跳转到登陆页面
          that.gotologin();
        }
      },
      fail: function () {
        that.gotologin();
      }
    })

    if (options.villaid == undefined) {
      return;
    }
    that.setData({
      villaid: options.villaid
    })
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Villa',
      data: {
        ProductID: this.data.villaid
      },
      datatype: "JSON",
      success(res) {
        let datetime = "{" + res.data.substr(0, res.data.length - 1) + "}";
        datetime = JSON.parse(datetime);
        that.setData({
          roomstatus: datetime
        })
      }
    })

    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Villa',
      data: {
        VillaId: that.data.villaid
      },
      method: "GET",
      success: function (res) {
        //处理logo小图
        let logoimg = res.data.Product.Logo;
        let zipLogo = app.ImgPathChange(logoimg, 5);
        let deposit = res.data.Product.deposit;
        let Price = res.data.Product.Price;
        if (deposit == "") {
          deposit = 0;
        }
        let orderTotal = Price + deposit
        that.setData({
          product: res.data.Product,
          Logo: zipLogo,
          price: Price,
          deposit: deposit,
          orderTotal: orderTotal
        })
        that.sumprice();
      }
    })
  },
  gotologin: function () {
    wx.showModal({
      title: '登陆提示',
      content: '完成登陆后,才能创建订单',
      confirmText: "去登陆",
      showCancel: false,
      success: function (res) {
        console.log(res);
        if (res.confirm||res.cancel==false) {
          wx.redirectTo({
            url: '../../pages/login/login',
          })
        }

      }
    })
  },
  choosedate: function () {
    let villaid = this.data.villaid;
    wx.navigateTo({
      url: '/pages/date/date?villaid=' + villaid
    })

    if (app.globalData.chosedate != undefined) {
      this.sumprice();
    }

  },
  goxieyi:function(){
  wx.navigateTo({
    url: '/pages/servicetext/servicetext',
    success: function(res) {},
    fail: function(res) {},
    complete: function(res) {},
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
    //获取入住退房时间后进行房价计算。
    if (app.globalData.chosedate == undefined) {
      return;
    }
    this.setData({
      Startdate: app.globalData.chosedate.startdate,
      Enddate: app.globalData.chosedate.enddate,
      diffday: app.globalData.chosedate.diffday + "晚"
    })
    this.sumprice();
  },
  //计算日期之间的房间价格总和
  sumprice: function () {
    if (this.data.Startdate == "选择入住日期") {
      return;
    }
    let startdate = this.changedataformat(this.data.Startdate);
    let enddate = this.changedataformat(this.data.Enddate);
    let deposit = this.data.deposit;
    let price = "";
    let orderTotal = 0;
    do {
      price = this.getprice(startdate)
      orderTotal += price;
      startdate = this.adddateoneday(startdate);
    } while (enddate != startdate)
    orderTotal = orderTotal + deposit;
    this.setData({
      orderTotal: orderTotal
    })
  },
  //根据日期获取价格
  getprice: function (date) {
    if (this.data.roomstatus[date]==undefined){
        return;
    }
    let priceobj = this.data.roomstatus[date].price;
    let priceval = parseInt(priceobj);
    return priceval;
  },
  //改变日期格式 2018-7-6 => 2018-07-06
  changedataformat: function (date) {
    let year = parseInt(date.split("-")[0]);
    let mouth = parseInt(date.split("-")[1]);
    let day = parseInt(date.split("-")[2]);
    if (mouth < 10) {
      mouth = "0" + mouth;
    }
    if (day < 10) {
      day = "0" + day;
    }
    let newdate = year + "-" + mouth + "-" + day;
    return newdate;
  },
  //当前日期加一天
  adddateoneday: function (startDate) {
    startDate = new Date(startDate);
    startDate = +startDate + 1000 * 60 * 60 * 24;
    startDate = new Date(startDate);
    let year = startDate.getFullYear();
    let mouth = startDate.getMonth() + 1;
    let day = startDate.getDate();
    if (mouth < 10) {
      mouth = "0" + mouth;
    }
    if (day < 10) {
      day = "0" + day;
    }
    let nextStartDate = year + "-" + mouth + "-" + day;
    return nextStartDate;
  },
  //减人数
  subren: function () {
    let renshu = this.data.ruzhurenshu;
    if (renshu == 1) {
      return;
    } else {
      renshu--;
      this.setData({
        ruzhurenshu: renshu
      })
    }
  },
  //弹框
  alert: function (str) {
    if (str == "" || str == undefined) {
      return;
    }
    wx.showModal({
      content: str,
      showCancel: false
    })
  },
  //加人数
  addren: function () {
    let renshu = this.data.ruzhurenshu;
    let Customer = this.data.product.Customer;
    if (renshu >= Customer) {
      wx.showModal({
        content: "此别墅最多只能入住" + Customer + "人",
        showCancel: false
      })
    } else {
      renshu++;
      this.setData({
        ruzhurenshu: renshu
      })
    }
  },
  //入住人表单
  username: function (e) {
    this.setData({
      username: e.detail.value
    })
  },
  //入住人电话
  tel: function (e) {
    this.setData({
      tel: e.detail.value
    })
  },
  //入住人身份证号
  idcard: function (e) {
    this.setData({
      idcard: e.detail.value
    })
  },
  //提交订单
  submitorder: function () {
    let mobile = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
    let identity_card = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/;
    if (this.data.Startdate == "选择入住日期" || this.data.Startdate == "") {
      this.alert("请您选择入住，退房日期");
      return;
    }
    if (this.data.username == "") {
      this.alert("入住人姓名不能为空");
      return;
    }
    if (this.data.tel == "") {
      this.alert("入住人手机号不能为空");
      return;
    }

    if (!mobile.test(this.data.tel)) {
      this.alert("请填写正确的手机号");
      return;
    }

    if (this.data.idcard == "") {
      this.alert("入住人身份证号不能为空");
      return;
    }

    if (!identity_card.test(this.data.idcard)) {
      this.alert("请填写正确的身份证号");
      return;
    }
    if (!this.data.checkxieyi){
      this.alert("请您同意我们服务协议");
      return;
    }

    let reqdata = {
      "UserID": this.data.UserID,
      "ProductID": this.data.villaid,
      "StartTime": this.data.Startdate,
      "EndTime": this.data.Enddate,
      "TenantMobile": this.data.tel,
      "TenantName": this.data.username,
      "TenantCardID": this.data.idcard,
      "TenantNumber": this.data.ruzhurenshu
    }
    wx.showLoading({
      title: '提交订单中',
      mask:true
    })
    let that=this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/Api/Order',
      method:"PUT",
      data: reqdata,
      header:{
        "auth": that.data.Token,
      },
      success:function(res){
        let orderno=res.data;
        if (res.statusCode!=200){
          wx.hideLoading();
          that.alert(orderno);
          return;
        }
        wx.redirectTo({
          url: '../../pages/orderdetail/orderdetail?orderno='+orderno,
        })  
      }
    })
  },

//别野网服务条例
  checkboxChange:function(e){
    if (e.detail.value.length==0){//取消勾选
      this.setData({
        checkxieyi:false
      })
    }else{//勾选
      this.setData({
        checkxieyi: true
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("-----hide---------");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("-----unload---------");
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