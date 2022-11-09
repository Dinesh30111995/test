import axios from "axios";
import { IAssetData } from "../helpers/types";

export async function createUserSession(address: string, token: string, balance: string, wallet: string): Promise<IAssetData[]> {
  const config = {
    headers: {
      'X-CSRF-TOKEN': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  const resp = await axios.post(`/sessions`, {address: address, balance: balance, wallet: wallet}, config)
    .then((response) => {
      return resp
    })
    .catch(err => {
      console.log("User Session Create Error", err)
    })
  return resp;
}

export async function destroyUserSession(address: string, token: string): Promise<IAssetData[]> {
  const config = {
    data: {},
    headers: {
      'X-CSRF-TOKEN': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
  
  const resp = axios.delete(`/sessions/${address}`, config)
    .then(response => response)
    .catch(err => console.log("Session Error: ", err))

  return resp
}

function getHeader(token: string) {
  return  {
    headers: {
      'X-CSRF-TOKEN': token,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
}

export async function userLike(address: string, collectionId: string, token: string): Promise<IAssetData[]> {
  const resp = axios.post(`/users/like`, {id: address, collection_id: collectionId}, getHeader(token))
    .then((response) => {
      toastr.success('Liked Successfully')
  }).catch((err) => {
      toastr.error('Something went wrong. Please try after sometime')
  })
  return resp
}

export async function userUnlike(address: string, collectionId: string, token: string): Promise<IAssetData[]> {
  const resp = axios.post(`/users/unlike`, {id: address, collection_id: collectionId}, getHeader(token))
    .then((response) => {
      toastr.success('Unliked Successfully')
    }).catch((err) => {
        toastr.error('Something went wrong. Please try after sometime')
    })
  return resp
}

export async function userCommentUnlike(comment_id: string, token: string) {
  return await axios.post(`/comments/unlike`, { comment_id }, getHeader(token))
      .then((response) => {
        toastr.success('Unliked Successfully')
        return true
      }).catch((err) => {
        toastr.error('Something went wrong. Please try after sometime')
        return false
      })
}

export async function userCommentLike(comment_id: string, token: string) {
    return await axios.post(`/comments/like`, { comment_id }, getHeader(token))
      .then((response) => {
        toastr.success('Liked Successfully')
        return true
      }).catch((err) => {
        toastr.error('Something went wrong. Please try after sometime')
        return false
      })
}