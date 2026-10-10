const DEFAULT_DELAY = 500

function getDelay(binding) {
  const delay = Number(binding.arg)
  return delay > 0 ? delay : DEFAULT_DELAY
}

function updateOptions(el, binding, vnode) {
  el.__debounceHandler__ = binding.value
  el.__debounceContext__ = vnode.context
  el.__debounceDelay__ = getDelay(binding)
}

function runHandler(el, event) {
  const handler = el.__debounceHandler__
  if (typeof handler === 'function') {
    handler.call(el.__debounceContext__, event)
  }
}

const debounce = {
  install (Vue) {
    Vue.directive('debounce', {
      bind (el, binding, vnode) {
        updateOptions(el, binding, vnode)
        el.__debounceClick__ = function(event) {
          window.clearTimeout(el.__debounceTimer__)
          el.__debounceTimer__ = window.setTimeout(() => {
            runHandler(el, event)
            el.__debounceTimer__ = null
          }, el.__debounceDelay__)
        }
        el.addEventListener('click', el.__debounceClick__)
      },
      update (el, binding, vnode) {
        updateOptions(el, binding, vnode)
      },
      unbind (el) {
        window.clearTimeout(el.__debounceTimer__)
        el.removeEventListener('click', el.__debounceClick__)
        delete el.__debounceClick__
        delete el.__debounceTimer__
        delete el.__debounceHandler__
        delete el.__debounceContext__
        delete el.__debounceDelay__
      }
    })
  }
}

export default debounce
