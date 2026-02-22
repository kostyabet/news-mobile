import axiosClient from './../api/api';

export const getAllArticles = async() => {
    return axiosClient.get('/articles')
}