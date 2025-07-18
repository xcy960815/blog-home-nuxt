import chalk from 'chalk'
// import { useStorage } from '#imports'

const logger = new Logger({
  fileName: 'login',
  folderName: 'api'
})

/**
 * 登录API
 */
export default defineEventHandler<
  Promise<ICustomResponse<boolean>>
>(async (event) => {
  try {
    // 获取请求体数据
    const body = await readBody<LoginDto.Login>(event)
    if (!body.username || !body.password) {
      return CustomResponse.error('用户名和密码不能为空')
    }
    if (
      body.username === 'admin' &&
      body.password === '123456'
    ) {
      const token = JwtUtils.generateToken({
        userId: '1',
        username: body.username
      })
      // 存放到 redis中
      const redisStorage = useStorage('redis')
      const tokenKey = `user:token:${body.username}`
      redisStorage.setItem(tokenKey, token, {
        ttl: 60 * 60 * 24 * 7 // 设置过期时间为7天，与cookie保持一致
      })
      console.log(
        12345,
        await redisStorage.getItem(tokenKey)
      )

      logger.info(`用户 ${body.username} 登录成功`)
      setCookie(event, JwtUtils.TOKEN_NAME, token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7
      })
      return CustomResponse.success(true)
    } else {
      logger.warn(
        chalk.yellow(
          `用户 ${body.username} 登录失败: 用户名或密码错误`
        )
      )
      return CustomResponse.error('用户名或密码错误')
    }
  } catch (error) {
    const err = error as Error
    logger.error(chalk.red(`登录异常: ${err.message}`))
    return CustomResponse.error('服务器内部错误')
  }
})
