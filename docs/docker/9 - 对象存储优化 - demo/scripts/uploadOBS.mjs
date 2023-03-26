import OBS from 'esdk-obs-nodejs'
import { createReadStream } from 'fs'
import { resolve } from 'path'
import readdirp from 'readdirp' // fs.readdir 的递归版本
import PQueue from 'p-queue' // 并发控制


const queue = new PQueue({ concurrency: 10 }) // 线程池 10

const client = new OBS({
  access_key_id: process.env.ACCESS_KEY_ID,
  secret_access_key: process.env.ACCESS_KEY_SECRET,
  server : 'https://obs.cn-east-2.myhuaweicloud.com'
})

const Bucket = 'fireflymoon-blog'

/* 自定义文件标记，使用文件的 ctime 和 size */
const getHash = stats => encodeURI(`${stats.ctimeMs}-${stats.size}`)

/**
 * 判断文件 (Object)是否在 OBS 中存在
 * 文件不在 OBS 直接返回 false
 * 对于 hash，如果存在 OBS 中，直接返回 true
 * 对于非 hash，比对唯一标志（mtime，size）
 */
async function isExistObject ({entry, Key, withHash}) {
  try {
    const res = await client.getObjectMetadata({
			Bucket,
			Key
		})
    if(res.CommonMsg.Status === 404) { // 文件不存在
      return false
    }

    if (withHash) { // hash 提前返回
      return true
    }

    // 非 hash 存在的情况下 判断文件的 元数据-自定义响应头
    const {Metadata = {}} = res.InterfaceResult
    const {hash = ''} = Metadata
    return hash === getHash(entry.stats)

  } catch (e) {
    return false
  }
}

/**
 * 上传文件，设置对应缓存策略
 * @param {String} objectName  文件路径
 * @param {Boolean} withHash  该文件名是否携带 hash 值
 */
async function uploadFile ({entry, withHash = false}) {
  let Key = entry.path.replace(/\\/g, '/') // 兼容windows
  if(withHash) {
    Key = `static/${Key}`
  }
  const file = resolve('./build', Key)
  // 判断文件是否存在
  const exist = await isExistObject({entry, Key, withHash})
  if (!exist) {
    // 设置缓存策略
    const CacheControl = withHash ? 'max-age=31536000' : 'no-cache'

    try {
      // 为了加速传输速度，这里使用 stream
      /* 上传对象 */
      let res = await client.putObject({
        Bucket,
        Key,
        // 创建文件流，其中 file 为待上传的本地文件路径，需要指定到具体的文件名
        Body: createReadStream(file),
      })
      
      if(res.CommonMsg.Status !== 200) {
        throw res
      }

      /* 设置对象元数据 */
      const Metadata = {
        hash: getHash(entry.stats)
      }
      res = await client.setObjectMetadata({
        Bucket,
        Key,
        MetadataDirective: 'REPLACE_NEW',
        CacheControl,
        Metadata
      })
      
      if(res.CommonMsg.Status !== 200) {
        throw res
      }

      console.log(`Done: ${Key}`)
    } catch(err) {
      console.log(`${err.CommonMsg?.Message}：${Key}`)
    }
  } else {
    // 如果该文件在 OBS 已存在，则跳过该文件 (Object)
    console.log(`Skip: ${Key}`)
  }
}

async function main() {
  // 首先上传不带 hash 的文件
  for await (const entry of readdirp('./build', { depth: 0, type: 'files', alwaysStat: true })) {
    queue.add(() => uploadFile({entry}))
  }
  // 上传携带 hash 的文件
  for await (const entry of readdirp('./build/static', { type: 'files', alwaysStat: true  })) {
    queue.add(() => uploadFile({entry, withHash: true}))
  }
}

main().catch(e => {
  console.error(e)
  client.close()
  process.exitCode = 1
})
