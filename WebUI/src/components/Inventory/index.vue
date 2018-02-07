<template>
  <div class="wrap">
    <div>
      <el-tabs v-model="defaultSo" type="card">
        <el-tab-pane label="LOI" name="first">
          <loi></loi>
        </el-tab-pane>
        <el-tab-pane label="SOI" name="second">
          <soi></soi>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import loi from './loi'
import soi from './soi'
export default {
  data () {
    return {
      defaultSo: 'first'
    }
  },
  components: {
    loi,
    soi
  }
}
</script>