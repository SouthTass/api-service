const { AccessToken } = require('../../models/wx/AccessToken')
const Router = require('koa-router')
const router = new Router({
  prefix: '/wx'
})

// 获取token
router.get('/token/get', async (ctx, next) => {
  let res = await AccessToken.getEffectiveToken()
  if(!res) throw new global.customError.ServiceError('暂无数据')
  ctx.status = 200
  ctx.body = res
})

// 主动刷新token
router.post('/token/refresh', async (ctx, next) => {
  
  let res = await AccessToken.refreshToken()
  if(!res) throw new global.customError.ServiceError()
  ctx.status = 200
  ctx.body = res
})

module.exports = router