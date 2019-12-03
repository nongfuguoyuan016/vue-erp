import request from '@/utils/request'

export function roleData() {
  return request({
    url: '/admin/sys/role/list/data',
    method: 'GET'
  })
}

export function saveRole(params) {
  return request({
    url: '/admin/sys/menu/save',
    method: 'POST',
    params
  })
}

export function delRole(id) {
  return request({
    url: '/admin/sys/menu/delete',
    method: 'GET',
    params: id
  })
}
