import request from '@/utils/request'

export function menuData() {
  return request({
    url: '/admin/sys/menu/treeData',
    method: 'GET'
  })
}

export function saveMenu(params) {
  return request({
    url: '/admin/sys/menu/save',
    method: 'POST',
    params
  })
}

export function delMenu(id) {
  return request({
    url: '/admin/sys/menu/delete',
    method: 'GET',
    params: id
  })
}
