<template>
  <el-tree
    class="tree"
    :data="data"
    default-expand-all
    :render-content="renderContent"
    @node-click="handleNodeClick">
  </el-tree>

</template>

<script>
import {getTreeData} from '@/script/getTreeData.js'

export default {
  asyncData({ params, error }) {
    return getTreeData('files')
      .then(res => {
        return { data: res}
      })
      .catch(e => {
        error({ statusCode: 404, message: e.message })
      })
  },
  methods: {
    renderContent(h, { node, data, store }){
      const { isDirectory } = data
      const style = {
        whiteSpace: 'break-spaces',
        wordBreak: 'break-all',
        color: '#000',
      }
      
      isDirectory || Object.assign(style, {
        color: '#999',
        textDecorationLine: 'underline'
      })

      const to = {
        path: '/filePreview',
        query: { url: encodeURIComponent(data.value) } 
      }

      return (
          <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
            <span style={style}>
              {isDirectory ? <span>{node.label}</span> : <nuxt-link style={style} to={to} target="_blank">{node.label}</nuxt-link>}
            </span>
          </span>);   
    },
    handleNodeClick(data) {
      // const { isDirectory } = data
      // if(isDirectory) return

      // console.log(data);
    }
  }
}
</script>
<style>
.tree .el-tree-node__content{
  height: auto;
}

</style>
