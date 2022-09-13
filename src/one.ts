import {defineComponent} from "vue";
import {clone} from "lodash-es";

export default defineComponent({
  name: 'ComponentName',
  setup() {
    console.log(clone)
    return () => 'content'
  }
})

export const res = clone({test: 'test'})
