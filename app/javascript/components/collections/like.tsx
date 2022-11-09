import React, { useState, useEffect } from "react";
import { userLike, userUnlike } from "../../api/user"

const Like = (props) => {
  const likes = props.likes
  const address = props.address
  const collectionId = props.collectionId
  const likes_count = props.likes_count
  const isCollectionPage = props.isCollectionPage ? props.isCollectionPage : props.isCollectionPage
  const [liked, setLiked] = useState(props.isLiked);
  const [likesCount, setLikesCount] = useState(props.likes_count);
  const isFeedPage = props.isFeedPage ? true: false
  useEffect(() => {
  }, [])

  const like = async () => {
    const token = document.querySelector('[name=csrf-token]').content
    await userLike(address, collectionId, token)
    setAll(true, likesCount+1)
  }

  const unlike = async () => {
    const token = document.querySelector('[name=csrf-token]').content
    await userUnlike(address, collectionId, token)
    setAll(false, likesCount-1)
  }

  const setAll = (likeStatus, likesCount, userLike) => {
    setLiked(likeStatus)
    setLikesCount(likesCount);
  }

  const initLike = async (e) => {
    e.preventDefault();
    if (liked) {
      await unlike()
    } else {
      await like()
    }
    // e.preventDefault()
  }

  const abbreviateNumber = (value) => {
    var newValue = value;
    if (value >= 1000) {
      var suffixes = ["", "k", "m", "b","t"];
      var suffixNum = Math.floor( (""+value).length/3 );
      var shortValue = '';
      for (var precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
        var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
        if (dotLessShortValue.length <= 2) { break; }
      }
      if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
      newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
  }

  if(isFeedPage) {
    return (
        <React.Fragment>
          <a href="" onClick={initLike} className={`like-pro default-share heart ${liked ? 'is-active' : ''}`}>
            <i className="far fa-heart"/>
            <i className="fas fa-heart"/>
            <span>{abbreviateNumber(likesCount)} Like</span>
          </a>
        </React.Fragment>
    );
  }


  return (
    <React.Fragment>
      {!isCollectionPage &&
          <button  onClick={initLike} className={`card__likes heart ${liked ? 'is-active' : ''}`}>
                       <i className="far fa-heart"></i>
                       <i className="fas fa-heart"></i>
                             {/* <span>{likesCount}</span> */}
              </button>
      }

      {isCollectionPage &&
        <button  onClick={initLike} className={`card__likes heart ${liked ? 'is-active' : ''}`}>
                              <i className="far fa-heart"></i>
                              <i className="fas fa-heart"></i>
                                    {/* <span>{likesCount}</span> */}
                     </button>
      }
    </React.Fragment>
  );
}


export default Like