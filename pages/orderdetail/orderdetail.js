// pages/orderdetail/order.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderno:"",
    UserID:"",
    Token:"",
    loginstatus:"",
    orderInfor:"",
    orderstate:"",
    product:"",
    OrderCreatTime:"",
    OrderExpireTime:"",
    cuttimemin:6,
    cutpaytime:15,
    difftime:"",
    ordertipinfor:"",
    receivetime:"",
    waitpaystate:true,//订单待确认倒计时状态
    paystate: true,//订单支付倒计时状态
    serverpaytest:false,//服务器验证支付是否成功。默认不成功
    refundshow:false,
    refunddatearr:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderno=options.orderno;
    if(orderno==""){
      return;
    }
    //获取orderno
    this.setData({
      orderno: orderno
    })
    this.judgelogin();
  },
//获取订单详情
getorderdetail:function(){
  let that = this;
  if (that.data.UserID==""){
    return;
  }
  wx.showLoading({
    title: '加载中',
    mask: true
  })
  wx.request({
    url: 'https://wxapp.bie-ye.com/api/Order',
    header:{
      auth:that.data.Token
    },
    data: {
        UserID: that.data.UserID,
        OrderNO:that.data.orderno
      },
    success: function (res) {
      setTimeout(function () {
        wx.hideLoading();
      }, 200)
      let StartTime = res.data.orderInfo.StartTime.split("T")[0];
      let EndTime = res.data.orderInfo.EndTime.split("T")[0];
      let OrderStateText = app.orderstatusbook(res.data.orderInfo.OrderState);
      let OrderCreatTime = res.data.orderInfo.OrderCreateTime.replace("T"," ").split(".")[0];
      let orderstate = res.data.orderInfo.OrderState;
      let logo=res.data.product.Logo;
      logo=app.ImgPathChange(logo,3)
      res.data.orderInfo.StartTime = StartTime;
      res.data.orderInfo.EndTime = EndTime;
      res.data.orderInfo.OrderStateText = OrderStateText;
      that.setData({
        orderInfor: res.data.orderInfo,
        product: res.data.product,
        OrderCreatTime: OrderCreatTime,
        orderstate: orderstate,
        'product.Logo': logo
      })

      //状态判断--根据不同状态走不同函数
      if (orderstate==70){//订单待确认状态
        that.setData({
          ordertipinfor: "管家将在6分钟内审核订单",
        })
        that.gettimediffer(OrderCreatTime);
      } else if (orderstate == 92){//等待支付
        if (typeof (cuttime) != "undefined") {
          clearInterval(cuttime);
        }
        if (typeof (watchordercuttime) != "undefined") {
          clearInterval(watchordercuttime);
        }
        that.setData({
          ordertipinfor: "请在" + that.data.cutpaytime+"分钟内完成支付,否则订单因支付超时失效。",
          waitpaystate:false
        })
        that.watchorderstatus();
      } else if (orderstate == 53){//订单驳回
        if (typeof (cuttime) != "undefined") {
          clearInterval(cuttime);
        }
        if (typeof (watchordercuttime) != "undefined") {
          clearInterval(watchordercuttime);
        }
        that.setData({
          difftime:"房东回复："+res.data.orderInfo.RejectContent,
          ordertipinfor: "",
          waitpaystate: false
        })
        
      }else{//其他状态显示
        that.setData({
          difftime: "",
          ordertipinfor: "",
          waitpaystate: false,
          serverpaytest: false
        })
      }

    }
  })
},
//判断是否登陆
judgelogin: function () {
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
                  UserID: r.data.UserID,
                })
               that.getorderdetail();
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
},
alertmsg: function (msg) {
  wx.showModal({
    title: '',
    content: msg,
    showCancel: false, //不显示取消按钮
    confirmText: '确定'
  })
},
//没有登陆时完成登陆
gotologin: function () {
  wx.showModal({
    title: '登陆提示',
    content: '您还没有登陆',
    confirmText: "去登陆",
    showCancel: false,
    success: function (res) {
      if (res.confirm || res.cancel == false) {
        wx.redirectTo({
          url: '../../pages/login/login',
        })
      }
    }
  })
},
//根据创建时间进行倒计时请求接口操作
gettimediffer: function (ordercreattime) {
//订单创建时间
  ordercreattime = ordercreattime.replace(/-/g, "/");
  let creat = new Date(ordercreattime);
//时间间隔
  let timemin = this.data.cuttimemin;
//订单失效时间
  let expire = new Date(creat.getTime() + (60 * 1000 * timemin));
  //获取当前时间
  let nowdate=new Date();
  //获取当前时间与失效时间之间的时间差
  let difftime = expire.getTime() - nowdate.getTime();
  if(difftime<0){//如果日期为负数，说明已经过了6分钟。订单失效
    this.setData({
      ordertipinfor:""
    })
    return;
  }
  let diffmin = this.timeformat(new Date(difftime).getMinutes());
  let diffsec = this.timeformat(new Date(difftime - diffmin * 60000).getSeconds());
  let diff = diffmin + ":" + diffsec
  this.setData({
    OrderCreatTime: creat,
    OrderExpireTime: expire,
    difftime: diff
  }) 
let that = this;
var cuttime=setInterval(function(){
    if (!that.data.waitpaystate) {//如果定时器状态为false 关闭状态==>清除定时任务
      clearInterval(cuttime);
      return;
    }
    nowdate = new Date();
    difftime = expire.getTime() - nowdate.getTime();
    diffmin = that.timeformat(new Date(difftime).getMinutes());
    diffsec = that.timeformat(new Date(difftime - diffmin * 60000).getSeconds());
    diff = diffmin + ":" + diffsec;
    that.setData({
      difftime: diff
    })
    if (diffmin == "00" && diffsec=="00"){
      //订单超时操作
      that.setData({
        waitpaystate: false,
        paystate: false
      })
      clearInterval(cuttime);
      clearInterval(watchordercuttime);
      that.getorderdetail();
    }
    
  },1000)

//订单确认状态:每5s查看一次订单状态
var watchordercuttime = setInterval(function () {
  if (!that.data.waitpaystate) {//如果定时器状态为false 关闭状态==>清除定时任务
    clearInterval(watchordercuttime);
    return;
  }
  that.watchorderstatus();    
  }, 5000)
},
getorderpay: function (ordercreattime) {
  ordercreattime = ordercreattime.replace(/-/g, "/");
  //订单创建时间
  let creat = new Date(ordercreattime)
  //时间间隔
  let timemin = this.data.cutpaytime;
  //订单失效时间
  let expire = new Date(creat.getTime() + (60 * 1000 * timemin));
  //获取当前时间
  let nowdate = new Date();
  //获取当前时间与失效时间之间的时间差
  let difftime = expire.getTime() - nowdate.getTime();
  if (difftime < 0) {//如果日期为负数，说明已经过了
    this.setData({
      ordertipinfor: ""
    })
    return;
  }
  let diffmin = this.timeformat(new Date(difftime).getMinutes());
  let diffsec = this.timeformat(new Date(difftime - diffmin * 60000).getSeconds());
  let diff = diffmin + ":" + diffsec
  this.setData({
    OrderCreatTime: creat,
    OrderExpireTime: expire,
    difftime: diff
  })
  let that = this;
  var paycuttime = setInterval(function () {
    if (!that.data.paystate) {//如果定时器状态为false 关闭状态==>清除定时任务
      clearInterval(paycuttime);
      return;
    }
    nowdate = new Date();
    difftime = expire.getTime() - nowdate.getTime();
    diffmin = that.timeformat(new Date(difftime).getMinutes());
    diffsec = that.timeformat(new Date(difftime - diffmin * 60000).getSeconds());
    diff = diffmin + ":" + diffsec;
    that.setData({
      difftime: diff
    })
    if (diffmin == "00" && diffsec == "00") {
      //订单超时操作
      that.setData({
        waitpaystate: false,
        paystate: false
      })
      clearInterval(paycuttime);
      that.getorderdetail();
    }
  }, 1000)
},
//查看订单状态
watchorderstatus:function(){
  //查看订单状态，如果尚未失效时，走15分钟倒计时。
  let that=this;
  if (that.data.orderstate == 92 && that.data.receivetime!=""){
    that.getorderpay(that.data.receivetime);
    return;
  }
  wx.request({
    url: 'https://wxapp.bie-ye.com/api/UpdateOrder',
    header:{
      auth:that.data.Token
    },
    data: {
      UserID: that.data.UserID,
      OrderNO: that.data.orderno
    },
    success: function (res) {
      let orders = JSON.parse(res.data)
      if (res.statusCode == 200){
       //刷新页面重新请求数据
        if(orders.code==1){//订单没有发生变动，
          //that.getorderdetail();
        } else if(orders.code == 0){//待支付状态 返回房东确认时间。
          let reg = new RegExp('/', "g");
          let receivetime = orders.message.replace(reg,"-");
          that.setData({
            receivetime: receivetime
          })
          that.getorderdetail();
        } else if(orders.code == -1){//订单驳回或订单失效
          that.getorderdetail();
        }
      }
    }
  })
},
 timeformat:function(s){
   return s < 10 ? '0' + s : s;
 },
//取消订单
  cancelorder:function(){
    let orderno = this.data.orderno;
    let userid = this.data.UserID;
    let that=this;
    wx.showModal({
      title: '订单操作',
      content: '确定要取消订单吗？',
      mask:true,
      success:function(e){
        if(e.confirm){//取消订单
          wx.request({
            url: 'https://wxapp.bie-ye.com/api/UserCancelOrder',
            method:"POST",
            header:{
              auth:that.data.Token
            },
            data:{
              "UserID":userid,
              "OrderNO":orderno,
              "content":""
            },
            success:function(res){
              console.log(res);
              if (res.statusCode==200){
                //  wx.redirectTo({
                //    url: '../../pages/orderdetail/orderdetail?orderno=' + orderno,
                //  })
                that.getorderdetail();
              }
            }
          })
        }
      }
    })    
  },
//支付
gopay:function(){
  let that=this;
  wx.request({
    url: 'https://wxapp.bie-ye.com/api/Pay',
    method:"POST",
    header: {
      "auth": that.data.Token,
    },
    data:{
      "UserID": that.data.UserID,
      "OrderNO": that.data.orderno
    },
    success:function(res){
      console.log(res);
      if (res.data.Success){
        console.log(res);
        wx.requestPayment({
          'timeStamp': res.data.Value.timeStamp,
          'nonceStr': res.data.Value.nonceStr,
          'package': res.data.Value.package,
          'signType': res.data.Value.signType,
          'paySign': res.data.Value.paySign,
          'success': function (payres) {
            that.setData({
              serverpaytest: true
            })
              //验证支付状态
              that.testpay();
          },
          'fail': function (payres) {
            console.log("fail:" + payres)
          }
        })
      }else{
        that.alertmsg(res.data.Info);
      }
    }
  })
}, 
testpay: function() {//支付成功后去服务器验证是否成功
  if (this.data.serverpaytest==false){
    return;
  }
    let that=this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Pay',
      header: {
        "auth": that.data.Token,
      },
      data: {
        "UserID": that.data.UserID,
        "OrderNO": that.data.orderno
      },
      success: function (byres) {
        console.log(byres)
        if (byres.statusCode==200){
          let paydata = JSON.parse(byres.data);
          console.log(paydata)
          if (paydata.code==100){//支付成功
            that.setData({
              serverpaytest:false 
            })
            wx.showToast({
              title: '支付成功',
            })
            that.getorderdetail();
          } else if (paydata.code == 1){//继续请求验证支付数据
           let cuttestpay=setInterval(function(){
              if (this.serverpaytest==false){
                clearInterval(cuttestpay);
                return;
              }
              that.testpay();
            },500)
          }else if (paydata.code == 0){//支付失败。
            that.setData({
              serverpaytest: false
            })
            wx.showModal({
              title: '支付提示',
              content: paydata.result,
              showCancel:false,
              confirmText:"返回",
              success:function(s){
                if(s.confirm){
                  wx.switchTab({
                    url: '/pages/order/order',
                  })
                }
              }
            })
          }
        }else{
          wx.showModal({
            title: '支付提示',
            content: "支付异常，请您稍后重试",
            showCancel: false,
            confirmText: "返回",
            success: function (s) {
              if (s.confirm) {
                that.setData({
                  serverpaytest: false
                })
                that.getorderdetail();
              }
            }
          })
        }
      }
    })
  },
//计算两个日期的间隔日期，返回间隔日期数组
addcheckcenter: function (startdate, enddate) {
  function dateAdd(startDate) {//日期加一天
    startDate = new Date(startDate);
    startDate = +startDate + 1000 * 60 * 60 * 24;
    startDate = new Date(startDate);
    var nextStartDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();
    return nextStartDate;
  }
  startdate = dateAdd(startdate);
  function getDate(datestr) {
    var temp = datestr.split("-");
    if (temp[1] === '01') {
      temp[0] = parseInt(temp[0], 10) - 1;
      temp[1] = '12';
    } else {
      temp[1] = parseInt(temp[1], 10) - 1;
    }
    //new Date()的月份入参实际都是当前值-1
    var date = new Date(temp[0], temp[1], temp[2]);
    return date;
  }

  var startTime = getDate(startdate);
  var endTime = getDate(enddate);
  var dateArr = [];
  while ((endTime.getTime() - startTime.getTime()) > 0) {
    var year = startTime.getFullYear();
    var month = startTime.getMonth().toString().length === 1 ? "0" + (parseInt(startTime.getMonth().toString(), 10) + 1) : (startTime.getMonth() + 1);
    var day = startTime.getDate().toString().length === 1 ? "0" + startTime.getDate() : startTime.getDate();
    dateArr.push(year + "-" + month + "-" + day);
    startTime.setDate(startTime.getDate() + 1);
  }
  return dateArr;
},
//申请退款
  refund:function(){
    let that=this;
    wx.showModal({
      title: '退款提示',
      content: '确定要申请退款吗？',
      success:function (r){
        if(r.confirm){
          let nowdate = new Date();
          let nowyear = nowdate.getFullYear();
          let nowmouth=nowdate.getMonth()+1;
          let nowday = nowdate.getDate();
          let nowhours=nowdate.getHours();
          let nowdatefrom = nowyear + "-" + nowmouth + "-" + nowday;
          let startdate = that.data.orderInfor.StartTime;
          let enddate = that.data.orderInfor.EndTime;

          //入住时间==》如果入住时间>现在时间时   ==证明还没入住，走退款流程 
          //               入住时间<现在时间时  == 证明已经入住，走退房流程 收集离开时间
          if (Date.parse(startdate) > Date.parse(nowdate)) {//证明还没入住，走退款流程 
            that.refundbeforgetin();
          } else {//走退房流程 收集离开时间
            let leavearr = that.addcheckcenter(nowdatefrom, enddate);
            if (nowhours>=12){
              console.log("已经过了12点,只能从明天开始退款！");
            }else{
              leavearr.unshift(nowdatefrom);
            }
            console.log(leavearr);
            that.setData({
              refundshow: true,
              refunddatearr: leavearr
            })
          }
      }
    }
  })
},
  gocomment:function(){
   let data={
     orderprologo: this.data.product.Logo,
     orderproname: this.data.product.Name,
     orderstart: this.data.orderInfor.StartTime,
     orderend: this.data.orderInfor.EndTime,
     orderpay: this.data.orderInfor.PayTotal,
     productid: this.data.product.ProductID
   }
    app.globalData.orderInfor = data;
    wx.navigateTo({
      url: '/pages/createcomment/createcomment?OrderID=' + this.data.orderInfor.OrderID,
    })
  },
//入住前退款
refundbeforgetin:function(){
  let that=this;
  wx.request({
    url: 'https://wxapp.bie-ye.com/api/UpdateOrder',
    method: "POST",
    header: {
      "auth": that.data.Token,
    },
    data: {
      "UserID": that.data.UserID,
      "OrderNO": that.data.orderno
    },
    success: function (res) {
      console.log(res);
      if (res.statusCode == 200) {
        let resdata = JSON.parse(res.data);
        console.log(resdata.code);
        if (resdata.code == 0) {//无扣除
          //执行扣款
          that.goRefund("", "");
        } else if (resdata.code == 1) {//有扣款
          wx.showModal({
            title: '扣款提示',
            content: resdata.result + ",确定要继续吗？",
            success: function (e) {
              if (e.confirm) {
                that.goRefund("", "");
              }
            }
          })
        }
      } else {
        wx.showModal({
          title: '操作提示',
          content: "申请退款接口异常,请您稍后重试",
          showCancel: false,
          confirmText: "返回",
          success: function (e) {
            if (e.confirm) {
              that.getorderdetail();
            }
          }
        })
      }
    }
  })
},
//关闭退款日期显示
closerefund:function(){
  this.setData({
    refundshow:false,
  })
},
taprefunddate:function(e){
  let that=this;
  let getoutdate = e.currentTarget.dataset.refunddate;

 wx.request({
   url: 'https://wxapp.bie-ye.com/api/UserCheckOutForm',
   method:'POST',
   header:{
     "auth": that.data.Token,
   },
   data:{
     "UserID": that.data.UserID,
     "OrderNO": that.data.orderno,
     "leaveTime":getoutdate
   },
   success:function(res){
    console.log(res);
    if(res.statusCode==200){
      
      wx.showModal({
        title: '退款提示',
        content: res.data,
        success:function(res){
          if(res.confirm){
            that.goRefund(getoutdate, "")
          }
        }
      })
    }else{
      that.alertmsg(res.data);
    }
   }
 })
  this.setData({
    refundshow: false,
    refunddatearr: []
  })

},


//执行退款
goRefund: function (LeaveTime, comment){
    let that=this; 
    let refunddata={
      "UserID": that.data.UserID,
      "OrderNO": that.data.orderno,
      "LeaveTime": LeaveTime,
      "comment": comment
    }
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/UserApplyRefund',
      method:"PUT",
      header: {
        "auth": that.data.Token,
      },
      data:refunddata,
      success:function(res){
        if(res.statusCode==200){
          that.getorderdetail();
          that.alertmsg(res.data);  
        }
      }
    })
  },
//取消退款退房
cancelpay:function(){
  let that = this;
wx.showModal({
  title: '取消退款提示',
  content: '确定要取消退款吗？',
  success:function(e){
    if(e.confirm){
      wx.request({
        url: 'https://wxapp.bie-ye.com/api/CancelApplyRefund',
        method:"PUT",
        header:{
          "auth": that.data.Token,
        },
        data:{
          "UserID": that.data.UserID,
          "OrderNO": that.data.orderno
        },
        success:function(res){
         console.log(res);
         if(res.statusCode==200){
           that.alertmsg(res.data); 
           that.getorderdetail();
         }else{
           that.alertmsg(res.data);  
         }
        }
      })


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
    this.setData({
      waitpaystate:true,
      paystate: true
    })
    this.getorderdetail();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      waitpaystate: false,
      paystate: false
    })
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