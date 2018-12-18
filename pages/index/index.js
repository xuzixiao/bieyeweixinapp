//获取应用实例
const app = getApp()
Page({
  data: {
    motto: '去别野，换生活!',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    txmapapi: "ISJBZ-DKARG-GQPQD-IEOSI-IP3G7-URBL2",
    banner: {
      mode: "scaleToFill",
      imgsrc: [
        "/static/images/banner_1.jpg",
        "/static/images/banner_2.jpg",
        "/static/images/banner_3.jpg"
      ],
      indicatorDots: true,
      autoplay: true,
      interval: 6000,
      duration: 800,
      indicatorColor: "rgba(0,0,0,0.5)",
      indicatorActiveColor: "rgba(245,68,73,0.8)",
      MainCity:[]
    },
    cityInfo:{
      cityname: "北京",
      partitionid: ""
    },
    chosedate:{},
    addressdata: "",
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  address: function () {
    wx.navigateTo({
      url: '../address/address'
    })
  },
  choosedate: function () {
    wx.navigateTo({
      url: '../chosedate/chosedate'
    })
  },
  gosearch: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  getLocation: function () {
    //获取经纬度
    var page = this
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var longitude = res.longitude
        var latitude = res.latitude
        page.loadCity(longitude, latitude)
      },
      cancel: function (res) {
        console.log('用户拒绝授权获取地理位置');
      }
    })
  },
  loadCity: function (latitude, longitude) {//根据经纬度获取城市
    var getAddressUrl = "https://apis.map.qq.com/ws/geocoder/v1/?location=" + longitude + "," + latitude + "&key=" + this.data.txmapapi + "&get_poi=1";
    var that = this;
    wx.request({
      url: getAddressUrl,
      method: 'get',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res);
        let city = res.data.result.address_component.city;
        that.setData({
          'cityInfo.cityname': city
        })
        let citymain = that.data.MainCity;
        for (let i = 0; i < citymain.length;i++){
          if (citymain[i].CityName == city){
            //如果当前定位在15个城市内，则填入。
            let partitionid=citymain[i].PartitionID;
            app.globalData.city =city;
            app.globalData.partitionid = partitionid;
          }
        }
      }
    })
  },
//主营城市跳转
  gotocitysearch:function(event){
    let partitionid=event.currentTarget.dataset.partitionid;
    let city = event.currentTarget.dataset.cityname;
    app.globalData.city=city;
    app.globalData.partitionid = partitionid;
    app.globalData.chosedate={};
    wx.navigateTo({
      url: '../search/search'
    })
  },
  onLoad: function () {
  let that=this;
//获取15个城市
  wx.request({
    url: 'https://wxapp.bie-ye.com/api/Values',
    header:{
     'content-type':'application/json'
    },
    success:function(res){
      //let resdata = that.changeimgsrc(res.data);
      let resdata =res.data;
      
      that.setData({
        MainCity: resdata
      })
    }
  })
  },
  changeimgsrc: function (data) {
    for (let i = 0; i < data.length; i++) {
      let zipImgUrl = app.ImgPathChange(data[i].ImgUrl, 4);
      data[i].zipImgUrl = zipImgUrl;
    }
    return data;
  },
  onShow: function () {
    let city = app.globalData.city;
    let chosedate = app.globalData.chosedate;
   // console.log(chosedate);
    let partitionid = app.globalData.partitionid;
    if (city == undefined || city == "") {
      city = "";
    }
    if (chosedate == undefined || chosedate == "") {
      chosedate = "";
    }else{
      this.setData({
        chosedate:chosedate
      })
    }
    if (partitionid == undefined || partitionid == "") {
      partitionid = "";
    }

    this.setData({
      'cityInfo.cityname': city,
      'cityInfo.partitionid': partitionid
    })
  },
  getUserInfo: function (e) {
    //console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
