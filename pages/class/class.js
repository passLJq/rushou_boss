// pages/class/class.js
const app=getApp()
const sharebox = require('../../Component/sharebox/sharebox.js')
const utils = require('../../utils/util.js')
const goTop = require('../../Component/goTop/goTop.js')
const CheckLoginStatus = require("../../utils/CheckLoginStatus.js")
var currpage = 1
var pagesize = 8
var stops = true
var pageType=3 //3是优选推荐，1是佣金，2是全球购
var martop=''//选项距离头部的距离
var companyid ='170823105729085905'//自营店铺id
var savecompanyid //推广接口拿到的companyid
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgurl:'',
    scrollindex:0,
    listdata:[],
    xuanzhong:[true,false,false],
    showshare: [false, true],//分享控制
    userinfo:'',
    zuan:'',//分享中要传的赚多少
    dianstatus: 1, //首页状态1是看自己的，2是看其他人的但自己开店了，3事看其他人但自己没开店的状态，4是没登陆的用户可以没有分享id，一般从商家进来
    classdata:'',
    topok:false,//false时选项不是fixed
    sharpindex:'',//点击打开的商品序号分享用
    sharptye: 1,//哪只方式弹出分享的 1是分享店铺海报，2是分享店铺商品的海报
    wheretype: 1,//分享类型 1=商品 2=店铺
    pageName: "BossClass",//页面名字
    hasGet: '',    // 已领优惠券
    unGet: '',     // 未领优惠券
   },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.rcompany){
      wx.setStorageSync('rcompany', options.rcompany)
    }
    if (options.ruid){
      if (options.ruid != wx.getStorageSync('SessionUserID')){
        wx.setStorageSync('ruid', options.ruid)
      }
    }
    // //scene是二维码进来的,这个页面的二维码只带商家短id
    // var scene = decodeURIComponent(options.scene)
    // if (options.scene) {
      
    //   wx.setStorageSync('rcompany', options.scene)
    // } 
    //scene是二维码进来的
    var scene = decodeURIComponent(options.scene)
    var that = this
    //分享进来判断
    if (options.scene) {
      if (options.scene.length > 1) {
        let aall = []
        aall = scene.split(",")
        console.log(aall)
        //如果分享id等于自己的证明看自己的店
        if (String(aall[1]) !== String(wx.getStorageSync('SessionUserID'))) {
          wx.setStorageSync('ruid', aall[1])
        } else {
          wx.setStorageSync("ruid", '')
        }
        // utils.diz(aall[0], 32, 10, (ret) => {
          wx.setStorageSync('rcompany', aall[0])
        // })
      }else {
        wx.setStorageSync('rcompany', options.scene)
      }

    }
  },
  //分类
  classjson:function(ret){
    var that = this
  console.log(ret)
  ret=ret.data
  if(ret.status==1&&ret.success){
    that.setData({
      classdata: ret.Data
    })
  }else{
    app.promsg(ret.err)
  }
  },
  //列表
  listdata:function(ret){
    var that = this
    var ret = ret.data
    console.log(ret)
    if (ret.status == 1 && ret.success && ret.Data.length>0) {
      var lidata = ret.Data
      if (currpage == 1) {
        that.data.listdata = []
      }
      that.setData({
        listdata: that.data.listdata.concat(lidata)
      })
    } else if (ret.status == 0 && ret.success) {
      if (currpage == 1) {
        that.setData({
          listdata: []
        })
      }
      stops = false
    } else {
      app.promsg(ret.err)
    }
  },
  //切换
  checulis:function(e){
    var that=this
    console.log(e)
    currpage = 1
    stops = true
    var index = e.currentTarget.dataset.index
    var ars
    if(index==0){
     ars=[true,false,false]
     pageType=3
    }else if(index==1){
      ars = [false, true, false]
      pageType = 1
    }else if(index==2){
      ars = [false, false, true]
      pageType = 2
    }
    that.setData({
      xuanzhong: ars
    })
    that.binddata()
  },
  uiscroll:function(ret){
    var that=this
    ret=ret.data
    console.log(ret)
    if (ret.status == 1 && ret.Data != null&&ret.success){
      var data = JSON.parse(ret.Data)
      that.setData({
        imgurl: data
      })
    }else{
      app.promsg(ret.err)
    }
  },
  chang:function(e){
    this.setData({
      scrollindex: e.detail.current
    })
  },
  gosearch:function(){
    wx.navigateTo({
      url: '../search/search'
    })
  },
  goadd:function(e){
    var index = e.target.dataset.index
    var pid = e.target.dataset.pid
    var name = e.target.dataset.name
    var pic = e.target.dataset.pic
    let newListdata = this.data.listdata[index]
    var salePrice = newListdata.isrushbuy && newListdata.rushbuy ? Number(JSON.parse(newListdata.rushbuy.specjson)[0].Price).toFixed(2) : e.target.dataset.saleprice
    var marketPrice = e.target.dataset.marketprice
    wx.navigateTo({
      url: '../addpro/addpro?pid=' + pid + '&name=' + name + '&pic=' + pic + '&salePrice=' + salePrice + '&marketPrice=' + marketPrice+'&index='+index
    })
  },
  //弹出分享框
  goshare: function (e) {
    // wx.hideTabBar()
    // var that=this
    // console.log(e)
    // var index = e.currentTarget.dataset.index
    // that.data.sharpindex=index
    // this.setData({
    //   showshare: [true, true],
    //   zuan: that.data.listdata[index].commPrice.toFixed(2)
    // })

    var that = this
    let typeop = e.currentTarget.dataset.type
    let zuan = ''
    let { sharptye, sharpindex, wheretype} = this.data
    console.log(typeop)
    if (typeop == 'pro') {
      sharpindex = e.currentTarget.dataset.index
      sharptye = 2
      wheretype = 2
      zuan = that.data.listdata[sharpindex].commPrice.toFixed(2)
    } else if (typeop == "dianpu") {
      sharptye = 2
      wheretype = 7
      zuan = ''
    }
    wx.hideTabBar()
    this.setData({
      showshare: [true, true],
      zuan: zuan,
      sharpindex,
      sharptye,
      wheretype
    })
  },
  //关闭分享框
  closeshare: function (index) {
    //1是生成海报时观点弹出框但保留遮罩层
    if (index == 1) {
      this.setData({
        showshare: [true, false]
      })
    } else {
      sharebox.closeshare(this)
      wx.showTabBar()
    }
  },
  //分享到朋友圈生成图片
  sharequan: function (that) {
    var that = this
    sharebox.sharequan(that, that.data.sharptye, this.data.wheretype)
  },
  //保存海报
  savehaibao: function (that) {
    var that = this
    sharebox.savehaibao(that)
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
    //清理缓存后app.js没有赋值了，在这里给赋值
    setTimeout(function () {
      //给rcompany赋予一个默认值如果是空的话，自营的短编号
      if (wx.getStorageSync('rcompany') == '') {
        wx.setStorageSync('rcompany', '17')
      }
    }, 500)
    var that = this
    if (wx.getStorageSync('ruid') != '') {
      if (wx.getStorageSync('fxshopid') != '') {
        that.setData({
          dianstatus: 2,
        })
      } else {
        that.setData({
          dianstatus: 3,
        })
      }
    } else {
      if (wx.getStorageSync('SessionUserID')!=''){
        that.setData({
          dianstatus: 1,
        })
      }else{
        that.setData({
          dianstatus: 4,
        })
      }
    }
    utils.cartCounts({
      callBack: (ret) => {
        if (ret && ret.data.success && ret.data.status == 1 && ret.data.Data != null) {
          if (ret.data.Data > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: ret.data.Data.toString()
            })
          } else {
            wx.removeTabBarBadge({
              index: 2
            })
          }
        }
      }
    })
    var shopids
    //店铺信息分享使用
    if (wx.getStorageSync('SessionUserID') != '' || wx.getStorageSync('ruid')!=''){
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetUserShopJson',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        ruid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: this.usermeng
    })
    }
    //分类
    //rcompany不是空和17的时候 读取其他店铺
    if (wx.getStorageSync('rcompany') != ''&&wx.getStorageSync('rcompany') != 17){
      companyid=''
    }
    utils.http({
      url: app.globalData.siteUrl + '/Main/company/GetCompanyProClass',
      data: {
        companyid: companyid,
        id: Number(wx.getStorageSync('rcompany')),
        isuserpre: false
      },
      successBack: this.classjson
    })
    //店铺信息
    utils.http({
      url: app.globalData.siteUrl + '/Main/company/GetCompanyJson',
      data: {
        companyid: companyid,
        uid: wx.getStorageSync('SessionUserID'),
        id: Number(wx.getStorageSync('rcompany')),
        isuserpre: false
      },
      header: 1,
      successBack: this.companyjson
    })
  },
  companyjson:function(ret){
    console.log(ret)
    var that=this
    ret=ret.data
    if(ret.status==1&&ret.success){
      savecompanyid = ret.Data.companyid
      wx.setNavigationBarTitle({
        title: ret.Data.shopname
      })
      that.setData({
        companyjson:ret.Data
      })
      //列表
      that.binddata()
    }else{
      app.alerts(ret.err)
    }
    console.log(1111)
    this.getComMsg()   // 获取优惠券信息
  },
  usermeng:function (ret) {
    var that = this
    var ret = ret.data
    if (ret.status == 1 && ret.success) {
      var isfreeze = '13456'
      //只有自己看的时候才弹出冻结
      if (wx.getStorageSync('ruid') == '') {
        isfreeze = ret.Data.isfreeze
      }
      that.setData({
        userinfo: ret.Data,
        isfreeze: isfreeze
      })
    } else {
      app.promsg(ret.err)
    }
  },
  binddata:function(){
    var that=this
    //推荐列表
    utils.http({
      url: app.globalData.siteUrl + '/Main/Main/GetProductListJson', data: {
        currpage: currpage,
        pageSize: pagesize,
        companyid: savecompanyid,
        fxshopid: wx.getStorageSync('fxshopid'),
        isuserpre: false,
        userid: wx.getStorageSync('SessionUserID'),
        getVisitorRecord: true
      }, successBack: that.listdata
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
    currpage = 1
    stops = true
    this.onShow()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    if (stops) {
      currpage++
      that.binddata()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var that=this 
    var ruid
    if (wx.getStorageSync('ruid') != '') {
      ruid = wx.getStorageSync('ruid')
    } else {
      ruid = wx.getStorageSync('SessionUserID')
    }
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
      return {
        title: that.data.listdata[that.data.sharpindex].name,
        path: 'pages/productdetail/productdetail?pid=' + that.data.listdata[that.data.sharpindex].pid + '&ruid=' + ruid + '&rcompany=' + wx.getStorageSync('rcompany'),
        imageUrl: that.data.listdata[that.data.sharpindex].pic
      }
    }else{
      return {
        title: that.data.companyjson.shopname,
        path: 'pages/class/class?rcompany=' + wx.getStorageSync('rcompany') + '&ruid=' + ruid
      }
    }
  },
  golist:function(e){
    var clasid = e.currentTarget.dataset.classid
    if (clasid =="more"){
      wx.navigateTo({
        url: '../allclass/allclass'
      })
    }else{
      wx.navigateTo({
        url: '../prolist/prolist?clasid=' + clasid
      })
    }
  },
  //品牌跳转
  golists:function(e){
    var bid = e.currentTarget.dataset.bid
    var value = e.currentTarget.dataset.value
    wx.navigateTo({
      url: '../prolist/prolist?bid=' + bid + '&title=' + value
    })
  },
  onPageScroll: function (e) { // 获取滚动条当前位置
    var that = this
    goTop.onPageScrolls(e, that)
    if (e.scrollTop > (martop - 40)) {
      if (!that.data.topok){
        that.setData({
          topok: true
        })
      }
    } else {
      if (that.data.topok) {
      that.setData({
        topok: false
      })
      }
    }
  },
  goTops: function () {
    goTop.goTops()
  },
    //上架成功改变数据
  addsuccess: function (index) {
    var that = this
    console.log(index)
    var a = "listdata[" + index + "].isup"
    that.setData({
      [a]: 1
    })
  },
  // 跳转商家优惠券列表
  goCompanyCoupon() {
    wx.navigateTo({
      url: '../other/voucher_center/voucher_center?companyid=' + this.data.companyjson.companyid
    })
  },
  // 获取优惠券
  // getCouponMsg() {
  //   // 获取平台券
  //   utils.http({
  //     url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson?devicetype=4',
  //     data: {
  //       uid: wx.getStorageSync('SessionUserID'),
  //       ispaltform: 1
  //     },
  //     header: 1,
  //     successBack: ret => {
  //       if (ret.data.success && ret.data.status == 1) {
  //         var arr = ret.data.Data
  //         this.getComMsg(arr)
  //       } else {
  //         app.promsg(ret.data.err)
  //       }
  //     }
  //   })
  // },
  getComMsg() {
    utils.http({
      url: app.globalData.siteUrl + '/Marketing/Coupon/GetCouponListJson?devicetype=4',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        comid: this.data.companyjson.companyid,
        isrb: 'false',
        ispaltform: 3   // 3是所有
      },
      header: 1,
      successBack: ret => {
        // let data = arr
        let data = ''
        if (ret.data.success && ret.data.status == 1) {
          if (ret.data.Data.length) {
            data = ret.data.Data
          }
        } else {
          app.promsg(ret.data.err)
        }
        let hasGet = []
        let unGet = []
        if (data.length) {
          data.forEach(item => {
            if (item.couponType != 2 && item.couponType != 3) {
              // isover 表示总数领取完了 或领取次数剩余0了 就加入已领取列表
              if (!item.isover && (item.eachamount - item.getnum) > 0) {
                // if (!item.productgroups) {
                //   unGet.push(item)
                // } else if (item.productgroups == this.data.companyjson.companyid) {
                //   unGet.push(item)
                // }
                unGet.push(item)
              } else {
                if (item.isget) {
                  hasGet.push(item)
                }
              }
            }
          })
          if (!hasGet.length) hasGet = ''
          if (!unGet.length) unGet = ''
          this.setData({
            hasGet,
            unGet
          })
        }
      }
    })
  },
  checkLogin(e) {
    CheckLoginStatus.checksession(() => {
      wx.hideLoading()
      var event = e
      this.getCoupon(event)
    })
  },
  // 领取优惠券
  getCoupon(e) {
    utils.http({
      url: app.globalData.siteUrl + '/Marketing/Coupon/ReceiveCoupon?devicetype=4',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        couponid: e.currentTarget.dataset.couponid
      },
      header: 1,
      successBack: (ret) => {
        console.log(ret)
        var idx = e.currentTarget.dataset.index
        if (ret && ret.data.success && ret.data.status == 1) {
          app.showtips("领取成功")
          let { hasGet, unGet } = this.data
          let data = unGet[idx]
          data.getnum += 1
          if ((data.eachamount - data.getnum) <= 0) {
            unGet.splice(idx, 1)
            hasGet.push(data)
          } else {
            unGet[idx] = data
          }
          this.setData({
            hasGet,
            unGet
          })
        } else if (ret.data.status == 5 || ret.data.status == 6) {
          app.promsg(ret.data.err)
          // 总数为零
          let { hasGet, unGet } = this.data
          let data = unGet[idx]
          unGet.splice(idx, 1)
          hasGet.push(data)
          this.setData({
            hasGet,
            unGet
          })
        } else {
          app.promsg(ret.data.err)
        }
      }
    })
  },
})