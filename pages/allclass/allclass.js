// pages/allclass/allclass.js
const app = getApp()
const utils = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  //分类
  classjson: function (ret) {
    var that = this
    console.log(ret)
    ret = ret.data
    if (ret.status == 1 && ret.success) {
      that.setData({
        classdata: ret.Data
      })
    } else {
      app.promsg(ret.err)
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    utils.http({
      url: app.globalData.siteUrl + '/Main/company/GetCompanyProClass',
      data: {
        companyid: '',
        id: Number(wx.getStorageSync('rcompany')),
        isuserpre: false
      },
      successBack: this.classjson
    })
  },
  golist: function (e) {
    var clasid = e.currentTarget.dataset.classid
      wx.navigateTo({
        url: '../prolist/prolist?clasid=' + clasid
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
  gosearch: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  }
})