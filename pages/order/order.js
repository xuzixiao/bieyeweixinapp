// pages/order/order.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderstatus:1,
    Token:"",
    reqdata: {
      "UserID": 1,
      "PageIndex": 1,
      "Status": 1 //1:进行中 2：已结束
    },
    orderlist:[],//进行中的订单
    finishorderlist:[],
    ordermarch:false,//进行中追加  true追加，false 覆盖
    orderfinish: false,//已完成追加 true追加，false 覆盖
    ordermarchhave:true, //进行中订单下拉数据 有 true 无false
    orderfinishhave:true, //已完成订单下拉数据 有 true 无false
    marchpage:1,//进行中的订单页数
    finishpage:1,//已完成订单页数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  changetab:function(event){
    //把当前页数存入数据变量
    if (this.data.orderstatus == 1) {//当前状态为进行中时
      let page = this.data.reqdata.PageIndex;
      this.setData({
        marchpage: page
      })
    } else if (this.data.orderstatus == 2){//当前状态为已结束时
      let page = this.data.reqdata.PageIndex;
      this.setData({
        finishpage: page
      })
    }
    //改变tab
    let status=event.currentTarget.dataset.status;
    
    //根据上一次的页数改变此次的数据

    if (status==1){//如果切换为进行中时
      let lastpage = this.data.marchpage;
      this.setData({
        ordermarch: false,
        orderstatus: status,
        'reqdata.Status': status,
        'reqdata.PageIndex': lastpage
      })

      this.getorderlist();
      
    }else if (status == 2){//如果切换为已结束时
      let lastpage = this.data.finishpage;
      this.setData({
        orderstatus: status,
        'reqdata.Status': status,
        'reqdata.PageIndex': lastpage
      })
      if (this.data.finishorderlist.length == 0) {
        this.getorderlist();
      }
    }
  },
  judgelogin:function(){
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
                    "reqdata.UserID": r.data.UserID
                  })
                  that.getorderlist();
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
  onLoad: function (options) {
//判断是否登陆
    this.judgelogin();
  },
  getorderlist:function(){
    let that=this;
    if (that.data.Token==""){
      return;
    }
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Order',
      method:"POST",
      header: {
        "auth": that.data.Token,
      },
      data: that.data.reqdata,
      success:function(res){
        setTimeout(function(){
          wx.hideLoading();
        },200)
        let orderlist=res.data;
        for (let i = 0; i < orderlist.length;i++){
          let ziplogo = app.ImgPathChange(orderlist[i].Logo,3);
          let StartTime = orderlist[i].StartTime.split("T")[0];
          let EndTime = orderlist[i].EndTime.split("T")[0];
          let OrderCreateTime = orderlist[i].OrderCreateTime.replace("T"," ");
          let OrderStateText = app.orderstatusbook(orderlist[i].OrderState);
          orderlist[i].ziplogo = ziplogo;
          orderlist[i].StartTime = StartTime;
          orderlist[i].EndTime = EndTime;
          orderlist[i].OrderCreateTime = OrderCreateTime;
          orderlist[i].OrderStateText = OrderStateText;
        }
        if (that.data.orderstatus==1){//进行中的订单
          
          if (that.data.ordermarch){//判断进行中订单是追加还是覆盖
            //追加
            that.setData({
              orderlist: that.data.orderlist.concat(orderlist)
            })
            
          }else{
            //覆盖
            that.setData({
              orderlist: orderlist
            })
          }

          //如何此页订单小于5条，说明已经是末页，就拒绝下次请求
          if (orderlist.length < 5) {
            that.setData({
              ordermarchhave: false
            })
          }

        } else if (that.data.orderstatus == 2){//已完成订单
          if (that.data.orderfinish) {//判断已完成订单是追加还是覆盖
            //追加
            that.setData({
              finishorderlist: that.data.finishorderlist.concat(orderlist)
            })
            
          } else {
            //覆盖
            that.setData({
              finishorderlist: orderlist
            })
          }
          //如何此页订单小于5条，说明已经是末页，就拒绝下次请求
          if (orderlist.length < 5) {
            that.setData({
              orderfinishhave: false
            })
          }
        }        
      }
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.judgelogin();
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
    let pages = this.data.reqdata.PageIndex+1;
    if (this.data.orderstatus==1){//进行中触底追加模式开启
        this.data.ordermarch=true;
        if (this.data.ordermarchhave==false){
          return;
        }
    }
    if (this.data.orderstatus == 2) {//已完成触底追加模式开启
        this.data.orderfinish = true;
        if (this.data.orderfinishhave == false) {
          return;
        }
    }

    this.setData({
      'reqdata.PageIndex': pages
    })
    this.getorderlist();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})