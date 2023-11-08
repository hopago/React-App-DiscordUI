import './postCards.scss';
import PostCard from '../postCard/PostCard';
import { useSelector } from 'react-redux';
import Spinner from '../../../../../../../lib/react-loader-spinner/Spinner';
import {
  useGetPostsBySortOptionsQuery,
} from "../../../../../../../features/post/slice/postsApiSlice";
import { selectCurrentUser } from '../../../../../../../features/users/slice/userSlice';
import { useEffect } from 'react';
import { selectCurrentToken } from '../../../../../../../features/authentication/slice/authSlice';

const PostCards = ({ type }) => {
  const currentUser = useSelector(selectCurrentUser);
  {/* if category ?? const category = ... */}
  const params = {
    fetchType: type,
    category: undefined,
    language: currentUser?.language
  };

  const {
    data: posts,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsBySortOptionsQuery(params, { refetchOnMountOrArgChange: true });

  let content;
  if (isLoading) {
    content = <Spinner message="컨텐츠를 기다리는 중 이에요..." />;
  } else if (isSuccess && (Array.isArray(posts) && !posts.length)) {
    content = <Spinner message="컨텐츠가 아직 준비되지 않았어요." />;
  } else if (isSuccess) {
    content = posts.map((post) => <PostCard key={post._id} post={post} />);
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return (
    <div className="forum-postCard-container">
        {content}
    </div>
  )
}

export default PostCards
