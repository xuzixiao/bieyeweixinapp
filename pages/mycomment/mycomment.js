// pages/comment/comment.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Token:"",
    UserID:"",
    PageIndex:1,
    commentlist:[],
    plbigimg: [],
    concat: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    wx.getStorage({
      key: 'userinfor',
      success: function(res) {
        if (res.data.UserID == "" || res.data.UserID ==undefined){
          wx.showModal({
            title: '登陆提示',
            content: '您的用户登陆信息已过期，请您重新登陆',
            showCancel:false,
            success:function(res){
              if(res.confirm){
                wx.navigateTo({
                  url: '/pages/login/login',
                })
              }
            }
          })
        }else{//如果已经登陆
          wx.getStorage({
            key: 'Token',
            success: function(e) {
              that.setData({
                UserID: res.data.UserID,
                Token:e.data
              })
              wx.request({
                url: 'https://wxapp.bie-ye.com/api/MyComment',
                method:"POST",
                header: {
                  "auth": that.data.Token
                },
                data: {
                  "UserID": that.data.UserID,
                  "PageIndex": that.data.PageIndex
                },
                success: function (res) {
                  if(res.statusCode==200){
                    let commentlist = res.data;
                    if (res.data.length < 5) {
                      that.setData({
                        concat: false
                      })
                    } else {
                      that.setData({
                        concat: true
                      })
                    }
                     for (let i = 0; i < commentlist.length; i++) {
                       commentlist[i].StartTime = commentlist[i].StartTime.split("T")[0];
                       commentlist[i].EndTime = commentlist[i].EndTime.split("T")[0];
                       commentlist[i].Logo = app.ImgPathChange(commentlist[i].Logo,4);
                       commentlist[i].DiscussStatetext = that.commentstatus(commentlist[i].DiscussState);
                     }
                    that.setData({
                      commentlist: commentlist
                    })
                  }
                }
              })
            },
          })
        }
      },
    })
  },
//评论状态
commentstatus:function(status){
  switch (status){
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
getlist:function(){
  wx.showLoading({
    title: '加载中',
  })
  let that=this;
  wx.request({
    url: 'https://wxapp.bie-ye.com/api/MyComment',
    method: "POST",
    header: {
      "auth": that.data.Token
    },
    data: {
      "UserID": that.data.UserID,
      "PageIndex": that.data.PageIndex
    },
    success: function (res) {
      if (res.statusCode == 200) {

        setTimeout(function(){
          wx.hideLoading();
        },800)
        
        let commentlist = res.data;
        if (res.data.length < 5) {
          that.setData({
            concat: false
          })
        } else {
          that.setData({
            concat: true
          })
        }
        for (let i = 0; i < commentlist.length; i++) {
          commentlist[i].StartTime = commentlist[i].StartTime.split("T")[0];
          commentlist[i].EndTime = commentlist[i].EndTime.split("T")[0];
          commentlist[i].Logo = app.ImgPathChange(commentlist[i].Logo, 3);
          commentlist[i].DiscussStatetext = that.commentstatus(commentlist[i].DiscussState);
        }
        that.setData({
          commentlist: that.data.commentlist.concat(commentlist) 
        })
      }
    }
  })
},

gotonext:function(e){
  let commentID = e.currentTarget.dataset.commentid;
  let discussstate = e.currentTarget.dataset.discussstate;
  let orderid = e.currentTarget.dataset.orderid;
  let index = e.currentTarget.dataset.index;

  let data = {
    orderprologo: this.data.commentlist[index].Logo,
    orderproname: this.data.commentlist[index].Name,
    orderstart: this.data.commentlist[index].StartTime,
    orderend: this.data.commentlist[index].EndTime,
    orderpay: this.data.commentlist[index].PayTotal,
    productid: this.data.commentlist[index].ProductID
  }
  app.globalData.orderInfor = data;

  if (commentID == 0 && discussstate==0){//待评论状态
    wx.navigateTo({
      url: '/pages/createcomment/createcomment?OrderID=' + orderid,
    })
  }else{//已评论
    wx.navigateTo({
      url: '/pages/commentdetail/commentdetail?commentID=' + commentID,
    })
  }
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
    if (this.data.concat==false){
      return;
    }
    let PageIndex = this.data.PageIndex+1;
    this.setData({
      PageIndex: PageIndex
    })
    this.getlist();


  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})