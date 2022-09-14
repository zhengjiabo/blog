<template>
  <iframe ref="iframe" :src="src" class="iframe"></iframe>
</template>

<script>

export default {
  data(){
    return {
      src: ''
    }
  },
  created() {
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.iframe.onload = () => {
        const document = this.$refs.iframe.contentDocument
        const script = document.createElement('script')

        script.innerHTML = `
        var audio = document.querySelector('audio');
        audio.controls = true;
        audio.onerror = function () {
          var typeArr = ['mp3', 'm4a', 'mp4', 'mkv']; 
          var oldType = this.src.replace(location.href.replace(/html$/, ''), ''); 
          var index = typeArr.indexOf(oldType); 
          index = ~index? index + 1: index; 
          var type = typeArr[index]; 
          this.src = location.href.replace(/htm(l)?$/, type)
        };
        audio.src = location.href.replace(/htm(l)?$/, 'mp3');
        audio.style = 'position: fixed;top:6px;left:0;z-index: 10000;width: 100%';`


        document.body.append(script)
      };
      this.src = ( process.env.NODE_ENV === 'production'? '' : location.origin.replace(location.port, '2333'))+ decodeURIComponent(this.$route.query.url)
    })
  },
  methods: {
    
  }
}
</script>
<style>
body {
  margin: 0;
}
body, #__nuxt {
  overflow: hidden;
}
.__layout {
  height: 100vh;
  overflow: auto;
}
.iframe {
  width: 100%;
  height: 100vh;
}
</style>
