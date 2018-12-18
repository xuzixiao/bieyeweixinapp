// pages/comment/comment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     showcomment:false,
     ProductID:"",
     PageIndex:1,
     commentlist:{},
     plbigimg:[],
     concat:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.ProductID==undefined){
      return;
    }
    this.setData({
      ProductID: options.ProductID
    })
    let that=this;
    wx.request({
      url: 'https://wxapp.bie-ye.com/api/Villa',
      data:{
        ProductID: that.data.ProductID,
        PageIndex: that.data.PageIndex
      },
      success:function(res){
        let commentlist=res.data;
        if(res.data.length<5){
          that.setData({
            concat: false
          })
        }else{
          that.setData({
            concat: true
          })
        }
        for (let i = 0; i < commentlist.length;i++){
          commentlist[i].CreateDate = commentlist[i].CreateDate.split("T")[0]
          commentlist[i].Imgs = commentlist[i].Imgs.substring(0, commentlist[i].Imgs.length-1).split(",");
        }
          that.setData({
            commentlist: commentlist
          })
      }
    })
  },
getcommentlist:function(){//追加评论
  let that = this;
  wx.request({
    url: 'https://wxapp.bie-ye.com/api/Villa',
    data: {
      ProductID: that.data.ProductID,
      PageIndex: that.data.PageIndex
    },
    success: function (res) {
      let commentlist = res.data;
      if (res.data.length < 5) {
        that.setData({
          concat: false
        })
      }else{
        that.setData({
          concat: true
        })
      }
      for (let i = 0; i < commentlist.length; i++) {
        commentlist[i].CreateDate = commentlist[i].CreateDate.split("T")[0]
        commentlist[i].Imgs = commentlist[i].Imgs.substring(0, commentlist[i].Imgs.length - 1).split(",");
      }
      //追加数据
      that.setData({
        commentlist: that.data.commentlist.concat(commentlist)
      })
      
    }
  })

},
  showbigimg:function(e){
    let plimg = e.currentTarget.dataset.imgarr;
    let index = e.currentTarget.dataset.index;
    this.setData({
      plbigimg: plimg
    })
  },
  closebigimg:function(){
   this.setData({
     plbigimg:[]
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
    if (this.data.concat){
      let PageIndex = this.data.PageIndex+1;
      this.setData({
        PageIndex: PageIndex
      })
      this.getcommentlist();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})