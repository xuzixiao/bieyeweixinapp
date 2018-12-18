// pages/detail/detail.js
import Util from "../../component/util.js"
let app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      SystemInfo:"",
      detailid:"",
      detaildata:{},
      detailBan:[],
      current:1,
      Facilities:{}, //设施
      FreeService:{},//服务
      Superiority: "",//别墅简介
      Special:"",//房屋详情
      check_prompt:"",//入住须知
      service_charge:"",//服务费用
      warmthtips:"",//温馨提示
      map:{
        latitude:39.908288, 
        longitude: 116.397400,
        desc:"",
        markers: [{
          id: 1,
          latitude: 39.908288,
          longitude: 116.397400,
          name: '别墅地址'
        }]
      },
      Startdate:"选择日期",
      Enddate:"选择日期"
  },
  swiperChange:function(e){
    let current =parseInt(e.detail.current)+1;
    this.setData({
      current:current
    })
  },
  golocation:function(){
    
    wx.openLocation({
      latitude: this.data.map.latitude,
      longitude: this.data.map.longitude,
      name: this.data.map.desc,
      scale: 28
    })  

  },
  //拆解banner数据
  changebannersrc: function (data) {
    for (let i = 0; i < data.length; i++) {
      let zipbanner = app.ImgPathChange(data[i].img_url, 3);
      data[i].banner = zipbanner;
    }
    this.setData({
      detailBan:data
    })
  },
  //拆解别墅设施，服务字段
  facility:function(data){
    let facilitarr=[];
    let Facilities= this.data.detaildata.Product.Facilities.split(",");// 别墅设施
    let FreeService = this.data.detaildata.Product.FreeService.split(",");//别墅服务
    let Superiority = this.data.detaildata.Product.Superiority;//别墅简介
    let Special = this.data.detaildata.Product.Special;//房屋详情
    let check_prompt = this.data.detaildata.Product.check_prompt//入住须知
    if (check_prompt!=""){//入住须知

      let newcheck_prompt = this.delHtmlTag(check_prompt);
      // console.log(newstrdelhtmltag);
      // let newcheck_prompt = [];//入住须知data
      // check_prompt = check_prompt.split("</p><p><br></p><p>");
      // for (let a = 0; a < check_prompt.length;a++){
      //   let newstr = this.delHtmlTag(check_prompt[a]);
      //   newstr=newstr.split("：")[1];
      //   newcheck_prompt.push(newstr)
      // }
      this.setData({
        check_prompt: newcheck_prompt
      })
    }

    if (Superiority != "") {//别墅简介
      Superiority = this.delHtmlTag(Superiority);
      this.setData({
        Superiority: Superiority
      })
    }
    
    if (Special != "") {//房屋详情
      Special = this.delHtmlTag(Special);
      this.setData({
        Special: Special
      })
    }

    if (Facilities.length != 0) {//别墅设施
      for (let i = 0; i < Facilities.length;i++){
        let iconarr={};
        iconarr.class = Facilities[i].split("|")[0];
        iconarr.name = Facilities[i].split("|")[1];
        facilitarr.push(iconarr);
      }
      this.setData({
        Facilities: facilitarr
      })
    }

    if (FreeService.length != 0) {//别墅服务
      this.setData({
        FreeService: FreeService
      })
    }
    //服务费用
    let service_charge = this.data.detaildata.Product.service_charge;
    if (service_charge!=""){
      let servicearr = service_charge.split("</p><p><br></p><p>");
      let serverlist=[];
      for (let s = 0; s < servicearr.length; s++) {
        let serverstr = this.delHtmlTag(servicearr[s]);
        serverlist.push(serverstr);
      }
      this.setData({
        service_charge:serverlist
      })
    }
    //温馨提示
    let Content = this.data.detaildata.Product.Content;
    if (Content!=""){
      Content = this.delHtmlTag(Content);
      this.setData({
        warmthtips: Content
      })
    }
    //房屋位置数据
    let mapLongitude = this.data.detaildata.Product.Longitude*1;
    let mapLatitude = this.data.detaildata.Product.Latitude*1;
    let mapDesc = this.data.detaildata.Product.Desc;
    this.setData({
      'map.longitude': mapLongitude,
      'map.latitude': mapLatitude,
      'map.desc': mapDesc,
      'map.markers[0].name': mapDesc,
      'map.markers[0].longitude': mapLongitude,
      'map.markers[0].latitude': mapLatitude
    })
  },
  //去除html标签
  delHtmlTag:function(str){
    let newstr=str.replace(/<[^>]+>/g, "");//去掉所有的html标记
    return newstr.replace(/&nbsp;/ig, "");
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      detailid: options.detail,
    })
     var that=this;
     wx.request({
       url: 'https://wxapp.bie-ye.com/api/Villa',
       data:{
         VillaId: that.data.detailid
       },
       method:"GET",
       success:function(res){
         that.setData({
           detaildata: res.data
         })
         //独立改变banner图片尺寸
         that.changebannersrc(that.data.detaildata.ImgList);
         //处理别墅详情字段
         that.facility()
       }
     })
  },
  imageLoad:function(e){
    let originalWidth = e.detail.width;
    let originalHeight = e.detail.height;
    let imageWidth = this.data.SystemInfo.screenWidth;
    let imageSize = Util.imageZoomHeightUtil(originalWidth, originalHeight);
    this.setData({ imageWidth: imageSize.imageWidth, imageHeight: imageSize.imageHeight });    

  },
  //立即预定
  placeOrder:function(){
    let villaid = this.data.detailid;
    wx.navigateTo({
      url: '../../pages/ordercreat/ordercreat?villaid='+villaid
    })
  },

  getruzhudate:function(){
    let villaid = this.data.detaildata.Product.ProductID;
    wx.navigateTo({
      url: '/pages/date/date?villaid=' + villaid
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
    if (typeof (app.globalData.chosedate) == "undefined" || JSON.stringify(app.globalData.chosedate) == "{}"){
      return;
    }
    this.setData({
      Startdate: app.globalData.chosedate.startdate,
      Enddate: app.globalData.chosedate.enddate
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