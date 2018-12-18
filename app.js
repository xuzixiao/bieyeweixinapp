//app.js
App({
  onLaunch: function () {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res.code);
        // return;
        if(res.code){
          wx.setStorage({
            key: 'code',
            data: res.code,
          })
          wx.request({
            url: 'https://wxapp.bie-ye.com/api/Code',
            data:{
              Jscode:res.code
            },
            success:function(e){
              let status=JSON.parse(e.data);
              console.log(e);
              wx.setStorage({
                key: 'loginstatus',
                data: status.code,
              })
              if (status.code == 1){//已经注册时 token写入storage
                wx.setStorage({
                  key: 'Token',
                  data: status.result.Token,
                })
                wx.setStorage({
                  key: 'userinfor',
                  data: status.result.Message 
                })
              } else if(status.code == 0){//未注册时,跳转注册。
                wx.redirectTo({
                  url: '/pages/firstlogin/firstlogin',
                })
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  },
  //file站获取图片尺寸//返回图片路径
  ImgPathChange: function (imgurl, sizetype) {
    var newimgurl = imgurl.substring(imgurl.lastIndexOf("/"));
    var imgpath = imgurl.substring(0, imgurl.lastIndexOf("/"));
    switch (sizetype) {
      case 1:
        newimgurl = newimgurl.replace("/", "/_W_2400X1440_")
        break;
      case 2:
        newimgurl = newimgurl.replace("/", "/_W_1280X768_")
        break;
      case 3:
        newimgurl = newimgurl.replace("/", "/_W_750X450_")
        break;
      case 4:
        newimgurl = newimgurl.replace("/", "/_W_500X300_")
        break;
      case 5:
        newimgurl = newimgurl.replace("/", "/_W_250X150_")
        break;
      case 6:
        newimgurl = newimgurl.replace("/", "/_W_150X90_")
        break;
    }
    var NewImgPath = imgpath + newimgurl
    return NewImgPath;
  },
  orderstatusbook:function(orderstatusint){
    let orderstatustext="";
    if (orderstatusint == 70){
      orderstatustext = "订单待确认";
    }
    if (orderstatusint == 50) {
      orderstatustext = "订单取消";
    }
    if (orderstatusint == 53) {
      orderstatustext = "订单驳回";
    }
    if (orderstatusint == 51) {
      orderstatustext = "房主确认超时自动取消";
    }
    if (orderstatusint == 52) {
      orderstatustext = "订单待支付超时取消";
    }
    if (orderstatusint == 92) {
      orderstatustext = "待支付";
    }
    if (orderstatusint == 94) {
      orderstatustext = "支付失败";
    }
    if (orderstatusint == 95) {
      orderstatustext = "支付中";
    }
    if (orderstatusint == 100) {
      orderstatustext = "支付成功";
    }
    if (orderstatusint == 110) {
      orderstatustext = "申请退款";
    }
    if (orderstatusint == 111) {
      orderstatustext = "申请退房";
    }
    if (orderstatusint == 130) {
      orderstatustext = "押金待退";
    }


    if (orderstatusint == 131) {
      orderstatustext = "申请退款交易结束";
    }
    if (orderstatusint == 132) {
      orderstatustext = "申请退房交易结束";
    }
    if (orderstatusint == 140) {
      orderstatustext = "订单待确认";
    }
    if (orderstatusint == 200) {
      orderstatustext = "订单完成";
    }
    return orderstatustext;
  },
  //评论状态
  commentstatus: function (status) {
    switch (status) {
      case 0:
        return "待评论"
        break;
      case 1:
        return "待审核"
        break;
      case 2:
        return "审核通过"
        break;
      case 3:
        return "审核驳回"
        break;
      default:
        return;
    }
  },
  loginout:function(){
    wx.removeStorage({
      key:"user",
      success:function(res){
        console.log(res);
      }	
    })
  }
})