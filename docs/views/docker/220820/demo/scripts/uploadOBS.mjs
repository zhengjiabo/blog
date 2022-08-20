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

/* 自定义配置，使用文件的 ctime 和 size */
const getuUnique = stats => encodeURI(`${stats.ctimeMs}-${stats.size}`)

// 判断文件 (Object)是否在 OBS 中存在
// 对于带有 hash 的文件而言，如果存在该文件名，则在 OBS 中存在
// 对于不带有 hash 的文件而言，可对该 Object 设置一个 X-OBS-META-MTIME 或者 X-OBS-META-HASH 每次对比来判断该文件是否存在更改，本函数跳过
// 如果再严谨点，将会继续对比 header 之类
async function isExistObject ({entry, Key, withHash}) {
  try {
    const res = await client.getObjectMetadata({
			Bucket,
			Key
		})
    if(res.CommonMsg.Status === 404) {
      return false
    }

    // 存在的情况下 判断文件的 元数据-自定义响应头
    const {Metadata = {}} = res.InterfaceResult
    const {filetoken = ''} = Metadata
    return filetoken === getuUnique(entry.stats)

  } catch (e) {
    return false
  }
}

// entry: 文件信息
// withHash: 该文件名是否携带 hash 值
async function uploadFile ({entry, withHash = false}) {
  let Key = entry.path.replace(/\\/g, '/') // 兼容windows
  if(withHash) {
    Key = `static/${Key}`
  }
  const file = resolve('./build', Key)
  // 如果路径名称不带有 hash 值，则直接重新上传 -> 此处可优化
  const exist = await isExistObject({entry, Key, withHash})
  // const exist = withHash ? await isExistObject(Key) : false
  if (!exist) {
    const CacheControl = withHash ? 'max-age=31536000' : 'no-cache'
    // 为了加速传输速度，这里使用 stream
    try {
      
      /* 上传对象 */
      let res = await client.putObject({
        Bucket,
        Key,
        // 创建文件流，其中localfile为待上传的本地文件路径，需要指定到具体的文件名
        Body: createReadStream(file),
      })
      
      if(res.CommonMsg.Status !== 200) {
        throw res
      }

      /* 设置对象元数据 */
      const Metadata = {
        fileToken: getuUnique(entry.stats)
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
    // uploadFile(entry.path) entry.stats.mtime
  }
  // 上传携带 hash 的文件
  for await (const entry of readdirp('./build/static', { type: 'files', alwaysStat: true  })) {
    
    queue.add(() => uploadFile({entry, withHash:true}))
    // uploadFile(`static/${entry.path}`, true)
  }
}

main().catch(e => {
  console.error(e)
  client.close()
  process.exitCode = 1
})
