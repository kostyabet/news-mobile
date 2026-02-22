import axiosClient from './../api/api';

export const getAllArticles = async() => {
    return axiosClient.get('/articles')
}

export const getArticle = async(id: number) => {
    return axiosClient.get(`/articles/${id}`)
}