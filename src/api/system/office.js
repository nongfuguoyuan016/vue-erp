import request from '@/utils/request'

export function officeData() {
  return request({
    url: '/admin/sys/office/list/data',
    method: 'GET'
  })
}

export function saveOffice(params) {
  return request({
    url: '/admin/sys/office/save',
    method: 'POST',
    params
  })
}

export function delOffice(id) {
  return request({
    url: '/admin/sys/office/delete',
    method: 'GET',
    params: id
  })
}
