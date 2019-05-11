// pages/yshopset/yshopset.js
const app = getApp()
const utils = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopname: '',
    notice: '入手全球尖货，优选品质生活',
    code: '',
    txtwx: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    var timedata = new Date()
    let years = timedata.getFullYear()
    let Month = timedata.getMonth()
    let daty = timedata.getDate()
    //用于审核
    if (years == 2018 && Month == 7 && daty <= 22) {
    that.setData({
      code: 888888
    })
    }
    if (wx.getStorageSync('ruid') != '180201193348295937') {
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetRecommendInvitationCode',
      data: {
        uid: wx.getStorageSync('ruid')
      },
      header: 1,
      successBack: that.showcode
    })
    }
    //签到活动额标识
    console.log(options)
    if (options.type) {
      if (options.type == 'qiandao') {
        that.setData({
          qiandao: options.type
        })
      }
    }
  },
  showcode: function(ret) {
    var that = this
    ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        code: ret.reobj.code
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
  bind1: function(e) {
    this.setData({
      shopname: e.detail.value
    })
  },
  bind2: function(e) {
    this.setData({
      code: e.detail.value
    })
  },
  bind3: function(e) {
    this.setData({
      txtwx: e.detail.value
    })
  },
  bind4: function(e) {
    this.setData({
      notice: e.detail.value
    })
  },
  opens: function(e) {
    var that = this
    if (that.data.shopname == '') {
      app.promsg('店铺名称不能为空')
      return false
    }
    if (that.data.code == '') {
      app.promsg('邀请码不能为空')
      return false
    }
    if (that.data.txtwx == '') {
      app.promsg('微信号不能为空')
      return false
    }
    e && this.setData({
      formid: e.detail.formId
    })
    utils.http({
      url: app.globalData.siteUrl + '/Main/Member/GetCodeUser',
      data: {
        uid: wx.getStorageSync('SessionUserID'),
        code: that.data.code,
        devicetype: 4
      },
      header: 1,
      successBack: that.codecheck
    })
  },
  codecheck: function(ret) {
    var that = this
    var ret = ret.data
    if (ret.status == 1) {
      wx.showModal({
        title: '确认',
        content: '邀请人:' + ret.reobj.referee,
        success: function(res) {
          if (res.confirm) {
            //签到活动才带ruid进注册
            let ruids = ''
            if (that.data.qiandao == "qiandao") {
              ruids = wx.getStorageSync('ruid')
            }
            utils.http({
              method: 'POST',
              url: app.globalData.siteUrl + '/Main/Member/OpenPracticeShop?uid=' + wx.getStorageSync('SessionUserID') + '&devicetype=4',
              data: {
                uid: wx.getStorageSync('SessionUserID'),
                code: that.data.code,
                devicetype: 4,
                shopname: that.data.shopname,
                txtwx: that.data.txtwx,
                ruid: ruids,
                notice: that.data.notice,
                formid: that.data.formid
              },
              header: 1,
              successBack: that.openyshop
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      app.promsg(ret.err)
    }
  },
  openyshop: function(ret) {
    var that = this
    console.log(ret)
    var ret = ret.data
    if (ret.status == 1 && ret.success) {
      //清空别人的开店信息
      wx.setStorageSync('ruid', "")
      wx.setStorageSync('fxshopid', ret.Data.yshopid)
      let shopcouponnum = ret.Data.shopcouponnum ? ret.Data.shopcouponnum : ''
      if (shopcouponnum) {
        wx.setStorage({
          key: 'showShopCoupon',
          data: shopcouponnum,
          success: () => {
            //签到进来开通成功到
            if (that.data.qiandao == 'qiandao') {
              wx.redirectTo({
                url: '../signin/signin'
              })
            } else {
              wx.reLaunch({
                url: '../index/index'
              })
            }
          }
        })
      } else {
        //签到进来开通成功到
        if (that.data.qiandao == 'qiandao') {
          wx.redirectTo({
            url: '../signin/signin'
          })
        } else {
          wx.reLaunch({
            url: '../index/index'
          })
        }
      }

    } else {
      app.promsg(ret.err)
    }
  }
})