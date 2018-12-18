// component/score/score.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scoreswitch:{//改变积分开关
      type: Boolean, 
      value: false      
    },
    score:{//默认积分
      type: Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    totalscore:5,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    scorefun:function(e){
      if (!this.data.scoreswitch){
        return;
      }
      let score = e.currentTarget.dataset.score;
      this.setData({
        score: score+1
      })
      let that= this;
      let tofatherdata={
        score: score + 1
      }
      this.triggerEvent("myevent", tofatherdata);
    }
  }
})
