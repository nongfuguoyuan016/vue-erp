import request from '@/utils/request'

export function areaData() {
  return request({
    url: '/admin/sys/area/list/data',
    method: 'GET'
  })
}

export function saveArea(params) {
  return request({
    url: '/admin/sys/area/save',
    method: 'POST',
    params
  })
}

export function delArea(id) {
  return request({
    url: '/admin/sys/area/delete',
    method: 'GET',
    params: id
  })
}
