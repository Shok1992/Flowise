import axios from 'axios'
import { baseURL } from 'store/constant'

const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
        'Content-type': 'application/json'
    }
})

apiClient.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers['token'] = token
    }

    return config
})

export default apiClient
