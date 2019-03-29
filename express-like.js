const http = require('http')

class LikeExpress {
  constructor() {
    // 存放中间件的列表
    this.middlewares = {
      all: [],
      get: [],
      post: []
    }

    this.callback = this.callback.bind(this)
  }

  /**
   * 处理传入的中间件，并返回固定格式的中间件信息
   * @param  {...any} args 
   */
  getMiddlewaresInfo(...args) {
    let middlewareInfo = {}

    if (typeof args[0] === 'string') {
      // 定义了 path 的情况

      const path = args[0] // 取用户定义的 path
      const middlewareFunctionStack = args.slice(1)

      middlewareInfo = {
        path,
        stack: middlewareFunctionStack
      }
      console.log('middlewareInfo: ', middlewareInfo);
    } else {
      // 没定义 path 的情况

      const path = '/'  // 默认的 path 为 '/'
      middlewareInfo = {
        path,
        stack: args
      }
    }

    return middlewareInfo
  }

  /**
   * 类似于 express 的 use 方法，使用 use 注册中间件
   * @param  {...any} args 
   */
  use(...args) {
    const info = this.getMiddlewaresInfo(...args)
    this.middlewares.all.push(info)
  }

  /**
   * 类似于 express 的 get 方法，使用 get 注册中间件
   * @param  {...any} args 
   */
  get(...args) {
    const info = this.getMiddlewaresInfo(...args)
    this.middlewares.get.push(info)
  }

  /**
   * 类似于 express 的 post 方法，使用 post 注册中间件
   * @param  {...any} args 
   */
  post(...args) {
    const info = this.getMiddlewaresInfo(...args)
    this.middlewares.post.push(info)
  }

  /**
   * 获取与 url 相匹配的中间件函数
   * @param {string} method 请求方法
   * @param {string} url 请求 url
   */
  matchMiddlewares(method, url) {
    let middlewareFunctionStack = []

    // 如果客户端请求 favicon，则直接返回一个空数组，无需进行后面的处理
    if (url === '/favicon.ico') {
      return middlewareFunctionStack
    }

    let middlewares = [
      ...this.middlewares.all,
      ...this.middlewares[method]
    ]

    for (let middlewareInfo of middlewares) {
      console.log('middlewareInfo: ', middlewareInfo);
      if (url.indexOf(middlewareInfo.path) === 0) {
        // 假设 url 为 '/api/get'
        // 则 middlewareInfo.path 等于 '/', '/api', '/api/get' 都会匹配到
        middlewareFunctionStack = middlewareFunctionStack.concat(middlewareInfo.stack)
      }
    }

    return middlewareFunctionStack
  }

  // 核心的 next 机制
  handleMiddlewares(req, res, middlewareFunctionStack) {
    let copyStack = [...middlewareFunctionStack]
    console.log('copyStack: ', copyStack);

    const next = () => {
      // 取出 stack 中，第一个中间件函数
      const middleware = copyStack.shift()
      // 如果存在中间件函数，则执行中间件函数
      if (middleware) {
        middleware(req, res, next)
      }
    }
    next()
  }

  callback (req, res) {
    // 类似于 express 中的 res.json() 方法
    res.json = (data) => {
      res.setHeader('Content-type', 'application/json')
      res.end(JSON.stringify(data))
    }

    const url = req.url
    const method = req.method.toLowerCase()

    const matchedMiddlewares = this.matchMiddlewares(method, url)
    this.handleMiddlewares(req, res, matchedMiddlewares)
  }

  /**
   * 启动 server
   * @param  {...any} args 
   */
  listen(...args) {
    const server = http.createServer(this.callback)
    server.listen(...args)
  }
}

module.exports = () => {
  return new LikeExpress()
}