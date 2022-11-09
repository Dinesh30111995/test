import React, { useState, useEffect } from "react";
import { userCommentLike, userCommentUnlike } from "../../api/user"

const Like = (props) => {
    const commentId = props.commentId
    const [liked, setLiked] = useState(props.isUserLiked);
    const getToken =  () => document?.querySelector('[name=csrf-token]')?.content

    const like = async (likeCount: number) => {
        setLiked(await userCommentLike(commentId, getToken()))
        return likeCount + 1
    }

    const unlike = async (likeCount: number) => {
        const status = await userCommentUnlike(commentId, getToken())
        setLiked(!status)
        likeCount = likeCount - 1
        return likeCount < 0 ? 0 : likeCount
    }

    const initLike = async (e) => {
        e.preventDefault()
        const comment = document.getElementById(`comment_like_${commentId}`)
        if(comment) {
            let likeCount = comment.getAttribute('data-count') ?? 0
            likeCount = Number(likeCount) ?? 0
            likeCount = await liked ? await unlike(likeCount) : await like(likeCount)
            comment.setAttribute('data-count', likeCount.toString())
            comment.innerText = `${likeCount} Likes`
        }
    }

    return (
        <React.Fragment>
            <li><a href="" onClick={initLike}>{ liked ? 'Unlike' : 'Like' }</a></li>
        </React.Fragment>
    );
}

export default Like