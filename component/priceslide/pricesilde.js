// component/priceslide/pricesilde.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */

  //horizontal 横向滚动 none 禁止拖动

  data: {
    leftx: 0,
    rightx:"不限",
    left:0,
    right:"",
    width:"",
    leftcliebtx:"",
    rightcliebtx:""
  },

  /**
   * 组件的方法列表
   */
  ready: function () {
    var res = wx.getSystemInfoSync();
    this.setData({
      width: res.windowWidth - 20,
      right: res.windowWidth - 20
    })
  },
  methods: {
    lefttap: function (event) {//左侧滑动结束后
      var leftcliebtx = event.changedTouches["0"].clientX;
      if (this.data.rightx - this.data.leftx<0){
        this.setData({
          left: this.data.rightcliebtx-50
        })
      }
    },
    righttap: function (event) {//右侧滑动结束后
      var rightcliebtx = event.changedTouches["0"].clientX;
      if (this.data.rightx - this.data.leftx < 0) {
        this.setData({
          right: this.data.leftcliebtx + 20
        })
      }


    },
    lefttapmove: function (event) {
      var leftcliebtx = event.changedTouches["0"].clientX;
      this.setData({
        leftcliebtx: leftcliebtx
      })
      console.log(this.data.leftcliebtx);
      if (leftcliebtx <= 0) {
        leftcliebtx = 0
      }
      leftcliebtx = Math.floor(leftcliebtx / this.data.width * 1000);
      this.setData({
        leftx: leftcliebtx
      })
    },
    righttapmove: function (event) {
      var rightcliebtx = event.changedTouches["0"].clientX;
      this.setData({
        rightcliebtx: rightcliebtx
      })
      if (rightcliebtx >= this.data.width) {
        rightcliebtx = this.data.width
      }
      rightcliebtx = Math.floor(rightcliebtx / this.data.width * 1000);
      if (rightcliebtx == 1000) {
        rightcliebtx = "不限"
      }
      this.setData({
        rightx: rightcliebtx
      })
    }
  }
})
