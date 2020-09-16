import { exit, cwd } from 'process'
import { resolve } from 'path'
import fse from 'fs-extra'
import webpack from 'webpack'

const ROOT = cwd()

// 打包两份，一份 umd，一份 es
// TODO: 暂时不考虑引入 Rollup 或其它方案，es 搁置
;(async () => {
  console.log('[release] empty dest dir')
  await fse.emptyDir(resolve(ROOT, './dist/'))
  await fse.emptyDir(resolve(ROOT, './release/'))

  console.log('[release] start packing')
  webpack([
    {
      mode: 'production',
      entry: resolve(ROOT, './src/index.js'),
      output: {
        path: resolve(ROOT, './dist/cjs/'),
        filename: 'index.js',
        libraryTarget: 'umd',
        library: 'MobiusUtils',
        umdNamedDefine: true
      }
    }
  ], async (err, stats) => {
    if (err) {
      console.error(err)
      exit(1)
    }
    process.stdout.write(stats.toString() + '\n')
    console.log('[release] packing success')

    console.log('[release] start move files')
    await fse.copyFile(resolve(ROOT, './dist/cjs/index.js'), resolve(ROOT, './release/mobius-utils.js'))
    console.log('[release] release files are in place')
  })
})()
