// pages/chosedate/chosedate.js
let app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    calendardata: [],
    checkstatus: 1, //1入住，2退房
    startdate: "入住日期",
    diffday:"?",
    enddate: "退房日期"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.dateData()
  },
  datetap: function(event) { //日历点击事件
    console.log(event);
  },
  dateData: function() { //日历渲染
    let datedata = [];
    let mousecount = 6; //显示几个月份,最少展示两个月
    let date = new Date; //当前时间
    let year = date.getFullYear(); //当前年
    let mouth = date.getMonth() + 1; //当前月份
    let week = date.getDay(); //当前周几
    let day = date.getDate(); //当前日期
    let enddate = AddMouth(year + "-" + mouth + '-' + day, mousecount); //开始日期+当前月份算出结束日期
    let endyear = parseInt(enddate.split("-")[0]); //日期结束的年
    let endmouth = parseInt(enddate.split("-")[1]); //日期结束的月
    let endday = parseInt(enddate.split("-")[2]); //日期结束的日期

    for (let y = year; y < endyear + 1; y++) {
      if (y == year) { //本年份内
        let maxmouth = 0;
        if (year == endyear) {
          maxmouth = endmouth
        } else {
          maxmouth = 12
        }
        for (let m = mouth; m <= maxmouth; m++) {

          let firstweek = datefirstweek(y, m);
          let mouthmodel = {
            year: y,
            mouth: m,
            firstweek: firstweek,
            date: []
          }
          let Mdays = computeMouthday(y, m);
          for (let d = 1; d <= Mdays; d++) {
            let datemodel = {
              day: d,
              state: 1,
              price: "",
              check: "",
              expire: false
            }
            mouthmodel.date.push(datemodel);
          }
          datedata.push(mouthmodel);
        }
      } else if (y == endyear) { //最后年份内
        for (let m = 1; m <= endmouth; m++) {

          let firstweek = datefirstweek(y, m);
          let mouthmodel = {
            year: y,
            mouth: m,
            firstweek: firstweek,
            date: []
          }
          var eMouthdays = computeMouthday(endyear, m);
          for (let d = 1; d <= eMouthdays; d++) {
            let datemodel = {
              day: d,
              state: 1,
              price: "",
              check: "",
              expire: false
            }
            mouthmodel.date.push(datemodel);
          }
          datedata.push(mouthmodel);
        }
      } else { //中间区间
        for (let m = 1; m <= 12; m++) {
          let firstweek = datefirstweek(y, m);
          let mouthmodel = {
            year: y,
            mouth: m,
            firstweek: firstweekm,
            date: []
          }
          var cMouthdays = computeMouthday(y, m);
          for (let d = 1; d <= cMouthdays; d++) {
            let datemodel = {
              day: d,
              state: 1,
              price: "",
              check: "",
              expire: false
            }
            mouthmodel.date.push(datemodel);
          }
          datedata.push(mouthmodel);
        }
      }
    }

    //获取指定年月一号的周信息
    function datefirstweek(year, mouth) {
      if (mouth < 10) {
        mouth = "0" + mouth
      }
      var dateinfor = year + "-" + mouth + "-01"
      var date = new Date(dateinfor).getDay();
      return date;
    }

    function computeMouthday(year, mouth) { //根据年份月份返回此月天数
      if (mouth == 1 || mouth == 3 || mouth == 5 || mouth == 7 || mouth == 8 || mouth == 10 || mouth == 12) {
        return 31;
      } else if (mouth == 4 || mouth == 6 || mouth == 9 || mouth == 11) {
        return 30;
      } else if (mouth == 2) {
        if (leapYear(year)) {
          return 29;
        } else {
          return 28;
        }
      }
    }

    function leapYear(Year) { //判断是否闰年 
      if (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0)) {
        return (true);
      } else {
        return (false);
      }
    }

    function AddMouth(date, num) { //指定日期加月份数，返回日期
      let mouthnum = parseInt(num) - 1;
      if (mouthnum == 0) {
        mouthnum = 1;
      }
      let year = parseInt(date.split('-')[0]);
      let mouth = parseInt(date.split('-')[1]);
      let day = parseInt(date.split('-')[2]);
      let mouthcount = mouth + mouthnum;
      if (mouthcount > 12) {
        let addyear = Math.floor(mouthcount / 12); //增加的年数
        let leaveMouth = parseInt(mouthcount % 12);
        var newyear = year + addyear;
        var newmouth = leaveMouth;
        var newday = day;
      } else {
        var newyear = year
        var newmouth = mouth + mouthnum;
        var newday = day;
      }
      var newdate = newyear + "-" + newmouth + "-" + newday;
      return newdate;
    }
    //   year mouth day
    for (let y = 0; y < datedata.length; y++) {
      if (datedata[y].year == year) {
        if (datedata[y].mouth == mouth) {
          for (let d = 0; d < datedata[y].date.length; d++) {
            if (datedata[y].date[d].day < day) {
              datedata[y].date[d].expire = true;
            }
          }
        }
      }
    }
    this.setData({
      calendardata: datedata
    })
  },
  choosedate: function(event) {
    let expire = event.currentTarget.dataset.expire;
    if (expire) {
      return;
    }
    let datestr = event.currentTarget.dataset.date;
    let date = datestr.split("-");
    let year = date[0];
    let mouth = date[1];
    let day = date[2];
    var datedata = this.data.calendardata;
    for (let i = 0; i < datedata.length; i++) {
      if (datedata[i].year == year && datedata[i].mouth == mouth) {
        for (let s = 0; s < datedata[i].date.length; s++) {
          if (datedata[i].date[s].day == day) {
            let Odate = datedata[i].date[s];
            if (this.data.checkstatus == 1) { //点击后入住状态
              this.cleardatecheck();
              Odate.check = 1;
              this.setData({
                checkstatus: 2,
                startdate: datestr
              })
            } else if (this.data.checkstatus == 2) { //点击后退房状态
              var diffday = this.getDays(this.data.startdate, datestr);
              if (diffday < 1) {
                this.cleardatecheck();
                Odate.check = 1;
                this.setData({
                  checkstatus: 2,
                  startdate: datestr
                })
              } else { 
                //中间区域加样式checkstatus=3 
               let datearr=this.addcheckcenter(this.data.startdate, datestr);
               console.log(datearr);
               for (let x = 0; x < datearr.length;x++){
                 let cy = parseInt(datearr[x].split("-")[0]);
                 let cm = parseInt(datearr[x].split("-")[1]);
                 let cd = parseInt(datearr[x].split("-")[2]);
                for (let f = 0; f < datedata.length;f++){
                  if (datedata[f].year == cy && datedata[f].mouth == cm ){
                    for (let m = 0; m < datedata[f].date.length;m++){
                      if(datedata[f].date[m].day==cd){
                        datedata[f].date[m].check=3;
                      }
                    }
                  }
                }
               }
                Odate.check = 2;
                this.setData({
                  checkstatus: 1,
                  enddate: datestr,
                  diffday: diffday
                })
              }
            }
            this.setData({
              calendardata: datedata
            })
          }
        };
      }
    }
  },
  //去除标记
  cleardatecheck: function() {
    let datedata = this.data.calendardata;
    for (let a = 0; a < datedata.length; a++) {
      for (let b = 0; b < datedata[a].date.length; b++) {
        datedata[a].date[b].check = ""
      }
    }
    this.setData({
      calendardata: datedata,
      startdate: "入住日期",
      diffday: "?",
      enddate: "退房日期"
    })
  },
  //计算两个日期间隔
  getDays: function(date1, date2) {
    var date1Str = date1.split("-"); //将日期字符串分隔为数组,数组元素分别为年.月.日
    //根据年 . 月 . 日的值创建Date对象
    var date1Obj = new Date(date1Str[0], (date1Str[1] - 1), date1Str[2]);
    var date2Str = date2.split("-");
    var date2Obj = new Date(date2Str[0], (date2Str[1] - 1), date2Str[2]);
    var t1 = date1Obj.getTime();
    var t2 = date2Obj.getTime();
    var dateTime = 1000 * 60 * 60 * 24; //每一天的毫秒数
    var minusDays = Math.floor(((t2 - t1) / dateTime)); //计算出两个日期的天数差
    var days = Math.abs(minusDays); //取绝对值
    //return days; 返回整数
    return minusDays;
  },
  addcheckcenter:function(startdate,enddate){//计算两个日期的间隔日期，返回间隔日期数组
    function dateAdd(startDate) {//日期加一天

      //改变日期格式 兼容IOS
      startDate = startDate.replace(/-/g, "/");
      console.log(startDate);
      startDate = new Date(startDate);
      console.log(startDate);
      startDate = +startDate + 1000 * 60 * 60 * 24;
      startDate = new Date(startDate);
      var nextStartDate = startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" +                     startDate.getDate();
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
            var month = startTime.getMonth().toString().length === 1 ? "0" + (parseInt(startTime.getMonth().toString(),10) + 1) : (startTime.getMonth() + 1);
            var day = startTime.getDate().toString().length === 1 ? "0" + startTime.getDate() : startTime.getDate();
            dateArr.push(year + "-" + month + "-" + day);
            startTime.setDate(startTime.getDate() + 1);
        }
        return dateArr;
  },
  alertmsg:function(msg){
    wx.showModal({
      title: '',
      content: msg,
      showCancel: false, //不显示取消按钮
      confirmText: '确定'
    })
  },
  getDate:function(){
    let startdate=this.data.startdate;
    let diffday=this.data.diffday;
    let enddate=this.data.enddate;
    if (startdate == "入住日期" || enddate == "退房日期"){
      this.alertmsg("请选择入住,退房日期")
      return;
    }
    let chosedate={}
    chosedate.startdate = this.data.startdate;
    chosedate.enddate = this.data.enddate;
    chosedate.diffday = this.data.diffday;
    app.globalData.chosedate=chosedate;
    if (app.globalData.prevpath == undefined || app.globalData.prevpath == ""){
      wx.switchTab({
        url: '../index/index',
      })
    }else{
      wx.redirectTo({
        url:"/"+app.globalData.prevpath
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})