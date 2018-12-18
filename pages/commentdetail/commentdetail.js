// pages/createcomment/createcomment.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    commentID:"",
    comment:{},
    order:{},
    product:{},
    userInfo: {},
    Token: "",
    OrderID: "",
    productid: "",
    OrderInfor: "",
    wholescore: "",
    facscore: "",
    hyscore: "",
    serscore: "",
    Content: "",
    plimgs: [],
    showplimgs: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.commentID == undefined) {
      return;
    }else{
      wx.getStorage({
        key: 'userinfor',
        success: function (res) {
          wx.getStorage({
            key: 'Token',
            success: function(e) {
              that.setData({
                commentID: options.commentID,
                userInfo: res.data,
                Token:e.data
              })

              wx.request({
                url: 'https://wxapp.bie-ye.com/api/Comment',
                method:"POST",
                data:{
                  "UserID": that.data.userInfo.UserID,
                  "CommentID": that.data.commentID
                },
                header:{
                  "auth":that.data.Token
                },
                success:function(s){
                  if(s.statusCode==200){
                    let comment=s.data.comment;
                    let order = s.data.order;
                    let product = s.data.product;
                    product.orderprologo = app.ImgPathChange(product.Logo,6);
                    order.StartTime = order.StartTime.split("T")[0];
                    order.EndTime = order.EndTime.split("T")[0];
                    comment.Imgs = comment.Imgs.substring(0, comment.Imgs.length-1).split(",");
                    order.DiscussStatetext = app.commentstatus(order.DiscussState);
                    that.setData({
                      comment: comment,
                      order: order,
                      product: product,
                    })
                  }
                }
              })


            },
          })
        }
      })
    }
  },
  wholescore: function (e) {//综合评分
    let score = e.detail.score;
    this.setData({
      wholescore: score
    })
  },
  facscore: function (e) {//设施装修
    let score = e.detail.score;
    this.setData({
      facscore: score
    })
  },

  hyscore: function (e) {//整洁卫生
    let score = e.detail.score;
    this.setData({
      hyscore: score
    })
  },

  serscore: function (e) {//管理服务
    let score = e.detail.score;
    this.setData({
      serscore: score
    })
  },
  //上传图片
  addimages: function () {


  },
  content: function (e) {
    let content = e.detail.value;
    this.setData({
      Content: content
    })
  },
  //提交评论
  submitdiscuss: function () {
    if (this.data.wholescore == "" || this.data.facscore == "" || this.data.hyscore == "" || this.data.serscore == "") {
      wx.showModal({
        content: '请您完善您的评分项后提交评论',
        showCancel: false,
      })
      return;
    }
    if (this.data.Content == "") {
      wx.showModal({
        content: '请填写您的评论内容',
        showCancel: false,
      })
      return;
    }

    let data = {
      "UserID": this.data.userInfo.UserID,
      "Content": this.data.Content,
      "arrImgs": this.data.plimgs,
      "order_id": this.data.OrderID,
      "wholescore": this.data.wholescore,
      "facscore": this.data.facscore,
      "hyscore": this.data.hyscore,
      "serscore": this.data.serscore,
      "productid": this.data.productid
    }
    console.log(data);
    let that = this;
    wx.showLoading({
      title: '提交评论中',
    })
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/UpdateComment',
      method: "PUT",
      data: data,
      header: {
        "auth": that.data.Token
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res);
        if (res.statusCode == 200) {
          wx.showModal({
            content: "评论成功",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.switchTab({
                  url: '/pages/order/order',
                })
              }
            }
          })
        } else {
          wx.showModal({
            content: res.data,
            showCancel: false,
          })
        }

      }
    })
  },
  handleimgs: function () {
    this.setData({
      showplimgs: true
    })
  },
  uploadimages: function () {
    let that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths

        if (tempFilePaths.length == 0) {
          return;
        }

        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.showLoading({
            title: '上传中',
          })
          wx.uploadFile({
            url: 'https://wxapp.bie-ye.com/Home/UplodFile', //仅为示例，非真实的接口地址
            filePath: tempFilePaths[i],
            name: 'file',
            header: {
              "auth": that.data.Token
            },
            success: function (res) {
              if (res.statusCode == 200) {
                var data = JSON.parse(res.data);
                let imgsrc = data.message
                that.setData({
                  plimgs: that.data.plimgs.concat(imgsrc)
                })
              }
            },
            complete: function () {
              wx.hideLoading();
            },
          })

        }
      }
    })
  },
  delthisimg: function (e) {
    let thisindex = e.currentTarget.dataset.indexnum;
    let plimgs = this.data.plimgs;
    plimgs.splice(thisindex, 1);
    this.setData({
      plimgs: plimgs
    })
  },
  closewatch: function () {
    this.setData({
      showplimgs: false
    })
  },
  updatecomment:function(){
    let OrderID = this.data.OrderID;

//组建评论数据
let commentlist={
  CommentID: this.data.comment.CommentID,
  wholescore: this.data.comment.wholescore,
  facscore: this.data.comment.facscore,
  hyscore: this.data.comment.Hygienescore,
  serscore: this.data.comment.serviscore,
  Content: this.data.comment.Content,
  plimgs: this.data.comment.Imgs,
}
    
app.globalData.updatecommentdata = commentlist;
    wx.navigateTo({
      url: '/pages/updatecomment/updatecomment?OrderID=' + OrderID,
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